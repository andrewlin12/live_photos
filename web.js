var express = require("express");
var fs = require("fs");
var path = require("path");
var child_process = require("child_process");

var photoDir = "/Users/wedding/wedding_photos/";

var app = express.createServer();
app.use(express.static(__dirname + "/pub"));
app.use(express.static(photoDir));
app.use(app.router);

var mogrified = {};
var mogrifyHistoryPath = __dirname + "/mogrify_history.json";
if (path.existsSync(mogrifyHistoryPath)) {
  mogrified = JSON.parse(fs.readFileSync(mogrifyHistoryPath));
}
app.get("/photos/:since", function(req, res) {
  var since = parseInt(req.params.since, 10);
  var files = fs.readdirSync(photoDir);
  var filtered = [];
  files.forEach(function(file) {
    if ([".png", ".jpg"].indexOf(path.extname(file).toLowerCase()) === -1) {
      return;
    }

    var stat = fs.statSync(photoDir + file);
    if (stat.ctime.getTime() > since) {
      filtered.push(file);
    }
  });

  var fileCount = 0;
  var addImage = function(file) {
    fileCount++;
    
    if (file) {
      var stat = fs.statSync(photoDir + file);
      goodImages.push({
        name: file,
        ctime: stat.ctime.getTime()
      });
    }

    console.log([fileCount, filtered.length]);
    if (fileCount === filtered.length) {
      res.send(goodImages);
      console.log("Done sending");
    }
  }

  if (filtered.length > 0) {
    var goodImages = [];
    filtered.forEach(function(v, i) {
      if (mogrified[v]) {
        console.log("Already mogrified " + v);

        addImage(v);
        return;
      }

      child_process.exec("/usr/local/bin/mogrify -auto-orient -auto-level " + 
        photoDir + v,
        function(err, stdout, stderr) {
          if (err) {
            console.log("Mogrify error!");
            console.log(err);
            console.log(stderr);
            
            addImage(null);
          }
          else {
            console.log("Mogrified " + v);
            console.log(stdout);
            mogrified[v] = true;
            fs.writeFileSync(mogrifyHistoryPath, JSON.stringify(mogrified));

            addImage(v);
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

process.on("uncaughtException", function() {
  console.log(arguments);
});
