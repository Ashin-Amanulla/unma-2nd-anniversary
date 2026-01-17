import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import sendMail from "../api/sendMail";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import contactFormSchema from "../zod-form-validators/contactForm";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const Contact = () => {
  const navigate = useNavigate();

  // Set page metadata for compliance
  useEffect(() => {
    document.title = "unma";

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Contact UNMA 2026 for alumni reunion inquiries. Get in touch with United Navodayan Malayalee Association for event information, registration support, and general assistance."
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "Contact UNMA 2026 for alumni reunion inquiries. Get in touch with United Navodayan Malayalee Association for event information, registration support, and general assistance.";
      document.getElementsByTagName("head")[0].appendChild(meta);
    }

    // Add structured data for better compliance
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact Us - UNMA 2026",
      description: "Contact page for UNMA 2026 2nd Anniversary Celebration ",
      url: "https://summit2025.unma.in/contact",
      mainEntity: {
        "@type": "Organization",
        name: "United Navodayan Malayalee Association",
        alternateName: "UNMA",
        email: "info@unma.in",
        address: {
          "@type": "PostalAddress",
          streetAddress:
            "Office of Fidence Legal Advocates & Legal Consultants, First Floor, Panathara Building, Combara Junction",
          addressLocality: "Kochi",
          addressRegion: "Kerala",
          postalCode: "682018",
          addressCountry: "India",
        },
        contactPoint: {
          "@type": "ContactPoint",
          email: "info@unma.in",
          contactType: "customer service",
          availableLanguage: ["English", "Malayalam"],
        },
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.getElementsByTagName("head")[0].appendChild(script);

    return () => {
      document.title = "unma";
      // Cleanup structured data
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      scripts.forEach((script) => {
        if (script.text.includes('"@type": "ContactPage"')) {
          script.remove();
        }
      });
    };
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const handleFAQNavigation = () => {
    // Navigate to home page first
    navigate("/");

    // After a short delay to ensure the page has loaded, scroll to FAQ section
    setTimeout(() => {
      const faqSection = document.getElementById("faq");
      if (faqSection) {
        faqSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const onSubmit = async (data) => {
    try {
      // Prepare the message content
      const messageContent = `
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || "Not provided"}

Message:
${data.message}
      `;

      // Send the email
      await sendMail(
        data.email,
        `UNMA 2026 Reunion-Message from ${data.name}`,
        messageContent
      );

      // Show success message
      toast.success("Message sent successfully! We'll get back to you soon.");

      // Clear form fields
      reset();
    } catch (error) {
      // Show error message
      toast.error(
        error.response?.data?.message ||
          "Failed to send message. Please try again later."
      );
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark">
        <div className="container py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Contact Us
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Have questions about the UNMA 2026 reunion? We're here to help!
                Feel free to reach out using any of the methods below.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full transition duration-300 cursor-pointer"
                >
                  <HomeIcon className="w-5 h-5" />
                  Return to Home
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-md border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register("name")}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    placeholder="Enter your name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register("email")}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <PhoneInput
                        country={"in"}
                        value={value}
                        onChange={onChange}
                        placeholder="Enter phone number"
                        preferredCountries={["in", "ae", "us", "gb"]}
                        inputClass={`w-full px-4 py-3 rounded-lg border ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                        containerClass="w-full"
                        dropdownClass="bg-white border border-gray-300 rounded-lg shadow-lg"
                        buttonClass="bg-gray-50 border-gray-300 rounded-l-lg hover:bg-gray-100"
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    {...register("message")}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    placeholder="What would you like to ask or tell us?"
                  ></textarea>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRightIcon className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Privacy Notice */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Privacy Notice:</strong> The information you provide
                  will be used solely for responding to your inquiry about the
                  UNMA 2026 reunion. We respect your privacy and will not share
                  your personal information with third parties. For more
                  details, please see our{" "}
                  <a
                    href="/privacy-policy"
                    className="text-primary hover:text-primary-dark underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>

              {/* Organization Information - Moved from right column */}
              <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  About UNMA
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    <strong>Organization:</strong> United Navodayan Malayalee
                    Association (UNMA)
                  </p>
                  <p>
                    <strong>Purpose:</strong> Non-profit alumni association for
                    Jawahar Navodaya Vidyalaya graduates
                  </p>
                  <p>
                    <strong>Event:</strong> UNMA 2026 Alumni Reunion - Kerala,
                    Mahe & Lakshadweep
                  </p>
                  <p>
                    <strong>Registration:</strong> Registered non-profit
                    organization
                  </p>
                  <p>
                    <strong>Jurisdiction:</strong> Kerala, India
                  </p>
                </div>
              </div>

              {/* FAQ - Moved from right column */}
              <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h3>
                <p className="text-gray-600 mb-4">
                  Before contacting us, you might find answers to your questions
                  in our FAQ section.
                </p>
                <button
                  onClick={handleFAQNavigation}
                  className="inline-flex items-center text-primary hover:text-primary-dark gap-1 font-medium cursor-pointer transition-colors duration-200"
                >
                  View All FAQs <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Get in Touch
                </h2>
                <p className="text-gray-600 mb-8">
                  If you have any questions about the UNMA 2026 reunion or need
                  additional information, please don't hesitate to contact us.
                  We're looking forward to hearing from you!
                </p>

                {/* Contact Cards */}
                <div className="space-y-4">
                  {/* Business Hours */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex gap-4">
                    <div className="rounded-full bg-primary/10 p-3 h-fit">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Response Hours
                      </h3>
                      <p className="text-gray-600 mt-1">
                        <strong>Email Support:</strong> Monday - Friday, 9:00 AM
                        - 6:00 PM IST
                        <br />
                        <strong>Weekend:</strong> Limited support available
                      </p>
                      <p className="text-gray-500 text-sm">
                        Typical response time: 24-48 hours
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex gap-4">
                    <div className="rounded-full bg-primary/10 p-3 h-fit">
                      <MapPinIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Our Address
                      </h3>
                      <p className="text-gray-600 mt-1">
                        <strong>
                          United Navodayan Malayalee Association (UNMA)
                        </strong>{" "}
                        <br /> Office of Fidence Legal Advocates & Legal
                        Consultants, First Floor, Panathara Building, Combara
                        Junction,
                        <br /> Near High Court of Kerala, Kochi - 682018,
                        Kerala, India
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex gap-4">
                    <div className="rounded-full bg-primary/10 p-3 h-fit">
                      <PhoneIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Contact Support
                      </h3>
                      <p className="text-gray-600 mt-1">
                        For immediate assistance, please email us at{" "}
                        <a
                          href="mailto:info@unma.in"
                          className="text-primary hover:text-primary-dark"
                        >
                          info@unma.in
                        </a>
                      </p>
                      <p className="text-gray-500 text-sm">
                        We respond within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex gap-4">
                    <div className="rounded-full bg-primary/10 p-3 h-fit">
                      <EnvelopeIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Email Address
                      </h3>
                      <p className="text-gray-600 mt-1">
                        <a
                          href="mailto:info@unma.in"
                          className="hover:text-primary"
                        >
                          info@unma.in
                        </a>
                      </p>
                      <p className="text-gray-500 text-sm">
                        We'll respond as soon as possible
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grievance Information */}
              <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Grievance & Escalation
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    <strong>First Level:</strong> Email us at info@unma.in
                    for general inquiries
                  </p>
                  <p>
                    <strong>Escalation:</strong> For urgent matters or
                    complaints, mark your email as "URGENT - GRIEVANCE"
                  </p>
                  <p>
                    <strong>Response Time:</strong> We aim to respond to all
                    grievances within 48 hours
                  </p>
                  <p>
                    <strong>Alternative:</strong> Use our{" "}
                    <a
                      href="/report-issue"
                      className="text-primary hover:text-primary-dark underline"
                    >
                      Issue Reporting
                    </a>{" "}
                    system for technical problems
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
