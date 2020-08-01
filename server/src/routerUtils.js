const fs = require("fs");
const db = require("./dbmanager");

const getPage = (page, response) => {
  let pagePath = `../client/${page}_page/${page}.html`;
  if (fs.existsSync(pagePath)) {
    let file = fs.readFileSync(pagePath);
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(file);
    response.end();
  } else {
    response.writeHead(404, "Not Found");
    response.end();
  }
};

const postFromPage = (request) => {};

module.exports = {
  getPage,
};
