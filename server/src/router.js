const fs = require('fs');
const url = require('url');
<<<<<<< HEAD
const formidable = require('formidable');
const path = require('path');
=======
>>>>>>> 22c602dba5d5ec58ca2fb594c009d94c70dc5220
const querystring = require('querystring');

const db = require('./dbmanager');

const imagesFolder = "./data/images/";
const assetsFolder = "./data/assets/";
const widgetsFolder = "../client/components/";

function home(request, response) {
    var urlObject = url.parse(`http://${request.headers.host}${request.url}`);
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
        "Access-Control-Max-Age": 2592000 // 30 days
            /** add other headers as per requirement */
    };
    if (urlObject.pathname === '/') {
        if (request.method == "GET") {
            var file = fs.readFileSync("../client/index.html");
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(file);
            response.end();
        }
    } else if (urlObject.pathname === "/today_images") {
        if (request.method == "GET") {
            let images = db.getTodayList();
            headers["Content-Type"] = "application/json";
            response.writeHead(200, headers);
            response.write(JSON.stringify({ data: images }));
            response.end();
        }
    } else if (urlObject.pathname === "/image") {
        if (request.method == "GET") {
            var parsedQuerystring = querystring.parse(urlObject.query);
            var stream = fs.createReadStream(
                `${imagesFolder}${parsedQuerystring.name}`
            );
            stream.on("open", () => {
                response.setHeader("Content-Type", "image/jpg");
                stream.pipe(response);
            });
        }
    } else if (urlObject.pathname === "/assets") {
        if (request.method == "GET") {
            var parsedQuerystring = querystring.parse(urlObject.query);
            var stream = fs.createReadStream(
                `${assetsFolder}${parsedQuerystring.name}`
            );
            stream.on("open", () => {
                response.setHeader("Content-Type", "image/jpg");
                stream.pipe(response);
            });
        }
    } else if (urlObject.pathname === "/widget") {
        if (request.method == "GET") {
            var parsedQuerystring = querystring.parse(urlObject.query);
            var contentType;
            if (parsedQuerystring.resource.includes('js')) {
                contentType = "text/javascript";
            } else if (parsedQuerystring.resource.includes('css')) {
                contentType = "text/css";
            } else if (parsedQuerystring.resource.includes('html')) {
                contentType = "text/html";
            }
            var stream = fs.createReadStream(
                `${widgetsFolder}${parsedQuerystring.resource}`
            );
            stream.on("open", () => {
                response.setHeader("Content-Type", contentType);
                stream.pipe(response);
            });
        }
    } else if (urlObject.pathname === "/upload") {
        if (request.method == "GET") {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            fs.createReadStream('../client/form_page/form.html').pipe(response);
        } else if (request.method == "POST") {
            db.insertFormData(request);
            response.write("File Uploaded and Saved!");
            response.end();
        }
    } else if (urlObject.pathname === "/today") {
        if (request.method == "GET") {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            fs.createReadStream('../client/slideshow_page/slideshow.html').pipe(response);
        }
    } else {
        if (request.method === "OPTIONS") {
            response.writeHead(200, headers);
            response.end();
            return;
        } else {
            response.end();
        }
    }
}

function css(request, response) {
    if (request.url.indexOf(".css") !== -1 && !request.url.includes('?')) {
        var name = request.url.split(".")[0];
        var file;
        if (name === "/index") {
            file = fs.readFileSync(`../client${request.url}`, { 'encoding': 'utf8' });
        } else {
            file = fs.readFileSync(`../client${name}_page${request.url}`, { 'encoding': 'utf8' });
        }
        response.writeHead(200, { 'Content-Type': 'text/css' });
        response.write(file);
    }
}

function js(request, response) {
    if (request.url.indexOf(".js") !== -1 && !request.url.includes('?')) {
        var name = request.url.split(".")[0];
        var file;
        if (name === "/index") {
            file = fs.readFileSync(`../client${request.url}`, { 'encoding': 'utf8' });
        } else {
            file = fs.readFileSync(`../client${name}_page${request.url}`, { 'encoding': 'utf8' });
        }
        response.writeHead(200, { 'Content-Type': 'text/javascript' });
        response.write(file);
    }
}

module.exports.home = home;
module.exports.css = css;
module.exports.js = js;