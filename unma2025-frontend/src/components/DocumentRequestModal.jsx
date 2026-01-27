import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import documentRequestApi from "../api/documentRequestApi";
import { toast } from "react-hot-toast";

const DocumentRequestModal = ({ isOpen, onClose, documentType = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    jnvSchool: "",
    message: "",
    documentType: documentType || "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.contact || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      await documentRequestApi.submitRequest(formData);
      toast.success("Request submitted successfully! We will contact you soon.");
      setFormData({
        name: "",
        email: "",
        contact: "",
        jnvSchool: "",
        message: "",
        documentType: documentType || "",
      });
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold">Request Document</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={submitting}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="contact"
              required
              value={formData.contact}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JNV School <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              name="jnvSchool"
              value={formData.jnvSchool}
              onChange={handleChange}
              placeholder="e.g., JNV Ernakulam"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={submitting}
            />
          </div>

          {documentType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Type
              </label>
              <input
                type="text"
                value={documentType}
                className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                disabled
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message/Purpose <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Please describe why you need this document..."
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={submitting}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentRequestModal;
