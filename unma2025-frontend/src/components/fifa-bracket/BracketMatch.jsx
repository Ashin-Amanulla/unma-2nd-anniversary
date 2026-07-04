import { teamFlag, getTeam } from "../../utils/fifaTeams";

function TeamSlot({
  team,
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
      <div className="flex flex-col items-center gap-1 opacity-50">
        <div
          className={`flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-lg ${
            isLarge ? "h-16 w-16 text-2xl" : "h-12 w-12"
          }`}
        >
          ?
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
          TBD
        </span>
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
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect?.(team)}
      className={`group flex flex-col items-center gap-1.5 transition-all ${
        disabled ? "cursor-default" : "cursor-pointer hover:scale-105"
      } ${isPicked || isActual ? "scale-105" : ""} ${
        isUnselected ? "opacity-45 grayscale-[0.35] hover:opacity-70 hover:grayscale-0" : ""
      }`}
    >
      <div
        className={`relative flex items-center justify-center rounded-full border-2 transition-all ${
          isLarge ? "h-16 w-16 text-3xl" : "h-12 w-12 text-2xl"
        } ${ringClass}`}
      >
        {teamFlag(team)}
        {viewMode && isPicked && isActual && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[9px] text-white">
            ✓
          </span>
        )}
        {viewMode && isWrongPick && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] text-white">
            ✕
          </span>
        )}
      </div>
      <span
        className={`max-w-[100px] truncate text-center font-bold uppercase tracking-wide ${
          isLarge ? "text-xs" : "text-[10px]"
        } ${labelClass}`}
      >
        {getTeam(team)?.short || team}
      </span>
    </button>
  );
}

function WinnerShowcase({ team }) {
  const teamInfo = getTeam(team);

  return (
    <div className="mt-4 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-[var(--fifa-gold)] bg-amber-50 px-4 py-5">
      <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600">
        Winner
      </span>
      <span className="text-5xl leading-none">{teamFlag(team)}</span>
      <span className="text-center text-lg font-bold text-[var(--fifa-dark)]">
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
  disabled = false,
  actualWinner = null,
  viewMode = false,
  variant = "default",
}) {
  const isFinal = variant === "final";

  const handlePick = (team) => {
    if (disabled || !onPickWinner) return;
    onPickWinner(bracketKey, team);
  };

  const showcaseWinner = viewMode ? pickedWinner : actualWinner || pickedWinner;

  return (
    <div
      className={`relative flex flex-col items-center gap-2 rounded-lg border bg-white p-3 ${
        isFinal
          ? "min-w-[160px] border-amber-300/60 shadow-sm"
          : "border-gray-200 min-w-[120px]"
      }`}
    >
      <TeamSlot
        team={teamA}
        selected={pickedWinner === teamA}
        actualWinner={actualWinner}
        matchPickedWinner={pickedWinner}
        viewMode={viewMode}
        onSelect={handlePick}
        disabled={disabled || !teamA || !teamB}
        size={isFinal ? "large" : "default"}
      />
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold uppercase text-gray-500">
        vs
      </span>
      <TeamSlot
        team={teamB}
        selected={pickedWinner === teamB}
        actualWinner={actualWinner}
        matchPickedWinner={pickedWinner}
        viewMode={viewMode}
        onSelect={handlePick}
        disabled={disabled || !teamA || !teamB}
        size={isFinal ? "large" : "default"}
      />
      {isFinal && showcaseWinner && <WinnerShowcase team={showcaseWinner} />}
    </div>
  );
}
