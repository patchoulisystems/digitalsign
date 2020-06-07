/**
 * This module redirects the Client by manipulating the received URL string.
 * it uses a URLObject to do this and separate the
 * querystring from the actual URL, so we can see which endpoint is being called.
 * @module router
 * @see {@link dbmanager}
 */

const fs = require("fs");
const url = require("url");
const querystring = require("querystring");
const db = require("./dbmanager");
const formidable = require("formidable");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
  "Access-Control-Max-Age": 2592000, // 30 days
  /** add other headers as per requirement */
};

/**
 * @constant {String} imagesFolder - Path to the Images folder
 */
const imagesFolder = "./data/images/";
/**
 * @constant {String} assetsFolder - Path to the Assets folder
 */
const assetsFolder = "./data/assets/";
/**
 * @constant {String} widgetsFolder - Path to the Widgets folder
 */
const widgetsFolder = "../client/components/";

/**
 * This is the entry point of our application. It is divided by the pathname of the url received so we can determine which endpoint
 * function to call.
 * @param {XMLHttpRequest} request - The request sent by the Client
 * @param {Response} response - The response that the server will send back to the client
 */
function home(request, response) {
  let urlObject = url.parse(`http://${request.headers.host}${request.url}`);
  let pathname = urlObject.pathname.toString();

  switch (pathname) {
    case "/assets":
      resolveAssets(response, request, urlObject);
      break;
    case "/widget":
      resolveWidget(response, request, urlObject);
      break;
    case "/":
      resolveIndex(response, request.method);
      break;
    case "/today":
      resolveToday(request, response);
      break;
    case "/today_images":
      resolveTodayImages(response, request.method);
      break;
    case "/image":
      resolveImage(response, request, urlObject);
      break;
    case "/piclist":
      resolvePictureList(response, request);
      break;
    case "/upload":
      resolveUpload(response, request);
      break;
    case "/edit_day":
      resolveEditDay(response, request);
      break;
    case "/dated_images":
      resolveDatedImages(response, request.method, urlObject);
      break;
    case "/slideshow_settings":
      resolveSettingsPage(response, request, urlObject);
      break;
    case "/settings":
      resolveSettings(response, request.method, urlObject);
      break;
    default:
      resolveOptions(response, request);
      break;
  }
}

/**
 * This the endpoint that returns the requested asset back to the client
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 * @param {URLWithStringQuery} urlObject - The object that contains the route inside the request
 */
function resolveAssets(response, request, urlObject) {
  if (request.method == "GET") {
    var parsedQuerystring = querystring.parse(urlObject.query);
    // TODO: Safety on no file found
    if (parsedQuerystring.name.indexOf(".png") !== -1) {
      var stream = fs.createReadStream(
        `${assetsFolder}${parsedQuerystring.name}`
      );
      stream.on("open", () => {
        response.setHeader("Content-Type", "image/png");
        stream.pipe(response);
      });
    } else if (parsedQuerystring.name.indexOf("font") !== -1) {
      var fileName = parsedQuerystring.name.split("font")[1];
      if (fileName.indexOf(".ttf") !== -1) {
        var stream = fs.createReadStream(`${assetsFolder}/fonts/${fileName}`);
        stream.on("open", () => {
          response.setHeader("Content-Type", "application/x-font-ttf");
          stream.pipe(response);
        });
      } else if (fileName.indexOf(".woff") !== -1) {
        var stream = fs.createReadStream(`${assetsFolder}fonts/${fileName}`);
        stream.on("open", () => {
          response.setHeader("Content-Type", "application/font-woff");
          stream.pipe(response);
        });
      }
    } else if (parsedQuerystring.name.indexOf(".js") !== -1) {
      var fileName = parsedQuerystring.name;
      var stream = fs.createReadStream(
        `${assetsFolder}scripts/${parsedQuerystring.name}`
      );
      stream.on("open", () => {
        response.setHeader("Content-Type", "text/javascript");
        stream.pipe(response);
      });
    } else if (parsedQuerystring.name.indexOf(".ico") !== -1) {
      var stream = fs.createReadStream(
        `${assetsFolder}${parsedQuerystring.name}`
      );
      stream.on("open", () => {
        response.setHeader("Content-Type", "image/x-icon");
        stream.pipe(response);
      });
    }
  } else {
    response.writeHead(404, "Not Found");
    response.end();
  }
}

