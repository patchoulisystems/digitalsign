const fs = require("fs");
const formidable = require("formidable");
const path = require("path");
const { nanoid } = require("nanoid");
const moment = require("moment");

const imagesFolder = "./data/images/";
const dbLocation = "./data/db.json";
let db;

try {
  if (fs.existsSync(dbLocation)) {
    db = fs.readFileSync(dbLocation);
    db = JSON.parse(db);
  }
} catch (err) {
  // TODO: Logging here
  console.log(err);
}

const getDate = (str, noFormat) => {
  return moment(str || new Date(), !noFormat ? "YYYY-MM-DD" : null).set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
};

const getTodayImages = () => {
  var today = getDate();
  var filesList = [];
  try {
    files = fs.readdirSync(imagesFolder, []);
  } catch (err) {
    // TODO: Loggin here
    console.log(err);
    return ["500.jpg"];
  }

  // Appending images scheduled for today to the created list
  files.forEach((image) => {
    var dateType = db.entries[image].dateType.trim();
    if (dateType == "interval") {
      var parsedDates = db.entries[image].dates.split(" - ");
      let leftmostDay = getDate(parsedDates[0]);
      let rightmostDay = getDate(parsedDates[1]);
      if (leftmostDay <= today || today <= rightmostDay) {
        filesList.push(image);
      }
    } else if (dateType == "multiple") {
      db.entries[image].dates.split(",").forEach((date) => {
        var aDay = getDate(date);
        if (aDay == today) {
          filesList.push(image);
        }
      });
    }
  });
  return filesList;
};

const getTodayIncludeList = () => {
  var includeList = [];
  var today = getDate();
  var builtLists = Array.from(Object.keys(db.metadata["builtLists"]));
  builtLists.forEach((list) => {
    let listDate = db.metadata["builtLists"][list]["dates"];
    let listDateType = db.metadata["builtLists"][list]["dateType"];
    let listPictures = db.metadata["builtLists"][list]["pictures"];
    if (listDateType == "interval") {
      let parsedDates = listDate.split(" - ");
      let leftmostDay = getDate(parsedDates[0]);
      let rightmostDay = getDate(parsedDates[1]);
      if (leftmostDay <= today && today <= rightmostDay) {
        listPictures.forEach((picture) => {
          if (!includeList.includes(picture.toString())) {
            includeList.push(picture);
          }
        });
      }
    } else {
      let parsedDates = listDate.split(",");
      parsedDates.forEach((date) => {
        let thisListDay = getDate();
        if (today == thisListDay) {
          listPictures.forEach((picture) => {
            if (!includeList.includes(picture)) {
              includeList.push(picture);
            }
          });
        }
      });
    }
  });
  return includeList;
};

const insertCreatedToList = (currentList, todayList) => {
  var today = getDate();
  if (currentList.dateType == "interval") {
    let parsedDates = currentList.dates.split(" - ");
    let leftmostDay = getDate(parsedDates[0]);
    let rightmostDay = getDate(parsedDates[1]);
    if (leftmostDay <= today && today <= rightmostDay) {
      currentList.pictures.forEach((picture) => {
        if (!todayList.includes(picture.toString())) {
          todayList.push(picture);
        }
      });
    }
  } else {
    currentList.dates.split(",").forEach((date) => {
      var aDay = getDate(date);
      if (aDay == today) {
        todayList = todayList.concat(
          currentList.pictures.filter((picture) => !todayList.includes(picture))
        );
      }
    });
  }
};

const getScheduled = (item) => {
  var today = getDate();
  if (item.dateType == "interval") {
    var parsedDates = item.dates.split(" - ");
    var leftmostDay = getDate(parsedDates[0]);
    var rightmostDay = getDate(parsedDates[1]);
    if (leftmostDay <= today && today <= rightmostDay) {
      return item.pictures;
    }
  } else {
    item.dates.split(",").forEach((date) => {
      var aDay = getDate(date);
      if (aDay == today) {
        return item.pictures;
      }
    });
  }
  return [];
};

