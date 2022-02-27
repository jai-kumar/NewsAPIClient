const axios = require('axios');

const makeRequestForCron = async (url) => {
    console.log('in makeRequestForCron---->');
    try {
        // const response = await axios.get(url);
        // console.log('got response from newsapi: ',response.data.articles.length);
        return { articles: [] };//response.data.articles };
    } catch (err) {
        return { error: 'Unexpected error occured', errorResponse: err };
    }
}

const makeRequest = async (url, req, res) => {
    console.log('in makeRequest---->');
    try {
        // const response = await axios.get(url);
        console.log('got response from newsapi: ',response.data.articles.length);
        return { articles: [] };//response.data.articles };
    } catch (err) {
        return res.status(403).json({ error: 'Unexpected error occured', errorResponse: err });
    }
}

module.exports = {
    makeRequest,
    makeRequestForCron
}
