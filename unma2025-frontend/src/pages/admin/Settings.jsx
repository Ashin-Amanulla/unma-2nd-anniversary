import { useState, useMemo } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import useAuthStore from "../../store/authStore";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const ROLE_PRESETS = {
  career_admin: ["careers_jobs", "pending_jobs"],
  school_admin: [
    "event_dashboard",
    "event_registrations",
    "team_management",
    "updates_management",
    "feedback",
  ],
  registration_desk: ["event_dashboard", "event_registrations"],
  fifa_admin: ["fifa"],
};

const SIDEBAR_LABELS = {
  event_dashboard: "Event Dashboard",
  event_registrations: "Event Registrations",
  event_management: "Event Management",
  team_management: "Team",
  updates_management: "Updates",
  careers_jobs: "Jobs",
  pending_jobs: "Pending Jobs",
  feedback: "Feedback",
  issues: "Issues",
  contact_messages: "Contact",
  settings: "Settings",
  user_logs: "User Logs",
  fifa: "FIFA Predictions",
};

const ROLE_BADGE_CLASSES = {
  career_admin: "bg-blue-100 text-blue-800",
  school_admin: "bg-green-100 text-green-800",
  registration_desk: "bg-amber-100 text-amber-800",
  fifa_admin: "bg-emerald-100 text-emerald-800",
};

const ROLE_DISPLAY_NAMES = {
  career_admin: "Career Admin",
  school_admin: "School Admin",
  registration_desk: "Registration Desk",
  fifa_admin: "FIFA Admin",
};

const SIDEBAR_ITEMS = [
  { group: "Events", items: ["event_dashboard", "event_registrations", "event_management"] },
  {
    group: "Website Content",
    items: ["team_management", "updates_management", "careers_jobs", "pending_jobs"],
  },
  { group: "User Communications", items: ["feedback", "issues", "contact_messages"] },
  { group: "Engagement", items: ["fifa"] },
  { group: "System", items: ["settings", "user_logs"] },
];

const toggleSidebarItem = (access, key, checked) =>
  checked ? [...access, key] : access.filter((a) => a !== key);

