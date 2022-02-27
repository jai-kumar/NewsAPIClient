const fs = require('fs');
const path = require('path');
const util = require('util');
// Convert fs.readFile & fs.writeFile into Promise version of same
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const { gitHubInitialSetup, pushToGitHub } = require('./github.service');
const cronService = require('./cron.service');
const { makeRequest, makeRequestForCron } = require('./request.service');
// const MAX_ALLOWED_REQUEST = 100;

const NEWS_API_KEY = 'b09cb9cbfdcb432885e69f93d010e2a0';
const COUNTRY = [
    {
        code: "in",
        name: "India",
    },
    {
        code: "us",
        name: "USA",
    },
    {
        code: "au",
        name: "Australia",
    },
    {
        code: "ru",
        name: "Russia",
    },
    {
        code: "fr",
        name: "France",
    },
    {
        code: "gb",
        name: "United Kingdom",
    },
];
const DEFAULT_COUNTRY = COUNTRY[0].code;

gitHubInitialSetup();

const cb = async () => {
    console.log('1');
    const country = DEFAULT_COUNTRY;
    const url = `http://newsapi.org/v2/top-headlines?country=${country}&apiKey=${NEWS_API_KEY}`;
    const articlesFromNewsAPI = await makeRequestForCron(url);
    console.log('2');
    const urlArray = url.split('/');
    const v2Index = urlArray.findIndex(item => item === 'v2');
    const section = urlArray[v2Index + 1].split('?')[0];  // top-headlines etc.
    const countryCode = country.length === 2 ? country : DEFAULT_COUNTRY;
    const filePath = path.resolve(__dirname, `../json/${section}/${countryCode}.json`);

    await readFile(filePath, 'utf8').then(async (fileContent) => {
        console.log('reading file',filePath);
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
            // commit to GH
            console.log('writing to file : ',filePath);
            pushToGitHub(`writing to ${filePath}`);
        });
    });
};

cronService.startCronJob(cb);

module.exports = {
    getTopHeadlines: (req, res) => {
        const country = req.query?.country || DEFAULT_COUNTRY;
        const url = `http://newsapi.org/v2/top-headlines?country=${country}&apiKey=${NEWS_API_KEY}`;

        const urlArray = url.split('/');
        const v2Index = urlArray.findIndex(item => item === 'v2');
        const section = urlArray[v2Index + 1].split('?')[0];  // top-headlines etc.
        const countryCode = country.length === 2 ? country : DEFAULT_COUNTRY;
        const filePath = path.resolve(__dirname, `../json/${section}/${countryCode}.json`);

        return readFile(filePath, 'utf8').then(fileContent => {
            let fileContentJson = fileContent && JSON.parse(fileContent) || { articles: [] };
            return res.status(200).json({ articles: fileContentJson.articles });
        });
    }
}
