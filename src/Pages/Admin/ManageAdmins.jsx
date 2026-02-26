import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { Trash2, UserPlus, Shield, ShieldOff, Eye, EyeOff, Users, ShieldCheck, AlertTriangle } from "lucide-react";

const baseURL = import.meta.env.VITE__BASEURL;

const getAuthHeader = () => {
  const token = Cookies.get("session");
  return { Authorization: token };
};

export const ManageAdmins = () => {
  const queryClient = useQueryClient();

  const currentUser = useMemo(() => {
    try {
      const token = Cookies.get("session");
      if (!token) return null;
      return jwtDecode(token)?.user;
    } catch {
      return null;
    }
  }, []);

  const [form, setForm] = useState({ fullName: "", email: "", phoneNumber: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // --- Live DB record of the current admin ---
  const { data: meData, isLoading: meLoading } = useQuery({
    queryKey: ["adminMe", currentUser?._id || currentUser?.id],
    queryFn: async () => {
      const res = await axios.get(`${baseURL}/admin/me`, {
        headers: getAuthHeader(),
        withCredentials: true,
      });
      return res.data?.data || null;
    },
    enabled: !!currentUser,
  });

  const isSuperAdmin = meData?.isSuperAdmin === true;

  // --- Setup super admin mutation (one-time) ---
  const setupMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `${baseURL}/admin/setup-super-admin`,
        {},
        { headers: getAuthHeader(), withCredentials: true }
      );
      return res.data;
    },
    onSuccess: (data) => {
      // Save the fresh JWT that the backend returned
      if (data?.token) {
        Cookies.set("session", data.token, { expires: 2 });
      }
      // Refetch live status and sidebar
      queryClient.invalidateQueries(["adminMe"]);
      queryClient.invalidateQueries(["adminsList"]);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Setup failed");
    },
  });

  // --- Fetch admins list ---
  const { data: adminsData, isLoading } = useQuery({
    queryKey: ["adminsList"],
    queryFn: async () => {
      const res = await axios.get(`${baseURL}/admin/list-admins`, {
        headers: getAuthHeader(),
        withCredentials: true,
      });
      return res.data?.data || [];
    },
    enabled: isSuperAdmin,
  });

  // --- Create admin ---
  const createAdminMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post(`${baseURL}/admin/create-admin`, payload, {
        headers: { ...getAuthHeader(), "Content-Type": "application/json" },
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: () => {
      setFormSuccess("Admin created successfully!");
      setFormError("");
      setForm({ fullName: "", email: "", phoneNumber: "", password: "" });
      queryClient.invalidateQueries(["adminsList"]);
      setTimeout(() => setFormSuccess(""), 4000);
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || "Failed to create admin");
      setFormSuccess("");
    },
  });

  // --- Delete admin ---
  const deleteAdminMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`${baseURL}/admin/delete-admin/${id}`, {
        headers: getAuthHeader(),
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: () => {
      setDeleteConfirmId(null);
      queryClient.invalidateQueries(["adminsList"]);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to delete admin");
      setDeleteConfirmId(null);
    },
  });

  // --- Toggle status ---
  const toggleStatusMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.put(
        `${baseURL}/admin/toggle-admin-status/${id}`,
        {},
        { headers: getAuthHeader(), withCredentials: true }
      );
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries(["adminsList"]),
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phoneNumber || !form.password) {
      setFormError("All fields are required");
      return;
    }
    createAdminMutation.mutate(form);
  };

  const admins = adminsData || [];

  // ---- NOT YET SUPER ADMIN: show setup screen ----
  if (!meLoading && !isSuperAdmin) {
    return (
      <Layout>
        <div className="w-full min-h-screen bg-gray-50">
          <Navbar />
          <div className="p-6 max-w-xl mx-auto mt-16">
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={22} className="text-white" />
                  <h2 className="text-lg font-bold text-white">One-Time Setup Required</h2>
                </div>
                <p className="text-amber-100 text-sm mt-1">
                  Your account needs to be activated as Super Admin before you can manage other admins.
                </p>
              </div>
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <ShieldCheck size={36} className="text-[#1F3A93]" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Activate Super Admin</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  Click the button below to activate your Super Admin privileges. This is a one-time action.
                  After activation you will be able to create and manage other admin accounts.
                </p>
                <button
                  onClick={() => setupMutation.mutate()}
                  disabled={setupMutation.isPending}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#1F3A93] hover:bg-[#2d54d4] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-all duration-200"
                >
                  {setupMutation.isPending ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Activating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Activate Super Admin
                    </>
                  )}
                </button>

                {setupMutation.isSuccess && (
                  <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                    ✅ Success! Super Admin activated. The "Manage Admins" link will now appear in your sidebar.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ---- SUPER ADMIN: full management screen ----
  return (
    <Layout>
      <div className="w-full min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-[#1F3A93] flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1F3A93]" style={{ fontFamily: "Inter, sans-serif" }}>
                  Manage Admins
                </h1>
                <p className="text-sm text-gray-500">Create and manage admin accounts</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Create Admin Form */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#1F3A93] to-[#2d54d4] px-6 py-4">
                  <div className="flex items-center gap-2">
                    <UserPlus size={18} className="text-white" />
                    <h2 className="text-base font-semibold text-white">Create New Admin</h2>
                  </div>
                  <p className="text-blue-200 text-xs mt-0.5">New admins cannot create other admins</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      {formError}
                    </div>
                  )}
                  {formSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      {formSuccess}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3A93]/30 focus:border-[#1F3A93] transition-all" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="admin@company.com"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3A93]/30 focus:border-[#1F3A93] transition-all" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <input name="phoneNumber" type="tel" value={form.phoneNumber} onChange={handleChange} placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3A93]/30 focus:border-[#1F3A93] transition-all" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <div className="relative">
                      <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="Min. 8 characters"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3A93]/30 focus:border-[#1F3A93] transition-all pr-10" />
                      <button type="button" onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={createAdminMutation.isPending}
                    className="w-full py-2.5 bg-[#1F3A93] hover:bg-[#2d54d4] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2">
                    {createAdminMutation.isPending ? (
                      <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Creating...</>
                    ) : (<><UserPlus size={16} />Create Admin</>)}
                  </button>
                </form>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <Shield size={18} className="text-[#1F3A93] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#1F3A93]">Permissions Info</p>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    Admins you create have the same visibility as you across the dashboard but <strong>cannot create new admins</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Admins Table */}
            <div className="xl:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-800">Admin Accounts</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{admins.length} admin{admins.length !== 1 ? "s" : ""} created by you</p>
                  </div>
                  {isLoading && <div className="w-5 h-5 border-2 border-[#1F3A93] border-t-transparent rounded-full animate-spin" />}
                </div>

                {admins.length === 0 && !isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                      <Users size={28} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No admins created yet</p>
                    <p className="text-gray-400 text-sm mt-1">Use the form on the left to create your first admin.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
                          <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {admins.map((admin) => (
                          <tr key={admin._id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1F3A93] to-[#2d54d4] flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-bold">{admin.userName?.charAt(0)?.toUpperCase() || "A"}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{admin.userName}</p>
                                  <p className="text-xs text-gray-500">{admin.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">{admin.phoneNumber}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${admin.accountStatus === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${admin.accountStatus === "active" ? "bg-green-500" : "bg-red-500"}`} />
                                {admin.accountStatus === "active" ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-xs text-gray-500">
                              {new Date(admin.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => toggleStatusMutation.mutate(admin._id)} disabled={toggleStatusMutation.isPending}
                                  title={admin.accountStatus === "active" ? "Deactivate" : "Activate"}
                                  className={`p-1.5 rounded-lg transition-colors ${admin.accountStatus === "active" ? "hover:bg-orange-100 text-orange-500" : "hover:bg-green-100 text-green-600"}`}>
                                  {admin.accountStatus === "active" ? <ShieldOff size={15} /> : <Shield size={15} />}
                                </button>
                                {deleteConfirmId === admin._id ? (
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => deleteAdminMutation.mutate(admin._id)} disabled={deleteAdminMutation.isPending}
                                      className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                                      {deleteAdminMutation.isPending ? "..." : "Confirm"}
                                    </button>
                                    <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button onClick={() => setDeleteConfirmId(admin._id)} title="Delete admin"
                                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors">
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageAdmins;
