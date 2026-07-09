import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import adminFifaBracketApi from "../../api/adminFifaBracketApi";
import { fifaBracketKeys } from "../../hooks/useFifaBracket";
import { fifaKeys } from "../../hooks/useFifa";
import { KnockoutBracket } from "../../components/fifa-bracket/KnockoutBracket";
import { EntryBracketDialog } from "../../components/fifa-bracket/EntryBracketDialog";
import FifaBracketBoard from "../fifa-bracket/FifaBracketBoard";
import { FIFA_TEAMS } from "../../utils/fifaTeams";
import { ROUND_LABELS, ROUND_ORDER } from "../../utils/fifaBracketTree";

const QF_KEYS = ["qf-l1", "qf-l2", "qf-r1", "qf-r2"];

function toDatetimeLocalValue(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

function toIsoDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function TeamSelect({ value, onChange, label }) {
  const uniqueTeams = FIFA_TEAMS.filter(
    (t, i, arr) => arr.findIndex((x) => x.name === t.name) === i
  );

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
      >
        <option value="">Select team</option>
        {uniqueTeams.map((t) => (
          <option key={t.name} value={t.name}>
            {t.flag} {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function BracketSubTabs({ active, onChange, contest }) {
  const tabs = [
    { value: "contest", label: "Contest" },
    { value: "qf", label: "QF Setup", disabled: !contest },
    { value: "results", label: "Results", disabled: !contest },
    { value: "entries", label: `Entries (${contest?.entryCount || 0})`, disabled: !contest },
    { value: "board", label: "Board", disabled: !contest },
  ];

  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          disabled={t.disabled}
          onClick={() => onChange(t.value)}
          className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
            active === t.value
              ? "bg-white font-semibold text-[var(--fifa-green)] shadow-sm"
              : "text-gray-500 hover:bg-white/60 disabled:opacity-40"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function FifaBracketAdminTab() {
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState("contest");
  const [contestForm, setContestForm] = useState(null);
  const [qfForm, setQfForm] = useState({});
  const [adminScores, setAdminScores] = useState({});
  const [selectedEntry, setSelectedEntry] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: fifaBracketKeys.adminContest,
    queryFn: () => adminFifaBracketApi.getContest(),
  });

  const contest = data?.contest;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: fifaBracketKeys.adminContest });
    queryClient.invalidateQueries({ queryKey: fifaBracketKeys.contest });
    queryClient.invalidateQueries({ queryKey: ["fifa-bracket", "board"] });
    queryClient.invalidateQueries({ queryKey: fifaBracketKeys.adminEntries });
    queryClient.invalidateQueries({ queryKey: fifaKeys.leaderboard });
  };

  const createMutation = useMutation({
    mutationFn: (payload) => adminFifaBracketApi.createContest(payload),
    onSuccess: () => {
      toast.success("Road to the Final contest created");
      invalidate();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => adminFifaBracketApi.updateContest(contest._id, payload),
    onSuccess: () => {
      toast.success("Contest updated");
      invalidate();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to update"),
  });

  const qfMutation = useMutation({
    mutationFn: (payload) => adminFifaBracketApi.setupQF(payload),
    onSuccess: () => {
      toast.success("QF matchups saved");
      invalidate();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to save QF"),
  });

  const resultMutation = useMutation({
    mutationFn: ({ matchId, winner, scoreA, scoreB }) =>
      adminFifaBracketApi.enterResult(matchId, { winner, scoreA, scoreB }),
    onSuccess: () => {
      toast.success("Result saved");
      invalidate();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to save result"),
  });

  const publishMutation = useMutation({
    mutationFn: (stage) =>
      adminFifaBracketApi.publishRound({ contestId: contest._id, stage }),
    onSuccess: (res) => {
      const g = res?.gradeResult;
      const pts = res?.pointsResult;
      toast.success(
        `Round published. ${g?.knockedOut || 0} knocked out, ${g?.champions || 0} champions.${
          pts ? ` ${pts.awarded} awarded 100 pts.` : ""
        }`
      );
      invalidate();
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to publish"),
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (id) => adminFifaBracketApi.deleteEntry(id),
    onSuccess: () => {
      toast.success("Entry deleted");
      invalidate();
    },
  });

  const { data: entriesData } = useQuery({
    queryKey: fifaBracketKeys.adminEntries,
    queryFn: () => adminFifaBracketApi.getEntries(),
    enabled: !!contest,
  });

  const entries = entriesData?.entries || [];

  const initContestForm = () => {
    if (contest) {
      setContestForm({
        name: contest.name,
        description: contest.description || "",
        status: contest.status,
        entryClosesAt: toDatetimeLocalValue(contest.entryClosesAt),
        isPublished: contest.isPublished,
      });
    } else {
      setContestForm({
        name: "Road to the Final 2026",
        description:
          "Predict winners and scores from the Quarter-finals to the Final. Survive each round — score accuracy breaks ties.",
        status: "active",
        entryClosesAt: toDatetimeLocalValue(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        ),
        isPublished: true,
      });
    }
  };

  const initQfForm = () => {
    const form = {};
    for (const key of QF_KEYS) {
      const match = contest?.matches?.find((m) => m.bracketKey === key);
      form[key] = { teamA: match?.teamA || "", teamB: match?.teamB || "" };
    }
    setQfForm(form);
  };

  const handleSaveContest = () => {
    if (!contestForm) return;
    const payload = {
      ...contestForm,
      entryClosesAt: toIsoDate(contestForm.entryClosesAt),
    };
    if (contest) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleSaveQF = () => {
    const matches = QF_KEYS.map((key) => ({
      bracketKey: key,
      teamA: qfForm[key]?.teamA,
      teamB: qfForm[key]?.teamB,
    }));
    qfMutation.mutate({ contestId: contest._id, matches });
  };

  const handleAdminResultPick = (matchKey, team) => {
    const match = contest.matches.find((m) => m.bracketKey === matchKey);
    if (!match) return;
    const score = adminScores[matchKey];
    resultMutation.mutate({
      matchId: match._id,
      winner: team,
      scoreA: score?.a !== "" && score?.a !== undefined ? score.a : undefined,
      scoreB: score?.b !== "" && score?.b !== undefined ? score.b : undefined,
    });
  };

  const adminPredictions = {};
  for (const m of contest?.matches || []) {
    if (m.winner) adminPredictions[m.bracketKey] = m.winner;
  }

  useEffect(() => {
    if (!contest?.matches?.length) return;
    const next = {};
    for (const m of contest.matches) {
      next[m.bracketKey] = { a: m.scoreA ?? "", b: m.scoreB ?? "" };
    }
    setAdminScores(next);
  }, [
    contest?._id,
    contest?.matches?.map((m) => `${m.bracketKey}:${m.scoreA}:${m.scoreB}:${m.winner}`).join("|"),
  ]);

  const stageComplete = (stage) => {
    const stageMatches = contest?.matches?.filter((m) => m.stage === stage) || [];
    return stageMatches.length > 0 && stageMatches.every((m) => m.winner);
  };

  const canPublish = (stage) => {
    if (!contest) return false;
    const idx = ROUND_ORDER.indexOf(stage);
    if (idx === 0) return !contest.publishedRound && stageComplete(stage);
    const prev = ROUND_ORDER[idx - 1];
    return contest.publishedRound === prev && stageComplete(stage);
  };

  if (isLoading) {
    return <p className="text-sm text-gray-500 py-8 text-center">Loading Road to the Final admin…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Road to the Final</h2>
        <p className="text-sm text-gray-500">
          7 knockout matches (QF → Final) · score accuracy tiebreaker · 100 pts for a perfect run
        </p>
      </div>

      <BracketSubTabs active={subTab} onChange={setSubTab} contest={contest} />

      {subTab === "contest" && (
        <div className="max-w-lg space-y-4">
          {!contestForm ? (
            <button type="button" onClick={initContestForm} className="fifa-btn-primary px-4 py-2 text-sm">
              {contest ? "Edit Contest Settings" : "Create Road to the Final Contest"}
            </button>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  className="input w-full"
                  value={contestForm.name}
                  onChange={(e) => setContestForm({ ...contestForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="input w-full min-h-[80px]"
                  value={contestForm.description}
                  onChange={(e) => setContestForm({ ...contestForm, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="input w-full"
                  value={contestForm.status}
                  onChange={(e) => setContestForm({ ...contestForm, status: e.target.value })}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry closes at</label>
                <input
                  type="datetime-local"
                  className="input w-full"
                  value={contestForm.entryClosesAt}
                  onChange={(e) => setContestForm({ ...contestForm, entryClosesAt: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={contestForm.isPublished}
                  onChange={(e) => setContestForm({ ...contestForm, isPublished: e.target.checked })}
                />
                Published (visible to participants)
              </label>
              <button
                type="button"
                onClick={handleSaveContest}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="fifa-btn-primary px-4 py-2 text-sm"
              >
                {contest ? "Save Changes" : "Create Contest"}
              </button>
            </>
          )}
        </div>
      )}

      {subTab === "qf" && (
        <div className="space-y-6">
          {!Object.keys(qfForm).length ? (
            <button type="button" onClick={initQfForm} className="fifa-btn-primary px-4 py-2 text-sm">
              Load QF Matchups
            </button>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {QF_KEYS.map((key) => (
                  <div key={key} className="rounded-lg border border-gray-200 p-4 space-y-3 bg-white">
                    <p className="font-semibold text-sm uppercase text-gray-700">{key}</p>
                    <TeamSelect
                      label="Team A"
                      value={qfForm[key]?.teamA || ""}
                      onChange={(v) =>
                        setQfForm({ ...qfForm, [key]: { ...qfForm[key], teamA: v } })
                      }
                    />
                    <TeamSelect
                      label="Team B"
                      value={qfForm[key]?.teamB || ""}
                      onChange={(v) =>
                        setQfForm({ ...qfForm, [key]: { ...qfForm[key], teamB: v } })
                      }
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSaveQF}
                disabled={qfMutation.isPending || !!contest?.publishedRound}
                className="fifa-btn-primary px-4 py-2 text-sm disabled:opacity-50"
              >
                Save QF Matchups
              </button>
              {contest?.publishedRound && (
                <p className="text-sm text-amber-600">QF is locked after results are published.</p>
              )}
            </>
          )}
        </div>
      )}

      {subTab === "results" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {ROUND_ORDER.map((stage) => (
              <button
                key={stage}
                type="button"
                disabled={!canPublish(stage) || publishMutation.isPending}
                onClick={() => {
                  if (
                    window.confirm(
                      `Publish ${ROUND_LABELS[stage]} results and run elimination?${
                        stage === "final" ? " This awards 100 pts for perfect runs." : ""
                      }`
                    )
                  ) {
                    publishMutation.mutate(stage);
                  }
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  canPublish(stage)
                    ? "bg-[var(--fifa-green)] text-white hover:opacity-90"
                    : "border border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Publish {ROUND_LABELS[stage]}
                {contest?.publishedRound === stage && " ✓"}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Enter scores beside each flag, then click the winning team to save. Publish each round
            when all matches in that stage have results.
          </p>
          {contest && (
            <KnockoutBracket
              matches={contest.matches}
              predictions={adminPredictions}
              onPredictionsChange={handleAdminResultPick}
              scores={adminScores}
              onScoresChange={setAdminScores}
              mode="admin"
            />
          )}
        </div>
      )}

      {subTab === "entries" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Click a row to view Road to the Final picks.</p>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">School</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Score pts</th>
                  <th className="px-4 py-3 text-right font-semibold">Pts</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No entries yet.
                    </td>
                  </tr>
                )}
                {entries.map((entry) => (
                  <tr
                    key={entry._id}
                    onClick={() => setSelectedEntry(entry)}
                    className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium">{entry.name}</td>
                    <td className="px-4 py-3 text-gray-600">{entry.jnvSchool}</td>
                    <td className="px-4 py-3 text-gray-600">{entry.email}</td>
                    <td className="px-4 py-3">{entry.status}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {entry.scoreAccuracyPoints || "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{entry.bracketPoints || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Delete this entry?")) {
                            deleteEntryMutation.mutate(entry._id);
                          }
                        }}
                        className="text-red-600 text-xs hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <EntryBracketDialog
            open={!!selectedEntry}
            entry={selectedEntry}
            matches={contest?.matches || []}
            onClose={() => setSelectedEntry(null)}
          />
        </div>
      )}

      {subTab === "board" && (
        <div className="-mx-6">
          <FifaBracketBoard />
        </div>
      )}
    </div>
  );
}
