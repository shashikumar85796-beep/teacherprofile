/*
 * Live spike raster: 48 Poisson neurons with a travelling excitability wave,
 * occasional assembly bursts, and a pointer "stimulus electrode".
 * Rows = units, x = last 1000 ms, bottom strip = population rate (10 ms bins).
 */
(function () {
  "use strict";

  var N = 48, WINDOW = 1000, BIN = 10, LEFT = 30, BOTTOM = 18, RATE_H = 0.24;

  function Raster(canvas, opts) {
    this.c = canvas;
    this.ctx = canvas.getContext("2d");
    this.onRate = opts.onRate || function () {};
    this.spikes = [];
    this.t = 0;
    this.nextBurst = 1200;
    this.stim = null;               // {row, strength}
    this.running = false;
    this.visible = true;
    this.base = [];
    for (var i = 0; i < N; i++) this.base.push(2 + Math.random() * 9);
    this.readColors();
    this.resize();
    for (var k = 0; k < WINDOW; k += 4) this.step(4); // prefill so the first frame is full
    this.draw();
    this.bind();
  }

  Raster.prototype.readColors = function () {
    var s = getComputedStyle(document.documentElement);
    var g = function (n, d) { return (s.getPropertyValue(n) || d).trim(); };
    this.col = {
      bg: g("--scope-bg", "#0B1120"), grid: g("--scope-grid", "#1B2438"), ink: g("--scope-ink", "#A9B4CC"),
      dot: g("--scope-dot", "#F2B04A"), hot: g("--scope-hot", "#FFE2A8"), trace: g("--scope-trace", "#8EA0FF")
    };
  };

  Raster.prototype.resize = function () {
    var r = this.c.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(200, r.width); this.h = Math.max(160, r.height);
    this.c.width = Math.round(this.w * dpr); this.c.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  Raster.prototype.rateOf = function (i, t) {
    var wave = (t / 2400) % 1 * (N + 16) - 8;           // sweeping excitability
    var d = i - wave, r = this.base[i] + 22 * Math.exp(-d * d / 18);
    if (this.stim) { var e = i - this.stim.row; r += 90 * Math.exp(-e * e / 6); }
    return r;
  };

  Raster.prototype.step = function (dt) {
    var t0 = this.t, p = dt / 1000;
    for (var i = 0; i < N; i++) {
      if (Math.random() < this.rateOf(i, t0) * p) this.spikes.push({ t: t0 + Math.random() * dt, i: i });
    }
    if (t0 >= this.nextBurst) {                          // cell assembly fires together
      var c = Math.floor(Math.random() * N), size = 8 + Math.floor(Math.random() * 10);
      for (var j = 0; j < size; j++) {
        var u = Math.min(N - 1, Math.max(0, c + Math.round((Math.random() - 0.5) * 20)));
        this.spikes.push({ t: t0 + Math.random() * 18, i: u });
      }
      this.nextBurst = t0 + 900 + Math.random() * 1600;
    }
    this.t += dt;
    this.spikes.sort(function (a, b) { return a.t - b.t; });
    var cut = this.t - WINDOW, k = 0;
    while (k < this.spikes.length && this.spikes[k].t < cut) k++;
    if (k > 0) this.spikes.splice(0, k);
  };

  Raster.prototype.draw = function () {
    var x = this.ctx, w = this.w, h = this.h, C = this.col;
    var plotW = w - LEFT - 8, rasterH = (h - BOTTOM) * (1 - RATE_H) - 6, rateTop = rasterH + 10, rateH = h - BOTTOM - rateTop;
    var rowH = rasterH / N, now = this.t;
    var X = function (t) { return LEFT + plotW * (1 - (now - t) / WINDOW); };

    x.fillStyle = C.bg; x.fillRect(0, 0, w, h);

    // grid + time axis (fixed ticks; spikes scroll under them)
    x.strokeStyle = C.grid; x.lineWidth = 1; x.fillStyle = C.ink; x.globalAlpha = 1;
    x.font = "10px 'IBM Plex Mono', ui-monospace, monospace"; x.textBaseline = "top";
    for (var g = 0; g <= 4; g++) {
      var gx = Math.round(LEFT + plotW * g / 4) + 0.5;
      x.beginPath(); x.moveTo(gx, 4); x.lineTo(gx, h - BOTTOM); x.stroke();
      var lab = String(-WINDOW + g * WINDOW / 4);
      x.globalAlpha = 0.55;
      x.textAlign = g === 0 ? "left" : g === 4 ? "right" : "center";
      x.fillText(lab, gx, h - BOTTOM + 4);
      x.globalAlpha = 1;
    }
    x.beginPath(); x.moveTo(LEFT, rateTop - 4.5); x.lineTo(LEFT + plotW, rateTop - 4.5); x.stroke();

    // unit labels
    x.textAlign = "right"; x.textBaseline = "middle"; x.globalAlpha = 0.55;
    [1, 16, 32, 48].forEach(function (u) { x.fillText(String(u), LEFT - 6, 4 + (u - 0.5) * rowH); });
    x.fillText("Hz", LEFT - 6, rateTop + rateH / 2);
    x.globalAlpha = 1;

    // stimulus electrode
    if (this.stim) {
      var sy = 4 + (this.stim.row + 0.5) * rowH;
      var grd = x.createLinearGradient(0, sy - 18, 0, sy + 18);
      grd.addColorStop(0, "rgba(142,160,255,0)"); grd.addColorStop(0.5, "rgba(142,160,255,.16)"); grd.addColorStop(1, "rgba(142,160,255,0)");
      x.fillStyle = grd; x.fillRect(LEFT, sy - 18, plotW, 36);
    }

    // spikes
    var tickH = Math.max(2, rowH * 0.72), bins = new Array(WINDOW / BIN).fill(0);
    for (var s = 0; s < this.spikes.length; s++) {
      var sp = this.spikes[s], age = now - sp.t, px = X(sp.t);
      var b = Math.floor((WINDOW - age) / BIN); if (b >= 0 && b < bins.length) bins[b]++;
      x.fillStyle = age < 40 ? C.hot : C.dot;
      x.globalAlpha = age < 40 ? 1 : 0.55 + 0.45 * (1 - age / WINDOW);
      x.fillRect(px - 0.75, 4 + sp.i * rowH + (rowH - tickH) / 2, 1.5, tickH);
    }
    x.globalAlpha = 1;

    // population rate (Hz per unit), drawn as area + line
    var maxHz = 60, toY = function (hz) { return rateTop + rateH - Math.min(1, hz / maxHz) * rateH; };
    var hzs = bins.map(function (n) { return n / N / (BIN / 1000); });
    x.beginPath(); x.moveTo(LEFT, rateTop + rateH);
    hzs.forEach(function (hz, k) { x.lineTo(LEFT + plotW * (k + 0.5) / hzs.length, toY(hz)); });
    x.lineTo(LEFT + plotW, rateTop + rateH); x.closePath();
    x.fillStyle = C.trace; x.globalAlpha = 0.18; x.fill(); x.globalAlpha = 1;
    x.beginPath();
    hzs.forEach(function (hz, k) { var px = LEFT + plotW * (k + 0.5) / hzs.length; k ? x.lineTo(px, toY(hz)) : x.moveTo(px, toY(hz)); });
    x.strokeStyle = C.trace; x.lineWidth = 1.25; x.stroke();

    // readout: mean rate over last 200 ms
    var recent = hzs.slice(-20), mean = recent.reduce(function (a, v) { return a + v; }, 0) / recent.length;
    this.onRate(mean);
  };

  Raster.prototype.loop = function (ts) {
    if (!this.running) return;
    var dt = this.last ? Math.min(50, ts - this.last) : 16;
    this.last = ts;
    this.step(dt); this.draw();
    requestAnimationFrame(this.loop.bind(this));
  };

  Raster.prototype.play = function () {
    if (this.running || !this.visible || document.hidden) return;
    this.running = true; this.last = 0;
    requestAnimationFrame(this.loop.bind(this));
  };
  Raster.prototype.stop = function () { this.running = false; };

  Raster.prototype.bind = function () {
    var self = this, c = this.c;
    var setStim = function (clientY) {
      var r = c.getBoundingClientRect(), rasterH = (self.h - BOTTOM) * (1 - RATE_H) - 6;
      var row = Math.floor((clientY - r.top - 4) / (rasterH / N));
      self.stim = row >= 0 && row < N ? { row: row } : null;
      if (!self.running) self.draw();
    };
    c.addEventListener("pointermove", function (e) { setStim(e.clientY); });
    c.addEventListener("pointerdown", function (e) { setStim(e.clientY); });
    c.addEventListener("pointerleave", function () { self.stim = null; if (!self.running) self.draw(); });
    if ("ResizeObserver" in window) new ResizeObserver(function () { self.resize(); self.draw(); }).observe(c);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        self.visible = es[0].isIntersecting;
        if (!self.visible) self.stop(); else if (!self.paused) self.play();
      }).observe(c);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) self.stop(); else if (!self.paused) self.play();
    });
    document.addEventListener("themechange", function () { self.readColors(); self.draw(); });
  };

  window.Raster = Raster;
})();
