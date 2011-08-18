var express = require("express");
var fs = require("fs");
var path = require("path");
var child_process = require("child_process");

var photoDir = "/Users/wedding/wedding_photos/";

var app = express.createServer();
app.use(express.static(__dirname + "/pub"));
app.use(express.static(photoDir));
app.use(app.router);

var seen = {};
app.get("/photos/:since", function(req, res) {
  var since = parseInt(req.params.since, 10);

  var files = fs.readdirSync(photoDir);
  var filtered = [];
  files.forEach(function(file) {
    var stat = fs.statSync(photoDir + file);
    var mtime = stat.ctime.getTime();
    if ([".png", ".jpg"].indexOf(path.extname(file).toLowerCase()) === -1) {
      return;
    }

    if (!seen[file]) {
      filtered.push({
        name: file
      });
      seen[file] = true;
    }
  });

  if (filtered.length > 0) {
    var fileCount = 0;
    var goodImages = [];
    filtered.forEach(function(v, i) {
      child_process.exec("/usr/local/bin/mogrify -auto-orient " + photoDir + v.name,
        function(err, stdout, stderr) {
          fileCount++;
          if (err) {
            console.log(err);
            console.log(stderr);
          }
          else {
            console.log("Mogrified " + v.name);
            console.log(stdout);

            goodImages.push(v);
          }
          if (fileCount === filtered.length) {
            res.send(goodImages);
          }
        }
      );
    });
  }
  else {
    res.send([]);
  }
});

app.listen(9579);
