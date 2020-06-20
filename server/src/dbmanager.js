const fs = require("fs");
const formidable = require("formidable");
const path = require("path");
const { nanoid } = require("nanoid");

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

// TODO: Optimize this
const buildToday = () => {
  var todayList = [];
  var files;
  try {
    files = fs.readdirSync(imagesFolder, []);
  } catch (err) {
    // TODO: Loggin here
    console.log(err);
    return [];
  }
  var today = new Date(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );
  files.forEach((image) => {
    var dateType = db.entries[image].dateType.trim();
    if (dateType == "interval") {
      var parsedDates = db.entries[image].dates.split(" ");
      let leftmostDay = new Date(
        new Date(parsedDates[0]).getUTCFullYear(),
        new Date(parsedDates[0]).getUTCMonth(),
        new Date(parsedDates[0]).getUTCDate()
      );
      let rightmostDay = new Date(
        new Date(parsedDates[2]).getUTCFullYear(),
        new Date(parsedDates[2]).getUTCMonth(),
        new Date(parsedDates[2]).getUTCDate()
      );
      if (leftmostDay <= today || today <= rightmostDay) {
        todayList.push(image);
      }
    } else if (dateType == "multiple") {
      db.entries[image].dates.split(",").forEach((date) => {
        var aDay = new Date(
          new Date(date).getUTCFullYear(),
          new Date(date).getUTCMonth(),
          new Date(date).getUTCDate()
        );
        if (aDay == today) {
          todayList.push(image);
        }
      });
    }
  });

  var builtLists = Array.from(Object.keys(db.metadata["builtLists"]));
  builtLists.forEach((list) => {
    let listDate = db.metadata["builtLists"][list]["dates"];
    let listDateType = db.metadata["builtLists"][list]["dateType"];
    let listPictures = db.metadata["builtLists"][list]["pictures"];
    if (listDateType == "interval") {
      let parsedDates = listDate.split(" ");
      let leftmostDay = new Date(
        new Date(parsedDates[0]).getUTCFullYear(),
        new Date(parsedDates[0]).getUTCMonth(),
        new Date(parsedDates[0]).getUTCDate()
      );
      let rightmostDay = new Date(
        new Date(parsedDates[2]).getUTCFullYear(),
        new Date(parsedDates[2]).getUTCMonth(),
        new Date(parsedDates[2]).getUTCDate()
      );
      if (leftmostDay <= today && today <= rightmostDay) {
        listPictures.forEach((picture) => {
          if (!todayList.includes(picture.toString())) {
            todayList.push(picture);
          }
        });
      }
    } else {
      let parsedDates = listDate.split(",");
      parsedDates.forEach((date) => {
        let thisListDay = new Date(
          new Date(date).getUTCFullYear(),
          new Date(date).getUTCMonth(),
          new Date(date).getUTCDate()
        );
        if (today == thisListDay) {
          listPictures.forEach((picture) => {
            if (!todayList.includes(picture)) {
              todayList.push(picture);
            }
          });
        }
      });
    }
  });

  todayList = filterExclude(todayList, today);
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
  }
  return todayList;
};

