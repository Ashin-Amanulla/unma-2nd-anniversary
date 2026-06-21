/** True when a score part is unset — 0 and "0" are valid values. */
export function isScorePartProvided(part) {
  if (part === 0 || part === "0") return true;
  return part !== null && part !== undefined && part !== "";
}

/** True when the participant/admin has provided an answer. Allows 0. */
export function isFifaAnswerProvided(type, value) {
  if (value === null || value === undefined) return false;

  if (type === "score") {
    if (typeof value !== "object") return false;
    return isScorePartProvided(value.a) && isScorePartProvided(value.b);
  }

  if (type === "number") {
    if (value === 0 || value === "0") return true;
    if (value === "") return false;
    return !Number.isNaN(Number(value));
  }

  if (value === 0) return true;
  return value !== "";
}

/** Normalize answers before sending to the API. */
export function normalizeFifaAnswerForSubmit(type, value) {
  if (!isFifaAnswerProvided(type, value)) return null;

  if (type === "score") {
    return {
      a: Number(value.a),
      b: Number(value.b),
    };
  }

  if (type === "number") {
    return Number(value);
  }

  return value;
}

/** Default score form state — 0-0 is a valid prediction. */
export function defaultScoreAnswer() {
  return { a: "0", b: "0" };
}

/** Empty score object for admin result entry. */
export function emptyScoreAnswer() {
  return { a: "", b: "" };
}

/** Read stored/API score answers into string form fields. */
export function readScoreAnswer(value) {
  if (value === null || value === undefined || typeof value !== "object") {
    return defaultScoreAnswer();
  }

  return {
    a: isScorePartProvided(value.a) ? String(value.a) : "",
    b: isScorePartProvided(value.b) ? String(value.b) : "",
  };
}

/** Read stored/API number answers into string form fields. */
export function readNumberAnswer(value) {
  if (value === null || value === undefined || value === "") return "";
  if (value === 0 || value === "0") return "0";
  return String(value);
}

/** Stable answer map key for Mongo ObjectIds or strings. */
export function answerKey(id) {
  return id == null ? "" : String(id);
}