const Settings = () => {
  const { isSuperAdmin } = useAuthStore();
  const {
    useSubAdmins,
    useCreateSubAdmin,
    useUpdateSubAdmin,
    useDeleteSubAdmin,
    useToggleSubAdminStatus,
  } = useAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "school_admin",
    sidebarAccess: [],
    isActive: true,
  });

  const { data: subAdmins, isLoading, refetch } = useSubAdmins();
  const createSubAdminMutation = useCreateSubAdmin();
  const updateSubAdminMutation = useUpdateSubAdmin();
  const deleteSubAdminMutation = useDeleteSubAdmin();
  const toggleStatusMutation = useToggleSubAdminStatus();

  const filteredAdmins = useMemo(() => {
    if (!subAdmins) return [];
    let list = subAdmins;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "all") {
      list = list.filter((a) => a.role === roleFilter);
    }
    return list;
  }, [subAdmins, search, roleFilter]);

  const stats = useMemo(() => {
    if (!subAdmins) return { total: 0, career: 0, school: 0, reg: 0, active: 0 };
    return {
      total: subAdmins.length,
      career: subAdmins.filter((a) => a.role === "career_admin").length,
      school: subAdmins.filter((a) => a.role === "school_admin").length,
      reg: subAdmins.filter((a) => a.role === "registration_desk").length,
      active: subAdmins.filter((a) => a.isActive).length,
    };
  }, [subAdmins]);

  const applyRolePreset = (role) => {
    const preset = ROLE_PRESETS[role] || [];
    setFormData((prev) => ({ ...prev, role, sidebarAccess: preset }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        sidebarAccess: formData.sidebarAccess,
        isActive: formData.isActive,
      };
      if (editingAdmin) {
        if (formData.password?.trim()) payload.password = formData.password;
        await updateSubAdminMutation.mutateAsync({
          id: editingAdmin._id,
          ...payload,
        });
      } else {
        payload.password = formData.password;
        await createSubAdminMutation.mutateAsync(payload);
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
      role: "school_admin",
      sidebarAccess: ROLE_PRESETS.school_admin,
      isActive: true,
    });
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role || "school_admin",
      sidebarAccess: admin.sidebarAccess?.length
        ? admin.sidebarAccess
        : ROLE_PRESETS[admin.role] || [],
      isActive: admin.isActive !== false,
    });
    setShowCreateModal(true);
  };

  const handleCreate = () => {
    setEditingAdmin(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "school_admin",
      sidebarAccess: ROLE_PRESETS.school_admin,
      isActive: true,
    });
    setShowCreateModal(true);
  };

  const handleToggleStatus = async (admin) => {
    try {
      await toggleStatusMutation.mutateAsync(admin._id);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (admin) => {
    try {
      await deleteSubAdminMutation.mutateAsync(admin._id);
      setDeleteConfirm(null);
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    return isNaN(dt) ? "—" : dt.toLocaleString();
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            Only super administrators can access this page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Management</h1>
          <p className="mt-1 text-sm text-gray-700">
            Create and manage admin users with role-based access.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button type="button" onClick={handleCreate} className="btn btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Admin
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Admins</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Career Admin</p>
          <p className="mt-1 text-2xl font-semibold text-blue-700">{stats.career}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">School Admin</p>
          <p className="mt-1 text-2xl font-semibold text-green-700">{stats.school}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Registration</p>
          <p className="mt-1 text-2xl font-semibold text-amber-700">{stats.reg}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Active</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {stats.active} / {stats.total}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10 w-full"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="form-input w-full sm:w-48"
        >
          <option value="all">All roles</option>
          <option value="career_admin">Career Admin</option>
          <option value="school_admin">School Admin</option>
          <option value="registration_desk">Registration Desk</option>
          <option value="fifa_admin">FIFA Admin</option>
        </select>
      </div>

      {/* Admin table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {filteredAdmins.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No admins found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || roleFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by creating a new admin."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Admin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sidebar Access
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Last Login
                  </th>
                  <th className="relative px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin._id}>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {admin.name}
                        </div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ROLE_BADGE_CLASSES[admin.role] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ROLE_DISPLAY_NAMES[admin.role] || admin.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(admin.sidebarAccess || []).length > 0 ? (
                          (admin.sidebarAccess || []).slice(0, 4).map((k) => (
                            <span
                              key={k}
                              className="inline-flex px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700"
                            >
                              {SIDEBAR_LABELS[k] || k}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">Default</span>
                        )}
                        {(admin.sidebarAccess || []).length > 4 && (
                          <span className="text-xs text-gray-500">
                            +{(admin.sidebarAccess || []).length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(admin)}
                        disabled={toggleStatusMutation.isLoading}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          admin.isActive ? "bg-primary" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                            admin.isActive ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(admin.lastLogin)}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(admin)}
                        className="text-primary hover:text-primary-dark"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(admin)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900">Delete Admin</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete {deleteConfirm.name} (
              {deleteConfirm.email})? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteSubAdminMutation.isLoading}
                className="btn bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingAdmin ? "Edit Admin" : "Create New Admin"}
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
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="form-input"
                    required
                    disabled={!!editingAdmin}
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
                      required
                      minLength={6}
                    />
                  </div>
                )}
                {editingAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reset Password (optional)
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
                      placeholder="Leave blank to keep current"
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
                    onChange={(e) => applyRolePreset(e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="school_admin">School Admin</option>
                    <option value="career_admin">Career Admin</option>
                    <option value="registration_desk">Registration Desk</option>
          <option value="fifa_admin">FIFA Admin</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Role determines default page access. You can customize below.
                  </p>
                </div>
                {editingAdmin && (
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sidebar Access
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Select which pages this admin can access.
                </p>
                <div className="space-y-4 border border-gray-200 rounded-md p-4">
                  {SIDEBAR_ITEMS.map(({ group, items }) => (
                    <div key={group}>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        {group}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {items.map((key) => (
                          <label key={key} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.sidebarAccess.includes(key)}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  sidebarAccess: toggleSidebarItem(
                                    prev.sidebarAccess,
                                    key,
                                    e.target.checked
                                  ),
                                }))
                              }
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">
                              {SIDEBAR_LABELS[key] || key}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
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
                  {createSubAdminMutation.isLoading || updateSubAdminMutation.isLoading
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
