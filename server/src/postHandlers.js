const db = require("./dbmanager");
const ru = require("./routerUtils");
const querystring = require("querystring");
const fs = require("fs");

/** POST Handler methods
 *
 * This module holds the handler methods for the endpoints of the app
 *
 * @module postHandlers
 * @see {@link getHandlers}
 */

/** POST Handler for the /set_playlist
 *
 * Posting data on the db from the request and closes the response appropiately
 *
 * @param {Request} request - We get the data from here
 * @param {Response} response - We return wether we could/couldn't post the data
 */

const setPlaylist = (request, response) => {
  try {
    ru.postFromPage(request, response, db.setPlaylist, "pictures");
  } catch (err) {
    // TODO: Logging here
    console.log(err);
    response.writeHead(500, "Internal Server Error");
    response.end();
  }
};

module.exports = {
  setPlaylist,
};
