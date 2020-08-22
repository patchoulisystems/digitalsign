const fs = require("fs");
const formidable = require("formidable");
const path = require("path");
const { nanoid } = require("nanoid");
const moment = require("moment");

const imagesFolder = "./data/images/";
const dbLocation = "./data/db.json";
let db = fs.existsSync(dbLocation)
  ? JSON.parse(fs.readFileSync(dbLocation))
  : {};

/** DB Manager Module
 *
 * All of the database related methods are in this module (or rather, the vast majority of them).
 */

/** Initializes the DB file or creates a new one if there isn't one
 *
 * Really powerful method. It will wipe the database if used. Something to note is that
 * it will be triggered whenever the app cannot find the db. Pictures will still be there, so all we have to
 * do is uncomment the bottom loop if wanted.
 */
const initialize = () => {
  return new Promise((res, rej) => {
    // This also works as a more visual schema of the db
    db = {
      entries: {},
      metadata: {
        imageNumber: 0,
        todayList: [],
        dateBuilt: "",
        builtListsNumber: 0,
        builtExcludeListsNumber: 0,
      },
      createdLists: {},
      builtLists: {},
      builtExcludeLists: {},
    };
    // If you want to initialize it with the pictures stored quickly, uncomment this
    // fs.readdir(imagesFolder, (err, files) => {
    //  let today = getDate();
    //   files.forEach((image) => {
    //     db.entries[image] = {
    //       firstname: "Vladimir",
    //       lastname: "Ventura",
    //       studentid: "00301144",
    //       dateType: "multiple",
    //       dates: `${today.year()}-${today.month() + 1}-${today.date()}`,
    //       pictureName: image,
    //     };
    //   });
    let jsonData = JSON.stringify(db);

    fs.open(dbLocation, "wx", (err, fd) => {
      // TODO: Logging here
      if (err) console.log(err);
      fs.writeFile(dbLocation, jsonData, (err) => {
        if (err) console.log(err);
        else res();
      });
    });
  });
};

/** Initializes the Settings file or creates one from scratch if there is none
 *
 * Is not that dangerous of a method to be honest. It's only the settings, so I don't think
 * there's a whole lot to fret about if we lose these.
 */
const initializeSettings = async () => {
  return new Promise((res, rej) => {
    let jsonData = JSON.stringify({
      animationName: "expand",
      animationSpeed: "2",
      timeBetweenPictures: "6000",
    });
    fs.open("./data/settings.json", "wx", (err, fd) => {
      // TODO: Logging here
      if (err) console.log("1", err);
      fs.writeFile("./data/settings.json", jsonData, (err) => {
        if (err) console.log(err);
        else res();
      });
    });
  });
};

const getDate = (str, noFormat) => {
  return moment(str || new Date(), !noFormat ? "YYYY-MM-DD" : null).set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
};

const getTodayImages = () => {
  let today = getDate();
  let todayImages = [];

  for (const image in db.entries) {
    let currentImage = db.entries[image];

    switch (currentImage.dateType) {
      case "interval":
        let parsedDates = currentImage.dates.split(" - ");
        let leftmostDay = getDate(parsedDates[0]);
        let rightmostDay = getDate(parsedDates[1]);
        if (leftmostDay <= today && today <= rightmostDay) {
          todayImages.push(image);
        }
      case "multiple":
      default:
        currentImage.dates.split(",").forEach((date) => {
          let aDay = getDate(date);
          if (aDay >= today && aDay <= today) {
            todayImages.push(image);
          }
        });
    }
  }
  return todayImages;
};

const getTodayIncludeList = () => {
  let includeList = [];
  let today = getDate();

  for (const listName in db.builtLists) {
    let currentIncludeList = db.builtLists[listName];

    switch (currentIncludeList.dateType) {
      case "interval":
        let parsedDates = currentIncludeList.dates.split(" - ");
        let leftmostDay = getDate(parsedDates[0]);
        let rightmostDay = getDate(parsedDates[1]);
        if (leftmostDay <= today && today <= rightmostDay)
          includeList.concat(currentIncludeList.pictures);
        break;
      case "multiple":
      default:
        currentIncludeList.dates.split(",").forEach((date) => {
          let aDay = getDate(date);
          if (aDay >= today && aDay <= today)
            includeList.concat(currentIncludeList.pictures);
        });
        break;
    }
  }
  // We're cleaning the duplicates later on anyways
  return includeList;
};

