$(function() {
  var since = 0;
  var photoQueue = [];
  var fullQueue = [];
  var currentImage = null;

  var showNextPhoto = function() {
    if (photoQueue.length === 0) {
      photoQueue = photoQueue.concat(fullQueue); 
    }
    if (photoQueue.length === 0) {
      return;
    }

    var nextImageSrc = photoQueue.shift();
    var nextImage = $("<img />");
    $(".main").prepend(nextImage);
    nextImage.load(function() {
      var w = nextImage.width();
      var h = nextImage.height();
      var targetHeight = $(window).height() - 24;
      nextImage.height(targetHeight);
      nextImage.css("top", 
        Math.round((targetHeight - nextImage.height()) / 2) + "px");
      nextImage.css("left", 
        Math.round(($(window).width() - nextImage.width()) / 2) + "px");      
    
      var fadeIn = function() {
        nextImage.animate({
          opacity: 1
        }, 2000, function() {
          currentImage = nextImage;
        });
      };

      if (currentImage) {
        currentImage.stop();
        currentImage.animate({
          opacity: 0
        }, 2000, function() {
          fadeIn();
          currentImage.remove();
        }); 
      }
      else {
        fadeIn();
      }
    });
    nextImage.attr("src", nextImageSrc + "?a=" + (new Date()).getTime());
  };

  var getNewPhotos = function() {
    $.get("/photos/" + since, function(data) {
      data.sort(function(a, b) {
        return a.mtime - b.mtime;
      });
      $.each(data, function(i, v) {
       since = Math.max(v.mtime, since);

        photoQueue.unshift(v.name);
        fullQueue.push(v.name);
      });
    });
  };

  setInterval(getNewPhotos, 10000);
  setInterval(showNextPhoto, 10000);
  getNewPhotos();
  showNextPhoto();
});
