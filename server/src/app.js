const http = require("http");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");
const formidable = require("formidable");

const hostname = "127.0.0.1";
const port = 3000;

const imagesFolder = "./data/images/";

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
    } else if (urlObject.pathname === "/upload"){
      response.writeHead(200, {'Content-Type': 'text/html'});
      fs.createReadStream('../client/form_page/form.html').pipe(response);
    } else if (urlObject.pathname === "/today"){      
      response.writeHead(200, {'Content-Type': 'text/html'});
      fs.createReadStream('../client/slideshow_page/slideshow.html').pipe(response);
    }
    else {
      response.writeHead(200, {'Content-Type': 'text/html'});
      fs.createReadStream("../client/index.html").pipe(response);
    }
  } else if (request.method == "POST") {
    if (urlObject.pathname === "/upload") {
      var form = new formidable.IncomingForm();
      form.keepExtensions = true;
      form.parse(request, function (error, fields, files) {
        console.log(fields);
        console.log(files.picture.name);
        // var oldPath = files.filetoupload.path;
        // var newPath = `${imagesFolder}/${files.filetoupload.name}`;
        // fs.rename(oldPath, newPath, error => {
        //   if (error) throw error;
          response.write("File Uploaded and Saved!");
          response.end();
        // });
      });
    }
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
