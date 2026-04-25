import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { XMarkIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import {
  FEATURED_WEBINAR,
  WEBINAR_ANNOUNCEMENT_SESSION_KEY,
} from "../data/webinars";

const OPEN_DELAY_MS = 1000;

const WebinarAnnouncementModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(WEBINAR_ANNOUNCEMENT_SESSION_KEY, "1");
    } catch {
      // ignore
    }
    setIsOpen(false);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timerId;

    const run = () => {
      try {
        if (sessionStorage.getItem(WEBINAR_ANNOUNCEMENT_SESSION_KEY)) {
          return;
        }
      } catch {
        // ignore
      }
      timerId = window.setTimeout(() => {
        if (!cancelled) setIsOpen(true);
      }, OPEN_DELAY_MS);
    };

    run();

    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

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

  if (!mounted) return null;

  const modal = (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="webinar-announcement-title"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-label="Close announcement"
              onClick={dismiss}
            />
            <motion.div
              key="webinar-announcement"
              className="relative z-[101] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-100"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={dismiss}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-gray-900/80 text-white hover:bg-gray-900 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="p-4 pt-12 sm:p-6 sm:pt-14">
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner mb-4">
                  <img
                    src={FEATURED_WEBINAR.posterSrc}
                    alt={FEATURED_WEBINAR.posterAlt}
                    className="w-full h-auto object-cover"
                    loading="eager"
                  />
                </div>

                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold mb-3">
                  UNMA Webinar
                </span>
                <h2
                  id="webinar-announcement-title"
                  className="text-xl sm:text-2xl font-bold text-gray-900 mb-2"
                >
                  {FEATURED_WEBINAR.title}
                </h2>
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  {FEATURED_WEBINAR.speaker}
                </p>
                <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                  {FEATURED_WEBINAR.speakerRole}
                </p>
                <p className="text-sm text-gray-500 mb-6">{FEATURED_WEBINAR.dateLabel}</p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={FEATURED_WEBINAR.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 px-4 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all"
                  >
                    <PlayCircleIcon className="w-6 h-6 shrink-0" />
                    Watch recording
                  </a>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="inline-flex flex-1 items-center justify-center px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Close
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
};

export default WebinarAnnouncementModal;
