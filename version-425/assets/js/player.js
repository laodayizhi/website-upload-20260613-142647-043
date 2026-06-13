(function () {
  var shell = document.querySelector('[data-player]');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-play-button]');
  var source = video ? video.getAttribute('data-src') : '';
  var hlsInstance = null;

  function attachSource() {
    if (!video || !source) {
      return Promise.resolve();
    }

    if (video.getAttribute('data-ready') === 'true') {
      return Promise.resolve();
    }

    video.setAttribute('data-ready', 'true');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return Promise.resolve();
    }

    video.src = source;
    return Promise.resolve();
  }

  function playVideo() {
    attachSource().then(function () {
      if (!video) {
        return;
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });
  }

  if (button) {
    button.addEventListener('click', function () {
      button.classList.add('is-hidden');
      playVideo();
    });
  }

  if (video) {
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== 'true') {
        if (button) {
          button.classList.add('is-hidden');
        }

        playVideo();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
