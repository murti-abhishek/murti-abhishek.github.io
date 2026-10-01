(() => {
  const root = document.documentElement;
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle (follows system until the visitor picks) ---------- */
  const effectiveTheme = () => {
    const set = root.getAttribute("data-theme");
    if (set === "light" || set === "dark") return set;
    return darkQuery.matches ? "dark" : "light";
  };

  let onThemeChange = () => {};
  const toggle = document.getElementById("theme-toggle");
  const syncToggleLabel = () => {
    if (!toggle) return;
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", `Switch to ${next} mode`);
    toggle.title = `Switch to ${next} mode`;
  };

  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = effectiveTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncToggleLabel();
      onThemeChange();
    });
  }
  darkQuery.addEventListener?.("change", () => { syncToggleLabel(); onThemeChange(); });
  syncToggleLabel();

  /* ---------- Xenium-style section + spatialzones walkthrough ---------- */
  const canvas = document.getElementById("xen-canvas");
  if (!canvas || !window.d3 || !window.d3.Delaunay) return;

  const figure = canvas.closest(".xen");
  const stage = canvas.parentElement;
  const readout = document.getElementById("xen-readout");
  const legend = document.getElementById("xen-legend");
  const stepButtons = Array.from(figure.querySelectorAll(".steps button"));
  const ctx = canvas.getContext("2d");

  const CELL_UM = 12;      // typical center-to-center distance between segmented liver cells
  const TARGET_CELLS = 88; // cells across the stage width

  const TYPES = [
    { key: "tumor", name: "Tumor", token: "--c-tumor" },
    { key: "fibro", name: "Fibroblast", token: "--c-fibro" },
    { key: "myeloid", name: "Myeloid", token: "--c-myeloid" },
    { key: "endo", name: "Endothelial", token: "--c-endo" },
    { key: "lymph", name: "Lymphocyte", token: "--c-lymph" },
    { key: "hep", name: "Hepatocyte", token: "--c-hep" },
    { key: "bec", name: "BEC", token: "--c-bec" },
    { key: "vsmc", name: "VSMC", token: "--c-vsmc" },
  ];
  const REGIONS = [
    { key: "inside", name: "Inside", token: "--accent" },
    { key: "interface", name: "Interface (1 hop)", token: "--r-interface" },
    { key: "outside", name: "Outside", token: "--r-outside" },
  ];

  let W = 0, H = 0, s = 10;
  let cells = [];       // real cells (in tissue)
  let edges = [];       // [i, j] pairs between real cells
  let delaunay = null;
  let pointIndexToCell = [];
  let palette = {};
  let step = 1;
  let graphA = 0, graphTarget = 0; // neighbor graph opacity
  let rp = 0, rpTarget = 0;        // region wave progress, 0..5
  let hovered = null;
  let raf = 0;
  let autoplay = [];
  let counts = { inside: 0, interface: 0, outside: 0 };

  // Deterministic randomness so every visitor sees the same section
  let seed = 1;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const sigmoid = (x) => 1 / (1 + Math.exp(-x));
  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  function hexToRgb(hex) {
    const h = (hex || "#888888").trim().replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function readPalette() {
    const cs = getComputedStyle(root);
    const get = (t) => hexToRgb(cs.getPropertyValue(t));
    palette = { ink: get("--ink"), nucleus: get("--nucleus"), surface: get("--surface") };
    for (const t of TYPES) palette[t.key] = get(t.token);
    for (const r of REGIONS) palette["r-" + r.key] = get(r.token);
    palette.dark = effectiveTheme() === "dark";
  }

  // Section outline traced from a hepatoblastoma Xenium slide (slide pixel coordinates)
  const OUTLINE = [
    [968, 355], [1000, 318], [1040, 272], [1090, 228], [1150, 195], [1220, 175], [1290, 170], [1360, 180],
    [1425, 210], [1485, 262], [1530, 320], [1555, 385], [1562, 450], [1550, 510], [1525, 555], [1490, 585],
    [1445, 610], [1412, 616], [1402, 602], [1432, 578], [1462, 552], [1428, 562], [1380, 578], [1330, 602],
    [1296, 642], [1282, 700], [1268, 750], [1230, 762], [1190, 740], [1150, 702], [1095, 690], [1040, 668],
    [1000, 640], [970, 600], [955, 550], [958, 505], [985, 472], [1003, 458], [975, 442], [955, 410], [952, 380],
  ];
  const BOX = { x: 940, y: 160, w: 630, h: 610 };
  const VESSEL = { x: 992, y: 410, rIn: 13, rOut: 33 };
  // Tumor nests: dense in the upper right, a few large ones lower left [x, y, r]
  const NESTS = [
    [1250, 215, 26], [1180, 245, 18], [1305, 262, 22], [1385, 250, 30], [1455, 305, 26], [1505, 370, 20],
    [1420, 372, 30], [1338, 342, 20], [1258, 332, 16], [1515, 445, 22], [1448, 455, 28], [1378, 432, 18],
    [1490, 522, 18], [1195, 462, 32], [1300, 488, 16], [1118, 255, 13], [1062, 335, 12], [1005, 565, 32],
    [1160, 382, 13], [1352, 522, 13], [1225, 560, 11], [1100, 600, 10],
  ];

  function inPolygon(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  function build() {
    seed = 7;
    s = W / TARGET_CELLS;

    // Fit the traced section into the stage
    const k = Math.min(W / (BOX.w * 1.02), H / (BOX.h * 1.02));
    const ox = (W - BOX.w * k) / 2 - BOX.x * k;
    const oy = (H - BOX.h * k) / 2 - BOX.y * k;
    const toSlide = (x, y) => [(x - ox) / k, (y - oy) / k];
    const norm = (sx, sy) => [(sx - BOX.x) / BOX.w, (sy - BOX.y) / BOX.h];

    const kind = (x, y) => {
      const [sx, sy] = toSlide(x, y);
      const dv = Math.hypot(sx - VESSEL.x, sy - VESSEL.y);
      if (dv < VESSEL.rIn) return 0;          // lumen
      if (dv < VESSEL.rOut) return 2;         // vessel wall
      return inPolygon(sx, sy, OUTLINE) ? 1 : 0;
    };

    const field = (x, y) => {
      const [sx, sy] = toSlide(x, y);
      const wx = sx + 6 * Math.sin(sy / 17), wy = sy + 6 * Math.cos(sx / 15);
      let f = 0;
      for (const [nx, ny, nr] of NESTS) {
        const r = nr * 1.35;
        f = Math.max(f, Math.exp(-((wx - nx) ** 2 + (wy - ny) ** 2) / (r * r)));
      }
      return f;
    };

    // Jittered hex lattice of cell centroids; out-of-tissue points stay as ghosts to bound edge cells
    const pts = [];
    const meta = [];
    const rowH = s * Math.sqrt(3) / 2;
    for (let y = -s, r = 0; y < H + s; y += rowH, r++) {
      for (let x = -s + (r % 2 ? s / 2 : 0); x < W + s; x += s) {
        const px = x + (rand() - 0.5) * s * 0.55;
        const py = y + (rand() - 0.5) * s * 0.55;
        pts.push(px, py);
        let m = kind(px, py);
        if (m === 1) {
          const [u, v] = norm(...toSlide(px, py));
          const sparse = v > 0.45 && u < 0.62 ? 0.17 : 0.04; // looser tissue lower left
          if (rand() < sparse) m = 0;
        }
        meta.push(m);
      }
    }

    delaunay = new window.d3.Delaunay(Float64Array.from(pts));
    const voronoi = delaunay.voronoi([-s, -s, W + s, H + s]);

    const pick = (table) => {
      let v = rand();
      for (const [key, p] of table) { if ((v -= p) < 0) return key; }
      return table[table.length - 1][0];
    };
    const LOOSE = [["myeloid", 0.3], ["endo", 0.2], ["lymph", 0.14], ["fibro", 0.16], ["hep", 0.1], ["bec", 0.1]];

    cells = [];
    pointIndexToCell = new Array(meta.length).fill(-1);
    for (let i = 0; i < meta.length; i++) {
      if (!meta[i]) continue;
      const x = pts[2 * i], y = pts[2 * i + 1];
      let type;
      if (meta[i] === 2) {
        type = rand() < 0.75 ? "vsmc" : "endo";
      } else {
        const f = field(x, y);
        const [u, v] = norm(...toSlide(x, y));
        const lowerLeft = v > 0.45 && u < 0.62;
        const stromaW = sigmoid((0.5 - v) * 9 + (u - 0.3) * 6); // fibroblast-rich upper right
        if (rand() < sigmoid((f - 0.42) * 14) * 0.95 || rand() < (lowerLeft ? 0.3 : 0.12)) type = "tumor";
        else if (f > 0.14 && rand() < 0.65) type = "fibro"; // fibrous rim around nests
        else if (rand() < stromaW * 0.65) type = "fibro";
        else type = pick(LOOSE);
      }
      const poly = voronoi.cellPolygon(i);
      if (!poly) continue;
      // shrink the polygon toward the centroid so membranes read as gaps
      const shrunk = poly.map(([px, py]) => [x + (px - x) * 0.86, y + (py - y) * 0.86]);
      pointIndexToCell[i] = cells.length;
      cells.push({ i, x, y, type, poly: shrunk, nb: [], region: "outside", hop: Infinity, wave: 4, relabel: false,
        nucR: s * (0.16 + rand() * 0.06), order: 0 });
    }

    // Neighbor graph from the Delaunay triangulation, dropping long edges and ghost links
    edges = [];
    cells.forEach((c, ci) => {
      for (const j of delaunay.neighbors(c.i)) {
        const k = pointIndexToCell[j];
        if (k < 0) continue;
        const d = cells[k];
        if (Math.hypot(d.x - c.x, d.y - c.y) > s * 1.9) continue;
        c.nb.push(k);
        if (c.i < d.i) edges.push([ci, k]);
      }
    });

    assignRegions();

    const cx0 = W * 0.6, cy0 = H * 0.35;
    const maxD = Math.hypot(W, H);
    for (const c of cells) c.order = Math.hypot(c.x - cx0, c.y - cy0) / maxD;
    figure.style.setProperty("--scale-px", `${((100 / CELL_UM) * s).toFixed(1)}px`);
  }

  // spatialzones-style assignment: smooth tumor fraction over 2 hops, then hop distance from the region
  function assignRegions() {
    const isT = cells.map((c) => (c.type === "tumor" ? 1 : 0));
    const smooth = (vals) => cells.map((c, idx) => {
      let sum = vals[idx], n = 1;
      for (const k of c.nb) { sum += vals[k]; n++; }
      return sum / n;
    });
    const frac = smooth(smooth(isT));

    const inside = frac.map((f) => f >= 0.5);
    cells.forEach((c, idx) => {
      if (inside[idx]) { c.region = "inside"; c.hop = 0; c.wave = 0; }
    });

    // inside cells touching non-inside cells become interface (hop 1 relabel)
    cells.forEach((c, idx) => {
      if (inside[idx] && c.nb.some((k) => !inside[k])) {
        c.region = "interface"; c.relabel = true; c.wave = 1;
      }
    });

    // BFS outward from the region
    let frontier = cells.map((c, idx) => (inside[idx] ? idx : -1)).filter((v) => v >= 0);
    for (let hop = 1; hop <= 1; hop++) {
      const next = [];
      for (const idx of frontier) {
        for (const k of cells[idx].nb) {
          const d = cells[k];
          if (inside[k] || d.hop !== Infinity) continue;
          d.hop = hop; d.region = "interface"; d.wave = hop + 1;
          next.push(k);
        }
      }
      frontier = next;
    }
    for (const c of cells) if (c.hop === Infinity) { c.region = "outside"; c.wave = 3; }

    counts = { inside: 0, interface: 0, outside: 0 };
    for (const c of cells) counts[c.region]++;
  }

  const mixRgb = (a, b, t) => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t));
  const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const reveal = reduceMotion ? 1 : clamp01(introT);
    const dim = 1 - 0.62 * graphA;

    for (const c of cells) {
      const appear = reduceMotion ? 1 : clamp01((reveal * 1.5 - c.order * 1.1) * 3);
      if (appear <= 0) continue;
      const k = clamp01(rp - c.wave);
      const base = palette[c.type];
      const fill = k > 0 ? mixRgb(base, palette["r-" + c.region], k) : base;
      const alpha = appear * (dim + (1 - dim) * k);

      ctx.beginPath();
      const p = c.poly;
      ctx.moveTo(p[0][0], p[0][1]);
      for (let n = 1; n < p.length; n++) ctx.lineTo(p[n][0], p[n][1]);
      ctx.closePath();
      ctx.fillStyle = rgb(fill, alpha);
      ctx.fill();

      // DAPI-like nucleus
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.nucR, 0, Math.PI * 2);
      ctx.fillStyle = rgb(palette.nucleus, appear * (palette.dark ? 0.22 : 0.28));
      ctx.fill();
    }

    if (graphA > 0.01) {
      ctx.beginPath();
      for (const [a, b] of edges) {
        ctx.moveTo(cells[a].x, cells[a].y);
        ctx.lineTo(cells[b].x, cells[b].y);
      }
      ctx.strokeStyle = rgb(palette.ink, 0.32 * graphA);
      ctx.lineWidth = 0.7;
      ctx.stroke();
      ctx.fillStyle = rgb(palette.ink, 0.55 * graphA);
      for (const c of cells) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (hovered) {
      const p = hovered.poly;
      ctx.beginPath();
      ctx.moveTo(p[0][0], p[0][1]);
      for (let n = 1; n < p.length; n++) ctx.lineTo(p[n][0], p[n][1]);
      ctx.closePath();
      ctx.strokeStyle = rgb(palette.ink, 1);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.strokeStyle = rgb(palette.ink, 0.9);
      ctx.lineWidth = 1;
      for (const k of hovered.nb) {
        ctx.beginPath();
        ctx.moveTo(hovered.x, hovered.y);
        ctx.lineTo(cells[k].x, cells[k].y);
        ctx.stroke();
      }
    }
  }

  let introT = reduceMotion ? 1 : 0;
  function tick() {
    raf = 0;
    let moving = false;
    if (introT < 1) { introT = Math.min(1, introT + 0.03); moving = true; }
    const ease = reduceMotion ? 1 : 0.14;
    if (Math.abs(graphTarget - graphA) > 0.01) { graphA += (graphTarget - graphA) * ease; moving = true; }
    else graphA = graphTarget;
    if (rp !== rpTarget) {
      const speed = reduceMotion ? 10 : 0.07;
      rp = rpTarget > rp ? Math.min(rpTarget, rp + speed) : Math.max(rpTarget, rp - speed * 3);
      moving = true;
    }
    draw();
    if (moving) raf = requestAnimationFrame(tick);
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(tick); };

  function renderLegend() {
    if (!legend) return;
    const item = (rgbv, label, n) =>
      `<li><i style="--sw:${rgb(rgbv)}"></i>${label}${n !== undefined ? ` <b>${n.toLocaleString("en-US")}</b>` : ""}</li>`;
    if (step === 1) {
      const n = {};
      for (const c of cells) n[c.type] = (n[c.type] || 0) + 1;
      legend.innerHTML = TYPES.map((t) => item(palette[t.key], t.name, n[t.key] || 0)).join("");
    } else if (step === 2) {
      legend.innerHTML = `<li><b>${cells.length.toLocaleString("en-US")}</b> cells</li><li><b>${edges.length.toLocaleString("en-US")}</b> Delaunay edges</li><li>mean degree <b>${(2 * edges.length / cells.length).toFixed(1)}</b></li>`;
    } else {
      legend.innerHTML = REGIONS.map((r) => item(palette["r-" + r.key], r.name, counts[r.key])).join("");
    }
  }

  function setStep(n, fromUser) {
    if (fromUser) { autoplay.forEach(clearTimeout); autoplay = []; }
    if (n === 3 && step === 3) rp = 0; // replay the wave
    step = n;
    for (const b of stepButtons) b.setAttribute("aria-pressed", String(Number(b.dataset.step) === n));
    graphTarget = n === 2 ? 1 : 0;
    rpTarget = n === 3 ? 4 : 0;
    renderLegend();
    schedule();
  }

  function describe(c) {
    const id = `cell ${String(cells.indexOf(c)).padStart(4, "0")}`;
    const type = TYPES.find((t) => t.key === c.type).name;
    if (step === 1) return `${id} · ${type}`;
    if (step === 2) return `${id} · ${type} · ${c.nb.length} neighbors`;
    let where = c.region;
    if (c.relabel) where = "interface · relabeled from inside";
    else if (c.region === "interface") where = `interface · hop ${c.hop}`;
    else if (c.region === "outside") where = "outside · more than 1 hop";
    return `${id} · ${type} · ${where}`;
  }

  function onPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    let found = null;
    if (delaunay) {
      const k = pointIndexToCell[delaunay.find(x, y)];
      if (k >= 0 && Math.hypot(cells[k].x - x, cells[k].y - y) < s) found = cells[k];
    }
    if (found !== hovered) {
      hovered = found;
      if (readout) readout.textContent = found ? describe(found) : "Hover a cell to read it";
      schedule();
    }
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || (Math.abs(rect.width - W) < 1 && Math.abs(rect.height - H) < 1)) return;
    W = rect.width; H = rect.height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    hovered = null;
    build();
    renderLegend();
    schedule();
  }

  canvas.addEventListener("pointermove", onPointer);
  canvas.addEventListener("pointerdown", onPointer);
  canvas.addEventListener("pointerleave", () => {
    hovered = null;
    if (readout) readout.textContent = "Hover a cell to read it";
    schedule();
  });
  for (const b of stepButtons) b.addEventListener("click", () => setStep(Number(b.dataset.step), true));

  onThemeChange = () => { readPalette(); renderLegend(); schedule(); };

  readPalette();
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
  else window.addEventListener("resize", resize);
  resize();

  // Play the three steps once when the figure first comes into view
  if (reduceMotion) {
    setStep(3);
  } else {
    const start = () => {
      autoplay.push(setTimeout(() => setStep(2), 1400));
      autoplay.push(setTimeout(() => setStep(3), 3200));
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) { io.disconnect(); start(); }
      }, { threshold: 0.4 });
      io.observe(figure);
    } else start();
  }
})();
