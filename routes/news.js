const express = require('express');
const router = express.Router();

const newsService = require('../services/news.service');

router.get('/getData', newsService.getData);
router.get('/getSources', newsService.getSources);

module.exports = router;
