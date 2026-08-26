(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("menu-principal");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
  }

  var heroVideo = document.querySelector(".hero__video");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function heroShouldPlay() {
    return heroVideo && !reduceMotion.matches && !document.hidden;
  }

  function syncHeroVideo(inView) {
    if (!heroVideo) return;
    if (heroShouldPlay() && inView !== false) {
      var play = heroVideo.play();
      if (play && play.catch) play.catch(function () {});
    } else {
      heroVideo.pause();
    }
  }

  if (heroVideo) {
    var inView = true;
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          inView = entries[0] && entries[0].isIntersecting;
          syncHeroVideo(inView);
        },
        { threshold: 0.15 }
      );
      observer.observe(heroVideo);
    }
    document.addEventListener("visibilitychange", function () {
      syncHeroVideo(inView);
    });
    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener("change", function () {
        syncHeroVideo(inView);
      });
    }
    syncHeroVideo(inView);
  }

  var input = document.getElementById("filtro-geoportal");
  var items = document.querySelectorAll("[data-geoportal]");
  var empty = document.getElementById("geoportal-vacio");
  if (!input || !items.length) return;

  input.addEventListener("input", function () {
    var q = input.value.trim().toLowerCase();
    var visible = 0;
    items.forEach(function (item) {
      var match = !q || item.getAttribute("data-geoportal").indexOf(q) !== -1;
      item.hidden = !match;
      if (match) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
  });
})();