const getScheduled = (item) => {
  let list = [];
  let today = getDate();

  // Switches are faster than if statements
  switch (item.dateType) {
    case "interval":
      let parsedDates = item.dates.split(" - ");
      let leftmostDay = getDate(parsedDates[0]);
      let rightmostDay = getDate(parsedDates[1]);
      if (leftmostDay <= today && today <= rightmostDay) {
        list = item.pictures;
      }
      break;
    case "multiple":
    default:
      item.dates.split(",").forEach((date) => {
        let aDay = getDate(date);
        if (aDay >= today && aDay <= today) {
          list = item.pictures;
        }
      });
      break;
  }
  return list;
};

// TODO: Optimize this
const buildToday = (playlist) => {
  let todayList = [];
  let createdLists = db.createdLists;
  let today = getDate();

  // We'll use this in the set list attribute, whenever the list has
  // no date
  if (playlist) {
    todayList = playlist.pictures;
    // JSON parse doesn't parse the word false as the boolean value false
    if (playlist.concat == "true") {
      // We do our magic here
      todayList = todayList.concat(getTodayImages());

      // Appending included lists scheduled for today
      todayList = todayList.concat(getTodayIncludeList());

      // Excluding scheduled pictures to be excluded. Should we add that option as well?
      todayList = filterExclude(todayList);
    }
  } else {
    for (const list in createdLists) {
      let currentList = createdLists[list];
      let images = getScheduled(currentList);
      if (images.length) {
        todayList = todayList.concat(images);
        if (currentList.concat == "true") {
          todayList = todayList.concat(getTodayImages());
          todayList = todayList.concat(getTodayIncludeList());
          todayList = filterExclude(todayList);
        }
      }
    }
    // Accounting for the case that there's no scheduled lists at all
    if (!todayList.length) {
      todayList = todayList.concat(getTodayImages());
      todayList = todayList.concat(getTodayIncludeList());
      todayList = filterExclude(todayList);
    }
  }

  todayList = [...new Set(todayList)];

  db.metadata["todayList"] = todayList;
  db.metadata["dateBuilt"] = todayList.length ? today : "";
  let jsonData = JSON.stringify(db);
  fs.open(dbLocation, "wx", (err, fd) => {
    // TODO: Logging here
    if (err && err.code != "EEXIST") {
      console.log(err);
    }
    fs.writeFile(dbLocation, jsonData, (err) => {
      if (err && err.code != "EEXIST") {
        console.log(err);
      }
    });
  });
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
  if (playlist.dateType.length <= 0 || playlist.dates.length <= 0) {
    let today = getDate();

    playlist = {
      ...playlist,
      dateType: "multiple",
      dates: `${today.year()}-${today.month() + 1}-${today.date()}`,
    };
  }
  createList(playlist);
};

const createList = (data) => {
  let listName = data.listName;
  db.createdLists[listName] = data;
  let jsonData = JSON.stringify(db);
  let today = getDate();

  switch (data.dateType) {
    case "interval":
      let parsedDates = data.dates.split(" - ");
      let leftmostDay = getDate(parsedDates[0]);
      let rightmostDay = getDate(parsedDates[1]);
      if (leftmostDay <= today && today <= rightmostDay) {
        buildToday(data);
      }
      break;
    case "multiple":
    default:
      data.dates.split(",").forEach((date) => {
        let aDay = getDate(date);
        if (aDay >= today && aDay <= today) {
          buildToday(data);
        }
      });
      break;
  }

  fs.open(dbLocation, "wx", (err, fd) => {
    // TODO: Logging here
    if (err && err.code != "EEXIST") {
      console.log(err);
    }
    fs.writeFile(dbLocation, jsonData, (err) => {
      if (err && err.code != "EEXIST") {
        console.log(err);
      }
    });
  });
};

const hasPicture = (epochTime) => {
  let result = "none";
  let done = false;

  if (epochTime) {
    let incomingDate = getDate(parseInt(epochTime), true);
    // First check if there's a picture with that date
    if (!done) {
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
              if (aDay >= incomingDate && aDay <= incomingDate) {
                result = "one";
                done = true;
              }
            });
        }
      }
    }
    // Then a list with that date (from the include list)
    if (!done) {
      for (const listKey in db.builtLists) {
        const currentList = db.builtLists[listKey];
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
              if (aDay >= incomingDate && aDay <= incomingDate) {
                result = "one";
                done = true;
              }
            });
        }
      }
    }
  }

  return result;
};

