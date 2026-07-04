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

export async function gradeRound(contestId, stage) {
  const stageMatches = await FifaBracketMatch.find({ contest: contestId, stage });
  const resultsByKey = new Map(stageMatches.map((m) => [m.bracketKey, m.winner]));

  const activeEntries = await FifaBracketEntry.find({ contest: contestId, status: "active" });

  let knockedOut = 0;
  let champions = 0;

  for (const entry of activeEntries) {
    const preds = Object.fromEntries(entry.predictions);

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

export function getLastRoundSurvived(entry, publishedRound) {
  if (entry.status === "champion") return "final";
  if (entry.status === "knocked_out" && entry.knockedOutRound) {
    const order = ["r16", "qf", "sf", "final"];
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

export function buildR16Fixtures(matches) {
  const map = new Map();
  for (const m of matches) {
    if (m.stage === "r16") {
      map.set(m.bracketKey, { teamA: m.teamA, teamB: m.teamB });
    }
  }
  return map;
}
