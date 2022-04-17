const express = require('express');
const router = express.Router();

const newsService = require('../services/news.service');

router.get('/getData', newsService.getData);
router.get('/getSources', newsService.getSources);
router.get('/getDataFromSource', newsService.getDataFromSource);
router.get('/notify', newsService.testNotification);

module.exports = router;
