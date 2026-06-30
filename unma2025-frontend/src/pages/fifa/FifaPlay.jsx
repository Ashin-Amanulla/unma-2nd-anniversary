import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Clock, Trophy, ChevronRight, Users, ChevronDown, Pencil } from "lucide-react";
import fifaApi from "../../api/fifaApi";
import { useFifaCampaign, fifaKeys } from "../../hooks/useFifa";
import { JNV_SCHOOLS } from "../../constants/jnvSchools";
import FifaSlotCountdown from "../../components/fifa/FifaSlotCountdown";
import QuestionField from "../../components/fifa/QuestionField";
import FifaOrganizerCredit from "../../components/fifa/FifaOrganizerCredit";
import { teamFlag, teamDisplayLabels } from "../../utils/fifaTeams";
import {
  defaultScoreAnswer,
  isFifaAnswerProvided,
  normalizeFifaAnswerForSubmit,
  readNumberAnswer,
  readScoreAnswer,
  answerKey,
} from "../../utils/fifaAnswers";
import { getActiveFifaSlot } from "../../utils/fifaSlots";

/* ---------- FIFA code helpers ---------- */
const FIFA_CODE_PREFIX = "FIFA-";
const FIFA_CODE_SUFFIX_PATTERN = /[^A-HJ-NP-Z2-9]/g;

function fifaCodeSuffix(code) {
  const upper = (code || "").toUpperCase();
  if (upper.startsWith(FIFA_CODE_PREFIX)) return upper.slice(FIFA_CODE_PREFIX.length);
  return upper.replace(/^FIFA-?/, "");
}

function buildFifaCode(suffix) {
  const cleaned = (suffix || "")
    .toUpperCase()
    .replace(FIFA_CODE_SUFFIX_PATTERN, "")
    .slice(0, 4);
  return cleaned ? `${FIFA_CODE_PREFIX}${cleaned}` : "";
}

function formatDate(value, withTime = true) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function formatPastSlotLabel(slot) {
  const date = slot.slotDate ? formatDate(slot.slotDate, false) : null;
  return date ? `${slot.title} · ${date}` : slot.title;
}

function getErrorMessage(err, fallback = "Something went wrong") {
  return err?.response?.data?.message || err?.message || fallback;
}

/* ---------- localStorage helpers ---------- */
const LS_KEY = "fifaParticipant";
const LS_EMAIL_KEY = "fifaLastEmail";

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || null;
  } catch {
    return null;
  }
}

function writeSaved(val) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(val));
  } catch {
    /* ignore */
  }
}

function clearSaved() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
}

