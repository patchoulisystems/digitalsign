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

const postFromPage = (request, response, postFn, toFind, headers) => {
  let requestData = "";
  request.on("data", (incomingData) => {
    requestData += incomingData;
  });

  request.on("end", () => {
    requestData = JSON.parse(requestData);

    if (toFind) {
      response.setHeader("Content-Type", "text/plain");
      if (requestData[toFind].length == 0) {
        response.writeHead(400, "Bad Request");
      } else {
        postFn(requestData);
        response.writeHead(200, "OK");
      }
    } else {
      if (
        !requestData.dates ||
        !requestData.dateType ||
        !requestData.pictures
      ) {
        response.writeHead(400, "Bad Request");
      } else {
        postFn(requestData);
        response.writeHead(200, "OK");
      }
    }
    response.end();
  });
};

module.exports = {
  getPage,
  postFromPage,
};
