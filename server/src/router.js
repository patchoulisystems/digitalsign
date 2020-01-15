const fs = require('fs');
const url = require('url');
const formidable = require('formidable');
const querystring = require('querystring');

const imagesFolder = "../data/images/";

function home(request, response) {
    var urlObject = url.parse(`${request.headers.host}${request.url}`);
    console.log(urlObject.pathname);
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
        "Access-Control-Max-Age": 2592000 // 30 days
        /** add other headers as per requirement */
    };
    if (urlObject.pathname === '/') {
        if (request.method == "GET") {
            var file = fs.readFileSync("../../client/index.html");
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(file);
            response.end();
        }
    } else if (urlObject.pathname === "/today_images") {
        if (request.method == "GET") {
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
    } else if (urlObject.pathname === "/upload") {
        if (request.method == "GET") {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            fs.createReadStream('../../client/form_page/form.html').pipe(response);
        } else if (request.method == "POST") {
            var form = new formidable.IncomingForm();
            form.keepExtensions = true;
            form.parse(request, function (error, fields, files) {
                console.log(fields);
                console.log(files.picture.name);
                var oldPath = files.filetoupload.path;
                var newPath = `${imagesFolder}/${files.filetoupload.name}`;
                fs.rename(oldPath, newPath, error => {
                    if (error) throw error;
                    response.write("File Uploaded and Saved!");
                    response.end();
                });
            });
        }
    } else if (urlObject.pathname === "/today") {
        console.log("Get the /today");
        if (request.method == "GET") {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            fs.createReadStream('../../client/slideshow_page/slideshow.html').pipe(response);
        }
    } else {
        if (request.method === "OPTIONS") {
            response.writeHead(200, headers);
            response.end();
            return;
        } else {
            response.end("Undefined request");
        }
    }
}

function css(request, response) {
    if (request.url.indexOf(".css") !== -1) {
        var name = request.url.split(".")[0];
        var file;
        if (name === "/index") {
            file = fs.readFileSync(`../../client${request.url}`, { 'encoding': 'utf8' });
        } else {
            file = fs.readFileSync(`../../client${name}_page${request.url}`, { 'encoding': 'utf8' });
        }
        response.writeHead(200, { 'Content-Type': 'text/css' });
        response.write(file);
    }
}

function js(request, response) {
    console.log(request.url + "on js open");
    if (request.url.indexOf(".js") !== -1) {
        var name = request.url.split(".")[0];
        var file;
        if (name === "/index") {
            file = fs.readFileSync(`../../client${request.url}`, { 'encoding': 'utf8' });
        } else {
            file = fs.readFileSync(`../../client${name}_page${request.url}`, { 'encoding': 'utf8' });
        }
        response.writeHead(200, { 'Content-Type': 'text/javascript' });
        response.write(file);
    }
}

module.exports.home = home;
module.exports.css = css;
module.exports.js = js;