# Redis Client Wrapper

A versatile Redis connection wrapper that supports both Upstash Redis REST API and standard Redis with automatic fallback to in-memory storage.

## Features

- **Dual Support**: Works with both Upstash Redis (REST API) and standard Redis
- **Automatic Detection**: Detects Upstash URLs (https://) automatically
- **Memory Fallback**: Falls back to in-memory Map when Redis is unavailable
- **Connection Retry**: Built-in retry logic for robust connections
- **Auto-Expiration**: 24-hour TTL for all data by default
- **Low-Cost Optimization**: Minimizes Redis commands and connection overhead

## Environment Variables

### Standard Redis
```bash
REDIS_URL=redis://localhost:6379
# or
REDIS_URL=redis://username:password@host:port
```

### Upstash Redis
```bash
REDIS_URL=https://your-redis-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_rest_token_here
```

## Usage

```javascript
const RedisClient = require('./server/lib/redis-client');

// Initialize client
const redis = new RedisClient({
  retryAttempts: 3,      // Number of retry attempts
  retryDelay: 1000,      // Delay between retries (ms)
  defaultTTL: 86400,     // Default TTL in seconds (24 hours)
  connectionTimeout: 5000, // Connection timeout (ms)
  operationTimeout: 3000   // Operation timeout (ms)
});

// Basic operations
await redis.set('key', 'value');
const value = await redis.get('key');

// Hash operations
await redis.hset('hash-key', 'field', 'value');
const fieldValue = await redis.hget('hash-key', 'field');

// Multiple hash fields
const values = await redis.hmget('hash-key', ['field1', 'field2']);

// Set with custom TTL
await redis.set('temp-key', 'temp-value', 300); // 5 minutes

// Check connection status
const status = redis.getStatus();
console.log('Connected:', status.connected);
console.log('Using Upstash:', status.isUpstash);
console.log('Memory Fallback:', status.usingMemoryFallback);
```

## Supported Methods

- `get(key)` - Get value by key
- `set(key, value, ttl?)` - Set value with optional TTL
- `hget(key, field)` - Get hash field value
- `hset(key, field, value)` - Set hash field value
- `hmget(key, fields)` - Get multiple hash fields
- `hmset(key, ...fieldValues)` - Set multiple hash fields
- `del(key)` - Delete key
- `expire(key, seconds)` - Set key expiration
- `ping()` - Test connection

## Fallback Behavior

When Redis is unavailable, the client automatically falls back to an in-memory Map:

1. **Memory Storage**: Uses JavaScript Map for temporary storage
2. **Auto-Expiration**: Implements TTL using setTimeout
3. **Compatible API**: Same methods work with memory fallback
4. **No Data Loss**: Operations continue seamlessly

## Error Handling

The client handles errors gracefully:

- Connection failures automatically trigger memory fallback
- Failed operations retry with exponential backoff
- Timeout protection prevents hanging operations
- Detailed error logging for debugging

## Performance Optimizations

### Batch Operations
```javascript
// Instead of individual operations
await redis.hset('room1', 'turn', '1');
await redis.hset('room1', 'pause', 'false');

// Use Promise.all for better performance
await Promise.all([
  redis.hset('room1', 'turn', '1'),
  redis.hset('room1', 'pause', 'false')
]);
```

### Connection Pooling
The client automatically manages connections and implements pooling for standard Redis.

### Minimal Commands
Operations are optimized to minimize the number of Redis commands sent.

## Integration Example

```javascript
// In your Express app
const RedisClient = require('./lib/redis-client');
const redis = new RedisClient();

app.locals.redis = redis;

// In Socket.IO handlers
socket.on('enterRoom', async (roomId) => {
  const keys = ['turn', 'pause', 'nPlayers'];
  const values = await redis.hmget(roomId, keys);
  // Handle values...
});

socket.on('send', async (params) => {
  const operations = [];
  if ('turn' in params) {
    operations.push(redis.hset(roomId, 'turn', params.turn));
  }
  // Execute all operations
  await Promise.all(operations);
});
```

## Health Checks

The client provides status information for health checks:

```javascript
const status = redis.getStatus();
// Returns:
// {
//   connected: boolean,
//   isUpstash: boolean,
//   usingMemoryFallback: boolean,
//   memoryKeys: number
// }
```

## Deployment Notes

### Upstash Redis
- Perfect for serverless deployments
- REST API works with any platform
- Built-in connection pooling
- Pay-per-request pricing

### Standard Redis
- Traditional Redis servers
- Better for high-throughput applications
- Requires persistent connections
- Full Redis feature set

### Memory Fallback
- Development environments
- Temporary service interruptions
- Low-cost operation modes
- No external dependencies