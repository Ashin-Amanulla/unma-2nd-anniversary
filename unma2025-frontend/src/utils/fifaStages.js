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
