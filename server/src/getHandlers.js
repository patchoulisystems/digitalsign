const db = require("./dbmanager");
const ru = require("./routerUtils");
const querystring = require("querystring");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
  "Access-Control-Max-Age": 2592000, // 30 days
  /** add other headers as per requirement */
};

/** GET Handlers for the endpoints
 *
 * This module contains the handlers for the GET methods of all endpoints
 * @module getHandlers
 */

/** GET Handler for /get_playlist
 *
 * Sends back the playlists on the response
 *
 * @param {Response} response - The response to send back the playlists
 */

const getPlaylist = (response) => {
  ru.sendJson(response, { playlists: db.playlists() });
};

/** GET Handler for /set_playlist
 *
 * Sends back the set playlist page on the response
 *
 * @param {Response} response - The response to send back the set playlist page
 */

const setPlaylist = (response) => {
  try {
    ru.getPage(response, "set_playlist");
  } catch (err) {
    // TODO: Logging here
    console.log(err);
    response.writeHead(500, "Internal Server Error");
    response.end();
  }
};

/** GET Handler for the /playlistExists
 *
 * Uses the url object to check for a playlist with a given name
 *
 * @param {Response} response - The response used to send back if a playlist exists
 * @param {import("url").UrlWithStringQuery} urlObject - The url object that contains the name of the playlist to check
 */

const playlistExists = (response, urlObject) => {
  let parsedQuerystring = querystring.parse(urlObject.query);
  if (parsedQuerystring.name) {
    ru.sendJson(response, {
      playlistExists: db.listWithName(parsedQuerystring.name),
    });
  } else {
    response.writeHead(400, "Bad Request");
    response.end();
  }
};

/** GET Handler for the /create_list
 *
 * We use the response to send back the create list page
 *
 * @param {Response} response - The response to send back the page
 */

const createList = (response) => {
  try {
    ru.getPage(response, "create_list");
  } catch (err) {
    // TODO: Logging here
    console.log(err);
    response.writeHead(500, "Internal Server Error");
    response.end();
  }
};

/** GET Handler for the /hasPicture
 *
 * Uses the url object to get the requested epoch time, and the response to return the result
 *
 * @param {Response} response - The response used to send back if a day has a picture
 * @param {import("url").UrlWithStringQuery} urlObject - The url object that contains the epoch of the day to check
 */

const hasPicture = (response, urlObject) => {
  let parsedQuerystring = querystring.parse(urlObject.query);
  if (parsedQuerystring.time) {
    let epochTime = parsedQuerystring.time;
    let hasPicture = db.hasPicture(epochTime);
    headers["Content-Type"] = "application/json";
    response.writeHead(200, headers);
    ru.sendJson(response, { data: hasPicture });
  } else {
    response.writeHead(400, "Bad Request");
    response.end();
  }
};

/** GET Handler for the /assets
 *
 * First we parse the querystring from the urlObject, then we check if the querystring has
 * a name and then we check the extension of the name, mostly important for the content type header.
 * After that we're basically on a decision tree that changes the input of the find asset.
 *
 * @param {Response} response - The response
 * @param {import("url").UrlWithStringQuery} urlObject - The urlObject used to parse the querystring from
 */

