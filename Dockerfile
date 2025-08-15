# Multi-stage Dockerfile for Nuxt.js webchessclock application
# Optimized for Fly.io deployment with minimal RAM usage (256MB target)

# Stage 1: Dependencies installation
FROM node:18-alpine AS deps
WORKDIR /app

# Install system dependencies for node-gyp (required for some npm packages)
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies with optimizations for production
RUN npm ci --production --ignore-scripts && \
    npm cache clean --force

# Stage 2: Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files and install all dependencies (including devDependencies)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Set OpenSSL legacy provider for Node.js 18+ compatibility with Webpack 4
ENV NODE_OPTIONS="--openssl-legacy-provider"

# Build the application
RUN npm run build && \
    # Clean up unnecessary files to reduce image size
    rm -rf node_modules/.cache && \
    rm -rf .nuxt/dist/client/*.map

# Stage 3: Production runtime
FROM node:18-alpine AS runtime

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy production dependencies from deps stage
COPY --from=deps --chown=nuxtjs:nodejs /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=nuxtjs:nodejs /app/.nuxt ./.nuxt
COPY --from=builder --chown=nuxtjs:nodejs /app/static ./static
COPY --from=builder --chown=nuxtjs:nodejs /app/nuxt.config.js ./
COPY --from=builder --chown=nuxtjs:nodejs /app/package.json ./
COPY --from=builder --chown=nuxtjs:nodejs /app/server ./server

# Set environment variables for production
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NODE_OPTIONS="--openssl-legacy-provider"

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nuxtjs

# Add health check for container health monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
                 const options = { host: 'localhost', port: 3000, timeout: 2000 }; \
                 const request = http.request(options, (res) => { \
                   console.log('Health check status:', res.statusCode); \
                   process.exit(res.statusCode === 200 ? 0 : 1); \
                 }); \
                 request.on('error', () => process.exit(1)); \
                 request.end();"

# Use dumb-init to handle signals properly and start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]