const express = require('express');
const router = express.Router();

const newsService = require('../services/news.service');

router.get('/', newsService.getTopHeadlines);

module.exports = router;
