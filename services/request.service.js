const axios = require('axios');

const makeRequest = async (url, req, res) => {
    try {
        const response = await axios.get(url);
        return { articles: response.data.articles };
    } catch (err) {
        if(res)
            return res.status(403).json({ error: 'Unexpected error occured', errorResponse: err });
        return { error: 'Unexpected error occured', errorResponse: err };
    }
}

module.exports = {
    makeRequest
}
