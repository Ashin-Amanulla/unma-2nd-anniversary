import { Trophy } from "lucide-react";
import { BracketMatch } from "./BracketMatch";
import {
  BRACKET_COLUMNS,
  ROUND_LABELS,
  resolveMatchTeams,
  getDescendantKeys,
} from "../../utils/fifaBracketTree";

function MatchColumn({
  keys,
  stage,
  r16Fixtures,
  predictions,
  onPickWinner,
  disabled,
  matchesByKey,
  mode,
}) {
  const gapClass =
    stage === "r16" ? "gap-6" : stage === "qf" ? "gap-16 py-8" : stage === "sf" ? "py-20" : "";

  return (
    <div className={`flex flex-col justify-center ${gapClass}`}>
      {keys.map((key) => {
        const apiMatch = matchesByKey[key];
        const { teamA, teamB } =
          mode === "admin"
            ? { teamA: apiMatch?.teamA, teamB: apiMatch?.teamB }
            : resolveMatchTeams(key, r16Fixtures, predictions);

        return (
          <BracketMatch
            key={key}
            bracketKey={key}
            teamA={teamA}
            teamB={teamB}
            pickedWinner={predictions[key] || null}
            actualWinner={mode === "admin" ? apiMatch?.winner : null}
            onPickWinner={onPickWinner}
            disabled={disabled || !teamA || !teamB}
            variant={key === "final" ? "final" : "default"}
          />
        );
      })}
    </div>
  );
}

function ColumnHeader({ stage }) {
  return (
    <div className="mb-4 text-center">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
        {ROUND_LABELS[stage]}
      </span>
    </div>
  );
}

export function KnockoutBracket({
  matches = [],
  predictions = {},
  onPredictionsChange,
  disabled = false,
  mode = "play",
}) {
  const r16Fixtures = {};
  const matchesByKey = {};
  for (const m of matches) {
    matchesByKey[m.bracketKey] = m;
    if (m.stage === "r16") {
      r16Fixtures[m.bracketKey] = { teamA: m.teamA, teamB: m.teamB };
    }
  }

  const handlePickWinner = (matchKey, team) => {
    if (disabled || !onPredictionsChange) return;

    const next = { ...predictions, [matchKey]: team };
    for (const desc of getDescendantKeys(matchKey)) {
      delete next[desc];
    }
    onPredictionsChange(next);
  };

  const handleAdminPick = (matchKey, team) => {
    if (mode !== "admin" || !onPredictionsChange) return;
    onPredictionsChange(matchKey, team);
  };

  const pickHandler = mode === "admin" ? handleAdminPick : handlePickWinner;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-8">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold uppercase tracking-widest text-[var(--fifa-dark)] md:text-2xl">
          FIFA World Cup Knockouts
        </h2>
        <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-amber-600">
          Round of 16 → Final
        </p>
      </div>

      <div className="flex min-w-[900px] items-stretch justify-center gap-2 md:gap-4">
        <div className="flex gap-2 md:gap-4">
          {BRACKET_COLUMNS.left.map((col) => (
            <div key={`${col.stage}-left`} className="flex flex-col">
              <ColumnHeader stage={col.stage} />
              <MatchColumn
                keys={col.keys}
                stage={col.stage}
                r16Fixtures={r16Fixtures}
                predictions={predictions}
                onPickWinner={pickHandler}
                disabled={disabled}
                matchesByKey={matchesByKey}
                mode={mode}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center px-2">
          <ColumnHeader stage="final" />
          <div className="relative flex flex-col items-center gap-4">
            <Trophy className="h-10 w-10 text-[var(--fifa-gold)]" />
            <MatchColumn
              keys={["final"]}
              stage="final"
              r16Fixtures={r16Fixtures}
              predictions={predictions}
              onPickWinner={pickHandler}
              disabled={disabled}
              matchesByKey={matchesByKey}
              mode={mode}
            />
          </div>
        </div>

        <div className="flex gap-2 md:gap-4">
          {BRACKET_COLUMNS.right.map((col) => (
            <div key={`${col.stage}-right`} className="flex flex-col">
              <ColumnHeader stage={col.stage} />
              <MatchColumn
                keys={col.keys}
                stage={col.stage}
                r16Fixtures={r16Fixtures}
                predictions={predictions}
                onPickWinner={pickHandler}
                disabled={disabled}
                matchesByKey={matchesByKey}
                mode={mode}
              />
            </div>
          ))}
        </div>
      </div>

      {mode === "play" && !disabled && (
        <p className="mt-6 text-center text-xs text-gray-500">
          Click a team to pick the winner. Your picks advance automatically on the road to the Final.
        </p>
      )}
    </div>
  );
}
