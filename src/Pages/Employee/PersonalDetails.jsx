import React, { useState } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import VecIcon from "../../assets/VecIcon.png";
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
  Shield,
} from "lucide-react";

export const PersonalDetails = () => {
  const baseURL = import.meta.env.VITE__BASEURL;
  const userToken = Cookies.get("session");
  const decodedToken = userToken && jwtDecode(userToken);
  const user = decodedToken?.user;

  // Get user data from cookie for latest OTP status
  const userCookie = Cookies.get("user");
  const userData = userCookie ? JSON.parse(userCookie) : user;
  const [isEditing, setIsEditing] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: userData?.userName || "Roger Steven",
    email: userData?.email || "example@gmail.com",
    phoneNumber: userData?.phoneNumber || "+1 923-494-2358",
    address:
      userData?.address ||
      "Lorem ipsum, consectetur eli dolor sit, New york, USA.",
    country: userData?.country || "USA",
    dateOfBirth: userData?.dateOfBirth || "",
  });
  const [otpEnabled, setOtpEnabled] = useState(userData?.otpEnabled || false);
  const [isTogglingOtp, setIsTogglingOtp] = useState(false);
  // Helper to build normalized full URL
  const buildFullUrl = (relativePath) => {
    if (!relativePath) return "";
    const base = (baseURL || "").replace(/\/+$/, "");
    const rel = relativePath.replace(/^\/+/, "");
    return `${base}/${rel}`;
  };

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

  const handleToggleOTP = async () => {
    setIsTogglingOtp(true);
    try {
      const userToken = Cookies.get("session");
      const response = await axios.post(
        `${baseURL}/auth/toggle-otp`,
        {
          userId: user?._id,
          otpEnabled: !otpEnabled,
        },
        {
          headers: {
            Authorization: userToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "Success") {
        setOtpEnabled(!otpEnabled);
        // Update user cookie
        const updatedUser = { ...user, otpEnabled: !otpEnabled };
        Cookies.set("user", JSON.stringify(updatedUser), {
          path: "/",
          expiresIn: "2d",
        });
      }
    } catch (error) {
      console.error("Error toggling OTP:", error);
    } finally {
      setIsTogglingOtp(false);
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
                      userData?.profileImage
                        ? buildFullUrl(userData.profileImage)
                        : VecIcon
                    }
                    className="w-36 h-36 rounded-2xl object-cover border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-300"
                    alt="Profile"
                  />
                  <span
                    className={`absolute -bottom-2 -right-2 px-4 py-1.5 rounded-full text-xs font-semibold ${
                      userData?.accountStatus === "active"
                        ? "bg-gradient-to-r from-green-400 to-green-500 text-white"
                        : "bg-gradient-to-r from-red-400 to-red-500 text-white"
                    } shadow-lg`}
                  >
                    {userData?.accountStatus}
                  </span>
                </div>

                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {userData?.userName}
                  </h2>
                  <p className="text-gray-600 mb-4 flex items-center justify-center sm:justify-start gap-2">
                    <MapPin size={18} className="text-blue-600" />
                    {userData?.country}
                  </p>
                  <button
                    onClick={handleEditProfile}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                  <div className="mt-4 ml-4">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                      <h4 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Shield size={20} className="text-blue-600" />
                        Two-Factor Authentication
                      </h4>
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                        Do you want OTP verification after every login for
                        enhanced security?
                      </p>
                      <button
                        onClick={handleToggleOTP}
                        disabled={isTogglingOtp}
                        className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium text-sm ${
                          otpEnabled
                            ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                            : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                        } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                      >
                        <Shield size={16} />
                        {isTogglingOtp
                          ? "Updating..."
                          : otpEnabled
                          ? "Disable OTP"
                          : "Enable OTP"}
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        {otpEnabled
                          ? "OTP is currently enabled. You'll receive a code via email on each login."
                          : "OTP is currently disabled. Enable for additional security."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-1">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase size={24} className="text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Role
                      </p>
                      <p className="font-semibold text-gray-900 text-base mt-2">
                        {userData?.userRole}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail size={24} className="text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Email
                      </p>
                      <p className="font-semibold text-gray-900 text-base mt-2 break-all">
                        {userData?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone size={24} className="text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Phone
                      </p>
                      <p className="font-semibold text-gray-900 text-base mt-2">
                        {userData?.phoneNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin size={24} className="text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Address Line
                      </p>
                      <p className="font-semibold text-gray-900 text-base mt-2">
                        {userData?.addressLine1 || userData?.address || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin size={24} className="text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Country
                      </p>
                      <p className="font-semibold text-gray-900 text-base mt-2">
                        {userData?.country || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin size={24} className="text-teal-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        State
                      </p>
                      <p className="font-semibold text-gray-900 text-base mt-2">
                        {userData?.state || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin size={24} className="text-cyan-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        City
                      </p>
                      <p className="font-semibold text-gray-900 text-base mt-2">
                        {userData?.city || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award size={24} className="text-pink-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Zip Code
                      </p>
                      <p className="font-semibold text-gray-900 text-base mt-2">
                        {userData?.zip || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar size={24} className="text-rose-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Date of Birth
                      </p>
                      <p className="font-semibold text-gray-900 text-base mt-2">
                        {userData?.dateOfBirth
                          ? new Date(userData.dateOfBirth).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
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
    </Layout>
  );
};
