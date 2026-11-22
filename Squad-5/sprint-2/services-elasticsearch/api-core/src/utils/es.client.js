const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

const INDEX_NAME = 'destinations';

async function ensureIndexExists() {
  const exists = await esClient.indices.exists({ index: INDEX_NAME });
  if (!exists) {
    await esClient.indices.create({
      index: INDEX_NAME,
      body: {
        mappings: {
          properties: {
            name: { type: 'text', analyzer: 'standard' },
            slug: { type: 'keyword' },
            description: { type: 'text', analyzer: 'standard' },
            category: { type: 'keyword' },
            province_id: { type: 'integer' },
            regency_id: { type: 'integer' },
            address: { type: 'text' },
            rating_avg: { type: 'float' },
            status: { type: 'keyword' },
            coordinates: { type: 'geo_point' },
            created_at: { type: 'date' },
          },
        },
      },
    });
  }
}

module.exports = { esClient, INDEX_NAME, ensureIndexExists };
