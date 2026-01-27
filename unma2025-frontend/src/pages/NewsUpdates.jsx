import { useState, useEffect } from "react";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRightIcon, BellIcon, EnvelopeIcon, CalendarDaysIcon, SparklesIcon } from "@heroicons/react/24/outline";
import updateApi from "../api/updateApi";
import { UPDATES_DATA, getUpdatesByCategory } from "../data/updates";
import Loading from "../components/ui/Loading";

const CATEGORIES = [
  { value: "all", label: "All", icon: BellIcon },
  { value: "news", label: "News", icon: BellIcon },
  { value: "announcement", label: "Announcements", icon: BellIcon },
  { value: "activity", label: "Activities", icon: CalendarDaysIcon },
  { value: "initiative", label: "Initiatives", icon: SparklesIcon },
];

const NewsUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [useStaticData, setUseStaticData] = useState(false);

  useEffect(() => {
    fetchUpdates();
  }, [selectedCategory]);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== "all" ? { category: selectedCategory } : {};
      const response = await updateApi.getUpdates(params);
      const data = response.data || [];
      
      if (data.length > 0) {
        setUpdates(data);
        setUseStaticData(false);
      } else {
        setUseStaticData(true);
      }
    } catch (error) {
      console.error("Failed to fetch updates:", error);
      setUseStaticData(true);
    } finally {
      setLoading(false);
    }
  };

  // Use static data as fallback
  const staticUpdates = useStaticData ? getUpdatesByCategory(selectedCategory) : [];
  const displayUpdates = useStaticData ? staticUpdates : updates;

  const getCategoryColor = (category) => {
    const colors = {
      news: "bg-blue-100 text-blue-700",
      announcement: "bg-purple-100 text-purple-700",
      activity: "bg-green-100 text-green-700",
      initiative: "bg-orange-100 text-orange-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      news: BellIcon,
      announcement: BellIcon,
      activity: CalendarDaysIcon,
      initiative: SparklesIcon,
    };
    return icons[category] || BellIcon;
  };

  const formatDate = (date) => {
    if (!date) return "";
    if (typeof date === "string" && !date.includes("T")) return date;
    return new Date(date).toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric",
      year: "numeric" 
    });
  };

  return (
    <LazyMotion features={domAnimation}>
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-950 via-primary to-indigo-900">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            News & Updates
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.1 }} 
            className="text-xl text-white/80"
          >
            Stay informed about UNMA activities, announcements, and initiatives
          </motion.p>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 bg-white border-b sticky top-16 z-10">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.value
                      ? "bg-primary text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Updates */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-4xl mx-auto">
          {loading ? (
            <Loading />
          ) : displayUpdates.length === 0 ? (
            <div className="text-center py-16">
              <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No updates found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayUpdates.map((update, idx) => {
                const Icon = getCategoryIcon(update.category);
                return (
                  <motion.div
                    key={update._id || update.id || idx}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-sm text-gray-500">{formatDate(update.date)}</span>
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${getCategoryColor(update.category)}`}>
                            {update.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">{update.title}</h3>
                        {update.content && (
                          <p className="text-gray-600 text-sm mb-3">{update.content}</p>
                        )}
                        {update.image && (
                          <img 
                            src={update.image} 
                            alt={update.title}
                            className="w-full max-w-md rounded-lg mb-3"
                          />
                        )}
                        {update.link && (
                          update.link.startsWith("http") ? (
                            <a 
                              href={update.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary text-sm font-semibold hover:gap-2 transition-all"
                            >
                              Read full article <ArrowRightIcon className="w-4 h-4" />
                            </a>
                          ) : (
                            <Link 
                              to={update.link} 
                              className="inline-flex items-center gap-1 text-primary text-sm font-semibold hover:gap-2 transition-all"
                            >
                              Learn more <ArrowRightIcon className="w-4 h-4" />
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
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
          <Link 
            to="/contact" 
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all"
          >
            Contact Us <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </LazyMotion>
  );
};

export default NewsUpdates;
