const getH = require("./getHandlers");
const postH = require("./postHandlers");
const fs = require("fs");
const url = require("url");
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
      resolveAssets(request, response, urlObject);
      break;
    case "/widget":
      resolveWidget(request, response, urlObject);
      break;
    case "/":
      resolveIndex(request, response);
      break;
    case "/today":
      resolveToday(request, response);
      break;
    case "/today_images":
      resolveTodayImages(request, response);
      break;
    case "/image":
      resolveImage(request, response, urlObject);
      break;
    case "/piclist":
      resolvePictureList(request, response);
      break;
    case "/upload":
      resolveUpload(request, response);
      break;
    case "/edit_day":
      resolveEditDay(request, response);
      break;
    case "/exclude_list":
      resolveExcludePage(request, response);
      break;
    case "/dated_images":
      resolveDatedImages(request, response);
      break;
    case "/slideshow_settings":
      resolveSettingsPage(request, response);
      break;
    case "/settings":
      resolveSettings(request, response, urlObject);
      break;
    case "/hasPicture":
      resolveHasPicture(request, response, urlObject);
      break;
    case "/get_playlists":
      resolveGetPlaylists(request, response);
      break;
    case "/create_list":
      resolveCreateList(request, response, urlObject);
      break;
    case "/set_playlist":
      resolveSetPlaylist(request, response, urlObject);
      break;
    case "/sandbox":
      resolveSandbox(request, response);
      break;
    case "/playlistExists":
      resolvePlaylistExists(request, response, urlObject);
      break;
    default:
      resolveOptions(request, response);
      break;
  }
}

function resolveGetPlaylists(request, response) {
  if (request.method == "GET") {
    getH.getPlaylist(response);
  } else {
    response.writeHead(405, "Method not Allowed");
    response.end();
  }
}

function resolveSetPlaylist(request, response) {
  if (request.method == "GET") {
    getH.setPlaylist(response);
  } else if (request.method == "POST") {
    postH.setPlaylist(request, response);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
}

function resolvePlaylistExists(request, response, urlObject) {
  if (request.method == "GET") {
    getH.playlistExists(response, urlObject);
  } else {
    response.writeHead(405, "Method not Allowed");
    response.end();
  }
}

function resolveSandbox(request, response) {
  if (request.method == "GET") {
    let file = fs.readFileSync("../client/sandbox_page/sandbox.html");
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(file);
    response.end();
  }
}

/**
 * This the endpoint that saves custom lists and displays the Create List page
 * @param {Request} request - The request sent by the Client
 * @param {Response} response - The response that the server will send back to the client
 */
function resolveCreateList(request, response) {
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
function resolveHasPicture(request, response, urlObject) {
  if (request.method == "GET") {
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
function resolveAssets(request, response, urlObject) {
  if (request.method == "GET") {
    getH.assets(response, urlObject);
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
function resolveWidget(request, response, urlObject) {
  if (request.method == "GET") {
    getH.widget(response, urlObject);
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
function resolveIndex(request, response) {
  if (request.method == "GET") {
    getH.index(response);
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
    getH.today(response);
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
function resolveTodayImages(request, response) {
  if (request.method == "GET") {
    getH.todayImages(response);
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
function resolveImage(request, response, urlObject) {
  if (request.method == "GET") {
    getH.image(response, urlObject);
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
function resolvePictureList(request, response) {
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
function resolveUpload(request, response) {
  if (request.method == "GET") {
    getH.upload(response);
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
function resolveEditDay(request, response) {
  if (request.method == "GET") {
    getH.editDay(response);
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
function resolveDatedImages(request, response) {
  if (request.method === "GET") {
    getH.datedImages(response);
  } else if (request.method == "POST") {
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

function resolveSettingsPage(request, response) {
  if (request.method == "GET") {
    getH.settingsPage(response);
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
function resolveExcludePage(request, response) {
  if (request.method == "GET") {
    getH.excludePage(response);
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
function resolveSettings(request, response) {
  if (request.method == "GET") {
    getH.settings(response);
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
function resolveOptions(request, response) {
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
      getH.resources(request, response);
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
      getH.resources(request, response);
    } else {
      response.writeHead(405, "Method Not Allowed");
      response.end();
    }
  }
}

module.exports.home = home;
module.exports.css = css;
module.exports.js = js;
