import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon, CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

const Program = () => {
  const scheduleData = {
    morning: [
      { time: "8:30 AM – 9:00 AM", event: "Meet & Greet" },
      { time: "9:00 AM – 9:30 AM", event: "Walkathon from venue singing patriotic songs" },
      { time: "9:30 AM – 10:30 AM", event: "Light snacks and assembling at venue" },
      { time: "10:30 AM – 11:30 AM", event: "Public Function" },
      { time: "11:30 AM – 12:30 PM", event: "BLS and Health Awareness Sessions" },
      { time: "12:30 PM", event: "Group Photo Session" },
      { time: "1:00 PM – 2:00 PM", event: "Lunch" },
    ],
    afternoon: [
      { time: "2:00 PM – 3:00 PM", event: "Fun Time" },
      { time: "3:00 PM – 4:00 PM", event: "Ask Our Doctors (interactive session)" },
      { time: "4:00 PM", event: "Tea & Snacks" },
      { time: "4:00 PM – 6:30 PM", event: "Boat Ride" },
    ],
  };

  useEffect(() => {
    document.title = "Program - UNMA 2025";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "View the program and agenda for UNMA 2nd Anniversary & 77th Republic Day Celebration. See the schedule of events including boating, blood donation drive, and other activities."
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Program
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            UNMA 2nd Anniversary & 77th Republic Day Celebration
          </p>
          <p className="text-md text-gray-500 mt-2">
            Sunday, January 26, 2026 | T. K. Ramakrishnan Samskarika Kendram, Ernakulam
          </p>
        </motion.div>

        {/* Blood Donation Drive Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-pink-600 rounded-2xl shadow-xl border-2 border-red-400/50 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-3xl animate-pulse">🩸</span>
                <h3 className="text-2xl md:text-3xl font-bold text-white text-center">
                  Blood Donation Drive
                </h3>
                <span className="text-3xl animate-pulse">🩸</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/30">
                <p className="text-lg md:text-xl text-white font-semibold text-center leading-relaxed">
                  <span className="font-bold text-yellow-300">UNMA Blood Donation Drive</span>
                  <br />
                  <span className="text-white/95">
                    in collaboration with the Kerala Police Officers Association and Indian Medical Association
                  </span>
                  <br />
                  <span className="text-yellow-200 font-bold mt-2 inline-block">
                    8:30 AM to 5:30 PM
                  </span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Program Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Morning Session */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6 pb-3 border-b">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClockIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">
                Morning Session
              </h3>
            </div>
            <div className="space-y-3">
              {scheduleData.morning.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex flex-col md:flex-row md:items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="font-semibold text-primary min-w-[200px]">
                    {item.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRightIcon className="w-4 h-4 text-gray-400 hidden md:block" />
                    <span className="text-gray-700">{item.event}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Afternoon Session */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6 pb-3 border-b">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClockIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">
                Afternoon Session
              </h3>
            </div>
            <div className="space-y-3">
              {scheduleData.afternoon.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  className={`flex flex-col md:flex-row md:items-center gap-2 p-4 rounded-lg transition-colors ${
                    item.event.includes("Boat Ride")
                      ? "bg-blue-50 hover:bg-blue-100 border-2 border-blue-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="font-semibold text-primary min-w-[200px]">
                    {item.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRightIcon className="w-4 h-4 text-gray-400 hidden md:block" />
                    <span className="text-gray-700 font-medium">
                      {item.event}
                      {item.event.includes("Boat Ride") && (
                        <span className="ml-2 text-blue-600">🚤</span>
                      )}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Program;
