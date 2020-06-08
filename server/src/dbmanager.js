const fs = require("fs");
const formidable = require("formidable");
const path = require("path");

const imagesFolder = "./data/images/";
const dbLocation = "./data/db.json";

let db = fs.readFileSync(dbLocation);
db = JSON.parse(db);

const buildToday = () => {
  var todayList = [];
  var files = fs.readdirSync(imagesFolder, []);
  var today = new Date(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );
  // Check for each file, their date (might scrapped later on)
  files.forEach(image => {
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
      db.entries[image].dates.split(",").forEach(date => {
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
  builtLists.forEach(list => {
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
        listPictures.forEach(picture => {
          if (!todayList.includes(picture.toString())) {
            todayList.push(picture);
          }
        });
      }
    } else {
      let parsedDates = listDate.split(",");
      parsedDates.forEach(date => {
        let thisListDay = new Date(
          new Date(date).getUTCFullYear(),
          new Date(date).getUTCMonth(),
          new Date(date).getUTCDate()
        );
        if (today == thisListDay) {
          listPictures.forEach(picture => {
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

const getImageListFromDate = (dateString, dateType) => {
  let imageList = [];

  // Same deal like with build today
  let allImagesList = Object.keys(db.entries);

  if (dateType == "interval") {
    // Parsing dateString to proper dates
    let parsedDates = dateString.split(",");
    let lowerDate = new Date(parsedDates[0]);
    let greaterDate = new Date(parsedDates[2]);

    allImagesList.forEach(image => {
      if (db.entries[image].dateType.trim() == "interval") {
        let parsedDates = db.entries[image].dates.split(" ");
        let imageLowestDate = new Date(
          new Date(parsedDates[0]).getUTCFullYear(),
          new Date(parsedDates[0]).getUTCMonth(),
          new Date(parsedDates[0]).getUTCDate()
        );
        let imageGreaterDate = new Date(
          new Date(parsedDates[2]).getUTCFullYear(),
          new Date(parsedDates[2]).getUTCMonth(),
          new Date(parsedDates[2]).getUTCDate()
        );

        if (lowerDate <= imageLowestDate && imageGreaterDate <= greaterDate) {
          imageList.push(image);
        }
      } else if (db.entries[image].dateType.trim() == "multiple") {
        let imageDates = db.entries[image].dates.split(",").filter(element => {
          return element !== ",";
        });
        imageDates.forEach(date => {
          let imageDate = new Date(
            new Date(date).getUTCFullYear(),
            new Date(date).getUTCMonth(),
            new Date(date).getUTCDate()
          );
          if (lowerDate <= imageDate && imageDate <= greaterDate) {
            imageList.push(image);
          }
        });
      }
    });
  } else if (dateType == "multiple") {
    let incomingDates = dateString.split(",").filter(date => {
      return date !== ",";
    });
    incomingDates.forEach(date => {
      let incomingDate = new Date(
        new Date(date).getUTCFullYear(),
        new Date(date).getUTCMonth(),
        new Date(date).getUTCDate()
      );
      incomingDate = new Date(
        incomingDate.getTime() + incomingDate.getTimezoneOffset() * 60000
      );
      console.log(incomingDate + ` generated from ${date}`);
      allImagesList.forEach(image => {
        if (db.entries[image].dateType == "interval") {
          let parsedDates = db.entries[image].dates.split(" ");
          let imageLowestDate = new Date(
            new Date(parsedDates[0]).getUTCFullYear(),
            new Date(parsedDates[0]).getUTCMonth(),
            new Date(parsedDates[0]).getUTCDate()
          );
          let imageGreaterDate = new Date(
            new Date(parsedDates[2]).getUTCFullYear(),
            new Date(parsedDates[2]).getUTCMonth(),
            new Date(parsedDates[2]).getUTCDate()
          );
          if (
            imageLowestDate <= incomingDate &&
            incomingDate <= imageGreaterDate
          ) {
            imageList.push(image);
          }
        } else if (db.entries[image].dateType == "multiple") {
          db.entries[image].dates
            .split(",")
            .filter(element => {
              return element !== ",";
            })
            .forEach(imageDate => {
              let entryDate = new Date(
                new Date(imageDate).getUTCFullYear(),
                new Date(imageDate).getUTCMonth(),
                new Date(imageDate).getUTCDate()
              );
              console.log(
                `${entryDate.getUTCDate()} + ${entryDate.getUTCMonth()} + ${entryDate.getUTCFullYear()} ${image} D/M/Y`
              );
              console.log(
                `${incomingDate.getUTCDate()} + ${incomingDate.getUTCMonth()} + ${incomingDate.getUTCFullYear()} Incoming D/M/Y`
              );
              console.log(
                `${entryDate} would be ${image}'s generated Date object`
              );
              if (
                entryDate.getUTCDate() == incomingDate.getUTCDate() &&
                entryDate.getUTCMonth() == incomingDate.getUTCMonth() &&
                entryDate.getUTCFullYear() == incomingDate.getUTCFullYear()
              ) {
                imageList.push(image);
              }
            });
        }
      });
    });
    // Preparation for the repurposing the edit_day page
  } else {
    imageList = allImagesList;
  }
  return imageList;
};

const pictureList = data => {
  let listName = `list${db.metadata["builtListsNumber"]}`;
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
        files.picture.forEach(file => {
          var imageToInsert = savePicture(file);
          db.entries[imageToInsert] = {
            firstname: fields.firstname,
            lastname: fields.lastname,
            studentid: fields.studentid,
            dateType: fields.radio,
            dates: fields.dates,
            pictureName: imageToInsert
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
            pictureName: imageToInsert
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
        fields.dates.split(",").forEach(function(date) {
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

const savePicture = file => {
  var imageNumber = db.metadata["imageNumber"] + 1;
  var oldPath = file.path;
  var extension = path.extname(oldPath);
  var fileName = `image${imageNumber}${extension}`;
  var newPath = `${imagesFolder}/${fileName}`;

  fs.renameSync(file.path, newPath);

  return fileName;
};

//We'l probably delete this
const initialize = () => {
  fs.readdir(imagesFolder, (err, files) => {
    files.forEach(image => {
      db.entries[image] = {
        firstname: "Vladimir",
        lastname: "Ventura",
        studentid: "00301144",
        dateType: "interval",
        dates: "2020-01-01 - 2020-12-31",
        pictureName: image
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
