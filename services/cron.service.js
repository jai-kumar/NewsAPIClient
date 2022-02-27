const cron = require('node-cron');

// const cronTask = cron.schedule('*/10 * * * * *', async () => {
//     console.log('1');
//     const country = req.query?.country || DEFAULT_COUNTRY;
//     const url = `http://newsapi.org/v2/top-headlines?country=${country}&apiKey=${NEWS_API_KEY}`;
//     const articlesFromNewsAPI = await makeRequest(url, req, res);
//     console.log('2');
//     const urlArray = url.split('/');
//     const v2Index = urlArray.findIndex(item => item === 'v2');
//     const section = urlArray[v2Index + 1].split('?')[0];  // top-headlines etc.
//     const countryCode = country.length === 2 ? country : DEFAULT_COUNTRY;
//     const filePath = path.resolve(__dirname, `../json/${section}/${countryCode}.json`);

//     await readFile(filePath, 'utf8').then(async (fileContent) => {
//         console.log('reading file',filePath);
//         let fileContentJson = fileContent && JSON.parse(fileContent) || { articles: [] };
//         if (fileContentJson && fileContentJson.articles?.length < 80) {
//             // write more articles to json
//             fileContentJson.articles = [...articlesFromNewsAPI.articles, ...fileContentJson.articles];
//         } else {
//             // remove last few results to make sure json have total
//             // 80 articles only including latest ones in their published order
//             const oldArticlesCount = fileContentJson.articles.length;
//             const newArticlesCount = articlesFromNewsAPI.articles.length;
//             fileContentJson.articles.splice(0, 0, ...articlesFromNewsAPI.articles);   // add new articles in statring of old articles
//             fileContentJson.articles.splice(oldArticlesCount - newArticlesCount, newArticlesCount);  // remove the same count as of new articles from the final articles end
//         }

//         let fileContentString = JSON.stringify(fileContentJson);
//         await writeFile(filePath, fileContentString, 'utf8').then(res => {
//             // commit to GH
//             console.log('writing to file',fileContentString.length());
//             pushToGitHub(`writing to ${filePath}`);
//         });
//     });
// }, {
//     scheduled: true,
//     timezone: "Asia/Calcutta"
// });

module.exports = {
    startCronJob: (cb) => {
        const cronTask = cron.schedule('*/15 * * * *', () => {
            cb();
        }, {
            scheduled: true,
            timezone: "Asia/Calcutta"
        });
        cronTask.start();
    }
}
