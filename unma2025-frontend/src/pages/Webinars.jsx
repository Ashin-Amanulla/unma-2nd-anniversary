import { motion, LazyMotion, domAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import {
  PlayCircleIcon,
  VideoCameraIcon,
  CalendarDaysIcon,
  UserIcon,
  ArrowRightIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { FEATURED_WEBINAR } from "../data/webinars";

const WEBINARS = [FEATURED_WEBINAR];

const Webinars = () => {
  return (
    <LazyMotion features={domAnimation}>
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-950 via-primary to-indigo-900">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-6">
              <VideoCameraIcon className="w-5 h-5 text-yellow-400" />
              <span className="text-white text-sm font-medium">Knowledge sharing</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              UNMA <span className="text-yellow-400">Webinars</span>
            </h1>
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              Recordings and highlights from live sessions for the Navodayan community — careers,
              design, and much more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="bg-white border-b border-gray-100 py-4">
        <div className="container flex flex-wrap justify-center gap-x-8 gap-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <VideoCameraIcon className="w-4 h-4 text-primary" />
            <span><strong className="text-gray-900">{WEBINARS.length}</strong> recording{WEBINARS.length !== 1 ? "s" : ""} available</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarDaysIcon className="w-4 h-4 text-primary" />
            <span>Latest: {FEATURED_WEBINAR.dateLabel}</span>
          </div>
        </div>
      </section>

      {/* Cards grid */}
      <section className="py-14 bg-gray-50">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {WEBINARS.map((webinar, index) => (
              <motion.article
                key={webinar.id}
                initial={{ y: 24, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden flex flex-col transition-shadow"
              >
                {/* Poster */}
                <div className="relative overflow-hidden bg-gray-100">
                  <img
                    src={webinar.posterSrc}
                    alt={webinar.posterAlt}
                    className="w-full h-72 object-cover object-top transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-gray-900 text-xs font-bold rounded-full shadow">
                    Recording
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {webinar.title}
                  </h2>

                  <div className="flex items-start gap-2 mb-1">
                    <UserIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-gray-800">{webinar.speaker}</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 pl-6 leading-relaxed">
                    {webinar.speakerRole}
                  </p>

                  <div className="flex items-center gap-2 mb-5">
                    <CalendarDaysIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-500">{webinar.dateLabel}</span>
                  </div>

                  <a
                    href={webinar.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 px-4 py-2.5 rounded-xl font-semibold text-sm hover:from-amber-600 hover:to-yellow-500 transition-all"
                  >
                    <PlayCircleIcon className="w-5 h-5" />
                    Watch recording
                  </a>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-gray-400 text-sm mt-10"
          >
            More webinars will appear here as they are announced.
          </motion.p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-white">
        <div className="container max-w-3xl mx-auto text-center">
          <EnvelopeIcon className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Want to suggest a topic?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Have an idea for a webinar or want to speak at an upcoming session? Reach out to us and
            let's collaborate.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all"
          >
            Contact Us
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </LazyMotion>
  );
};

export default Webinars;
