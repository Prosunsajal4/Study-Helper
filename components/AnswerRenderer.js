import React from "react";

export default function AnswerRenderer({ answer }) {
  if (!answer) return null;

  // Heuristic to detect math-like answers: LaTeX delimiters, common LaTeX commands,
  // or presence of numeric expressions with operators.
  const mathRegex =
    /\$.*\$|\\\(|\\\[|\\frac|\\\\frac|[0-9]+\s*[=+\-×\*\/^]\s*[0-9]+/s;
  const isMath = mathRegex.test(answer);

  if (isMath) {
    // Preserve formatting and allow monospaced math/steps display.
    return (
      <pre className="answer-renderer math-answer" aria-label="Math answer">
        {answer}
      </pre>
    );
  }

  // Theory / prose answers: split on blank lines into paragraphs.
  const paragraphs = answer
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="answer-renderer theory-answer" aria-label="Theory answer">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
