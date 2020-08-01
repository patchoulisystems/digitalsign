const getH = require("./getHandlers");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");
const db = require("./dbmanager");
const formidable = require("formidable");
const routerUtils = require("./routerUtils");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
  "Access-Control-Max-Age": 2592000, // 30 days
  /** add other headers as per requirement */
};

/** Router Module
 *
 * This module redirects the Client by manipulating the received URL string.
 * it uses a URLObject to do this and separate the
 * querystring from the actual URL, so we can see which endpoint is being called.
 *
 * @module router
 * @see {@link dbmanager}
 */

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
    case "/exclude_list":
      resolveExcludePage(response, request);
      break;
    case "/dated_images":
      resolveDatedImages(response, request);
      break;
    case "/slideshow_settings":
      resolveSettingsPage(response, request);
      break;
    case "/settings":
      resolveSettings(response, request.method, urlObject);
      break;
    case "/hasPicture":
      resolveHasPicture(response, request.method, urlObject);
      break;
    case "/get_playlists":
      resolveGetPlaylists(response, request.method);
      break;
    case "/create_list":
      resolveCreateList(response, request, urlObject);
      break;
    case "/set_playlist":
      resolveSetPlaylist(response, request, urlObject);
      break;
    case "/sandbox":
      resolveSandbox(response, request.method);
      break;
    case "/playlistExists":
      resolvePlaylistExists(response, request, urlObject);
      break;
    default:
      resolveOptions(response, request);
      break;
  }
}

function resolveGetPlaylists(response, method) {
  if (method == "GET") {
    getH.getPlaylist(response);
  } else {
    response.writeHead(405, "Method not Allowed");
    response.end();
  }
}

