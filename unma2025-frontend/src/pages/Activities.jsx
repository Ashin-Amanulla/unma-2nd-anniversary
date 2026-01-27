import { useState, useEffect } from "react";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRightIcon, CalendarDaysIcon, MapPinIcon } from "@heroicons/react/24/outline";
import activityApi from "../api/activityApi";
import { ACTIVITY_CATEGORIES, getUpcomingActivities, getCompletedActivities } from "../data/activities";
import Loading from "../components/ui/Loading";

const Activities = () => {
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useStaticData, setUseStaticData] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await activityApi.getActivities();
      const activities = response.data || [];
      
      if (activities.length > 0) {
        setUpcoming(activities.filter(a => a.status === "upcoming" || a.status === "ongoing"));
        setCompleted(activities.filter(a => a.status === "completed"));
      } else {
        setUseStaticData(true);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      setUseStaticData(true);
    } finally {
      setLoading(false);
    }
  };

  // Use static data as fallback
  const staticUpcoming = useStaticData ? getUpcomingActivities() : [];
  const staticCompleted = useStaticData ? getCompletedActivities() : [];
  
  const displayUpcoming = useStaticData ? staticUpcoming : upcoming;
  const displayCompleted = useStaticData ? staticCompleted : completed;

  return (
    <LazyMotion features={domAnimation}>
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-950 via-primary to-indigo-900">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl md:text-5xl font-bold text-white mb-6">
            Activities & Initiatives
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-xl text-white/80">
            Collaborative initiatives organized with member associations
          </motion.p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white border-b">
        <div className="container max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {ACTIVITY_CATEGORIES.map((cat) => (
              <span key={cat.id} className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-700">{cat.name}</span>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="py-16"><Loading /></div>
      ) : (
        <>
          {/* Upcoming Activities */}
          <section className="py-16 bg-gray-50">
            <div className="container max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Upcoming Activities</h2>
              {displayUpcoming.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming activities at the moment.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {displayUpcoming.map((activity, idx) => (
                    <motion.div
                      key={activity._id || activity.id || idx}
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      className="bg-white p-6 rounded-2xl shadow-lg"
                    >
                      <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-3">
                        <CalendarDaysIcon className="w-4 h-4" />
                        {activity.date}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{activity.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{activity.description}</p>
                      {activity.location && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                          <MapPinIcon className="w-4 h-4" />
                          {activity.location}
                        </div>
                      )}
                      {activity.registrationLink && (
                        <Link to={activity.registrationLink} className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:gap-2 transition-all">
                          Learn more <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Completed Activities */}
          {displayCompleted.length > 0 && (
            <section className="py-16 bg-white">
              <div className="container max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Past Activities</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {displayCompleted.map((activity, idx) => (
                    <div key={activity._id || activity.id || idx} className="bg-gray-50 p-6 rounded-xl">
                      <div className="text-gray-500 text-sm mb-2">{activity.date}</div>
                      <h3 className="font-bold text-gray-900 mb-2">{activity.title}</h3>
                      <p className="text-gray-600 text-sm">{activity.description}</p>
                      {activity.galleryLink && (
                        <Link to={activity.galleryLink} className="inline-flex items-center gap-1 text-primary text-sm mt-3 hover:gap-2 transition-all">
                          View Gallery <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-indigo-900">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Next Event</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/events" className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all">
              View Events <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
};

export default Activities;
