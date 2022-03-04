const express = require('express');
const router = express.Router();

const newsService = require('../services/news.service');

router.get('/', newsService.getData);

module.exports = router;
