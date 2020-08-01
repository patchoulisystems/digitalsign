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

const resolveGetPlaylists = (request, response) => {
  if (request.method == "GET") {
    getH.getPlaylist(response);
  } else {
    response.writeHead(405, "Method not Allowed");
    response.end();
  }
};

const resolveSetPlaylist = (request, response) => {
  if (request.method == "GET") {
    getH.setPlaylist(response);
  } else if (request.method == "POST") {
    postH.postList(request, response, db.setPlaylist, "pictures");
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

const resolvePlaylistExists = (request, response, urlObject) => {
  if (request.method == "GET") {
    getH.playlistExists(response, urlObject);
  } else {
    response.writeHead(405, "Method not Allowed");
    response.end();
  }
};

const resolveSandbox = (request, response) => {
  if (request.method == "GET") {
    let file = fs.readFileSync("../client/sandbox_page/sandbox.html");
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(file);
    response.end();
  }
};

/**
 * This the endpoint that saves custom lists and displays the Create List page
 * @param {Request} request - The request sent by the Client
 * @param {Response} response - The response that the server will send back to the client
 */
const resolveCreateList = (request, response) => {
  if (request.method == "GET") {
    getH.createList(response);
  } else if (request.method == "POST") {
    postH.postList(request, response, db.createList, "pictures");
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

/**
 * This the endpoint that checks if a day has pictures assigned to it
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - Method from the request
 * @param {UrlWithStringQuery} urlObject - The object that contains the route inside the request
 */
const resolveHasPicture = (request, response, urlObject) => {
  if (request.method == "GET") {
    getH.hasPicture(response, urlObject);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

/**
 * This the endpoint that returns the requested asset back to the client
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 * @param {UrlWithStringQuery} urlObject - The object that contains the route inside the request
 */
const resolveAssets = (request, response, urlObject) => {
  if (request.method == "GET") {
    getH.assets(response, urlObject);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

/**
 * This the endpoint that returns the requested widget (or related file) back to the client
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 * @param {URLWithStringQuery} urlObject - The object that contains the route inside the request
 */
const resolveWidget = (request, response, urlObject) => {
  if (request.method == "GET") {
    getH.widget(response, urlObject);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

/**
 * This the endpoint that resolves the Index page
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - The method of the request sent by the Client
 */
const resolveIndex = (request, response) => {
  if (request.method == "GET") {
    getH.index(response);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

/**
 * This the endpoint that resolves the Slideshow page
 * @param {XMLHttpRequest} request - The request sent by the Client
 * @param {Response} response - The response that the server will send back to the client
 */
const resolveToday = (request, response) => {
  if (request.method == "GET") {
    getH.today(response);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

/**
 * This the endpoint that handles the query of the list of the images for the day
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - The method of the request sent by the Client
 */
const resolveTodayImages = (request, response) => {
  if (request.method == "GET") {
    getH.todayImages(response);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

/**
 * This the endpoint that handles the query for an image
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 * @param {URLWithStringQuery} urlObject - The object that contains the route inside the request
 */
const resolveImage = (request, response, urlObject) => {
  if (request.method == "GET") {
    getH.image(response, urlObject);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

/**
 * This the endpoint that takes a list of pictures and sets it to a passed date interval, or set of dates
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 */
const resolvePictureList = (request, response) => {
  if (request.method === "POST") {
    postH.postList(request, response, db.pictureList, "pictures");
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

/**
 * This the endpoint that handles an incoming form with a set of pictures
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 */
const resolveUpload = (request, response) => {
  if (request.method == "GET") {
    getH.upload(response);
  } else if (request.method == "POST") {
    postH.upload(request, response);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

/**
 * This the endpoint that resolves the Date Edit page
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 */
const resolveEditDay = (request, response) => {
  if (request.method == "GET") {
    getH.editDay(response);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

/**
 * This the endpoint that builds a list of images based on a date
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - The method of the request sent by the Client
 */
const resolveDatedImages = (request, response) => {
  if (request.method === "GET") {
    getH.datedImages(response);
  } else if (request.method == "POST") {
    postH.datedImages(request, response);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

/**
 * This the endpoint that resolves the slideshow settings page
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - The method of the request sent by the Client
 */

const resolveSettingsPage = (request, response) => {
  if (request.method == "GET") {
    getH.settingsPage(response);
  } else if (request.method == "POST") {
    postH.settingsPage(request, response);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

/**
 * This the endpoint that resolves the exclude list page
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - The method of the request sent by the Client
 */
const resolveExcludePage = (request, response) => {
  if (request.method == "GET") {
    getH.excludePage(response);
  } else if (request.method == "POST") {
    postH.postList(request, response, db.excludeListFromData);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

/**
 * This the endpoint that resolves the settings file
 * @param {Response} response - The response that the server will send back to the client
 * @param {String} method - The method of the request sent by the Client
 */
const resolveSettings = (request, response) => {
  if (request.method == "GET") {
    getH.settings(response);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

// TODO: Make a proper Options file
/**
 * This the endpoint that resolves whenever the options of the web app are requested.
 * Definitively needs more work because this actually does nothing.
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 */
const resolveOptions = (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(200, headers);
    response.end();
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

/**
 * This the endpoint that handles the request of any CSS file of a page (this doesn't include the CSS for widgets)
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 */
const css = (request, response) => {
  if (request.url.indexOf(".css") !== -1 && !request.url.includes("?")) {
    if (request.method == "GET") {
      getH.resources(request, response);
    } else {
      response.writeHead(405, "Method Not Allowed");
      response.end();
    }
  }
};

/**
 * This the endpoint that handles the request of any JS file of a page (this doesn't include the JS for widgets)
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 */
const js = (request, response) => {
  if (request.url.indexOf(".js") !== -1 && !request.url.includes("?")) {
    if (request.method == "GET") {
      getH.resources(request, response);
    } else {
      response.writeHead(405, "Method Not Allowed");
      response.end();
    }
  }
};

module.exports.home = home;
module.exports.css = css;
module.exports.js = js;
