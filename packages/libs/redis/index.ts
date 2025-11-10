import Redis from 'ioredis';

// For Upstash Redis, we use the full URL with auth
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  enableOfflineQueue: true,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err: any) => {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      return true; // reconnect on network errors
    }
    return false;
  }
});

// Handle connection events
redis.on('error', (err) => {
  console.warn('Redis connection error:', err.message);
  // Don't crash the app - Redis is optional for OTP functionality
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis attempting to reconnect...');
});

export default redis;