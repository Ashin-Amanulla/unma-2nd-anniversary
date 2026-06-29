import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Trophy,
  Check,
  X,
  XCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import adminFifaApi from "../../api/adminFifaApi";
import { getWinnerChoices } from "../../utils/fifaStages";
import fifaApi from "../../api/fifaApi";
import { fifaKeys } from "../../hooks/useFifa";
import FifaLeaderboardPanel from "../../components/fifa/FifaLeaderboardPanel";
import {
  emptyScoreAnswer,
  isFifaAnswerProvided,
  normalizeFifaAnswerForSubmit,
  readNumberAnswer,
  readScoreAnswer,
} from "../../utils/fifaAnswers";

/* ---------- helpers ---------- */

function formatDate(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString();
}

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

function apiError(err) {
  return err?.response?.data?.message || err?.message || "Something went wrong";
}

function prepareMatchQuestionsForSave(questions) {
  const prepared = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const label = `Question ${i + 1}`;

    if (!q.text?.trim()) {
      return { ok: false, message: `${label}: enter question text` };
    }

    if (q.points === "" || q.points === null || q.points === undefined || Number.isNaN(Number(q.points))) {
      return { ok: false, message: `${label}: enter points` };
    }

    const item = {
      text: q.text.trim(),
      type: q.type,
      points: Number(q.points),
    };

    if (q._id) item._id = q._id;

    if (q.type === "choice") {
      const options = (q.options || []).map((opt) => opt.trim()).filter(Boolean);
      if (options.length < 2) {
        return { ok: false, message: `${label}: add at least 2 filled options for multiple choice` };
      }
      item.options = options;
    }

    prepared.push(item);
  }

  return { ok: true, questions: prepared };
}

const STAGES = [
  { value: "group", label: "Group" },
  { value: "r32", label: "Round of 32" },
  { value: "r16", label: "Round of 16" },
  { value: "qf", label: "Quarterfinal" },
  { value: "sf", label: "Semifinal" },
  { value: "final", label: "Final" },
];

const QUESTION_TYPES = [
  { value: "winner", label: "Winner (teamA / draw / teamB)" },
  { value: "score", label: "Exact score" },
  { value: "choice", label: "Multiple choice" },
  { value: "number", label: "Number" },
  { value: "text", label: "Free text" },
];

const SLOT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "closed", label: "Closed" },
];

const TABS = [
  { value: "slots", label: "Slots" },
  { value: "matches", label: "Matches & Questions" },
  { value: "grading", label: "Results & Grading" },
  { value: "leaderboard", label: "Leaderboard" },
  { value: "participants", label: "Participants" },
  { value: "campaign", label: "Campaign" },
];

function getLatestSlot(slots) {
  if (!slots?.length) return null;
  return [...slots].sort((a, b) => {
    const createdDiff =
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (createdDiff !== 0) return createdDiff;
    const orderDiff = (b.order ?? 0) - (a.order ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return (
      new Date(b.slotDate || 0).getTime() - new Date(a.slotDate || 0).getTime()
    );
  })[0];
}

function StatusBadge({ status }) {
  const styles = {
    draft: "bg-gray-100 text-gray-700 border border-gray-200",
    published: "bg-[var(--fifa-green)] text-white",
    closed: "bg-gray-200 text-gray-600",
    upcoming: "bg-blue-50 text-blue-700 border border-blue-200",
    active: "bg-[var(--fifa-green)]/10 text-[var(--fifa-green)] border border-[var(--fifa-green)]/30",
    completed: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}

function Modal({ open, onClose, title, description, children, maxWidth = "max-w-md" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ children }) {
  return <div className="flex justify-end gap-2 pt-4 border-t mt-4">{children}</div>;
}

function TabBar({ active, onChange }) {
  const tabBtn = (isActive) =>
    `flex-1 min-w-[120px] rounded-lg px-3 py-2.5 text-sm transition-all ${
      isActive
        ? "bg-white text-[var(--fifa-green)] font-semibold shadow-md border border-[var(--fifa-green)]/20"
        : "text-gray-500 font-medium hover:bg-white/60"
    }`;

  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-gray-50/80 p-1.5 shadow-sm">
      {TABS.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={tabBtn(active === t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function FieldLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
    </label>
  );
}

function LoadingRow({ colSpan, message = "Loading…" }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-gray-500">
        {message}
      </td>
    </tr>
  );
}

function EmptyRow({ colSpan, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-gray-500">
        {message}
      </td>
    </tr>
  );
}

/* ======================================================= */
/*  Root                                                     */
/* ======================================================= */
export default function FifaAdmin() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("slots");

  const { data: campaignData } = useQuery({
    queryKey: fifaKeys.campaign,
    queryFn: () => adminFifaApi.getCampaign(),
  });

  const campaign = campaignData?.campaign;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: fifaKeys.campaign });
    queryClient.invalidateQueries({ queryKey: fifaKeys.adminSlots });
    queryClient.invalidateQueries({ queryKey: fifaKeys.adminParticipants });
    queryClient.invalidateQueries({ queryKey: fifaKeys.adminGradingQueue });
    queryClient.invalidateQueries({ queryKey: fifaKeys.leaderboard });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-7 w-7 text-[var(--fifa-gold)]" />
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">FIFA Predictions</h1>
          <p className="text-sm text-gray-500">
            Manage the campaign, daily slots, matches &amp; questions, results, and participants.
          </p>
        </div>
      </div>

      {!campaign ? (
        <CampaignForm campaign={null} onSaved={invalidateAll} />
      ) : (
        <>
          <TabBar active={activeTab} onChange={setActiveTab} />

          <div className="pt-4">
            {activeTab === "slots" && <SlotsTab campaign={campaign} onChanged={invalidateAll} />}
            {activeTab === "matches" && <MatchesTab campaign={campaign} onChanged={invalidateAll} />}
            {activeTab === "grading" && <GradingTab onChanged={invalidateAll} />}
            {activeTab === "leaderboard" && <LeaderboardTab />}
            {activeTab === "participants" && <ParticipantsTab onChanged={invalidateAll} />}
            {activeTab === "campaign" && <CampaignForm campaign={campaign} onSaved={invalidateAll} />}
          </div>
        </>
      )}
    </div>
  );
}

