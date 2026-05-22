import { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  VideoCameraIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import webinarApi from "../../api/webinarApi";
import uploadApi from "../../api/uploadApi";
import Loading from "../../components/ui/Loading";
import { toast } from "react-hot-toast";

const initialFormState = {
  title: "",
  speaker: "",
  speakerRole: "",
  dateLabel: "",
  description: "",
  posterUrl: "",
  posterAlt: "",
  recordingUrl: "",
  registrationUrl: "",
  order: 0,
  isPublished: false,
  isFeatured: false,
};

const WebinarManagement = () => {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      const response = await webinarApi.getAllWebinarsAdmin();
      setWebinars(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch webinars");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setSelectedWebinar(item);
      setFormData({
        title: item.title || "",
        speaker: item.speaker || "",
        speakerRole: item.speakerRole || "",
        dateLabel: item.dateLabel || "",
        description: item.description || "",
        posterUrl: item.posterUrl || "",
        posterAlt: item.posterAlt || "",
        recordingUrl: item.recordingUrl || "",
        registrationUrl: item.registrationUrl || "",
        order: item.order ?? 0,
        isPublished: Boolean(item.isPublished),
        isFeatured: Boolean(item.isFeatured),
      });
    } else {
      setSelectedWebinar(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedWebinar(null);
    setFormData(initialFormState);
  };

  const handlePosterFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPoster(true);
      const result = await uploadApi.uploadSingle(file);
      if (result?.success && result?.data?.url) {
        setFormData((prev) => ({
          ...prev,
          posterUrl: result.data.url,
          posterAlt: prev.posterAlt || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        }));
        toast.success("Poster uploaded");
      }
    } catch (err) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploadingPoster(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.posterUrl?.trim()) {
      toast.error("Upload a poster image or paste poster URL");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        order: Number(formData.order) || 0,
      };
      if (selectedWebinar) {
        await webinarApi.updateWebinar(selectedWebinar._id, payload);
        toast.success("Webinar updated");
      } else {
        await webinarApi.createWebinar(payload);
        toast.success("Webinar created");
      }
      closeModal();
      fetchWebinars();
    } catch (error) {
      const msg =
        typeof error?.message === "string"
          ? error.message
          : error?.response?.data?.message || "Save failed";
      toast.error(msg);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await webinarApi.togglePublish(id);
      toast.success("Publish status updated");
      fetchWebinars();
    } catch (error) {
      toast.error("Failed to toggle publish status");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this webinar? This cannot be undone.")) return;
    try {
      await webinarApi.deleteWebinar(id);
      toast.success("Webinar deleted");
      fetchWebinars();
    } catch (error) {
      toast.error("Failed to delete");
      console.error(error);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary rounded-xl">
            <VideoCameraIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Webinar Management</h1>
            <p className="text-gray-600 text-sm">Posters, featured popup, recordings</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fetchWebinars()}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <PlusIcon className="w-5 h-5" />
            Add webinar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Webinar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Featured
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Published
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {webinars.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No webinars yet
                </td>
              </tr>
            ) : (
              webinars.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      {item.posterUrl ? (
                        <img
                          src={item.posterUrl}
                          alt=""
                          className="w-14 h-14 rounded-lg object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                          <VideoCameraIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 line-clamp-1">{item.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {item.speaker || "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {item.dateLabel || "—"}
                  </td>
                  <td className="px-6 py-4">
                    {item.isFeatured ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                        <StarSolidIcon className="w-4 h-4" />
                        Popup candidate
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.isPublished ? "Yes" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(item._id)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded inline-flex"
                      title={item.isPublished ? "Unpublish" : "Publish"}
                    >
                      {item.isPublished ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal(item)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded ml-1 inline-flex"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded ml-1 inline-flex"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">
                {selectedWebinar ? "Edit webinar" : "Add webinar"}
              </h2>
              <button type="button" onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Speaker</label>
                  <input
                    type="text"
                    value={formData.speaker}
                    onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date label (display)
                  </label>
                  <input
                    type="text"
                    value={formData.dateLabel}
                    onChange={(e) => setFormData({ ...formData, dateLabel: e.target.value })}
                    placeholder="e.g., 31 March 2026 · 8 PM IST"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Speaker role</label>
                <textarea
                  rows={2}
                  value={formData.speakerRole}
                  onChange={(e) => setFormData({ ...formData, speakerRole: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                <label className="block text-sm font-medium text-gray-700">Poster *</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handlePosterFile}
                  disabled={uploadingPoster || submitting}
                  className="block w-full text-sm text-gray-600"
                />
                {uploadingPoster && (
                  <p className="text-sm text-gray-500">Uploading poster…</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Poster URL</label>
                    <input
                      type="url"
                      value={formData.posterUrl}
                      onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                      placeholder="https://…"
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Poster alt text</label>
                    <input
                      type="text"
                      value={formData.posterAlt}
                      onChange={(e) => setFormData({ ...formData, posterAlt: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                {formData.posterUrl ? (
                  <img
                    src={formData.posterUrl}
                    alt=""
                    className="mt-2 max-h-48 rounded-lg border border-gray-200 mx-auto block"
                  />
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recording URL
                  </label>
                  <input
                    type="url"
                    value={formData.recordingUrl}
                    onChange={(e) => setFormData({ ...formData, recordingUrl: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration URL
                  </label>
                  <input
                    type="url"
                    value={formData.registrationUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, registrationUrl: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <StarIcon className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-gray-700">
                    Featured (prefer for home popup & banner when published)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Published</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingPoster}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                >
                  {submitting ? "Saving…" : selectedWebinar ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebinarManagement;
