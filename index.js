const inquirer = require("inquirer");
const fs = require('fs');
const axios = require("axios");
var generate = require('./generateHtml');
var convertFactory = require('electron-html-to');
var conversion = convertFactory({
    converterPath: convertFactory.converters.PDF
});

const questions = [

    {
        type: "input",
        name: "gitName",
        message: "What is your Github user name?"
    },

    {
        type: "list",
        message: "What is your favourite color?",
        name: "color",
        choices: [
            "green",
            "blue",
            "pink",
            "red"
        ]
    }

];
inquirer.prompt(questions).then(function(data) {
    const queryUrl = `https://api.github.com/users/${data.gitName}`;
    const colorEl = data.color;
    const queryUrlStar = `https://api.github.com/users/${data.gitName}/repos`;
    var starcount = 0;
    axios.get(queryUrlStar).then(function(res) {
        //starcount = Math.parseInt()
        // console.log(res.data[0].stargazers_count);
        starcount = res.data[0].stargazers_count
    });
    axios.get(queryUrl).then(function(res) {
        const html = generate.generateHTML(data, res, starcount);
        //console.log(res);
        conversion({ html: html }, function(err, result) {
            if (err) {
                return console.error(err);
            }

            // console.log(result.numberOfPages);
            // console.log(result.logs);
            result.stream.pipe(fs.createWriteStream(`./${data.gitName}.pdf`));
            conversion.kill(); // necessary if you use the electron-server strategy, see bellow for details
            console.log(`File created`);
        });
    });


});