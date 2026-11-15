// El viaje — a train game across Spain (spanish/viaje.html).
//
// Each leg of the route takes its questions from one block (#parte-N) of spanish/viaje-preguntas.html: the game fetches that file and reads its
// .quiz-q elements (same markup as assets/study.js), so the questions live in one place only.
// A correct answer moves the train one step; a wrong one is asked again at the end of the leg.
// Three multiple-choice questions per leg are timed: the ticket inspector round.
// Progress (stars per leg) is kept in localStorage on the device.

(() => {
  "use strict";

  const root = document.getElementById("viaje");
  if (!root) return;

  const STORE = "viaje-leccion-3";
  const TIMED_SECONDS = 15;
  const TRAVEL = 600; // scene units the landscape scrolls during one leg

  const CITIES = {
    Bilbao: { at: [-2.93, 43.26], label: [-7, 3, "end"] },
    Pamplona: { at: [-1.64, 42.82], label: [8, 4, "start"] },
    Zaragoza: { at: [-0.88, 41.65], label: [-8, 4, "end"] },
    Barcelona: { at: [2.17, 41.39], label: [5, 16, "end"] },
    Valencia: { at: [-0.38, 39.47], label: [8, 4, "start"] },
    Madrid: { at: [-3.7, 40.42], label: [-8, 4, "end"] },
    "Córdoba": { at: [-4.78, 37.88], label: [8, 4, "start"] },
    Sevilla: { at: [-5.98, 37.39], label: [-8, 5, "end"] },
  };

  const LEGS = [
    { from: "Bilbao", to: "Pamplona", part: 1, topic: "La familia", theme: "north", icon: "🐂",
      fact: "Každý rok od 6. do 14. júla sa tu konajú slávnosti San Fermín so známym behom býkov (encierro)." },
    { from: "Pamplona", to: "Zaragoza", part: 2, topic: "Los posesivos", theme: "dry", icon: "⛪",
      fact: "Mesto leží na rieke Ebro. Jeho symbolom je veľká bazilika Basílica del Pilar na brehu rieky." },
    { from: "Zaragoza", to: "Barcelona", part: 3, topic: "Estar y estado civil", theme: "palms", icon: "🏛️",
      fact: "Chrám Sagrada Família od architekta Antoniho Gaudího sa začal stavať v roku 1882." },
    { from: "Barcelona", to: "Valencia", part: 4, topic: "¿Cómo es?", theme: "coast", icon: "🥘",
      fact: "Odtiaľto pochádza paella. V marci sa tu oslavujú Las Fallas, sviatok ohňa a obrovských figurín." },
    { from: "Valencia", to: "Madrid", part: 5, topic: "El pelo y los ojos", theme: "plateau", icon: "🏙️",
      fact: "Hlavné mesto Španielska. Na námestí Puerta del Sol je „kilometer nula“, od ktorého sa merajú hlavné španielske cesty." },
    { from: "Madrid", to: "Córdoba", part: 6, topic: "El carácter", theme: "olive", icon: "🕌",
      fact: "Mezquita, bývalá mešita s červeno-bielymi oblúkmi, je dnes katedrálou." },
    { from: "Córdoba", to: "Sevilla", part: 7, topic: "Preguntas y datos", theme: "sunset", icon: "💃",
      fact: "Hlavné mesto Andalúzie a kolíska flamenca. Veža Giralda bola pôvodne minaretom." },
  ];

  const THEMES = {
    north: { sky: ["#a9d8f5", "#e6f4fc"], far: "#7fb38a", ground: "#8cc474", front: "#79b562", item: "pine", hills: [22, 14, 28] },
    dry: { sky: ["#b5dcf5", "#f3ecd9"], far: "#d6b57a", ground: "#e2c98a", front: "#d4b871", item: "turbine", hills: [12, 20, 9] },
    palms: { sky: ["#a9d8f5", "#e6f4fc"], sea: "#4aa3d8", ground: "#e9d9a6", front: "#dcc98f", item: "palm" },
    coast: { sky: ["#a9d8f5", "#e6f4fc"], sea: "#4aa3d8", ground: "#e9d9a6", front: "#dcc98f", item: "orange" },
    plateau: { sky: ["#b5dcf5", "#f6efd2"], far: "#d8c070", ground: "#e8d27a", front: "#dcc466", item: "mill", hills: [6, 10, 5] },
    olive: { sky: ["#b5dcf5", "#f3ecd9"], far: "#c9a66b", ground: "#d9bf7e", front: "#ccb06c", item: "olive", hills: [16, 10, 20] },
    sunset: { sky: ["#f7b27a", "#ffe3b8"], far: "#c98a5a", ground: "#d9b06a", front: "#c99f58", item: "orange", hills: [14, 8, 18], sun: "#ff8a3c" },
  };

  // ---------- small helpers ----------

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clean = (s) => s.trim().toLowerCase().replace(/[.,;:!?¡¿]/g, "").replace(/\s+/g, " ");
  const plain = (s) => clean(s).normalize("NFD").replace(/[̀-ͯ]/g, "");
  const shuffle = (list) => {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const starsHTML = (n) => "★".repeat(n) + `<span class="off">${"★".repeat(3 - n)}</span>`;

  let progress = { stars: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    if (saved && Array.isArray(saved.stars)) progress.stars = saved.stars.map((n) => Math.max(0, Math.min(3, Number(n) || 0)));
  } catch (e) { /* no saved progress */ }
  const saveProgress = () => {
    try { localStorage.setItem(STORE, JSON.stringify(progress)); } catch (e) { /* private mode: play without saving */ }
  };

  let timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  // ---------- map ----------

  const proj = ([lon, lat]) => [((lon + 9.8) * 26.5).toFixed(1), ((44.2 - lat) * 34).toFixed(1)];
  const poly = (pts) => pts.map(proj).map((p) => p.join(",")).join(" ");

  const BORDER = [[-7.4, 37.2], [-7.45, 37.6], [-7.0, 38.1], [-7.25, 38.6], [-6.95, 39.05], [-7.45, 39.5], [-7.0, 39.75],
    [-6.85, 40.4], [-6.85, 41.0], [-6.2, 41.6], [-6.55, 41.95], [-7.2, 41.9], [-8.1, 41.85], [-8.2, 42.1], [-8.87, 41.87]];
  const SPAIN = [[-8.87, 41.87], [-8.9, 42.5], [-9.3, 43.0], [-8.3, 43.5], [-7.7, 43.75], [-7.0, 43.55], [-5.7, 43.6], [-4.5, 43.4],
    [-3.8, 43.45], [-3.0, 43.35], [-1.8, 43.35], [-0.7, 42.85], [0.7, 42.75], [1.7, 42.45], [3.2, 42.4], [3.1, 41.8], [2.2, 41.3],
    [0.87, 40.72], [0.2, 40.0], [-0.3, 39.4], [0.2, 38.75], [-0.5, 38.3], [-0.9, 37.6], [-2.2, 36.72], [-3.5, 36.7], [-4.42, 36.7],
    [-5.35, 36.1], [-5.6, 36.0], [-6.3, 36.5], [-6.95, 37.2], ...BORDER];
  const PORTUGAL = [...BORDER, [-8.7, 41.0], [-8.9, 40.2], [-9.4, 39.4], [-9.5, 38.75], [-8.8, 38.4], [-8.8, 37.9], [-9.0, 37.02], [-7.9, 37.0]];
  const FRANCE = [[-1.8, 43.35], [-1.3, 44.6], [3.6, 44.6], [3.2, 42.4], [1.7, 42.45], [0.7, 42.75], [-0.7, 42.85]];

  function mapSVG(doneCount) {
    const names = [LEGS[0].from, ...LEGS.map((l) => l.to)];
    const pts = names.map((n) => proj(CITIES[n].at));
    let tracks = "", dots = "", labels = "";
    for (let i = 0; i < LEGS.length; i++) {
      tracks += `<line class="track${i < doneCount ? " done" : ""}" x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[i + 1][0]}" y2="${pts[i + 1][1]}"/>`;
    }
    names.forEach((n, i) => {
      const [dx, dy, anchor] = CITIES[n].label;
      dots += `<circle class="city${i <= doneCount ? " done" : ""}" cx="${pts[i][0]}" cy="${pts[i][1]}" r="4.5"/>`;
      labels += `<text x="${+pts[i][0] + dx}" y="${+pts[i][1] + dy}" text-anchor="${anchor}">${esc(n)}</text>`;
    });
    const here = pts[doneCount];
    return `<svg class="vj-map" viewBox="0 0 350 290" role="img" aria-label="Mapa Španielska s trasou vlaku: ${esc(names.join(", "))}. Vlak je v stanici ${esc(names[doneCount])}.">
      <polygon class="neighbour" points="${poly(FRANCE)}"/>
      <polygon class="neighbour" points="${poly(PORTUGAL)}"/>
      <polygon class="land" points="${poly(SPAIN)}"/>
      ${tracks}${dots}${labels}
      <text class="train" x="${here[0]}" y="${+here[1] - 7}" text-anchor="middle">🚆</text>
    </svg>`;
  }

  function showMap() {
    clearTimers();
    const doneCount = LEGS.findIndex((_, i) => !(progress.stars[i] > 0));
    const done = doneCount === -1 ? LEGS.length : doneCount;
    const legs = LEGS.map((leg, i) => {
      const stars = progress.stars[i] || 0;
      const locked = i > done;
      return `<li><button class="vj-leg" data-leg="${i}"${locked ? " disabled" : ""}>
        <span><strong>Etapa ${i + 1}: ${esc(leg.from)} → ${esc(leg.to)}</strong>
        <span class="meta"><span lang="es">${esc(leg.topic)}</span>${locked ? " · najprv dokonči predchádzajúcu etapu" : ""}</span></span>
        <span class="vj-stars"${stars ? ` aria-label="Hviezdičky: ${stars} z 3"` : ""}>${locked ? "🔒" : stars ? starsHTML(stars) : ""}</span>
      </button></li>`;
    }).join("");
    root.innerHTML = `
      ${mapSVG(done)}
      ${done === LEGS.length ? `<p><strong>Cieľ cesty! Celá trasa z Bilbaa do Sevilly je za tebou.</strong> Každú etapu si môžeš zopakovať a zlepšiť si hviezdičky.</p>` : ""}
      <ul class="vj-legs">${legs}</ul>
      <p class="vj-rules">Každá etapa má desať otázok z jednej témy lekcie 3. Správna odpoveď posunie vlak, chybná ho zdrží a otázka sa na konci etapy vráti.
      Keď príde revízor 🎫, odpovedaj rýchlo: na každú otázku máš ${TIMED_SECONDS} sekúnd. Za etapu môžeš získať až tri hviezdičky.</p>
      ${progress.stars.some((n) => n > 0) ? `<div class="vj-actions"><button class="vj-btn" data-act="reset">Začať cestu odznova</button></div>` : ""}`;
  }

  // ---------- train scene ----------

  const ITEMS = {
    pine: (x) => `<rect x="${x - 1.5}" y="104" width="3" height="10" fill="#7a5a3a"/><path d="M${x - 9},107 L${x},86 L${x + 9},107Z" fill="#2f7d4f"/><path d="M${x - 7},96 L${x},78 L${x + 7},96Z" fill="#3a9160"/>`,
    olive: (x) => `<rect x="${x - 1.5}" y="102" width="3" height="12" fill="#6b5a45"/><ellipse cx="${x}" cy="98" rx="12" ry="8" fill="#8a9a6a"/><ellipse cx="${x - 4}" cy="95" rx="6" ry="4" fill="#9aab78"/>`,
    orange: (x) => `<rect x="${x - 1.5}" y="102" width="3" height="12" fill="#7a5a3a"/><circle cx="${x}" cy="96" r="10" fill="#3f8f4a"/><circle cx="${x - 4}" cy="94" r="2" fill="#f08c1a"/><circle cx="${x + 4}" cy="98" r="2" fill="#f08c1a"/><circle cx="${x + 2}" cy="91" r="2" fill="#f08c1a"/>`,
    palm: (x) => `<path d="M${x},114 Q${x + 3},100 ${x},86" stroke="#8a6a42" stroke-width="3" fill="none"/>` +
      [[-15, 6], [-11, -6], [0, -11], [11, -6], [15, 6]].map(([dx, dy]) => `<path d="M${x},86 Q${x + dx / 2},${86 + dy - 4} ${x + dx},${86 + dy}" stroke="#2f8f55" stroke-width="2.5" fill="none" stroke-linecap="round"/>`).join(""),
    mill: (x) => `<path d="M${x - 8},114 L${x - 5},92 L${x + 5},92 L${x + 8},114Z" fill="#fbfaf5" stroke="#b9b3a5"/><path d="M${x - 6.5},92 L${x},84 L${x + 6.5},92Z" fill="#7a4a2a"/>
      <g class="vj-blades" style="transform-origin:${x}px 90px"><line x1="${x - 14}" y1="90" x2="${x + 14}" y2="90" stroke="#5a4632" stroke-width="2"/><line x1="${x}" y1="76" x2="${x}" y2="104" stroke="#5a4632" stroke-width="2"/></g>`,
    turbine: (x) => `<line x1="${x}" y1="114" x2="${x}" y2="76" stroke="#f7f7f2" stroke-width="2"/>
      <g class="vj-blades" style="transform-origin:${x}px 76px">${[90, 210, 330].map((a) => {
        const r = (a * Math.PI) / 180;
        return `<line x1="${x}" y1="76" x2="${(x + 13 * Math.cos(r)).toFixed(1)}" y2="${(76 - 13 * Math.sin(r)).toFixed(1)}" stroke="#f7f7f2" stroke-width="2" stroke-linecap="round"/>`;
      }).join("")}</g>`,
  };

  function hillsPath(width, base, heights) {
    let d = `M0,${base}`, x = 0, k = 0;
    while (x < width) {
      d += ` Q${x + 40},${base - heights[k++ % heights.length] * 2} ${x + 80},${base}`;
      x += 80;
    }
    return `${d} L${x},130 L0,130 Z`;
  }

  function stationSVG(x, name) {
    return `<rect x="${x - 40}" y="113" width="290" height="8" fill="#b8b2a6"/>
      <rect x="${x + 20}" y="74" width="72" height="40" fill="#f1e3c2" stroke="#c9b98a"/>
      <path d="M${x + 15},74 L${x + 56},60 L${x + 97},74Z" fill="#b5532d"/>
      <rect x="${x + 48}" y="94" width="16" height="20" fill="#8a5a3a"/>
      <rect x="${x + 28}" y="82" width="12" height="10" fill="#7fb6d9"/><rect x="${x + 72}" y="82" width="12" height="10" fill="#7fb6d9"/>
      <line x1="${x + 112}" y1="113" x2="${x + 112}" y2="80" stroke="#5b5346" stroke-width="2"/><line x1="${x + 168}" y1="113" x2="${x + 168}" y2="80" stroke="#5b5346" stroke-width="2"/>
      <rect x="${x + 104}" y="66" width="72" height="16" rx="2" fill="#fff" stroke="#5b5346"/>
      <text x="${x + 140}" y="78" text-anchor="middle" font-size="10" font-weight="700" fill="#2b2a26">${esc(name)}</text>`;
  }

  function wheel(x) {
    return `<g class="vj-wheel" style="transform-box:view-box;transform-origin:${x}px 116px"><circle cx="${x}" cy="116" r="4.5" fill="#3a3a3a"/><line x1="${x - 3.5}" y1="116" x2="${x + 3.5}" y2="116" stroke="#ddd" stroke-width="1.2"/></g>`;
  }

  function carriage(x) {
    let windows = "";
    for (let i = 0; i < 4; i++) windows += `<rect x="${x + 5 + i * 11.5}" y="94" width="8" height="7" rx="1" fill="#7fb6d9"/>`;
    return `<rect x="${x}" y="90" width="52" height="22" rx="4" fill="#f4f1ea" stroke="#b9b3a5"/>${windows}
      <rect x="${x}" y="104" width="52" height="3.5" fill="#c8102e"/><rect x="${x}" y="107.5" width="52" height="2" fill="#f1bf00"/>
      ${wheel(x + 11)}${wheel(x + 41)}<rect x="${x + 52}" y="106" width="6" height="3" fill="#555"/>`;
  }

  function sceneSVG(leg) {
    const t = THEMES[leg.theme];
    let items = "";
    for (let x = 262, k = 0; x < 620; x += 46 + ((k * 17) % 23), k++) items += ITEMS[t.item](x);
    items += ITEMS[t.item](900) + ITEMS[t.item](945);
    const far = t.sea
      ? [110, 300, 480].map((x) => `<path d="M${x - 9},100 L${x + 9},100 L${x + 6},104 L${x - 6},104Z" fill="#fff"/><path d="M${x},99 L${x},86 L${x + 8},99Z" fill="#fff"/>`).join("")
      : `<path d="${hillsPath(640, 112, t.hills)}" fill="${t.far}"/>`;
    return `<svg class="vj-scene" viewBox="0 0 360 150" role="img" aria-label="Vlak na trase ${esc(leg.from)} – ${esc(leg.to)}">
      <defs><linearGradient id="vj-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.sky[0]}"/><stop offset="1" stop-color="${t.sky[1]}"/></linearGradient></defs>
      <rect width="360" height="150" fill="url(#vj-sky)"/>
      <circle cx="300" cy="${t.sun ? 70 : 28}" r="${t.sun ? 18 : 13}" fill="${t.sun || "#ffd54a"}"/>
      <g fill="#fff" opacity="0.85"><ellipse cx="70" cy="26" rx="22" ry="7"/><ellipse cx="86" cy="21" rx="14" ry="6"/><ellipse cx="210" cy="40" rx="18" ry="6"/></g>
      ${t.sea ? `<rect y="88" width="360" height="30" fill="${t.sea}"/>` : ""}
      <g class="vj-far">${far}</g>
      <rect y="110" width="360" height="40" fill="${t.ground}"/>
      <g class="vj-near">
        ${items}
        ${stationSVG(0, leg.from)}${stationSVG(TRAVEL, leg.to)}
        <line x1="-20" y1="122.5" x2="1000" y2="122.5" stroke="#5c5248" stroke-width="4" stroke-dasharray="2.5 7.5"/>
      </g>
      <rect y="126" width="360" height="24" fill="${t.front}"/>
      <line x1="0" y1="120.6" x2="360" y2="120.6" stroke="#77736b" stroke-width="1.6"/>
      <g class="vj-train">
        ${carriage(24)}${carriage(82)}
        <path d="M140,112 L140,94 Q140,90 144,90 L176,90 Q192,92 198,108 L198,112Z" fill="#c8102e"/>
        <path d="M178,93 Q187,95 191,103 L179,103Z" fill="#7fb6d9"/>
        <rect x="146" y="94" width="12" height="7" rx="1" fill="#7fb6d9"/>
        <rect x="140" y="106" width="57" height="2.5" fill="#f1bf00"/>
        ${wheel(152)}${wheel(186)}
      </g>
    </svg>`;
  }

  // ---------- questions ----------

  async function loadLeg(leg) {
    if (leg.data) return leg.data;
    const res = await fetch("viaje-preguntas.html");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const doc = new DOMParser().parseFromString(await res.text(), "text/html");
    const questions = [...doc.querySelectorAll(`#parte-${leg.part} .quiz-q`)]
      .filter((q) => !q.querySelector(".say[hidden]") && (q.dataset.accept || q.dataset.answer))
      .map((q) => {
        const p = q.querySelector("p").cloneNode(true);
        if (p.firstChild && p.firstChild.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^\s*\d+\.\s*/, "");
        return {
          prompt: p.innerHTML,
          explain: q.dataset.explain || "",
          accept: q.dataset.accept ? q.dataset.accept.split("|") : null,
          answer: q.dataset.answer || null,
          options: [...q.querySelectorAll("button[data-opt]")].map((b) => ({ opt: b.dataset.opt, html: b.innerHTML, lang: b.lang })),
        };
      });
    if (!questions.length) throw new Error("no questions");
    const tree = leg.part === 1 ? doc.querySelector("svg.family-tree") : null;
    leg.data = { questions, tree: tree ? tree.outerHTML : "" };
    return leg.data;
  }

  // ---------- ride ----------

  let ride = null;

  async function startLeg(i) {
    clearTimers();
    const leg = LEGS[i];
    root.innerHTML = `<p>Načítavam etapu…</p>`;
    let data;
    try {
      data = await loadLeg(leg);
    } catch (e) {
      root.innerHTML = `<p>Etapu sa nepodarilo načítať. Skontroluj pripojenie na internet a skús to znova.</p>
        <div class="vj-actions"><button class="vj-btn" data-act="map">← Späť na mapu</button></div>`;
      return;
    }
    const all = data.questions;
    const timed = all.filter((q) => q.answer).slice(-3);
    const normal = all.filter((q) => !timed.includes(q));
    const half = Math.ceil(normal.length / 2);
    ride = {
      i, leg, total: all.length, done: 0, mistakes: 0, missed: [],
      queue: [
        ...normal.slice(0, half).map((q) => ({ q })),
        ...timed.map((q, k) => ({ q, timed: true, first: k === 0 })),
        ...normal.slice(half).map((q) => ({ q })),
      ],
    };
    root.innerHTML = `
      ${sceneSVG(leg)}
      <div class="vj-progress"><span>${esc(leg.from)}</span><div class="vj-bar"><div class="vj-bar-fill"></div></div><span>${esc(leg.to)}</span></div>
      <p class="vj-count"></p>
      ${data.tree ? `<details class="vj-tree" open><summary>Rodokmeň k otázkam</summary>${data.tree}</details>` : ""}
      <div class="vj-card"></div>
      <div class="vj-actions vj-leave"><button class="vj-btn" data-act="map">← Späť na mapu</button></div>`;
    updateTrain(false);
    root.scrollIntoView({ block: "start" });
    next();
  }

  function updateTrain(animate) {
    const scene = root.querySelector(".vj-scene");
    const offset = (TRAVEL * ride.done) / ride.total;
    scene.querySelector(".vj-near").style.transform = `translateX(${-offset}px)`;
    scene.querySelector(".vj-far").style.transform = `translateX(${-offset * 0.3}px)`;
    root.querySelector(".vj-bar-fill").style.width = `${(100 * ride.done) / ride.total}%`;
    root.querySelector(".vj-count").textContent = `Správne odpovede: ${ride.done} / ${ride.total}`;
    if (animate) {
      scene.classList.add("moving");
      later(() => scene.classList.remove("moving"), 1500);
    }
  }

  function next() {
    if (!ride.queue.length) {
      if (!ride.missed.length) return arrive();
      ride.queue = ride.missed.map((q) => ({ q, retry: true }));
      ride.missed = [];
    }
    const item = ride.queue.shift();
    const card = root.querySelector(".vj-card");
    if (item.first) {
      const count = 1 + ride.queue.filter((it) => it.timed).length;
      card.innerHTML = `<p class="vj-prompt">🎫 <strong>Prichádza revízor!</strong></p>
        <p>Nasledujú rýchle otázky s výberom odpovede (${count}). Na každú máš ${TIMED_SECONDS} sekúnd, kým revízor príde k tvojmu miestu.</p>
        <div class="vj-actions"><button class="vj-btn primary" data-act="go">Poďme na to</button></div>`;
      card.querySelector("[data-act=go]").onclick = () => showQuestion(item);
      card.querySelector("[data-act=go]").focus({ preventScroll: true });
      return;
    }
    showQuestion(item);
  }

  function showQuestion(item) {
    const q = item.q;
    const card = root.querySelector(".vj-card");
    const inspector = item.timed
      ? `<div class="vj-inspector" style="--vj-time:${TIMED_SECONDS}s"><p>🎫 Revízor prichádza! Odpovedz, kým príde k tebe.</p>
          <div class="vj-insp-track"><span class="vj-insp-walker">👮</span><span class="vj-insp-seat">💺</span></div></div>`
      : "";
    const body = q.accept
      ? `<form class="vj-form"><input class="vj-input" type="text" lang="es" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Tvoja odpoveď">
          <button class="vj-btn primary" type="submit">Skontrolovať</button></form>
          <div class="vj-keys" aria-label="Španielske znaky">${["á", "é", "í", "ó", "ú", "ñ", "ü", "¿", "¡"].map((c) => `<button type="button">${c}</button>`).join("")}</div>`
      : shuffle(q.options).map((o) => `<button class="vj-opt" data-opt="${esc(o.opt)}"${o.lang ? ` lang="${esc(o.lang)}"` : ""}>${o.html}</button>`).join("");
    card.innerHTML = `${inspector}${item.retry ? `<p class="vj-retry">↩ Táto otázka sa vrátila. Skús ju znova.</p>` : ""}
      <p class="vj-prompt">${q.prompt}</p>${body}<p class="vj-feedback" aria-live="polite"></p>`;

    let settled = false;
    let timer = null;
    const settle = (right, note) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const strip = card.querySelector(".vj-inspector");
      if (strip) strip.classList.add("stopped");
      card.querySelectorAll(".vj-opt, .vj-input, .vj-form button, .vj-keys button").forEach((el) => { el.disabled = true; });
      const feedback = card.querySelector(".vj-feedback");
      feedback.className = "vj-feedback " + (right ? "good" : "bad");
      feedback.textContent = note + q.explain;
      if (right) {
        ride.done++;
        updateTrain(true);
        later(next, 1800);
      } else {
        if (!item.retry) ride.mistakes++;
        ride.missed.push(q);
        const scene = root.querySelector(".vj-scene");
        scene.classList.add("delay");
        later(() => scene.classList.remove("delay"), 500);
        const actions = document.createElement("div");
        actions.className = "vj-actions";
        actions.innerHTML = `<button class="vj-btn primary">Ďalej</button>`;
        actions.firstChild.onclick = next;
        card.append(actions);
        actions.firstChild.focus({ preventScroll: true });
      }
    };

    if (q.accept) {
      const input = card.querySelector(".vj-input");
      card.querySelector(".vj-form").addEventListener("submit", (e) => {
        e.preventDefault();
        if (settled || !clean(input.value)) return;
        const exact = q.accept.find((a) => clean(a) === clean(input.value));
        const close = q.accept.find((a) => plain(a) === plain(input.value));
        input.classList.add(close ? "correct" : "wrong");
        settle(Boolean(close), close
          ? "Správne! " + (exact ? "" : `Pozor na diakritiku: ${close}. `)
          : `Nesprávne. Správna odpoveď: ${q.accept[0]}. `);
      });
      card.querySelectorAll(".vj-keys button").forEach((key) => {
        key.addEventListener("click", () => {
          const start = input.selectionStart ?? input.value.length;
          const end = input.selectionEnd ?? input.value.length;
          input.value = input.value.slice(0, start) + key.textContent + input.value.slice(end);
          input.focus();
          input.setSelectionRange(start + 1, start + 1);
        });
      });
      input.focus({ preventScroll: true });
    } else {
      const mark = (chosen) => {
        card.querySelectorAll(".vj-opt").forEach((b) => {
          if (b.dataset.opt === q.answer) b.classList.add("correct");
          else if (b === chosen) b.classList.add("wrong");
        });
      };
      card.querySelectorAll(".vj-opt").forEach((btn) => {
        btn.addEventListener("click", () => {
          const right = btn.dataset.opt === q.answer;
          mark(btn);
          settle(right, right ? "Správne! " : "Nesprávne. ");
        });
      });
      if (item.timed) {
        timer = later(() => { mark(null); settle(false, "Čas vypršal. "); }, TIMED_SECONDS * 1000);
      }
    }
  }

  function arrive() {
    const { i, leg, mistakes } = ride;
    const stars = mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1;
    const best = Math.max(stars, progress.stars[i] || 0);
    for (let k = 0; k <= i; k++) progress.stars[k] = progress.stars[k] || 0;
    progress.stars[i] = best;
    saveProgress();
    const last = i === LEGS.length - 1;
    const nextLeg = LEGS[i + 1];
    const leave = root.querySelector(".vj-leave");
    if (leave) leave.remove();
    const tree = root.querySelector(".vj-tree");
    if (tree) tree.remove();
    root.querySelector(".vj-card").innerHTML = `<div class="vj-arrival">
      <h2>${last ? "Cieľ cesty" : "Príchod do stanice"}: ${esc(leg.to)}</h2>
      <p class="vj-stars" aria-label="Hviezdičky: ${stars} z 3">${starsHTML(stars)}</p>
      <p>${mistakes === 0 ? "Bez jedinej chyby, výborne!" : `Počet chýb: ${mistakes}.`}${stars < 3 ? " Tri hviezdičky získaš najviac s jednou chybou." : ""}
      ${last ? " Celá trasa z Bilbaa do Sevilly je za tebou!" : ""}</p>
      <div class="vj-postcard"><span class="icon" aria-hidden="true">${leg.icon}</span>
        <div><strong>Pohľadnica: ${esc(leg.to)}</strong><p>${esc(leg.fact)}</p></div></div>
      <div class="vj-actions">
        ${last ? "" : `<button class="vj-btn primary" data-leg="${i + 1}">Ďalšia etapa: ${esc(nextLeg.from)} → ${esc(nextLeg.to)}</button>`}
        <button class="vj-btn" data-leg="${i}">Zopakovať etapu</button>
        <button class="vj-btn${last ? " primary" : ""}" data-act="map">Mapa</button>
      </div></div>`;
    ride = null;
    root.scrollIntoView({ block: "start" });
  }

  // ---------- events ----------

  root.addEventListener("click", (e) => {
    const legBtn = e.target.closest("[data-leg]");
    if (legBtn && !legBtn.disabled) return void startLeg(Number(legBtn.dataset.leg));
    const act = e.target.closest("[data-act]");
    if (!act) return;
    if (act.dataset.act === "map") showMap();
    if (act.dataset.act === "reset" && confirm("Naozaj chceš vymazať hviezdičky a začať cestu odznova?")) {
      progress = { stars: [] };
      saveProgress();
      showMap();
    }
  });

  showMap();
})();
