const fs = require('fs');

const imagesFolder = "./data/images/";
const dbLocation = "./data/db.json";

const buildToday = () => {
    let jsonFile = fs.readFileSync("./data/db.json");
    jsonFile = JSON.parse(jsonFile);
    return jsonFile;
}

const initialize = () => {
    let db = fs.readFileSync(dbLocation);
    db = JSON.parse(db);
    fs.readdir(imagesFolder, (err, files) => {
        files.forEach(image => {
            db.entries[image] = {
                "name": "Vladimir",
                "lastname": "Ventura",
                "studentID": "00301144",
                "dates": "02-12-2020",
                "pictureName": image
            };
        });
        db.metadata.imageNumber++;
        let jsonData = JSON.stringify(db);
        fs.writeFileSync(dbLocation, jsonData);
    });
}

initialize();
module.exports.buildToday = buildToday;