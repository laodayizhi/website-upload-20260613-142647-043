(function () {
  function initPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-cover');
    var streamUrl = box.getAttribute('data-play-url');
    var mounted = false;
    var hls = null;

    function mountStream() {
      if (mounted || !video || !streamUrl) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }
      mounted = true;
    }

    function startPlayback() {
      mountStream();
      if (!video) {
        return;
      }
      if (button) {
        button.classList.add('is-hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
          button.classList.remove('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    }
  }

  if (document.readyState !== 'loading') {
    document.querySelectorAll('[data-player]').forEach(initPlayer);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('[data-player]').forEach(initPlayer);
    });
  }
})();
