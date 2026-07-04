import { Trophy } from "lucide-react";
import { BracketMatch } from "./BracketMatch";
import FifaSlotCountdown from "../fifa/FifaSlotCountdown";
import {
  BRACKET_COLUMNS,
  ROUND_LABELS,
  BRACKET_ROW_UNITS,
  resolveMatchTeams,
  getDescendantKeys,
  getMatchVerticalIndex,
} from "../../utils/fifaBracketTree";

const TRACK_HEIGHT = 780;

function ColumnHeader({ stage }) {
  return (
    <div className="mb-4 text-center shrink-0">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
        {ROUND_LABELS[stage]}
      </span>
    </div>
  );
}

function PositionedMatch({
  bracketKey,
  r16Fixtures,
  predictions,
  onPickWinner,
  disabled,
  matchesByKey,
  mode,
}) {
  const apiMatch = matchesByKey[bracketKey];
  const { teamA, teamB } =
    mode === "admin"
      ? { teamA: apiMatch?.teamA, teamB: apiMatch?.teamB }
      : resolveMatchTeams(bracketKey, r16Fixtures, predictions);

  const topPct = (getMatchVerticalIndex(bracketKey) / BRACKET_ROW_UNITS) * 100;

  return (
    <div
      className="absolute left-1/2 z-[1] w-max max-w-[140px] -translate-x-1/2 -translate-y-1/2"
      style={{ top: `${topPct}%` }}
    >
      <BracketMatch
        bracketKey={bracketKey}
        teamA={teamA}
        teamB={teamB}
        pickedWinner={predictions[bracketKey] || null}
        actualWinner={
          mode === "admin" || mode === "view" ? apiMatch?.winner || null : null
        }
        viewMode={mode === "view"}
        onPickWinner={onPickWinner}
        disabled={disabled || !teamA || !teamB}
        variant={bracketKey === "final" ? "final" : "default"}
      />
    </div>
  );
}

function StageColumn({
  stage,
  keys,
  r16Fixtures,
  predictions,
  onPickWinner,
  disabled,
  matchesByKey,
  mode,
  widthClass = "w-[132px]",
}) {
  return (
    <div className={`flex shrink-0 flex-col ${widthClass}`}>
      <ColumnHeader stage={stage} />
      <div className="relative" style={{ height: TRACK_HEIGHT }}>
        {keys.map((key) => (
          <PositionedMatch
            key={key}
            bracketKey={key}
            r16Fixtures={r16Fixtures}
            predictions={predictions}
            onPickWinner={onPickWinner}
            disabled={disabled}
            matchesByKey={matchesByKey}
            mode={mode}
          />
        ))}
      </div>
    </div>
  );
}

export function KnockoutBracket({
  matches = [],
  predictions = {},
  onPredictionsChange,
  disabled = false,
  mode = "play",
  entryClosesAt = null,
  entryOpen = false,
  showHeader = true,
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

  const columnProps = {
    r16Fixtures,
    predictions,
    onPickWinner: pickHandler,
    disabled,
    matchesByKey,
    mode,
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-8">
      {showHeader && (
        <div className="mb-6 text-center space-y-3">
          {entryClosesAt && mode === "play" && (
            <div className="flex justify-center">
              <FifaSlotCountdown
                closesAt={entryClosesAt}
                locked={!entryOpen}
                variant="urgent"
                layout="pill"
                prefix="Entries close in"
              />
            </div>
          )}
          <h2 className="text-xl font-bold uppercase tracking-widest text-[var(--fifa-dark)] md:text-2xl">
            FIFA World Cup Knockouts
          </h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-amber-600">
            Round of 16 → Final
          </p>
        </div>
      )}

      {mode === "view" && (
        <div className="mb-4 flex flex-wrap justify-center gap-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border-2 border-[var(--fifa-gold)] bg-amber-50" />
            Their pick
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border-2 border-green-600 bg-green-50" />
            Correct
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border-2 border-red-500 bg-red-50" />
            Wrong
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border-2 border-gray-200 bg-gray-100 opacity-45" />
            Not picked
          </span>
        </div>
      )}

      <div className="flex min-w-[900px] items-start justify-center gap-2 md:gap-4">
        <div className="flex gap-2 md:gap-4">
          {BRACKET_COLUMNS.left.map((col) => (
            <StageColumn
              key={`left-${col.stage}`}
              stage={col.stage}
              keys={col.keys}
              {...columnProps}
            />
          ))}
        </div>

        <div className="flex w-[168px] shrink-0 flex-col items-center">
          <ColumnHeader stage="final" />
          <div className="relative w-full" style={{ height: TRACK_HEIGHT }}>
            <div
              className="absolute left-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
              style={{
                top: `${(getMatchVerticalIndex("final") / BRACKET_ROW_UNITS) * 100}%`,
              }}
            >
              <Trophy className="absolute -top-12 left-1/2 h-10 w-10 -translate-x-1/2 text-[var(--fifa-gold)]" />
            </div>
            <PositionedMatch bracketKey="final" {...columnProps} />
          </div>
        </div>

        <div className="flex gap-2 md:gap-4">
          {BRACKET_COLUMNS.right.map((col) => (
            <StageColumn
              key={`right-${col.stage}`}
              stage={col.stage}
              keys={col.keys}
              {...columnProps}
            />
          ))}
        </div>
      </div>

      {mode === "play" && !disabled && (
        <p className="mt-6 text-center text-xs text-gray-500">
          Click a team to pick the winner. Your picks advance automatically on the road to the
          Final.
        </p>
      )}
    </div>
  );
}
