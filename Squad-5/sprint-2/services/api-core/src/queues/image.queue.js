const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null, // wajib untuk BullMQ
});

const imageQueue = new Queue('image-compress', { connection });

module.exports = { connection, imageQueue };
