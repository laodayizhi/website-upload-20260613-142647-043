(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var opened = panel.classList.toggle("open");
                toggle.setAttribute("aria-expanded", opened ? "true" : "false");
                toggle.textContent = opened ? "×" : "☰";
            });
        }

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var clear = scope.querySelector("[data-filter-clear]");
            var list = document.querySelector("[data-filter-list]");
            var empty = document.querySelector("[data-filter-empty]");
            var params = new URLSearchParams(window.location.search);
            if (!input || !list) {
                return;
            }
            if (params.get("q")) {
                input.value = params.get("q");
            }
            function applyFilter() {
                var query = normalize(input.value);
                var shown = 0;
                list.querySelectorAll("[data-filter-item]").forEach(function (item) {
                    var haystack = normalize(item.getAttribute("data-search"));
                    var matched = !query || haystack.indexOf(query) !== -1;
                    item.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", shown === 0);
                }
            }
            input.addEventListener("input", applyFilter);
            if (clear) {
                clear.addEventListener("click", function () {
                    input.value = "";
                    applyFilter();
                    input.focus();
                });
            }
            applyFilter();
        });

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;
            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, itemIndex) {
                    slide.classList.toggle("active", itemIndex === current);
                });
                dots.forEach(function (dot, itemIndex) {
                    dot.classList.toggle("active", itemIndex === current);
                });
            }
            function restart() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5600);
            }
            if (slides.length > 1) {
                dots.forEach(function (dot) {
                    dot.addEventListener("click", function () {
                        show(Number(dot.getAttribute("data-hero-dot")) || 0);
                        restart();
                    });
                });
                if (prev) {
                    prev.addEventListener("click", function () {
                        show(current - 1);
                        restart();
                    });
                }
                if (next) {
                    next.addEventListener("click", function () {
                        show(current + 1);
                        restart();
                    });
                }
                restart();
            }
        });
    });

    window.createMoviePlayer = function (options) {
        ready(function () {
            var video = document.querySelector(options.videoSelector);
            var trigger = document.querySelector(options.triggerSelector);
            var source = options.source;
            var hlsInstance = null;
            if (!video || !trigger || !source) {
                return;
            }
            function bindSource() {
                if (hlsInstance) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }
            function start() {
                bindSource();
                trigger.classList.add("is-hidden");
                var playback = video.play();
                if (playback && typeof playback.catch === "function") {
                    playback.catch(function () {
                        trigger.classList.remove("is-hidden");
                    });
                }
            }
            trigger.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                trigger.classList.add("is-hidden");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    trigger.classList.remove("is-hidden");
                }
            });
        });
    };
}());
