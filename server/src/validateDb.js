const schema = require("./schemas/db.schema.json");
const addSchemas = require("./schemas");
const Validator = require("jsonschema").Validator;
const data = require("../data/db.json");

let v = new Validator();
addSchemas(v);

module.exports = () => v.validate(data, schema);