const getTodayList = () => {
  let today = getDate();
  let built = getDate(db.metadata["dateBuilt"]);

  if (built && built < today) {
    return buildToday();
  } else {
    return db.metadata["todayList"] == 0
      ? buildToday()
      : db.metadata["todayList"];
  }
};

const filterExclude = (list) => {
  let resultList = list;
  let today = getDate();
  if (db.metadata["builtExcludeLists"]) {
    for (const excludeList in db.metadata["builtExcludeLists"]) {
      const currentExcludeList = db.metadata["builtExcludeLists"][excludeList];

      switch (currentExcludeList.dateType) {
        case "interval":
          let parsedDates = currentExcludeList.dates.split(" - ");
          let leftmostDay = getDate(parsedDates[0]);
          let rightmostDay = getDate(parsedDates[1]);
          if (leftmostDay <= today && today <= rightmostDay) {
            resultList = resultList.filter(
              (picture) => !currentExcludeList.pictures.includes(picture)
            );
          }
          break;
        case "multiple":
        default:
          currentExcludeList.dates.split(",").forEach((date) => {
            let aDay = getDate(date);
            if (aDay >= today && aDay <= today) {
              resultList = resultList.filter(
                (picture) => !currentExcludeList.pictures.includes(picture)
              );
            }
          });
          break;
      }
    }
  }
  return resultList;
};

const getImageListFromDate = (dateType, dateString) => {
  let imageList = [];

  for (const image in db.entries) {
    let currentImage = db.entries[image];
    switch (currentImage.dateType) {
      case "interval":
        let imageParsedDates = currentImage.dates.split(" - ");
        let imageLowerDate = getDate(imageParsedDates[0]);
        let imageGreaterDate = getDate(imageParsedDates[1]);
        switch (dateType) {
          case "interval":
            let incomingParsedDates = dateString.split(" - ");
            let incomingLowestDate = getDate(incomingParsedDates[0]);
            let incomingGreatestDate = getDate(incomingParsedDates[1]);
            if (
              (incomingLowestDate <= imageLowerDate &&
                imageLowerDate <= incomingGreatestDate) ||
              (incomingLowestDate <= imageGreaterDate &&
                imageGreaterDate <= incomingGreatestDate)
            ) {
              imageList.push(image);
            }
            break;
          case "multiple":
            let incomingDates = dateString.split(",");
            incomingDates.forEach((date) => {
              let incomingDate = getDate(date);
              if (
                imageLowerDate <= incomingDate &&
                incomingDate <= imageGreaterDate
              ) {
                imageList.push(image);
              }
            });
            break;
          default:
            return Object.keys(db.entries);
        }
        break;
      case "multiple":
      default:
        let imageDates = currentImage.dates.split(",");
        imageDates.forEach((date) => {
          let imageDate = getDate(date);
          switch (dateType) {
            case "interval":
              let incomingParsedDates = dateString.split(" - ");
              let incomingLowestDate = getDate(incomingParsedDates[0]);
              let incomingGreaterDate = getDate(incomingParsedDates[1]);
              if (
                incomingLowestDate <= imageDate &&
                imageDate <= incomingGreaterDate &&
                !imageList.includes(image)
              ) {
                imageList.push(image);
              }
              break;
            case "multiple":
              dateString.split(",").forEach((imageDate) => {
                let incomingDate = getDate(imageDate);
                if (imageDate == incomingDate) {
                  imageList.push(image);
                }
              });
            default:
              return Object.keys(db.entries);
          }
        });
        break;
    }
  }
  return [...new Set(imageList)];
};

