#!/usr/bin/env node

/**
 * Redis Connection Test Script
 * Tests the Redis connection using the new redis-client.js
 * Shows which backend is being used (Upstash/Redis/Memory)
 * Performs basic operations and measures operation times
 */

const RedisClient = require('../server/lib/redis-client');
const { performance } = require('perf_hooks');

class RedisTestSuite {
  constructor() {
    this.client = null;
    this.testResults = {
      connectionTest: null,
      backendType: null,
      basicOperations: [],
      errorHandling: [],
      performanceMetrics: {}
    };
  }

  /**
   * Measure execution time of an operation
   */
  async measureTime(operation, name) {
    const start = performance.now();
    try {
      const result = await operation();
      const end = performance.now();
      const duration = end - start;
      return { success: true, result, duration, name };
    } catch (error) {
      const end = performance.now();
      const duration = end - start;
      return { success: false, error: error.message, duration, name };
    }
  }

  /**
   * Test Redis connection and identify backend type
   */
  async testConnection() {
    console.log('🔧 Initializing Redis client...');
    
    this.client = new RedisClient({
      retryAttempts: 2,
      retryDelay: 500,
      connectionTimeout: 3000,
      operationTimeout: 2000
    });

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 100));

    const status = this.client.getStatus();
    this.testResults.connectionTest = status;

    console.log('\n📊 Connection Status:');
    console.log(`  Connected: ${status.connected ? '✅' : '❌'}`);
    console.log(`  Backend: ${this.getBackendName(status)}`);
    console.log(`  Memory fallback: ${status.usingMemoryFallback ? '🧠' : '❌'}`);
    console.log(`  Memory keys: ${status.memoryKeys}`);

    this.testResults.backendType = this.getBackendName(status);

    return status;
  }

  /**
   * Get human-readable backend name
   */
  getBackendName(status) {
    if (status.usingMemoryFallback) {
      return 'Memory Fallback';
    } else if (status.isUpstash) {
      return 'Upstash Redis (REST API)';
    } else {
      return 'Standard Redis';
    }
  }

  /**
   * Test basic Redis operations
   */
  async testBasicOperations() {
    console.log('\n🧪 Testing basic operations...');

    const operations = [
      {
        name: 'PING',
        operation: () => this.client.ping()
      },
      {
        name: 'SET string',
        operation: () => this.client.set('test:string', 'hello world', 60)
      },
      {
        name: 'GET string',
        operation: () => this.client.get('test:string')
      },
      {
        name: 'HSET hash field',
        operation: () => this.client.hset('test:hash', 'field1', 'value1')
      },
      {
        name: 'HGET hash field',
        operation: () => this.client.hget('test:hash', 'field1')
      },
      {
        name: 'HMSET multiple fields',
        operation: () => this.client.hmset('test:multihash', 'name', 'test', 'type', 'demo', 'active', 'true')
      },
      {
        name: 'HMGET multiple fields',
        operation: () => this.client.hmget('test:multihash', ['name', 'type', 'active'])
      },
      {
        name: 'HSET batch operation',
        operation: () => this.client.hsetBatch('test:batch', {
          player1: 'Alice',
          player2: 'Bob',
          status: 'active',
          timeRemaining1: '300',
          timeRemaining2: '300'
        })
      },
      {
        name: 'EXPIRE key',
        operation: () => this.client.expire('test:batch', 120)
      },
      {
        name: 'DEL key',
        operation: () => this.client.del('test:string')
      }
    ];

    for (const { name, operation } of operations) {
      const result = await this.measureTime(operation, name);
      this.testResults.basicOperations.push(result);

      const status = result.success ? '✅' : '❌';
      const time = `${result.duration.toFixed(2)}ms`;
      const value = result.success ? 
        (result.result !== null ? `→ ${JSON.stringify(result.result)}` : '→ null') :
        `→ Error: ${result.error}`;

      console.log(`  ${status} ${name.padEnd(20)} (${time.padStart(8)}) ${value}`);
    }
  }

  /**
   * Test error handling scenarios
   */
  async testErrorHandling() {
    console.log('\n🚨 Testing error handling...');

    const errorTests = [
      {
        name: 'Invalid operation',
        operation: async () => {
          try {
            await this.client.executeCommand('INVALID_COMMAND');
            return 'Should have thrown error';
          } catch (error) {
            return `Correctly handled: ${error.message}`;
          }
        }
      },
      {
        name: 'Empty key operations',
        operation: async () => {
          const result1 = await this.client.get('');
          const result2 = await this.client.get('nonexistent:key');
          return `Empty key: ${result1}, Nonexistent: ${result2}`;
        }
      },
      {
        name: 'Large value handling',
        operation: async () => {
          const largeValue = 'x'.repeat(1000000); // 1MB string
          await this.client.set('test:large', largeValue, 30);
          const retrieved = await this.client.get('test:large');
          return `Large value length: ${retrieved ? retrieved.length : 'null'}`;
        }
      }
    ];

    for (const { name, operation } of errorTests) {
      const result = await this.measureTime(operation, name);
      this.testResults.errorHandling.push(result);

      const status = result.success ? '✅' : '❌';
      const time = `${result.duration.toFixed(2)}ms`;
      const value = result.success ? 
        `→ ${result.result}` :
        `→ Error: ${result.error}`;

      console.log(`  ${status} ${name.padEnd(20)} (${time.padStart(8)}) ${value}`);
    }
  }

  /**
   * Performance benchmark
   */
  async testPerformance() {
    console.log('\n⚡ Performance benchmark...');

    // Test concurrent operations
    const concurrentOps = Array.from({ length: 10 }, (_, i) => 
      this.measureTime(() => this.client.set(`perf:test:${i}`, `value${i}`, 60), `Concurrent SET ${i}`)
    );

    const concurrentResults = await Promise.all(concurrentOps);
    const avgTime = concurrentResults.reduce((sum, r) => sum + r.duration, 0) / concurrentResults.length;
    const successCount = concurrentResults.filter(r => r.success).length;

    console.log(`  📈 Concurrent operations: ${successCount}/10 successful`);
    console.log(`  📊 Average time: ${avgTime.toFixed(2)}ms`);

    // Test sequential operations
    const sequentialStart = performance.now();
    for (let i = 0; i < 5; i++) {
      await this.client.set(`seq:test:${i}`, `value${i}`, 60);
    }
    const sequentialEnd = performance.now();
    const sequentialTime = sequentialEnd - sequentialStart;

    console.log(`  📈 Sequential 5 operations: ${sequentialTime.toFixed(2)}ms`);

    this.testResults.performanceMetrics = {
      concurrentOps: {
        total: 10,
        successful: successCount,
        averageTime: avgTime
      },
      sequentialOps: {
        total: 5,
        totalTime: sequentialTime,
        averageTime: sequentialTime / 5
      }
    };
  }

  /**
   * Chess clock specific operations test
   */
  async testChessClockOperations() {
    console.log('\n♟️  Testing chess clock specific operations...');

    const roomId = 'test-room-123';
    const clockData = {
      player1Time: '300',
      player2Time: '300',
      currentPlayer: '1',
      isRunning: 'false',
      lastUpdate: Date.now().toString(),
      gameStatus: 'waiting'
    };

    const operations = [
      {
        name: 'Create room data',
        operation: () => this.client.hsetBatch(`room:${roomId}`, clockData)
      },
      {
        name: 'Get room status',
        operation: () => this.client.hmget(`room:${roomId}`, ['player1Time', 'player2Time', 'currentPlayer', 'isRunning'])
      },
      {
        name: 'Update player time',
        operation: () => this.client.hset(`room:${roomId}`, 'player1Time', '295')
      },
      {
        name: 'Switch active player',
        operation: () => this.client.hmset(`room:${roomId}`, 'currentPlayer', '2', 'lastUpdate', Date.now().toString())
      },
      {
        name: 'Get full room data',
        operation: () => this.client.hmget(`room:${roomId}`, Object.keys(clockData))
      }
    ];

    for (const { name, operation } of operations) {
      const result = await this.measureTime(operation, name);

      const status = result.success ? '✅' : '❌';
      const time = `${result.duration.toFixed(2)}ms`;
      const value = result.success ? 
        (Array.isArray(result.result) ? `→ [${result.result.length} items]` : `→ ${JSON.stringify(result.result)}`) :
        `→ Error: ${result.error}`;

      console.log(`  ${status} ${name.padEnd(20)} (${time.padStart(8)}) ${value}`);
    }

    // Clean up test data
    await this.client.del(`room:${roomId}`);
  }

  /**
   * Clean up test data
   */
  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');

    const testKeys = [
      'test:string',
      'test:hash',
      'test:multihash',
      'test:batch',
      'test:large'
    ];

    // Clean up performance test keys
    for (let i = 0; i < 10; i++) {
      testKeys.push(`perf:test:${i}`);
    }
    for (let i = 0; i < 5; i++) {
      testKeys.push(`seq:test:${i}`);
    }

    for (const key of testKeys) {
      try {
        await this.client.del(key);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    if (this.client) {
      await this.client.disconnect();
    }

    console.log('  ✅ Cleanup completed');
  }

  /**
   * Generate test summary
   */
  generateSummary() {
    console.log('\n📋 Test Summary:');
    console.log('================');

    const { connectionTest, backendType, basicOperations, errorHandling, performanceMetrics } = this.testResults;

    console.log(`Backend: ${backendType}`);
    console.log(`Connection: ${connectionTest?.connected ? 'Success' : 'Failed (using fallback)'}`);

    const basicSuccess = basicOperations.filter(op => op.success).length;
    console.log(`Basic operations: ${basicSuccess}/${basicOperations.length} successful`);

    const errorSuccess = errorHandling.filter(op => op.success).length;
    console.log(`Error handling: ${errorSuccess}/${errorHandling.length} tests passed`);

    if (performanceMetrics.concurrentOps) {
      console.log(`Performance: ${performanceMetrics.concurrentOps.successful}/10 concurrent ops successful`);
      console.log(`Average response time: ${performanceMetrics.concurrentOps.averageTime.toFixed(2)}ms`);
    }

    const overallSuccess = basicSuccess === basicOperations.length && errorSuccess === errorHandling.length;
    console.log(`\nOverall result: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);

    return overallSuccess;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Redis Connection Test Suite');
    console.log('===============================');

    try {
      await this.testConnection();
      await this.testBasicOperations();
      await this.testErrorHandling();
      await this.testPerformance();
      await this.testChessClockOperations();
      
      return this.generateSummary();
    } catch (error) {
      console.error('\n💥 Test suite failed:', error.message);
      console.error(error.stack);
      return false;
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const testSuite = new RedisTestSuite();
  
  testSuite.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = RedisTestSuite;