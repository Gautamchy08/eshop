import Redis from 'ioredis';


// For Upstash Redis, we use the full URL with auth
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export default redis;