function readLastEmail() {
  try {
    return localStorage.getItem(LS_EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

function writeLastEmail(email) {
  try {
    localStorage.setItem(LS_EMAIL_KEY, email);
  } catch {
    /* ignore */
  }
}


/* ========================================== */
/*  Root                                       */
/* ========================================== */
export default function FifaPlay() {
  const saved = readSaved();
  const [step, setStep] = useState(saved ? "loading" : "code");
  const [creds, setCreds] = useState(saved || { email: readLastEmail(), code: "" });
  const [participant, setParticipant] = useState(null);
  const [slots, setSlots] = useState(null);
  const [joinForm, setJoinForm] = useState({ name: "", jnvSchool: "", email: "" });
  const [emailConsent, setEmailConsent] = useState(false);
  const [existingName, setExistingName] = useState("");
  const [editSchoolOpen, setEditSchoolOpen] = useState(false);

  const { data: campaignData } = useFifaCampaign();
  const campaignSlots = campaignData?.slots ?? [];

  const loadPredictions = (c) =>
    fifaApi.getMyPredictions(c).then((r) => {
      setParticipant(r.participant);
      setSlots(r.slots);
      setStep("play");
    });

  useEffect(() => {
    if (saved) {
      loadPredictions(saved).catch(() => {
        clearSaved();
        setStep("code");
        setCreds({ email: readLastEmail(), code: "" });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const joinMutation = useMutation({
    mutationFn: (data) => fifaApi.join(data),
    onSuccess: (res, vars) => {
      const email = vars.email;
      writeLastEmail(email);
      setCreds((prev) => ({ ...prev, email }));
      if (res.data?.alreadyRegistered) {
        setExistingName(res.data.name || "");
        setStep("already");
      } else {
        setStep("code");
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const resendMutation = useMutation({
    mutationFn: (data) => fifaApi.resend(data),
    onSuccess: () => {
      toast.success("Code re-sent! Check your email.");
      setStep("code");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const verifyMutation = useMutation({
    mutationFn: (data) => fifaApi.verify(data),
    onSuccess: () => {
      writeSaved(creds);
      loadPredictions(creds).catch(() => toast.error("Could not load predictions."));
    },
    onError: () => toast.error("Invalid code. Please try again."),
  });

  const activeSlotFromPlay = slots ? getActiveFifaSlot(slots) : null;
  const activeSlotFromCampaign = getActiveFifaSlot(campaignSlots);
  const timerSlot = activeSlotFromPlay ?? activeSlotFromCampaign;

  const timerStrip =
    timerSlot?.closesAt && !timerSlot.locked ? (
      <div className="border-b border-[rgba(26,71,42,0.15)] bg-[rgba(26,71,42,0.08)] px-4 py-2.5">
        <div className="mx-auto flex max-w-md flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center sm:max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fifa-green)]">
            {timerSlot.title}
          </span>
          <FifaSlotCountdown
            closesAt={timerSlot.closesAt}
            locked={timerSlot.locked}
            variant="dark"
            layout="inline"
          />
        </div>
      </div>
    ) : null;

  if (step === "loading") {
    return (
      <div className="fifa-page flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <span className="text-5xl">⚽</span>
          <p className="text-gray-600 font-medium">Loading your predictions…</p>
        </div>
      </div>
    );
  }

  if (step === "join") {
    return (
      <div className="fifa-page min-h-screen">
        {timerStrip}
        <div className="mx-auto max-w-md px-4 py-14">
          <div className="mb-8 text-center space-y-2">
            <div className="text-5xl mb-3">⚽</div>
            <h1 className="text-3xl font-bold text-[var(--fifa-dark)]">Register for the Contest</h1>
            <p className="text-gray-600 text-sm max-w-xs mx-auto">
              New here? Enter your details once — we&apos;ll email a code you can reuse all tournament.
            </p>
          </div>

          <div className="fifa-card p-7 space-y-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                joinMutation.mutate(joinForm);
              }}
              className="space-y-4"
            >
              <div className="form-group mb-0">
                <label htmlFor="name" className="form-label">Your name</label>
                <input
                  id="name"
                  className="input"
                  required
                  placeholder="eg: Sreehari"
                  value={joinForm.name}
                  onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                />
              </div>
              <div className="form-group mb-0">
                <label htmlFor="jnvSchool" className="form-label">JNV School</label>
                <select
                  id="jnvSchool"
                  className="input"
                  required
                  value={joinForm.jnvSchool}
                  onChange={(e) => setJoinForm({ ...joinForm, jnvSchool: e.target.value })}
                >
                  <option value="">Select your JNV school</option>
                  {JNV_SCHOOLS.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group mb-0">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  required
                  value={joinForm.email}
                  onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                />
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-[var(--fifa-green)] focus:ring-[var(--fifa-green)]"
                  checked={emailConsent}
                  onChange={(e) => setEmailConsent(e.target.checked)}
                />
                <span>
                  I agree that my email and registration details will be saved for this
                  contest, leaderboard, and future sign-ins.
                </span>
              </label>
              <button
                type="submit"
                className="fifa-btn-primary w-full py-3 text-base"
                disabled={joinMutation.isPending || !emailConsent}
              >
                {joinMutation.isPending ? "Checking…" : "Continue →"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-600 pt-1">
              Already have a code?{" "}
              <button
                type="button"
                className="text-[var(--fifa-green)] underline font-medium"
                onClick={() => setStep("code")}
              >
                Sign in here
              </button>
            </p>
          </div>
          <FifaOrganizerCredit className="mt-8" />
        </div>
      </div>
    );
  }

  if (step === "already") {
    return (
      <div className="fifa-page min-h-screen">
        {timerStrip}
        <div className="mx-auto max-w-md px-4 py-14">
          <div className="mb-8 text-center space-y-2">
            <div className="text-5xl mb-3">👋</div>
            <h1 className="text-3xl font-bold text-[var(--fifa-dark)]">
              Welcome back{existingName ? `, ${existingName.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-gray-600 text-sm max-w-xs mx-auto">
              This email is already registered. Use your existing FIFA code to sign in.
            </p>
          </div>

          <div className="fifa-card p-7 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">Have your FIFA code?</p>
              <p className="text-xs text-gray-600">
                Check your original registration email — your code is reusable all tournament.
              </p>
            </div>
            <button
              type="button"
              className="fifa-btn-primary w-full py-3 text-base"
              onClick={() => setStep("code")}
            >
              Enter my FIFA code ⚽
            </button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-500 flex-shrink-0">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">Can&apos;t find it?</p>
              <p className="text-xs text-gray-600">
                We&apos;ll re-send your existing code to{" "}
                <span className="font-medium text-gray-900">{creds.email}</span>.
              </p>
            </div>
            <button
              type="button"
              className="fifa-btn-outline w-full py-2.5"
              disabled={resendMutation.isPending}
              onClick={() => resendMutation.mutate({ email: creds.email })}
            >
              {resendMutation.isPending ? "Sending…" : "Re-send my code →"}
            </button>

            <button
              type="button"
              className="text-xs text-gray-500 underline w-full text-center block pt-1"
              onClick={() => setStep("join")}
            >
              ← Use a different email
            </button>
          </div>
          <FifaOrganizerCredit className="mt-8" />
        </div>
      </div>
    );
  }

  if (step === "code") {
    return (
      <div className="fifa-page min-h-screen">
        {timerStrip}
        <div className="mx-auto max-w-md px-4 py-14">
          <div className="mb-8 text-center space-y-2">
            <div className="text-5xl mb-3">📩</div>
            <h1 className="text-3xl font-bold text-[var(--fifa-dark)]">Sign in</h1>
            <p className="text-gray-600 text-sm">
              Enter your email and the 4-character code from your registration email —{" "}
              <span className="font-mono font-bold text-gray-900 tracking-widest">FIFA-</span>
              is already filled in.
            </p>
          </div>

          <div className="fifa-card p-7 space-y-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyMutation.mutate(creds);
              }}
              className="space-y-4"
            >
              <div className="form-group mb-0">
                <label htmlFor="vemail" className="form-label">Email</label>
                <input
                  id="vemail"
                  type="email"
                  className="input"
                  required
                  value={creds.email}
                  onChange={(e) => setCreds({ ...creds, email: e.target.value })}
                />
              </div>
              <div className="form-group mb-0">
                <label htmlFor="vcode" className="form-label">Your FIFA code</label>
                <div className="flex overflow-hidden rounded-md border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-[var(--fifa-green)] focus-within:ring-opacity-50">
                  <span className="flex h-12 items-center border-r border-gray-300 bg-gray-50 px-3 font-mono text-lg tracking-wider text-gray-500 select-none">
                    FIFA-
                  </span>
                  <input
                    id="vcode"
                    required
                    placeholder="XXXX"
                    autoComplete="one-time-code"
                    maxLength={4}
                    className="h-12 flex-1 border-0 px-3 font-mono text-lg uppercase tracking-[0.25em] focus:outline-none focus:ring-0"
                    value={fifaCodeSuffix(creds.code)}
                    onChange={(e) =>
                      setCreds({ ...creds, code: buildFifaCode(e.target.value) })
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                className="fifa-btn-primary w-full py-3 text-base"
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? "Verifying…" : "Enter contest ⚽"}
              </button>
            </form>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                className="text-sm text-gray-600"
                disabled={!creds.email || resendMutation.isPending}
                onClick={() => {
                  if (creds.email) resendMutation.mutate({ email: creds.email });
                }}
              >
                {resendMutation.isPending ? "Sending…" : "Re-send code"}
              </button>
            </div>
            <p className="text-center text-sm text-gray-600 pt-1">
              New user?{" "}
              <button
                type="button"
                className="text-[var(--fifa-green)] underline font-medium"
                onClick={() => setStep("join")}
              >
                Register here
              </button>
            </p>
          </div>
          <FifaOrganizerCredit className="mt-8" />
        </div>
      </div>
    );
  }

  const activeSlots = slots?.filter((s) => !s.locked) ?? [];
  const pastSlots = slots?.filter((s) => s.locked) ?? [];

  return (
    <div className="fifa-page min-h-screen">
      <div className="fifa-header relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(255,255,255,0.8) 48px, rgba(255,255,255,0.8) 50px)",
          }}
        />
        <span className="absolute right-6 top-2 text-3xl opacity-15 pointer-events-none select-none">⚽</span>
        <div className="relative mx-auto max-w-2xl px-4 py-5 flex items-center justify-between gap-2 flex-wrap">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-widest font-medium mb-0.5">
              ⚽ FIFA WC 2026
            </p>
            <h1 className="text-2xl font-bold text-white drop-shadow">
              {participant?.name}
              <span className="ml-2 text-base font-normal text-white/70 inline-flex items-center gap-1.5">
                · {participant?.jnvSchool ?? "—"}
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium text-white/80 underline-offset-2 hover:bg-white/10 hover:text-white hover:underline"
                  onClick={() => setEditSchoolOpen(true)}
                >
                  <Pencil className="h-3 w-3" />
                  Edit school
                </button>
              </span>
            </h1>
            {timerSlot?.closesAt && !timerSlot.locked && (
              <div className="mt-2">
                <FifaSlotCountdown
                  closesAt={timerSlot.closesAt}
                  locked={timerSlot.locked}
                  variant="light"
                  layout="pill"
                  prefix={`${timerSlot.title} · closes in`}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/fifa/leaderboard"
              className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-bold shadow-sm transition-all hover:brightness-105 active:scale-95"
              style={{ background: "#e0a431", color: "#1a1a1a" }}
            >
              <Trophy className="h-3.5 w-3.5 mr-1.5 inline" />
              Leaderboard
            </Link>
            <button
              type="button"
              className="text-xs text-white/50 underline hover:text-white/80 transition-colors"
              onClick={() => {
                clearSaved();
                setCreds({ email: creds.email, code: "" });
                setSlots(null);
                setParticipant(null);
                setStep("code");
              }}
            >
              Switch
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-[rgba(26,71,42,0.12)] bg-[rgba(26,71,42,0.06)] px-4 py-2">
        <div className="mx-auto max-w-2xl">
          <FifaOrganizerCredit compact variant="page" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-10">
        {!slots && (
          <p className="text-center text-gray-600 py-16">Loading…</p>
        )}

        {slots?.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="text-5xl">🏟️</div>
            <p className="text-xl font-semibold text-[var(--fifa-dark)]">No slots open yet</p>
            <p className="text-gray-600 text-sm">Check back when the next game day is published.</p>
          </div>
        )}

        {activeSlots.map((slot) => (
          <SlotSection
            key={slot._id}
            slot={slot}
            creds={creds}
            myName={participant?.name}
            onRefresh={() => loadPredictions(creds)}
          />
        ))}

        {pastSlots.length > 0 && (
          <PastGameDaysSection
            pastSlots={pastSlots}
            creds={creds}
            myName={participant?.name}
            onRefresh={() => loadPredictions(creds)}
          />
        )}
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-10">
        <FifaOrganizerCredit />
      </div>

      <EditSchoolDialog
        open={editSchoolOpen}
        onOpenChange={setEditSchoolOpen}
        creds={creds}
        participant={participant}
        onUpdated={setParticipant}
      />
    </div>
  );
}

function EditSchoolDialog({ open, onOpenChange, creds, participant, onUpdated }) {
  const queryClient = useQueryClient();
  const [jnvSchool, setJnvSchool] = useState("");

  useEffect(() => {
    if (open) setJnvSchool(participant?.jnvSchool || "");
  }, [open, participant?.jnvSchool]);

  const mutation = useMutation({
    mutationFn: (data) => fifaApi.updateSchool(data),
    onSuccess: (res) => {
      toast.success("JNV school updated");
      if (res?.participant) onUpdated(res.participant);
      queryClient.invalidateQueries({ queryKey: fifaKeys.leaderboard });
      onOpenChange(false);
    },
    onError: (err) => toast.error(getErrorMessage(err, "Could not update JNV school")),
  });

  const handleSave = () => {
    if (!jnvSchool) {
      toast.error("Please select your JNV school");
      return;
    }
    mutation.mutate({
      email: creds.email,
      code: creds.code,
      jnvSchool,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close dialog"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--fifa-dark)]">Edit your JNV school</h2>
          <p className="text-sm text-gray-600 mt-1">
            Pick the correct JNV school for leaderboard standings. You can change this anytime after signing in.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-jnvSchool" className="form-label mb-0">JNV School</label>
          <select
            id="edit-jnvSchool"
            className="input"
            value={jnvSchool}
            onChange={(e) => setJnvSchool(e.target.value)}
          >
            <option value="">Select your JNV school</option>
            {JNV_SCHOOLS.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn btn-outline" onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="fifa-btn-primary px-4 py-2"
            onClick={handleSave}
            disabled={mutation.isPending || !jnvSchool}
          >
            {mutation.isPending ? "Saving…" : "Save school"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PastGameDaysSection({ pastSlots, creds, myName, onRefresh }) {
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const sortedPastSlots = [...pastSlots].sort(
    (a, b) => new Date(b.slotDate || 0).getTime() - new Date(a.slotDate || 0).getTime()
  );

  useEffect(() => {
    if (selectedSlotId && !pastSlots.some((s) => String(s._id) === selectedSlotId)) {
      setSelectedSlotId("");
    }
  }, [pastSlots, selectedSlotId]);

  const selectedSlot = sortedPastSlots.find((s) => String(s._id) === selectedSlotId);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-600 flex items-center gap-2">
        <span>Past game days</span>
        <div className="flex-1 h-px bg-gray-200" />
      </h2>

      <select
        className="input"
        value={selectedSlotId}
        onChange={(e) => setSelectedSlotId(e.target.value)}
      >
        <option value="">Select a game day to view</option>
        {sortedPastSlots.map((slot) => (
          <option key={slot._id} value={String(slot._id)}>
            {formatPastSlotLabel(slot)}
          </option>
        ))}
      </select>

      {!selectedSlot ? (
        <p className="text-sm text-gray-600 text-center py-6 rounded-xl border border-dashed border-gray-300">
          Pick a past game day above to view your predictions and results.
        </p>
      ) : (
        <SlotSection
          slot={selectedSlot}
          creds={creds}
          myName={myName}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}

function SlotSection({ slot, creds, myName, onRefresh }) {
  const locked = slot.locked;
  const totalMaxPts =
    slot.matches?.reduce(
      (s, m) => s + m.questions.reduce((qs, q) => qs + q.points, 0),
      0
    ) ?? 0;
  const totalEarned =
    slot.matches?.reduce(
      (s, m) => s + m.questions.reduce((qs, q) => qs + (q.pointsAwarded ?? 0), 0),
      0
    ) ?? 0;
  const anyGraded = slot.matches?.some((m) => m.questions.some((q) => q.graded));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-[var(--fifa-dark)]">{slot.title}</h2>
          <div className="flex items-center gap-1.5 mt-0.5 text-sm text-gray-600">
            {locked ? (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 inline-block" />
                Closed
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[var(--fifa-green)] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--fifa-green)] inline-block animate-pulse" />
                Open · closes {formatDate(slot.closesAt)}
              </span>
            )}
          </div>
        </div>
        {anyGraded && (
          <span className="fifa-badge text-sm px-3 py-1">
            {totalEarned} / {totalMaxPts} pts
          </span>
        )}
      </div>

      <div className="space-y-5">
        {slot.matches?.map((match) => (
          <MatchCard
            key={match._id}
            match={match}
            slotLocked={locked}
            creds={creds}
            onSaved={onRefresh}
          />
        ))}
      </div>

      <CommunityPredictions slot={slot} myName={myName} />
    </div>
  );
}

function buildAnswersFromMatch(match) {
  const m = {};
  for (const q of match.questions) {
    const key = answerKey(q._id);
    if (isFifaAnswerProvided(q.type, q.answer)) {
      if (q.type === "score") m[key] = readScoreAnswer(q.answer);
      else if (q.type === "number") m[key] = readNumberAnswer(q.answer);
      else m[key] = q.answer;
    } else if (q.type === "score") {
      m[key] = defaultScoreAnswer();
    } else {
      m[key] = null;
    }
  }
  return m;
}

function MatchCard({ match, slotLocked, creds, onSaved }) {
  const [answers, setAnswers] = useState(() => buildAnswersFromMatch(match));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAnswers(buildAnswersFromMatch(match));
  }, [match]);

  const flagA = teamFlag(match.teamA);
  const flagB = teamFlag(match.teamB);
  const labelA = teamDisplayLabels(match.teamA);
  const labelB = teamDisplayLabels(match.teamB);

  const totalMaxPts = match.questions.reduce((s, q) => s + q.points, 0);
  const totalEarned = match.questions.reduce((s, q) => s + (q.pointsAwarded ?? 0), 0);
  const anyGraded = match.questions.some((q) => q.graded);
  const hasSavedAnswers =
    match.questions.length > 0 &&
    match.questions.every((q) => isFifaAnswerProvided(q.type, q.answer));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missing = match.questions.filter(
      (q) => !isFifaAnswerProvided(q.type, answers[answerKey(q._id)])
    );
    if (missing.length > 0) {
      toast.error(
        missing.length === 1
          ? `Please answer: ${missing[0].text}`
          : `Please answer all ${missing.length} questions before submitting.`
      );
      return;
    }

    setSaving(true);
    try {
      await fifaApi.predict({
        email: creds.email,
        code: creds.code,
        matchId: match._id,
        answers: match.questions.map(({ _id, type }) => ({
          questionId: _id,
          value: normalizeFifaAnswerForSubmit(type, answers[answerKey(_id)]),
        })),
      });
      toast.success(hasSavedAnswers ? "Predictions updated" : "Predictions saved");
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save. Try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fifa-card overflow-hidden">
      <div className="bg-gradient-to-r from-[rgba(26,71,42,0.08)] via-transparent to-[rgba(26,71,42,0.08)] px-5 pt-5 pb-4">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center flex-1">
            <div className="text-4xl mb-1">{flagA}</div>
            <div className="font-bold text-sm leading-tight">{labelA.short}</div>
            {labelA.full && (
              <div className="mt-0.5 text-[10px] leading-tight text-gray-500">
                {labelA.full}
              </div>
            )}
          </div>
          <div className="text-center px-2">
            <div className="text-xs text-gray-500 font-medium uppercase tracking-widest">vs</div>
            {match.kickoffAt && (
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-0.5 justify-center">
                <Clock className="h-3 w-3" />
                {formatDate(match.kickoffAt)}
              </div>
            )}
          </div>
          <div className="text-center flex-1">
            <div className="text-4xl mb-1">{flagB}</div>
            <div className="font-bold text-sm leading-tight">{labelB.short}</div>
            {labelB.full && (
              <div className="mt-0.5 text-[10px] leading-tight text-gray-500">
                {labelB.full}
              </div>
            )}
          </div>
        </div>
        {anyGraded && (
          <div className="mt-3 text-center">
            <span className="inline-flex items-center rounded-full bg-[var(--fifa-green)] text-white px-3 py-1 text-xs font-semibold">
              You scored {totalEarned} / {totalMaxPts} pts
            </span>
          </div>
        )}
        {!anyGraded && hasSavedAnswers && !slotLocked && (
          <div className="mt-3 text-center">
            <span className="inline-flex items-center rounded-full border border-[rgba(26,71,42,0.3)] text-[var(--fifa-green)] px-3 py-1 text-xs font-medium">
              Saved — edit anytime before close
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="px-5 pb-5 pt-4 space-y-5">
        {match.questions.map((q, i) => (
          <div key={q._id} className={i > 0 ? "pt-4 border-t border-gray-200" : ""}>
            <QuestionField
              question={q}
              teamA={match.teamA}
              teamB={match.teamB}
              stage={match.stage || "group"}
              flagA={flagA}
              flagB={flagB}
              value={answers[answerKey(q._id)]}
              onChange={(val) => setAnswers((prev) => ({ ...prev, [answerKey(q._id)]: val }))}
              locked={slotLocked}
              result={q.graded ? { pointsAwarded: q.pointsAwarded, graded: q.graded } : null}
            />
          </div>
        ))}

        {!slotLocked && (
          <div className="pt-2">
            <button
              type="submit"
              className="fifa-btn-primary w-full py-3 text-base font-semibold inline-flex items-center justify-center"
              disabled={saving}
            >
              {saving ? "Saving…" : hasSavedAnswers ? "Update predictions" : "Save predictions"}
              {!saving && <ChevronRight className="ml-1 h-4 w-4" />}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function formatAnswerDisplay(value, type, teamA, teamB) {
  if (!isFifaAnswerProvided(type, value)) return "—";
  if (type === "winner") {
    if (value === "teamA") return teamA;
    if (value === "teamB") return teamB;
    return "Draw";
  }
  if (type === "score") return `${value.a ?? "?"} – ${value.b ?? "?"}`;
  return String(value);
}

function CommunityPredictions({ slot, myName }) {
  const [open, setOpen] = useState(false);

  const { data, isFetching } = useQuery({
    queryKey: fifaKeys.slotPredictions(slot._id),
    queryFn: () => fifaApi.getSlotPredictions(slot._id),
    enabled: open,
    staleTime: 60_000,
  });

  const communityMatches = data?.matches ?? [];
  const anyPredictions = communityMatches.some((m) => m.predictionCount > 0);

  return (
    <div className="fifa-card overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="font-semibold text-sm">Everyone&apos;s predictions</span>
          {!open && communityMatches.length === 0 && (
            <span className="text-xs text-gray-500">(tap to load)</span>
          )}
          {anyPredictions && !open && (
            <span className="text-xs text-[var(--fifa-green)] font-medium">
              · {communityMatches.reduce((s, m) => Math.max(s, m.predictionCount), 0)} players
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-gray-200 divide-y divide-gray-200">
          {isFetching && (
            <div className="px-5 py-6 text-center text-sm text-gray-600">Loading…</div>
          )}
          {!isFetching &&
            communityMatches.map((match) => (
              <CommunityMatchBlock key={match._id} match={match} myName={myName} />
            ))}
          {!isFetching && communityMatches.length === 0 && (
            <div className="px-5 py-6 text-center text-sm text-gray-600">No predictions yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

function CommunityMatchBlock({ match, myName }) {
  const { teamA, teamB, questions, predictions } = match;
  const flagA = teamFlag(teamA);
  const flagB = teamFlag(teamB);
  const [expanded, setExpanded] = useState(false);

  const sorted = [...predictions].sort((a, b) => {
    const schoolCmp = String(a.jnvSchool ?? "").localeCompare(String(b.jnvSchool ?? ""), undefined, {
      numeric: true,
      sensitivity: "base",
    });
    if (schoolCmp !== 0) return schoolCmp;
    return a.name.localeCompare(b.name);
  });

  const visible = expanded ? sorted : sorted.slice(0, 8);
  const ansMap = new Map(
    sorted.map((pred) => [
      pred.name,
      new Map(pred.answers.map((a) => [a.questionId, a])),
    ])
  );

  if (predictions.length === 0) {
    return (
      <div className="px-5 py-3 text-sm text-gray-600 italic">
        {flagA} {teamA} vs {teamB} {flagB} — no predictions yet
      </div>
    );
  }

  return (
    <div className="py-3 space-y-2">
      <div className="px-5 flex items-center gap-2 text-sm font-bold">
        <span>{flagA}</span>
        <span>{teamA}</span>
        <span className="text-gray-500 font-normal text-xs">vs</span>
        <span>{teamB}</span>
        <span>{flagB}</span>
        <span className="ml-auto text-xs font-normal text-gray-500">
          {predictions.length} prediction{predictions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-max">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-100 text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap min-w-[130px]">
                Player
              </th>
              {questions.map((q) => (
                <th
                  key={q._id}
                  className="px-3 py-2.5 text-xs font-semibold text-gray-500 text-center whitespace-nowrap max-w-[120px]"
                >
                  <div className="truncate max-w-[110px]" title={q.text}>
                    {q.text}
                  </div>
                  <div className="font-normal text-gray-400 mt-0.5">{q.points} pts</div>
                </th>
              ))}
              {sorted.some((p) => p.totalPoints > 0) && (
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center whitespace-nowrap">
                  Total
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {visible.map((pred, i) => {
              const isMe = pred.name === myName;
              const answers = ansMap.get(pred.name);
              return (
                <tr
                  key={i}
                  className={`transition-colors ${isMe ? "bg-[rgba(26,71,42,0.08)] hover:bg-[rgba(26,71,42,0.12)]" : "hover:bg-gray-50"}`}
                >
                  <td
                    className={`sticky left-0 z-10 px-5 py-2.5 whitespace-nowrap ${isMe ? "bg-[rgba(26,71,42,0.1)]" : "bg-white"}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isMe && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--fifa-green)] flex-shrink-0" />
                      )}
                      <span
                        className={`font-semibold truncate max-w-[90px] ${isMe ? "text-[var(--fifa-green)]" : "text-gray-900"}`}
                      >
                        {isMe ? "You" : pred.name}
                      </span>
                      <span
                        className="text-xs text-gray-500 flex-shrink-0 max-w-[7rem] truncate"
                        title={pred.jnvSchool}
                      >
                        {pred.jnvSchool}
                      </span>
                    </div>
                  </td>
                  {questions.map((q) => {
                    const ans = answers?.get(String(q._id));
                    const display = ans
                      ? formatAnswerDisplay(ans.value, q.type, teamA, teamB)
                      : "—";
                    const scored = ans?.graded && ans.pointsAwarded > 0;
                    const wrong = ans?.graded && ans.pointsAwarded === 0;
                    return (
                      <td key={q._id} className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span
                          className={`text-sm font-medium ${scored ? "text-green-700" : wrong ? "text-red-600" : "text-gray-900"}`}
                        >
                          {display}
                        </span>
                        {scored && (
                          <span className="block text-[10px] text-green-700 font-semibold leading-none mt-0.5">
                            +{ans.pointsAwarded}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {sorted.some((p) => p.totalPoints > 0) && (
                    <td className="px-4 py-2.5 text-center whitespace-nowrap">
                      {pred.totalPoints > 0 ? (
                        <span className="text-sm font-bold text-green-700">{pred.totalPoints}</span>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sorted.length > 8 && (
        <div className="px-5">
          <button
            type="button"
            className="text-xs text-[var(--fifa-green)] underline"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Show less" : `Show all ${sorted.length} predictions`}
          </button>
        </div>
      )}
    </div>
  );
}
