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
      Lobule.recolor();
    });
  }
  darkQuery.addEventListener?.("change", () => { syncToggleLabel(); Lobule.recolor(); });
  syncToggleLabel();

  /* ---------- Lobule map ---------- */
  const Lobule = (() => {
    const canvas = document.getElementById("lobule-canvas");
    if (!canvas) return { recolor() {} };

    const figure = canvas.closest(".lobule");
    const stage = canvas.parentElement;
    const readout = document.getElementById("lobule-readout");
    const buttons = Array.from(document.querySelectorAll(".gene-switch button"));
    const ctx = canvas.getContext("2d");

    const COLS = 30;          // spots across the capture area
    const PITCH_UM = 100;     // Visium center-to-center distance
    const SPOT_RATIO = 0.275; // 55 µm spot diameter / 100 µm pitch, as a radius fraction
    const LOBULE_R = 6.2;     // lobule circumradius, in pitches (~620 µm)

    let spots = [];
    let veins = [];
    let pitch = 10;
    let width = 0;
    let height = 0;
    let colors = {};
    let gene = "CYP2E1";
    let mix = { cyp: 1, cps: 0 };       // current channel weights (animated)
    let target = { cyp: 1, cps: 0 };
    let reveal = reduceMotion ? 1 : 0;  // 0..1 load-in progress
    let hovered = null;
    let raf = 0;

    // Deterministic noise so the map is the same on every visit
    let seed = 20240815;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const gauss = () => {
      const u = Math.max(rand(), 1e-9);
      const v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    const sigmoid = (x) => 1 / (1 + Math.exp(-x));

    function hexToRgb(hex) {
      const h = hex.trim().replace("#", "");
      const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
      const n = parseInt(full, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    function readColors() {
      const cs = getComputedStyle(root);
      const get = (name) => hexToRgb(cs.getPropertyValue(name) || "#888888");
      colors = {
        low: get("--spot-low"),
        empty: get("--spot-empty"),
        cyp: get("--accent"),
        cps: get("--accent-2"),
        ink: get("--ink"),
        dark: effectiveTheme() === "dark",
      };
    }

    function build() {
      seed = 20240815;
      spots = [];
      veins = [];
      pitch = width / (COLS - 0.5);
      const rowH = pitch * Math.sqrt(3) / 2;
      const rows = Math.ceil(height / rowH) + 1;
      const R = LOBULE_R * pitch;

      // Pointy-top hexagonal lobule tiling; central veins at centers, portal triads at vertices
      const centers = [];
      const portals = [];
      const dx = Math.sqrt(3) * R;
      const dy = 1.5 * R;
      for (let j = -2; j * dy < height + 2 * R; j++) {
        for (let i = -2; i * dx < width + 2 * R; i++) {
          const cx = i * dx + (j % 2 ? dx / 2 : 0) + width * 0.08;
          const cy = j * dy + height * 0.12;
          centers.push([cx, cy]);
          for (let k = 0; k < 6; k++) {
            const a = Math.PI / 2 + (k * Math.PI) / 3;
            portals.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
          }
        }
      }

      // Gentle domain warp so lobules look like tissue, not a honeycomb
      const warp = (x, y) => [
        x + pitch * 0.9 * Math.sin(y / (pitch * 7.3) + 1.1) + pitch * 0.5 * Math.sin((x + y) / (pitch * 4.1)),
        y + pitch * 0.9 * Math.sin(x / (pitch * 6.7) + 0.4) + pitch * 0.5 * Math.cos((x - y) / (pitch * 5.3)),
      ];

      // Irregular tissue outline on the capture area
      const tcx = width * 0.47;
      const tcy = height * 0.52;
      const tr = Math.min(width, height) * 0.62;
      const inTissue = (x, y) => {
        const ang = Math.atan2((y - tcy) * 1.15, x - tcx);
        const r = tr * (1 + 0.09 * Math.sin(3 * ang + 1.3) + 0.06 * Math.sin(5 * ang + 2.1) + 0.04 * Math.sin(8 * ang));
        return Math.hypot(x - tcx, (y - tcy) * 1.15) < r;
      };

      for (const [cx, cy] of centers) {
        const [wx, wy] = [cx, cy];
        if (wx > -pitch && wx < width + pitch && wy > -pitch && wy < height + pitch && inTissue(wx, wy)) {
          veins.push([wx, wy]);
        }
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < COLS; c++) {
          const x = c * pitch + (r % 2 ? pitch / 2 : 0) + pitch * 0.25;
          const y = r * rowH + pitch * 0.5;
          if (x > width - pitch * 0.2 || y > height - pitch * 0.3) continue;

          const [ux, uy] = warp(x, y);
          let dc = Infinity;
          for (const [cx, cy] of centers) dc = Math.min(dc, Math.hypot(ux - cx, uy - cy));
          let dp = Infinity;
          for (const [px, py] of portals) dp = Math.min(dp, Math.hypot(ux - px, uy - py));
          const zone = dc / (dc + dp); // 0 = central vein, 1 = portal triad

          const tissue = inTissue(x, y) && dc > pitch * 0.55; // vein lumen has no tissue
          const cyp = Math.max(0, 3.1 * sigmoid((0.42 - zone) * 12) + 0.3 * gauss());
          const cps = Math.max(0, 2.9 * sigmoid((zone - 0.6) * 12) + 0.3 * gauss());
          spots.push({ x, y, r, c, zone, tissue, cyp, cps, d: Math.hypot(x - tcx, y - tcy) });
        }
      }

      // Draw veins at their unwarped-to-warped approximate screen position: find the tissue gap nearest each center
      veins = veins.map(([vx, vy]) => {
        let best = null;
        for (const s of spots) {
          const [ux, uy] = warp(s.x, s.y);
          const d = Math.hypot(ux - vx, uy - vy);
          if (!best || d < best.d) best = { x: s.x, y: s.y, d };
        }
        return best ? [best.x, best.y] : [vx, vy];
      });

      const maxD = Math.max(...spots.map((s) => s.d));
      for (const s of spots) s.order = s.d / maxD;

      figure.style.setProperty("--scale-px", `${(5 * pitch).toFixed(1)}px`);
    }

    function spotColor(s) {
      if (!s.tissue) return null;
      const t1 = Math.min(1, s.cyp / 3.2) * mix.cyp;
      const t2 = Math.min(1, s.cps / 3.0) * mix.cps;
      const out = [0, 1, 2].map((i) => {
        const base = colors.low[i];
        const v = base + t1 * (colors.cyp[i] - base) + t2 * (colors.cps[i] - base);
        return Math.round(Math.max(0, Math.min(255, v)));
      });
      return `rgb(${out[0]},${out[1]},${out[2]})`;
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const rad = pitch * SPOT_RATIO * 1.4; // drawn slightly larger than true size for legibility
      const [er, eg, eb] = colors.empty;
      const [ir, ig, ib] = colors.ink;

      for (const s of spots) {
        const p = reduceMotion ? 1 : Math.max(0, Math.min(1, (reveal * 1.4 - s.order * 0.9) * 2.2));
        if (p <= 0) continue;
        ctx.beginPath();
        ctx.arc(s.x, s.y, rad * (0.4 + 0.6 * p), 0, Math.PI * 2);
        const fill = spotColor(s);
        if (fill) {
          ctx.globalAlpha = p;
          ctx.fillStyle = fill;
          ctx.fill();
        } else {
          ctx.globalAlpha = p * 0.9;
          ctx.strokeStyle = `rgb(${er},${eg},${eb})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // Central vein markers
      if (reveal > 0.6) {
        ctx.globalAlpha = Math.min(1, (reveal - 0.6) * 2.5) * 0.55;
        ctx.strokeStyle = `rgb(${ir},${ig},${ib})`;
        ctx.lineWidth = 1.2;
        for (const [vx, vy] of veins) {
          ctx.beginPath();
          ctx.arc(vx, vy, pitch * 0.42, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      if (hovered) {
        ctx.beginPath();
        ctx.arc(hovered.x, hovered.y, rad + 3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgb(${ir},${ig},${ib})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    function tick() {
      raf = 0;
      let moving = false;
      if (reveal < 1) {
        reveal = Math.min(1, reveal + 0.022);
        moving = true;
      }
      for (const k of ["cyp", "cps"]) {
        const diff = target[k] - mix[k];
        if (Math.abs(diff) > 0.01) {
          mix[k] += diff * (reduceMotion ? 1 : 0.16);
          moving = true;
        } else {
          mix[k] = target[k];
        }
      }
      draw();
      if (moving) raf = requestAnimationFrame(tick);
    }

    const schedule = () => { if (!raf) raf = requestAnimationFrame(tick); };

    function resize() {
      const rect = stage.getBoundingClientRect();
      if (!rect.width) return;
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      build();
      schedule();
    }

    function zoneName(z) {
      if (z < 0.34) return "pericentral (zone 3)";
      if (z < 0.66) return "mid-lobular (zone 2)";
      return "periportal (zone 1)";
    }

    function describe(s) {
      const id = `spot r${String(s.r).padStart(2, "0")} c${String(s.c).padStart(2, "0")}`;
      if (!s.tissue) return `${id} · no tissue`;
      return `${id} · ${zoneName(s.zone)} · CYP2E1 ${s.cyp.toFixed(2)} · CPS1 ${s.cps.toFixed(2)}`;
    }

    function onPointer(event) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      let best = null;
      let bestD = pitch * 0.6;
      for (const s of spots) {
        const d = Math.hypot(s.x - x, s.y - y);
        if (d < bestD) { best = s; bestD = d; }
      }
      if (best !== hovered) {
        hovered = best;
        if (readout) readout.textContent = best ? describe(best) : "Hover a spot to read it";
        schedule();
      }
    }

    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("pointerdown", onPointer);
    canvas.addEventListener("pointerleave", () => {
      hovered = null;
      if (readout) readout.textContent = "Hover a spot to read it";
      schedule();
    });

    for (const btn of buttons) {
      btn.addEventListener("click", () => {
        gene = btn.dataset.gene;
        for (const b of buttons) b.setAttribute("aria-pressed", String(b === btn));
        target = {
          cyp: gene === "CYP2E1" || gene === "both" ? 1 : 0,
          cps: gene === "CPS1" || gene === "both" ? 1 : 0,
        };
        schedule();
      });
    }

    readColors();
    if ("ResizeObserver" in window) {
      new ResizeObserver(resize).observe(stage);
    } else {
      window.addEventListener("resize", resize);
    }
    resize();

    return {
      recolor() {
        readColors();
        schedule();
      },
    };
  })();
})();
