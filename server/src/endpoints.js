const getH = require("./getHandlers");
const postH = require("./postHandlers");
const resolveIndex = (request, response) => {
  if (request.method == "GET") {
    getH.index(response);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

const resolveToday = (request, response) => {
  if (request.method == "GET") {
    getH.today(response);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

const resolveTodayImages = (request, response) => {
  if (request.method == "GET") {
    getH.todayImages(response);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

const resolveImage = (request, response, urlObject) => {
  if (request.method == "GET") {
    getH.image(response, urlObject);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

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

const resolveHasPicture = (request, response, urlObject) => {
  if (request.method == "GET") {
    getH.hasPicture(response, urlObject);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

const resolveIncludeList = (request, response) => {
  if (request.method == "GET") {
    getH.includeList(response);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

const resolveGetPlaylists = (request, response) => {
  if (request.method == "GET") {
    getH.getPlaylists(response);
  } else {
    response.writeHead(405, "Method not Allowed");
    response.end();
  }
};

const resolvePictureList = (request, response) => {
  if (request.method === "POST") {
    postH.postList(request, response, db.pictureList, "pictures");
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

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

const resolvePlaylistExists = (request, response, urlObject) => {
  if (request.method == "GET") {
    getH.playlistExists(response, urlObject);
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

const resolveSlideshowSettings = (request, response) => {
  if (request.method == "GET") {
    getH.settingsPage(response);
  } else if (request.method == "POST") {
    postH.settingsPage(request, response);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

const resolveSettings = (request, response) => {
  if (request.method == "GET") {
    getH.settings(response);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

const resolveAssets = (request, response, urlObject) => {
  if (request.method == "GET") {
    getH.assets(response, urlObject);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

const resolveWidget = (request, response, urlObject) => {
  if (request.method == "GET") {
    getH.widget(response, urlObject);
  } else {
    response.writeHead(405, "Method Not Allowed");
    response.end();
  }
};

const mapEndpointsToResolvers = {
  "/": resolveIndex,
  "/slideshow": resolveToday,
  "/todayImages": resolveTodayImages,
  "/image": resolveImage,
  "/upload": resolveUpload,
  "/hasPicture": resolveHasPicture,
  "/include_list": resolveIncludeList,
  "/getPlaylists": resolveGetPlaylists,
  "/pictureList": resolvePictureList,
  "/exclude_list": resolveExcludePage,
  "/datedImages": resolveDatedImages,
  "/create_list": resolveCreateList,
  "/playlistExists": resolvePlaylistExists,
  "/set_playlist": resolveSetPlaylist,
  "/slideshow_settings": resolveSlideshowSettings,
  "/settings": resolveSettings,
  "/assets": resolveAssets,
  "/widget": resolveWidget,
};

module.exports.endpoints = mapEndpointsToResolvers;
