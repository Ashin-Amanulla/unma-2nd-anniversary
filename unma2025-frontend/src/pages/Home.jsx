import { Suspense, lazy } from "react";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  UserGroupIcon,
  GlobeAltIcon,
  SparklesIcon,
  CalendarDaysIcon,
  HeartIcon,
  AcademicCapIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";
import { SITE_CONTENT } from "../data/siteContent";
import { MEMBER_ASSOCIATIONS, getActiveAssociationsCount } from "../data/memberAssociations";
import { ACTIVITIES, getUpcomingActivities } from "../data/activities";
import { getRecentUpdates, getNews } from "../data/updates";

// Lazy load the Globe component for better performance
const GlobalVolunteerGlobe = lazy(() => import("../components/home/GlobalVolunteerGlobe"));

const Home = () => {
  const upcomingActivities = getUpcomingActivities().slice(0, 3);
  const associationsCount = getActiveAssociationsCount();
  const recentNews = getNews().slice(0, 3);

  const stats = [
    // { label: "Member Associations", value: associationsCount + "+", icon: UserGroupIcon },
    // { label: "Districts Covered", value: SITE_CONTENT.stats.districts, icon: GlobeAltIcon },
    // { label: "Joint Initiatives", value: SITE_CONTENT.stats.initiatives, icon: SparklesIcon },
    // { label: "Navodayans Connected", value: SITE_CONTENT.stats.members, icon: HeartIcon },
  ];

  return (
    <LazyMotion features={domAnimation}>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] pt-24 pb-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/jawahar-navodaya-alumni.avif)' }}
          ></div>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/85 via-primary/75 to-indigo-900/85 z-10"></div>
        </div>

        <div className="container relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 mb-8"
            >
              <span className="text-yellow-400">★</span>
              <span className="text-white font-medium">{SITE_CONTENT.name.full}</span>
              <span className="text-yellow-400">★</span>
            </motion.div>

            {/* Tagline */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              {SITE_CONTENT.tagline}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
            >
              Connecting Navodayan alumni across {SITE_CONTENT.coverage.regions.join(", ")} through collaboration, 
              knowledge sharing, and joint initiatives.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300"
              >
                Learn About UNMA
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-indigo-950 px-6 py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-pink-600 transition-all duration-300"
              >
                Upcoming Events
                <CalendarDaysIcon className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What is UNMA Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                About Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                What is <span className="text-primary">UNMA</span>?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* What We Are */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <SparklesIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">What We Are</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {SITE_CONTENT.about.whatWeAre}
                </p>
              </motion.div>

              {/* What We Are Not */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AcademicCapIcon className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">What We Are Not</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {SITE_CONTENT.about.whatWeAreNot}
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center mt-8"
            >
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                Learn more about our vision & principles
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Global Network & Stats Section - Combined */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-indigo-950 via-primary to-indigo-900 overflow-hidden">
        <div className="container">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-4">
              <GlobeAltIcon className="w-5 h-5 text-yellow-400" />
              <span className="text-white text-sm font-medium">Global Navodayan Network</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Spread Across <span className="text-yellow-400">All Continents</span>
            </h2>
            <p className="text-white/70 max-w-xl mx-auto">
              From Kerala to every corner of the world, Navodayan alumni are making an impact
            </p>
          </motion.div>

          {/* Globe Visualization with Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Suspense 
              fallback={
                <div className="flex items-center justify-center h-[600px]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin"></div>
                    <span className="text-white/60 text-sm">Loading globe...</span>
                  </div>
                </div>
              }
            >
              <GlobalVolunteerGlobe stats={stats} />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* Recent News Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              Latest News
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recent <span className="text-primary">Highlights</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest news and achievements from the Navodayan community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {recentNews.map((news, index) => (
              <motion.div
                key={news.id}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <NewspaperIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-500">{news.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {news.content}
                  </p>
                  {news.link && (
                    news.link.startsWith("http") ? (
                      <a
                        href={news.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:gap-2 transition-all"
                      >
                        Read more <ArrowRightIcon className="w-4 h-4" />
                      </a>
                    ) : (
                      <Link
                        to={news.link}
                        className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:gap-2 transition-all"
                      >
                        Learn more <ArrowRightIcon className="w-4 h-4" />
                      </Link>
                    )
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link
              to="/news-updates"
              className="inline-flex items-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all"
            >
              View All News & Updates
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Recent Activities Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
              Activities
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upcoming <span className="text-primary">Activities</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Joint initiatives and collaborative events organized with member associations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {upcomingActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="text-sm text-primary font-semibold mb-2">
                    {activity.date}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {activity.description}
                  </p>
                  {activity.registrationLink && (
                    <Link
                      to={activity.registrationLink}
                      className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:gap-2 transition-all"
                    >
                      Learn more <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link
              to="/news-updates"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all"
            >
              View News & Updates
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-20 bg-white">
        <div className="container">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Interested in Participating?
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              JNV alumni associations from Kerala, Mahe, and Lakshadweep are welcome to 
              connect with UNMA. Participation is entirely voluntary.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/membership"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all"
              >
                Learn About Membership
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all"
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </LazyMotion>
  );
};

export default Home;
