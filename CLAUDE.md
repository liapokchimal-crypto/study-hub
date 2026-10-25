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

Subjects so far: `spanish`, `math`, `chemistry`. A new subject needs: a folder with `index.html`
(copy an existing subject page), a card on the home page, and a `--<subject>` color + `.<subject>` class in `style.css`.

## Writing a lesson

1. Copy `templates/lesson-template.html` to `<subject>/<slug>.html`; replace every `[BRACKETED]` part.
2. Set `<body class="<subject>">` so the subject color is used.
3. Structure: short intro → explanation → worked example(s) → practice with hidden solutions (`<details>`)
   → flashcards (optional, great for vocabulary) → quiz (5–10 questions, each with `data-explain`).
4. Formulas: KaTeX with `\( inline \)` and `$$ display $$`; chemistry with `\ce{...}` (mhchem).
   Remove the KaTeX lines from `<head>` if the lesson has no formulas.
   Do not use single `$` as a math delimiter.
5. Spanish lessons: explain in English, examples in Spanish with English translations.
6. Add the lesson to `<subject>/index.html` (at the end, numbered) and to the top of "Latest lessons" on `index.html`
   (remove the oldest if more than 5).
7. Write clearly and encouragingly for a university student. Check facts and answers carefully — every quiz
   answer key must be correct.
8. Must work on a phone: no wide fixed-width content; wrap wide tables in `<div class="table-scroll">`.

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
