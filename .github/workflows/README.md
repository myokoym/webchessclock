# CI/CD Pipeline Documentation

## Overview

This repository uses GitHub Actions for a complete CI/CD pipeline that includes testing, building, security scanning, and automated deployment to Fly.io.

## Pipeline Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Test     │────│    Build    │────│  Security   │────│   Deploy    │
│             │    │             │    │    Scan     │    │             │
│ - Lint      │    │ - Docker    │    │ - Trivy     │    │ - Fly.io    │
│ - Test      │    │ - Multi-    │    │ - SARIF     │    │ - Health    │
│ - Validate  │    │   stage     │    │   Upload    │    │   Check     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Workflow Features

### 1. Multi-Node Testing
- **Matrix Strategy**: Tests on Node.js 18 and 20
- **Caching**: NPM dependencies cached for faster builds
- **Validation**: Runs available lint and test scripts
- **Redis Testing**: Validates Redis connectivity

### 2. Optimized Docker Build
- **Multi-stage Build**: Uses existing optimized Dockerfile
- **Layer Caching**: GitHub Actions cache for faster builds
- **Security**: Builds with non-root user
- **Registry**: Pushes to GitHub Container Registry

### 3. Security Integration
- **Vulnerability Scanning**: Trivy scanner for container security
- **SARIF Upload**: Results uploaded to GitHub Security tab
- **Automated Alerts**: Security issues flagged automatically

### 4. Smart Deployment
- **Environment Gates**: Production deployment requires approval
- **Health Checks**: Validates deployment success
- **Rollback**: Automatic rollback on failure
- **Manual Triggers**: Supports manual deployment with environment selection

## Triggers

### Automatic Triggers
- **Push to master**: Full pipeline with deployment
- **Pull Requests**: Test and build only (no deployment)

### Manual Triggers
- **Workflow Dispatch**: Manual deployment with environment selection
  - Production deployment
  - Staging deployment

## Environments

### Production
- **URL**: https://webchessclock.fly.dev
- **Trigger**: Push to master branch
- **Protection**: Requires manual approval
- **Monitoring**: Health checks and notifications

### Staging
- **URL**: https://webchessclock-staging.fly.dev
- **Trigger**: Manual workflow dispatch
- **Purpose**: Testing before production

## Required Secrets

Configure these secrets in GitHub repository settings (`Settings > Secrets and variables > Actions`):

| Secret | Description | How to Get |
|--------|-------------|------------|
| `FLY_API_TOKEN` | Fly.io API token for deployment | `flyctl auth token` |

## Optimization Features

### Performance Optimizations
- **Shallow Clone**: `fetch-depth: 1` for faster checkout
- **NPM Cache**: Caches dependencies between runs
- **Docker Layer Cache**: Reuses Docker build layers
- **Parallel Jobs**: Test matrix runs in parallel

### Resource Efficiency
- **Minimal Base Images**: Alpine Linux for smaller containers
- **Multi-stage Builds**: Separates build and runtime dependencies
- **Cache Strategy**: Aggressive caching for dependencies and layers

### Build Speed Optimizations
- **Target Build Time**: < 10 minutes total pipeline
- **Cache Hit Ratio**: 80%+ for unchanged dependencies
- **Parallel Execution**: Test matrix and builds run concurrently

## Monitoring and Alerts

### Health Checks
- **Container Health**: Built-in Docker health checks
- **Application Health**: HTTP endpoint validation
- **Deployment Verification**: Post-deployment smoke tests

### Notifications
- **Success**: Deployment URL and commit information
- **Failure**: Error details and rollback instructions
- **Security**: SARIF upload to GitHub Security tab

## Error Handling

### Automatic Recovery
- **Rollback**: Automatic rollback on deployment failure
- **Retry Logic**: Built-in retry for transient failures
- **Graceful Degradation**: Continues pipeline on non-critical failures

### Manual Intervention
- **Approval Gates**: Production deployments require manual approval
- **Manual Rollback**: Can be triggered via Fly.io CLI
- **Debug Access**: Workflow logs available for troubleshooting

## Usage Examples

### Standard Development Flow
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and push
git push origin feature/new-feature

# 3. Create pull request (triggers test/build)
# 4. Merge to master (triggers full deployment)
```

### Manual Production Deployment
1. Go to **Actions** tab in GitHub
2. Select **CI/CD Pipeline** workflow
3. Click **Run workflow**
4. Select `production` environment
5. Click **Run workflow**

### Emergency Rollback
```bash
# Via GitHub Actions (recommended)
# Use the rollback job or manual workflow

# Via Fly.io CLI (direct)
flyctl releases list
flyctl releases rollback <version>
```

## Performance Metrics

### Target Metrics
- **Build Time**: < 5 minutes
- **Test Time**: < 3 minutes
- **Deploy Time**: < 2 minutes
- **Total Pipeline**: < 10 minutes

### Cache Performance
- **NPM Cache Hit**: 80%+ on unchanged package.json
- **Docker Layer Cache**: 70%+ on unchanged Dockerfile
- **Build Speedup**: 50% faster with warm cache

## Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version compatibility
- Verify dependencies in package.json
- Review Docker build logs

#### Deployment Failures
- Verify FLY_API_TOKEN secret
- Check Fly.io service status
- Review fly.toml configuration

#### Test Failures
- Check test script availability
- Verify Redis connection (if applicable)
- Review Node.js matrix compatibility

### Debug Commands
```bash
# Local testing
npm ci
npm run build
npm run test

# Docker testing
docker build -t webchessclock .
docker run -p 3000:3000 webchessclock

# Fly.io testing
flyctl config validate
flyctl deploy --dry-run
```

## Best Practices

### Development
- **Atomic Commits**: Each commit should be deployable
- **Feature Flags**: Use for risky changes
- **Testing**: Maintain good test coverage

### Security
- **Secrets Management**: Never commit secrets
- **Dependency Updates**: Regular security updates
- **Vulnerability Scanning**: Review security tab regularly

### Performance
- **Cache Dependencies**: Keep package.json stable
- **Optimize Dockerfile**: Minimize layers and size
- **Monitor Metrics**: Track build and deploy times

## Future Enhancements

### Planned Features
- **Preview Deployments**: PR-based preview environments
- **Performance Testing**: Automated load testing
- **Multi-region Deployment**: Deploy to multiple Fly.io regions
- **Database Migrations**: Automated schema updates
- **A/B Testing**: Gradual feature rollouts

### Monitoring Improvements
- **Application Metrics**: Performance monitoring integration
- **Error Tracking**: Sentry or similar error tracking
- **Uptime Monitoring**: External uptime monitoring
- **Cost Tracking**: Cloud cost monitoring and alerts