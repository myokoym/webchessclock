# webchessclock

[![CI/CD Pipeline](https://github.com/myokoym/webchessclock/actions/workflows/deploy.yml/badge.svg)](https://github.com/myokoym/webchessclock/actions/workflows/deploy.yml)

A synchronized chess clock on Web.

リアルタイムで同期する対局時計（チェスクロック）を複数人がインターネット経由で操作できるWebアプリです。スマートフォン、タブレット対応（レスポンシブ）。

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (version 12 or higher)
- **npm** (comes with Node.js)
- **Redis** (for real-time synchronization)
  - Local installation: [Redis Download](https://redis.io/download)
  - Docker: `docker run -d -p 6379:6379 redis:alpine`
  - Cloud options: [Upstash](https://upstash.com/), Redis Cloud, AWS ElastiCache

## Development Setup

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd webchessclock

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env
```

### Local Development

```bash
# Option 1: Use local Redis (requires Redis running on localhost:6379)
npm run dev:local

# Option 2: Use custom Redis URL (configure REDIS_URL in .env)
npm run dev
```

The application will be available at `http://localhost:3000`

### Docker Development

If you prefer using Docker for development:

```bash
# Start development environment with Docker
npm run dev:docker
```

This will start both the application and Redis using Docker Compose.

## Environment Variables

The application uses environment variables for configuration. Copy `.env.example` to `.env` and update the values:

### Required Variables

- `NODE_ENV`: Environment mode (`development`, `production`, `test`)
- `REDIS_URL`: Redis connection URL for real-time synchronization

### Optional Variables

- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: localhost for development, 0.0.0.0 for production)
- `MAX_PLAYERS_PER_ROOM`: Maximum players per room
- `SESSION_TIMEOUT`: Redis key expiration time in seconds
- `DEBUG`: Enable debug logging (true/false)
- `CORS_ORIGINS`: Comma-separated list of allowed origins for production

See `.env.example` for detailed configuration options and examples.

## Available Commands

### Development Commands

```bash
# Start development server with Docker (RECOMMENDED)
npm run dev

# Start Docker development in background
npm run dev:detached

# Start native development (requires Node.js 14-18)
npm run dev:native

# Start native with local Redis (requires Node.js 14-18)
npm run dev:native:redis
```

### Build Commands

```bash
# Build for production
npm run build

# Start production server (requires build first)
npm run start

# Generate static files
npm run generate
```

### Docker Commands

```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run

# Start services (detached)
npm run docker:up

# Stop services
npm run docker:down

# Rebuild development environment
npm run dev:docker:rebuild
```

### Deployment Commands

```bash
# Deploy to Fly.io
npm run deploy:fly

# Setup Fly.io deployment
npm run deploy:setup
```

### Utility Commands

```bash
# Test Redis connection
npm run test:redis

# Clean build artifacts and cache
npm run clean
```

## CI/CD Pipeline

This project uses GitHub Actions for automated testing, building, and deployment:

- **Automated Testing**: Runs tests on Node.js 18 and 20
- **Docker Build**: Builds and pushes to GitHub Container Registry
- **Security Scanning**: Vulnerability scanning with Trivy
- **Automated Deployment**: Deploys to Fly.io on master branch
- **Rollback Support**: Automatic rollback on deployment failure

### Required GitHub Secrets

For CI/CD to work, configure these secrets in your GitHub repository:

```
FLY_API_TOKEN=your_fly_api_token
```

Get your Fly.io API token with: `flyctl auth token`

## Deployment

### Automatic Deployment (Recommended)

Push to master branch triggers automatic deployment:

```bash
git push origin master
```

### Manual Deployment

Trigger deployment manually via GitHub Actions or:

### Fly.io Deployment

This application is configured for easy deployment to Fly.io:

1. **Install Fly CLI**: Follow [Fly.io installation guide](https://fly.io/docs/getting-started/installing-flyctl/)

2. **Setup deployment**:
   ```bash
   npm run deploy:setup
   ```

3. **Configure environment variables**:
   ```bash
   fly secrets set REDIS_URL=rediss://your-redis-url
   fly secrets set NODE_ENV=production
   ```

4. **Deploy**:
   ```bash
   npm run deploy:fly
   ```

### Docker Deployment

For Docker-based deployments:

1. **Build the image**:
   ```bash
   npm run docker:build
   ```

2. **Run with environment file**:
   ```bash
   npm run docker:run
   ```

3. **Or use Docker Compose**:
   ```bash
   npm run docker:up
   ```

### Production Considerations

- Ensure Redis instance has persistence enabled
- Configure CORS origins for your domain
- Set appropriate session timeouts
- Use HTTPS in production
- Monitor Redis memory usage

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## License

MIT License. See [LICENSE](LICENSE) for details.
