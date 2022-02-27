// const simpleGit = require('simple-git');
const {default: simpleGit, CleanOptions} = require('simple-git');
simpleGit().clean(CleanOptions.FORCE);

const shellJs = require('shelljs');
const path = require('path');
const options = {
    baseDir: path.resolve(__dirname, '../json'),
    binary: 'git',
    maxConcurrentProcesses: 6,
 };

const git = simpleGit(options);

module.exports = {
    gitHubInitialSetup: () => {
         git
            .init((err, initResult) => {
                if (err) {
                    console.error('Error while git initialize: ',err);
                } else {
                    console.log("git init done, initResult: ",initResult);
                }
            })
            .addRemote('origin', 'git@github.com:jai-kumar/NewsAPIClient.git', (err, addRemoteResult) => {
                if (err) {
                    console.error('Error while git addRemote: ',err);
                } else {
                    console.log("git addRemote done, addRemoteResult: ",addRemoteResult);
                }
            });

        // change current directory to repo directory in local
        // shellJs.cd(path.resolve(__dirname, '../json'));

        // const repo = 'NewsAPIClient';  //Repo name

        // User name and password of your GitHub
        // const userName = 'jai-kumar';
        // const password = 'me.jai@GH1';

        // Set up GitHub url like this so no manual entry of user pass needed
        // const gitHubUrl = `https://${userName}:${password}@github.com/${userName}/${repo}`;

        // add local git config like username and email
        // simpleGit.addConfig('user.email', 'jaikumar.mnnit@gmail.com');
        // simpleGit.addConfig('user.name', 'jai-kumar');

        // Add remore repo url as origin to repo
        // simpleGit.addRemote('origin', gitHubUrl);
    },
    pushToGitHub: (commitMsg) => {
        // Add all files for commit
        git.add('.')
        .then(
            (addSuccess) => {
                console.log('addSuccess: ', addSuccess);
            }, (failedAdd) => {
                console.log('adding files failed');
            });

        // Commit files as Initial Commit
        git.commit(commitMsg)
        .then(
            (successCommit) => {
                console.log('successCommit: ',successCommit);
            }, (failed) => {
                console.log('failed commmit');
            });

        // Finally push to online repository
        git.push('origin', 'main')
        .then((success) => {
            console.log('repo successfully pushed');
        }, (failed) => {
            console.log('repo push failed');
        });
    }
}
