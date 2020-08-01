const db = require("./dbmanager");
const ru = require("./routerUtils");
const querystring = require("querystring");

const getPlaylist = (response) => {
  ru.sendJson(response, { playlists: db.playlists() });
};

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

module.exports = {
  getPlaylist,
  setPlaylist,
  playlistExists,
  createList,
};
