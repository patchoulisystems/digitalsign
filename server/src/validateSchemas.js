const dbSchema = require("./schemas/db.schema.json");
const settingsSchema = require("./schemas/settings.schema.json");
const addSchemas = require("./schemas");
const dbData = require("../data/db.json");
const settingsData = require("../data/settings.json");
const Validator = require("jsonschema").Validator;

let v = new Validator();
addSchemas(v);

module.exports = () => {
  let results = {
    db: v.validate(dbData, dbSchema),
    settings: v.validate(settingsData, settingsSchema),
  };
  let dbValidate = results.db;
  let settingsValidate = results.settings;
  // We need this bit because it'll save us checking in the future if the db json is not on the right format
  if (dbValidate.errors.length) {
    console.log(
      "There has been an issue validating the DB's schema: ",
      dbValidate.errors
    );
    process.exit(1);
  } else {
    console.log("\tThe DB schema has been validated successfully");
  }
  if (settingsValidate.errors.length) {
    console.log(
      "There has been an issue validating the Setting's schema: ",
      dbValidate.errors
    );
    process.exit(1);
  } else {
    console.log("\tThe Settings schema has been validated successfully");
  }
};
