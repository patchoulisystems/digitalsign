if (!process.argv.includes('dev') && !process.argv.includes('prod')) {
    console.log("Please run the server with either 'dev' or 'prod' argument.");
    process.exit();
}
const http = require("http");
const router = require('./src/router');

// address is the address on ethernet interface, which is what we want to listen to
// 80 is standard for http, may need to sudo node app.js to listen on port 80

// Made this so the app also runs through PowerShell; for some reason I started getting address not available
// We can literally pass an argument like so: node app.js [argument] and pull it from process.argv array.
// The first two values are the node's install path, and the app.js's path; the 3rd + will be the arguments
// we pass along.
const serverOptions = {
    'dev': {
        'hostname': '127.0.0.1',
        'port': 3000
    },
    'prod': {
        'hostname': '10.0.0.161',
        'port': 80
    }
}

const launchOption = process.argv[2];
const port = serverOptions[launchOption]['port'];
const hostname = serverOptions[launchOption]['hostname'];

const server = http.createServer((request, response) => {
    router.css(request, response);
    router.js(request, response);
    router.home(request, response);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});