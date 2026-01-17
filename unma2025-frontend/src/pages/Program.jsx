import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon, CalendarIcon, ClockIcon, GiftIcon, SparklesIcon } from "@heroicons/react/24/outline";

const Program = () => {
  const scheduleData = {
    morning: [
      { time: "8:30 AM – 9:00 AM", event: "Meet & Greet" },
      { time: "9:00 AM – 9:30 AM", event: "Walkathon from venue singing patriotic songs" },
      { time: "9:30 AM – 10:30 AM", event: "Light snacks and assembling at venue" },
      { time: "10:30 AM – 11:30 AM", event: "Public Function" },
      { time: "11:30 AM", event: "Lucky Draw - Morning Session 🎁", isLuckyDraw: true },
      { time: "11:30 AM – 12:30 PM", event: "BLS and Health Awareness Sessions" },
      { time: "12:30 PM", event: "Group Photo Session" },
      { time: "1:00 PM – 2:00 PM", event: "Lunch" },
    ],
    afternoon: [
      { time: "2:00 PM – 3:00 PM", event: "Fun Time" },
      { time: "3:00 PM", event: "Lucky Draw - Afternoon Session 🎁", isLuckyDraw: true },
      { time: "3:00 PM – 4:00 PM", event: "Ask Our Doctors (interactive session)" },
      { time: "4:00 PM", event: "Tea & Snacks" },
      { time: "4:00 PM – 6:30 PM", event: "Boat Ride" },
      { time: "6:30 PM", event: "Lucky Draw - Evening Session 🎁", isLuckyDraw: true },
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 pt-24 pb-16 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-200/20 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200/20 rounded-full mix-blend-multiply filter blur-xl animate-float-delay"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-200/20 rounded-full mix-blend-multiply filter blur-xl animate-float-slow"></div>
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-yellow-200/20 rounded-full mix-blend-multiply filter blur-xl animate-float-delay-slow"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
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

        {/* Lucky Draw Highlight Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-600 rounded-2xl shadow-2xl border-2 border-yellow-300/50 p-8 md:p-10 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            {/* Floating gift icons */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-white/30"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                >
                  <GiftIcon className="w-8 h-8" />
                </motion.div>
              ))}
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <GiftIcon className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-3xl md:text-4xl font-bold text-white text-center">
                  Exciting Lucky Draws!
                </h3>
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <SparklesIcon className="w-10 h-10 text-white" />
                </motion.div>
              </div>
              
              <div className="bg-white/25 backdrop-blur-sm rounded-xl p-6 border border-white/40 mb-6">
                <p className="text-xl md:text-2xl text-white font-bold text-center leading-relaxed">
                  Win Fabulous Prizes Throughout the Day!
                </p>
              </div>

              {/* Three Lucky Draw Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { session: "Morning", time: "11:30 AM", detail: "After Public Function" },
                  { session: "Afternoon", time: "3:00 PM", detail: "During Fun Time" },
                  { session: "Evening", time: "6:30 PM", detail: "After Boat Ride" },
                ].map((draw, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="bg-white rounded-xl p-5 shadow-lg border-2 border-yellow-200 relative overflow-hidden group cursor-pointer"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-center mb-3">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            delay: index * 0.3
                          }}
                        >
                          <GiftIcon className="w-12 h-12 text-orange-500" />
                        </motion.div>
                      </div>
                      <h4 className="text-xl font-bold text-gray-800 text-center mb-2">
                        {draw.session} Draw
                      </h4>
                      <p className="text-2xl font-bold text-orange-600 text-center mb-1">
                        {draw.time}
                      </p>
                      <p className="text-sm text-gray-600 text-center">
                        {draw.detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-center"
              >
                <p className="text-white text-lg font-semibold">
                  🌟 Don't miss your chance to win amazing prizes! 🌟
                </p>
              </motion.div>
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
                    item.isLuckyDraw
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 border-2 border-yellow-300"
                      : item.event.includes("Boat Ride")
                      ? "bg-blue-50 hover:bg-blue-100 border-2 border-blue-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="font-semibold text-primary min-w-[200px]">
                    {item.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRightIcon className="w-4 h-4 text-gray-400 hidden md:block" />
                    <span className={`font-medium ${
                      item.isLuckyDraw ? "text-orange-700 font-bold" : "text-gray-700"
                    }`}>
                      {item.event}
                      {item.event.includes("Boat Ride") && (
                        <span className="ml-2 text-blue-600">🚤</span>
                      )}
                      {item.isLuckyDraw && (
                        <motion.span
                          className="ml-2"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          ✨
                        </motion.span>
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
