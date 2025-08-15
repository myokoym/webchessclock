# Scripts

This directory contains utility scripts for the WebChessClock project.

## test-redis.js

Comprehensive Redis connection testing script that validates the Redis client functionality.

### Features

- **Backend Detection**: Automatically detects and reports which Redis backend is being used:
  - Upstash Redis (REST API)
  - Standard Redis
  - Memory Fallback

- **Operation Testing**: Tests all supported Redis operations:
  - Basic string operations (GET, SET)
  - Hash operations (HGET, HSET, HMGET, HMSET)
  - Batch operations (hsetBatch)
  - Key management (DEL, EXPIRE)

- **Performance Metrics**: Measures operation execution times and tests concurrent operations

- **Error Handling**: Validates graceful error handling and fallback mechanisms

- **Chess Clock Specific**: Tests operations specifically used by the chess clock application

### Usage

```bash
# Test with current environment
npm run test:redis

# Test with specific Redis URL
REDIS_URL=redis://localhost:6379 npm run test:redis

# Test with Upstash Redis
REDIS_URL=https://your-upstash-url.io UPSTASH_REDIS_REST_TOKEN=your-token npm run test:redis

# Run script directly
node scripts/test-redis.js
```

### Environment Variables

- `REDIS_URL`: Redis connection URL (optional, uses memory fallback if not provided)
- `UPSTASH_REDIS_REST_TOKEN`: Required when using Upstash Redis

### Output

The script provides detailed output including:
- Connection status and backend type
- Individual operation results with timing
- Performance benchmarks
- Error handling validation
- Overall test summary

### Exit Codes

- `0`: All tests passed
- `1`: Tests failed or encountered errors