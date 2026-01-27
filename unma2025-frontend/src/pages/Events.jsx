import { useState, useEffect } from "react";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  CalendarDaysIcon, 
  ArrowRightIcon,
  MapPinIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  FlagIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid, StarIcon as StarSolid } from "@heroicons/react/24/solid";
import eventApi from "../api/eventApi";
import Loading from "../components/ui/Loading";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventApi.getEvents();
      setEvents(response.data || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      // Fallback to empty array on error
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  // Transform fetched events to match component structure
  const eventsData = events.map((event, index) => ({
    id: event._id || index + 1,
    year: event.year,
    title: event.title,
    date: event.date,
    fullDate: event.fullDate,
    description: event.description,
    location: event.location,
    attendees: event.attendees,
    status: event.status,
    category: event.category,
    link: event.link,
    highlights: event.highlights || [],
    isMilestone: event.isMilestone,
    isNext: event.isNext,
  }));

  // Fallback empty state
  if (!eventsData || eventsData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CalendarDaysIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Events Available</h2>
          <p className="text-gray-600">Check back soon for upcoming events.</p>
        </div>
      </div>
    );
  }

  // Group events by year
  const eventsByYear = eventsData.reduce((acc, event) => {
    if (!acc[event.year]) {
      acc[event.year] = [];
    }
    acc[event.year].push(event);
    return acc;
  }, {});

  // Reverse years and events within each year to show newest first
  const years = Object.keys(eventsByYear).sort().reverse();
  Object.keys(eventsByYear).forEach(year => {
    eventsByYear[year] = eventsByYear[year].reverse();
  });

  const getCategoryColor = (category) => {
    const colors = {
      Foundation: "from-amber-500 to-orange-600",
      Coordination: "from-blue-500 to-cyan-600",
      Summit: "from-purple-500 to-pink-600",
      Outreach: "from-green-500 to-emerald-600",
      Anniversary: "from-indigo-500 to-violet-600",
      Initiative: "from-rose-500 to-red-600",
    };
    return colors[category] || "from-gray-500 to-gray-600";
  };

  const getCategoryBg = (category) => {
    const colors = {
      Foundation: "bg-amber-50 text-amber-700 border-amber-200",
      Coordination: "bg-blue-50 text-blue-700 border-blue-200",
      Summit: "bg-purple-50 text-purple-700 border-purple-200",
      Outreach: "bg-green-50 text-green-700 border-green-200",
      Anniversary: "bg-indigo-50 text-indigo-700 border-indigo-200",
      Initiative: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return colors[category] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <LazyMotion features={domAnimation}>
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-indigo-950 via-primary to-indigo-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
          {/* Timeline decoration */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </div>

        <div className="container relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
          >
            <CalendarDaysIcon className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 30, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Our Journey
          </motion.h1>
          
          <motion.p 
            initial={{ y: 30, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.3 }} 
            className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto"
          >
            A timeline of moments that define UNMA's growth and impact
          </motion.p>

          {/* Stats */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 mt-10"
          >
            {[
              { value: eventsData.filter(e => e.status === "completed").length, label: "Events Completed" },
              { value: eventsData.filter(e => e.status === "upcoming").length, label: "Upcoming Events" },
              { value: "5000+", label: "Total Attendees" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1, y: { repeat: Infinity, duration: 2 } }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container max-w-6xl mx-auto px-4">
          {years.map((year, yearIdx) => (
            <div key={year} className="relative">
              {/* Year Marker */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 0.6 }}
                className="flex justify-center mb-12"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 rounded-2xl blur-lg opacity-30" />
                  <div className="relative bg-gradient-to-r from-primary to-indigo-600 text-white px-8 py-4 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-3">
                      <FlagIcon className="w-6 h-6" />
                      <span className="text-3xl font-bold">{year}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Events for this year */}
              <div className="relative">
                {/* Central timeline line - visible on larger screens */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-indigo-200 to-primary/30" />

                {eventsByYear[year].map((event, idx) => {
                  const isLeft = idx % 2 === 0;
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ 
                        x: isLeft ? -50 : 50, 
                        opacity: 0 
                      }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: idx * 0.1 }}
                      className="relative flex flex-col md:flex-row items-center mb-12"
                    >
                      {/* Date label - Left side */}
                      {isLeft && (
                        <div className="hidden md:block absolute left-0 w-[calc(50%-2rem)] pr-4">
                          <div className="flex flex-col items-end text-right">
                            <span className="text-xl font-bold text-gray-900 mb-1">{event.date}</span>
                            {event.isMilestone && (
                              <span className="text-xs text-amber-600 font-medium flex items-center gap-1 flex-row-reverse">
                                <StarSolid className="w-3 h-3" />
                                Milestone Event
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Content Card */}
                      <div className={`w-full md:w-5/12 ${isLeft ? "md:ml-auto md:pr-8 md:text-right" : "md:mr-auto md:pl-8 md:text-left"}`}>
                        <div 
                          className={`relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                            event.isNext ? "ring-2 ring-primary ring-offset-4" : ""
                          } ${event.isMilestone ? "border-l-4 border-l-primary" : ""}`}
                        >
                          {/* Upcoming banner */}
                          {event.isNext && (
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                              <span className="flex items-center gap-1">
                                <SparklesIcon className="w-3 h-3" />
                                NEXT EVENT
                              </span>
                            </div>
                          )}

                          {/* Category ribbon */}
                          <div className={`h-1.5 bg-gradient-to-r ${getCategoryColor(event.category)}`} />

                          <div className="p-6">
                            {/* Date - prominent on mobile */}
                            <div className="md:hidden mb-3">
                              <span className="text-lg font-bold text-gray-900">{event.date}</span>
                              {event.isMilestone && (
                                <span className="ml-2 text-xs text-amber-600 font-medium flex items-center gap-1">
                                  <StarSolid className="w-3 h-3" />
                                  Milestone
                                </span>
                              )}
                            </div>

                            {/* Meta info */}
                            <div className={`flex flex-wrap items-center gap-2 mb-3 ${isLeft ? "md:justify-end" : "md:justify-start"}`}>
                              <span className={`text-xs px-3 py-1 rounded-full border ${getCategoryBg(event.category)}`}>
                                {event.category}
                              </span>
                              <span className={`text-xs px-3 py-1 rounded-full ${
                                event.status === "upcoming"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                {event.status === "upcoming" ? (
                                  <span className="flex items-center gap-1">
                                    <ClockIcon className="w-3 h-3" />
                                    Upcoming
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <CheckCircleIcon className="w-3 h-3" />
                                    Completed
                                  </span>
                                )}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                              {event.isMilestone && <StarSolid className="inline w-5 h-5 text-amber-500 mr-1" />}
                              {event.title}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                              {event.description}
                            </p>

                            {/* Event details */}
                            <div className={`flex flex-wrap gap-4 text-sm text-gray-500 mb-4 ${isLeft ? "md:justify-end" : "md:justify-start"}`}>
                              <span className="flex items-center gap-1">
                                <CalendarDaysIcon className="w-4 h-4 text-primary" />
                                {event.fullDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPinIcon className="w-4 h-4 text-primary" />
                                {event.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <UserGroupIcon className="w-4 h-4 text-primary" />
                                {event.attendees}
                              </span>
                            </div>

                            {/* Highlights */}
                            {event.highlights && (
                              <div className={`space-y-1 mb-4 ${isLeft ? "md:text-right" : "md:text-left"}`}>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Highlights</p>
                                {event.highlights.slice(0, 3).map((highlight, hIdx) => (
                                  <div 
                                    key={hIdx} 
                                    className={`flex items-center gap-2 text-sm text-gray-600 ${isLeft ? "md:justify-end" : "md:justify-start"}`}
                                  >
                                    {!isLeft && <CheckCircleSolid className="w-4 h-4 text-green-500 flex-shrink-0" />}
                                    <span>{highlight}</span>
                                    {isLeft && <CheckCircleSolid className="w-4 h-4 text-green-500 flex-shrink-0" />}
                                  </div>
                                ))}
                                {event.highlights.length > 3 && (
                                  <p className="text-xs text-gray-400">+{event.highlights.length - 3} more</p>
                                )}
                              </div>
                            )}

                            {/* Action button */}
                            {event.link && (
                              <Link 
                                to={event.link}
                                className={`inline-flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all ${
                                  isLeft ? "md:ml-auto" : ""
                                }`}
                              >
                                View Details
                                <ArrowRightIcon className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Date label - Right side */}
                      {!isLeft && (
                        <div className="hidden md:block absolute right-0 w-[calc(50%-2rem)] pl-4">
                          <div className="flex flex-col items-start text-left">
                            <span className="text-xl font-bold text-gray-900 mb-1">{event.date}</span>
                            {event.isMilestone && (
                              <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                <StarSolid className="w-3 h-3" />
                                Milestone Event
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Year divider */}
              {yearIdx < years.length - 1 && (
                <div className="flex justify-center my-8">
                  <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>
              )}
            </div>
          ))}

          {/* Future indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mt-12"
          >
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <div className="w-0.5 h-12 bg-gradient-to-b from-gray-300 to-transparent" />
              <span className="text-sm font-medium">More events coming soon...</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Legend */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: <StarSolid className="w-5 h-5 text-amber-500" />, label: "Milestone Event" },
              { icon: <CheckCircleSolid className="w-5 h-5 text-gray-500" />, label: "Completed" },
              { icon: <ClockIcon className="w-5 h-5 text-primary" />, label: "Upcoming" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-indigo-800 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative max-w-3xl mx-auto text-center px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <SparklesIcon className="w-12 h-12 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Be Part of Our Journey
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Stay connected with UNMA events and be part of the growing Navodayan community in Kerala
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/news-updates" 
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
              >
                News & Updates
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link 
                to="/about-unma" 
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border border-white/20 hover:bg-white/20 hover:scale-105 transition-all"
              >
                Learn About UNMA
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </LazyMotion>
  );
};

export default Events;
