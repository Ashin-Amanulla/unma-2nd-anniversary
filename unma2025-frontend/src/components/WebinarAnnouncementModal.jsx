import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { XMarkIcon, VideoCameraIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { WEBINAR_ANNOUNCEMENT_SESSION_KEY } from "../data/webinars";
import webinarApi from "../api/webinarApi";

const OPEN_DELAY_MS = 800;

const WebinarAnnouncementModal = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [featured, setFeatured] = useState(null);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(WEBINAR_ANNOUNCEMENT_SESSION_KEY, "1");
    } catch {
      // ignore
    }
    setIsOpen(false);
  }, []);

  const goToWebinars = useCallback(() => {
    dismiss();
    navigate("/webinars");
  }, [dismiss, navigate]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await webinarApi.getRecentWebinar();
        if (cancelled) return;
        const item = res?.data ?? null;
        setFeatured(item);
      } catch {
        if (!cancelled) setFeatured(null);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let timerId;

    const run = () => {
      if (!featured?.posterUrl) return;
      try {
        if (sessionStorage.getItem(WEBINAR_ANNOUNCEMENT_SESSION_KEY)) {
          return;
        }
      } catch {
        // ignore
      }
      timerId = window.setTimeout(() => {
        setIsOpen(true);
      }, OPEN_DELAY_MS);
    };

    run();

    return () => {
      if (timerId) window.clearTimeout(timerId);
    };
  }, [featured]);

  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mounted, isOpen]);

  if (!mounted || !featured?.posterUrl) return null;

  const primaryHref = featured.registrationUrl || featured.recordingUrl;
  const primaryLabel = featured.registrationUrl
    ? "Register & join live"
    : featured.recordingUrl
      ? "Watch the recording"
      : "Explore webinars";

  const modal = (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="webinar-announcement-title"
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-indigo-950/70 backdrop-blur-sm"
              aria-label="Close announcement"
              onClick={dismiss}
            />
            <motion.div
              key="webinar-announcement"
              className="relative z-[101] w-full max-w-2xl lg:max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-white/20"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 px-5 py-4 sm:px-6 sm:py-5">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 50%, white 0%, transparent 45%), radial-gradient(circle at 80% 20%, white 0%, transparent 35%)",
                  }}
                />
                <button
                  type="button"
                  onClick={dismiss}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
                <div className="relative flex flex-wrap items-center gap-2 pr-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Don&apos;t miss this
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-amber-950">
                    <VideoCameraIcon className="w-3.5 h-3.5" />
                    UNMA Webinar
                  </span>
                </div>
                <p className="relative mt-3 text-sm sm:text-base text-white/90 font-medium max-w-xl">
                  Learn, connect, and grow with fellow Navodayans — live sessions and recordings for
                  students &amp; alumni.
                </p>
              </div>

              <div className="md:flex md:items-stretch">
                <button
                  type="button"
                  onClick={goToWebinars}
                  className="md:w-[45%] shrink-0 text-left block w-full"
                >
                  <div className="overflow-hidden border-b md:border-b-0 md:border-r border-gray-100">
                    <img
                      src={featured.posterUrl}
                      alt={featured.posterAlt || featured.title || "Webinar poster"}
                      className="w-full h-auto object-cover max-h-[280px] md:max-h-none md:min-h-[320px] md:h-full"
                      loading="eager"
                    />
                  </div>
                </button>

                <div className="p-5 sm:p-7 md:flex-1 flex flex-col justify-center">
                  {featured.dateLabel ? (
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                      {featured.dateLabel}
                    </p>
                  ) : null}
                  <h2
                    id="webinar-announcement-title"
                    className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight"
                  >
                    {featured.title}
                  </h2>
                  {featured.speaker ? (
                    <p className="text-base text-gray-700 mt-2 font-medium">{featured.speaker}</p>
                  ) : null}
                  {featured.speakerRole ? (
                    <p className="text-sm text-gray-500 mt-1">{featured.speakerRole}</p>
                  ) : null}
                  {featured.description ? (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-3">{featured.description}</p>
                  ) : null}

                  <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
                    {primaryHref ? (
                      <a
                        href={primaryHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {primaryLabel}
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={goToWebinars}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-800 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    >
                      See all webinars
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    {featured.recordingUrl && featured.registrationUrl ? (
                      <a
                        href={featured.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-600 hover:text-primary font-medium underline-offset-2 hover:underline"
                      >
                        Watch recording
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );

  return createPortal(modal, document.body);
};

export default WebinarAnnouncementModal;
