var inquirer = require("inquirer");
var axios = require("axios");
var html = require("./generateHTML");
var puppeteer = require("puppeteer");

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

async function init() {
  const userProfile = await inquirer.prompt(questions);

  let username = userProfile.githubUsername;
  let githubUrl = `https://api.github.com/users/${username}`;
  let starrepoUrl = `https://api.github.com/users/${username}/starred?`;

  const gitResponse = await axios.get(githubUrl);

  userProfile.name = gitResponse.data.name;
  userProfile.imgUrl = gitResponse.data.avatar_url;
  userProfile.location = gitResponse.data.location;
  userProfile.public_repos = gitResponse.data.public_repos;
  userProfile.followers = gitResponse.data.followers;
  userProfile.following = gitResponse.data.following;
  userProfile.currently = gitResponse.data.company;
  userProfile.urlGit = gitResponse.data.html_url;

  const gitStarReponse = await axios.get(starrepoUrl);

  userProfile.starrepos = gitStarReponse.data.length;

  const htmlContent = html.generateHTML(userProfile);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  const buffer = await page.pdf({
    path: `./${userProfile.name}.pdf`,
    format: "A4",
    printBackground: true,
    margin: {
      left: "0px",
      top: "0px",
      right: "0px",
      bottom: "0px"
    }
  });

  await browser.close();
}

init();
