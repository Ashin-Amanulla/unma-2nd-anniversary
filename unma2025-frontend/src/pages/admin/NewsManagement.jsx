import { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  BellIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import newsApi from "../../api/newsApi";
import uploadApi from "../../api/uploadApi";
import Loading from "../../components/ui/Loading";
import { toast } from "react-hot-toast";

const CATEGORY_OPTIONS = [
  { value: "announcement", label: "Announcement" },
  { value: "initiative", label: "Initiative" },
  { value: "update", label: "Update" },
  { value: "news", label: "News" },
];

const initialFormState = {
  title: "",
  content: "",
  category: "update",
  link: "",
  image: "",
  publishDate: new Date().toISOString().split("T")[0],
  isPublished: false,
  order: 0,
};

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsApi.getAllNewsAdmin();
      setNews(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch news");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setSelectedNews(item);
      setFormData({
        title: item.title || "",
        content: item.content || "",
        category: item.category || "update",
        link: item.link || "",
        image: item.image || "",
        publishDate: item.publishDate ? new Date(item.publishDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        isPublished: item.isPublished || false,
        order: item.order || 0,
      });
      setImagePreview(item.image || null);
    } else {
      setSelectedNews(null);
      setFormData(initialFormState);
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
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
      
      const dataToSubmit = { ...formData, image: imageUrl };
      
      if (selectedNews) {
        await newsApi.updateNews(selectedNews._id, dataToSubmit);
        toast.success("News updated successfully");
      } else {
        await newsApi.createNews(dataToSubmit);
        toast.success("News created successfully");
      }
      closeModal();
      fetchNews();
    } catch (error) {
      toast.error(error.message || "Failed to save news");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news item?")) return;
    try {
      await newsApi.deleteNews(id);
      toast.success("News deleted successfully");
      fetchNews();
    } catch (error) {
      toast.error("Failed to delete news");
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await newsApi.togglePublish(id);
      toast.success("Publish status updated");
      fetchNews();
    } catch (error) {
      toast.error("Failed to toggle publish status");
    }
  };

  const getCategoryBadge = (category) => {
    const colors = {
      announcement: "bg-blue-100 text-blue-700",
      initiative: "bg-green-100 text-green-700",
      update: "bg-yellow-100 text-yellow-700",
      news: "bg-purple-100 text-purple-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News & Updates</h1>
          <p className="text-gray-600">Manage announcements and updates</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchNews} className="p-2 border rounded-lg hover:bg-gray-50">
            <ArrowPathIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            <PlusIcon className="w-5 h-5" />
            Add News
          </button>
        </div>
      </div>

      {/* News Table */}
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
            {news.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No news items yet</td>
              </tr>
            ) : (
              news.map((item) => (
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
                    {new Date(item.publishDate).toLocaleDateString()}
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
              <h2 className="text-xl font-bold">{selectedNews ? "Edit News" : "Add News"}</h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
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
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 5MB. JPG, PNG, or GIF.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Publish immediately</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : submitting ? "Saving..." : selectedNews ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;
