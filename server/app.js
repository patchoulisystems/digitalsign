const http = require("http");
const router = require('./src/router');

// address is the address on ethernet interface, which is what we want to listen to
// 80 is standard for http, may need to sudo node app.js to listen on port 80

// Made this so the app also runs through PowerShell; for some reason I started getting address not available
// We can literally pass an argument like so: node app.js [argument] and pull it from process.argv array.
// The first two values are the node's install path, and the app.js's path; the 3rd + will be the arguments
// we pass along.

const port = 8080;
const hostname = '0.0.0.0';

const server = http.createServer((request, response) => {
    router.css(request, response);
    router.js(request, response);
    router.home(request, response);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});
