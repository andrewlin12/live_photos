$(function() {
  var since = 0;
  var photoQueue = [];
  var backupQueue = [];

  var getNewPhotos = function() {
    console.log(since);
    $.get("/photos/" + since, function(data) {
      data.sort(function(a, b) {
        return a.mtime - b.mtime;
      });
      $.each(data, function(i, v) {
        var img = $("<img src='/photos/" + v.name + "' />");
        $(".main").prepend(img);
        since = Math.max(v.mtime, since);

        photoQueue.shift(img);
      });
    });
  };

  setInterval(getNewPhotos, 5000);
  getNewPhotos();
});
