import createClient from 'ioredis'
// import config from '../config'

export const redisClient = new createClient({
  maxRetriesPerRequest: null,
  // socket: {
  //   host: config.redis.host || 'redis',
  //   port: parseInt(config.redis.port) || 6379,
  //   family: 4, // Force IPv4
  //   connectTimeout: 10000,
  // },
})

redisClient.on('error', err => {
  console.error('Redis client error:', err)
})
