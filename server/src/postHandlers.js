const db = require("./dbmanager");
const ru = require("./routerUtils");
const fs = require("fs");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
  "Access-Control-Max-Age": 2592000, // 30 days
  /** add other headers as per requirement */
};

/** POST Handler methods
 *
 * This module holds the handler methods for the endpoints of the app
 *
 * @module postHandlers
 * @see {@link getHandlers}
 */

/** POST Handler for the /set_playlist, /create_list, /piclist
 *
 * Posting data on the db from the request and closes the response appropiately
 *
 * @param {Request} request - We get the data from here
 * @param {Response} response - We return wether we could/couldn't post the data
 * @param {Function} fn - The function from the db to use when placing the data in
 * @param {String} toFind - The attribute to find when doing the insertion. Most of the times it's pictures
 */

const postList = (request, response, fn, toFind) => {
  try {
    ru.postFromPage(request, response, fn, toFind);
  } catch (err) {
    // TODO: Logging here
    console.log(err);
    response.writeHead(500, "Internal Server Error");
    response.end();
  }
};

/** POST Handler for /upload
 *
 * Posting the form data and file(s) to the backend
 *
 * @param {Request} request - We get the data from here
 * @param {Response} response - We close the request with the response
 */
const upload = (request, response) => {
  try {
    db.insertFormData(request, response);
  } catch (err) {
    // TODO: Logging here
    console.log(err);
    response.writeHead(500, "Internal Server Error");
    response.end();
  }
};

/** POST Handler for /dated_images
 *
 * We're posting a list of pictures with a specific date or set of dates
 *
 * @param {Request} request - We get the pictures to post here
 * @param {Response} response - We close the request with the response
 */
const datedImages = (request, response) => {
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
      ru.sendJson(response, { data: responseData });
    });
  } catch (err) {
    // TODO: Logging here
    console.log(err);
    response.writeHead(500, "Internal Server Error");
    response.end();
  }
};

/** POST Handler for /settings_page
 *
 * We recieve the incoming form to modify the current settings file with it
 *
 * @param {Request} request - We get the form data from here
 * @param {Response} response - We close the request with the response
 */
const settingsPage = (request, response) => {
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
};

module.exports = {
  postList,
  upload,
  datedImages,
  settingsPage,
};
