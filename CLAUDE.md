# Study Hub

A static training-materials website for a university student, published with GitHub Pages.
The parent (repo owner) asks Claude for lessons; Claude writes them, then publishes on request.

- Repo: https://github.com/liapokchimal-crypto/study-hub
- Live site: https://liapokchimal-crypto.github.io/study-hub/
- Plain HTML/CSS/JS. No build step, no frameworks, no npm. Pages serves `main` branch, root folder.

## Layout

```
index.html                 home page: subject cards + "Latest lessons" (newest first, ~5)
assets/style.css           all styles (light + dark mode)
assets/study.js            quizzes and flashcards
templates/lesson-template.html   copy this for every new lesson
<subject>/index.html       subject page: list of lessons in teaching order
<subject>/<slug>.html      one lesson per file, slug in lowercase-with-dashes
```

Subjects so far: `spanish`, `slovak`, `math`, `chemistry`. Subject pages group their items under one `<h2>` per textbook
lesson or topic (Spanish: Lección 3, 4, 5; Slovak: Zvuková rovina jazyka). A new subject needs: a folder with `index.html`
(copy an existing subject page), a card on the home page, and a `--<subject>` color + `.<subject>` class in `style.css`.

## Writing a lesson

1. Copy `templates/lesson-template.html` to `<subject>/<slug>.html`; replace every `[BRACKETED]` part.
2. Set `<body class="<subject>">` so the subject color is used.
3. Structure: short intro → explanation → worked example(s) → practice with hidden solutions (`<details>`)
   → flashcards (optional, great for vocabulary) → quiz (5–10 questions, each with `data-explain`).
4. Formulas: KaTeX with `\( inline \)` and `$$ display $$`; chemistry with `\ce{...}` (mhchem).
   Remove the KaTeX lines from `<head>` if the lesson has no formulas.
   Do not use single `$` as a math delimiter.
5. Spanish lessons: explain in English, examples in Spanish with English translations. Mark Spanish text with
   `lang="es"`; wrap example phrases in `<span class="say" lang="es">…</span>` to add a 🔊 listen button
   (not inside buttons, flashcards or `<summary>`).
6. Add the lesson to `<subject>/index.html` (at the end, numbered) and to the top of "Latest lessons" on `index.html`
   (remove the oldest if more than 5).
7. Write clearly and encouragingly for a university student. Check facts and answers carefully — every quiz
   answer key must be correct.
8. Must work on a phone: no wide fixed-width content; wrap wide tables in `<div class="table-scroll">`.

## Exams from the student's textbook

Exams based on textbook photos are split into short parts of 10 questions, one file per part
(`<subject>/leccion-N-<part>-<topic>.html`), listed under their own heading on the subject page, with previous/next
links between parts. Exams are written in Slovak, the textbook's language: `<html lang="sk">` (which also switches
the quiz buttons and feedback in `assets/study.js`), with instructions, explanations and translations in Slovak and
the tested language marked `lang="es"`. The site is public: write all questions, names and texts yourself and never copy the book's
dialogues, passages or photos. Mix multiple-choice with typed answers (`data-accept`, see `assets/study.js`);
a listening question uses `<span class="say" lang="es" hidden>`.

## Games

The Spanish section currently holds only games (the owner asked for the earlier lesson and exam pages to be
removed; they remain in git history before the commit that added the detective game). Games have a Slovak
interface, are written in plain JS with inline SVG drawings, must work at phone width, and keep stars per level
in the browser's `localStorage` only. Each game's script and stylesheet carry their own `?v=N`; bump it in the
pages that link the file whenever it changes.

- **El viaje** (`spanish/viaje.html`, `assets/viaje.js?v=3`, `assets/viaje.css?v=1`): a train trip across Spain.
  Its questions live in `spanish/viaje-preguntas.html`, a data-only page with one `<div class="quiz" id="parte-N">`
  block per leg in the same `.quiz-q` markup as `assets/study.js` (plus the family tree used by leg 1). A new leg
  needs a `LEGS` entry in `viaje.js` (cities, `part`, scenery theme, postcard fact), the city in `CITIES`, and a
  `parte-N` block. The last three multiple-choice questions of a block form the timed "ticket inspector" round,
  so each block needs at least three.
