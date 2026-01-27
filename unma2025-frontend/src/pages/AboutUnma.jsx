import { useState, useEffect } from "react";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  UserGroupIcon,
  ScaleIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { SITE_CONTENT } from "../data/siteContent";
import { COORDINATION_TEAM } from "../data/coordinationTeam";
import DocumentRequestModal from "../components/DocumentRequestModal";
import teamApi from "../api/teamApi";
import Loading from "../components/ui/Loading";

const AboutUnma = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [useStaticTeam, setUseStaticTeam] = useState(false);

  const documents = [
    {
      id: 1,
      title: "UNMA Registration Certificate",
      description: "Official registration certificate under the Travancore-Cochin Act",
      type: "Registration",
    },
    {
      id: 2,
      title: "UNMA Bylaws",
      description: "Basic operating guidelines and bylaws of the association",
      type: "Governance",
    },
  ];

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setTeamLoading(true);
      const response = await teamApi.getTeamMembers();
      const members = response.data || [];
      if (members.length > 0) {
        setTeamMembers(members);
      } else {
        setUseStaticTeam(true);
      }
    } catch (error) {
      console.error("Failed to fetch team:", error);
      setUseStaticTeam(true);
    } finally {
      setTeamLoading(false);
    }
  };

  const handleRequestDocument = (document) => {
    setSelectedDocument(document.title);
    setIsModalOpen(true);
  };

  const displayTeamMembers = useStaticTeam ? COORDINATION_TEAM.members : teamMembers;

  const principleIcons = {
    "Voluntary Participation": SparklesIcon,
    "Equal Status": ScaleIcon,
    "Full Autonomy": ShieldCheckIcon,
    "Non-Controlling Nature": UserGroupIcon,
    "Transparency": LightBulbIcon,
  };

  return (
    <LazyMotion features={domAnimation}>
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-950 via-primary to-indigo-900">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-6"
            >
              <span className="text-yellow-400">★</span>
              <span className="text-white text-sm font-medium">About Us</span>
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              About <span className="text-yellow-400">UNMA</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/80"
            >
              {SITE_CONTENT.tagline}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Formation Story */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {SITE_CONTENT.about.formation}
              </p>
              <div className="bg-blue-50 border-l-4 border-primary p-6 rounded-r-lg">
                <p className="text-gray-700 italic">
                  {SITE_CONTENT.about.whatWeAre}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Are / What We Are Not */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* What We Are */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-green-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">What We Are</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-600">A voluntary coordination platform</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-600">A facilitator for collaboration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-600">A platform for knowledge sharing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-600">A network of equals</span>
                  </li>
                </ul>
              </motion.div>

              {/* What We Are Not */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <ShieldCheckIcon className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">What We Are Not</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">✕</span>
                    <span className="text-gray-600">Not an apex body or umbrella organization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">✕</span>
                    <span className="text-gray-600">Not a governing or controlling entity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">✕</span>
                    <span className="text-gray-600">Not a body that directs member associations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-500 mt-1">✕</span>
                    <span className="text-gray-600">Not a hierarchy of any kind</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-primary to-indigo-900 p-8 rounded-2xl text-white"
              >
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-white/90 leading-relaxed">
                  {SITE_CONTENT.about.vision}
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-2xl text-white"
              >
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-white/90 leading-relaxed">
                  {SITE_CONTENT.about.mission}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>





      {/* Coordination Team */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Coordination Team</h2>
              <p className="text-gray-600 mb-8">{COORDINATION_TEAM.purpose}</p>
            </motion.div>

            {teamLoading ? (
              <div className="py-16"><Loading /></div>
            ) : displayTeamMembers.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {displayTeamMembers.slice(0, 10).map((member, idx) => (
                  <motion.div
                    key={member._id || member.id || idx}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-6 rounded-2xl shadow-lg text-center"
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
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{member.name}</h3>
                    <p className="text-primary font-medium mb-2">
                      {member.roleDisplayName || member.role}
                    </p>
                    {(member.associationName || member.association) && (
                      <p className="text-gray-500 text-sm">
                        {member.associationName || member.association}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

 

      {/* Documents Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Documents</h2>
              <p className="text-gray-600">Transparency and informational documents</p>
            </motion.div>


            {/* Documents List */}
            <div className="space-y-4 mb-8">
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                      <DocumentTextIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {doc.type}
                      </span>
                      <h3 className="font-bold text-gray-900 mt-2 mb-1">{doc.title}</h3>
                      <p className="text-gray-600 text-sm">{doc.description}</p>
                    </div>
                    <button
                      onClick={() => handleRequestDocument(doc)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                    >
                      Request
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

       
          </div>
        </div>
      </section>


      {/* Document Request Modal */}
      <DocumentRequestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDocument(null);
        }}
        documentType={selectedDocument}
      />

    </LazyMotion>
  );
};

export default AboutUnma;
