const { esClient, INDEX_NAME, ensureIndexExists } = require('../src/utils/es.client');
const destinations = require('../src/data/destinations.mock');

async function seed() {
  await ensureIndexExists();

  const body = destinations.flatMap((doc) => [
    { index: { _index: INDEX_NAME, _id: doc.id } },
    doc,
  ]);

  if (body.length > 0) {
    const response = await esClient.bulk({ body });
    console.log(`Terindeks ${destinations.length} dokumen ke Elasticsearch`);
    if (response.errors) {
      console.error('Beberapa dokumen gagal terindeks:', response.items);
    }
  }
}

seed().catch((err) => {
  console.error('Gagal seed Elasticsearch:', err.message);
  process.exit(1);
});