- **El detective** (`assets/detective.js?v=2`, `assets/detective.css?v=2`; pages also link `viaje.css` for the shared
  buttons, cards and inputs): typed answers draw a sketch, then a timed line-up of six. One kit per lesson in `KITS`,
  picked with `<div id="detective" data-caso="leccion-N">`: `spanish/detective.html` (Lección 3, a person),
  `detective-leccion-4.html` (a school desk, `desk()`), `detective-leccion-5.html` (a hideout room, `room()`). A kit has
  its own `localStorage` key, Slovak texts, drawing function and case list (`PERSON_CASES`, `SCHOOL_CASES`,
  `HOME_CASES`): the culprit's features, the questions (Slovak witness line, Spanish sentence with `___`, accepted
  answers, optional `hint`, which features the answer reveals) and `others`, how each of the five wrong sketches
  differs. Every difference must be something the report states, so the line-up has exactly one right answer. Keep the
  questions different from the train game's questions for the same lesson.

## Asset versions (cache busting)

Every page links `assets/style.css?v=N` and `assets/study.js?v=N` (currently `v=5`). Browsers keep cached copies
for ~10 minutes, so whenever `style.css` or `study.js` changes, bump `N` in **every** `.html` file (including
`templates/lesson-template.html`) in the same commit. New lessons copy the current number from the template.

## Previewing

Run `powershell -NoProfile -ExecutionPolicy Bypass -File .claude/serve.ps1` in the background, then open
http://localhost:8080/ in the browser pane. Check for `.katex-error` elements, and check a 375px-wide (phone)
view: no display formula should need sideways scrolling, so split long chains of `=` over `aligned` lines.

## Privacy

The site is public. Never include the student's name, school, location, or other personal details.

## Publishing

Only when the owner says "publish" (or similar):

```
git add -A
git commit -m "Add <subject> lesson: <title>"
git push
```

The site updates about 1 minute after the push. Git and gh live in `C:\Program Files\Git\cmd` and
`C:\Program Files\GitHub CLI` if they are not on PATH.

## Train routes per lesson

`assets/viaje.js` holds one route per Spanish lesson in `ROUTES` (legs, train colours, own `localStorage` key). A page picks its
route with `<div id="viaje" data-ruta="leccion-N">`: `spanish/viaje.html` (Lección 3, the default), `spanish/viaje-leccion-4.html`
(Santiago → Cádiz) and `spanish/viaje-leccion-5.html` (Girona → Málaga). Question blocks for these are `#parte-4-1` … `#parte-5-6` in
`spanish/viaje-preguntas.html`. A new lesson needs a `ROUTES` entry, its cities in `CITIES`, the question blocks, a copy of
`viaje-leccion-4.html` and an `<h2>` section on `spanish/index.html`. Vary the cities, scenery themes and train colours per route.

## Slovak tests

`slovak/` holds tests in Slovak (`<html lang="sk">`, `<body class="slovak">`) in the same 10-question parts as the exam format above.
Put `data-input-lang="sk"` on the `.quiz` block so typed-answer fields are marked as Slovak.
A topic can have a second set of questions ("Verzia B", files ending in `-b.html`) listed under its own `<h3>` on the subject
page; the two versions link to each other. `assets/study.js` shows the answer buttons in a random order on every visit, so never
write options that depend on their order ("both of the above").

## Source photos

The owner drops photos of textbook pages and school handouts into `_StudySources/<Subject>/<Lesson or topic>/`. The folder is in
`.gitignore` and must never be published. Handouts can carry a handwritten name and marks: never repeat them. Write all questions and
example sentences yourself; do not reuse the source dialogues, texts, poems or song lyrics.
