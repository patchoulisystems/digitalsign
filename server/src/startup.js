const fs = require("fs");
const db = require("./dbmanager");
module.exports = () => {
  if (fs.existsSync("./data/db.json")) {
    console.log("Found the DB file");
  } else {
    console.log("A DB file was not found. Starting one from scratch");
    db.initialize();
  }
  if (fs.existsSync("./data/settings.json")) {
    console.log("Found the Settings file");
  } else {
    console.log("A Settings file was not found. Starting one from scratch");
    db.initializeSettings();
  }
  require("./validateSchemas")();
};
