const fs = require("fs");

const checkIfParsable = async (path, message, fn) => {
  try {
    JSON.parse(fs.readFileSync(path));
  } catch (err) {
    // TODO: Logging here
    console.log(message);
    fn ? await fn() : process.exit(1);
  }
};

module.exports = async () => {
  if (fs.existsSync("./data/db.json")) {
    console.log("Found the DB file");
    await checkIfParsable(
      "./data/db.json",
      "\tDB file was either empty or had a bad parsing. Please take a look at it, or delete it and start the app again to initialize one."
    );
  } else {
    console.log("A DB file was not found. Starting one from scratch");
    await require("./dbmanager").initialize();
  }
  if (fs.existsSync("./data/settings.json")) {
    console.log("Found the Settings file");
    await checkIfParsable(
      "./data/settings.json",
      "\tSettings file was either empty or had a bad parsing. We're initializing it.",
      require("./dbmanager").initializeSettings
    );
  } else {
    console.log("A Settings file was not found. Starting one from scratch");
    await require("./dbmanager").initializeSettings();
  }
  require("./validateSchemas")();
};
