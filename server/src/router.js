const getH = require("./getHandlers");
const { endpoints } = require("./endpoints");
const url = require("url");

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
 * @param {Request} request - The request sent by the Client
 * @param {Response} response - The response that the server will send back to the client
 */
function home(request, response) {
  let urlObject = url.parse(`http://${request.headers.host}${request.url}`);
  let pathname = urlObject.pathname.toString();

  if (endpoints[pathname]) endpoints[pathname](request, response, urlObject);
  else resolveOptions(request, response);
}

// TODO: Make a proper Options file
/**
 * This the endpoint that resolves whenever the options of the web app are requested.
 * Definitively needs more work because this actually does nothing.
 * @param {Response} response - The response that the server will send back to the client
 * @param {XMLHttpRequest} request - The request sent by the Client
 */
const resolveOptions = (request, response) => {
  let headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Max-Age": 2592000,
  };

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