function resolveSetPlaylist(response, request) {
  if (request.method == "GET") {
    getH.setPlaylist(response);
  } else if (request.method == "POST") {
    try {
      routerUtils.postFromPage(request, response, db.setPlaylist, "pictures");
    } catch (err) {
      // TODO: Logging here
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
}

function resolvePlaylistExists(response, request, urlObject) {
  if (request.method == "GET") {
    getH.playlistExists(response, urlObject);
  } else {
    response.writeHead(405, "Method not Allowed");
    response.end();
  }
}

function resolveSandbox(response, method) {
  if (method == "GET") {
    let file = fs.readFileSync("../client/sandbox_page/sandbox.html");
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(file);
    response.end();
  }
}

/**
 * This the endpoint that saves custom lists and displays the Create List page
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 */
function resolveCreateList(response, request) {
  if (request.method == "GET") {
    getH.createList(response);
  } else if (request.method == "POST") {
    try {
      routerUtils.postFromPage(request, response, db.createList, "pictures");
    } catch (err) {
      // TODO: Logging here
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
}

/**
 * This the endpoint that checks if a day has pictures assigned to it
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - Method from the request
 * @param {UrlWithStringQuery} urlObject - The object that contains the route inside the request
 */
function resolveHasPicture(response, method, urlObject) {
  if (method == "GET") {
    getH.hasPicture(response, urlObject);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
}

/**
 * This the endpoint that returns the requested asset back to the client
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 * @param {UrlWithStringQuery} urlObject - The object that contains the route inside the request
 */
function resolveAssets(response, request, urlObject) {
  if (request.method == "GET") {
    var parsedQuerystring = querystring.parse(urlObject.query);
    if (parsedQuerystring.name) {
      if (parsedQuerystring.name.indexOf(".png") !== -1) {
        try {
          if (fs.existsSync(`${assetsFolder}${parsedQuerystring.name}`)) {
            var stream = fs.createReadStream(
              `${assetsFolder}${parsedQuerystring.name}`
            );
            stream.on("open", () => {
              response.setHeader("Content-Type", "image/png");
              stream.pipe(response);
            });
          } else {
            response.writeHead(404, "Not Found");
            response.end();
          }
        } catch (err) {
          // TODO: Logging here
          console.log(err);
          response.writeHead(500, "Internal Server Error");
          response.end();
        }
      } else if (parsedQuerystring.name.indexOf("font") !== -1) {
        var fileName = parsedQuerystring.name.split("font")[1];
        var filePath = `${assetsFolder}/fonts/${fileName}`;

        try {
          if (fs.existsSync(filePath)) {
            if (fileName.indexOf(".ttf") !== -1) {
              var stream = fs.createReadStream(filePath);
              stream.on("open", () => {
                response.setHeader("Content-Type", "application/x-font-ttf");
                stream.pipe(response);
              });
            } else if (fileName.indexOf(".woff") !== -1) {
              var stream = fs.createReadStream(filePath);
              stream.on("open", () => {
                response.setHeader("Content-Type", "application/font-woff");
                stream.pipe(response);
              });
            } else {
              response.writeHead(404, "Not Found");
              response.end();
            }
          } else {
            response.writeHead(404, "Not Found");
            response.end();
          }
        } catch (err) {
          // TODO: Logging here
          console.log(err);
          response.writeHead(500, "Internal Server Error");
          response.end();
        }
      } else if (parsedQuerystring.name.indexOf(".js") !== -1) {
        var fileName = parsedQuerystring.name;
        try {
          if (
            fs.existsSync(`${assetsFolder}scripts/${parsedQuerystring.name}`)
          ) {
            var stream = fs.createReadStream(
              `${assetsFolder}scripts/${parsedQuerystring.name}`
            );
            stream.on("open", () => {
              response.setHeader("Content-Type", "text/javascript");
              stream.pipe(response);
            });
          } else {
            response.writeHead(404, "Not Found");
            response.end();
          }
        } catch (err) {
          // TODO: Logging here
          response.writeHead(500, "Internal Server Error");
          response.end();
        }
      } else if (parsedQuerystring.name.indexOf(".ico") !== -1) {
        try {
          if (fs.existsSync(`${assetsFolder}${parsedQuerystring.name}`)) {
            var stream = fs.createReadStream(
              `${assetsFolder}${parsedQuerystring.name}`
            );
            stream.on("open", () => {
              response.setHeader("Content-Type", "image/x-icon");
              stream.pipe(response);
            });
          } else {
            response.writeHead(404, "Not Found");
            response.end();
          }
        } catch (err) {
          // TODO: Logging here
          response.writeHead(500, "Internal Server Error");
          response.end();
        }
      } else {
        response.writeHead(404, "Not Found");
        response.end();
      }
    } else {
      response.writeHead(400, "Bad Request");
      response.end();
    }
  } else {
    response.writeHead(405, "Method Not Allowed");
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
    if (parsedQuerystring.widgetName && parsedQuerystring.resource) {
      var filePath = `${widgetsFolder}/${parsedQuerystring.widgetName}/${parsedQuerystring.resource}`;
      var contentType;
      try {
        if (fs.existsSync(filePath)) {
          if (parsedQuerystring.resource.includes("js")) {
            contentType = "text/javascript";
          } else if (parsedQuerystring.resource.includes("css")) {
            contentType = "text/css";
          } else if (parsedQuerystring.resource.includes("html")) {
            contentType = "text/html";
          }
          var stream = fs.createReadStream(filePath);
          stream.on("open", () => {
            response.setHeader("Content-Type", contentType);
            stream.pipe(response);
          });
        } else {
          response.writeHead(404, "Not Found");
          response.end();
        }
      } catch (err) {
        // TODO: Logging here
        console.log(err);
        response.writeHead(500, "Internal Server Error");
        response.end();
      }
    } else {
      response.writeHead(400, "Bad Request");
      response.end();
    }
  } else {
    response.writeHead(405, "Method Not Allowed");
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
    try {
      routerUtils.getPage(response);
    } catch (err) {
      // TODO: Logging here
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else {
    response.writeHead(405, "Method Not Allowed");
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
    try {
      routerUtils.getPage(response, "slideshow");
    } catch (err) {
      // TODO: Logging here
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else {
    response.writeHead(405, "Method Not Allowed");
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
    try {
      let images = db.getTodayList();
      headers["Content-Type"] = "application/json";
      response.writeHead(200, headers);
      routerUtils.sendJson(response, { data: images });
    } catch (err) {
      // TODO: Logging here. Also log in the db.getTodayList
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else {
    response.writeHead(405, "Method Not Allowed");
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
    try {
      console.log(parsedQuerystring);
      console.log(parsedQuerystring.name);
      if (parsedQuerystring.name == "empty.jpg") {
        var stream = fs.createReadStream("./data/assets/empty.jpg");
        stream.on("open", () => {
          response.setHeader("Content-Type", "image/jpg");
          stream.pipe(response);
        });
      } else if (parsedQuerystring.name == "500.jpg") {
        var stream = fs.createReadStream("./data/assets/500.jpg");
        stream.on("open", () => {
          response.setHeader("Content-Type", "image/jpg");
          stream.pipe(response);
        });
      } else if (parsedQuerystring.name == "404.jpg") {
        var stream = fs.createReadStream("./data/assets/404.jpg");
        stream.on("open", () => {
          response.setHeader("Content-Type", "image/jpg");
          stream.pipe(response);
        });
      } else if (parsedQuerystring.name) {
        if (fs.existsSync(`${imagesFolder}${parsedQuerystring.name}`)) {
          var stream = fs.createReadStream(
            `${imagesFolder}${parsedQuerystring.name}`
          );
          stream.on("open", () => {
            response.setHeader("Content-Type", "image/jpg");
            stream.pipe(response);
          });
        } else {
          var stream = fs.createReadStream("./data/assets/404.jpg");
          stream.on("open", () => {
            response.setHeader("Content-Type", "image/jpg");
            stream.pipe(response);
          });
        }
      } else {
        response.writeHead(400, "Bad Request");
        response.end();
      }
    } catch (err) {
      // TODO: Whenever we do logging, here's a good place to start
      console.log(err);
      var stream = fs.createReadStream("./data/assets/500.jpg");
      stream.on("open", () => {
        response.setHeader("Content-Type", "image/jpg");
        stream.pipe(response);
      });
    }
  } else {
    response.writeHead(405, "Method Not Allowed");
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
    try {
      routerUtils.postFromPage(request, response, db.pictureList, "pictures");
    } catch (err) {
      // TODO: Logging here
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else {
    response.writeHead(405, "Method Not Allowed");
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
    try {
      routerUtils.getPage(response, "form");
    } catch (err) {
      // TODO: Logging here
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else if (request.method == "POST") {
    try {
      db.insertFormData(request, response);
    } catch (err) {
      // TODO: Logging here
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else {
    response.writeHead(405, "Method Not Allowed");
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
    try {
      routerUtils.getPage(response, "edit_day");
    } catch (err) {
      // TODO: Logging here
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
}

/**
 * This the endpoint that builds a list of images based on a date
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - The method of the request sent by the Client
 */
function resolveDatedImages(response, request) {
  if (request.method == "POST") {
    try {
      let requestData = "";

      request.on("data", function (incomingData) {
        requestData += incomingData;
      });

      request.on("end", () => {
        requestData = JSON.parse(requestData);
        headers["Content-Type"] = "application/json";
        let responseData = {};
        responseData = db.getImageListFromDate(
          requestData["dateType"],
          requestData["dates"]
        );
        response.writeHead(200, headers);
        routerUtils.sendJson(response, { data: responseData });
      });
    } catch (err) {
      // TODO: Logging here
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else if (request.method === "GET") {
    try {
      let datedImages = db.getImageListFromDate();
      headers["Content-Type"] = "application/json";
      response.writeHead(200, headers);
      routerUtils.sendJson(response, { data: datedImages });
    } catch (err) {
      // TODO: Logging here
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
}

/**
 * This the endpoint that resolves the slideshow settings page
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - The method of the request sent by the Client
 */

function resolveSettingsPage(response, request) {
  if (request.method == "GET") {
    try {
      routerUtils.getPage(response, "slideshow_settings");
    } catch (err) {
      // TODO: Logging here
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else if (request.method == "POST") {
    try {
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
          try {
            if (fs.existsSync("./data/settings.json")) {
              fs.writeFileSync("./data/settings.json", JSON.stringify(fields));
              response.writeHead(200, "OK");
              response.end();
            } else {
              response.writeHead(400, "Bad Request");
              response.end();
            }
          } catch (err) {
            // TODO: Logging here
            console.log(err);
            response.writeHead(500, "Internal Server Error");
            response.end();
          }
        }
      });
    } catch (err) {
      // TODO: Logging here. This time most likely we didn't recieve the form at all; Formidable couldn't parse.
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
}

/**
 * This the endpoint that resolves the exclude list page
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - The method of the request sent by the Client
 */
function resolveExcludePage(response, request) {
  if (request.method == "GET") {
    try {
      routerUtils.getPage(response, "exclude_list");
    } catch (err) {
      // TODO: Logging here
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else if (request.method == "POST") {
    try {
      routerUtils.postFromPage(request, response, db.excludeListFromData);
    } catch (err) {
      // TODO: Logging here. Most likely the request broke before it finished.
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else {
    response.writeHead(405, "Method Not Allowed");
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
    try {
      if (fs.existsSync("./data/settings.json")) {
        let settings = fs.readFileSync("./data/settings.json");
        settings = JSON.parse(settings);
        routerUtils.sendJson(response, { data: settings });
      }
    } catch (err) {
      // TODO: Logging here
      console.log(err);
      response.writeHead(500, "Internal Server Error");
      response.end();
    }
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
}

// TODO: Make a proper Options file
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
  } else {
    response.writeHead(405, "Method Not Allowed");
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
    if (request.method == "GET") {
      var name = request.url.split(".")[0];
      var file;
      if (name === "/index") {
        try {
          if (fs.existsSync(`../client${request.url}`)) {
            file = fs.readFileSync(`../client${request.url}`, {
              encoding: "utf8",
            });
          } else {
            response.writeHead(404, "Not Found");
            response.end();
          }
        } catch (err) {
          // TODO: Logging here
          console.log(err);
          response.writeHead(500, "Internal Server Error");
          response.end();
        }
      } else {
        try {
          if (fs.existsSync(`../client${name}_page${request.url}`)) {
            file = fs.readFileSync(`../client${name}_page${request.url}`, {
              encoding: "utf8",
            });
          } else {
            response.writeHead(404, "Not Found");
            response.end();
          }
        } catch (err) {
          // TODO: Logging here
          console.log(err);
          response.writeHead(500, "Internal Server Error");
          response.end();
        }
      }
      response.writeHead(200, { "Content-Type": "text/css" });
      response.write(file);
      response.end();
    } else {
      response.writeHead(405, "Method Not Allowed");
      response.end();
    }
  }
}

/**
 * This the endpoint that handles the request of any JS file of a page (this doesn't include the JS for widgets)
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 */
function js(request, response) {
  if (request.url.indexOf(".js") !== -1 && !request.url.includes("?")) {
    if (request.method == "GET") {
      var name = request.url.split(".")[0];
      var file;
      if (name === "/index") {
        try {
          if (fs.existsSync(`../client${request.url}`)) {
            file = fs.readFileSync(`../client${request.url}`, {
              encoding: "utf8",
            });
          } else {
            response.writeHead(404, "Not Found");
            response.end();
          }
        } catch (err) {
          // TODO: Logging here
          response.writeHead(500, "Internal Server Error");
          response.end();
        }
      } else {
        try {
          if (fs.existsSync(`../client${name}_page${request.url}`)) {
            file = fs.readFileSync(`../client${name}_page${request.url}`, {
              encoding: "utf8",
            });
          } else {
            response.writeHead(404, "Not Found");
            response.end();
          }
        } catch (err) {
          // TODO: Logging here
          console.log(err);
          response.writeHead(500, "Internal Server Error");
          response.end();
        }
      }
      response.writeHead(200, { "Content-Type": "text/javascript" });
      response.write(file);
      response.end();
    } else {
      response.writeHead(405, "Method Not Allowed");
      response.end();
    }
  }
}

module.exports.home = home;
module.exports.css = css;
module.exports.js = js;
