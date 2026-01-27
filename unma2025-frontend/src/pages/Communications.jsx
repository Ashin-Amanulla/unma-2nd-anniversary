import { useState, useEffect } from "react";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRightIcon, BellIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import newsApi from "../api/newsApi";
import Loading from "../components/ui/Loading";

// Static fallback data
const STATIC_UPDATES = [
  {
    id: 1,
    title: "Republic Day 2026 Registration Now Open",
    publishDate: "January 2026",
    category: "announcement",
    content: "Registration is now open for the UNMA 2nd Anniversary & 77th Republic Day Celebration on January 26, 2026.",
    link: "/republic-day-event",
  },
  {
    id: 2,
    title: "Career Portal Launch",
    publishDate: "January 2026",
    category: "announcement",
    content: "UNMA Career Portal will be launched during the Republic Day celebration to help Navodayans with job opportunities.",
    link: "/careers",
  },
  {
    id: 3,
    title: "Blood Donation Drive",
    publishDate: "January 2026",
    category: "initiative",
    content: "UNMA Blood Donation Drive in collaboration with Kerala Police Officers Association and IMA on Republic Day.",
    link: "/republic-day-event",
  },
];

const Communications = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsApi.getNews();
      const data = response.data || [];
      setUpdates(data.length > 0 ? data : STATIC_UPDATES);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setUpdates(STATIC_UPDATES);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      announcement: "bg-blue-100 text-blue-700",
      initiative: "bg-green-100 text-green-700",
      update: "bg-yellow-100 text-yellow-700",
      news: "bg-purple-100 text-purple-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (date) => {
    if (!date) return "";
    if (typeof date === "string" && !date.includes("T")) return date;
    return new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <LazyMotion features={domAnimation}>
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-950 via-primary to-indigo-900">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl md:text-5xl font-bold text-white mb-6">
            Communications
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-xl text-white/80">
            Updates, announcements, and news from UNMA
          </motion.p>
        </div>
      </section>

      {/* Updates */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Updates</h2>
          {loading ? (
            <Loading />
          ) : (
            <div className="space-y-4">
              {updates.map((update, idx) => (
                <motion.div
                  key={update._id || update.id || idx}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                      <BellIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-sm text-gray-500">{formatDate(update.publishDate)}</span>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getCategoryColor(update.category)}`}>
                          {update.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{update.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{update.content}</p>
                      {update.link && (
                        <Link to={update.link} className="inline-flex items-center gap-1 text-primary text-sm font-semibold hover:gap-2 transition-all">
                          Learn more <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Prompt */}
      <section className="py-16 bg-white">
        <div className="container max-w-3xl mx-auto text-center">
          <EnvelopeIcon className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Stay Connected</h2>
          <p className="text-gray-600 mb-8">For inquiries or to receive updates, reach out to us</p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all">
            Contact Us <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </LazyMotion>
  );
};

export default Communications;
