export const KNOCKOUT_STAGES = ["r32", "r16", "qf", "sf", "final"];

export function isKnockoutStage(stage) {
  return KNOCKOUT_STAGES.includes(stage);
}

export function validateWinnerAnswer(stage, value) {
  if (value === "draw" && isKnockoutStage(stage)) {
    return "Draw is not allowed for knockout matches — pick the advancing team";
  }
  return null;
}