// TODO: Optimize this
const buildToday = (playlist) => {
  var todayList = [];
  var createdLists = db.metadata.createdLists;
  var today = getDate();

  // We'll use this in the set list attribute, whenever the list has
  // no date
  if (playlist) {
    console.log("Playlist recieved in the buildToday", playlist);
    todayList = playlist.pictures;
    // JSON parse doesn't parse the word false as the boolean value false
    if (playlist.concat == "true") {
      console.log("Is it true?");
      // We do our magic here
      todayList = todayList.concat(
        getTodayImages().filter((el) => !todayList.includes(el))
      );

      // Appending included lists scheduled for today
      todayList = todayList.concat(
        getTodayIncludeList().filter((el) => !todayList.includes(el))
      );
      // Excluding scheduled pictures to be excluded. Should we add that option as well?
      todayList = filterExclude(todayList, today);
    }
  } else {
    for (const list in createdLists) {
      let currentList = createdLists[list];
      let images = getScheduled(currentList);
      if (images.length) {
        insertCreatedToList(currentList, todayList);
        if (currentList.concat == "true") {
          // We do our magic here
          todayList = todayList.concat(
            getTodayImages().filter((el) => !todayList.includes(el))
          );

          // Appending included lists scheduled for today
          todayList = todayList.concat(
            getTodayIncludeList().filter((el) => !todayList.includes(el))
          );
          // Excluding scheduled pictures to be excluded. Should we add that option as well?
          todayList = filterExclude(todayList, today);
        }
      }
      console.log("Current List", currentList);
    }
  }

  db.metadata["todayList"] = todayList;
  db.metadata["dateBuilt"] = today;
  let jsonData = JSON.stringify(db);
  try {
    if (fs.existsSync(dbLocation)) {
      fs.writeFileSync(dbLocation, jsonData);
    }
  } catch (err) {
    // TODO: Logging here
    console.log(err);
    return ["500.jpg"];
  }
  return todayList.length == 0 ? ["empty.jpg"] : todayList;
};

const playlists = () => {
  return db.metadata["createdLists"];
};

const listWithName = (name) => {
  let playlistNamesList = Object.keys(db.metadata["createdLists"]);
  return playlistNamesList.includes(name);
};

const setPlaylist = (data) => {
  let playlist = data;
  let noDates = false;
  if (playlist.dateType.length <= 0 || playlist.dates.length <= 0) {
    noDates = true;
    let today = getDate();

    playlist = {
      ...playlist,
      dateType: "multiple",
      dates: `${
        today.getMonth() + 1
      }-${today.getDate()}-${today.getFullYear()}`,
    };
  }
  noDates ? buildToday(playlist) : buildToday();
  createList(playlist);
};

const createList = (data) => {
  let listName = data.listName;
  db.metadata.createdLists[listName] = data;
  let jsonData = JSON.stringify(db);
  let today = getDate();
  if (data.dateType == "interval") {
    var parsedDates = data.dates.split(" - ");
    let leftmostDay = getDate(parsedDates[0]);
    let rightmostDay = getDate(parsedDates[1]);
    if (leftmostDay <= today || today <= rightmostDay) {
      buildToday(data);
    }
  } else if (data.dateType == "multiple") {
    data.dates.split(",").forEach((date) => {
      var aDay = getDate(date);
      if (aDay == today) {
        buildToday(data);
      }
    });
  }
  try {
    if (fs.existsSync(dbLocation)) {
      fs.writeFileSync(dbLocation, jsonData);
    }
  } catch (err) {
    // TODO: Logging here
    console.log(err);
  }
};

