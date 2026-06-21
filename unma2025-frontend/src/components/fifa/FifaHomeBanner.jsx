import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useFifaCampaign } from "../../hooks/useFifa";
import { getActiveFifaSlot } from "../../utils/fifaSlots";
import FifaSlotCountdown from "./FifaSlotCountdown";

const DISMISS_KEY = "unma_fifa_banner_dismissed";

export default function FifaHomeBanner() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  const { data, isLoading } = useFifaCampaign();
  const campaign = data?.campaign;
  const slots = data?.slots || [];
  const activeSlot = getActiveFifaSlot(slots);
  const hasPlayableContent = Boolean(
    activeSlot?.matches?.some((m) => (m.questions?.length ?? 0) > 0)
  );

  if (isLoading || dismissed) {
    return null;
  }

  if (!campaign || campaign.status !== "active") {
    return null;
  }

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  const handleBannerClick = () => {
    if (hasPlayableContent) {
      navigate("/fifa/play");
      return;
    }
    toast("Questions will be added soon.", { icon: "ℹ️" });
  };

  const handleBannerKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleBannerClick();
    }
  };

  const headline = activeSlot
    ? hasPlayableContent
      ? `${activeSlot.title} is open!`
      : `${activeSlot.title} · coming soon`
    : campaign.name || "FIFA WC Prediction Contest";

  const subline = hasPlayableContent
    ? "Submit your predictions before the slot closes."
    : activeSlot
      ? "Questions will be added soon — check back shortly."
      : "The next game day opens soon — stay tuned.";

  const actionLabel = hasPlayableContent ? "Play now →" : "Learn more →";

  return (
    <div className="container py-4">
      <div
        className="relative overflow-hidden rounded-2xl fifa-banner-fade-in cursor-pointer"
        style={{
          background:
            "linear-gradient(135deg, #1a7a3c 0%, #22a04a 40%, #1a7a3c 70%, #15612f 100%)",
        }}
        role="button"
        tabIndex={0}
        onClick={handleBannerClick}
        onKeyDown={handleBannerKeyDown}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(255,255,255,0.8) 48px, rgba(255,255,255,0.8) 50px)",
          }}
        />
        <span
          className="absolute right-16 top-1 text-xl opacity-20 fifa-banner-ball-float pointer-events-none select-none"
          style={{ animationDelay: "0s" }}
          aria-hidden
        >
          ⚽
        </span>
        <span
          className="absolute right-32 bottom-0.5 text-sm opacity-15 fifa-banner-ball-float-slow pointer-events-none select-none"
          style={{ animationDelay: "1.5s" }}
          aria-hidden
        >
          ⚽
        </span>

        <div className="relative flex items-center gap-3 px-5 py-3.5">
          <span
            className="text-2xl flex-shrink-0 fifa-banner-ball-float"
            style={{ animationDelay: "0.3s" }}
            aria-hidden
          >
            ⚽
          </span>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-white drop-shadow">{headline}</span>
            <span className="ml-2 text-white/80 text-sm hidden sm:inline">
              {subline}
            </span>
            {activeSlot?.closesAt && !activeSlot.locked && (
              <div className="mt-1">
                <FifaSlotCountdown
                  closesAt={activeSlot.closesAt}
                  locked={activeSlot.locked}
                  variant="light"
                  layout="inline"
                />
              </div>
            )}
          </div>
          <span
            className="flex-shrink-0 rounded-xl px-4 py-1.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: "#e0a431", color: "#1a1a1a" }}
          >
            {actionLabel}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              dismiss();
            }}
            className="flex-shrink-0 rounded-lg p-1 text-white/60 hover:text-white transition-colors"
            aria-label="Dismiss FIFA banner"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
