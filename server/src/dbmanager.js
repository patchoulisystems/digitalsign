const fs = require('fs');
const formidable = require('formidable');
const path = require('path');

const imagesFolder = "./data/images/";
const dbLocation = "./data/db.json";

let db = fs.readFileSync(dbLocation);
db = JSON.parse(db);

const buildToday = () => {
    var todayList = [];
    var files = fs.readdirSync(imagesFolder, []);
    var today = new Date();
    files.forEach(image => {
        var imageDate = new Date(db.entries[image].dates);
        if (imageDate <= today) {
            todayList.push(image);
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
        var date = new Date(fields.date.toString());
        db.entries[imageToInsert] = {
            "firstname": fields.firstname,
            "lastname": fields.lastname,
            "studentID": date,
            "dates": fields.date.toString(),
            "pictureName": imageToInsert
        };
        db.metadata['imageNumber']++;
        let jsonData = JSON.stringify(db);
        fs.writeFileSync(dbLocation, jsonData);

        //This will be N eventually
        if (date <= today){
            buildToday();
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
                "dates": today,
                "pictureName": image
            };
        });
        let jsonData = JSON.stringify(db);
        fs.writeFileSync(dbLocation, jsonData);
    });
}

module.exports.getTodayList = getTodayList;
module.exports.insertFormData = insertFormData;