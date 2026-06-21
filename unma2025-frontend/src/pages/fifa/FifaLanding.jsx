import { Link } from "react-router-dom";
import { TrophyIcon } from "@heroicons/react/24/outline";
import { useFifaCampaign } from "../../hooks/useFifa";
import { getActiveFifaSlot } from "../../utils/fifaSlots";

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

export default function FifaLanding() {
  const { data, isLoading } = useFifaCampaign();
  const campaign = data?.campaign;
  const slots = data?.slots || [];
  const activeSlot = getActiveFifaSlot(slots) || slots[slots.length - 1];

  return (
    <div className="fifa-page">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-8">
        <div className="space-y-3">
          <TrophyIcon className="mx-auto h-12 w-12 text-[var(--fifa-gold)]" />
          <h1 className="text-4xl font-bold text-[var(--fifa-dark)]">
            {campaign?.name || "UNMA FIFA WC Prediction Contest"}
          </h1>
          {campaign?.description && (
            <p className="text-gray-600 max-w-lg mx-auto">{campaign.description}</p>
          )}
        </div>

        {isLoading && (
          <p className="text-gray-500 text-sm">Loading campaign…</p>
        )}

        {activeSlot && (
          <div className="fifa-card p-5 text-left space-y-1">
            <p className="font-semibold text-[var(--fifa-dark)]">{activeSlot.title}</p>
            <p className="text-sm text-gray-600">
              {activeSlot.locked
                ? "This slot is now closed."
                : `Open · closes ${formatDate(activeSlot.closesAt)}`}
            </p>
            <p className="text-sm text-gray-600">
              {activeSlot.matches?.length || 0} match
              {activeSlot.matches?.length !== 1 ? "es" : ""}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/fifa/play" className="fifa-btn-primary px-8 py-3 text-base">
            Join &amp; Play ⚽
          </Link>
          <Link to="/fifa/leaderboard" className="fifa-btn-outline px-8 py-3 text-base">
            Leaderboard
          </Link>
        </div>

        <p className="text-xs text-gray-500">
          Enter your name, JNV school and email once — we&apos;ll send a code you can reuse all tournament.
        </p>
      </div>
    </div>
  );
}
