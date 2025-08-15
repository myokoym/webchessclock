# Docker-First Development Philosophy

## Why Docker is the Default

This project uses Docker as the default development environment for several important reasons:

### 1. Node.js Version Compatibility
- **Issue**: Nuxt.js 2.x requires Node.js 14-18
- **Reality**: Many developers have Node.js 20+ installed
- **Solution**: Docker ensures everyone uses Node.js 18 automatically

### 2. Consistent Environment
- **Issue**: "Works on my machine" problems
- **Reality**: Different OS, different Redis versions, different configurations
- **Solution**: Docker provides identical environment for all developers

### 3. Zero Redis Setup
- **Issue**: Installing and configuring Redis locally
- **Reality**: Redis installation varies by OS and can be complex
- **Solution**: Docker Compose includes Redis automatically

### 4. Production Parity
- **Issue**: Development environment differs from production
- **Reality**: Production uses Docker containers
- **Solution**: Develop in the same containerized environment

## Quick Start

```bash
# Just run this - no Node.js or Redis installation needed!
npm run dev
```

## When to Use Native Development

Use native development (`npm run dev:native`) only when:
- You have Node.js 14-18 specifically installed
- You need maximum hot-reload performance
- You're debugging Node.js internals
- Docker is not available on your system

## Docker Performance Tips

### Hot Reload
Docker development includes hot reload:
- Frontend changes: Instant reload
- Server changes: Automatic restart via nodemon
- No need to rebuild containers for code changes

### File Sync
- Source code is mounted as volume
- Changes are reflected immediately
- node_modules are in separate volume for performance

### Resource Usage
- Containers use ~500MB RAM total
- Minimal CPU usage when idle
- Automatically stops when you stop the dev server

## Troubleshooting

### Docker Not Installed?
```bash
# Use Node.js 18 via Docker without Docker Desktop
npm run dev:node18

# Or use nvm to switch Node.js versions
nvm use 18
npm run dev:native
```

### Slow File Sync on Windows?
- Use WSL2 for best performance
- Clone repository inside WSL2 filesystem
- Run Docker commands from WSL2 terminal

### Port Already in Use?
```bash
# Stop all containers
npm run docker:down

# Or change port in docker-compose.yml
```

## Architecture Decision Record (ADR)

**Date**: 2024-12-15
**Status**: Accepted
**Context**: Development environment standardization
**Decision**: Use Docker as default development environment
**Consequences**: 
- ✅ Eliminates Node.js version conflicts
- ✅ Includes all dependencies automatically
- ✅ Matches production environment
- ⚠️ Requires Docker installation
- ⚠️ Slightly slower hot reload than native

## Migration Guide

### For Existing Contributors

If you were using the old `npm run dev` (native):

```bash
# Old way (now renamed)
npm run dev:native

# New way (Docker)
npm run dev
```

Your existing local development still works with `npm run dev:native`!