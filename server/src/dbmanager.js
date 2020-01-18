const fs = require('fs');

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

//We'l probably delete this
const initialize = () => {
    fs.readdir(imagesFolder, (err, files) => {
        var today = new Date();
        files.forEach(image => {
            db.entries[image] = {
                "name": "Vladimir",
                "lastname": "Ventura",
                "studentID": "00301144",
                "dates": today,
                "pictureName": image
            };
        });
        let jsonData = JSON.stringify(db);
        fs.writeFileSync(dbLocation, jsonData);
    });
}

buildToday();

module.exports.getTodayList = getTodayList;