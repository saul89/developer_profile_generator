var inquirer = require("inquirer");
var axios = require("axios");
var fs = require("fs");
var pdf = require("html-pdf");
var html = require("./generateHTML");

const questions = [
  {
    name: "githubUsername",
    message: "What is your GitHub Username?"
  },
  {
    name: "color",
    message: "What is your favourite color?"
  }
];

function writeToFile(fileName, data) {
  fs.writeFile(`${fileName}.html`, data, err => {
    if (err) throw err;
  });
}

function init() {
  inquirer.prompt(questions).then(data => {
    let username = data.githubUsername;
    let githubUrl = `https://api.github.com/users/${username}`;
    let starrepoUrl = `https://api.github.com/users/${username}/starred?`;

    axios
      .get(githubUrl)
      .then(response => {
        data.name = response.data.name;
        data.imgUrl = response.data.avatar_url;
        data.location = response.data.location;
        data.public_repos = response.data.public_repos;
        data.followers = response.data.followers;
        data.following = response.data.following;
        data.currently = response.data.company;
        data.urlGit = response.data.html_url;
      })
      .then(
        axios
          .get(starrepoUrl)
          .then(stars => {
            data.starrepos = stars.data.length;
          })
          .then(() => {
            var htmlContent = html.generateHTML(data);
            writeToFile("index", htmlContent);
          })
          .then(() => {
            var options = { format: "A3", orientation: "portrait" };
            fs.readFile("./index.html", "utf8", (err, data) => {
              pdf
                .create(data, options)
                .toFile("./index.pdf", function(err, res) {
                  if (err) return console.log(err);
                  console.log(res);
                });
            });
          })
      );
  });
}

init();