const hasPicture = (epochTime) => {
  var result = "none";
  let done = false;

  if (epochTime) {
    var incomingDate = getDate(parseInt(epochTime), true);
    // First check if there's a picture with that date
    if (!done)
      for (const imageKey in db.entries) {
        const currentImage = db.entries[imageKey];
        if (currentImage.dateType == "interval" && !done) {
          let parsedDates = currentImage.dates.split(" - ");
          let leftmostDay = getDate(parsedDates[0]);
          let rightmostDay = getDate(parsedDates[1]);
          if (leftmostDay <= incomingDate && incomingDate <= rightmostDay) {
            result = "one";
            done = true;
          }
        } else if (currentImage.dateType == "multiple" && !done) {
          let imageDatesString = currentImage.dates.split(",");
          if (!done)
            imageDatesString.forEach((date) => {
              let aDay = getDate(date);
              if (aDay == incomingDate) {
                result = "one";
                done = true;
              }
            });
        }
      }
    // Then a list with that date (from the include list)
    if (!done)
      for (const listKey in db.metadata.builtLists) {
        const currentList = db.metadata.builtLists[listKey];
        if (currentList.dateType == "interval" && !done) {
          let parsedDates = currentList.dates.split(" - ");
          let leftmostDay = getDate(parsedDates[0]);
          let rightmostDay = getDate(parsedDates[1]);

          if (leftmostDay <= incomingDate && incomingDate <= rightmostDay) {
            result = "one";
            done = true;
          }
        } else if (currentList.dateType == "multiple" && !done) {
          let listDatesString = currentList.dates.split(",");
          if (!done)
            listDatesString.forEach((date) => {
              let aDay = getDate(date);
              if (aDay == incomingDate) {
                result = "one";
                done = true;
              }
            });
        }
      }
  }

  return result;
};

const getTodayList = () => {
  var today = getDate();
  var built = getDate(db.metadata["dateBuilt"]);

  console.log(today);
  console.log(built);

  if (built < today) {
    console.log("Building");
    return buildToday();
  } else {
    console.log("Built");
    return db.metadata["todayList"];
  }
};

const filterExclude = (list, today) => {
  let resultList = list;
  if (db.metadata["builtExcludeLists"]) {
    for (const excludeList in db.metadata["builtExcludeLists"]) {
      const currentExcludeList = db.metadata["builtExcludeLists"][excludeList];
      if (currentExcludeList.dateType == "interval") {
        let parsedDates = currentExcludeList.dates.split(" - ");
        let leftmostDay = getDate(parsedDates[0]);
        let rightmostDay = getDate(parsedDates[1]);
        if (leftmostDay <= today && today <= rightmostDay) {
          resultList = resultList.filter(
            (picture) => !currentExcludeList.pictures.includes(picture)
          );
        }
      } else if (currentExcludeList.dateType == "multiple") {
        currentExcludeList.dates.split(",").forEach((date) => {
          let aDay = getDate(date);
          if (aDay == today) {
            resultList = resultList.filter(
              (picture) => !currentExcludeList.pictures.includes(picture)
            );
          }
        });
      }
    }
  }
  return resultList;
};

const getImageListFromDate = (dateType, dateString) => {
  let imageList = [];
  console.log("Date string is " + dateString);
  console.log("Date type is " + dateType);

  // Same deal like with build today
  let allImagesList = Object.keys(db.entries);
  if (dateType == "interval") {
    // Parsing dateString to proper dates
    let parsedDates = dateString.split(" - ");
    let lowerDate = getDate(parsedDates[0]);
    let greaterDate = getDate(parsedDates[1]);

    allImagesList.forEach((image) => {
      if (db.entries[image].dateType.trim() == "interval") {
        let imageParsedDates = db.entries[image].dates.split(" - ");
        let imageLowestDate = getDate(imageParsedDates[0]);
        let imageGreaterDate = getDate(imageParsedDates[1]);

        if (
          (imageLowestDate <= lowerDate && lowerDate <= imageGreaterDate) ||
          (imageLowestDate <= greaterDate &&
            greaterDate <= imageGreaterDate &&
            !imageList.includes(image))
        ) {
          imageList.push(image);
        }
      } else if (db.entries[image].dateType.trim() == "multiple") {
        let imageDates = db.entries[image].dates.split(",");
        imageDates.forEach((date) => {
          let imageDate = getDate(date);
          if (
            lowerDate <= imageDate &&
            imageDate <= greaterDate &&
            !imageList.includes(image)
          ) {
            imageList.push(image);
          }
        });
      }
    });
  } else if (dateType == "multiple") {
    let incomingDates = dateString.split(",");
    incomingDates.forEach((date) => {
      let incomingDate = getDate(date);
      allImagesList.forEach((image) => {
        if (db.entries[image].dateType == "interval") {
          let parsedDates = db.entries[image].dates.split(" - ");
          let imageLowestDate = getDate(parsedDates[0]);
          let imageGreaterDate = getDate(parsedDates[1]);

          if (
            imageLowestDate <= incomingDate &&
            incomingDate <= imageGreaterDate &&
            !imageList.includes(image)
          ) {
            imageList.push(image);
          }
        } else if (db.entries[image].dateType == "multiple") {
          db.entries[image].dates.split(",").forEach((imageDate) => {
            let entryDate = getDate(imageDate);
            if (incomingDate == entryDate && !imageList.includes(image)) {
              imageList.push(image);
            }
          });
        }
      });
    });
  } else {
    imageList = allImagesList;
  }
  return imageList;
};

