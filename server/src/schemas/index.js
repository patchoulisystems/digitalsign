const metadataSchema = require("./metadata.schema.json");
const entrySchema = require("./entry.schema.json");
const listSchema = require("./list.schema.json");
const createdListSchema = require("./createdlist.schema.json");

const schemas = [metadataSchema, entrySchema, listSchema, createdListSchema];

module.exports = (validator) => {
  schemas.forEach((schema) => {
    validator.addSchema(schema, schema.$id);
  });
};
