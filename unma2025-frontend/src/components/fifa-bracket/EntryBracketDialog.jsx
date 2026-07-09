import { useQuery } from "@tanstack/react-query";
import { XMarkIcon, TrophyIcon } from "@heroicons/react/24/outline";
import fifaBracketApi from "../../api/fifaBracketApi";
import { fifaBracketKeys, fifaBracketStaleTime } from "../../hooks/useFifaBracket";
import { KnockoutBracket } from "./KnockoutBracket";
import { ROUND_LABELS } from "../../utils/fifaBracketTree";

function StatusBadge({ status, knockedOutRound }) {
  if (status === "champion") {
    return (
      <span className="inline-flex rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-semibold text-[#1a1a1a]">
        Champion
      </span>
    );
  }
  if (status === "knocked_out") {
    return (
      <span className="inline-flex rounded-full bg-red-500/90 px-2.5 py-0.5 text-xs font-semibold text-white">
        Knocked out {knockedOutRound ? `(${ROUND_LABELS[knockedOutRound] || knockedOutRound})` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
      Active
    </span>
  );
}

function BracketDialogBody({ entry, matches }) {
  return (
    <KnockoutBracket
      matches={matches}
      predictions={entry.predictions}
      scores={entry.scores || {}}
      disabled
      mode="view"
      showHeader={false}
    />
  );
}

export function EntryBracketDialog({
  open,
  onClose,
  entryId = null,
  entry: preloadedEntry = null,
  matches: preloadedMatches = [],
}) {
  const shouldFetch = open && !!entryId && !preloadedEntry;

  const { data, isLoading, isError } = useQuery({
    queryKey: fifaBracketKeys.entry(entryId),
    queryFn: () => fifaBracketApi.getEntry(entryId),
    enabled: shouldFetch,
    staleTime: fifaBracketStaleTime,
  });

  const entry = preloadedEntry || data?.entry;
  const matches = preloadedEntry ? preloadedMatches : data?.matches || [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className="relative z-[1] flex w-full max-w-[min(1200px,96vw)] max-h-[94vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-bracket-title"
      >
        {entry && (
          <div
            className="relative shrink-0 px-5 py-5 sm:px-6"
            style={{
              background:
                "linear-gradient(135deg, #1a7a3c 0%, #22a04a 40%, #1a7a3c 70%, #15612f 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(255,255,255,0.8) 48px, rgba(255,255,255,0.8) 50px)",
              }}
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="relative pr-8 space-y-2">
              <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-widest font-medium">
                <TrophyIcon className="h-4 w-4 text-[#e0a431]" />
                Road to the Final
              </div>
              <h2 id="entry-bracket-title" className="text-xl sm:text-2xl font-bold text-white">
                {entry.name}&apos;s picks
              </h2>
              <p className="text-sm text-white/80">
                {entry.jnvSchool}
                {entry.email ? ` · ${entry.email}` : ""}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <StatusBadge status={entry.status} knockedOutRound={entry.knockedOutRound} />
                {entry.lastRoundSurvived && (
                  <span className="text-xs text-white/75">
                    Last survived: {ROUND_LABELS[entry.lastRoundSurvived]}
                  </span>
                )}
                {entry.bracketPoints > 0 && (
                  <span className="text-xs font-bold text-[#e0a431]">+{entry.bracketPoints} pts</span>
                )}
                {(entry.scoreAccuracyPoints ?? 0) > 0 && (
                  <span className="text-xs text-white/75">
                    Score tiebreak: {entry.scoreAccuracyPoints} pts
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/80">
          {shouldFetch && isLoading ? (
            <div className="flex min-h-[240px] items-center justify-center text-gray-500">
              Loading picks…
            </div>
          ) : isError || !entry ? (
            <p className="py-12 text-center text-gray-500">Could not load this entry.</p>
          ) : (
            <BracketDialogBody entry={entry} matches={matches} />
          )}
        </div>
      </div>
    </div>
  );
}
