// Study Hub — interactive quizzes and flashcards.
//
// Quiz markup:
//   <div class="quiz">
//     <div class="quiz-q" data-answer="b" data-explain="Why b is right.">
//       <p>Question text</p>
//       <button data-opt="a">Option A</button>
//       <button data-opt="b">Option B</button>
//     </div>
//   </div>
//
// Typed-answer question (accepted answers separated by |; a missing accent still counts, with a reminder):
//   <div class="quiz-q" data-accept="marido|esposo" data-explain="Why.">
//     <p>Question text</p>
//   </div>
//
// Flashcard markup:
//   <div class="flashcards">
//     <button class="flashcard"><span class="front">hola</span><span class="back">hello</span></button>
//   </div>
//
// Listen-aloud markup (adds a 🔊 button after the text; not inside buttons/flashcards):
//   <span class="say" lang="es">¿Cómo estás?</span>
// Listening exercise (the text stays hidden; only a "🔊 Listen" button shows):
//   <span class="say" lang="es" hidden>Tiene el pelo largo.</span>

// Interface text follows the page language: <html lang="sk"> gives Slovak, anything else English.
const UI_TEXT = {
  en: {
    correct: "Correct! ", wrong: "Not quite. ", check: "Check", answerIs: "Answer", accent: "Watch the accent",
    score: "Score", progress: (n) => ` (${n} answered)`, perfect: " — perfect!", again: "Try again",
    listen: "Listen", yourAnswer: "Your answer",
  },
  sk: {
    correct: "Správne! ", wrong: "Nesprávne. ", check: "Skontrolovať", answerIs: "Správna odpoveď", accent: "Pozor na diakritiku",
    score: "Skóre", progress: (n) => ` (počet odpovedí: ${n})`, perfect: " — výborne, všetko správne!", again: "Skúsiť znova",
    listen: "Vypočuť", yourAnswer: "Tvoja odpoveď",
  },
};
const T = UI_TEXT[document.documentElement.lang] || UI_TEXT.en;

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".quiz").forEach(setupQuiz);

  document.querySelectorAll(".flashcard").forEach((card) => {
    card.addEventListener("click", () => card.classList.toggle("flipped"));
  });

  if ("speechSynthesis" in window) {
    document.querySelectorAll(".say").forEach(setupSay);
  }
});

function setupSay(el) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = el.hidden ? "say-btn listen" : "say-btn";
  btn.textContent = el.hidden ? "🔊 " + T.listen : "🔊";
  btn.title = T.listen;
  btn.setAttribute("aria-label", el.hidden ? T.listen : T.listen + ": " + el.textContent);
  btn.addEventListener("click", () => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(el.textContent);
    u.lang = el.lang === "es" ? "es-ES" : el.lang || "es-ES";
    u.rate = 0.85;
    speechSynthesis.speak(u);
  });
  el.after(btn);
}

function setupQuiz(quiz) {
  const questions = [...quiz.querySelectorAll(".quiz-q")];
  const score = document.createElement("p");
  score.className = "quiz-score";
  const reset = document.createElement("button");
  reset.className = "quiz-reset";
  reset.textContent = T.again;
  reset.hidden = true;
  quiz.append(score, reset);

  let answered = 0;
  let correct = 0;

  const update = () => {
    score.textContent = `${T.score}: ${correct} / ${questions.length}` +
      (answered === questions.length ? (correct === questions.length ? T.perfect : "") : T.progress(answered));
    reset.hidden = answered < questions.length;
  };

  const record = (right) => {
    answered++;
    if (right) correct++;
    update();
  };

  questions.forEach((q) => {
    const feedback = document.createElement("p");
    feedback.className = "feedback";
    q.append(feedback);

    if (q.dataset.accept) setupTyped(q, feedback, record);

    q.querySelectorAll("button[data-opt]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const right = btn.dataset.opt === q.dataset.answer;
        q.querySelectorAll("button[data-opt]").forEach((b) => {
          b.disabled = true;
          if (b.dataset.opt === q.dataset.answer) b.classList.add("correct");
        });
        if (!right) btn.classList.add("wrong");
        feedback.className = "feedback " + (right ? "good" : "bad");
        feedback.textContent = (right ? T.correct : T.wrong) + (q.dataset.explain || "");
        record(right);
      });
    });
  });

  reset.addEventListener("click", () => {
    questions.forEach((q) => {
      q.querySelectorAll("button[data-opt]").forEach((b) => {
        b.disabled = false;
        b.classList.remove("correct", "wrong");
      });
      q.querySelectorAll(".quiz-answer input, .quiz-answer button").forEach((el) => {
        el.disabled = false;
        el.classList.remove("correct", "wrong");
        if (el.tagName === "INPUT") el.value = "";
      });
      const fb = q.querySelector(".feedback");
      fb.textContent = "";
      fb.className = "feedback";
    });
    answered = 0;
    correct = 0;
    update();
  });

  update();
}

function setupTyped(q, feedback, record) {
  const accepted = q.dataset.accept.split("|");
  const clean = (s) => s.trim().toLowerCase().replace(/[.,;:!?¡¿]/g, "").replace(/\s+/g, " ");
  const plain = (s) => clean(s).normalize("NFD").replace(/[̀-ͯ]/g, "");

  const form = document.createElement("form");
  form.className = "quiz-answer";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "quiz-input";
  input.lang = "es";
  input.autocomplete = "off";
  input.autocapitalize = "off";
  input.spellcheck = false;
  input.setAttribute("aria-label", T.yourAnswer);
  const check = document.createElement("button");
  check.type = "submit";
  check.className = "quiz-check";
  check.textContent = T.check;
  form.append(input, check);
  q.insertBefore(form, feedback);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.disabled || !clean(input.value)) return;
    const exact = accepted.find((a) => clean(a) === clean(input.value));
    const close = accepted.find((a) => plain(a) === plain(input.value));
    const right = Boolean(close);
    const note = exact ? "" : close ? `${T.accent}: ${close}. ` : `${T.answerIs}: ${accepted[0]}. `;
    input.disabled = check.disabled = true;
    input.classList.add(right ? "correct" : "wrong");
    feedback.className = "feedback " + (right ? "good" : "bad");
    feedback.textContent = (right ? T.correct : T.wrong) + note + (q.dataset.explain || "");
    record(right);
  });
}
