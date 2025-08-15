#!/bin/bash

# Production deployment script for webchessclock
# Supports both Docker and Fly.io deployment

set -e

echo "🚀 webchessclock Production Deployment Script"
echo "============================================="

# Function to display usage
usage() {
    echo "Usage: $0 [docker|fly|test]"
    echo ""
    echo "Commands:"
    echo "  docker  - Build and test Docker image locally"
    echo "  fly     - Deploy to Fly.io"
    echo "  test    - Run local tests and build checks"
    echo ""
    exit 1
}

# Function to test Docker build
test_docker() {
    echo "🔧 Testing Docker build..."
    
    # Build the image
    docker build -t webchessclock:test .
    
    # Test the image size
    IMAGE_SIZE=$(docker images webchessclock:test --format "table {{.Size}}" | tail -n 1)
    echo "📦 Final image size: $IMAGE_SIZE"
    
    # Test container startup
    echo "🧪 Testing container startup..."
    CONTAINER_ID=$(docker run -d -p 3000:3000 \
        -e NODE_ENV=production \
        -e REDIS_URL=redis://host.docker.internal:6379 \
        webchessclock:test)
    
    # Wait for startup
    sleep 10
    
    # Test health check
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Container health check passed"
    else
        echo "❌ Container health check failed"
        docker logs $CONTAINER_ID
    fi
    
    # Cleanup
    docker stop $CONTAINER_ID
    docker rm $CONTAINER_ID
    
    echo "🎉 Docker test completed successfully!"
}

# Function to deploy to Fly.io
deploy_fly() {
    echo "🚁 Deploying to Fly.io..."
    
    # Check if fly CLI is installed
    if ! command -v fly &> /dev/null; then
        echo "❌ Fly CLI not found. Please install it first:"
        echo "curl -L https://fly.io/install.sh | sh"
        exit 1
    fi
    
    # Check if logged in
    if ! fly auth whoami &> /dev/null; then
        echo "❌ Not logged in to Fly.io. Please run: fly auth login"
        exit 1
    fi
    
    # Deploy
    echo "🚀 Deploying application..."
    fly deploy
    
    # Show status
    fly status
    
    echo "🎉 Deployment completed!"
    echo "📱 Your app is available at: https://$(fly info --json | jq -r '.Name').fly.dev"
}

# Function to run tests
run_tests() {
    echo "🧪 Running build tests..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo "❌ package.json not found"
        exit 1
    fi
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm ci
    
    # Run build
    echo "🔨 Building application..."
    npm run build
    
    # Check Redis connection (if REDIS_URL is set)
    if [ ! -z "$REDIS_URL" ]; then
        echo "🔗 Testing Redis connection..."
        npm run test:redis
    fi
    
    echo "✅ All tests passed!"
}

# Main script logic
case "${1:-}" in
    "docker")
        test_docker
        ;;
    "fly")
        deploy_fly
        ;;
    "test")
        run_tests
        ;;
    *)
        usage
        ;;
esac