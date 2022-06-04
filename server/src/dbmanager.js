const fs = require("fs");
const formidable = require("formidable");
const path = require("path");

const imagesFolder = "./data/images/";
const dbLocation = "./data/db.json";
const imageDbPath = "./data/images.json";
let imageDB = JSON.parse(fs.readFileSync(imageDbPath));
let db = fs.readFileSync(dbLocation);
db = JSON.parse(db);
// TODO: Optimize this
const buildToday = () => {
  var todayList = [];
  var files = fs.readdirSync(imagesFolder, []);
  var today = new Date(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );
  // Check for each file, their date (might scrapped later on)
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

  // Check for each built list, their date (this is 90% staying)
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

  // TODO: Exclude the picture we don't want on the day here
  // We should clean the exclude array for a day
  // Or we can create "exclude lists" where they're basically the same as
  // the include lists but doing the opposite
  todayList = filterExclude(todayList, today);
  db.metadata["todayList"] = todayList;
  db.metadata["dateBuilt"] = today;
  let jsonData = JSON.stringify(db);
  fs.writeFileSync(dbLocation, jsonData);
  return todayList;
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

const getImages = () => {
  //console.log(JSON.parse(fs.readFileSync(imageDbPath)));
  return imageDB;
}

const deleteImages = (images) => {
  console.log("DB before delete" + JSON.stringify(imageDB));
  let count = 0;
  for (let index = imageDB.length-1; index >= 0; --index) {
    if (images.includes(imageDB[index].pictureName)) {
      console.log("Deleting: " + imageDB[index].pictureName);
      ++count;
      imageDB.splice(index,1);
    }
  }
  console.log("DB after delete" + JSON.stringify(imageDB));
  return count;
}

const getImageListFromDate = (dateType, dateString) => {
  let imageList = [];
  console.log("Date string is " + dateString);
  console.log("Date type is " + dateType);

  // Same deal like with build today
  let allImagesList = Object.keys(db.entries);
  // TODO: Test this function
  // TODO: Check if picture already here
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

        // This doesn't work as intended. It's about to get ugly
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
    console.log("Current exclude list: ", currentExcludeList);

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
          console.log("CEL Before removal: ", currentExcludeList);
          console.log("Data Before removal: ", data.pictures);
          currentExcludeList.pictures = currentExcludeList.pictures.filter(
            (excludedPicture) => !data.pictures.includes(excludedPicture)
          );
          console.log("Removed from CEL: ", currentExcludeList);
        }
      } else if (data.dateType == "multiple") {
        data.dates.split(",").forEach((date) => {
          let aDay = new Date(
            new Date(date).getUTCFullYear(),
            new Date(date).getUTCMonth(),
            new Date(date).getUTCDate()
          );
          if (leftmostDay <= aDay && aDay <= rightmostDay) {
            console.log("CEL Before removal: ", currentExcludeList);
            console.log("Data Before removal: ", data.pictures);
            currentExcludeList.pictures = currentExcludeList.pictures.filter(
              (excludedPicture) => !data.pictures.includes(excludedPicture)
            );
            console.log("Removed from CEL: ", currentExcludeList);
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
            console.log("CEL Before removal: ", currentExcludeList);
            console.log("Data Before removal: ", data.pictures);

            currentExcludeList.pictures = currentExcludeList.pictures.filter(
              (excludedPicture) => !data.pictures.includes(excludedPicture)
            );
            console.log("Removed from CEL: ", currentExcludeList);
          }
        } else if (data.dateType == "multiple") {
          data.dates.split(",").forEach((incomingDate) => {
            let incomingDay = new Date(
              new Date(incomingDate).getUTCFullYear(),
              new Date(incomingDate).getUTCMonth(),
              new Date(incomingDate).getUTCDate()
            );

            if (aDay == incomingDay) {
              console.log("CEL Before removal: ", currentExcludeList);
              console.log("Data Before removal: ", data.pictures);

              currentExcludeList.pictures = currentExcludeList.pictures.filter(
                (excludedPicture) => !data.pictures.includes(excludedPicture)
              );
              console.log("Removed from CEL: ", currentExcludeList);
            }
          });
        }
      });
    }
    db.metadata["builtExcludeLists"][excludeList] = currentExcludeList;
  }
}

const pictureList = (data) => {
  removeFromExcludeds(data);
  let listName = `list${db.metadata["builtListsNumber"]}`;
  console.log("OG BEL: ", db.metadata["builtExcludeLists"]);
  db.metadata["builtLists"][listName] = data;
  db.metadata["builtListsNumber"]++;
  let jsonData = JSON.stringify(db);
  fs.writeFileSync(dbLocation, jsonData);
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
      fs.writeFileSync(dbLocation, jsonData);

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
  var imageNumber = db.metadata["imageNumber"] + 1;
  var oldPath = file.path;
  var extension = path.extname(oldPath);
  var fileName = `image${imageNumber}${extension}`;
  var newPath = `${imagesFolder}/${fileName}`;

  fs.renameSync(file.path, newPath);

  return fileName;
};

const excludeListFromData = (data) => {
  let excludeListName = `excludeList${db.metadata["builtExcludeListsNumber"]}`;
  db.metadata["builtExcludeLists"][excludeListName] = data;
  db.metadata["builtExcludeListsNumber"]++;
  let jsonData = JSON.stringify(db);
  fs.writeFileSync(dbLocation, jsonData);
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
    fs.writeFileSync(dbLocation, jsonData);
  });
};

module.exports.getTodayList = getTodayList;
module.exports.insertFormData = insertFormData;
module.exports.getImageListFromDate = getImageListFromDate;
module.exports.pictureList = pictureList;
module.exports.excludeListFromData = excludeListFromData;
module.exports.getImages = getImages;
module.exports.deleteImages = deleteImages;
