import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import fifaBracketApi from "../../api/fifaBracketApi";
import { fifaBracketKeys, fifaBracketStaleTime } from "../../hooks/useFifaBracket";
import { KnockoutBracket } from "../../components/fifa-bracket/KnockoutBracket";
import { isPredictionsComplete, ALL_BRACKET_KEYS } from "../../utils/fifaBracketTree";
import {
  readSavedParticipant,
  writeSavedParticipant,
  readLastEmail,
} from "../../utils/fifaParticipant";
import FifaSlotCountdown from "../../components/fifa/FifaSlotCountdown";

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

function getErrorMessage(err, fallback = "Something went wrong") {
  return err?.response?.data?.message || err?.message || fallback;
}

export default function FifaBracketPlay() {
  const saved = readSavedParticipant();
  const [step, setStep] = useState(saved ? "loading" : "auth");
  const [creds, setCreds] = useState(saved || { email: readLastEmail(), code: "" });
  const [participant, setParticipant] = useState(null);
  const [predictions, setPredictions] = useState({});
  const [submitted, setSubmitted] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: fifaBracketKeys.contest,
    queryFn: () => fifaBracketApi.getContest(),
    staleTime: fifaBracketStaleTime,
  });

  const contest = data?.contest;

  const checkMutation = useMutation({
    mutationFn: (payload) => fifaBracketApi.check(payload),
    onSuccess: (res) => {
      if (!res.registered) {
        setStep("not-registered");
        return;
      }
      if (!res.verified) {
        toast.error("Please verify your FIFA code in the main contest first");
        setStep("auth");
        return;
      }
      if (res.entered) {
        setSubmitted(res.entry);
        setParticipant(res.participant);
        setStep("already");
        return;
      }
      setParticipant(res.participant);
      setStep("bracket");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const enterMutation = useMutation({
    mutationFn: (payload) => fifaBracketApi.enter(payload),
    onSuccess: (res) => {
      const entry = res?.data?.entry;
      setSubmitted(entry);
      writeSavedParticipant(creds);
      toast.success("Your Road to the Final picks have been submitted!");
    },
    onError: (err) => toast.error(getErrorMessage(err, "Failed to submit entry")),
  });

  useEffect(() => {
    if (saved && contest) {
      checkMutation.mutate(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contest?._id]);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!creds.email || !creds.code) {
      toast.error("Please enter your email and FIFA code");
      return;
    }
    checkMutation.mutate(creds);
  };

  const handleSubmit = () => {
    if (!isPredictionsComplete(predictions)) {
      toast.error(`Please pick winners for all ${ALL_BRACKET_KEYS.length} matches`);
      return;
    }
    enterMutation.mutate({ ...creds, predictions });
  };

  if (isLoading || step === "loading") {
    return (
      <div className="fifa-page flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (submitted && (step === "already" || enterMutation.isSuccess)) {
    return (
      <div className="fifa-page">
        <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-6">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="text-3xl font-bold text-[var(--fifa-dark)]">
            {step === "already" ? "Already entered!" : "You're in!"}
          </h1>
          <p className="text-gray-600">
            {step === "already"
              ? `Your Road to the Final picks for ${submitted.name || participant?.name} are already saved.`
              : `Good luck, ${submitted.name}! Your Road to the Final picks have been saved.`}
          </p>
          <Link to="/fifa/bracket/board" className="fifa-btn-primary inline-block px-8 py-3">
            View Survival Board
          </Link>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="fifa-page mx-auto max-w-lg px-4 py-16 text-center space-y-4">
        <p className="text-gray-500">No active Road to the Final contest right now.</p>
        <Link to="/fifa/bracket" className="fifa-btn-primary inline-block px-6 py-2">
          Back
        </Link>
      </div>
    );
  }

  if (!contest.entryOpen) {
    return (
      <div className="fifa-page mx-auto max-w-lg px-4 py-16 text-center space-y-4">
        <p className="text-gray-500">Entry period has closed.</p>
        <Link to="/fifa/bracket/board" className="fifa-btn-primary inline-block px-6 py-2">
          View Survival Board
        </Link>
      </div>
    );
  }

  if (!contest.r16Ready) {
    return (
      <div className="fifa-page mx-auto max-w-lg px-4 py-16 text-center space-y-4">
        <p className="text-gray-500">R16 matchups are not ready yet. Please check back soon.</p>
        <Link to="/fifa/bracket" className="fifa-btn-primary inline-block px-6 py-2">
          Back
        </Link>
      </div>
    );
  }

  if (step === "not-registered") {
    return (
      <div className="fifa-page mx-auto max-w-md px-4 py-16 text-center space-y-6">
        <h1 className="text-2xl font-bold text-[var(--fifa-dark)]">Join the FIFA contest first</h1>
        <p className="text-gray-600 text-sm">
          You need a FIFA code from the main UNMA prediction contest before entering Road to the Final.
        </p>
        <Link to="/fifa/play" className="fifa-btn-primary inline-block px-8 py-3">
          Get FIFA Code →
        </Link>
        <button
          type="button"
          onClick={() => setStep("auth")}
          className="block mx-auto text-sm text-gray-500 underline"
        >
          Try a different email
        </button>
      </div>
    );
  }

  if (step === "auth") {
    return (
      <div className="fifa-page">
        <div className="mx-auto max-w-md px-4 py-12 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-[var(--fifa-dark)]">Sign in with FIFA code</h1>
            <p className="text-sm text-gray-600">Use the same credentials as the main contest</p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={creds.email}
                onChange={(e) => setCreds({ ...creds, email: e.target.value })}
                className="input w-full"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="form-label">FIFA Code</label>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-gray-500">{FIFA_CODE_PREFIX}</span>
                <input
                  type="text"
                  value={fifaCodeSuffix(creds.code)}
                  onChange={(e) =>
                    setCreds({ ...creds, code: buildFifaCode(e.target.value) })
                  }
                  className="input flex-1 uppercase tracking-widest"
                  placeholder="XXXX"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={checkMutation.isPending}
              className="fifa-btn-primary w-full py-3"
            >
              {checkMutation.isPending ? "Checking…" : "Continue →"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Don&apos;t have a code?{" "}
            <Link to="/fifa/play" className="underline">
              Join the main contest
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const picksCount = Object.keys(predictions).length;
  const displayName = participant?.name || creds.email;

  return (
    <div className="fifa-page">
      <div className="mx-auto max-w-[1200px] px-4 py-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[var(--fifa-dark)]">Road to the Final</h1>
            <p className="text-sm text-gray-600">
              {displayName}
              {participant?.jnvSchool ? ` · ${participant.jnvSchool}` : ""}
            </p>
            {contest.entryClosesAt && contest.entryOpen && (
              <FifaSlotCountdown
                closesAt={contest.entryClosesAt}
                locked={!contest.entryOpen}
                variant="urgent"
                layout="pill"
                prefix="Entries close in"
              />
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("auth")}
              className="fifa-btn-outline px-4 py-2 text-sm"
            >
              ← Change account
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isPredictionsComplete(predictions) || enterMutation.isPending}
              className="fifa-btn-primary px-6 py-2 text-sm disabled:opacity-50"
            >
              {enterMutation.isPending ? "Submitting…" : `Submit (${picksCount}/15)`}
            </button>
          </div>
        </div>

        <KnockoutBracket
          matches={contest.matches}
          predictions={predictions}
          onPredictionsChange={setPredictions}
          entryClosesAt={contest.entryClosesAt}
          entryOpen={contest.entryOpen}
        />
      </div>
    </div>
  );
}