/* ======================================================= */
/*  Campaign form                                           */
/* ======================================================= */
function CampaignForm({ campaign, onSaved }) {
  const [form, setForm] = useState({
    name: campaign?.name || "",
    description: campaign?.description || "",
    status: campaign?.status || "upcoming",
  });

  const mutation = useMutation({
    mutationFn: (payload) =>
      campaign
        ? adminFifaApi.updateCampaign(campaign._id, payload)
        : adminFifaApi.createCampaign(payload),
    onSuccess: () => {
      toast.success(campaign ? "Campaign updated" : "Campaign created");
      onSaved();
    },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(form);
      }}
      className="max-w-lg space-y-4"
    >
      <div>
        <FieldLabel htmlFor="cname">Campaign name</FieldLabel>
        <input
          id="cname"
          required
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <FieldLabel htmlFor="cdesc">Description</FieldLabel>
        <textarea
          id="cdesc"
          className="input"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="max-w-xs">
        <FieldLabel>Status</FieldLabel>
        <select
          className="input"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="upcoming">Upcoming</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <button type="submit" disabled={mutation.isPending} className="btn btn-primary">
        {campaign ? "Save changes" : "Create campaign"}
      </button>
    </form>
  );
}

/* ======================================================= */
/*  Slots tab                                               */
/* ======================================================= */
function SlotsTab({ campaign, onChanged }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const emptySlot = { title: "", slotDate: "", closesAt: "", status: "draft", order: 0 };
  const [form, setForm] = useState(emptySlot);

  const { data, isLoading } = useQuery({
    queryKey: fifaKeys.adminSlots,
    queryFn: () => adminFifaApi.getSlots(),
  });
  const slots = data?.slots ?? [];

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing
        ? adminFifaApi.updateSlot(editing._id, payload)
        : adminFifaApi.createSlot({ ...payload, campaign: campaign._id }),
    onSuccess: () => {
      toast.success(editing ? "Slot updated" : "Slot created");
      queryClient.invalidateQueries({ queryKey: fifaKeys.adminSlots });
      onChanged();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminFifaApi.deleteSlot(id),
    onSuccess: () => {
      toast.success("Slot deleted");
      queryClient.invalidateQueries({ queryKey: fifaKeys.adminSlots });
      onChanged();
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptySlot);
    setDialogOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      title: s.title,
      slotDate: toDatetimeLocalValue(s.slotDate),
      closesAt: toDatetimeLocalValue(s.closesAt),
      status: s.status,
      order: s.order ?? 0,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={openCreate} className="btn btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New slot
        </button>
      </div>

      <div className="rounded-lg border overflow-hidden bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Slot</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Closes</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Order</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <LoadingRow colSpan={5} />}
            {!isLoading && slots.length === 0 && (
              <EmptyRow colSpan={5} message="No slots yet. Create one to get started." />
            )}
            {!isLoading &&
              slots.map((slot) => (
                <tr key={slot._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{slot.title}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={slot.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(slot.closesAt)}</td>
                  <td className="px-4 py-3 tabular-nums">{slot.order ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => openEdit(slot)} className="btn btn-outline px-2 py-1">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline px-2 py-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          if (window.confirm("Delete this slot and all its matches?")) {
                            deleteMutation.mutate(slot._id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit slot" : "New daily slot"}
        description="A slot bundles the day's matches under one shared closing time."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate({
              ...form,
              slotDate: toIsoDate(form.slotDate),
              closesAt: toIsoDate(form.closesAt),
            });
          }}
          className="space-y-4"
        >
          <div>
            <FieldLabel>Title (e.g. &quot;Game 6&quot;)</FieldLabel>
            <input
              required
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Closes at</FieldLabel>
              <input
                type="datetime-local"
                required
                className="input"
                value={form.closesAt}
                onChange={(e) => setForm({ ...form, closesAt: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Order</FieldLabel>
              <input
                type="number"
                min="0"
                className="input"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <FieldLabel>Status</FieldLabel>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {SLOT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <ModalFooter>
            <button type="button" onClick={() => setDialogOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary">
              Save
            </button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}

/* ======================================================= */
/*  Matches & Questions tab                                 */
/* ======================================================= */
function MatchesTab({ campaign, onChanged }) {
  const queryClient = useQueryClient();
  const ALL_SLOTS = "all";
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultMatch, setResultMatch] = useState(null);

  const emptyMatch = { teamA: "", teamB: "", kickoffAt: "", stage: "group", order: 0, questions: [] };
  const [form, setForm] = useState(emptyMatch);

  const { data: slotsData } = useQuery({
    queryKey: fifaKeys.adminSlots,
    queryFn: () => adminFifaApi.getSlots(),
  });
  const slots = slotsData?.slots ?? [];
  const latestSlot = getLatestSlot(slots);
  const effectiveSlotId = selectedSlotId ?? latestSlot?._id ?? null;

  useEffect(() => {
    if (selectedSlotId !== null || !slots.length) return;
    const latestId = getLatestSlot(slots)?._id ?? null;
    if (latestId) setSelectedSlotId(latestId);
  }, [slots, selectedSlotId]);

  const { data: matchesData, isLoading } = useQuery({
    queryKey: fifaKeys.adminMatches(effectiveSlotId),
    queryFn: () =>
      adminFifaApi.getMatches(
        effectiveSlotId && effectiveSlotId !== ALL_SLOTS ? { slotId: effectiveSlotId } : {}
      ),
    enabled: !!effectiveSlotId,
  });
  const matches = matchesData?.matches ?? [];

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing
        ? adminFifaApi.updateMatch(editing._id, payload)
        : adminFifaApi.createMatch({ ...payload, campaign: campaign._id, slot: effectiveSlotId }),
    onSuccess: () => {
      toast.success(editing ? "Match updated" : "Match created");
      queryClient.invalidateQueries({ queryKey: fifaKeys.adminMatches(effectiveSlotId) });
      onChanged();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminFifaApi.deleteMatch(id),
    onSuccess: () => {
      toast.success("Match deleted");
      queryClient.invalidateQueries({ queryKey: fifaKeys.adminMatches(effectiveSlotId) });
      onChanged();
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const regradeMutation = useMutation({
    mutationFn: (id) => adminFifaApi.regradeMatch(id),
    onSuccess: (res) => {
      toast.success(`Re-graded — ${res?.needsReviewCount ?? 0} text answers need review`);
      queryClient.invalidateQueries({ queryKey: fifaKeys.adminGradingQueue });
      onChanged();
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const openCreate = () => {
    if (!effectiveSlotId || effectiveSlotId === ALL_SLOTS) {
      toast.error("Select a slot first");
      return;
    }
    setEditing(null);
    setForm(emptyMatch);
    setDialogOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({
      teamA: m.teamA,
      teamB: m.teamB,
      kickoffAt: toDatetimeLocalValue(m.kickoffAt),
      stage: m.stage || "group",
      order: m.order ?? 0,
      questions: m.questions || [],
    });
    setDialogOpen(true);
  };

  const openResult = (m) => {
    setResultMatch(m);
    setResultOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          className="input w-56"
          value={effectiveSlotId ?? ""}
          onChange={(e) => setSelectedSlotId(e.target.value)}
        >
          <option value={ALL_SLOTS}>All slots</option>
          {slots.map((s) => (
            <option key={s._id} value={s._id}>
              {s.title}
            </option>
          ))}
        </select>
        <button type="button" onClick={openCreate} className="btn btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add match
        </button>
      </div>

      <div className="rounded-lg border overflow-hidden bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Match</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Slot</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Kickoff</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Questions</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <LoadingRow colSpan={5} />}
            {!isLoading && matches.length === 0 && (
              <EmptyRow colSpan={5} message="No matches for this slot." />
            )}
            {!isLoading &&
              matches.map((m) => (
                <tr key={m._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {m.teamA} vs {m.teamB}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.slot?.title || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {m.kickoffAt ? formatDate(m.kickoffAt) : "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{m.questions?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <button type="button" onClick={() => openResult(m)} className="btn btn-primary px-2 py-1 text-xs">
                        Results
                      </button>
                      <button
                        type="button"
                        title="Re-run grading for this match"
                        disabled={regradeMutation.isPending}
                        onClick={() => regradeMutation.mutate(m._id)}
                        className="btn btn-outline px-2 py-1"
                      >
                        ↻
                      </button>
                      <button type="button" onClick={() => openEdit(m)} className="btn btn-outline px-2 py-1">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline px-2 py-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          if (window.confirm("Delete match?")) deleteMutation.mutate(m._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit match" : "Add match"}
        description="Set teams, optional kickoff time, and build the question list."
        maxWidth="max-w-2xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const prepared = prepareMatchQuestionsForSave(form.questions);
            if (!prepared.ok) {
              toast.error(prepared.message);
              return;
            }
            saveMutation.mutate({
              ...form,
              kickoffAt: toIsoDate(form.kickoffAt),
              questions: prepared.questions,
            });
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Team A</FieldLabel>
              <input
                required
                className="input"
                value={form.teamA}
                onChange={(e) => setForm({ ...form, teamA: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Team B</FieldLabel>
              <input
                required
                className="input"
                value={form.teamB}
                onChange={(e) => setForm({ ...form, teamB: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FieldLabel>Kickoff (optional)</FieldLabel>
              <input
                type="datetime-local"
                className="input"
                value={form.kickoffAt}
                onChange={(e) => setForm({ ...form, kickoffAt: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Stage</FieldLabel>
              <select
                className="input"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Order</FieldLabel>
              <input
                type="number"
                min="0"
                className="input"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FieldLabel>Questions</FieldLabel>
              <button
                type="button"
                className="btn btn-outline text-xs px-2 py-1"
                onClick={() =>
                  setForm({
                    ...form,
                    questions: [...form.questions, { text: "", type: "choice", points: 5, options: ["", ""] }],
                  })
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add question
              </button>
            </div>

            {form.questions.map((q, qi) => (
              <QuestionBuilder
                key={qi}
                q={q}
                index={qi}
                stage={form.stage || "group"}
                teamA={form.teamA}
                teamB={form.teamB}
                onChange={(updated) => {
                  const qs = [...form.questions];
                  qs[qi] = updated;
                  setForm({ ...form, questions: qs });
                }}
                onRemove={() => {
                  const qs = form.questions.filter((_, i) => i !== qi);
                  setForm({ ...form, questions: qs });
                }}
              />
            ))}
            {form.questions.length === 0 && (
              <p className="text-sm text-gray-500">No questions yet. Add at least one.</p>
            )}
          </div>

          <ModalFooter>
            <button type="button" onClick={() => setDialogOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending || form.questions.length === 0}
              className="btn btn-primary"
            >
              Save match
            </button>
          </ModalFooter>
        </form>
      </Modal>

      {resultMatch && (
        <ResultDialog
          match={resultMatch}
          open={resultOpen}
          onClose={() => setResultOpen(false)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: fifaKeys.adminMatches(effectiveSlotId) });
            queryClient.invalidateQueries({ queryKey: fifaKeys.adminGradingQueue });
            onChanged();
          }}
        />
      )}
    </div>
  );
}

function QuestionBuilder({ q, index, stage, teamA, teamB, onChange, onRemove }) {
  return (
    <div className="rounded-xl border border-[var(--fifa-green)]/15 p-4 space-y-3 bg-[var(--fifa-green)]/5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--fifa-green)] uppercase tracking-wide">
          Q{index + 1}
        </span>
        <button type="button" onClick={onRemove} className="p-1 hover:bg-red-50 rounded text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div>
        <FieldLabel>Question text</FieldLabel>
        <input
          className="input"
          placeholder='e.g. "Which half will Mbappé score in?"'
          value={q.text}
          onChange={(e) => onChange({ ...q, text: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Type</FieldLabel>
          <select
            className="input"
            value={q.type}
            onChange={(e) => {
              const v = e.target.value;
              onChange({
                ...q,
                type: v,
                options: v === "choice" ? (q.options?.length >= 2 ? q.options : ["", ""]) : undefined,
              });
            }}
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Points</FieldLabel>
          <input
            type="number"
            min="0"
            className="input"
            value={Number.isFinite(q.points) || q.points === 0 ? q.points : q.points ?? ""}
            onChange={(e) => {
              const next = e.target.value;
              if (next === "") {
                onChange({ ...q, points: "" });
                return;
              }
              const parsed = Number(next);
              if (!Number.isNaN(parsed)) onChange({ ...q, points: parsed });
            }}
          />
        </div>
      </div>

      {q.type === "choice" && (
        <div className="space-y-2">
          <FieldLabel>Options</FieldLabel>
          {(q.options || []).map((opt, oi) => (
            <div key={oi} className="flex gap-2">
              <input
                className="input"
                placeholder={`Option ${oi + 1}`}
                required
                value={opt}
                onChange={(e) => {
                  const opts = [...(q.options || [])];
                  opts[oi] = e.target.value;
                  onChange({ ...q, options: opts });
                }}
              />
              {(q.options || []).length > 2 && (
                <button
                  type="button"
                  className="p-2 hover:bg-red-50 rounded text-red-600"
                  onClick={() => {
                    const opts = (q.options || []).filter((_, i) => i !== oi);
                    onChange({ ...q, options: opts });
                  }}
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline text-xs px-2 py-1"
            onClick={() => onChange({ ...q, options: [...(q.options || []), ""] })}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add option
          </button>
        </div>
      )}
    </div>
  );
}

function ResultDialog({ match, open, onClose, onSaved }) {
  const init = () => {
    const m = {};
    for (const q of match.questions) {
      if (q.correctAnswer !== null && q.correctAnswer !== undefined && q.correctAnswer !== "") {
        if (q.type === "score") m[q._id] = readScoreAnswer(q.correctAnswer);
        else if (q.type === "number") m[q._id] = readNumberAnswer(q.correctAnswer);
        else m[q._id] = q.correctAnswer;
      } else if (q.type === "score") {
        m[q._id] = emptyScoreAnswer();
      } else {
        m[q._id] = "";
      }
    }
    return m;
  };

  const [answers, setAnswers] = useState(init);

  useEffect(() => {
    if (open) setAnswers(init());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, match._id]);

  const mutation = useMutation({
    mutationFn: (payload) => adminFifaApi.enterResult(match._id, payload),
    onSuccess: (res) => {
      toast.success(
        `Results saved — ${res?.scoredCount ?? 0} predictions graded (${res?.needsReviewCount ?? 0} need review)`
      );
      onSaved();
      onClose();
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const missing = match.questions.filter((q) => !isFifaAnswerProvided(q.type, answers[q._id]));
    if (missing.length > 0) {
      toast.error(`Enter an answer for all ${missing.length} question${missing.length > 1 ? "s" : ""}.`);
      return;
    }

    const questions = match.questions.map((q) => ({
      questionId: q._id,
      correctAnswer: normalizeFifaAnswerForSubmit(q.type, answers[q._id]),
    }));
    mutation.mutate({ questions });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Enter results — ${match.teamA} vs ${match.teamB}`}
      description="Set the correct answer for each question to trigger auto-grading."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {match.questions.map((q) => (
          <CorrectAnswerField
            key={q._id}
            question={q}
            stage={match.stage || "group"}
            teamA={match.teamA}
            teamB={match.teamB}
            value={answers[q._id]}
            onChange={(val) => setAnswers((prev) => ({ ...prev, [q._id]: val }))}
          />
        ))}
        <ModalFooter>
          <button type="button" onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={mutation.isPending} className="btn btn-primary">
            Save &amp; grade
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

function CorrectAnswerField({ question, stage, teamA, teamB, value, onChange }) {
  const { type, text, points, options } = question;

  const pillClass = (active) =>
    `rounded-xl border px-3 py-1.5 text-sm cursor-pointer transition-colors ${
      active
        ? "border-[var(--fifa-green)] bg-[var(--fifa-green)] text-white"
        : "border-gray-200 hover:bg-gray-50"
    }`;

  let input = null;

  if (type === "winner") {
    const choices = getWinnerChoices(stage, teamA || "Team A", teamB || "Team B").map((c) => ({
      v: c.value,
      l: c.label,
    }));
    input = (
      <div className="flex flex-wrap gap-2">
        {choices.map((c) => (
          <button key={c.v} type="button" className={pillClass(value === c.v)} onClick={() => onChange(c.v)}>
            {c.l}
          </button>
        ))}
      </div>
    );
  } else if (type === "score") {
    const v = readScoreAnswer(value);
    input = (
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          className="input w-16"
          placeholder={teamA?.slice(0, 3)}
          value={v.a}
          onChange={(e) => onChange({ ...v, a: e.target.value })}
        />
        <span>–</span>
        <input
          type="number"
          min="0"
          className="input w-16"
          placeholder={teamB?.slice(0, 3)}
          value={v.b}
          onChange={(e) => onChange({ ...v, b: e.target.value })}
        />
      </div>
    );
  } else if (type === "choice") {
    input = (
      <div className="flex flex-wrap gap-2">
        {(options || []).map((opt) => (
          <button key={opt} type="button" className={pillClass(value === opt)} onClick={() => onChange(opt)}>
            {opt}
          </button>
        ))}
      </div>
    );
  } else if (type === "number") {
    input = (
      <input
        type="number"
        min="0"
        className="input w-28"
        placeholder="0"
        value={readNumberAnswer(value)}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  } else {
    input = (
      <input
        className="input max-w-xs"
        placeholder="Canonical answer…"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{text}</span>
        <span className="text-xs text-gray-500">{points} pts</span>
      </div>
      {input}
    </div>
  );
}

/* ======================================================= */
/*  Leaderboard tab                                         */
/* ======================================================= */
function LeaderboardTab() {
  const { data, isLoading } = useQuery({
    queryKey: fifaKeys.leaderboard,
    queryFn: () => fifaApi.getLeaderboard(),
  });

  return (
    <FifaLeaderboardPanel
      isLoading={isLoading}
      leaderboard={data?.leaderboard ?? []}
      schools={data?.schools ?? []}
      slots={data?.slots ?? []}
    />
  );
}

/* ======================================================= */
/*  Grading tab                                             */
/* ======================================================= */
function fmtAnswer(value, type, teamA, teamB) {
  if (value === null || value === undefined || value === "") return "—";
  if (type === "winner") {
    if (value === "teamA") return teamA;
    if (value === "teamB") return teamB;
    return "Draw";
  }
  if (type === "score" && typeof value === "object") return `${value.a ?? "?"}–${value.b ?? "?"}`;
  return String(value);
}

function GradingTab({ onChanged }) {
  const queryClient = useQueryClient();
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  const { data: slotsData } = useQuery({
    queryKey: fifaKeys.adminSlots,
    queryFn: () => adminFifaApi.getSlots(),
  });
  const slots = slotsData?.slots ?? [];
  const latestSlot = getLatestSlot(slots);
  const effectiveSlotId = selectedSlotId ?? latestSlot?._id ?? null;

  useEffect(() => {
    if (selectedSlotId !== null || !slots.length) return;
    const latestId = getLatestSlot(slots)?._id ?? null;
    if (latestId) setSelectedSlotId(latestId);
  }, [slots, selectedSlotId]);

  const { data: gradingData, isLoading } = useQuery({
    queryKey: fifaKeys.adminSlotGrading(effectiveSlotId),
    queryFn: () => adminFifaApi.getSlotGrading(effectiveSlotId),
    enabled: !!effectiveSlotId,
  });
  const matches = gradingData?.matches ?? [];

  const gradeMutation = useMutation({
    mutationFn: ({ predictionId, answerId, award }) =>
      adminFifaApi.gradeAnswer(predictionId, answerId, { award }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fifaKeys.adminSlotGrading(effectiveSlotId) });
      queryClient.invalidateQueries({ queryKey: fifaKeys.adminGradingQueue });
      onChanged();
    },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          className="input w-48"
          value={effectiveSlotId ?? ""}
          onChange={(e) => setSelectedSlotId(e.target.value)}
        >
          {slots.map((s) => (
            <option key={s._id} value={s._id}>
              {s.title}
            </option>
          ))}
        </select>
        {!isLoading && matches.length > 0 && (
          <span className="text-sm text-gray-500">
            {matches.reduce((s, m) => s + m.predictions.length, 0)} predictions across {matches.length} match
            {matches.length !== 1 ? "es" : ""}
          </span>
        )}
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
      {!isLoading && !effectiveSlotId && (
        <p className="text-sm text-gray-500">Select a slot to view predictions.</p>
      )}
      {!isLoading && effectiveSlotId && matches.length === 0 && (
        <p className="text-sm text-gray-500">No predictions yet.</p>
      )}

      {!isLoading && matches.length > 0 && (
        <div className="rounded-lg border divide-y overflow-hidden bg-white">
          {matches.map((match) => (
            <GradingMatchTable key={match._id} match={match} gradeMutation={gradeMutation} />
          ))}
        </div>
      )}
    </div>
  );
}

function GradingMatchTable({ match, gradeMutation }) {
  const { teamA, teamB, questions, predictions } = match;
  const [open, setOpen] = useState(false);
  const [pendingOnly, setPendingOnly] = useState(false);

  const rows = [...predictions].sort((a, b) => a.participant.name.localeCompare(b.participant.name));

  const totalUngraded = predictions.reduce(
    (s, p) =>
      s +
      p.answers.filter(
        (a) =>
          !a.graded &&
          !a.gradedManually &&
          questions.find((q) => String(q._id) === a.questionId)?.resultEntered
      ).length,
    0
  );

  const displayed = pendingOnly
    ? rows.filter((p) => p.answers.some((a) => !a.graded && !a.gradedManually))
    : rows;

  if (predictions.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left hover:bg-gray-50"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
        )}
        <span className="font-semibold">
          {teamA} vs {teamB}
        </span>
        {match.kickoffAt && (
          <span className="text-xs text-gray-500 font-normal">{formatDate(match.kickoffAt)}</span>
        )}
        <span className="text-xs text-gray-500 font-normal">{predictions.length} players</span>
        {totalUngraded > 0 && (
          <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            {totalUngraded} ungraded
          </span>
        )}
        {totalUngraded === 0 && predictions.length > 0 && (
          <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            ✓ graded
          </span>
        )}
        {totalUngraded > 0 && (
          <span
            role="button"
            tabIndex={0}
            className="ml-auto text-xs text-gray-500 underline hover:text-gray-900"
            onClick={(e) => {
              e.stopPropagation();
              setPendingOnly((v) => !v);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                setPendingOnly((v) => !v);
              }
            }}
          >
            {pendingOnly ? "show all" : "ungraded only"}
          </span>
        )}
      </button>

      {open && (
        <div className="border-t overflow-auto max-h-[min(70vh,520px)]">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead className="sticky top-0 z-10 border-b bg-gray-50">
              <tr>
                <th className="sticky left-0 z-20 h-10 w-36 min-w-[9rem] bg-gray-50 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Player
                </th>
                {questions.map((q) => (
                  <th
                    key={q._id}
                    className="h-10 min-w-[110px] px-2 text-center align-middle text-xs font-semibold text-gray-500"
                  >
                    <div className="mx-auto max-w-[120px] truncate font-medium normal-case" title={q.text}>
                      {q.text}
                    </div>
                    <div className="mt-0.5 flex items-center justify-center gap-1 font-normal normal-case text-gray-400">
                      <span>{q.points} pts</span>
                      {q.resultEntered && (
                        <span className="inline-flex h-4 px-1 text-[10px] font-mono border rounded bg-white">
                          {fmtAnswer(q.correctAnswer, q.type, teamA, teamB)}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="h-10 w-16 min-w-[4rem] px-2 text-right align-middle text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((pred) => {
                const ansMap = new Map(pred.answers.map((a) => [a.questionId, a]));
                return (
                  <tr key={pred.predictionId} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="sticky left-0 z-10 w-36 min-w-[9rem] bg-white px-3 py-2 align-middle">
                      <div className="text-left text-sm font-medium leading-tight">{pred.participant.name}</div>
                      <div className="text-left text-xs text-gray-500">
                        {pred.participant.jnvSchool ?? "—"}
                      </div>
                    </td>

                    {questions.map((q) => {
                      const ans = ansMap.get(String(q._id));
                      if (!ans) {
                        return (
                          <td key={q._id} className="px-2 py-2 text-center align-middle text-xs text-gray-400">
                            —
                          </td>
                        );
                      }

                      const isGraded = ans.graded || ans.gradedManually;
                      const correct = isGraded && ans.pointsAwarded > 0;
                      const pending = !isGraded && q.resultEntered;
                      const display = fmtAnswer(ans.value, q.type, teamA, teamB);

                      return (
                        <td key={q._id} className="px-2 py-2 text-center align-middle">
                          <div
                            className={`text-sm font-medium tabular-nums ${
                              correct ? "text-green-700" : isGraded ? "text-gray-400" : ""
                            }`}
                          >
                            {display}
                          </div>
                          <div className="mt-1 flex items-center justify-center gap-1">
                            {isGraded ? (
                              <>
                                <span
                                  className={`inline-flex h-4 px-1.5 text-[10px] rounded ${
                                    correct ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {ans.pointsAwarded}/{q.points}
                                  {ans.gradedManually && " ✎"}
                                </span>
                                <button
                                  type="button"
                                  title={correct ? "Revoke points" : "Award points"}
                                  disabled={gradeMutation.isPending}
                                  onClick={() =>
                                    gradeMutation.mutate({
                                      predictionId: pred.predictionId,
                                      answerId: ans.answerId,
                                      award: !correct,
                                    })
                                  }
                                  className="p-0.5 hover:bg-gray-100 rounded"
                                >
                                  {correct ? (
                                    <X className="h-2.5 w-2.5 text-gray-400" />
                                  ) : (
                                    <Check className="h-2.5 w-2.5 text-gray-400" />
                                  )}
                                </button>
                              </>
                            ) : pending ? (
                              <>
                                <button
                                  type="button"
                                  title={`Award ${q.points} pts`}
                                  disabled={gradeMutation.isPending}
                                  onClick={() =>
                                    gradeMutation.mutate({
                                      predictionId: pred.predictionId,
                                      answerId: ans.answerId,
                                      award: true,
                                    })
                                  }
                                  className="h-5 w-5 inline-flex items-center justify-center border border-green-300 text-green-700 rounded hover:bg-green-50"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  title="Award 0 pts"
                                  disabled={gradeMutation.isPending}
                                  onClick={() =>
                                    gradeMutation.mutate({
                                      predictionId: pred.predictionId,
                                      answerId: ans.answerId,
                                      award: false,
                                    })
                                  }
                                  className="h-5 w-5 inline-flex items-center justify-center border border-red-200 text-red-600 rounded hover:bg-red-50"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-gray-400">no result</span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    <td className="px-2 py-2 text-right align-middle tabular-nums">
                      <span className="text-sm font-semibold">{pred.totalPoints}</span>
                      <span className="ml-0.5 text-xs text-gray-400">pts</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {displayed.length === 0 && (
            <p className="px-4 py-3 text-sm italic text-gray-500">All answers graded.</p>
          )}
        </div>
      )}
    </div>
  );
}

function EditPointsDialog({ participant, open, onClose, onSaved }) {
  const queryClient = useQueryClient();
  const [startingPoints, setStartingPoints] = useState("0");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open && participant) {
      setStartingPoints(String(participant.startingPoints ?? 0));
      setReason("");
    }
  }, [open, participant]);

  const mutation = useMutation({
    mutationFn: (payload) => adminFifaApi.updateParticipantPoints(participant._id, payload),
    onSuccess: () => {
      toast.success("Starting points updated");
      queryClient.invalidateQueries({ queryKey: fifaKeys.adminParticipants });
      queryClient.invalidateQueries({ queryKey: fifaKeys.leaderboard });
      onSaved?.();
      onClose();
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = Number(startingPoints);
    if (Number.isNaN(parsed) || parsed < 0) {
      toast.error("Enter a valid non-negative number");
      return;
    }
    mutation.mutate({ startingPoints: parsed, reason });
  };

  if (!participant) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit starting points"
      description={`Credit offline points for ${participant.name}. Changes are logged for auditing.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm">
          <div className="font-medium">{participant.name}</div>
          <div className="text-xs text-gray-500">
            {participant.jnvSchool ?? "—"} · {participant.email}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Earned from predictions: {participant.earnedPoints ?? 0} pts
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="startingPoints">Starting points</FieldLabel>
          <input
            id="startingPoints"
            type="number"
            min={0}
            step={1}
            className="input"
            value={startingPoints}
            onChange={(e) => setStartingPoints(e.target.value)}
            required
          />
        </div>
        <div>
          <FieldLabel htmlFor="pointsReason">Reason (optional)</FieldLabel>
          <textarea
            id="pointsReason"
            className="input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Offline round 1 scores before going online"
            rows={2}
          />
        </div>
        <ModalFooter>
          <button type="button" onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={mutation.isPending} className="btn btn-primary">
            Save points
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

/* ======================================================= */
/*  Participants tab                                         */
/* ======================================================= */
function ParticipantsTab({ onChanged }) {
  const queryClient = useQueryClient();
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: fifaKeys.adminParticipants,
    queryFn: () => adminFifaApi.getParticipants(),
  });
  const participants = data?.participants ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id) => adminFifaApi.deleteParticipant(id),
    onSuccess: () => {
      toast.success("Participant removed");
      queryClient.invalidateQueries({ queryKey: fifaKeys.adminParticipants });
      queryClient.invalidateQueries({ queryKey: fifaKeys.leaderboard });
      onChanged();
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) => {
      const parts = [p.name, p.email, p.jnvSchool].filter(Boolean);
      return parts.some((part) => String(part).toLowerCase().includes(q));
    });
  }, [participants, search]);

  return (
    <>
      <div className="mb-4">
        <input
          type="search"
          className="input max-w-sm"
          placeholder="Search participants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border overflow-hidden bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Participant</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">JNV School</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">✓</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Start</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Earned</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Total</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <LoadingRow colSpan={7} />}
            {!isLoading && filtered.length === 0 && (
              <EmptyRow
                colSpan={7}
                message={search ? "No participants match your search." : "No participants yet."}
              />
            )}
            {!isLoading &&
              filtered.map((p) => (
                <tr key={p._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{p.name}</div>
                      <div className="truncate text-[10px] text-gray-500">{p.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-600">{p.jnvSchool ?? "—"}</td>
                  <td className="px-4 py-2 text-center">
                    {p.verified ? (
                      <span className="text-[var(--fifa-green)] font-semibold">✓</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{p.startingPoints ?? 0}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{p.earnedPoints ?? 0}</td>
                  <td className="px-4 py-2 text-right font-semibold tabular-nums">{p.totalPoints ?? 0}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        title="Edit starting points"
                        onClick={() => setEditingParticipant(p)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Remove participant"
                        className="p-1 hover:bg-red-50 rounded text-red-600"
                        onClick={() => {
                          if (window.confirm("Remove participant and their predictions?")) {
                            deleteMutation.mutate(p._id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <EditPointsDialog
        participant={editingParticipant}
        open={Boolean(editingParticipant)}
        onClose={() => setEditingParticipant(null)}
        onSaved={onChanged}
      />
    </>
  );
}