const removeFromExcludeds = (data) => {
  for (const excludeList in db.metadata["builtExcludeLists"]) {
    let currentExcludeList = db.metadata["builtExcludeLists"][excludeList];

    switch (currentExcludeList.dateType) {
      case "interval":
        let parsedDates = currentExcludeList.dates.split(" - ");
        let leftmostDay = getDate(parsedDates[0]);
        let rightmostDay = getDate(parsedDates[1]);
        switch (data.dateType) {
          case "interval":
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
            break;
          case "multiple":
          default:
            data.dates.split(",").forEach((date) => {
              let aDay = getDate(date);
              if (leftmostDay <= aDay && aDay <= rightmostDay) {
                currentExcludeList.pictures = currentExcludeList.pictures.filter(
                  (excludedPicture) => !data.pictures.includes(excludedPicture)
                );
              }
            });
            break;
        }
        break;
      case "multiple":
      default:
        currentExcludeList.dates.split(",").forEach((date) => {
          let aDay = getDate(date);
          switch (data.dateType) {
            case "interval":
              let parsedIncomingDates = data.dates.split(" - ");
              let leftmostIncomingDay = getDate(parsedIncomingDates[0]);
              let rightmostIncomingDay = getDate(parsedIncomingDates[1]);
              if (leftmostIncomingDay <= aDay && aDay <= rightmostIncomingDay) {
                currentExcludeList.pictures = currentExcludeList.pictures.filter(
                  (excludedPicture) => !data.pictures.includes(excludedPicture)
                );
              }
              break;
            case "multiple":
            default:
              data.dates.split(",").forEach((incomingDate) => {
                let incomingDay = getDate(incomingDate);
                if (aDay >= incomingDay && aDay <= incomingDate) {
                  currentExcludeList.pictures = currentExcludeList.pictures.filter(
                    (excludedPicture) =>
                      !data.pictures.includes(excludedPicture)
                  );
                }
              });
              break;
          }
        });
    }
    // The only reason we don't write to file right after this is that we're 100%
    // guaranteed to do it right after this is called.
    db.metadata["builtExcludeLists"][excludeList] = currentExcludeList;
  }
};

const pictureList = (data) => {
  removeFromExcludeds(data);
  let listName = `list${db.metadata["builtListsNumber"]}`;
  db.metadata["builtLists"][listName] = data;
  db.metadata["builtListsNumber"]++;
  let jsonData = JSON.stringify(db);
  fs.open(dbLocation, "wx", (err, fd) => {
    // TODO: Logging here
    if (err && err.code != "EEXIST") {
      console.log(err);
    }
    fs.writeFile(dbLocation, jsonData, (err) => {
      if (err && err.code != "EEXIST") {
        console.log(err);
      }
    });
  });
};