const removeFromExcludeds = (data) => {
  for (const excludeList in db.metadata["builtExcludeLists"]) {
    let currentExcludeList = db.metadata["builtExcludeLists"][excludeList];

    if (currentExcludeList.dateType == "interval") {
      let parsedDates = currentExcludeList.dates.split(" - ");
      let leftmostDay = getDate(parsedDates[0]);
      let rightmostDay = getDate(parsedDates[1]);
      if (data.dateType == "interval") {
        let parsedIncomingDates = data.dates.split(" - ");
        let leftmostIncomingDay = getDate(parsedIncomingDates[0]);
        let rightmostIncomingDay = getDate(parsedIncomingDates[1]);
        if (
          (leftmostDay <= leftmostIncomingDay &&
            leftmostIncomingDay <= rightmostDay) ||
          (leftmostDay <= rightmostIncomingDay &&
            rightmostIncomingDay <= rightmostDay)
        ) {
          currentExcludeList.pictures = currentExcludeList.pictures.filter(
            (excludedPicture) => !data.pictures.includes(excludedPicture)
          );
        }
      } else if (data.dateType == "multiple") {
        data.dates.split(",").forEach((date) => {
          let aDay = getDate(date);
          if (leftmostDay <= aDay && aDay <= rightmostDay) {
            currentExcludeList.pictures = currentExcludeList.pictures.filter(
              (excludedPicture) => !data.pictures.includes(excludedPicture)
            );
          }
        });
      }
    } else if (currentExcludeList.dateType == "multiple") {
      currentExcludeList.dates.split(",").forEach((date) => {
        let aDay = getDate(date);
        if (data.dateType == "interval") {
          let parsedIncomingDates = data.dates.split(" - ");
          let leftmostIncomingDay = getDate(parsedIncomingDates[0]);
          let rightmostIncomingDay = getDate(parsedIncomingDates[1]);
          if (leftmostIncomingDay <= aDay && aDay <= rightmostIncomingDay) {
            currentExcludeList.pictures = currentExcludeList.pictures.filter(
              (excludedPicture) => !data.pictures.includes(excludedPicture)
            );
          }
        } else if (data.dateType == "multiple") {
          data.dates.split(",").forEach((incomingDate) => {
            let incomingDay = getDate(incomingDate);

            if (aDay == incomingDay) {
              currentExcludeList.pictures = currentExcludeList.pictures.filter(
                (excludedPicture) => !data.pictures.includes(excludedPicture)
              );
            }
          });
        }
      });
    }
    db.metadata["builtExcludeLists"][excludeList] = currentExcludeList;
  }
};

const pictureList = (data) => {
  removeFromExcludeds(data);
  let listName = `list${db.metadata["builtListsNumber"]}`;
  db.metadata["builtLists"][listName] = data;
  db.metadata["builtListsNumber"]++;
  let jsonData = JSON.stringify(db);
  try {
    if (fs.existsSync(dbLocation)) {
      fs.writeFileSync(dbLocation, jsonData);
    }
  } catch (err) {
    // TODO: Logging here
    console.log(err);
  }
};