const assets = (response, urlObject) => {
  /** The parsed query string */
  let qstring = querystring.parse(urlObject.query);
  if (qstring.name) {
    let ct = "";
    let filename = qstring.name;
    let inside = "";
    if (filename.indexOf(".png") !== -1) {
      ct = "image/png";
    } else if (filename.indexOf("font") !== -1) {
      filename = qstring.name.split("font")[1];
      inside = "fonts";
      ct =
        filename.indexOf(".ttf") !== -1
          ? "application/x-font-ttf"
          : "application/font-woff";
    } else if (filename.indexOf(".js") !== -1) {
      inside = "scripts";
      ct = "text/javascript";
    } else if (filename.indexOf(".ico") !== -1) {
      ct = "image/x-icon";
    } else {
      response.writeHead(404, "Not Found");
      return response.end();
    }
    try {
      ru.findFile(response, "asset", filename, ct, inside);
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
};

/** GET Handler for the /widget
 * 
 * Pretty much doing the same as the assets one, just checking if the proper params are on the
 * qstring first and then decision branching to set the correct content type. This one's simpler, because
 * everything's on the same directory as far as widgets go.
 * 
 * @param {Response} response - The response we'll use to send back the widget
 * @param {import("url").UrlWithStringQuery} urlObject - We'll use this to parse the qstring and its params from
 */

const widget = (response, urlObject) => {
  let qstring = querystring.parse(urlObject.query);
  if (qstring.widgetName && qstring.resource) {
    let ct = "text/";
    let filename = qstring.resource;
    let inside = qstring.widgetName;

    if (filename.indexOf(".js") !== -1) {
      ct += "javascript";
    } else if (filename.indexOf(".css") !== -1) {
      ct += "css";
    } else if (filename.indexOf(".html") !== -1) {
      ct += "html";
    } else {
      response.writeHead(404, "Not Found");
      return response.end();
    }

    try {
      ru.findFile(response, "widget", filename, ct, inside);
    } catch (err) {
      // TODO: Logging here
      response.writeHead(500, "Internal Server Error");
      response.end();
    }

  } else {
    response.writeHead(400, "Bad Request");
    response.end();
  }
};

/** GET Handler for / 
 * 
 * Simply returns the index page and sends it on the response
 * 
 * @param {Response} response - The response we use to send the page in
*/

const index = (response) => {
  try {
    ru.getPage(response);
  } catch (err) {
    // TODO: Logging here
    console.log(err);
    response.writeHead(500, "Internal Server Error");
    response.end();
  }
};

/** GET Handler for /today 
 * 
 * Returns the slideshow page on the response
 * 
 * @param {Response} response - We're using the response to send back the page on
*/

const today = (response) => {
  try {
    ru.getPage(response, "slideshow");
  } catch (err) {
    // TODO: Logging here
    console.log(err);
    response.writeHead(500, "Internal Server Error");
    response.end();
  }
};

/** GET Handler for /today_images 
 * 
 * Returns the scheduled pictures for today on the response
 * 
 * @param {Response} response - We're using the response to return the image list
*/

const todayImages = (response) => {
  try {
    let images = db.getTodayList();
    headers["Content-Type"] = "application/json";
    response.writeHead(200, headers);
    ru.sendJson(response, { data: images });
  } catch (err) {
    // TODO: Logging here. Also log in the db.getTodayList
    console.log(err);
    response.writeHead(500, "Internal Server Error");
    response.end();
  }
};

/** GET Handler for /image
 * 
 * A lot is happening so I'll type the comment as I go
 * 
 * @param {Response} response - The response we use to pipe the image to
 * @param {import("url").UrlWithStringQuery} urlObject - The object where the querystring will be parsed from
*/

const image = (response, urlObject) => {
  let qstring = querystring.parse(urlObject.query);
  if (qstring.name) {
    let inside = "";
    let ct = "image/jpg";
    let filename = qstring.name;
    let dir = "";
    // A switch is faster than an if/else. I know, we don't have that many cases but
    // stil, if we can use a switch here and it is faster than if/else then might
    // as well, right?
    switch (qstring.name) {
      case "empty.jpg":
      case "500.jpg":
      case "404.jpg":
        dir = "asset";
        break;
      default:
        dir = "images";
        break;
    }
    try {
      ru.findFile(response, dir, filename, ct, inside);
    } catch (err) {
      // TODO: Logging here. Also log in the db.getTodayList
      console.log(err);
      ru.findFile(response, "asset", "500.jpg", ct, "");
    }
  } else {
    response.writeHead(400, "Bad Request");
    response.end();
  }
};

module.exports = {
  getPlaylist,
  setPlaylist,
  playlistExists,
  createList,
  hasPicture,
  assets,
  widget,
  index,
  today,
  todayImages,
  image,
};
