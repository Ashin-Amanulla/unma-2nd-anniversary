export const ROUND_ORDER = ["qf", "sf", "final"];

export const ROUND_LABELS = {
  qf: "Quarter-finals",
  sf: "Semi-finals",
  final: "Final",
};

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

export function getSlotByKey(bracketKey) {
  return BRACKET_SLOTS.find((s) => s.bracketKey === bracketKey) || null;
}

export function getChildSlots(parentMatchKey) {
  return BRACKET_SLOTS.filter((s) => s.parentMatchKey === parentMatchKey);
}

export function getDescendantKeys(bracketKey) {
  const slot = getSlotByKey(bracketKey);
  if (!slot?.parentMatchKey) return [];
  const parent = slot.parentMatchKey;
  return [parent, ...getDescendantKeys(parent)];
}

export function resolveMatchTeams(bracketKey, qfFixtures, predictions) {
  const slot = getSlotByKey(bracketKey);
  if (!slot) return { teamA: null, teamB: null };

  if (slot.stage === "qf") {
    const fixture = qfFixtures[bracketKey];
    return { teamA: fixture?.teamA || null, teamB: fixture?.teamB || null };
  }

  const children = getChildSlots(bracketKey);
  const childA = children.find((c) => c.feedsSlot === "teamA");
  const childB = children.find((c) => c.feedsSlot === "teamB");

  return {
    teamA: childA ? predictions[childA.bracketKey] || null : null,
    teamB: childB ? predictions[childB.bracketKey] || null : null,
  };
}

export function buildQfFixturesFromMatches(matches) {
  const fixtures = {};
  for (const m of matches) {
    if (m.stage === "qf") {
      fixtures[m.bracketKey] = { teamA: m.teamA, teamB: m.teamB };
    }
  }
  return fixtures;
}

export function isPredictionsComplete(predictions) {
  return ALL_BRACKET_KEYS.every((key) => predictions[key]);
}

export const BRACKET_ROW_UNITS = 6;

export function getMatchVerticalIndex(bracketKey) {
  const slot = getSlotByKey(bracketKey);
  if (!slot) return BRACKET_ROW_UNITS / 2;

  if (slot.stage === "qf") {
    return (slot.order - 1) * 4 + 1;
  }

  const children = getChildSlots(bracketKey);
  if (children.length >= 2) {
    const sum = children.reduce(
      (acc, child) => acc + getMatchVerticalIndex(child.bracketKey),
      0
    );
    return sum / children.length;
  }

  return BRACKET_ROW_UNITS / 2;
}

export const BRACKET_COLUMNS = {
  left: [
    { stage: "qf", keys: ["qf-l1", "qf-l2"] },
    { stage: "sf", keys: ["sf-l"] },
  ],
  center: [{ stage: "final", keys: ["final"] }],
  right: [
    { stage: "sf", keys: ["sf-r"] },
    { stage: "qf", keys: ["qf-r1", "qf-r2"] },
  ],
};
