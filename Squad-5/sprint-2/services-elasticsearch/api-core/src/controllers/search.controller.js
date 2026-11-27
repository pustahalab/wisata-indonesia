const { esClient, INDEX_NAME } = require('../utils/es.client');

async function searchDestinations(req, res) {
  const { q, category, province_id, page = 1, size = 20 } = req.query;
  const from = (parseInt(page) - 1) * parseInt(size);

  const must = [{ term: { status: 'approved' } }];

  if (q) {
    must.push({
      multi_match: {
        query: q,
        fields: ['name^3', 'description^2', 'address'],
        fuzziness: 'AUTO',
      },
    });
  }
  if (category) must.push({ term: { category } });
  if (province_id) must.push({ term: { province_id: parseInt(province_id) } });

  const result = await esClient.search({
    index: INDEX_NAME,
    from,
    size: parseInt(size),
    query: { bool: { must } },
    sort: [{ rating_avg: { order: 'desc' } }],
  });

  const hits = result.hits.hits.map((h) => ({
    id: h._id,
    score: h._score,
    ...h._source,
  }));

  res.json({
    total: result.hits.total.value,
    page: parseInt(page),
    size: parseInt(size),
    data: hits,
  });
}

module.exports = { searchDestinations };
