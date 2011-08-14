var express = require("express");
var fs = require("fs");
var path = require("path");

var app = express.createServer();
app.use(express.static(__dirname + "/pub"));
app.use(app.router);

app.get("/photos/:since", function(req, res) {
  var since = parseInt(req.params.since, 10);

  var photoDir = __dirname + "/pub/photos/";
  var files = fs.readdirSync(photoDir);
  var filtered = [];
  files.forEach(function(file) {
    var stat = fs.statSync(photoDir + file);
    var mtime = stat.mtime.getTime();
    console.log([file, mtime]);
    console.log(since);
    if ([".png", ".jpg"].indexOf(path.extname(file).toLowerCase()) === -1) {
      return;
    }
    
    if (mtime > since) {
      filtered.push({
        name: file,
        mtime: mtime
      });
    }
  });

  res.send(filtered);
});

app.listen(9579);
