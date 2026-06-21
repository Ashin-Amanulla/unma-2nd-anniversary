/**
 * Per-question grading for the FIFA prediction contest.
 */

export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchText(submitted, correct) {
  const a = normalizeText(submitted);
  const b = normalizeText(correct);

  if (!a || !b) return { match: false, confident: true };
  if (a === b) return { match: true, confident: true };

  const aTokens = new Set(a.split(" ").filter(Boolean));
  const bTokens = new Set(b.split(" ").filter(Boolean));

  const aLast = a.split(" ").pop();
  const bLast = b.split(" ").pop();
  if (aLast && aLast === bLast) return { match: true, confident: false };

  for (const t of aTokens) {
    if (t.length > 2 && bTokens.has(t)) {
      return { match: true, confident: false };
    }
  }

  return { match: false, confident: true };
}

function numbersEqual(x, y) {
  if (x === null || x === undefined || y === null || y === undefined) return false;
  if (x === "" || y === "") return false;
  return Number(x) === Number(y);
}

export function gradeAnswer(question, value) {
  const zero = { pointsAwarded: 0, graded: true, needsReview: false };

  if (question.correctAnswer == null) {
    return { pointsAwarded: 0, graded: false, needsReview: false };
  }
  if (value === null || value === undefined || value === "") return zero;

  const full = { pointsAwarded: question.points, graded: true, needsReview: false };

  switch (question.type) {
    case "winner":
    case "choice":
      return value === question.correctAnswer ? full : zero;

    case "number":
      return numbersEqual(value, question.correctAnswer) ? full : zero;

    case "score": {
      const ca = question.correctAnswer ?? {};
      const va = value ?? {};
      return numbersEqual(va.a, ca.a) && numbersEqual(va.b, ca.b) ? full : zero;
    }

    case "text": {
      const { match, confident } = matchText(value, question.correctAnswer);
      if (match && confident) return full;
      if (match && !confident) {
        return { pointsAwarded: 0, graded: false, needsReview: true };
      }
      return zero;
    }

    default:
      return zero;
  }
}
