---
title: "Deploying Web Apps to Fly.io with Docker: A Complete Guide"
date: 2025-08-15
author: myokoym
tags: [docker, fly.io, deployment, devops, redis]
category: infrastructure
description: "Learn how to containerize and deploy a Nuxt.js application to Fly.io with cost optimization strategies for $0-10/month operation"
---

# Deploying Web Apps to Fly.io with Docker: A Complete Guide

[English](docker-deployment-fly.md) | [日本語](docker-deployment-fly.ja.md)

## TL;DR

Successfully deployed a Nuxt.js + Socket.io application to Fly.io with Docker containerization, achieving $0/month operation cost for low-traffic scenarios using Upstash Redis and resolving Node.js 18 compatibility issues.

## Introduction

In this guide, I'll share my experience deploying the webchessclock application to Fly.io, including solutions to common challenges like Node.js compatibility issues, Docker permission problems, and cost optimization strategies.

## Main Content

### The Challenge: Node.js 18 Compatibility

Our Nuxt.js 2.x application faced compatibility issues with Node.js 18 due to OpenSSL 3.0 changes affecting Webpack 4. Initial error:

```bash
Error: error:0308010C:digital envelope routines::unsupported
```

**Solution**: Updated Nuxt to 2.18.1 and added OpenSSL legacy provider:

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS=--openssl-legacy-provider nuxt"
  }
}
```

### Docker Multi-Stage Build

Created an optimized Dockerfile with Alpine Linux for minimal size (91MB):

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --production

# Stage 2: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_OPTIONS="--openssl-legacy-provider"
RUN npm run build

# Stage 3: Runtime
FROM node:18-alpine AS runtime
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nuxtjs -u 1001
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.nuxt ./.nuxt
COPY --from=builder /app/static ./static
COPY --from=builder /app/server ./server
USER nuxtjs
EXPOSE 3000
CMD ["npm", "start"]
```

### Fly.io Deployment Configuration

```toml
app = "webchessclock"
primary_region = "nrt"

[env]
  NODE_ENV = "production"
  NUXT_HOST = "0.0.0.0"
  NUXT_PORT = "3000"
  NODE_OPTIONS = "--openssl-legacy-provider"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

### Cost Optimization with Upstash Redis

Implemented a Redis wrapper supporting multiple backends:

```javascript
class RedisClient {
  constructor() {
    if (process.env.REDIS_URL?.includes('upstash')) {
      this.isUpstash = true;
      this.client = new Redis(process.env.REDIS_URL);
    } else if (process.env.REDIS_URL) {
      this.client = new Redis(process.env.REDIS_URL);
    } else {
      this.useMemoryFallback();
    }
  }

  useMemoryFallback() {
    console.warn('Using in-memory storage fallback');
    this.memoryStore = new Map();
    this.usingMemory = true;
  }
}
```

## Results/Findings

- **Deployment Success**: Application running at https://webchessclock.fly.dev/
- **Performance**: ~100ms response time, 200MB memory usage under load
- **Cost**: $0/month for low traffic (< 10,000 Redis commands/day)
- **Docker Image**: 91MB final size
- **Cold Start**: < 3 seconds

## Conclusion

Key takeaways:
1. **Node.js 18 compatibility**: Use OpenSSL legacy provider for Webpack 4
2. **Docker optimization**: Multi-stage builds with Alpine Linux
3. **Cost efficiency**: Fly.io free tier + Upstash Redis serverless
4. **Permission issues**: Properly handle user permissions in Docker

## References

- [Fly.io Documentation](https://fly.io/docs/)
- [Upstash Redis](https://upstash.com/)
- [Node.js OpenSSL 3.0 Compatibility](https://nodejs.org/en/blog/release/v17.0.0#openssl-3-0)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)