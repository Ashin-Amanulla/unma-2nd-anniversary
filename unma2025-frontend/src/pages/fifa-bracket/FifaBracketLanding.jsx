import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TrophyIcon, UsersIcon } from "@heroicons/react/24/outline";
import fifaBracketApi from "../../api/fifaBracketApi";
import { fifaBracketKeys, fifaBracketStaleTime } from "../../hooks/useFifaBracket";
import FifaSlotCountdown from "../../components/fifa/FifaSlotCountdown";

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FifaBracketLanding() {
  const { data, isLoading } = useQuery({
    queryKey: fifaBracketKeys.contest,
    queryFn: () => fifaBracketApi.getContest(),
    staleTime: fifaBracketStaleTime,
  });

  const contest = data?.contest;

  return (
    <div className="fifa-page">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-8">
        <div className="space-y-3">
          <TrophyIcon className="mx-auto h-12 w-12 text-[var(--fifa-gold)]" />
          <h1 className="text-4xl font-bold text-[var(--fifa-dark)]">
            {contest?.name || "Road to the Final"}
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            {contest?.description ||
              "Pick your winners from the Round of 16 through the Final. A perfect run earns 100 bonus points on the main leaderboard!"}
          </p>
        </div>

        {isLoading && <p className="text-gray-500 text-sm">Loading contest…</p>}

        {contest && (
          <div className="fifa-card p-5 text-left space-y-3">
            {contest.entryClosesAt && contest.entryOpen && (
              <FifaSlotCountdown
                closesAt={contest.entryClosesAt}
                locked={!contest.entryOpen}
                variant="urgent"
                layout="pill"
                prefix="Entries close in"
                className="w-full justify-center sm:w-auto"
              />
            )}
            <p className="font-semibold text-[var(--fifa-dark)]">Status: {contest.status}</p>
            {contest.entryClosesAt && (
              <p className="text-sm text-gray-600">
                Entries {contest.entryOpen ? "close" : "closed"} on{" "}
                {formatDate(contest.entryClosesAt)}
              </p>
            )}
            {!contest.r16Ready && (
              <p className="text-sm text-amber-600">R16 matchups are being set up. Check back soon!</p>
            )}
            <p className="text-sm font-medium text-[var(--fifa-gold)]">
              Perfect run = 100 points added to your leaderboard total
            </p>
          </div>
        )}

        {!contest && !isLoading && (
          <p className="text-gray-500">No active Road to the Final contest at the moment.</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {contest?.entryOpen && contest?.r16Ready ? (
            <Link to="/fifa/bracket/play" className="fifa-btn-primary px-8 py-3 text-base">
              Enter Road to the Final ⚽
            </Link>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-gray-100 px-8 py-3 text-base text-gray-400">
              Enter Road to the Final ⚽
            </span>
          )}
          <Link to="/fifa/bracket/board" className="fifa-btn-outline px-8 py-3 text-base inline-flex items-center justify-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Survival Board
          </Link>
        </div>

        <p className="text-xs text-gray-500">
          Sign in with your FIFA code from the main contest — one entry per participant.
        </p>

        <Link to="/fifa/play" className="text-xs text-gray-500 underline hover:text-[var(--fifa-dark)]">
          Need a FIFA code? Join the main prediction contest first →
        </Link>
      </div>
    </div>
  );
}
