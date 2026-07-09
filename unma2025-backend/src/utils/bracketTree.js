export const ROUND_ORDER = ["qf", "sf", "final"];

export const BRACKET_SLOTS = [
  { bracketKey: "qf-l1", stage: "qf", side: "left", order: 1, parentMatchKey: "sf-l", feedsSlot: "teamA" },
  { bracketKey: "qf-l2", stage: "qf", side: "left", order: 2, parentMatchKey: "sf-l", feedsSlot: "teamB" },
  { bracketKey: "qf-r1", stage: "qf", side: "right", order: 1, parentMatchKey: "sf-r", feedsSlot: "teamA" },
  { bracketKey: "qf-r2", stage: "qf", side: "right", order: 2, parentMatchKey: "sf-r", feedsSlot: "teamB" },
  { bracketKey: "sf-l", stage: "sf", side: "left", order: 1, parentMatchKey: "final", feedsSlot: "teamA" },
  { bracketKey: "sf-r", stage: "sf", side: "right", order: 1, parentMatchKey: "final", feedsSlot: "teamB" },
  { bracketKey: "final", stage: "final", side: "center", order: 1, parentMatchKey: null, feedsSlot: null },
];

export const ALL_BRACKET_KEYS = BRACKET_SLOTS.map((s) => s.bracketKey);

export const BRACKET_MAX_POINTS = 100;

export function getSlotByKey(bracketKey) {
  return BRACKET_SLOTS.find((s) => s.bracketKey === bracketKey) || null;
}

export function getSlotsForStage(stage) {
  return BRACKET_SLOTS.filter((s) => s.stage === stage);
}

export function getChildSlots(parentMatchKey) {
  return BRACKET_SLOTS.filter((s) => s.parentMatchKey === parentMatchKey);
}

export function getNextStage(stage) {
  const idx = ROUND_ORDER.indexOf(stage);
  return idx >= 0 && idx < ROUND_ORDER.length - 1 ? ROUND_ORDER[idx + 1] : null;
}

export function getPreviousStage(stage) {
  const idx = ROUND_ORDER.indexOf(stage);
  return idx > 0 ? ROUND_ORDER[idx - 1] : null;
}

export function resolveMatchTeams(bracketKey, qfFixtures, predictions) {
  const slot = getSlotByKey(bracketKey);
  if (!slot) return { teamA: null, teamB: null };

  if (slot.stage === "qf") {
    const fixture = qfFixtures.get(bracketKey);
    return { teamA: fixture?.teamA || null, teamB: fixture?.teamB || null };
  }

  const children = getChildSlots(bracketKey);
  const teamA = children.find((c) => c.feedsSlot === "teamA");
  const teamB = children.find((c) => c.feedsSlot === "teamB");

  return {
    teamA: teamA ? predictions[teamA.bracketKey] || null : null,
    teamB: teamB ? predictions[teamB.bracketKey] || null : null,
  };
}

export function validatePredictions(predictions, qfFixtures) {
  const errors = [];

  for (const key of ALL_BRACKET_KEYS) {
    if (!predictions[key]) {
      errors.push(`Missing prediction for ${key}`);
    }
  }

  if (errors.length) return errors;

  for (const key of ALL_BRACKET_KEYS) {
    const { teamA, teamB } = resolveMatchTeams(key, qfFixtures, predictions);
    const pick = predictions[key];

    if (!teamA || !teamB) {
      errors.push(`Cannot resolve teams for ${key}`);
      continue;
    }

    if (pick !== teamA && pick !== teamB) {
      errors.push(`Invalid pick for ${key}: must be one of the two teams in that match`);
    }
  }

  return errors;
}

export function validateScores(scores, predictions, qfFixtures) {
  const errors = [];

  for (const key of ALL_BRACKET_KEYS) {
    const score = scores[key];
    if (!score || score.a === undefined || score.b === undefined) {
      errors.push(`Missing score for ${key}`);
      continue;
    }

    if (score.a === score.b) continue;

    const { teamA, teamB } = resolveMatchTeams(key, qfFixtures, predictions);
    const pick = predictions[key];
    const scoreWinner = score.a > score.b ? teamA : teamB;

    if (pick && scoreWinner !== pick) {
      errors.push(`Score for ${key} does not match your winner pick`);
    }
  }

  return errors;
}
