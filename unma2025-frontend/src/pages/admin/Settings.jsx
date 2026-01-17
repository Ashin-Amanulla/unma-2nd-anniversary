import { useState, useEffect } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import useAuthStore from "../../store/authStore";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const Settings = () => {
  const { isSuperAdmin } = useAuthStore();
  const {
    useSubAdmins,
    useCreateSubAdmin,
    useUpdateSubAdmin,
    useAvailableSchools,
  } = useAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    assignedSchools: [],
    permissions: {
      canViewAnalytics: true,
      canExportData: false,
    },
  });

  const { data: subAdmins, isLoading, refetch } = useSubAdmins();
  const { data: availableSchools } = useAvailableSchools();
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
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingAdmin(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      assignedSchools: [],
      permissions: {
        canViewAnalytics: true,
        canExportData: false,
      },
    });
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "", // Don't populate password for security
      assignedSchools: admin.assignedSchools || [],
      permissions: admin.permissions || {
        canViewAnalytics: true,
        canExportData: false,
      },
    });
    setShowCreateModal(true);
  };

  const handleSchoolToggle = (school) => {
    setFormData((prev) => ({
      ...prev,
      assignedSchools: prev.assignedSchools.includes(school)
        ? prev.assignedSchools.filter((s) => s !== school)
        : [...prev.assignedSchools, school],
    }));
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
                      Assigned Schools
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
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
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {admin.assignedSchools?.map((school) => (
                            <span
                              key={school}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              <AcademicCapIcon className="w-3 h-3 mr-1" />
                              {school}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions?.canViewAnalytics && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Analytics
                            </span>
                          )}
                          {admin.permissions?.canExportData && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Export
                            </span>
                          )}
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Schools
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {availableSchools?.map((school) => (
                    <label key={school} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.assignedSchools.includes(school)}
                        onChange={() => handleSchoolToggle(school)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{school}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canViewAnalytics}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            canViewAnalytics: e.target.checked,
                          },
                        }))
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      Can View Analytics
                    </span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canExportData}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            canExportData: e.target.checked,
                          },
                        }))
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      Can Export Data
                    </span>
                  </label>
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
