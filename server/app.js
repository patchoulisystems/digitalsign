const http = require("http");
const router = require('./src/router');

//address is the address on ethernet interface, which is what we want to listen to
const hostname = "10.0.0.161";
const port = 80;
// 80 is standard for http, may need to sudo node app.js to listen on port 80

const server = http.createServer((request, response) => {
  router.css(request, response);
  router.js(request, response);
  router.home(request, response);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});