const hasPicture = (epochTime) => {
  var result = "none";
  let done = false;

  if (epochTime) {
    var incomingDate = new Date(
      new Date(parseInt(epochTime)).getUTCFullYear(),
      new Date(parseInt(epochTime)).getUTCMonth(),
      new Date(parseInt(epochTime)).getUTCDate()
    );
    // First check if there's a picture with that date
    if (!done)
      for (const imageKey in db.entries) {
        const currentImage = db.entries[imageKey];
        if (currentImage.dateType == "interval" && !done) {
          let parsedDates = currentImage.dates.split(" - ");
          let leftmostDay = new Date(
            new Date(parsedDates[0]).getUTCFullYear(),
            new Date(parsedDates[0]).getUTCMonth(),
            new Date(parsedDates[0]).getUTCDate()
          );
          let rightmostDay = new Date(
            new Date(parsedDates[1]).getUTCFullYear(),
            new Date(parsedDates[1]).getUTCMonth(),
            new Date(parsedDates[1]).getUTCDate()
          );
          if (leftmostDay <= incomingDate && incomingDate <= rightmostDay) {
            result = "one";
            done = true;
          }
        } else if (currentImage.dateType == "multiple" && !done) {
          let imageDatesString = currentImage.dates.split(",");
          if (!done)
            imageDatesString.forEach((date) => {
              let aDay = new Date(
                new Date(date).getUTCFullYear(),
                new Date(date).getUTCMonth(),
                new Date(date).getUTCDate()
              );
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
          let leftmostDay = new Date(
            new Date(parsedDates[0]).getUTCFullYear(),
            new Date(parsedDates[0]).getUTCMonth(),
            new Date(parsedDates[0]).getUTCDate()
          );
          let rightmostDay = new Date(
            new Date(parsedDates[1]).getUTCFullYear(),
            new Date(parsedDates[1]).getUTCMonth(),
            new Date(parsedDates[1]).getUTCDate()
          );

          if (leftmostDay <= incomingDate && incomingDate <= rightmostDay) {
            result = "one";
            done = true;
          }
        } else if (currentList.dateType == "multiple" && !done) {
          let listDatesString = currentList.dates.split(",");
          if (!done)
            listDatesString.forEach((date) => {
              let aDay = new Date(
                new Date(date).getUTCFullYear(),
                new Date(date).getUTCMonth(),
                new Date(date).getUTCDate()
              );
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
  var today = new Date(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );
  var built = new Date(
    new Date(db.metadata["dateBuilt"]).getUTCFullYear(),
    new Date(db.metadata["dateBuilt"]).getUTCMonth(),
    new Date(db.metadata["dateBuilt"]).getUTCDate()
  );

  if (built < today) {
    return buildToday();
  } else {
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
        let leftmostDay = new Date(
          new Date(parsedDates[0]).getUTCFullYear(),
          new Date(parsedDates[0]).getUTCMonth(),
          new Date(parsedDates[0]).getUTCDate()
        );
        let rightmostDay = new Date(
          new Date(parsedDates[1]).getUTCFullYear(),
          new Date(parsedDates[1]).getUTCMonth(),
          new Date(parsedDates[1]).getUTCDate()
        );
        if (leftmostDay <= today && today <= rightmostDay) {
          resultList = resultList.filter(
            (picture) => !currentExcludeList.pictures.includes(picture)
          );
        }
      } else if (currentExcludeList.dateType == "multiple") {
        currentExcludeList.dates.split(",").forEach((date) => {
          let aDay = new Date(
            new Date(date).getUTCFullYear(),
            new Date(date).getUTCMonth(),
            new Date(date).getUTCDate()
          );
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
    let lowerDate = new Date(
      new Date(parsedDates[0]).getUTCFullYear(),
      new Date(parsedDates[0]).getUTCMonth(),
      new Date(parsedDates[0]).getUTCDate()
    );
    let greaterDate = new Date(
      new Date(parsedDates[1]).getUTCFullYear(),
      new Date(parsedDates[1]).getUTCMonth(),
      new Date(parsedDates[1]).getUTCDate()
    );

    allImagesList.forEach((image) => {
      if (db.entries[image].dateType.trim() == "interval") {
        let imageParsedDates = db.entries[image].dates.split(" - ");
        let imageLowestDate = new Date(
          new Date(imageParsedDates[0]).getUTCFullYear(),
          new Date(imageParsedDates[0]).getUTCMonth(),
          new Date(imageParsedDates[0]).getUTCDate()
        );
        let imageGreaterDate = new Date(
          new Date(imageParsedDates[1]).getUTCFullYear(),
          new Date(imageParsedDates[1]).getUTCMonth(),
          new Date(imageParsedDates[1]).getUTCDate()
        );

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
          let imageDate = new Date(
            new Date(date).getUTCFullYear(),
            new Date(date).getUTCMonth(),
            new Date(date).getUTCDate()
          );
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
      let incomingDate = new Date(
        new Date(date).getUTCFullYear(),
        new Date(date).getUTCMonth(),
        new Date(date).getUTCDate()
      );
      allImagesList.forEach((image) => {
        if (db.entries[image].dateType == "interval") {
          let parsedDates = db.entries[image].dates.split(" - ");
          let imageLowestDate = new Date(
            new Date(parsedDates[0]).getUTCFullYear(),
            new Date(parsedDates[0]).getUTCMonth(),
            new Date(parsedDates[0]).getUTCDate()
          );
          let imageGreaterDate = new Date(
            new Date(parsedDates[1]).getUTCFullYear(),
            new Date(parsedDates[1]).getUTCMonth(),
            new Date(parsedDates[1]).getUTCDate()
          );

          if (
            imageLowestDate <= incomingDate &&
            incomingDate <= imageGreaterDate &&
            !imageList.includes(image)
          ) {
            imageList.push(image);
          }
        } else if (db.entries[image].dateType == "multiple") {
          db.entries[image].dates.split(",").forEach((imageDate) => {
            let entryDate = new Date(
              new Date(imageDate).getUTCFullYear(),
              new Date(imageDate).getUTCMonth(),
              new Date(imageDate).getUTCDate()
            );
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
      let leftmostDay = new Date(
        new Date(parsedDates[0]).getUTCFullYear(),
        new Date(parsedDates[0]).getUTCMonth(),
        new Date(parsedDates[0]).getUTCDate()
      );
      let rightmostDay = new Date(
        new Date(parsedDates[1]).getUTCFullYear(),
        new Date(parsedDates[1]).getUTCMonth(),
        new Date(parsedDates[1]).getUTCDate()
      );
      if (data.dateType == "interval") {
        let parsedIncomingDates = data.dates.split(" - ");
        let leftmostIncomingDay = new Date(
          new Date(parsedIncomingDates[0]).getUTCFullYear(),
          new Date(parsedIncomingDates[0]).getUTCMonth(),
          new Date(parsedIncomingDates[0]).getUTCDate()
        );
        let rightmostIncomingDay = new Date(
          new Date(parsedIncomingDates[1]).getUTCFullYear(),
          new Date(parsedIncomingDates[1]).getUTCMonth(),
          new Date(parsedIncomingDates[1]).getUTCDate()
        );
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
          let aDay = new Date(
            new Date(date).getUTCFullYear(),
            new Date(date).getUTCMonth(),
            new Date(date).getUTCDate()
          );
          if (leftmostDay <= aDay && aDay <= rightmostDay) {
            currentExcludeList.pictures = currentExcludeList.pictures.filter(
              (excludedPicture) => !data.pictures.includes(excludedPicture)
            );
          }
        });
      }
    } else if (currentExcludeList.dateType == "multiple") {
      currentExcludeList.dates.split(",").forEach((date) => {
        let aDay = new Date(
          new Date(date).getUTCFullYear(),
          new Date(date).getUTCMonth(),
          new Date(date).getUTCDate()
        );
        if (data.dateType == "interval") {
          let parsedIncomingDates = data.dates.split(" - ");
          let leftmostIncomingDay = new Date(
            new Date(parsedIncomingDates[0]).getUTCFullYear(),
            new Date(parsedIncomingDates[0]).getUTCMonth(),
            new Date(parsedIncomingDates[0]).getUTCDate()
          );
          let rightmostIncomingDay = new Date(
            new Date(parsedIncomingDates[1]).getUTCFullYear(),
            new Date(parsedIncomingDates[1]).getUTCMonth(),
            new Date(parsedIncomingDates[1]).getUTCDate()
          );
          if (leftmostIncomingDay <= aDay && aDay <= rightmostIncomingDay) {
            currentExcludeList.pictures = currentExcludeList.pictures.filter(
              (excludedPicture) => !data.pictures.includes(excludedPicture)
            );
          }
        } else if (data.dateType == "multiple") {
          data.dates.split(",").forEach((incomingDate) => {
            let incomingDay = new Date(
              new Date(incomingDate).getUTCFullYear(),
              new Date(incomingDate).getUTCMonth(),
              new Date(incomingDate).getUTCDate()
            );

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
  let today = new Date(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );
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
        var parsedDates = fields.dates.split(" ");
        var leftmostDay = new Date(
          new Date(parsedDates[0]).getUTCFullYear(),
          new Date(parsedDates[0]).getUTCMonth(),
          new Date(parsedDates[0]).getUTCDate()
        );
        var rightmostDay = new Date(parsedDates[2]);
        if (leftmostDay <= today || today <= rightmostDay) {
          buildToday();
        }
      } else if (fields.radio == "multiple") {
        var hasToday = false;
        fields.dates.split(",").forEach(function (date) {
          var aDay = new Date(
            new Date(date).getUTCFullYear(),
            new Date(date).getUTCMonth(),
            new Date(date).getUTCDate()
          );
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
