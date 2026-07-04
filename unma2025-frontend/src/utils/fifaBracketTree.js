export const ROUND_ORDER = ["r16", "qf", "sf", "final"];

export const ROUND_LABELS = {
  r16: "Round of 16",
  qf: "Quarter-finals",
  sf: "Semi-finals",
  final: "Final",
};

export const BRACKET_SLOTS = [
  { bracketKey: "r16-l1", stage: "r16", side: "left", order: 1, parentMatchKey: "qf-l1", feedsSlot: "teamA" },
  { bracketKey: "r16-l2", stage: "r16", side: "left", order: 2, parentMatchKey: "qf-l1", feedsSlot: "teamB" },
  { bracketKey: "r16-l3", stage: "r16", side: "left", order: 3, parentMatchKey: "qf-l2", feedsSlot: "teamA" },
  { bracketKey: "r16-l4", stage: "r16", side: "left", order: 4, parentMatchKey: "qf-l2", feedsSlot: "teamB" },
  { bracketKey: "r16-r1", stage: "r16", side: "right", order: 1, parentMatchKey: "qf-r1", feedsSlot: "teamA" },
  { bracketKey: "r16-r2", stage: "r16", side: "right", order: 2, parentMatchKey: "qf-r1", feedsSlot: "teamB" },
  { bracketKey: "r16-r3", stage: "r16", side: "right", order: 3, parentMatchKey: "qf-r2", feedsSlot: "teamA" },
  { bracketKey: "r16-r4", stage: "r16", side: "right", order: 4, parentMatchKey: "qf-r2", feedsSlot: "teamB" },
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

export function resolveMatchTeams(bracketKey, r16Fixtures, predictions) {
  const slot = getSlotByKey(bracketKey);
  if (!slot) return { teamA: null, teamB: null };

  if (slot.stage === "r16") {
    const fixture = r16Fixtures[bracketKey];
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

export function isPredictionsComplete(predictions) {
  return ALL_BRACKET_KEYS.every((key) => predictions[key]);
}

export const BRACKET_COLUMNS = {
  left: [
    { stage: "r16", keys: ["r16-l1", "r16-l2", "r16-l3", "r16-l4"] },
    { stage: "qf", keys: ["qf-l1", "qf-l2"] },
    { stage: "sf", keys: ["sf-l"] },
  ],
  center: [{ stage: "final", keys: ["final"] }],
  right: [
    { stage: "sf", keys: ["sf-r"] },
    { stage: "qf", keys: ["qf-r1", "qf-r2"] },
    { stage: "r16", keys: ["r16-r1", "r16-r2", "r16-r3", "r16-r4"] },
  ],
};
