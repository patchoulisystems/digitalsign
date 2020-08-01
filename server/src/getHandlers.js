const db = require("./dbmanager");
const ru = require("./routerUtils");
const querystring = require("querystring");

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
 * @param {UrlWithStringQuery} urlObject - The url object that contains the name of the playlist to check
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
    routerUtils.getPage(response, "create_list");
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
 * @param {UrlWithStringQuery} urlObject - The url object that contains the epoch of the day to check
 */

const hasPicture = (response, urlObject) => {
  let parsedQuerystring = querystring.parse(urlObject.query);
  if (parsedQuerystring.time) {
    let epochTime = parsedQuerystring.time;
    let hasPicture = db.hasPicture(epochTime);
    headers["Content-Type"] = "application/json";
    response.writeHead(200, headers);
    routerUtils.sendJson(response, { data: hasPicture });
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
 * @param {UrlWithStringQuery} urlObject - The urlObject used to parse the querystring from
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
      ru.findAsset(response, filename, ct, inside);
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

const widget = (response, urlObject) => {};

module.exports = {
  getPlaylist,
  setPlaylist,
  playlistExists,
  createList,
  hasPicture,
  assets,
};