const insertFormData = (request, response) => {
  let form = new formidable.IncomingForm({ multiples: true });
  let today = getDate();
  form.keepExtensions = true;

  form.parse(request, (error, fields, files) => {
    if (
      !fields.firstname ||
      !fields.lastname ||
      !fields.studentid ||
      !fields.dates ||
      !files.picture
    ) {
      response.writeHead(400, "Bad Request");
      response.end();
    } else {
      // So we do the map here, for each image to insert
      try {
        // Multiple File
        files.picture.forEach((file) => {
          var imageToInsert = savePicture(file);
          if (imageToInsert) {
            db.entries[imageToInsert] = {
              firstname: fields.firstname,
              lastname: fields.lastname,
              studentid: fields.studentid,
              dateType: fields.radio,
              dates: fields.dates,
              pictureName: imageToInsert,
            };
            db.metadata["imageNumber"]++;
          } else {
            response.writeHead(500, "Internal Server Error");
            response.end();
          }
        });
      } catch (error) {
        if (error instanceof TypeError) {
          // Single File
          var imageToInsert = savePicture(files.picture);
          db.entries[imageToInsert] = {
            firstname: fields.firstname,
            lastname: fields.lastname,
            studentid: fields.studentid,
            dateType: fields.radio,
            dates: fields.dates,
            pictureName: imageToInsert,
          };
          db.metadata["imageNumber"]++;
        }
      }
      let jsonData = JSON.stringify(db);
      try {
        if (fs.existsSync(dbLocation)) {
          fs.writeFileSync(dbLocation, jsonData);
        }
      } catch (err) {
        // TODO: Logging here
        console.log(err);
      }

      if (fields.radio == "interval") {
        var parsedDates = fields.dates.split(" - ");
        var leftmostDay = getDate(parsedDates[0]);
        var rightmostDay = getDate(parsedDates[1]);
        if (leftmostDay <= today || today <= rightmostDay) {
          buildToday();
        }
      } else if (fields.radio == "multiple") {
        var hasToday = false;
        fields.dates.split(",").forEach((date) => {
          var aDay = getDate(date);
          if (aDay == today) {
            hasToday = true;
          }
        });
        if (hasToday) {
          buildToday();
        }
      }
      response.writeHead(200, "OK");
      response.end();
    }
  });
};

const savePicture = (file) => {
  var oldPath = file.path;
  const id = nanoid();
  var extension = path.extname(oldPath);
  var fileName = `${id}${extension}`;
  var newPath = `${imagesFolder}/${fileName}`;

  try {
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
    }
  } catch (err) {
    // TODO: Logging here
    console.log(err);
    return "";
  }

  return fileName;
};

const excludeListFromData = (data) => {
  let excludeListName = `excludeList${db.metadata["builtExcludeListsNumber"]}`;
  db.metadata["builtExcludeLists"][excludeListName] = data;
  db.metadata["builtExcludeListsNumber"]++;
  let jsonData = JSON.stringify(db);
  try {
    if (fs.existsSync(dbLocation)) {
      fs.writeFileSync(dbLocation, jsonData);
    }
  } catch (err) {
    // TODO: Logging here
    console.log(err);
  }
};

// TODO: Solve this
const initialize = () => {
  fs.readdir(imagesFolder, (err, files) => {
    files.forEach((image) => {
      db.entries[image] = {
        firstname: "Vladimir",
        lastname: "Ventura",
        studentid: "00301144",
        dateType: "interval",
        dates: "2020-01-01 - 2020-12-31",
        pictureName: image,
      };
    });
    let jsonData = JSON.stringify(db);
    try {
      if (fs.existsSync(dbLocation)) {
        fs.writeFileSync(dbLocation, jsonData);
      }
    } catch (err) {
      // TODO: Logging here
      console.log(err);
    }
  });
};

module.exports.getTodayList = getTodayList;
module.exports.insertFormData = insertFormData;
module.exports.getImageListFromDate = getImageListFromDate;
module.exports.pictureList = pictureList;
module.exports.excludeListFromData = excludeListFromData;
module.exports.hasPicture = hasPicture;
module.exports.createList = createList;
module.exports.listWithName = listWithName;
module.exports.playlists = playlists;
module.exports.setPlaylist = setPlaylist;
