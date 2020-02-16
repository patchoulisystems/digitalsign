const fs = require('fs');
const formidable = require('formidable');
const path = require('path');

const imagesFolder = './data/images/';
const dbLocation = path.resolve(__dirname, '../data/db.json');

let db = fs.readFileSync(dbLocation);
db = JSON.parse(db);

const buildToday = () => {
    var todayList = [];
    var files = fs.readdirSync(imagesFolder, []);
    var today = new Date();
    files.forEach(image => {
        var dateType = db.entries[image].dateType.trim();
        if (dateType == "interval") {
            var unparsedDates = db.entries[image].dates.split(' ');
            var leftmostDay = new Date(unparsedDates[0]);
            var rightmostDay = new Date(unparsedDates[2]);
            if (leftmostDay <= today || today <= rightmostDay) {
                todayList.push(image);
            }
        } else if (dateType == 'multiple') {
            db.entries[image].dates.split(',').forEach(function(date) {
                var aDay = new Date(date);
                if (aDay == today) {
                    todayList.push(image);
                }
            });
        }
    });
    db.metadata["todayList"] = todayList;
    db.metadata["dateBuilt"] = today;
    let jsonData = JSON.stringify(db);
    fs.writeFileSync(dbLocation, jsonData);
    return todayList;
}

const getTodayList = () => {
    var today = new Date();
    var built = new Date(db.metadata["dateBuilt"]);

    if (built < today) {
        return buildToday();
    } else {
        return db.metadata["todayList"];
    }
}

const insertFormData = (response) => {
    var form = new formidable.IncomingForm();
    var today = new Date();
    form.keepExtensions = true;

    form.parse(response, (error, fields, files) => {
        var imageToInsert = savePicture(files);
        db.entries[imageToInsert] = {
            "firstname": fields.firstname,
            "lastname": fields.lastname,
            "studentID": fields.studentID,
            "dateType": fields.radio,
            "dates": fields.dates,
            "pictureName": imageToInsert
        };
        db.metadata['imageNumber']++;
        let jsonData = JSON.stringify(db);
        fs.writeFileSync(dbLocation, jsonData);

        if (fields.radio == 'interval') {
            var parsedDates = fields.dates.split('-');
            var leftmostDay = new Date(parsedDates[0]);
            var rightmostDay = new Date(parsedDates[2]);
            if (leftmostDay <= today || today <= rightmostDay) {
                buildToday();
            }
        } else if (fields.radio == 'multiple') {
            var hasToday = false;
            fields.dates.split(',').forEach(function(date) {
                var aDay = new Date(date);
                if (aDay == today) {
                    hasToday = true;
                }
            });
            if (hasToday) {
                buildToday();
            }
        }
    });
}

const savePicture = (files) => {
    var imageNumber = db.metadata['imageNumber'] + 1;
    var oldPath = files.picture.path;
    var extension = path.extname(oldPath);
    var fileName = `image${imageNumber}${extension}`;
    var newPath = `${imagesFolder}/${fileName}`;

    fs.renameSync(files.picture.path, newPath);

    return fileName;
}

//We'l probably delete this
const initialize = () => {
    fs.readdir(imagesFolder, (err, files) => {
        var today = new Date();
        files.forEach(image => {
            db.entries[image] = {
                "firstname": "Vladimir",
                "lastname": "Ventura",
                "studentid": "00301144",
                "dateType": 'interval',
                "dates": '2020-01-01 - 2020-12-31',
                "pictureName": image
            };
        });
        let jsonData = JSON.stringify(db);
        fs.writeFileSync(dbLocation, jsonData);
    });
}

module.exports.getTodayList = getTodayList;
module.exports.insertFormData = insertFormData;
