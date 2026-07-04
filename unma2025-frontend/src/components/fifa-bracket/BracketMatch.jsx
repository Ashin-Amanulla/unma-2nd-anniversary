import { teamFlag, getTeam } from "../../utils/fifaTeams";

function TeamSlot({ team, selected, onSelect, disabled, actualWinner, size = "default" }) {
  const isLarge = size === "large";
  const isWinner = actualWinner ? team === actualWinner : selected;

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
        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">TBD</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect?.(team)}
      className={`group flex flex-col items-center gap-1.5 transition-all ${
        disabled ? "cursor-default" : "cursor-pointer hover:scale-105"
      } ${isWinner ? "scale-105" : ""}`}
    >
      <div
        className={`flex items-center justify-center rounded-full border-2 transition-all ${
          isLarge ? "h-16 w-16 text-3xl" : "h-12 w-12 text-2xl"
        } ${
          isWinner
            ? "border-[var(--fifa-gold)] bg-amber-50 shadow-md"
            : "border-gray-200 bg-white group-hover:border-amber-300 group-hover:bg-amber-50/50"
        }`}
      >
        {teamFlag(team)}
      </div>
      <span
        className={`max-w-[100px] truncate text-center font-bold uppercase tracking-wide ${
          isLarge ? "text-xs" : "text-[10px]"
        } ${isWinner ? "text-amber-700" : "text-gray-700"}`}
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
      <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600">Winner</span>
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
  variant = "default",
}) {
  const isFinal = variant === "final";

  const handlePick = (team) => {
    if (disabled || !onPickWinner) return;
    onPickWinner(bracketKey, team);
  };

  const winner = actualWinner || pickedWinner;

  return (
    <div
      className={`relative flex flex-col items-center gap-2 rounded-lg border bg-white p-3 ${
        isFinal ? "min-w-[160px] border-amber-300/60 shadow-sm" : "border-gray-200 min-w-[120px]"
      }`}
    >
      <TeamSlot
        team={teamA}
        selected={pickedWinner === teamA}
        actualWinner={actualWinner}
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
        onSelect={handlePick}
        disabled={disabled || !teamA || !teamB}
        size={isFinal ? "large" : "default"}
      />
      {isFinal && winner && <WinnerShowcase team={winner} />}
    </div>
  );
}
