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

const playlistExists = (response) => {};

module.exports = {
  getPlaylist,
  setPlaylist,
};
