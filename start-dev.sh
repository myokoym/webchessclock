#!/bin/bash
# Development server starter script for Node.js compatibility issues

echo "🚀 WebChessClock Development Server Starter"
echo "==========================================="

# Check Node.js version
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)

if [ "$NODE_VERSION" -ge 20 ]; then
    echo "⚠️  Warning: Node.js v$NODE_VERSION detected"
    echo "   Nuxt.js 2.x requires Node.js 14-18"
    echo ""
    echo "Options to run the development server:"
    echo ""
    echo "1. Use nvm to switch Node.js version:"
    echo "   nvm install 18.19.0 && nvm use 18.19.0"
    echo "   npm run dev:local"
    echo ""
    echo "2. Use Docker (recommended):"
    echo "   docker run -it --rm \\"
    echo "     -v \$(pwd):/app \\"
    echo "     -w /app \\"
    echo "     -p 3000:3000 \\"
    echo "     -e REDIS_URL=host.docker.internal:6379 \\"
    echo "     node:18-alpine \\"
    echo "     sh -c 'npm install && npm run dev'"
    echo ""
    echo "3. Use Docker Compose (if Docker Desktop is installed):"
    echo "   npm run dev:docker"
    echo ""
    exit 1
fi

echo "✅ Node.js version is compatible (v$(node -v))"
echo "Starting development server..."
npm run dev:local