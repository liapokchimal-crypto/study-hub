// El detective — a police-sketch game (spanish/detective.html), vocabulary of Lección 3 (describing people).
//
// Each case: (1) witness interview — the witness speaks Slovak, the player completes the Spanish police report by
// typing; every answer draws that feature onto the suspect's sketch (a wrong answer leaves it smudged and the
// question returns); (2) line-up — six suspects, pick the one matching the report before the time runs out.
// Cases are defined in CASES below: the culprit's features, the questions, and how each other suspect differs.
// Stars per case are kept in localStorage on the device.

(() => {
  "use strict";

  const root = document.getElementById("detective");
  if (!root) return;

  const STORE = "detective-leccion-3";
  const LINEUP_SECONDS = 40;

  // Features: sex m|f, height alto|bajo, build delgado|gordo, hairLen largo|corto|calvo, hairType liso|rizado,
  // hairColor rubio|moreno|castaño|pelirrojo|gris, eyes azules|verdes|marrones, barba, bigote.
  // Question: f = features it reveals, sk = what the witness says, es = report sentence with ___, accept = answers.
  const CASES = [
    {
      title: "Ukradnutá gitara",
      story: "Z baru na námestí zmizla gitara. Barman videl páchateľa utekať.",
      culprit: { sex: "m", height: "alto", build: "delgado", hairLen: "corto", hairType: "liso", hairColor: "moreno", eyes: "marrones", barba: true, bigote: false },
      others: [{ height: "bajo" }, { build: "gordo" }, { hairLen: "largo" }, { hairColor: "rubio" }, { barba: false }],
      questions: [
        { f: ["sex", "height"], sk: "Bol to vysoký muž.", es: "Es un hombre ___.", accept: ["alto"], explain: "Vysoký = alto. Hombre je mužského rodu, preto koncovka -o." },
        { f: ["build"], sk: "Bol chudý.", es: "Es ___.", accept: ["delgado"], explain: "Chudý = delgado." },
        { f: ["hairLen"], sk: "Mal krátke vlasy.", es: "Tiene el pelo ___.", accept: ["corto"], explain: "Krátke vlasy = el pelo corto." },
        { f: ["hairColor"], sk: "Bol tmavovlasý.", es: "Es ___.", accept: ["moreno"], explain: "Tmavovlasý = moreno." },
        { f: ["barba"], sk: "Mal bradu.", es: "Tiene ___.", accept: ["barba"], explain: "Brada = barba. Používa sa so slovesom tener a bez člena." },
        { f: ["eyes"], sk: "Oči mal hnedé.", es: "Tiene los ojos ___.", accept: ["marrones"], explain: "Ojos je v množnom čísle: marrón sa mení na marrones." },
      ],
    },
    {
      title: "Zmiznutý recept",
      story: "Z reštaurácie niekto ukradol tajný recept na paellu. Kuchár si zlodejku všimol.",
      culprit: { sex: "f", height: "bajo", build: "delgado", hairLen: "largo", hairType: "rizado", hairColor: "pelirrojo", eyes: "verdes", barba: false, bigote: false },
      others: [{ height: "alto" }, { hairLen: "corto" }, { hairType: "liso" }, { hairColor: "castaño" }, { eyes: "azules", build: "gordo" }],
      questions: [
        { f: ["sex", "height"], sk: "Bola to nízka žena.", es: "Es una mujer ___.", accept: ["baja"], explain: "Nízky = bajo. Mujer je ženského rodu, preto baja." },
        { f: ["hairLen"], sk: "Mala dlhé vlasy.", es: "Tiene el pelo ___.", accept: ["largo"], explain: "Pelo je mužského rodu, preto largo aj pri žene." },
        { f: ["hairType"], sk: "Vlasy mala kučeravé.", es: "Tiene el pelo largo y ___.", accept: ["rizado"], explain: "Kučeravé vlasy = el pelo rizado." },
        { f: ["hairColor"], sk: "Bola ryšavá.", es: "Es ___.", accept: ["pelirroja"], explain: "Ryšavý = pelirrojo, o žene pelirroja." },
        { f: ["eyes"], sk: "Mala zelené oči.", es: "Tiene los ojos ___.", accept: ["verdes"], explain: "Ojos je v množnom čísle: verde sa mení na verdes." },
        { f: ["build"], sk: "Bola chudá.", es: "Es ___.", accept: ["delgada"], explain: "Chudý = delgado, o žene delgada." },
      ],
    },
    {
      title: "Bicykel pred knižnicou",
      story: "Pred knižnicou zmizol bicykel. Knihovníčka videla všetko z okna.",
      culprit: { sex: "m", height: "bajo", build: "gordo", hairLen: "calvo", hairType: "liso", hairColor: "castaño", eyes: "azules", barba: false, bigote: true },
      others: [{ height: "alto" }, { build: "delgado" }, { hairLen: "corto", hairColor: "moreno" }, { bigote: false }, { barba: true }],
      questions: [
        { f: ["sex", "height"], sk: "Bol to nízky muž.", es: "Es un hombre ___.", accept: ["bajo"], explain: "Nízky = bajo." },
        { f: ["build"], sk: "Bol tučný.", es: "Es ___.", accept: ["gordo"], explain: "Tučný = gordo." },
        { f: ["hairLen"], sk: "Bol plešatý.", es: "___ calvo.", accept: ["es"], explain: "Calvo sa používa so slovesom ser: es calvo." },
        { f: ["bigote"], sk: "Mal fúzy.", es: "___ bigote.", accept: ["tiene"], explain: "Fúzy a brada sa používajú so slovesom tener: tiene bigote." },
        { f: ["eyes"], sk: "Mal modré oči.", es: "Tiene los ojos ___.", accept: ["azules"], explain: "Ojos je v množnom čísle: azul sa mení na azules." },
        { f: ["barba"], sk: "Bradu nemal.", es: "No tiene ___.", accept: ["barba"], explain: "Brada = barba. Zápor: no tiene barba." },
      ],
    },
    {
      title: "Obraz z múzea",
      story: "Z mestského múzea zmizol obraz. Strážnik si páchateľku dobre zapamätal.",
      culprit: { sex: "f", height: "alto", build: "gordo", hairLen: "corto", hairType: "liso", hairColor: "rubio", eyes: "azules", barba: false, bigote: false },
      others: [{ height: "bajo" }, { hairColor: "moreno" }, { hairLen: "largo" }, { hairType: "rizado" }, { build: "delgado" }],
      questions: [
        { f: ["sex", "height"], sk: "Bola to vysoká žena.", es: "Es una mujer ___.", accept: ["alta"], explain: "Vysoký = alto. Mujer je ženského rodu, preto alta." },
        { f: ["hairColor"], sk: "Bola blondína.", es: "Es ___.", accept: ["rubia"], explain: "Blond = rubio, o žene rubia." },
        { f: ["hairLen"], sk: "Mala krátke vlasy.", es: "Tiene el pelo ___.", accept: ["corto"], explain: "Pelo je mužského rodu, preto corto aj pri žene." },
        { f: ["hairType"], sk: "Vlasy mala rovné.", es: "Tiene el pelo corto y ___.", accept: ["liso"], explain: "Rovné vlasy = el pelo liso." },
        { f: ["eyes"], sk: "Oči mala modré.", es: "___ los ojos azules.", accept: ["tiene"], explain: "Oči a vlasy sa opisujú slovesom tener: tiene los ojos azules." },
        { f: ["build"], sk: "Bola trochu tučná.", es: "Es un poco ___.", accept: ["gorda"], explain: "Tučný = gordo, o žene gorda. Un poco = trochu." },
      ],
    },
    {
      title: "Šéf zlodejov",
      story: "Za všetkými krádežami stojí jeden šéf. Svedkovia ho konečne videli.",
      culprit: { sex: "m", height: "alto", build: "gordo", hairLen: "largo", hairType: "rizado", hairColor: "gris", eyes: "verdes", barba: true, bigote: true },
      others: [{ build: "delgado" }, { hairLen: "corto" }, { hairType: "liso" }, { hairColor: "castaño" }, { barba: false }],
      questions: [
        { f: ["sex", "height"], sk: "Bol to vysoký muž.", es: "Es un hombre ___.", accept: ["alto"], explain: "Vysoký = alto." },
        { f: ["build"], sk: "Bol tučný.", es: "Es ___.", accept: ["gordo"], explain: "Tučný = gordo." },
        { f: ["hairLen"], sk: "Mal dlhé vlasy.", es: "Tiene el pelo ___.", accept: ["largo"], explain: "Dlhé vlasy = el pelo largo." },
        { f: ["hairType"], sk: "Vlasy mal kučeravé.", es: "Tiene el pelo largo y ___.", accept: ["rizado"], explain: "Kučeravé vlasy = el pelo rizado." },
        { f: ["hairColor"], sk: "Vlasy mal sivé.", es: "Tiene el pelo ___.", accept: ["gris"], explain: "Sivý = gris." },
        { f: ["barba", "bigote"], sk: "Mal bradu aj fúzy.", es: "Tiene barba y ___.", accept: ["bigote"], explain: "Brada = barba, fúzy = bigote." },
        { f: ["eyes"], sk: "Oči mal zelené.", es: "Tiene los ojos ___.", accept: ["verdes"], explain: "Ojos je v množnom čísle: verde sa mení na verdes." },
      ],
    },
  ];

  // ---------- helpers ----------

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
  const gap = (es) => esc(es).replace("___", "<strong>___</strong>");

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

  // ---------- drawing a person ----------

  const HAIR = { rubio: "#e3bf4d", moreno: "#2b2420", "castaño": "#7a4a2a", pelirrojo: "#c8501e", gris: "#a3a3a3" };
  const EYES = { azules: "#2f7fd6", verdes: "#2f9e4f", marrones: "#6b3f1d" };
  const SKIN = "#f2c9a0";

  // p = person; o.known = Set of features already known (omit: all), o.fresh = features to animate, o.smudged = Set drawn blurred.
  function figure(p, o = {}) {
    const k = (f) => !o.known || o.known.has(f);
    const cls = (...fs) => {
      const c = [];
      if (o.fresh && fs.some((f) => o.fresh.includes(f))) c.push("vd-new");
      if (o.smudged && fs.some((f) => o.smudged.has(f))) c.push("vd-smudge");
      return c.length ? ` class="${c.join(" ")}"` : "";
    };
    const H = !k("height") ? 139 : p.height === "alto" ? 150 : 128;
    const w = !k("build") ? 38 : p.build === "gordo" ? 54 : 30;
    const lw = !k("build") ? 10 : p.build === "gordo" ? 13 : 9;
    const hy = 172 - H + 20;
    const ty = hy + 23, th = (H - 43) * 0.5, ly = ty + th;
    const woman = k("sex") && p.sex === "f";
    const cloth = !k("sex") ? "#b9bec6" : woman ? "#8e5bb5" : "#3f6fb0";
    const legFill = !k("sex") ? "#8f959e" : woman ? SKIN : "#3a3f4a";
    const hairKnown = k("hairLen");
    const hairFill = k("hairColor") ? HAIR[p.hairColor] : "#cfc8b8";
    const faceHair = k("hairColor") ? HAIR[p.hairColor] : "#8a8478";
    const curly = k("hairType") && p.hairType === "rizado";

    let wall = "";
    for (const cm of [140, 160, 180]) {
      const y = (172 - cm * 0.81).toFixed(1);
      wall += `<line class="wall" x1="0" y1="${y}" x2="100" y2="${y}"/><text class="wall-label" x="2" y="${y - 1.5}">${cm}</text>`;
    }

    const leg = (cx) => `<rect x="${cx - lw / 2}" y="${ly - 4}" width="${lw}" height="${174 - ly}" fill="${legFill}"/><ellipse cx="${cx}" cy="172.5" rx="${lw / 2 + 2}" ry="3" fill="#2b2b2b"/>`;
    const arm = (x) => `<rect x="${x}" y="${ty + 2}" width="7" height="${th * 0.82}" rx="3.5" fill="${cloth}"/><circle cx="${x + 3.5}" cy="${ty + th * 0.82 + 4}" r="3.6" fill="${SKIN}"/>`;
    const body = `<g${cls("sex", "height", "build")}>
      ${leg(50 - w / 4)}${leg(50 + w / 4)}
      ${woman ? `<path d="M${50 - w / 2},${ly - 12} L${50 + w / 2},${ly - 12} L${50 + w / 2 + 7},${ly + 22} L${50 - w / 2 - 7},${ly + 22}Z" fill="${cloth}"/>` : ""}
      ${arm(50 - w / 2 - 6)}${arm(50 + w / 2 - 1)}
      <rect x="${50 - w / 2}" y="${ty}" width="${w}" height="${th}" rx="8" fill="${cloth}"/>
      ${k("build") && p.build === "gordo" ? `<ellipse cx="50" cy="${ty + th * 0.62}" rx="${w / 2 + 3}" ry="${th * 0.4}" fill="${cloth}"/>` : ""}
      <rect x="45.5" y="${hy + 15}" width="9" height="11" fill="${SKIN}"/>
    </g>`;

    let hairBack = "", hairTop = "";
    if (hairKnown && p.hairLen !== "calvo") {
      const long = p.hairLen === "largo";
      if (long) {
        hairBack = `<path d="M29,${hy - 2} L27,${hy + 34} Q27,${hy + 39} 33,${hy + 39} L67,${hy + 39} Q73,${hy + 39} 73,${hy + 34} L71,${hy - 2}Z" fill="${hairFill}"/>`;
      }
      hairTop = `<path d="M29.9,${hy - 4} A20.5,20.5 0 0 1 70.1,${hy - 4} Q62,${hy - 11} 50,${hy - 10} Q38,${hy - 11} 29.9,${hy - 4}Z" fill="${hairFill}"/>`;
      if (curly) {
        for (let a = 15; a <= 165; a += 25) {
          const r = (a * Math.PI) / 180;
          hairTop += `<circle cx="${(50 + 21 * Math.cos(r)).toFixed(1)}" cy="${(hy - 21 * Math.sin(r)).toFixed(1)}" r="5.2" fill="${hairFill}"/>`;
        }
        if (long) {
          for (let y = hy + 4; y <= hy + 36; y += 8) hairBack += `<circle cx="27" cy="${y}" r="5.5" fill="${hairFill}"/><circle cx="73" cy="${y}" r="5.5" fill="${hairFill}"/>`;
        }
      }
    }
    const hairCls = cls("hairLen", "hairType", "hairColor");
    const eye = (cx) => `<ellipse cx="${cx}" cy="${hy + 1}" rx="4.6" ry="3.6" fill="#fff"/><circle cx="${cx}" cy="${hy + 1}" r="2.9" fill="${k("eyes") ? EYES[p.eyes] : "#9a9a9a"}"/><circle cx="${cx}" cy="${hy + 1}" r="1.1" fill="#111"/>`;

    return `<svg class="vd-fig" viewBox="0 0 100 180" aria-hidden="true">
      ${wall}
      <g${hairCls}>${hairBack}</g>
      ${body}
      <circle cx="50" cy="${hy}" r="20" fill="${SKIN}"/>
      <g${hairCls}>${hairTop}</g>
      <g${cls("eyes")}>${eye(42)}${eye(58)}</g>
      ${k("barba") && p.barba ? `<path${cls("barba", "hairColor")} d="M30.6,${hy + 5} Q33,${hy + 26} 50,${hy + 26} Q67,${hy + 26} 69.4,${hy + 5} Q64,${hy + 16} 50,${hy + 16.5} Q36,${hy + 16} 30.6,${hy + 5}Z" fill="${faceHair}"/>` : ""}
      <path d="M44.5,${hy + 12.5} Q50,${hy + 15} 55.5,${hy + 12.5}" stroke="#8a4a3a" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      ${k("bigote") && p.bigote ? `<path${cls("bigote", "hairColor")} d="M41,${hy + 9} Q46,${hy + 5.5} 50,${hy + 8} Q54,${hy + 5.5} 59,${hy + 9} Q54,${hy + 11.5} 50,${hy + 10} Q46,${hy + 11.5} 41,${hy + 9}Z" fill="${faceHair}"/>` : ""}
      ${hairKnown ? "" : `<text x="50" y="${hy - 24}" text-anchor="middle" font-size="12" font-weight="700" fill="#a59c85">?</text>`}
    </svg>`;
  }

  // ---------- case list ----------

  function showCases() {
    clearTimers();
    const done = CASES.findIndex((_, i) => !(progress.stars[i] > 0));
    const open = done === -1 ? CASES.length : done;
    const items = CASES.map((c, i) => {
      const stars = progress.stars[i] || 0;
      const locked = i > open;
      return `<li><button class="vj-leg" data-case="${i}"${locked ? " disabled" : ""}>
        <span><strong>Prípad ${i + 1}: ${esc(c.title)}</strong>
        <span class="meta">${locked ? "Najprv vyrieš predchádzajúci prípad" : esc(c.story)}</span></span>
        <span class="vj-stars"${stars ? ` aria-label="Hviezdičky: ${stars} z 3"` : ""}>${locked ? "🔒" : stars ? starsHTML(stars) : ""}</span>
      </button></li>`;
    }).join("");
    root.innerHTML = `
      ${open === CASES.length ? `<p><strong>Všetky prípady sú vyriešené. V meste je opäť pokoj!</strong> Každý prípad si môžeš zopakovať a zlepšiť si hviezdičky.</p>` : ""}
      <ul class="vj-legs">${items}</ul>
      <p class="vj-rules">Svedok hovorí po slovensky, ty dopĺňaš policajné hlásenie po španielsky. Každá správna odpoveď dokreslí portrét páchateľa.
      Chybná odpoveď portrét rozmaže a otázka sa vráti. Nakoniec nájdi páchateľa medzi šiestimi podozrivými, kým vyprší čas.
      Za prípad môžeš získať až tri hviezdičky.</p>
      ${progress.stars.some((n) => n > 0) ? `<div class="vj-actions"><button class="vj-btn" data-act="reset">Začať odznova</button></div>` : ""}`;
  }

  // ---------- interview ----------

  let game = null;

  function startCase(i) {
    clearTimers();
    const c = CASES[i];
    game = {
      i, c, mistakes: 0, known: new Set(), smudged: new Set(), notes: [], missed: [],
      queue: c.questions.map((q) => ({ q })),
    };
    root.innerHTML = `
      <div class="vd-board">
        <div class="vd-sketch"></div>
        <div class="vd-notes"><h3>Hlásenie</h3><ul></ul></div>
      </div>
      <div class="vj-card">
        <p class="vj-prompt"><strong>Prípad ${i + 1}: ${esc(c.title)}</strong></p>
        <p class="vd-story">${esc(c.story)} Vypočuj svedka a zostav portrét.</p>
        <div class="vj-actions"><button class="vj-btn primary" data-act="begin">Začať výsluch</button></div>
      </div>
      <div class="vj-actions vd-leave"><button class="vj-btn" data-act="cases">← Späť na prípady</button></div>`;
    drawBoard();
    root.querySelector("[data-act=begin]").focus({ preventScroll: true });
    root.scrollIntoView({ block: "start" });
  }

  function drawBoard(fresh) {
    root.querySelector(".vd-sketch").innerHTML = figure(game.c.culprit, { known: game.known, fresh, smudged: game.smudged });
    root.querySelector(".vd-notes ul").innerHTML = game.notes.length
      ? game.notes.map((n) => `<li lang="es">${esc(n)}</li>`).join("")
      : `<li class="empty">Zatiaľ nič. Portrét sa dokreslí podľa tvojich odpovedí.</li>`;
  }

  function nextQuestion() {
    const card = root.querySelector(".vj-card");
    if (!game.queue.length) {
      if (!game.missed.length) {
        card.innerHTML = `<p class="vj-prompt"><strong>Portrét je hotový!</strong></p>
          <p>Polícia priviedla šesť podozrivých. Podľa hlásenia nájdi páchateľa. Máš na to ${LINEUP_SECONDS} sekúnd.</p>
          <div class="vj-actions"><button class="vj-btn primary" data-act="lineup">K podozrivým</button></div>`;
        card.querySelector("button").focus({ preventScroll: true });
        return;
      }
      game.queue = game.missed.map((q) => ({ q, retry: true }));
      game.missed = [];
    }
    const item = game.queue.shift();
    const q = item.q;
    card.innerHTML = `${item.retry ? `<p class="vj-retry">↩ Táto otázka sa vrátila. Skús ju znova a portrét sa vyčistí.</p>` : ""}
      <div class="vd-witness"><strong>🗣️ Svedok hovorí:</strong>„${esc(q.sk)}“</div>
      <p class="vd-task">Doplň hlásenie po španielsky:</p>
      <p class="vj-prompt" lang="es">${gap(q.es)}</p>
      <form class="vj-form"><input class="vj-input" type="text" lang="es" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Tvoja odpoveď">
        <button class="vj-btn primary" type="submit">Skontrolovať</button></form>
      <div class="vj-keys" aria-label="Španielske znaky">${["á", "é", "í", "ó", "ú", "ñ"].map((ch) => `<button type="button">${ch}</button>`).join("")}</div>
      <p class="vj-feedback" aria-live="polite"></p>`;
    const input = card.querySelector(".vj-input");
    let settled = false;
    card.querySelector(".vj-form").addEventListener("submit", (e) => {
      e.preventDefault();
      if (settled || !clean(input.value)) return;
      settled = true;
      const exact = q.accept.find((a) => clean(a) === clean(input.value));
      const close = q.accept.find((a) => plain(a) === plain(input.value));
      const right = Boolean(close);
      card.querySelectorAll(".vj-input, .vj-form button, .vj-keys button").forEach((el) => { el.disabled = true; });
      input.classList.add(right ? "correct" : "wrong");
      const feedback = card.querySelector(".vj-feedback");
      feedback.className = "vj-feedback " + (right ? "good" : "bad");
      feedback.textContent = (right
        ? "Správne! " + (exact ? "" : `Pozor na diakritiku: ${close}. `)
        : `Nesprávne. Správna odpoveď: ${q.accept[0]}. `) + q.explain;
      q.f.forEach((f) => game.known.add(f));
      if (right) {
        q.f.forEach((f) => game.smudged.delete(f));
        const note = q.es.replace("___", q.accept[0]);
        game.notes.push(note.charAt(0).toUpperCase() + note.slice(1));
        drawBoard(q.f);
        later(nextQuestion, 1900);
      } else {
        if (!item.retry) game.mistakes++;
        q.f.forEach((f) => game.smudged.add(f));
        game.missed.push(q);
        drawBoard(q.f);
        const actions = document.createElement("div");
        actions.className = "vj-actions";
        actions.innerHTML = `<button class="vj-btn primary">Ďalej</button>`;
        actions.firstChild.onclick = nextQuestion;
        card.append(actions);
        actions.firstChild.focus({ preventScroll: true });
      }
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
  }

  // ---------- line-up ----------

  function showLineup() {
    clearTimers();
    const c = game.c;
    const suspects = shuffle([{ p: c.culprit, guilty: true }, ...c.others.map((diff) => ({ p: { ...c.culprit, ...diff } }))]);
    root.innerHTML = `
      <div class="vj-card">
        <p class="vj-prompt"><strong>Kto je páchateľ?</strong> Ťukni na osobu, ktorá zodpovedá hláseniu.</p>
        <p class="vd-report" lang="es">${esc(game.notes.join(" "))}</p>
        <div class="vd-timer" style="--vd-time:${LINEUP_SECONDS}s"><div></div></div>
        <div class="vd-lineup">${suspects.map((s, n) => `<button class="vd-suspect" data-n="${n}" style="animation-delay:${n * 0.12}s" aria-label="Podozrivá osoba číslo ${n + 1}">
          <span class="num">${n + 1}</span>${figure(s.p)}</button>`).join("")}</div>
        <p class="vj-feedback" aria-live="polite"></p>
      </div>
      <div class="vj-actions vd-leave"><button class="vj-btn" data-act="cases">← Späť na prípady</button></div>`;
    root.scrollIntoView({ block: "start" });
    const feedback = root.querySelector(".vj-feedback");
    const timerBar = root.querySelector(".vd-timer");
    const timeout = later(() => {
      game.mistakes++;
      timerBar.remove();
      feedback.className = "vj-feedback bad";
      feedback.textContent = "Čas vypršal. Podozriví ešte čakajú, vyber si pokojne.";
    }, LINEUP_SECONDS * 1000);
    root.querySelectorAll(".vd-suspect").forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = suspects[Number(btn.dataset.n)];
        if (s.guilty) {
          clearTimeout(timeout);
          timerBar.classList.add("stopped");
          btn.classList.add("correct");
          root.querySelectorAll(".vd-suspect").forEach((b) => { b.disabled = true; });
          feedback.className = "vj-feedback good";
          feedback.textContent = "Správne! To je páchateľ.";
          later(showSolved, 1500);
        } else {
          game.mistakes++;
          btn.classList.add("wrong");
          btn.disabled = true;
          feedback.className = "vj-feedback bad";
          feedback.textContent = "Táto osoba je nevinná. Prečítaj si hlásenie ešte raz.";
        }
      });
    });
  }

  function showSolved() {
    const { i, c, mistakes } = game;
    const stars = mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1;
    for (let k = 0; k <= i; k++) progress.stars[k] = progress.stars[k] || 0;
    progress.stars[i] = Math.max(stars, progress.stars[i]);
    saveProgress();
    const last = i === CASES.length - 1;
    root.innerHTML = `<div class="vj-card vj-arrival">
      <div class="vd-solved">
        <div class="vd-sketch">${figure(c.culprit)}<span class="vd-stamp">VYRIEŠENÉ</span></div>
        <div>
          <h2>Prípad ${i + 1}: ${esc(c.title)}</h2>
          <p class="vj-stars" aria-label="Hviezdičky: ${stars} z 3">${starsHTML(stars)}</p>
        </div>
      </div>
      <p>${mistakes === 0 ? "Bez jedinej chyby, výborne!" : `Počet chýb: ${mistakes}.`}${stars < 3 ? " Tri hviezdičky získaš najviac s jednou chybou." : ""}
      ${last ? " Šéf zlodejov je za mrežami a v meste je opäť pokoj!" : ""}</p>
      <p class="vd-report" lang="es">${esc(game.notes.join(" "))}</p>
      <div class="vj-actions">
        ${last ? "" : `<button class="vj-btn primary" data-case="${i + 1}">Ďalší prípad: ${esc(CASES[i + 1].title)}</button>`}
        <button class="vj-btn" data-case="${i}">Zopakovať prípad</button>
        <button class="vj-btn${last ? " primary" : ""}" data-act="cases">Zoznam prípadov</button>
      </div></div>`;
    game = null;
    root.scrollIntoView({ block: "start" });
  }

  // ---------- events ----------

  root.addEventListener("click", (e) => {
    const caseBtn = e.target.closest("[data-case]");
    if (caseBtn && !caseBtn.disabled) return void startCase(Number(caseBtn.dataset.case));
    const act = e.target.closest("[data-act]");
    if (!act) return;
    const name = act.dataset.act;
    if (name === "cases") showCases();
    if (name === "begin") nextQuestion();
    if (name === "lineup") showLineup();
    if (name === "reset" && confirm("Naozaj chceš vymazať hviezdičky a začať odznova?")) {
      progress = { stars: [] };
      saveProgress();
      showCases();
    }
  });

  showCases();
})();
