export const KNOCKOUT_STAGES = ["r32", "r16", "qf", "sf", "final"];

export function isKnockoutStage(stage) {
  return KNOCKOUT_STAGES.includes(stage);
}

export function getWinnerChoices(stage, teamA, teamB, { flagA = "⚽", flagB = "⚽" } = {}) {
  const choices = [
    { value: "teamA", label: teamA, icon: flagA },
    { value: "teamB", label: teamB, icon: flagB },
  ];
  if (!isKnockoutStage(stage)) {
    choices.splice(1, 0, { value: "draw", label: "Draw", icon: "🤝" });
  }
  return choices;
}

export function winnerQuestionHint(stage) {
  if (isKnockoutStage(stage)) {
    return "Pick who advances (includes win on penalties).";
  }
  return "Team A / Draw / Team B";
}

export function scoreQuestionHint(stage) {
  if (isKnockoutStage(stage)) {
    return "90-minute score (regulation time).";
  }
  return null;
}
