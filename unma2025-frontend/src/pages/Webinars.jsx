import { useEffect, useState } from "react";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import { CalendarDaysIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
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

  const latestLabel = webinars[0]?.dateLabel ?? "—";

  if (loading) {
    return (
      <div className="pt-28 pb-24 flex justify-center bg-gray-50 min-h-[50vh]">
        <Loading />
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <section className="pt-24 pb-10 bg-white border-b border-gray-100">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Webinars</h1>
            <p className="mt-2 text-sm text-gray-500 max-w-lg">
              Recordings and highlights from live sessions for the Navodayan community.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
              <span>
                {webinars.length} listed
              </span>
              <span>Latest: {latestLabel}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container max-w-3xl">
          {webinars.length === 0 ? (
            <p className="text-sm text-gray-500 py-12">
              Webinars will appear here as they are published.
            </p>
          ) : (
            <div className="space-y-8">
              {webinars.map((webinar, index) => (
                <motion.article
                  key={webinar._id}
                  initial={{ y: 12, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white md:flex"
                >
                  <div className="md:w-44 shrink-0 border-b md:border-b-0 md:border-r border-gray-100">
                    <img
                      src={webinar.posterUrl}
                      alt={webinar.posterAlt || webinar.title}
                      className="w-full h-48 md:h-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-5 flex flex-col flex-1 min-w-0">
                    <h2 className="text-base font-medium text-gray-900 line-clamp-2">
                      {webinar.title}
                    </h2>

                    {webinar.speaker ? (
                      <p className="text-sm text-gray-600 mt-1">{webinar.speaker}</p>
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
                      <p className="text-sm text-gray-500 mt-3 line-clamp-2">{webinar.description}</p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                      {webinar.recordingUrl ? (
                        <a
                          href={webinar.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-primary transition-colors"
                        >
                          Watch recording
                        </a>
                      ) : null}
                      {webinar.recordingUrl && webinar.registrationUrl ? (
                        <span className="text-gray-300" aria-hidden="true">
                          ·
                        </span>
                      ) : null}
                      {webinar.registrationUrl ? (
                        <a
                          href={webinar.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-primary transition-colors"
                        >
                          Register / join link
                        </a>
                      ) : null}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container max-w-3xl text-left">
          <h2 className="text-base font-medium text-gray-900">Suggest a topic</h2>
          <p className="text-sm text-gray-500 mt-1 mb-4 max-w-md">
            Have an idea for a webinar or want to speak at an upcoming session?
          </p>
          <Link
            to="/contact"
            className="text-sm text-gray-600 hover:text-primary transition-colors"
          >
            Contact us
          </Link>
        </div>
      </section>
    </LazyMotion>
  );
};

export default Webinars;
