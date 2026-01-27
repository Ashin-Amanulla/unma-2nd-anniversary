import { useState, useEffect } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import useAuthStore from "../../store/authStore";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const Settings = () => {
  const { isSuperAdmin } = useAuthStore();
  const {
    useSubAdmins,
    useCreateSubAdmin,
    useUpdateSubAdmin,
  } = useAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "school_admin",
    sidebarAccess: [],
  });

  const { data: subAdmins, isLoading, refetch } = useSubAdmins();
  const createSubAdminMutation = useCreateSubAdmin();
  const updateSubAdminMutation = useUpdateSubAdmin();

  // Only super admin can access settings
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Only super administrators can access this page.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Submitting form data:", formData);
      if (editingAdmin) {
        await updateSubAdminMutation.mutateAsync({
          id: editingAdmin._id,
          ...formData,
        });
      } else {
        await createSubAdminMutation.mutateAsync(formData);
      }

      handleCloseModal();
      refetch();
    } catch (error) {
      console.error("Error saving sub-admin:", error);
      alert(error.message || "Failed to save sub-admin. Please check the console for details.");
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingAdmin(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "school_admin",
      sidebarAccess: [],
    });
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "", // Don't populate password for security
      role: admin.role || "school_admin",
      sidebarAccess: admin.sidebarAccess || [],
    });
    setShowCreateModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage sub-administrators and their permissions.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Sub-Admin
          </button>
        </div>
      </div>

      {/* Sub-Admins List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            School Administrators
          </h3>

          {subAdmins?.length === 0 ? (
            <div className="text-center py-8">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No sub-admins
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new sub-administrator.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subAdmins?.map((admin) => (
                    <tr key={admin._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {admin.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {admin.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            admin.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {admin.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="text-primary hover:text-primary-dark mr-3"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingAdmin ? "Edit Sub-Admin" : "Create New Sub-Admin"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="form-input"
                    required
                    disabled={editingAdmin} // Don't allow email changes
                  />
                </div>

                {!editingAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="form-input"
                      required={!editingAdmin}
                      minLength={6}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    className="form-input"
                    required
                  >
                    <option value="school_admin">School Admin</option>
                    <option value="career_admin">Career Admin</option>
                    <option value="registration_desk">Registration Desk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sidebar Access Control
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Select which sidebar items this admin can access. Leave empty for default role-based access.
                </p>
                <div className="space-y-4 border border-gray-200 rounded-md p-4">
                  {/* Events Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Events</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.sidebarAccess.includes("event_dashboard")}
                          onChange={(e) => {
                            const newAccess = e.target.checked
                              ? [...formData.sidebarAccess, "event_dashboard"]
                              : formData.sidebarAccess.filter((a) => a !== "event_dashboard");
                            setFormData((prev) => ({ ...prev, sidebarAccess: newAccess }));
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Event Dashboard</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.sidebarAccess.includes("event_registrations")}
                          onChange={(e) => {
                            const newAccess = e.target.checked
                              ? [...formData.sidebarAccess, "event_registrations"]
                              : formData.sidebarAccess.filter((a) => a !== "event_registrations");
                            setFormData((prev) => ({ ...prev, sidebarAccess: newAccess }));
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Event Registrations</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.sidebarAccess.includes("event_management")}
                          onChange={(e) => {
                            const newAccess = e.target.checked
                              ? [...formData.sidebarAccess, "event_management"]
                              : formData.sidebarAccess.filter((a) => a !== "event_management");
                            setFormData((prev) => ({ ...prev, sidebarAccess: newAccess }));
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Event Management</span>
                      </label>
                    </div>
                  </div>

                  {/* Website Content Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Website Content</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.sidebarAccess.includes("team_management")}
                          onChange={(e) => {
                            const newAccess = e.target.checked
                              ? [...formData.sidebarAccess, "team_management"]
                              : formData.sidebarAccess.filter((a) => a !== "team_management");
                            setFormData((prev) => ({ ...prev, sidebarAccess: newAccess }));
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Team Management</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.sidebarAccess.includes("updates_management")}
                          onChange={(e) => {
                            const newAccess = e.target.checked
                              ? [...formData.sidebarAccess, "updates_management"]
                              : formData.sidebarAccess.filter((a) => a !== "updates_management");
                            setFormData((prev) => ({ ...prev, sidebarAccess: newAccess }));
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Updates Management</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.sidebarAccess.includes("careers_jobs")}
                          onChange={(e) => {
                            const newAccess = e.target.checked
                              ? [...formData.sidebarAccess, "careers_jobs"]
                              : formData.sidebarAccess.filter((a) => a !== "careers_jobs");
                            setFormData((prev) => ({ ...prev, sidebarAccess: newAccess }));
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Careers / Jobs</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.sidebarAccess.includes("pending_jobs")}
                          onChange={(e) => {
                            const newAccess = e.target.checked
                              ? [...formData.sidebarAccess, "pending_jobs"]
                              : formData.sidebarAccess.filter((a) => a !== "pending_jobs");
                            setFormData((prev) => ({ ...prev, sidebarAccess: newAccess }));
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Pending Jobs</span>
                      </label>
                    </div>
                  </div>

                  {/* User Communications Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">User Communications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.sidebarAccess.includes("feedback")}
                          onChange={(e) => {
                            const newAccess = e.target.checked
                              ? [...formData.sidebarAccess, "feedback"]
                              : formData.sidebarAccess.filter((a) => a !== "feedback");
                            setFormData((prev) => ({ ...prev, sidebarAccess: newAccess }));
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Feedback</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.sidebarAccess.includes("issues")}
                          onChange={(e) => {
                            const newAccess = e.target.checked
                              ? [...formData.sidebarAccess, "issues"]
                              : formData.sidebarAccess.filter((a) => a !== "issues");
                            setFormData((prev) => ({ ...prev, sidebarAccess: newAccess }));
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Issues</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.sidebarAccess.includes("contact_messages")}
                          onChange={(e) => {
                            const newAccess = e.target.checked
                              ? [...formData.sidebarAccess, "contact_messages"]
                              : formData.sidebarAccess.filter((a) => a !== "contact_messages");
                            setFormData((prev) => ({ ...prev, sidebarAccess: newAccess }));
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Contact Messages</span>
                      </label>
                    </div>
                  </div>

                  {/* System Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">System</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.sidebarAccess.includes("settings")}
                          onChange={(e) => {
                            const newAccess = e.target.checked
                              ? [...formData.sidebarAccess, "settings"]
                              : formData.sidebarAccess.filter((a) => a !== "settings");
                            setFormData((prev) => ({ ...prev, sidebarAccess: newAccess }));
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Settings</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.sidebarAccess.includes("user_logs")}
                          onChange={(e) => {
                            const newAccess = e.target.checked
                              ? [...formData.sidebarAccess, "user_logs"]
                              : formData.sidebarAccess.filter((a) => a !== "user_logs");
                            setFormData((prev) => ({ ...prev, sidebarAccess: newAccess }));
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">User Logs</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createSubAdminMutation.isLoading ||
                    updateSubAdminMutation.isLoading
                  }
                  className="btn btn-primary"
                >
                  {createSubAdminMutation.isLoading ||
                  updateSubAdminMutation.isLoading
                    ? "Saving..."
                    : editingAdmin
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
