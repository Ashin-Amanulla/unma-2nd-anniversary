import { useState, useEffect } from "react";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRightIcon, InformationCircleIcon, UserIcon } from "@heroicons/react/24/outline";
import teamApi from "../api/teamApi";
import { COORDINATION_TEAM, ROLE_DESCRIPTIONS } from "../data/coordinationTeam";
import Loading from "../components/ui/Loading";

const CoordinationTeam = () => {
  const [officeBearers, setOfficeBearers] = useState([]);
  const [otherMembers, setOtherMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useStaticData, setUseStaticData] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await teamApi.getTeamMembers();
      const members = response.data || [];
      
      // Split by category
      setOfficeBearers(members.filter(m => m.category === "office_bearer"));
      setOtherMembers(members.filter(m => m.category === "other_member"));
      
      // If no data from API, fall back to static
      if (members.length === 0) {
        setUseStaticData(true);
      }
    } catch (error) {
      console.error("Failed to fetch team:", error);
      setUseStaticData(true);
    } finally {
      setLoading(false);
    }
  };

  // Use static data as fallback
  const staticMembers = useStaticData ? COORDINATION_TEAM.members : [];

  return (
    <LazyMotion features={domAnimation}>
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-950 via-primary to-indigo-900">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl md:text-5xl font-bold text-white mb-6">
            Coordination Team
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-xl text-white/80">
            Facilitating collaboration among member associations
          </motion.p>
        </div>
      </section>

      {/* Purpose Statement */}
      <section className="py-12 bg-white">
        <div className="container max-w-4xl mx-auto">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-start gap-4">
              <InformationCircleIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Important Note</h2>
                <p className="text-gray-700">{COORDINATION_TEAM.purpose}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="py-16"><Loading /></div>
      ) : (
        <>
          {/* Office Bearers Section */}
          {(officeBearers.length > 0 || useStaticData) && (
            <section className="py-16 bg-gray-50">
              <div className="container max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  {useStaticData ? "Current Team" : "Office Bearers"}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(useStaticData ? staticMembers : officeBearers).map((member, idx) => (
                    <motion.div
                      key={member._id || member.id || idx}
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      className="bg-white p-6 rounded-2xl shadow-lg"
                    >
                      <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full border-2 border-primary/20 bg-primary/5 shadow-inner">
                        {member.photo ? (
                          <img 
                            src={member.photo} 
                            alt={member.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="w-12 h-12 text-primary/40" />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                        <p className="text-primary font-medium mb-2">
                          {member.roleDisplayName || member.role}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {member.associationName || member.association}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Other Members Section */}
          {otherMembers.length > 0 && !useStaticData && (
            <section className="py-16 bg-white">
              <div className="container max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Other Members</h2>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {otherMembers.map((member) => (
                    <motion.div
                      key={member._id}
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      className="bg-gray-50 p-4 rounded-xl text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                        {member.photo ? (
                          <img 
                            src={member.photo} 
                            alt={member.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-primary">{member.roleDisplayName || member.role}</p>
                      <p className="text-xs text-gray-500">{member.associationName}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Role Descriptions */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Role Descriptions</h2>
          <div className="space-y-4">
            {Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => (
              <div key={role} className="bg-white p-5 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2">{role}</h3>
                <p className="text-gray-600 text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selection & Limitation */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Selection Method</h3>
              <p className="text-gray-600">{COORDINATION_TEAM.selectionMethod}</p>
            </div>
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Role Limitation</h3>
              <p className="text-gray-700">{COORDINATION_TEAM.roleLimitation}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-indigo-900">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Learn More About UNMA</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/about" className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all">
              About UNMA <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link to="/associations" className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all">
              Member Associations
            </Link>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
};

export default CoordinationTeam;
