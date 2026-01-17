import { motion, LazyMotion, domAnimation } from "framer-motion";
import EventRegistrationForm from "../components/republic-day-event/EventRegistrationForm";

const RepublicDayEvent = () => {
  return (
    <LazyMotion features={domAnimation}>
      <div className="bg-gradient-to-b from-indigo-950 via-primary to-indigo-900 min-h-screen">
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
        <section className="relative min-h-screen pt-24 pb-16">
          <div className="container relative z-30">
            <div className="max-w-4xl mx-auto">
              {/* Page Title */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-300 to-yellow-400">
                    Event Registration
                  </span>
                </h1>
                <p className="text-xl text-white/80 leading-relaxed">
                  Register for UNMA 2nd Anniversary & 77th Republic Day Celebration
                </p>
              </motion.div>

              {/* Registration Form */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
              >
                <EventRegistrationForm />
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
};

export default RepublicDayEvent;
