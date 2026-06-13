(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs("[data-mobile-toggle]");
    var nav = qs("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initSearchForms() {
    qsa("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "./search.html?q=" + encodeURIComponent(query);
        }
      });
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (!slides.length) {
      return;
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    show(0);
    restart();
  }

  function initFilters() {
    var groups = qsa("[data-filter-group]");
    groups.forEach(function (group) {
      var buttons = qsa("[data-filter-button]", group);
      var scope = group.getAttribute("data-filter-scope") || "document";
      var root = scope === "parent" ? group.parentElement : document;
      var cards = qsa("[data-movie-card]", root);
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var value = button.getAttribute("data-filter-button");
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          cards.forEach(function (card) {
            var type = card.getAttribute("data-type") || "";
            var genre = card.getAttribute("data-genre") || "";
            var region = card.getAttribute("data-region") || "";
            var text = (type + " " + genre + " " + region).toLowerCase();
            var matched = value === "all" || text.indexOf(value.toLowerCase()) !== -1;
            card.classList.toggle("hidden-card", !matched);
          });
        });
      });
    });
  }

  function initImages() {
    qsa("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.style.opacity = "0";
      });
    });
  }

  function initSearchPage() {
    var results = qs("[data-search-results]");
    if (!results || !window.movieIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = qs("[data-search-page-input]");
    if (input) {
      input.value = query;
    }
    var list = window.movieIndex;
    var matched = list;
    if (query) {
      var lower = query.toLowerCase();
      matched = list.filter(function (item) {
        return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.line].join(" ").toLowerCase().indexOf(lower) !== -1;
      });
    } else {
      matched = list.slice(0, 72);
    }
    if (!matched.length) {
      results.innerHTML = '<div class="search-results-empty">未找到匹配内容，可尝试输入片名、类型、年份或地区。</div>';
      return;
    }
    results.innerHTML = matched.slice(0, 120).map(function (item) {
      return '<article class="movie-card" data-movie-card data-type="' + item.type + '" data-genre="' + item.genre + '" data-region="' + item.region + '">' +
        '<a class="card-poster" href="./' + item.file + '">' +
        '<img src="' + item.cover + '" alt="' + item.title + '">' +
        '<span class="card-badge">' + item.type + '</span>' +
        '<span class="card-year">' + item.year + '</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<h3 class="card-title"><a href="./' + item.file + '">' + item.title + '</a></h3>' +
        '<p class="card-line">' + item.line + '</p>' +
        '<div class="card-meta"><span>' + item.region + '</span><span>' + item.genre + '</span></div>' +
        '</div>' +
        '</article>';
    }).join("");
    initImages();
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
    initImages();
    initSearchPage();
  });
}());
