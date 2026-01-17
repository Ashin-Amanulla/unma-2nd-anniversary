import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2026-01-26T08:30:00");

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-flow-col gap-4 md:gap-6 text-center auto-cols-max mx-auto">
      {[
        { value: timeLeft.days, label: "Days" },
        { value: timeLeft.hours, label: "Hours" },
        { value: timeLeft.minutes, label: "Minutes" },
        { value: timeLeft.seconds, label: "Seconds" },
      ].map((item, index) => (
        <div
          key={index}
          className="flex flex-col p-2 md:p-4 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 shadow-lg"
        >
          <span className="countdown font-mono text-3xl md:text-5xl lg:text-6xl font-bold text-white">
            {item.value.toString().padStart(2, "0")}
          </span>
          <span className="text-xs md:text-sm lg:text-lg text-white/80 mt-1 md:mt-2">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const Home = () => {
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

  return (
    <LazyMotion features={domAnimation}>
      <div className="bg-gradient-to-b from-indigo-950 via-primary to-indigo-900">
        {/* Hero Section */}
        <section className="relative min-h-screen pt-16 pb-16">
          {/* Animated shapes background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/80 via-primary/60 to-indigo-900/80 z-10"></div>

            {/* Animated shapes */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
              <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400/10 rounded-full mix-blend-overlay filter blur-xl animate-float"></div>
              <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-overlay filter blur-xl animate-float-delay"></div>
              <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full mix-blend-overlay filter blur-xl animate-float-slow"></div>
              <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-overlay filter blur-xl animate-float-delay-slow"></div>
            </div>

            {/* Confetti effect */}
            <div className="absolute inset-0 z-20">
              {Array(20)
                .fill()
                .map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-8 bg-white/20 rounded-full`}
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      transform: `rotate(${Math.random() * 360}deg)`,
                      opacity: Math.random() * 0.5 + 0.3,
                      animation: `float ${
                        Math.random() * 10 + 15
                      }s linear infinite`,
                    }}
                  ></div>
                ))}
              {Array(30)
                .fill()
                .map((_, i) => (
                  <div
                    key={i + 100}
                    className={`absolute w-2 h-2 rounded-full`}
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      backgroundColor: [
                        "#FFDD00",
                        "#FF2E63",
                        "#3DB2FF",
                        "#3FEEE6",
                        "#FC5C9C",
                      ][Math.floor(Math.random() * 5)],
                      opacity: Math.random() * 0.5 + 0.3,
                      animation: `float ${
                        Math.random() * 10 + 10
                      }s linear infinite`,
                    }}
                  ></div>
                ))}
            </div>
          </div>

          {/* Content */}
          <div className="container relative z-30">
            <div className="max-w-7xl mx-auto">
              {/* Event Badge */}
              <div className="flex justify-center mb-8">
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-white/20 shadow-xl inline-flex items-center gap-3"
                >
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="text-white font-bold tracking-wider">
                    United Navodayan Malayalee Association (UNMA)
                  </span>
                  <span className="text-yellow-400 text-xl">★</span>
                </motion.div>
              </div>

              {/* Title */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-12"
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-300 to-yellow-400">
                    UNMA 2nd Anniversary
                  </span>
                  <br />
                  <span className="text-white">
                    & 77th Republic Day Celebration
                  </span>
                </h1>
                <p className="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto mb-8">
                  Join us for a memorable celebration on 26th January 2026 at T. K. Ramakrishnan Samskarika Kendram, Ernakulam. 
                  Reconnect with fellow Navodayans, participate in patriotic activities, and celebrate our shared heritage.
                </p>
                {/* Register Now Button */}
                <div className="flex justify-center mt-8">
                  <Link
                    to="/republic-day-event"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-indigo-950 transform hover:scale-105"
                  >
                    Register Now
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                </div>
              </motion.div>

              {/* Countdown Timer */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mb-12 bg-white/10 backdrop-blur-md p-4 md:p-8 rounded-2xl border border-white/20 shadow-xl"
              >
                <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-center text-white">
                  Event Starts In
                </h3>
                <div className="flex justify-center">
                  <CountdownTimer />
                </div>
              </motion.div>

              {/* Special Highlight Notice - Blood Donation Drive */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-12 relative overflow-hidden"
              >
                <div className="bg-gradient-to-r from-red-600 via-red-500 to-pink-600 rounded-2xl shadow-2xl border-2 border-red-400/50 p-6 md:p-8 relative z-10">
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <span className="text-3xl animate-pulse">🩸</span>
                      <h3 className="text-2xl md:text-3xl font-bold text-white text-center">
                        Special Highlight of the Day
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
                          from 8:30 AM to 5:30 PM
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Three Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* When Card */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl flex items-center gap-5"
                >
                  <div className="p-3 rounded-xl bg-white/10 flex-shrink-0">
                    <CalendarIcon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">When</h3>
                    <p className="text-white text-xl font-bold">
                      Sunday, January 26, 2026
                    </p>
                    <p className="text-white/80">8:30 AM - 6:30 PM</p>
                  </div>
                </motion.div>

                {/* Where Card */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl flex items-center gap-5"
                >
                  <div className="p-3 rounded-xl bg-white/10 flex-shrink-0">
                    <MapPinIcon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">Where</h3>
                    <p className="text-white text-xl font-bold">
                      T. K. Ramakrishnan Samskarika Kendram
                    </p>
                    <p className="text-white/80">Near Boat Jetty, Ernakulam</p>
                  </div>
                </motion.div>

                {/* Who Card */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl flex items-center gap-5"
                >
                  <div className="p-3 rounded-xl bg-white/10 flex-shrink-0">
                    <ClockIcon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">Duration</h3>
                    <p className="text-white text-xl font-bold">
                      Full Day Event
                    </p>
                    <p className="text-white/80">Morning to Evening</p>
                  </div>
                </motion.div>
              </div>

              {/* Map Section */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="mb-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden flex flex-col"
              >
                <div
                  className="relative w-full h-[500px] cursor-pointer group"
                  onClick={() =>
                    window.open(
                      "https://maps.app.goo.gl/NUWZEvhBqacPNdR77",
                      "_blank"
                    )
                  }
                >
                  <iframe
                    src="https://www.google.com/maps?q=T.+K.+Ramakrishnan+Samskarika+Kendram,+Near+Boat+Jetty,+Ernakulam&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0, pointerEvents: "none" }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                    title="T. K. Ramakrishnan Samskarika Kendram Location"
                  ></iframe>
                  {/* Click overlay */}
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                      <span className="text-gray-800 font-medium text-sm flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" />
                        Click to open in Google Maps
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-white/10 flex flex-wrap justify-between items-center mt-auto gap-4">
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-5 h-5 text-yellow-400" />
                    <span className="text-white">
                      T. K. Ramakrishnan Samskarika Kendram, Near Boat Jetty, Ernakulam
                    </span>
                  </div>
                  <a
                    href="https://maps.app.goo.gl/NUWZEvhBqacPNdR77"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-300 text-sm"
                  >
                    <span>Get Directions</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex justify-center max-w-2xl mx-auto mb-12"
              >
                <Link
                  to="/republic-day-event"
                  className="w-full bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 px-8 py-4 text-lg font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 text-indigo-950"
                >
                  Register Now
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Program Schedule Section */}
        <section className="py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="container">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-6 py-2.5 mb-4 text-sm font-semibold tracking-wider text-white uppercase bg-gradient-to-r from-primary to-primary-dark rounded-full shadow-md">
                Schedule
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Program <span className="text-primary">Schedule</span>
              </h2>
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-8">
              {/* Morning Session */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h3 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
                  Morning Session
                          </h3>
                <div className="space-y-3">
                  {scheduleData.morning.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row md:items-center gap-2 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="font-semibold text-primary min-w-[200px]">
                        {item.time}
                        </div>
                      <div className="flex items-center gap-2">
                        <ArrowRightIcon className="w-4 h-4 text-gray-400 hidden md:block" />
                        <span className="text-gray-700">{item.event}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>

              {/* Afternoon Session */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h3 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
                  Afternoon Session
                      </h3>
                <div className="space-y-3">
                  {scheduleData.afternoon.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row md:items-center gap-2 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="font-semibold text-primary min-w-[200px]">
                        {item.time}
                                  </div>
                      <div className="flex items-center gap-2">
                        <ArrowRightIcon className="w-4 h-4 text-gray-400 hidden md:block" />
                        <span className="text-gray-700">{item.event}</span>
                                  </div>
                                  </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Register Now CTA Section - Before Footer */}
        <section className="py-16 bg-gradient-to-r from-primary via-primary-dark to-indigo-900">
          <div className="container">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Ready to Join Us?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Don't miss out on this incredible celebration! Register now and be part of the UNMA 2nd Anniversary & 77th Republic Day Celebration.
              </p>
              <Link
                to="/republic-day-event"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-indigo-950 transform hover:scale-105"
              >
                Register Now
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
          </div>
    </LazyMotion>
  );
};

export default Home;
