const fs = require('fs');
const path = require('path');
const util = require('util');
// Convert fs.readFile & fs.writeFile into Promise version of same
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const { cronObj } = require('./cron.service');
const { makeRequest } = require('./request.service');

const DATA_FOLDER_NAME = 'data';
const NEWS_API_KEY = 'b09cb9cbfdcb432885e69f93d010e2a0';
const COUNTRY = [
    {
        code: "in",
        name: "India",
        inUse: true,
        lastUpdatedOn: ''
    },
    {
        code: "us",
        name: "USA",
        inUse: true,
        lastUpdatedOn: ''
    },
    {
        code: "au",
        name: "Australia",
        inUse: true,
        lastUpdatedOn: ''
    },
    {
        code: "ru",
        name: "Russia",
        inUse: true,
        lastUpdatedOn: ''
    },
    {
        code: "fr",
        name: "France",
        inUse: true,
        lastUpdatedOn: ''
    },
    {
        code: "gb",
        name: "United Kingdom",
        inUse: true,
        lastUpdatedOn: ''
    },
];
const DEFAULT_COUNTRY = COUNTRY[5].code;
const REQUEST_MAP_COUNTER = [
    "top-headlines",
    "business",
    "entertainment",
    "general",
    "health",
    "science",
    "sports",
    "technology"
];

const updateFiles = async (c, country = DEFAULT_COUNTRY) => {
    let url = `http://newsapi.org/v2/top-headlines?country=${country}&apiKey=${NEWS_API_KEY}`;
    let fileName = 'business';
    let counter = c;
    let countryIndex = getCountryIndex(country);
    switch (counter) {
        case 0:
            url = `http://newsapi.org/v2/${REQUEST_MAP_COUNTER[counter]}?country=${country}&apiKey=${NEWS_API_KEY}`;
            break;

        case 1:
            url = `http://newsapi.org/v2/top-headlines?country=${country}&category=${REQUEST_MAP_COUNTER[counter]}&apiKey=${NEWS_API_KEY}`;
            break;

        case 2:
            url = `http://newsapi.org/v2/top-headlines?country=${country}&category=${REQUEST_MAP_COUNTER[counter]}&apiKey=${NEWS_API_KEY}`;
            break;

        case 3:
            url = `http://newsapi.org/v2/top-headlines?country=${country}&category=${REQUEST_MAP_COUNTER[counter]}&apiKey=${NEWS_API_KEY}`;
            break;

        case 4:
            url = `http://newsapi.org/v2/top-headlines?country=${country}&category=${REQUEST_MAP_COUNTER[counter]}&apiKey=${NEWS_API_KEY}`;
            break;

        case 5:
            url = `http://newsapi.org/v2/top-headlines?country=${country}&category=${REQUEST_MAP_COUNTER[counter]}&apiKey=${NEWS_API_KEY}`;
            break;

        case 6:
            url = `http://newsapi.org/v2/top-headlines?country=${country}&category=${REQUEST_MAP_COUNTER[counter]}&apiKey=${NEWS_API_KEY}`;
            break;

        case 7:
            url = `http://newsapi.org/v2/top-headlines?country=${country}&category=${REQUEST_MAP_COUNTER[counter]}&apiKey=${NEWS_API_KEY}`;
            break;

        default:
            return;
    }

    fileName = REQUEST_MAP_COUNTER[counter];

    const articlesFromNewsAPI = await makeRequest(url);
    const countryCode = country.length === 2 ? country : DEFAULT_COUNTRY;
    const filePath = path.resolve(__dirname, `../${DATA_FOLDER_NAME}/${countryCode}/${fileName}.json`);

    await readFile(filePath, 'utf8').then(async (fileContent) => {
        console.log('fileContent: ',fileContent);
        let fileContentJson = fileContent && JSON.parse(fileContent) || { articles: [] };
        if (fileContentJson && fileContentJson.articles?.length < 80) {
            // write more articles to json
            fileContentJson.articles = [...articlesFromNewsAPI.articles, ...fileContentJson.articles];
        } else {
            // remove last few results to make sure json have total
            // 80 articles only including latest ones in their published order
            const oldArticlesCount = fileContentJson.articles.length;
            const newArticlesCount = articlesFromNewsAPI.articles.length;
            fileContentJson.articles.splice(0, 0, ...articlesFromNewsAPI.articles);   // add new articles in statring of old articles
            fileContentJson.articles.splice(oldArticlesCount - newArticlesCount, newArticlesCount);  // remove the same count as of new articles from the final articles end
        }

        let fileContentString = JSON.stringify(fileContentJson);
        await writeFile(filePath, fileContentString, 'utf8').then(res => {
            // do anything once file is update with new articles
            COUNTRY[countryIndex].lastUpdatedOn = new Date();
            COUNTRY[countryIndex].inUse = true;
        });
    });
};

const getTimeDiffInMinutes = (lastUpdatedDate, dateNow) => {
    let timeDiffInMs = Math.abs(lastUpdatedDate - dateNow);
    let minutes = Math.floor(timeDiffInMs / 60000);

    return minutes;
}

const getCountryIndex = (countryCode) => {
    return COUNTRY.findIndex(c => c.code === countryCode);
}

const isCountryInUse = (country) => {
    const countryIndex = getCountryIndex(country);
    return COUNTRY[countryIndex].inUse;
}

const updateInUseStatus = (country) => {
    const countryIndex = getCountryIndex(country);
    const dateNow = new Date();
    const lastUpdatedDate = COUNTRY[countryIndex].lastUpdatedOn;
    const diff = getTimeDiffInMinutes(lastUpdatedDate, dateNow);

    if(diff > 60) {
        COUNTRY[countryIndex].inUse = false;
    } else {
        COUNTRY[countryIndex].inUse = true;
    }
}

cronObj.start(updateFiles);

module.exports = {
    getData: (req, res) => {
        const country = req.query?.country || DEFAULT_COUNTRY;
        const section = req.query?.section || 'top-headlines';
        const countryCode = country?.length === 2 ? country : DEFAULT_COUNTRY;
        const filePath = path.resolve(__dirname, `../${DATA_FOLDER_NAME}/${countryCode}/${section}.json`);

        updateInUseStatus(countryCode);

        const readAndReturn = () => {
            return readFile(filePath, 'utf8').then(fileContent => {
                let fileContentJson = fileContent && JSON.parse(fileContent) || { articles: [] };
                return res.status(200).json({ articles: fileContentJson.articles });
            }).catch(err => {
                return res.status(502).json(err);
            });
        }

        if(!isCountryInUse(countryCode)) {
            // make request to updateFiles, then read data
            cronObj.start7Times(updateFiles, countryCode, readAndReturn);
        } else {
            readAndReturn();
        }
    },
    getSources: (req, res) => {
        const filePath = path.resolve(__dirname, `../${DATA_FOLDER_NAME}/sources.json`);

        return readFile(filePath, 'utf8').then(fileContent => {
            let fileContentJson = fileContent && JSON.parse(fileContent) || { sources: [] };
            return res.status(200).json({ sources: fileContentJson.sources });
        }).catch(err => {
            return res.status(502).json(err);
        });
    }
}
