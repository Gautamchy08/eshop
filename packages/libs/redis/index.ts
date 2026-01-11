import Redis from 'ioredis';

// For Upstash Redis, we use the full URL with auth
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  enableOfflineQueue: true,
  connectTimeout: 10000, // 10 seconds timeout
  commandTimeout: 5000,  // 5 seconds per command timeout
  retryStrategy: (times) => {
    if (times > 10) {
      console.error('Redis: Max retries exceeded, stopping reconnection attempts');
      return null; // Stop retrying after 10 attempts
    }
    const delay = Math.min(times * 100, 3000); // Max 3 second delay
    return delay;
  },
  reconnectOnError: (err: any) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true; // Reconnect when READONLY error
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