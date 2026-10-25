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
// Flashcard markup:
//   <div class="flashcards">
//     <button class="flashcard"><span class="front">hola</span><span class="back">hello</span></button>
//   </div>

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".quiz").forEach(setupQuiz);

  document.querySelectorAll(".flashcard").forEach((card) => {
    card.addEventListener("click", () => card.classList.toggle("flipped"));
  });
});

function setupQuiz(quiz) {
  const questions = [...quiz.querySelectorAll(".quiz-q")];
  const score = document.createElement("p");
  score.className = "quiz-score";
  const reset = document.createElement("button");
  reset.className = "quiz-reset";
  reset.textContent = "Try again";
  reset.hidden = true;
  quiz.append(score, reset);

  let answered = 0;
  let correct = 0;

  const update = () => {
    score.textContent = `Score: ${correct} / ${questions.length}` +
      (answered === questions.length ? (correct === questions.length ? " — perfect!" : "") : ` (${answered} answered)`);
    reset.hidden = answered < questions.length;
  };

  questions.forEach((q) => {
    const feedback = document.createElement("p");
    feedback.className = "feedback";
    q.append(feedback);

    q.querySelectorAll("button[data-opt]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const right = btn.dataset.opt === q.dataset.answer;
        q.querySelectorAll("button[data-opt]").forEach((b) => {
          b.disabled = true;
          if (b.dataset.opt === q.dataset.answer) b.classList.add("correct");
        });
        if (!right) btn.classList.add("wrong");
        feedback.className = "feedback " + (right ? "good" : "bad");
        feedback.textContent = (right ? "Correct! " : "Not quite. ") + (q.dataset.explain || "");
        answered++;
        if (right) correct++;
        update();
      });
    });
  });

  reset.addEventListener("click", () => {
    questions.forEach((q) => {
      q.querySelectorAll("button[data-opt]").forEach((b) => {
        b.disabled = false;
        b.classList.remove("correct", "wrong");
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
