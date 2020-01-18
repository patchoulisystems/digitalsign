const fs = require('fs');

const imagesFolder = "./data/images/";
const dbLocation = "./data/db.json";

let db = fs.readFileSync(dbLocation);
db = JSON.parse(db);

const buildToday = () => {
    var todayList = [];
    fs.readdir(imagesFolder, (err, files) => {
        var today = new Date();
        files.forEach(image => {
            var imageDate = new Date(db.entries[image].dates);
            if (imageDate <= today){
                todayList.push(image);
            }
        });
        db.metadata["todayList"] = todayList;
        db.metadata["dateBuilt"] = today;
        let jsonData = JSON.stringify(db);
        fs.writeFileSync(dbLocation, jsonData);
        return todayList;
    });
}

const getTodayList = () => {
    var today = new Date();
    var built = new Date(db.metadata["dateBuilt"]);

    if (built < today){
        return buildToday();
    } else {
        return db.metadata["todayList"];
    }
}

const initialize = () => {
    fs.readdir(imagesFolder, (err, files) => {
        files.forEach(image => {
            db.entries[image] = {
                "name": "Vladimir",
                "lastname": "Ventura",
                "studentID": "00301144",
                "dates": "2020-01-11",
                "pictureName": image
            };
        });
        let jsonData = JSON.stringify(db);
        fs.writeFileSync(dbLocation, jsonData);
    });
}

module.exports.getTodayList = getTodayList;