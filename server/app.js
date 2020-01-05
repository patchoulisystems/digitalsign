const http = require("http");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");

const hostname = "127.0.0.1";
const port = 3000;

const imagesFolder = "../images/";

const server = http.createServer((request, response) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Max-Age": 2592000 // 30 days
    /** add other headers as per requirement */
  };

  var urlObject = url.parse(`${request.headers.host}${request.url}`);

  if (request.method == "GET") {
    if (urlObject.pathname === "/today_images") {
      var images = [];
      fs.readdir(imagesFolder, (err, files) => {
        files.forEach(file => {
          images.push(file);
        });
        headers["Content-Type"] = "application/json";
        response.writeHead(200, headers);
        response.write(JSON.stringify({ data: images }));
        response.end();
      });
    } else if (urlObject.pathname === "/image") {
      var parsedQuerystring = querystring.parse(urlObject.query);
      var stream = fs.createReadStream(
        `${imagesFolder}${parsedQuerystring.name}`
      );
      stream.on("open", () => {
        response.setHeader("Content-Type", "image/jpg");
        stream.pipe(response);
      });
    } else {
      response.end(
        "405 - Method Not Allowed: You cannot GET from this endpoint."
      );
    }
  } else if (request.method == "POST") {
    response.end("POST method invoked");
  } else if (request.method === "OPTIONS") {
    response.writeHead(200, headers);
    response.end();
    return;
  } else {
    response.end("Undefined request");
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});
