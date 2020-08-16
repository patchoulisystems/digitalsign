const https = require("https");
const http = require("http");
const fs = require("fs");
const router = require("./src/router");
const validator = require("./src/validateDb");

// address is the address on ethernet interface, which is what we want to listen to
// 80 is standard for http, may need to sudo node app.js to listen on port 80

// Made this so the app also runs through PowerShell; for some reason I started getting address not available
// We can literally pass an argument like so: node app.js [argument] and pull it from process.argv array.
// The first two values are the node's install path, and the app.js's path; the 3rd + will be the arguments
// we pass along.

const port = process.env.PORT || 8080;
const hostname = process.env.HOSTNAME || "localhost";

const pfxPath = process.env.PFX;
const secret = process.env.SECRET;

var options;
var server;

let dbValidate = validator();

if (dbValidate.errors.length) {
  console.log(
    "There has been an issue validating the DB's schema: ",
    dbValidate.errors
  );
} else {
  console.log("The DB schema has been validated successfully");
}

try {
  options = {
    pfx: fs.readFileSync(pfxPath),
    passphrase: secret,
  };
  server = https.createServer(options, (request, response) => {
    router.css(request, response);
    router.js(request, response);
    router.home(request, response);
  });
} catch (err) {
  console.log(
    "There was an error reading the cert. Starting UNENCRYPTED http server instead."
  );
  server = http.createServer((request, response) => {
    router.css(request, response);
    router.js(request, response);
    router.home(request, response);
  });
}

server.listen(port, hostname, () => {
  console.log(`Server running at ${hostname}:${port}`);
});
