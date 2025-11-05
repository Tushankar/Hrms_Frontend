import React, { useState } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import VecIcon from "../../assets/VecIcon.png";
import SignaturePad from "../../Components/Common/SignaturePad";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  MapPin,
  Edit2,
  Mail,
  Phone,
  User,
  Calendar,
  Flag,
  Home,
  Briefcase,
  Award,
  Building,
  X,
  Save,
} from "lucide-react";

export const PersonalDetails = () => {
  const baseURL = import.meta.env.VITE__BASEURL;
  const userToken = Cookies.get("session");
  const decodedToken = userToken && jwtDecode(userToken);
  const user = decodedToken?.user;
  const [isEditing, setIsEditing] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.userName || "Roger Steven",
    email: user?.email || "example@gmail.com",
    phoneNumber: user?.phoneNumber || "+1 923-494-2358",
    address:
      user?.address || "Lorem ipsum, consectetur eli dolor sit, New york, USA.",
    country: user?.country || "USA",
    dateOfBirth: user?.dateOfBirth || "",
  });
  const [signatureServerPath, setSignatureServerPath] = useState(
    user?.signatureImage || null
  );
  // Helper to build normalized full URL
  const buildFullUrl = (relativePath) => {
    if (!relativePath) return "";
    const base = (baseURL || "").replace(/\/+$/, "");
    const rel = relativePath.replace(/^\/+/, "");
    return `${base}/${rel}`;
  };

  const [signatureUrl, setSignatureUrl] = useState(
    user?.signatureImage ? buildFullUrl(user.signatureImage) : ""
  );
  const [showSignatureEditor, setShowSignatureEditor] = useState(false);
  const [isSavingSignature, setIsSavingSignature] = useState(false);

  const handleInputChange = (e) => {
    setPersonalInfo({
      ...personalInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditProfile = () => {
    setShowPersonalInfo(true);
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Add save logic here
  };

  const handleCancel = () => {
    setShowPersonalInfo(false);
    setIsEditing(false);
  };

  // Handle saving signature path to user profile
  const handleSignatureSaved = async (serverPath) => {
    // serverPath is the relative path returned by upload endpoint, e.g. /uploads/signatures/xxx.png
    if (!serverPath) return;
    setIsSavingSignature(true);
    try {
      const userToken = Cookies.get("session");

      // Use FormData so multer still runs on server side (update-profile route uses multer)
      const fd = new FormData();
      fd.append("signatureImage", serverPath);

      const response = await axios.put(
        `${baseURL}/employee/update-profile`,
        fd,
        {
          headers: {
            Authorization: userToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.success) {
        // Refresh token to get updated user payload
        try {
          const refreshResponse = await axios.post(
            `${baseURL}/employee/refresh-token`,
            {},
            { headers: { Authorization: userToken } }
          );
          if (refreshResponse.data.success) {
            Cookies.set("session", refreshResponse.data.token);
            // Update local signature states
            setSignatureServerPath(serverPath);
            // Normalize URL building to avoid double slashes
            const base = baseURL.replace(/\/+$/, "");
            const rel = serverPath.replace(/^\/+/, "");
            setSignatureUrl(`${base}/${rel}`);
            setShowSignatureEditor(false);
          }
        } catch (err) {
          console.warn("Could not refresh token after signature update:", err);
          // Fallback: update UI with new path (normalized)
          setSignatureServerPath(serverPath);
          const base = baseURL.replace(/\/+$/, "");
          const rel = serverPath.replace(/^\/+/, "");
          setSignatureUrl(`${base}/${rel}`);
          setShowSignatureEditor(false);
        }
      } else {
        console.error(
          "Failed to update profile with signature:",
          response.data
        );
      }
    } catch (error) {
      console.error("Error saving signature to profile:", error);
    } finally {
      setIsSavingSignature(false);
    }
  };

  return (
    <Layout>
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Personal Details
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage your profile and documents
            </p>
          </div>

          {/* Profile Overview Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1">
                <div className="relative group">
                  <img
                    src={
                      user?.profileImage
                        ? buildFullUrl(user.profileImage)
                        : VecIcon
                    }
                    className="w-36 h-36 rounded-2xl object-cover border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-300"
                    alt="Profile"
                  />
                  <span
                    className={`absolute -bottom-2 -right-2 px-4 py-1.5 rounded-full text-xs font-semibold ${
                      user?.accountStatus === "active"
                        ? "bg-gradient-to-r from-green-400 to-green-500 text-white"
                        : "bg-gradient-to-r from-red-400 to-red-500 text-white"
                    } shadow-lg`}
                  >
                    {user?.accountStatus}
                  </span>
                </div>

                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {user?.userName}
                  </h2>
                  <p className="text-gray-600 mb-4 flex items-center justify-center sm:justify-start gap-2">
                    <MapPin size={18} className="text-blue-600" />
                    {user?.country}
                  </p>
                  <button
                    onClick={handleEditProfile}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                  {/* Signature preview and quick action */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Digital Signature
                    </h4>
                    {signatureUrl ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={signatureUrl}
                          alt="Signature"
                          className="h-12 object-contain border rounded-md bg-white"
                          onError={(e) => {
                            console.warn(
                              "Signature failed to load:",
                              signatureUrl
                            );
                            e.target.style.display = "none";
                          }}
                        />
                        <button
                          onClick={() => setShowSignatureEditor(true)}
                          className="px-3 py-1 text-sm bg-[#1F3A93] text-white rounded-md"
                        >
                          Update Signature
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-36 border rounded-md flex items-center justify-center text-sm text-gray-500 bg-gray-50">
                          No signature saved
                        </div>
                        <button
                          onClick={() => setShowSignatureEditor(true)}
                          className="px-3 py-1 text-sm bg-[#1F3A93] text-white rounded-md"
                        >
                          Add Signature
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Work Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                      <Briefcase size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <p className="font-semibold text-gray-900">
                        {user?.userRole}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                      <Award size={24} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {user?.address}, {user?.country}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                      <Mail size={24} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                      <Phone size={24} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">
                        {user?.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Form - Conditionally Rendered */}
          {showPersonalInfo && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 animate-fadeIn">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  Personal Information
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 text-sm font-semibold flex items-center gap-2 shadow-lg"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 text-sm font-semibold flex items-center gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <User size={18} className="text-blue-600" />
                    Full Name
                  </label>
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                    type="text"
                    name="fullName"
                    value={personalInfo.fullName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Mail size={18} className="text-green-600" />
                    Email
                  </label>
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300"
                    type="email"
                    name="email"
                    value={personalInfo.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Phone size={18} className="text-orange-600" />
                    Phone Number
                  </label>
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-300"
                    type="tel"
                    name="phoneNumber"
                    value={personalInfo.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-1 group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Home size={18} className="text-purple-600" />
                    Address
                  </label>
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300"
                    type="text"
                    name="address"
                    value={personalInfo.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Flag size={18} className="text-red-600" />
                    Country
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all duration-300 cursor-pointer"
                    name="country"
                    value={personalInfo.country}
                    onChange={handleInputChange}
                  >
                    <option>USA</option>
                    <option>India</option>
                    <option>UK</option>
                    <option>China</option>
                    <option>Japan</option>
                  </select>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Calendar size={18} className="text-indigo-600" />
                    Date of Birth
                  </label>
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 cursor-pointer"
                    type="date"
                    name="dateOfBirth"
                    value={personalInfo.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Content will be added here as needed */}
          </div>
        </div>
      </div>
      {/* Signature Editor Modal */}
      {showSignatureEditor && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add / Update Signature</h3>
              <button
                onClick={() => setShowSignatureEditor(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                Close
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Draw your digital signature below and click "Save Signature".
                After upload finishes the signature will be saved to your
                profile.
              </p>

              <SignaturePad
                initialValue={signatureUrl}
                onSave={(serverPath) => {
                  // SignaturePad will upload to server and return the server path
                  handleSignatureSaved(serverPath);
                }}
              />

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowSignatureEditor(false)}
                  className="px-4 py-2 rounded bg-gray-100 text-gray-700"
                  disabled={isSavingSignature}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // The Save action is handled inside SignaturePad; instruct user
                    // to press the "Save Signature" button there. We'll show a hint.
                    // Optionally we could trigger the upload programmatically if we exposed a ref.
                  }}
                  className="px-4 py-2 rounded bg-[#1F3A93] text-white"
                  disabled={isSavingSignature}
                >
                  {isSavingSignature ? "Saving..." : "Saving to Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
