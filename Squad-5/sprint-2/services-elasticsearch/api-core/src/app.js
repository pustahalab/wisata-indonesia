const express = require('express');
const searchRoutes = require('./routes/search.routes');

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-core-sprint2' });
});

app.use('/api/v1/search', searchRoutes);

module.exports = app;
