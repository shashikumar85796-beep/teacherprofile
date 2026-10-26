(function () {
  "use strict";

  var S = window.SITE, P = S.person;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };
  var TYPES = { journal: "Journal", conference: "Conference", preprint: "Preprint", book: "Chapter" };
  var themeById = {};
  S.research.forEach(function (r) { themeById[r.id] = r; });

  /* ---------- toast + clipboard ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2200);
  }
  function selectText(node) {
    var r = document.createRange(); r.selectNodeContents(node);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }
  function copy(text, label, fallbackNode) {
    var done = function () { toast(label + " copied"); };
    var fail = function () { if (fallbackNode) selectText(fallbackNode); toast("Press Ctrl+C to copy the selected " + label.toLowerCase()); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail);
    else fail();
  }
  function copyEmail() { copy(P.email, "Email address", $("#email-text")); }

  /* ---------- static bindings ---------- */
  function renderPerson() {
    $$("[data-bind]").forEach(function (n) { var v = P[n.dataset.bind]; if (v != null) n.textContent = v; });
    $(".brand__name").textContent = P.citeName;
    $("#mailto").href = "mailto:" + P.email;
    $("#year").textContent = new Date().getFullYear();
    document.title = P.honorific + " " + P.name;

    var labels = { cv: "CV (PDF)", scholar: "Google Scholar", orcid: "ORCID", github: "GitHub", linkedin: "LinkedIn" };
    $("#profiles").innerHTML = Object.keys(labels).map(function (k) {
      var url = P.links[k];
      return url ? '<li><a href="' + esc(url) + '" target="_blank" rel="noopener">' + labels[k] + " ↗</a></li>" : "";
    }).join("");
    if (!$("#profiles").children.length) $("#profiles").hidden = true;

    $("#metrics").innerHTML = S.metrics.map(function (m) {
      return '<div><dt>' + esc(m.label) + '</dt><dd data-count="' + m.value + '">' + m.value.toLocaleString("en-US") + "</dd></div>";
    }).join("");

    $("#bio").innerHTML = S.bio.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    $("#education").innerHTML = S.education.map(function (e) { return "<li><b>" + esc(e.year) + "</b><span>" + esc(e.what) + "</span></li>"; }).join("");

    var ld = {
      "@context": "https://schema.org", "@type": "Person", name: P.name, honorificPrefix: P.honorific, jobTitle: P.role,
      email: "mailto:" + P.email, worksFor: { "@type": "CollegeOrUniversity", name: P.institute },
      knowsAbout: S.research.map(function (r) { return r.title; }),
      sameAs: Object.keys(P.links).map(function (k) { return P.links[k]; }).filter(Boolean)
    };
    var s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  }

  /* count-up for metrics, once, only when motion is welcome */
  function countUp() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    $$("[data-count]").forEach(function (n) {
      var end = +n.dataset.count, t0 = performance.now(), dur = 1100;
      (function tick(now) {
        var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        n.textContent = Math.round(end * e).toLocaleString("en-US");
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }

  /* ---------- research ---------- */
  function renderResearch() {
    $("#themes").innerHTML = S.research.map(function (r) {
      var n = S.publications.filter(function (p) { return p.theme === r.id; }).length;
      return '<button class="theme" type="button" data-theme-id="' + r.id + '">' +
        '<span class="theme__top"><span class="theme__title">' + esc(r.title) + '</span><span class="theme__count">' + n + " papers →</span></span>" +
        '<span class="theme__body">' + esc(r.body) + "</span>" +
        '<span class="theme__kw">' + r.keywords.map(function (k) { return "<span>" + esc(k) + "</span>"; }).join("") + "</span></button>";
    }).join("");
    $("#themes").addEventListener("click", function (e) {
      var b = e.target.closest("[data-theme-id]"); if (!b) return;
      setFilters({ theme: b.dataset.themeId, type: "all", q: "", selected: false });
      $("#publications").scrollIntoView();
    });
  }

  /* ---------- publications ---------- */
  var F = { q: "", type: "all", theme: "all", selected: false };

  function bibtex(p) {
    var first = p.authors[0].split(" ").pop().toLowerCase().replace(/[^a-z]/g, "");
    var word = p.title.split(/\s+/).find(function (w) { return w.length > 3; }) || "paper";
    var key = first + p.year + word.toLowerCase().replace(/[^a-z]/g, "");
    var kind = p.type === "journal" ? "article" : p.type === "book" ? "incollection" : p.type === "preprint" ? "misc" : "inproceedings";
    var venueField = p.type === "journal" ? "journal" : p.type === "book" ? "booktitle" : p.type === "preprint" ? "howpublished" : "booktitle";
    var lines = [
      "@" + kind + "{" + key + ",",
      "  title     = {" + p.title + "},",
      "  author    = {" + p.authors.join(" and ") + "},",
      "  " + (venueField + "          ").slice(0, 10) + "= {" + p.venue + "},",
      "  year      = {" + p.year + "}" + (p.doi ? "," : "")
    ];
    if (p.doi) lines.push("  doi       = {" + p.doi + "}");
    lines.push("}");
    return lines.join("\n");
  }

  function hl(text, q) {
    var s = esc(text);
    if (!q) return s;
    var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    return s.replace(re, "<mark>$1</mark>");
  }

  function matches(p) {
    if (F.type !== "all" && p.type !== F.type) return false;
    if (F.theme !== "all" && p.theme !== F.theme) return false;
    if (F.selected && !p.selected) return false;
    if (F.q) {
      var hay = (p.title + " " + p.venue + " " + p.authors.join(" ") + " " + p.year).toLowerCase();
      return F.q.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
    }
    return true;
  }

  function renderPubs() {
    var list = S.publications.filter(matches).sort(function (a, b) { return b.year - a.year; });
    var byYear = {};
    list.forEach(function (p) { (byYear[p.year] = byYear[p.year] || []).push(p); });
    var years = Object.keys(byYear).sort(function (a, b) { return b - a; });

    $("#pub-count").textContent = "Showing " + list.length + " of " + S.publications.length + " publications" +
      (F.theme !== "all" ? " · " + themeById[F.theme].title : "");

    if (!list.length) {
      $("#pub-list").innerHTML = '<p class="empty">No publications match these filters. <button class="linkbtn" type="button" data-reset>Clear filters</button></p>';
      return;
    }
    $("#pub-list").innerHTML = years.map(function (y) {
      return '<section class="pubyear"><h3 class="pubyear__y">' + y + '</h3><ol class="pubyear__items">' +
        byYear[y].map(function (p) {
          var idx = S.publications.indexOf(p);
          var authors = p.authors.map(function (a) { return a === P.citeName ? "<b>" + hl(a, F.q) + "</b>" : hl(a, F.q); }).join(", ");
          var links = [
            p.pdf && '<a href="' + esc(p.pdf) + '" target="_blank" rel="noopener">PDF</a>',
            p.doi && '<a href="https://doi.org/' + esc(p.doi) + '" target="_blank" rel="noopener">DOI</a>',
            p.code && '<a href="' + esc(p.code) + '" target="_blank" rel="noopener">Code</a>'
          ].filter(Boolean).join("");
          return '<li class="pub" id="pub-' + idx + '">' +
            '<p class="pub__title">' + hl(p.title, F.q) + "</p>" +
            '<p class="pub__authors">' + authors + "</p>" +
            '<div class="pub__meta"><span class="pub__venue">' + hl(p.venue, F.q) + "</span>" +
            '<span class="badge">' + TYPES[p.type] + "</span>" +
            (p.selected ? '<span class="badge badge--sel">Selected</span>' : "") +
            links +
            '<button class="linkbtn" type="button" data-bib="' + idx + '" aria-expanded="false">Cite</button></div></li>';
        }).join("") + "</ol></section>";
    }).join("");
  }

  function setFilters(next) {
    Object.keys(next).forEach(function (k) { F[k] = next[k]; });
    $("#pub-q").value = F.q;
    $("#pub-theme").value = F.theme;
    $("#pub-selected").checked = F.selected;
    $$("#pub-types .chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.type === F.type)); });
    renderPubs();
  }

  function initPubs() {
    var types = ["all"].concat(Object.keys(TYPES).filter(function (t) { return S.publications.some(function (p) { return p.type === t; }); }));
    $("#pub-types").innerHTML = types.map(function (t) {
      return '<button class="chip" type="button" data-type="' + t + '" aria-pressed="' + (t === "all") + '">' + (t === "all" ? "All" : TYPES[t]) + "</button>";
    }).join("");
    $("#pub-theme").innerHTML = '<option value="all">All themes</option>' + S.research.map(function (r) {
      return '<option value="' + r.id + '">' + esc(r.title) + "</option>";
    }).join("");

    $("#pub-types").addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (c) setFilters({ type: c.dataset.type }); });
    $("#pub-theme").addEventListener("change", function (e) { setFilters({ theme: e.target.value }); });
    $("#pub-selected").addEventListener("change", function (e) { setFilters({ selected: e.target.checked }); });
    var deb;
    $("#pub-q").addEventListener("input", function (e) { clearTimeout(deb); deb = setTimeout(function () { F.q = e.target.value.trim(); renderPubs(); }, 120); });

    $("#pub-list").addEventListener("click", function (e) {
      if (e.target.closest("[data-reset]")) { setFilters({ q: "", type: "all", theme: "all", selected: false }); return; }
      var cp = e.target.closest("[data-bib-copy]");
      if (cp) { var pre = cp.parentNode.querySelector("pre"); copy(pre.textContent, "BibTeX", pre); return; }
      var b = e.target.closest("[data-bib]"); if (!b) return;
      var li = b.closest(".pub"), open = li.querySelector(".bib");
      if (open) { open.remove(); b.setAttribute("aria-expanded", "false"); return; }
      var div = document.createElement("div"); div.className = "bib";
      div.innerHTML = "<pre>" + esc(bibtex(S.publications[+b.dataset.bib])) + '</pre><button type="button" data-bib-copy>Copy</button>';
      li.appendChild(div); b.setAttribute("aria-expanded", "true");
    });
    renderPubs();
  }

  /* ---------- lab, teaching, news ---------- */
  function initials(n) { return n.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2); }
  function renderRest() {
    $("#people").innerHTML = S.group.map(function (m) {
      return '<li class="person"><span class="avatar" aria-hidden="true">' + esc(initials(m.name)) + "</span><div>" +
        '<p class="person__name">' + esc(m.name) + '</p><p class="person__role">' + esc(m.role) + '</p><p class="person__topic">' + esc(m.topic) + "</p></div></li>";
    }).join("");
    $("#openings").innerHTML = S.openings.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("");
    $("#courses").innerHTML = S.teaching.map(function (c) {
      return '<article class="course"><span class="course__code">' + esc(c.code) + "</span><h3>" + esc(c.title) + "</h3>" +
        '<span class="course__term">' + esc(c.term) + " · " + esc(c.level) + "</span><p>" + esc(c.note) + "</p></article>";
    }).join("");
    var fmt = function (d) { var p = d.split("-"); return new Date(+p[0], +p[1] - 1, 1).toLocaleString("en-US", { month: "short", year: "numeric" }); };
    $("#news-list").innerHTML = S.news.map(function (n) {
      return '<li><time datetime="' + n.date + '">' + fmt(n.date) + '</time><span class="kind">' + esc(n.kind) + "</span><span>" + esc(n.text) + "</span></li>";
    }).join("");
    $("#grants").innerHTML = S.grants.map(function (g) {
      return "<li><span>" + esc(g.years) + " · " + esc(g.role) + "</span>" + esc(g.title) + "</li>";
    }).join("");
  }

  /* ---------- theme ---------- */
  function initTheme() {
    var saved = store.get("theme");
    if (saved === "light" || saved === "dark") document.documentElement.dataset.theme = saved;
    $("#theme-toggle").addEventListener("click", toggleTheme);
  }
  function toggleTheme() {
    var root = document.documentElement;
    var dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    store.set("theme", root.dataset.theme);
    document.dispatchEvent(new Event("themechange"));
    toast((dark ? "Light" : "Dark") + " theme");
  }

  /* ---------- nav: scrolled state + scrollspy ---------- */
  function initNav() {
    var bar = $(".topbar");
    var onScroll = function () { bar.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    if (!("IntersectionObserver" in window)) return;
    var links = $$(".nav a");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$("main section[id]").forEach(function (s) { io.observe(s); });
  }

  /* ---------- command palette ---------- */
  function initPalette() {
    var dlg = $("#palette"), input = $("#palette-q"), list = $("#palette-list"), items = [], sel = 0;
    var go = function (id) { return function () { var el = document.getElementById(id); if (el) el.scrollIntoView(); }; };
    var base = [
      { kind: "Section", text: "About", run: go("about") },
      { kind: "Section", text: "Research", run: go("research") },
      { kind: "Section", text: "Publications", run: go("publications") },
      { kind: "Section", text: "Lab & open positions", run: go("group") },
      { kind: "Section", text: "Teaching", run: go("teaching") },
      { kind: "Section", text: "News & funding", run: go("news") },
      { kind: "Section", text: "Contact & office hours", run: go("contact") },
      { kind: "Action", text: "Copy email address", run: copyEmail },
      { kind: "Action", text: "Toggle light / dark theme", run: toggleTheme },
      { kind: "Action", text: "Show selected publications", run: function () { setFilters({ q: "", type: "all", theme: "all", selected: true }); go("publications")(); } }
    ];
    S.research.forEach(function (r) {
      base.push({ kind: "Theme", text: r.title, run: function () { setFilters({ theme: r.id, q: "", type: "all", selected: false }); go("publications")(); } });
    });
    S.publications.forEach(function (p, i) {
      base.push({ kind: "Paper", text: p.title + " · " + p.venue + " " + p.year, run: function () {
        setFilters({ q: "", type: "all", theme: "all", selected: false });
        var el = document.getElementById("pub-" + i);
        if (el) { el.scrollIntoView({ block: "center" }); el.animate && el.animate([{ background: "var(--signal-soft)" }, { background: "transparent" }], { duration: 1600 }); }
      } });
    });

    function render() {
      var q = input.value.trim().toLowerCase();
      items = !q ? base.filter(function (b) { return b.kind !== "Paper"; }) : base.filter(function (b) {
        var t = (b.kind + " " + b.text).toLowerCase();
        return q.split(/\s+/).every(function (w) { return t.indexOf(w) !== -1; });
      }).slice(0, 30);
      sel = Math.min(sel, Math.max(0, items.length - 1));
      list.innerHTML = items.length ? items.map(function (it, i) {
        return '<li class="palette__item" role="option" id="pi-' + i + '" aria-selected="' + (i === sel) + '" data-i="' + i + '">' +
          '<span class="palette__kind">' + it.kind + '</span><span class="palette__text">' + esc(it.text) + "</span></li>";
      }).join("") : '<li class="palette__empty">Nothing matches “' + esc(input.value) + "”.</li>";
      input.setAttribute("aria-activedescendant", items.length ? "pi-" + sel : "");
    }
    function move(d) {
      if (!items.length) return;
      sel = (sel + d + items.length) % items.length; render();
      var el = document.getElementById("pi-" + sel); if (el) el.scrollIntoView({ block: "nearest" });
    }
    function run(i) { var it = items[i]; if (!it) return; close(); setTimeout(it.run, 30); }
    function open() { if (dlg.open) return; input.value = ""; sel = 0; render(); dlg.showModal(); input.focus(); }
    function close() { if (dlg.open) dlg.close(); }

    $("#open-palette").addEventListener("click", open);
    document.addEventListener("keydown", function (e) {
      var typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); dlg.open ? close() : open(); }
      else if (e.key === "/" && !typing && !dlg.open) { e.preventDefault(); open(); }
    });
    input.addEventListener("input", function () { sel = 0; render(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") { e.preventDefault(); run(sel); }
    });
    list.addEventListener("click", function (e) { var li = e.target.closest("[data-i]"); if (li) run(+li.dataset.i); });
    list.addEventListener("pointermove", function (e) {
      var li = e.target.closest("[data-i]"); if (!li || +li.dataset.i === sel) return;
      sel = +li.dataset.i; $$(".palette__item", list).forEach(function (n, i) { n.setAttribute("aria-selected", String(i === sel)); });
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
    var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    $("#open-palette kbd").textContent = isMac ? "⌘K" : "Ctrl K";
  }

  /* ---------- raster ---------- */
  function initRaster() {
    var canvas = $("#raster"); if (!canvas || !window.Raster) return;
    var readout = $("#rate-readout"), scope = $(".scope"), btn = $("#raster-pause");
    var r = new window.Raster(canvas, { onRate: function (hz) { readout.textContent = hz.toFixed(1); } });
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var setPaused = function (p) {
      r.paused = p; scope.classList.toggle("is-paused", p);
      btn.textContent = p ? "Play" : "Pause"; btn.setAttribute("aria-pressed", String(p));
      p ? r.stop() : r.play();
    };
    btn.addEventListener("click", function () { setPaused(!r.paused); });
    setPaused(reduced);
  }

  /* ---------- boot ---------- */
  initTheme();
  renderPerson();
  renderResearch();
  initPubs();
  renderRest();
  initNav();
  initPalette();
  initRaster();
  $$("[data-copy-email]").forEach(function (b) { b.addEventListener("click", copyEmail); });
  countUp();
})();
