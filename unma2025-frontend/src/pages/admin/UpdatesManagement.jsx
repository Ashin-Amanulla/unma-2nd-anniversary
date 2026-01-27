import { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  PhotoIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import updateApi from "../../api/updateApi";
import uploadApi from "../../api/uploadApi";
import Loading from "../../components/ui/Loading";
import { toast } from "react-hot-toast";

const CATEGORY_OPTIONS = [
  { value: "news", label: "News" },
  { value: "announcement", label: "Announcement" },
  { value: "activity", label: "Activity" },
  { value: "initiative", label: "Initiative" },
];

const initialFormState = {
  title: "",
  content: "",
  category: "news",
  date: new Date().toISOString().split("T")[0],
  link: "",
  image: "",
  isPublished: false,
};

const UpdatesManagement = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const response = await updateApi.getAllUpdatesAdmin();
      setUpdates(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch updates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setSelectedUpdate(item);
      setFormData({
        title: item.title || "",
        content: item.content || "",
        category: item.category || "news",
        date: item.date ? new Date(item.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        link: item.link || "",
        image: item.image || "",
        isPublished: item.isPublished || false,
      });
      setImagePreview(item.image || null);
    } else {
      setSelectedUpdate(null);
      setFormData(initialFormState);
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUpdate(null);
    setFormData(initialFormState);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      let imageUrl = formData.image;
      
      // Upload image if a new file is selected
      if (imageFile) {
        setUploading(true);
        try {
          const uploadResponse = await uploadApi.uploadSingle(imageFile);
          imageUrl = uploadResponse.data.url;
        } catch (uploadError) {
          toast.error("Failed to upload image");
          setUploading(false);
          setSubmitting(false);
          return;
        }
        setUploading(false);
      }
      
      const dataToSubmit = { 
        ...formData, 
        image: imageUrl,
        date: new Date(formData.date).toISOString(),
      };
      
      if (selectedUpdate) {
        await updateApi.updateUpdate(selectedUpdate._id, dataToSubmit);
        toast.success("Update updated successfully");
      } else {
        await updateApi.createUpdate(dataToSubmit);
        toast.success("Update created successfully");
      }
      
      closeModal();
      fetchUpdates();
    } catch (error) {
      toast.error(error.message || "Failed to save update");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this update?")) {
      return;
    }

    try {
      await updateApi.deleteUpdate(id);
      toast.success("Update deleted successfully");
      fetchUpdates();
    } catch (error) {
      toast.error(error.message || "Failed to delete update");
      console.error(error);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await updateApi.togglePublish(id);
      toast.success("Publish status updated");
      fetchUpdates();
    } catch (error) {
      toast.error(error.message || "Failed to toggle publish status");
      console.error(error);
    }
  };

  const getCategoryBadge = (category) => {
    const badges = {
      news: "bg-blue-100 text-blue-700",
      announcement: "bg-purple-100 text-purple-700",
      activity: "bg-green-100 text-green-700",
      initiative: "bg-orange-100 text-orange-700",
    };
    return badges[category] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Updates Management</h1>
          <p className="text-gray-600 mt-1">Manage news, announcements, activities, and initiatives</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchUpdates}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Refresh
          </button>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Update
          </button>
        </div>
      </div>

      {/* Updates Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {updates.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No updates yet</td>
              </tr>
            ) : (
              updates.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BellIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 line-clamp-1">{item.title}</div>
                        {item.link && <div className="text-sm text-blue-600 truncate max-w-xs">{item.link}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${getCategoryBadge(item.category)}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${item.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleTogglePublish(item._id)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      title={item.isPublished ? "Unpublish" : "Publish"}
                    >
                      {item.isPublished ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                    <button onClick={() => openModal(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded ml-1">
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-1 text-red-600 hover:bg-red-50 rounded ml-1">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{selectedUpdate ? "Edit Update" : "Add Update"}</h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded" disabled={submitting}>
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
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                  disabled={submitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                    disabled={submitting}
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                    disabled={submitting}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/republic-day-event or external URL"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <PhotoIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                      disabled={submitting || uploading}
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  disabled={submitting}
                />
                <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700">
                  Publish immediately
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting || uploading}
                >
                  {submitting ? "Saving..." : uploading ? "Uploading..." : selectedUpdate ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatesManagement;