const insertFormData = (request, response) => {
  let form = new formidable.IncomingForm({ multiples: true });
  let today = getDate();
  form.keepExtensions = true;

  form.parse(request, async (error, fields, files) => {
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
        files.picture.forEach(async (file) => {
          await savePicture(file).then((data) => {
            console.log(data);
            let imageToInsert = data;
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
        });
      } catch (error) {
        if (error instanceof TypeError) {
          // Single File
          await savePicture(files.picture).then((data) => {
            console.log(data);

            let imageToInsert = data;
            db.entries[imageToInsert] = {
              firstname: fields.firstname,
              lastname: fields.lastname,
              studentid: fields.studentid,
              dateType: fields.radio,
              dates: fields.dates,
              pictureName: imageToInsert,
            };
            db.metadata["imageNumber"]++;
          });
        }
      }
      let jsonData = JSON.stringify(db);
      fs.open(dbLocation, "wx", (err, fd) => {
        // TODO: Logging here
        if (err && err.code != "EEXIST") {
          console.log(err);
        }
        fs.writeFile(dbLocation, jsonData, (err) => {
          if (err && err.code != "EEXIST") {
            console.log(err);
          }
        });
      });
      if (fields.radio == "interval") {
        let parsedDates = fields.dates.split(" - ");
        let leftmostDay = getDate(parsedDates[0]);
        let rightmostDay = getDate(parsedDates[1]);
        if (leftmostDay <= today || today <= rightmostDay) {
          buildToday();
        }
      } else if (fields.radio == "multiple") {
        let hasToday = false;
        fields.dates.split(",").forEach((date) => {
          let aDay = getDate(date);
          if (aDay >= today && aDay <= today) {
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

/** Promise that saves a picture from the form to the images directory
 *
 * Returns a promise (because we want to wait until the file is saved so we can move on with the DB Manipulation)
 * that, when resolved, returns the name of the file that we moved from the OS's temp directory to the app's image
 * directory. If something happens while saving we return empty and we log what went wrong.
 *
 * @param {Files} file - The form file object with the path to the image
 */
const savePicture = (file) => {
  return new Promise((res, rej) => {
    let oldPath = file.path;
    const id = nanoid();
    let extension = path.extname(oldPath);
    let fileName = `${id}${extension}`;
    let newPath = `${imagesFolder}/${fileName}`;

    // This is an ugly change, but a needed one for several pictures at a time (we're receiving each picture and saving it asynchronously)
    fs.open(oldPath, "wx", (err, fd) => {
      // TODO: Logging here
      if (err) {
        switch (err.code) {
          case "EEXIST":
            console.log("File was saved locally successfully");
            break;
          default:
            console.log("Something went wrong: ", err);
            res("");
            break;
        }
      }

      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          switch (err.code) {
            case "ENOENT":
              console.log(
                "The Images directory was not found. Creating, then retrying."
              );
              fs.mkdir(imagesFolder, (err) => {
                if (err) {
                  if (err.code != "EEXIST")
                    console.log("Something else is the issue: ", err);
                  res("");
                } else res(savePicture(file));
              });
              break;
            default:
              console.log("Something went wrong: ", err);
              res("");
              break;
          }
        }
        res(fileName);
      });
    });
  });
};

/** Removes a named picture from the database
 *
 * First we search for the entry, and remove it.
 * Then we search through all the built lists, the excluded lists and the created lists
 * and we remove it from those as well.
 * Lastly, we delete the picture if it's still there.
 *
 * @param {String} name - The name of the image to kick from the server
 */
const removePicture = (name) => {
  // If the entry was still there well... now it ain't
  delete db.entries[name];

  // Today's list should also be cleansed
  db.metadata.todayList = db.metadata.todayList.filter((el) => el != name);

  // Now for each created list, we cleanse
  for (const list in db.createdLists) {
    db.createdLists[list].pictures = db.createdLists[list].pictures.filter(
      (el) => el != name
    );
  }

  // Now for each built list, we cleanse
  for (const list in db.builtLists) {
    db.builtLists[list].pictures = db.builtLists[list].pictures.filter(
      (el) => el != name
    );
  }

  // Now for each exclude list, we cleanse
  for (const list in db.builtExcludeLists) {
    db.builtExcludeLists[list].pictures = db.builtExcludeLists[
      list
    ].pictures.filter((el) => el != name);
  }

  // Now we save our game
  let jsonData = JSON.stringify(db);
  fs.open(dbLocation, "wx", (err, fd) => {
    // TODO: Logging here
    if (err && err.code != "EEXIST") {
      console.log(err);
    }
    fs.writeFile(dbLocation, jsonData, (err) => {
      if (err && err.code != "EEXIST") {
        console.log(err);
      }
    });
  });

  // Now we say goodbye to the image
  deleteImage(name);
};

/** Deletes an image from the server
 *
 * This is what actually deletes the image from the server.
 * @param {String} name - The name of the file we're removing
 */
const deleteImage = (name) => {
  let imagesDir = "./data/images/";
  fs.open(dbLocation, "wx", (err, fd) => {
    if (err && err.code == "EEXIST") {
      switch (err.code) {
        case "EEXIST":
          fs.unlink(imagesDir + name, (err) => {
            if (err) {
              switch (err.code) {
                case "ENOENT":
                  console.log(
                    `Attempt of deletion ${name} inside ${imagesDir}. File not found.`,
                    err
                  );
                  break;
              }
            }
          });
          break;
        case "ENOENT":
          console.log(
            `Attempt of deletion ${name} inside ${imagesDir}. File not found.`,
            err
          );
          break;
      }
    } else {
      console.log("Tried to delete file", name, err);
    }
  });
};

const excludeListFromData = (data) => {
  let excludeListName = `excludeList${db.metadata["builtExcludeListsNumber"]}`;
  db.metadata["builtExcludeLists"][excludeListName] = data;
  db.metadata["builtExcludeListsNumber"]++;
  let jsonData = JSON.stringify(db);
  fs.open(dbLocation, "wx", (err, fd) => {
    // TODO: Logging here
    if (err && err.code != "EEXIST") {
      console.log(err);
    }
    fs.writeFile(dbLocation, jsonData, (err) => {
      if (err && err.code != "EEXIST") {
        console.log(err);
      }
    });
  });
};

module.exports = {
  getTodayList,
  insertFormData,
  getImageListFromDate,
  pictureList,
  excludeListFromData,
  hasPicture,
  createList,
  listWithName,
  playlists,
  setPlaylist,
  removePicture,
  initialize,
  initializeSettings,
};