/**
 * This the endpoint that returns the requested widget (or related file) back to the client
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 * @param {URLWithStringQuery} urlObject - The object that contains the route inside the request
 */
function resolveWidget(response, request, urlObject) {
  if (request.method == "GET") {
    var parsedQuerystring = querystring.parse(urlObject.query);
    var contentType;
    // TODO: Safety on no file found
    if (parsedQuerystring.resource.includes("js")) {
      contentType = "text/javascript";
    } else if (parsedQuerystring.resource.includes("css")) {
      contentType = "text/css";
    } else if (parsedQuerystring.resource.includes("html")) {
      contentType = "text/html";
    }
    var stream = fs.createReadStream(
      `${widgetsFolder}/${parsedQuerystring.widgetName}/${parsedQuerystring.resource}`
    );
    stream.on("open", () => {
      response.setHeader("Content-Type", contentType);
      stream.pipe(response);
    });
  } else {
    response.writeHead(404, "Not Found");
    response.end();
  }
}

/**
 * This the endpoint that resolves the Index page
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - The method of the request sent by the Client
 */
function resolveIndex(response, method) {
  if (method == "GET") {
    let file = fs.readFileSync("../client/index.html");
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(file);
    response.end();
  } else {
    response.writeHead(404, "Not Found");
    response.end();
  }
}

/**
 * This the endpoint that resolves the Slideshow page
 * @param {XMLHttpRequest} request - The request sent by the Client
 * @param {Response} response - The response that the server will send back to the client
 */
function resolveToday(request, response) {
  if (request.method == "GET") {
    let file = fs.readFileSync("../client/slideshow_page/slideshow.html");
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(file);
    response.end();
  } else {
    response.writeHead(404, "Not Found");
    response.end();
  }
}

/**
 * This the endpoint that handles the query of the list of the images for the day
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - The method of the request sent by the Client
 */
function resolveTodayImages(response, method) {
  if (method == "GET") {
    let images = db.getTodayList();
    headers["Content-Type"] = "application/json";
    response.writeHead(200, headers);
    response.write(JSON.stringify({ data: images }));
    response.end();
  } else {
    response.writeHead(404, "Not Found");
    response.end();
  }
}

/**
 * This the endpoint that handles the query for an image
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 * @param {URLWithStringQuery} urlObject - The object that contains the route inside the request
 */
function resolveImage(response, request, urlObject) {
  if (request.method == "GET") {
    var parsedQuerystring = querystring.parse(urlObject.query);
    // TODO: Safety on file not found
    var stream = fs.createReadStream(
      `${imagesFolder}${parsedQuerystring.name}`
    );
    stream.on("open", () => {
      response.setHeader("Content-Type", "image/jpg");
      stream.pipe(response);
    });
  } else {
    response.writeHead(404, "Not Found");
    response.end();
  }
}

/**
 * This the endpoint that takes a list of pictures and sets it to a passed date interval, or set of dates
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 */
function resolvePictureList(response, request) {
  if (request.method === "POST") {
    let requestData = "";

    request.on("data", function (incomingData) {
      requestData += incomingData;
    });

    request.on("end", () => {
      requestData = JSON.parse(requestData);
      response.setHeader("Content-Type", "text/plain");
      if (requestData["pictures"].length == 0) {
        response.writeHead(400, "Bad Request");
      } else {
        response.writeHead(200, "OK");
        db.pictureList(requestData);
      }
      response.end();
    });
  } else {
    response.writeHead(404, "Not Found");
    response.end();
  }
}

/**
 * This the endpoint that handles an incoming form with a set of pictures
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 */
function resolveUpload(response, request) {
  if (request.method == "GET") {
    let file = fs.readFileSync("../client/form_page/form.html");
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(file);
    response.end();
  } else if (request.method == "POST") {
    db.insertFormData(request, response);
  } else {
    response.writeHead(404, "Not Found");
    response.end();
  }
}

