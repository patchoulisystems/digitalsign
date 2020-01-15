const fs = require('fs');
const url = require('url');

function home(request, response){
    var urlObject = url.parse(`${request.headers.host}${request.url}`);

    if (urlObject.pathname === '/'){
        if (request.method == "GET"){
            var file = fs.readFileSync("../client/index.html");
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(file);            
        }
    } else if (urlObject.pathname === "/today_images"){
        var images = [];
      fs.readdir(imagesFolder, (err, files) => {
        files.forEach(file => {
          images.push(file);
        });
        headers["Content-Type"] = "application/json";
        response.writeHead(200, headers);
        response.write(JSON.stringify({ data: images }));
        response.end();
      });
    }
}

function css (request, response) {
    if (request.url.indexOf(".css") !== -1){
      var file = fs.readFileSync(`../client/${request.url.split(".")[0]}_page${request.url}`, {'encoding' : 'utf8'});
      response.writeHead(200, {'Content-Type' : 'text/css'});
      response.write(file);
    }
  }