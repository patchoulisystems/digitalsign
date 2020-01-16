const http = require("http");
const router = require('./src/router');

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer((request, response) => {
  router.css(request, response);
  router.js(request, response);
  router.home(request, response);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});
