# WebChessClock Docker Development Setup

This directory contains Docker configuration and helper scripts for local development of the WebChessClock application.

## Quick Start

1. **Prerequisites**
   ```bash
   # Ensure Docker and Docker Compose are installed
   docker --version
   docker-compose --version
   ```

2. **Environment Setup**
   ```bash
   # Copy environment file (if not already done)
   cp .env.example .env
   
   # Edit .env file with your configuration
   vim .env
   ```

3. **Start Development Environment**
   ```bash
   # Using npm scripts
   npm run dev:docker
   
   # Or using Docker Compose directly
   docker-compose up --build
   
   # Or using the helper script
   ./docker/dev-helper.sh start
   ```

4. **Access the Application**
   - Web Application: http://localhost:3000
   - Redis: localhost:6379
   - Node.js Debugger: localhost:9229 (when debugging enabled)

## File Structure

```
docker/
├── README.md              # This file
├── dev-helper.sh          # Development helper script
├── redis/
│   └── redis.conf        # Redis configuration for development
└── data/
    └── redis/            # Redis data persistence directory
```

## Development Commands

### Using npm Scripts

```bash
# Start development environment
npm run dev:docker

# Start in detached mode (background)
npm run dev:docker:detached

# Rebuild and restart
npm run dev:docker:rebuild

# View logs
npm run docker:logs
npm run docker:logs:web
npm run docker:logs:redis

# Stop services
npm run docker:down

# Check status
npm run docker:status

# Clean up everything
npm run docker:clean

# Use helper script
npm run docker:helper start
```

### Using Docker Compose Directly

```bash
# Start services
docker-compose up --build

# Start in background
docker-compose up --build -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
docker-compose logs -f web
docker-compose logs -f redis

# Restart services
docker-compose restart

# Rebuild services
docker-compose up --build --force-recreate

# Execute commands in containers
docker-compose exec web npm install
docker-compose exec web npm audit fix
docker-compose exec redis redis-cli

# Scale services (multiple web instances)
docker-compose up --scale web=2
```

### Using the Helper Script

```bash
# Start development environment
./docker/dev-helper.sh start

# Stop services
./docker/dev-helper.sh stop

# Restart services
./docker/dev-helper.sh restart

# Rebuild and restart
./docker/dev-helper.sh rebuild

# View logs
./docker/dev-helper.sh logs
./docker/dev-helper.sh logs web

# Check service status and health
./docker/dev-helper.sh status

# Execute commands in containers
./docker/dev-helper.sh exec web npm install
./docker/dev-helper.sh exec redis redis-cli

# Clean up everything
./docker/dev-helper.sh clean

# Show help
./docker/dev-helper.sh help
```

## Services

### Web Service (Nuxt.js Application)

- **Container Name**: `webchessclock-web`
- **Port**: 3000
- **Health Check**: HTTP GET to /
- **Features**:
  - Hot reload for source code changes
  - Node.js debugging support (port 9229)
  - Environment variables from .env file
  - Volume mounting for fast development

### Redis Service

- **Container Name**: `webchessclock-redis`
- **Port**: 6379
- **Health Check**: Redis PING command
- **Features**:
  - Data persistence across restarts
  - Custom configuration for development
  - Memory optimization (256MB limit)
  - AOF and RDB persistence enabled

## Volume Management

### Named Volumes

- **redis_data**: Persists Redis data across container restarts
- **nuxt_build**: Caches Nuxt.js build artifacts for faster rebuilds

### Bind Mounts

- **Source Code**: Real-time sync for hot reload
- **Node Modules**: Excluded from host to prevent conflicts
- **Configuration**: Redis config mounted read-only

## Development Features

### Hot Reload

Source code changes are automatically detected and trigger application restart:

```bash
# Any changes to these directories trigger reload:
# - components/
# - layouts/
# - middleware/
# - pages/
# - plugins/
# - server/
# - store/
```

### Debugging

Enable Node.js debugging by uncommenting the debug command in `docker-compose.override.yml`:

```yaml
# Uncomment this line in docker-compose.override.yml
command: ["node", "--inspect=0.0.0.0:9229", "node_modules/.bin/nuxt", "dev"]
```

Then connect your debugger to `localhost:9229`.

### Environment Configuration

The development environment loads configuration from:

1. `.env` file (primary configuration)
2. `docker-compose.yml` (service defaults)
3. `docker-compose.override.yml` (development overrides)

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Stop conflicting process or change port in .env
   PORT=3001
   ```

2. **Redis Connection Issues**
   ```bash
   # Check Redis health
   docker-compose exec redis redis-cli ping
   
   # View Redis logs
   docker-compose logs redis
   ```

3. **Node Modules Issues**
   ```bash
   # Rebuild node_modules volume
   docker-compose down -v
   docker-compose up --build
   ```

4. **Permission Issues**
   ```bash
   # Fix file permissions (Linux/macOS)
   sudo chown -R $USER:$USER .
   ```

### Health Checks

Monitor service health:

```bash
# Check all services
docker-compose ps

# Detailed health status
./docker/dev-helper.sh status

# Manual health checks
curl http://localhost:3000/
docker-compose exec redis redis-cli ping
```

### Performance Optimization

1. **Use Volume Caches**
   ```yaml
   # Already configured in docker-compose.yml
   volumes:
     - .:/app:cached  # Optimized for macOS
   ```

2. **Limit Resource Usage**
   ```yaml
   # Redis memory limit already set
   deploy:
     resources:
       limits:
         memory: 512M
   ```

3. **Prune Unused Resources**
   ```bash
   # Clean up regularly
   docker system prune -f
   ./docker/dev-helper.sh clean
   ```

## Security Notes

### Development vs Production

- Development Redis has no password (secure for local use)
- Debug ports are exposed (9229 for Node.js)
- Volume mounts include source code (never do this in production)
- Logging level is verbose for debugging

### Production Considerations

For production deployment:
- Use the main `Dockerfile` (not `Dockerfile.dev`)
- Set proper Redis authentication
- Remove debug ports and verbose logging
- Use secrets management for sensitive data
- Implement proper resource limits

## Contributing

When modifying Docker configuration:

1. Test changes locally with `./docker/dev-helper.sh start`
2. Verify health checks pass with `./docker/dev-helper.sh status`
3. Update this README if adding new features
4. Test on different platforms (Linux, macOS, Windows)

## Support

For Docker-related issues:

1. Check service logs: `./docker/dev-helper.sh logs`
2. Verify health status: `./docker/dev-helper.sh status`
3. Try clean rebuild: `./docker/dev-helper.sh clean && ./docker/dev-helper.sh start`
4. Check Docker daemon status: `docker info`