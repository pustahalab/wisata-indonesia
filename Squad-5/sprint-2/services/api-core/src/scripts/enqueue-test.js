const path = require('path');
const { imageQueue, connection } = require('../queues/image.queue');

(async () => {
  const input = path.resolve(process.argv[2]);
  const output = input.replace(/\.\w+$/, '.webp');
  const job = await imageQueue.add(
    'to-webp',
    { inputPath: input, outputPath: output },
    { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: true }
  );
  console.log('Job masuk:', job.id);
  await imageQueue.close();
  await connection.quit();
})();
