import {
  ALL_BRACKET_KEYS,
  resolveMatchTeams,
  buildQfFixturesFromMatches,
} from "../../utils/fifaBracketTree";

export function isScoresComplete(scores) {
  return ALL_BRACKET_KEYS.every((key) => {
    const s = scores[key];
    return s && s.a !== "" && s.a !== undefined && s.b !== "" && s.b !== undefined;
  });
}

export function validateScoresClient(scores, predictions, matches) {
  const qfFixtures = buildQfFixturesFromMatches(matches);
  const errors = [];

  for (const key of ALL_BRACKET_KEYS) {
    const s = scores[key];
    if (!s || s.a === "" || s.b === "" || s.a === undefined || s.b === undefined) {
      errors.push("Enter score for all matches");
      continue;
    }
    if (s.a === s.b) continue;

    const { teamA, teamB } = resolveMatchTeams(key, qfFixtures, predictions);
    const pick = predictions[key];
    const scoreWinner = s.a > s.b ? teamA : teamB;
    if (pick && scoreWinner !== pick) {
      errors.push("Score must match your winner pick (or enter a draw and pick the penalty winner)");
    }
  }
  return errors;
}
