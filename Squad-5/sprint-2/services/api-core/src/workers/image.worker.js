require('dotenv').config();
const { Worker } = require('bullmq');
const sharp = require('sharp');
const { connection } = require('../queues/image.queue');

const worker = new Worker(
  'image-compress',
  async (job) => {
    const { inputPath, outputPath } = job.data;
    await sharp(inputPath)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
    return { outputPath };
  },
  { connection, concurrency: 3 }
);

worker.on('completed', (job) => console.log(`Job ${job.id} selesai`));
worker.on('failed', (job, err) => console.error(`Job ${job?.id} gagal: ${err.message}`));
console.log('Worker image-compress berjalan...');
