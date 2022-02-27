const express = require('express');
const app = express();
const cors = require('cors');
const newsRoutes = require('./routes/news');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json("Welcome to the awesome world of news.");
});

app.use('/news', newsRoutes);

module.exports = app;
