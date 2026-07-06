import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import fifaBracketApi from "../../api/fifaBracketApi";
import { fifaBracketKeys, fifaBracketStaleTime } from "../../hooks/useFifaBracket";
import { EntryBracketDialog } from "../../components/fifa-bracket/EntryBracketDialog";
import { ROUND_LABELS } from "../../utils/fifaBracketTree";
import { readSavedParticipant } from "../../utils/fifaParticipant";

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
        Out {knockedOutRound ? `(${ROUND_LABELS[knockedOutRound] || knockedOutRound})` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
      Active
    </span>
  );
}

function getRowClasses(pickStatus, isMe) {
  const base =
    "cursor-pointer border-b last:border-0 transition-colors hover:opacity-95";

  let tint = "hover:bg-gray-50";
  if (pickStatus === "wrong") {
    tint = "bg-red-50 hover:bg-red-100";
  } else if (pickStatus === "correct") {
    tint = "bg-green-50 hover:bg-green-100";
  } else if (pickStatus === "champion") {
    tint = "bg-amber-50 hover:bg-amber-100";
  }

  const youAccent = isMe ? "border-l-4 border-l-amber-500" : "";

  return `${base} ${tint} ${youAccent}`.trim();
}

export default function FifaBracketBoard() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [selectedEntryId, setSelectedEntryId] = useState(null);

  const savedParticipant = readSavedParticipant();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: fifaBracketKeys.board({ statusFilter, schoolFilter }),
    queryFn: () =>
      fifaBracketApi.getBoard({
        status: statusFilter,
        jnvSchool: schoolFilter || undefined,
        limit: 100,
      }),
    staleTime: fifaBracketStaleTime,
    refetchInterval: 2 * 60 * 1000,
  });

  const contest = data?.contest;
  const entries = data?.entries || [];
  const summary = data?.summary;

  if (isLoading) {
    return (
      <div className="fifa-page flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading board…</p>
      </div>
    );
  }

  return (
    <div className="fifa-page">
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--fifa-dark)]">Survival Board</h1>
            {contest && (
              <p className="text-gray-600 mt-1">
                {contest.name}
                {contest.publishedRound && (
                  <> · Last published: {ROUND_LABELS[contest.publishedRound]}</>
                )}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="fifa-btn-outline px-4 py-2 text-sm"
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total", value: summary.total, color: "text-gray-900" },
              { label: "Active", value: summary.active, color: "text-green-600" },
              { label: "Knocked Out", value: summary.knocked_out, color: "text-red-500" },
              { label: "Champions", value: summary.champion, color: "text-amber-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="fifa-card p-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input text-sm w-auto"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="knocked_out">Knocked out</option>
            <option value="champion">Champions</option>
          </select>
          <input
            type="text"
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            placeholder="Filter by JNV school"
            className="input text-sm w-auto min-w-[200px]"
          />
        </div>

        {!contest ? (
          <p className="text-center text-gray-500 py-12">No active contest.</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No entries yet.</p>
        ) : (
          <>
            <p className="text-center text-xs text-gray-500">
              Click a row to view that participant&apos;s Road to the Final picks
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-8 rounded bg-green-50 border border-green-200" />
                On track (all picks correct so far)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-8 rounded bg-red-50 border border-red-200" />
                Has a wrong pick
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-8 rounded bg-amber-50 border border-amber-200" />
                Champion
              </span>
            </div>
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">JNV School</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Last Round Survived</th>
                    <th className="px-4 py-3 text-right font-semibold">Pts</th>
                    <th className="px-4 py-3 text-right font-semibold w-20" />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const isMe =
                      savedParticipant?.email &&
                      entry.email?.toLowerCase() === savedParticipant.email.toLowerCase();
                    return (
                      <tr
                        key={entry._id}
                        onClick={() => setSelectedEntryId(entry._id)}
                        className={getRowClasses(entry.pickStatus, isMe)}
                      >
                        <td className="px-4 py-3 font-medium">
                          {entry.name}
                          {isMe && (
                            <span className="ml-2 text-xs text-amber-600">(you)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{entry.jnvSchool || "—"}</td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={entry.status}
                            knockedOutRound={entry.knockedOutRound}
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {entry.lastRoundSurvived
                            ? ROUND_LABELS[entry.lastRoundSurvived] || entry.lastRoundSurvived
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold">
                          {entry.bracketPoints > 0 ? entry.bracketPoints : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEntryId(entry._id);
                            }}
                            className="fifa-btn-outline px-3 py-1 text-xs"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <EntryBracketDialog
          open={!!selectedEntryId}
          entryId={selectedEntryId}
          onClose={() => setSelectedEntryId(null)}
        />

        <div className="text-center">
          <Link to="/fifa/bracket/play" className="fifa-btn-primary inline-block px-8 py-3">
            Enter Road to the Final
          </Link>
        </div>
      </div>
    </div>
  );
}
