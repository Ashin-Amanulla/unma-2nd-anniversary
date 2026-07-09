import { teamFlag, getTeam } from "../../utils/fifaTeams";

function ScoreInput({ value, onChange, disabled, label }) {
  return (
    <input
      type="number"
      min={0}
      max={20}
      inputMode="numeric"
      aria-label={label}
      value={value ?? ""}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      disabled={disabled}
      className="h-7 w-8 shrink-0 rounded border border-gray-300 bg-white px-1 text-center text-xs font-bold"
    />
  );
}

function ScoreDisplay({ value }) {
  if (value === "" || value === undefined || value === null) return null;
  return (
    <span className="flex h-7 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-xs font-bold text-gray-800">
      {value}
    </span>
  );
}

function TeamSlot({
  team,
  score,
  onScoreChange,
  scoreSide,
  showScoreInput = false,
  showScoreDisplay = false,
  selected,
  onSelect,
  disabled,
  actualWinner,
  matchPickedWinner = null,
  viewMode = false,
  size = "default",
}) {
  const isLarge = size === "large";
  const isPicked = selected;
  const isActual = viewMode && actualWinner && team === actualWinner;
  const isWrongPick = viewMode && actualWinner && isPicked && team !== actualWinner;
  const isUnselected = viewMode
    ? !isPicked && !isActual
    : Boolean(matchPickedWinner && !isPicked);

  if (!team) {
    return (
      <div className="flex items-center gap-1.5 opacity-50">
        {showScoreInput && <div className="h-7 w-8 shrink-0" />}
        {showScoreDisplay && <div className="h-7 w-8 shrink-0" />}
        <div className="flex flex-col items-center gap-1">
          <div
            className={`flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-lg ${
              isLarge ? "h-14 w-14 text-2xl" : "h-10 w-10 text-xl"
            }`}
          >
            ?
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            TBD
          </span>
        </div>
      </div>
    );
  }

  let ringClass =
    "border-gray-200 bg-white group-hover:border-amber-300 group-hover:bg-amber-50/50";
  if (viewMode) {
    if (isWrongPick) {
      ringClass = "border-red-500 bg-red-50 shadow-md";
    } else if (isPicked && isActual) {
      ringClass = "border-green-600 bg-green-50 shadow-md";
    } else if (isPicked) {
      ringClass = "border-[var(--fifa-gold)] bg-amber-50 shadow-md";
    } else if (isActual) {
      ringClass = "border-green-500 bg-green-50/80";
    } else if (isUnselected) {
      ringClass = "border-gray-200 bg-gray-100";
    }
  } else if (isPicked || (!viewMode && actualWinner && team === actualWinner)) {
    ringClass = "border-[var(--fifa-gold)] bg-amber-50 shadow-md";
  } else if (isUnselected) {
    ringClass = "border-gray-200 bg-gray-100";
  }

  const labelClass = isWrongPick
    ? "text-red-700"
    : isPicked || isActual
      ? "text-amber-700"
      : isUnselected
        ? "text-gray-400"
        : "text-gray-700";

  return (
    <div className="flex items-center gap-1.5">
      {showScoreInput && (
        <ScoreInput
          label={`${team} score`}
          value={score}
          onChange={(v) => onScoreChange?.(scoreSide, v)}
          disabled={disabled}
        />
      )}
      {showScoreDisplay && <ScoreDisplay value={score} />}

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect?.(team)}
        className={`group flex flex-col items-center gap-1 transition-all ${
          disabled ? "cursor-default" : "cursor-pointer hover:scale-105"
        } ${(isPicked || isActual) ? "scale-105" : ""} ${
          isUnselected ? "opacity-45 grayscale-[0.35] hover:opacity-70 hover:grayscale-0" : ""
        }`}
      >
        <div
          className={`relative flex items-center justify-center rounded-full border-2 transition-all ${
            isLarge ? "h-14 w-14 text-3xl" : "h-10 w-10 text-2xl"
          } ${ringClass}`}
        >
          {teamFlag(team)}
          {viewMode && isPicked && isActual && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-600 text-[8px] text-white">
              ✓
            </span>
          )}
          {viewMode && isWrongPick && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] text-white">
              ✕
            </span>
          )}
        </div>
        <span
          className={`max-w-[72px] truncate text-center font-bold uppercase tracking-wide ${
            isLarge ? "text-xs" : "text-[10px]"
          } ${labelClass}`}
        >
          {getTeam(team)?.short || team}
        </span>
      </button>
    </div>
  );
}

function WinnerShowcase({ team }) {
  const teamInfo = getTeam(team);

  return (
    <div className="mt-3 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-[var(--fifa-gold)] bg-amber-50 px-3 py-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-600">
        Winner
      </span>
      <span className="text-4xl leading-none">{teamFlag(team)}</span>
      <span className="text-center text-sm font-bold text-[var(--fifa-dark)]">
        {teamInfo?.name || team}
      </span>
    </div>
  );
}

export function BracketMatch({
  bracketKey,
  teamA,
  teamB,
  pickedWinner,
  onPickWinner,
  scoreA,
  scoreB,
  onScoreChange,
  showScores = false,
  disabled = false,
  actualWinner = null,
  actualScoreA = null,
  actualScoreB = null,
  viewMode = false,
  variant = "default",
}) {
  const isFinal = variant === "final";
  const hasTeams = Boolean(teamA && teamB);
  const showScoreInput = showScores && !viewMode && hasTeams;
  const showScoreDisplay = showScores && viewMode && hasTeams;

  const handlePick = (team) => {
    if (disabled || !onPickWinner) return;
    onPickWinner(bracketKey, team);
  };

  const handleScoreChange = (side, value) => {
    if (!onScoreChange) return;
    onScoreChange(bracketKey, side, value);
  };

  const showcaseWinner = viewMode ? pickedWinner : actualWinner || pickedWinner;

  return (
    <div
      className={`relative flex flex-col items-center gap-1.5 rounded-lg border bg-white p-2.5 ${
        isFinal ? "min-w-[150px] border-amber-300/60 shadow-sm" : "min-w-[130px] border-gray-200"
      }`}
    >
      <TeamSlot
        team={teamA}
        score={scoreA}
        scoreSide="a"
        onScoreChange={handleScoreChange}
        showScoreInput={showScoreInput}
        showScoreDisplay={showScoreDisplay}
        selected={pickedWinner === teamA}
        actualWinner={actualWinner}
        matchPickedWinner={pickedWinner}
        viewMode={viewMode}
        onSelect={handlePick}
        disabled={disabled || !hasTeams}
        size={isFinal ? "large" : "default"}
      />
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold uppercase text-gray-500">
        vs
      </span>
      <TeamSlot
        team={teamB}
        score={scoreB}
        scoreSide="b"
        onScoreChange={handleScoreChange}
        showScoreInput={showScoreInput}
        showScoreDisplay={showScoreDisplay}
        selected={pickedWinner === teamB}
        actualWinner={actualWinner}
        matchPickedWinner={pickedWinner}
        viewMode={viewMode}
        onSelect={handlePick}
        disabled={disabled || !hasTeams}
        size={isFinal ? "large" : "default"}
      />
      {viewMode && actualScoreA != null && actualScoreB != null && (
        <p className="text-[9px] text-gray-500">
          Actual: {actualScoreA}–{actualScoreB}
        </p>
      )}
      {isFinal && showcaseWinner && <WinnerShowcase team={showcaseWinner} />}
    </div>
  );
}
