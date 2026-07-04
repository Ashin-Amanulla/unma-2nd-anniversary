import { useQuery } from "@tanstack/react-query";
import fifaBracketApi from "../../api/fifaBracketApi";
import { fifaBracketKeys, fifaBracketStaleTime } from "../../hooks/useFifaBracket";
import { KnockoutBracket } from "./KnockoutBracket";
import { ROUND_LABELS } from "../../utils/fifaBracketTree";

function StatusBadge({ status, knockedOutRound }) {
  if (status === "champion") {
    return (
      <span className="inline-flex rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-black">
        Champion
      </span>
    );
  }
  if (status === "knocked_out") {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        Knocked out {knockedOutRound ? `(${ROUND_LABELS[knockedOutRound] || knockedOutRound})` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
      Active
    </span>
  );
}

function BracketDialogBody({ entry, matches }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[var(--fifa-dark)]">{entry.name}&apos;s Road to the Final</h2>
        <p className="text-sm text-gray-600 mt-1">
          {entry.jnvSchool}
          {entry.email ? ` · ${entry.email}` : ""}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <StatusBadge status={entry.status} knockedOutRound={entry.knockedOutRound} />
          {entry.lastRoundSurvived && (
            <span className="text-sm text-gray-500">
              Last survived: {ROUND_LABELS[entry.lastRoundSurvived]}
            </span>
          )}
          {entry.bracketPoints > 0 && (
            <span className="text-sm font-semibold text-[var(--fifa-gold)]">
              +{entry.bracketPoints} pts
            </span>
          )}
        </div>
      </div>

      <KnockoutBracket matches={matches} predictions={entry.predictions} disabled />
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[min(1200px,95vw)] max-h-[92vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>

        {shouldFetch && isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center text-gray-500">
            Loading…
          </div>
        ) : isError || !entry ? (
          <p className="py-8 text-center text-gray-500">Could not load this entry.</p>
        ) : (
          <BracketDialogBody entry={entry} matches={matches} />
        )}
      </div>
    </div>
  );
}
