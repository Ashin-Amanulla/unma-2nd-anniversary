import { useEffect, useState } from "react";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CalendarDaysIcon,
  ArrowRightIcon,
  SparklesIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import webinarApi from "../api/webinarApi";
import Loading from "../components/ui/Loading";

const Webinars = () => {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await webinarApi.getWebinars();
        if (!cancelled) setWebinars(res?.data ?? []);
      } catch {
        if (!cancelled) setWebinars([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = webinars[0] ?? null;
  const rest = webinars.slice(1);
  const latestLabel = featured?.dateLabel ?? "—";

  if (loading) {
    return (
      <div className="pt-28 pb-24 flex justify-center bg-gray-50 min-h-[50vh]">
        <Loading />
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary via-indigo-600 to-indigo-900 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 40%, white 0%, transparent 40%), radial-gradient(circle at 85% 70%, white 0%, transparent 35%)",
          }}
        />
        <div className="container max-w-6xl relative">
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                <VideoCameraIcon className="w-3.5 h-3.5" />
                UNMA Webinars
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-amber-950">
                <SparklesIcon className="w-3.5 h-3.5" />
                For Navodayans
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl">
              Inspiring sessions for students &amp; alumni
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/85 max-w-2xl">
              Join live, ask questions, and catch up anytime with recordings — knowledge sharing
              across the Navodayan community.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
              <span>{webinars.length} session{webinars.length === 1 ? "" : "s"}</span>
              <span>Latest: {latestLabel}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {featured?.posterUrl ? (
        <section className="py-10 md:py-14 bg-indigo-50/50 border-b border-indigo-100">
          <div className="container max-w-6xl">
            <motion.article
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-xl md:flex"
            >
              <div className="md:w-[48%] shrink-0">
                <img
                  src={featured.posterUrl}
                  alt={featured.posterAlt || featured.title}
                  className="w-full h-full object-cover min-h-[240px] md:min-h-[400px]"
                  loading="eager"
                />
              </div>
              <div className="p-6 md:p-10 flex flex-col justify-center flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-primary mb-2">
                  Featured · {featured.dateLabel || "Latest"}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
                  {featured.title}
                </h2>
                {featured.speaker ? (
                  <p className="text-lg font-medium text-gray-700 mt-2">{featured.speaker}</p>
                ) : null}
                {featured.speakerRole ? (
                  <p className="text-sm text-gray-500 mt-1">{featured.speakerRole}</p>
                ) : null}
                {featured.description ? (
                  <p className="text-sm text-gray-600 mt-4 leading-relaxed">{featured.description}</p>
                ) : null}
                <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
                  {featured.registrationUrl ? (
                    <a
                      href={featured.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark shadow-md shadow-primary/20 transition-all"
                    >
                      Register & join
                      <ArrowRightIcon className="w-4 h-4" />
                    </a>
                  ) : null}
                  {featured.recordingUrl ? (
                    <a
                      href={featured.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 px-6 py-3 text-sm font-semibold text-gray-800 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                    >
                      Watch recording
                    </a>
                  ) : null}
                </div>
              </div>
            </motion.article>
          </div>
        </section>
      ) : null}

      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container max-w-6xl">
          {webinars.length === 0 ? (
            <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-gray-300 bg-white">
              <VideoCameraIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900">Webinars on the way</p>
              <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                New sessions will appear here as they are published. Follow UNMA for announcements.
              </p>
            </div>
          ) : rest.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">
              More sessions will be added to the catalog soon.
            </p>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-8">More sessions</h2>
              <div className="grid gap-8 md:grid-cols-2">
                {rest.map((webinar, index) => (
                  <motion.article
                    key={webinar._id}
                    initial={{ y: 12, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="aspect-[16/10] overflow-hidden border-b border-gray-100">
                      <img
                        src={webinar.posterUrl}
                        alt={webinar.posterAlt || webinar.title}
                        className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-5 flex flex-col flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{webinar.title}</h3>

                      {webinar.speaker ? (
                        <p className="text-sm text-gray-600 mt-1 font-medium">{webinar.speaker}</p>
                      ) : null}
                      {webinar.speakerRole ? (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{webinar.speakerRole}</p>
                      ) : null}

                      {webinar.dateLabel ? (
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                          <CalendarDaysIcon className="w-3.5 h-3.5 shrink-0" />
                          {webinar.dateLabel}
                        </p>
                      ) : null}

                      {webinar.description ? (
                        <p className="text-sm text-gray-500 mt-3 line-clamp-3 flex-1">
                          {webinar.description}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                        {webinar.registrationUrl ? (
                          <a
                            href={webinar.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                          >
                            Register
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                          </a>
                        ) : null}
                        {webinar.recordingUrl ? (
                          <a
                            href={webinar.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gray-700 hover:text-primary transition-colors"
                          >
                            Watch recording
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="py-14 bg-white border-t border-gray-100">
        <div className="container max-w-6xl">
          <div className="rounded-2xl bg-gradient-to-r from-primary/5 to-indigo-50 border border-indigo-100 p-8 md:p-10 md:flex md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Suggest a topic or volunteer to speak</h2>
              <p className="text-sm text-gray-600 mt-2 max-w-lg">
                Have an idea for a webinar or want to share your expertise with fellow Navodayans?
                We&apos;d love to hear from you.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
            >
              Contact UNMA
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
};

export default Webinars;