/**
 * This the endpoint that resolves the Date Edit page
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 */
function resolveEditDay(response, request) {
  if (request.method == "GET") {
    let file = fs.readFileSync("../client/edit_day_page/edit_day.html");
    headers["Content-Type"] = "text/html";
    response.writeHead(200, headers);
    response.write(file);
    response.end();
  } else {
    response.writeHead(404, "Not Found");
    response.end();
  }
}

/**
 * This the endpoint that resolves the Index page
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - The method of the request sent by the Client
 * @param {URLWithStringQuery} urlObject - The object that contains the route inside the request
 */
function resolveDatedImages(response, method, urlObject) {
  if (method == "GET") {
    let parsedQuerystring = querystring.parse(urlObject.query);
    let datedImages = db.getImageListFromDate(
      parsedQuerystring.date,
      parsedQuerystring.datetype
    );
    headers["Content-Type"] = "application/json";
    response.writeHead(200, headers);
    response.write(JSON.stringify({ data: datedImages }));
  } else response.writeHead(404, "Not Found");
  response.end();
}

/**
 * This the endpoint that resolves the slideshow settings page
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - The method of the request sent by the Client
 * @param {URLWithStringQuery} urlObject - The object that contains the route inside the request
 */
function resolveSettingsPage(response, request, urlObject) {
  if (request.method == "GET") {
    let file = fs.readFileSync(
      "../client/slideshow_settings_page/slideshow_settings.html"
    );
    headers["Content-Type"] = "text/html";
    response.writeHead(200, headers);
    response.write(file);
    response.end();
  } else if (request.method == "POST") {
    let form = new formidable.IncomingForm({ multiples: true });
    form.keepExtensions = true;

    form.parse(request, (error, fields, files) => {
      if (
        !fields.animationSpeed ||
        !fields.animationName ||
        !fields.timeBetweenPictures
      ) {
        response.writeHead(400, "Bad Request");
        response.end();
      } else {
        fs.writeFileSync("./data/settings.json", JSON.stringify(fields));
        response.writeHead(200, "OK");
        response.end();
      }
    });
  } else {
    response.writeHead(404, "Not Found");
    response.end();
  }
}

/**
 * This the endpoint that resolves the settings file
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - The method of the request sent by the Client
 */
function resolveSettings(response, method) {
  if (method == "GET") {
    let settings = fs.readFileSync("./data/settings.json");
    settings = JSON.parse(settings);
    response.write(JSON.stringify({ data: settings }));
    response.end();
  }
}

/**
 * This the endpoint that resolves whenever the options of the web app are requested.
 * Definitively needs more work because this actually does nothing.
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 */
function resolveOptions(response, request) {
  if (request.method === "OPTIONS") {
    response.writeHead(200, headers);
    response.end();
    return;
  } else {
    response.end();
  }
}

/**
 * This the endpoint that handles the request of any CSS file of a page (this doesn't include the CSS for widgets)
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 */
function css(request, response) {
  if (request.url.indexOf(".css") !== -1 && !request.url.includes("?")) {
    var name = request.url.split(".")[0];
    var file;
    if (name === "/index") {
      file = fs.readFileSync(`../client${request.url}`, { encoding: "utf8" });
    } else {
      file = fs.readFileSync(`../client${name}_page${request.url}`, {
        encoding: "utf8",
      });
    }
    response.writeHead(200, { "Content-Type": "text/css" });
    response.write(file);
  }
}

/**
 * This the endpoint that handles the request of any JS file of a page (this doesn't include the JS for widgets)
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 */
function js(request, response) {
  if (request.url.indexOf(".js") !== -1 && !request.url.includes("?")) {
    var name = request.url.split(".")[0];
    var file;
    if (name === "/index") {
      file = fs.readFileSync(`../client${request.url}`, { encoding: "utf8" });
    } else {
      file = fs.readFileSync(`../client${name}_page${request.url}`, {
        encoding: "utf8",
      });
    }
    response.writeHead(200, { "Content-Type": "text/javascript" });
    response.write(file);
  }
}

module.exports.home = home;
module.exports.css = css;
module.exports.js = js;
