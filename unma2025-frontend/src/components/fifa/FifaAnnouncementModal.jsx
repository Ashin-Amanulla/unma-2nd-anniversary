import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { XMarkIcon, TrophyIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useFifaCampaign, useFifaLeaderboard } from "../../hooks/useFifa";
import { getActiveFifaSlot } from "../../utils/fifaSlots";
import { teamFlag } from "../../utils/fifaTeams";
import FifaSlotCountdown from "./FifaSlotCountdown";

const OPEN_DELAY_MS = 1200;
const ROTATE_MS = 4000;
const MAX_TEASERS = 8;

/**
 * Build short, enticing "question opener" strings from an active slot's matches.
 * Uses real teams + each question's type/text so the hook is always current.
 */
function buildTeaserQuestions(slot) {
  if (!slot?.matches?.length) return [];
  const teasers = [];

  for (const match of slot.matches) {
    const { teamA, teamB, questions } = match;
    if (!teamA || !teamB || !questions?.length) continue;
    const fixture = `${teamFlag(teamA)} ${teamA} vs ${teamB} ${teamFlag(teamB)}`;

    for (const q of questions) {
      if (q.type === "winner") {
        teasers.push(`⚽ Who wins? ${fixture}`);
      } else if (q.type === "score") {
        teasers.push(`🎯 Predict the exact score · ${fixture}`);
      } else if (q.text) {
        teasers.push(`🤔 ${q.text} · ${fixture}`);
      }
      if (teasers.length >= MAX_TEASERS) return teasers;
    }
  }

  return teasers;
}

function LeaderboardPreview({ onViewAll }) {
  const { data } = useFifaLeaderboard();
  const top3 = (data?.leaderboard ?? []).slice(0, 3);

  if (top3.length === 0) return null;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 p-4">
      <div className="flex items-center gap-1.5 mb-3 text-white/90">
        <TrophyIcon className="h-4 w-4 text-[#e0a431]" />
        <span className="text-xs font-bold uppercase tracking-wide">Top Predictors</span>
      </div>
      <ul className="space-y-2">
        {top3.map((row, i) => (
          <li key={`${row.name}-${i}`} className="flex items-center gap-2 text-sm text-white">
            <span className="w-5 flex-shrink-0 text-center">{medals[i]}</span>
            <span className="flex-1 min-w-0 truncate font-medium">
              {row.name}
              {row.hotStreak && <span className="ml-1" aria-label="hot streak">🔥</span>}
              {row.jnvSchool && (
                <span className="block text-[11px] text-white/60 truncate">{row.jnvSchool}</span>
              )}
            </span>
            <span className="flex-shrink-0 font-mono tabular-nums font-bold text-[#e0a431]">
              {row.points}
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onViewAll}
        className="mt-3 w-full text-center text-xs font-semibold text-white/80 hover:text-white transition-colors"
      >
        Which JNV is on top? View leaderboard →
      </button>
    </div>
  );
}

export default function FifaAnnouncementModal() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useFifaCampaign();
  const campaign = data?.campaign;
  const slots = data?.slots || [];
  const activeSlot = getActiveFifaSlot(slots);
  const hasPlayableContent = Boolean(
    activeSlot?.matches?.some((m) => (m.questions?.length ?? 0) > 0)
  );

  const isActive = Boolean(campaign && campaign.status === "active");

  const teasers = useMemo(
    () => (hasPlayableContent ? buildTeaserQuestions(activeSlot) : []),
    [hasPlayableContent, activeSlot]
  );

  const [teaserIdx, setTeaserIdx] = useState(0);
  useEffect(() => {
    setTeaserIdx(0);
    if (teasers.length <= 1) return undefined;
    const id = setInterval(() => setTeaserIdx((i) => (i + 1) % teasers.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [teasers]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Open on every home-page load, after a short delay, when a campaign is active.
  useEffect(() => {
    if (isLoading || !isActive) return undefined;
    const id = window.setTimeout(() => setIsOpen(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [isLoading, isActive]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!mounted || !isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted, isOpen]);

  const dismiss = useCallback(() => {
    setIsOpen(false);
  }, []);

  const goPlay = useCallback(() => {
    if (hasPlayableContent) {
      dismiss();
      navigate("/fifa/play");
      return;
    }
    toast("Questions will be added soon.", { icon: "ℹ️" });
  }, [hasPlayableContent, dismiss, navigate]);

  const goLeaderboard = useCallback(() => {
    dismiss();
    navigate("/fifa/leaderboard");
  }, [dismiss, navigate]);

  if (!mounted || !isActive) return null;

  const eyebrow = activeSlot
    ? `${activeSlot.title}${hasPlayableContent ? " · open now" : " · coming soon"}`
    : campaign.name || "FIFA WC 2026 Prediction Contest";

  const headline =
    teasers.length > 0
      ? teasers[teaserIdx]
      : campaign.name || "Predict. Compete. Top the leaderboard.";

  const subline = hasPlayableContent
    ? "Predict the matches before the slot closes and climb the leaderboard."
    : activeSlot
      ? "Questions will be added soon — check back shortly."
      : "The next game day opens soon — stay tuned.";

  const actionLabel = hasPlayableContent ? "Play now →" : "Learn more →";

  const modal = (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fifa-announcement-title"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
              aria-label="Close announcement"
              onClick={dismiss}
            />
            <motion.div
              key="fifa-announcement"
              className="relative z-[101] w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl"
              style={{
                background:
                  "linear-gradient(135deg, #1a7a3c 0%, #22a04a 40%, #1a7a3c 70%, #15612f 100%)",
              }}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative pitch stripes */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(255,255,255,0.8) 48px, rgba(255,255,255,0.8) 50px)",
                }}
              />
              <span
                className="absolute right-10 top-10 text-3xl opacity-20 fifa-banner-ball-float pointer-events-none select-none"
                aria-hidden
              >
                ⚽
              </span>

              <button
                type="button"
                onClick={dismiss}
                className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="relative p-6 sm:p-7">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  ⚽ {eyebrow}
                </span>

                <div className="mt-3 min-h-[4rem]">
                  <AnimatePresence mode="wait">
                    <motion.h2
                      id="fifa-announcement-title"
                      key={headline}
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -12, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-xl sm:text-2xl font-bold text-white drop-shadow pr-6"
                    >
                      {headline}
                    </motion.h2>
                  </AnimatePresence>
                </div>

                <p className="mt-1 text-sm text-white/80">{subline}</p>

                {activeSlot?.closesAt && !activeSlot.locked && (
                  <div className="mt-3">
                    <FifaSlotCountdown
                      closesAt={activeSlot.closesAt}
                      locked={activeSlot.locked}
                      variant="light"
                      layout="pill"
                    />
                  </div>
                )}

                <div className="mt-5">
                  <LeaderboardPreview onViewAll={goLeaderboard} />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={goPlay}
                    className="rounded-xl px-5 py-2 text-sm font-bold transition-all hover:scale-105 active:scale-95"
                    style={{ background: "#e0a431", color: "#1a1a1a" }}
                  >
                    {actionLabel}
                  </button>
                  <button
                    type="button"
                    onClick={goLeaderboard}
                    className="rounded-xl border border-white/40 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10"
                  >
                    View leaderboard →
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );

  return createPortal(modal, document.body);
}
