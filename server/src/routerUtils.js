const fs = require("fs");
const db = require("./dbmanager");
const ASSETS_DIRECTORY = "./data/assets/";

const findAsset = (response, asset, ct, inside) => {
  let pathString = ASSETS_DIRECTORY + (inside ? inside + "/" : "/") + asset;

  if (fs.existsSync(pathString)) {
    let stream = fs.createReadStream(pathString);
    stream.on("open", () => {
      response.setHeader("Content-Type", ct);
      stream.pipe(response);
    });
  } else {
    response.writeHead(404, "Not Found");
    response.end();
  }
};

const sendJson = (response, obj) => {
  response.write(JSON.stringify(obj));
  response.end();
};

const getPage = (response, page = "index") => {
  if (page != "index") {
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
  } else if (page == "index") {
    if (fs.existsSync("../client/index.html")) {
      let file = fs.readFileSync("../client/index.html");
      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(file);
      response.end();
    } else {
      response.writeHead(404, "Not Found");
      response.end();
    }
  }
};

const postFromPage = (request, response, postFn, toFind) => {
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
  sendJson,
  findAsset,
};
