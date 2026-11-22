const express = require('express');
const { searchDestinations } = require('../controllers/search.controller');

const router = express.Router();
router.get('/', searchDestinations);
module.exports = router;
