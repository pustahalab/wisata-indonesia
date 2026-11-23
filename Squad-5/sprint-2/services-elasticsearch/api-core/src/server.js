require('dotenv').config();
const app = require('./app');
const { ensureIndexExists } = require('./utils/es.client');

const PORT = process.env.PORT || 3001;

async function start() {
  await ensureIndexExists();
  app.listen(PORT, () => {
    console.log(
      `[Sprint 2] Elasticsearch search service running on http://localhost:${PORT}`
    );
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
