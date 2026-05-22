import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { WEBINAR_ANNOUNCEMENT_SESSION_KEY } from "../data/webinars";
import webinarApi from "../api/webinarApi";

const OPEN_DELAY_MS = 1000;

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
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
              aria-label="Close announcement"
              onClick={dismiss}
            />
            <motion.div
              key="webinar-announcement"
              className="relative z-[101] w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-lg border border-gray-200"
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 4 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={dismiss}
                className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={goToWebinars}
                className="w-full text-left"
              >
                <div className="overflow-hidden border-b border-gray-100">
                  <img
                    src={featured.posterUrl}
                    alt={featured.posterAlt || featured.title || "Webinar poster"}
                    className="w-full h-auto object-cover"
                    loading="eager"
                  />
                </div>

                <div className="p-4 pt-3">
                  <p className="text-xs text-gray-400 mb-1">Webinar</p>
                  <h2
                    id="webinar-announcement-title"
                    className="text-base font-medium text-gray-900 pr-6"
                  >
                    {featured.title}
                  </h2>
                  {featured.speaker ? (
                    <p className="text-sm text-gray-600 mt-1">{featured.speaker}</p>
                  ) : null}
                  {featured.dateLabel ? (
                    <p className="text-xs text-gray-400 mt-2">{featured.dateLabel}</p>
                  ) : null}
                </div>
              </button>

              <div className="px-4 pb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm border-t border-gray-100 pt-3">
                {featured.recordingUrl ? (
                  <a
                    href={featured.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-700 hover:text-primary transition-colors"
                  >
                    Watch recording
                  </a>
                ) : null}
                {featured.recordingUrl && featured.registrationUrl ? (
                  <span className="text-gray-300" aria-hidden="true">
                    ·
                  </span>
                ) : null}
                {featured.registrationUrl ? (
                  <a
                    href={featured.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-700 hover:text-primary transition-colors"
                  >
                    Register / join link
                  </a>
                ) : null}
                {(featured.recordingUrl || featured.registrationUrl) ? (
                  <span className="text-gray-300" aria-hidden="true">
                    ·
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={goToWebinars}
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  All webinars
                </button>
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
