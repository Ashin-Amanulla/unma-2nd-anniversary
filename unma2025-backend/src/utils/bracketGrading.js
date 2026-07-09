import { FifaBracketMatch, FifaBracketEntry } from "../models/FifaBracket.js";
import { BRACKET_MAX_POINTS } from "./bracketTree.js";

export async function advanceWinnerToParent(match) {
  if (!match.winner || !match.parentMatchKey || !match.feedsSlot) return;

  const parent = await FifaBracketMatch.findOne({
    contest: match.contest,
    bracketKey: match.parentMatchKey,
  });

  if (!parent) return;

  parent[match.feedsSlot] = match.winner;
  await parent.save();
}

export async function advanceStageWinners(contestId, stage) {
  const matches = await FifaBracketMatch.find({ contest: contestId, stage });

  for (const match of matches) {
    if (match.winner) {
      await advanceWinnerToParent(match);
    }
  }
}

/**
 * Score accuracy tiebreaker points for a single match prediction.
 * - Exact score: 3
 * - Correct outcome + goal difference: 2
 * - Correct outcome only: 1
 * - Else: 0
 */
export function computeScoreAccuracy(predScore, actualScore) {
  if (
    predScore?.a === undefined ||
    predScore?.b === undefined ||
    actualScore?.a === undefined ||
    actualScore?.b === undefined
  ) {
    return 0;
  }

  const pa = Number(predScore.a);
  const pb = Number(predScore.b);
  const aa = Number(actualScore.a);
  const ab = Number(actualScore.b);

  if (pa === aa && pb === ab) return 3;

  const predDiff = pa - pb;
  const actualDiff = aa - ab;

  if (
    (predDiff > 0 && actualDiff > 0) ||
    (predDiff < 0 && actualDiff < 0) ||
    (predDiff === 0 && actualDiff === 0)
  ) {
    if (Math.abs(predDiff) === Math.abs(actualDiff)) return 2;
    return 1;
  }

  return 0;
}

function accrueStageScorePoints(entry, stageMatches) {
  const entryScores = scoresToObject(entry.scores);
  let added = 0;

  for (const match of stageMatches) {
    if (match.scoreA == null || match.scoreB == null) continue;

    const pred = entryScores[match.bracketKey];
    if (!pred) continue;

    added += computeScoreAccuracy(pred, { a: match.scoreA, b: match.scoreB });
  }

  return added;
}

export async function gradeRound(contestId, stage) {
  const stageMatches = await FifaBracketMatch.find({ contest: contestId, stage });
  const resultsByKey = new Map(stageMatches.map((m) => [m.bracketKey, m.winner]));

  const activeEntries = await FifaBracketEntry.find({ contest: contestId, status: "active" });

  let knockedOut = 0;
  let champions = 0;

  for (const entry of activeEntries) {
    const preds = Object.fromEntries(entry.predictions);

    const scorePoints = accrueStageScorePoints(entry, stageMatches);
    if (scorePoints > 0) {
      entry.scoreAccuracyPoints = (entry.scoreAccuracyPoints || 0) + scorePoints;
    }

    let wrongInStage = false;
    for (const [key, actualWinner] of resultsByKey) {
      if (preds[key] !== actualWinner) {
        wrongInStage = true;
        break;
      }
    }

    if (wrongInStage) {
      entry.status = "knocked_out";
      entry.knockedOutRound = stage;
      await entry.save();
      knockedOut++;
    } else if (stage === "final") {
      entry.status = "champion";
      await entry.save();
      champions++;
    } else if (scorePoints > 0) {
      await entry.save();
    }
  }

  return { knockedOut, champions, graded: activeEntries.length };
}

export async function awardBracketPoints(contestId) {
  const entries = await FifaBracketEntry.find({ contest: contestId });

  for (const entry of entries) {
    entry.bracketPoints = entry.status === "champion" ? BRACKET_MAX_POINTS : 0;
    await entry.save();
  }

  return {
    awarded: entries.filter((e) => e.bracketPoints > 0).length,
    total: entries.length,
  };
}

const ROUND_REACHED_ORDER = { qf: 1, sf: 2, final: 3 };

export function getRoundReachedRank(entry) {
  if (entry.status === "champion") return 4;
  if (entry.status === "active") {
    const last = entry.lastRoundSurvived;
    if (last) return ROUND_REACHED_ORDER[last] || 0;
    return 1;
  }
  if (entry.status === "knocked_out" && entry.knockedOutRound) {
    const idx = ["qf", "sf", "final"].indexOf(entry.knockedOutRound);
    return idx > 0 ? idx : 0;
  }
  return 0;
}

export function getLastRoundSurvived(entry, publishedRound) {
  if (entry.status === "champion") return "final";
  if (entry.status === "knocked_out" && entry.knockedOutRound) {
    const order = ["qf", "sf", "final"];
    const idx = order.indexOf(entry.knockedOutRound);
    return idx > 0 ? order[idx - 1] : null;
  }
  if (entry.status === "active" && publishedRound) {
    return publishedRound;
  }
  return null;
}

export function predictionsToObject(predictions) {
  if (!predictions) return {};
  if (predictions instanceof Map) {
    return Object.fromEntries(predictions);
  }
  return predictions;
}

export function scoresToObject(scores) {
  if (!scores) return {};
  if (scores instanceof Map) {
    return Object.fromEntries(scores);
  }
  return scores;
}

export function buildQfFixtures(matches) {
  const map = new Map();
  for (const m of matches) {
    if (m.stage === "qf") {
      map.set(m.bracketKey, { teamA: m.teamA, teamB: m.teamB });
    }
  }
  return map;
}

export function compareEntriesForBoard(a, b) {
  const roundA = getRoundReachedRank({
    status: a.status,
    knockedOutRound: a.knockedOutRound,
    lastRoundSurvived: a.lastRoundSurvived,
  });
  const roundB = getRoundReachedRank({
    status: b.status,
    knockedOutRound: b.knockedOutRound,
    lastRoundSurvived: b.lastRoundSurvived,
  });

  if (roundB !== roundA) return roundB - roundA;

  const scoreA = a.scoreAccuracyPoints || 0;
  const scoreB = b.scoreAccuracyPoints || 0;
  if (scoreB !== scoreA) return scoreB - scoreA;

  const timeA = new Date(a.submittedAt || 0).getTime();
  const timeB = new Date(b.submittedAt || 0).getTime();
  return timeA - timeB;
}
