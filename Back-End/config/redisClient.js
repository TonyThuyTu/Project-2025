const { createClient } = require('redis');

const redisClient = createClient({
  url: 'redis://redis:6379', // ✅ sửa lại IP localhost
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));

module.exports = redisClient;
