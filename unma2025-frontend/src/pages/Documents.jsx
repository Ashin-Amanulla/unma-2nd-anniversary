import { motion, LazyMotion, domAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRightIcon, DocumentTextIcon, DocumentCheckIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { SITE_CONTENT } from "../data/siteContent";

const Documents = () => {
  const documents = [
    {
      id: 1,
      title: "UNMA Registration Certificate",
      description: "Official registration certificate under the Travancore-Cochin Act",
      type: "Registration",
      available: true,
    },
    {
      id: 2,
      title: "UNMA Bylaws",
      description: "Basic operating guidelines and bylaws of the association",
      type: "Governance",
      available: true,
    },
  ];

  return (
    <LazyMotion features={domAnimation}>
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-950 via-primary to-indigo-900">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl md:text-5xl font-bold text-white mb-6">
            Documents
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-xl text-white/80">
            Transparency and informational documents
          </motion.p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-amber-50 border-b border-amber-200">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800">{SITE_CONTENT.disclaimers.documents}</p>
          </div>
        </div>
      </section>

      {/* Documents List */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-4xl mx-auto">
          <div className="space-y-4">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                    <DocumentTextIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{doc.type}</span>
                    <h3 className="font-bold text-gray-900 mt-2 mb-1">{doc.title}</h3>
                    <p className="text-gray-600 text-sm">{doc.description}</p>
                  </div>
                  {doc.available ? (
                    <span className="text-sm text-gray-500 italic">Contact for copy</span>
                  ) : (
                    <span className="text-sm text-gray-400">Coming soon</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Info */}
      <section className="py-16 bg-white">
        <div className="container max-w-3xl mx-auto">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-start gap-4">
              <DocumentCheckIcon className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Details</h3>
                <p className="text-gray-600 mb-4">UNMA is registered under the {SITE_CONTENT.registration.act}</p>
                <div className="bg-white p-3 rounded-lg inline-block">
                  <p className="text-sm text-gray-500">Registration Number</p>
                  <p className="font-semibold text-gray-900">{SITE_CONTENT.registration.number}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-indigo-900">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Need More Information?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all">
              Contact Us <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link to="/about" className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all">
              About UNMA
            </Link>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
};

export default Documents;
