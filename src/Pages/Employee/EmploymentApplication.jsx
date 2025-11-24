import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
  Briefcase,
  Shield,
  FileSignature,
  RotateCcw,
} from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import { Navbar } from "../../Components/Common/Navbar/Navbar";
import { toast } from "react-hot-toast";
import axios from "axios";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";
import HRNotesIndicator from "../../Components/Common/HRNotesIndicator";
import Cookies from "js-cookie";

const formatDateForInput = (isoDate) => {
  if (!isoDate) return "";
  const dateStr = String(isoDate).trim();
  // Check if it's a valid date format (YYYY-MM-DD or ISO)
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}(T|$)/)) {
    return dateStr.split("T")[0];
  }
  // Return empty for invalid dates
  return "";
};

const EmploymentApplication = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Information
    applicantInfo: {
      firstName: "",
      middleName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      phone: "",
      email: "",
      ssn: "",
      positionApplied: "",
      desiredSalary: "",
      dateAvailable: "",
      employmentType: "",
      authorizedToWork: "",
      workedForCompanyBefore: {
        hasWorked: false,
        when: "",
      },
      convictedOfFelony: "",
      felonyExplanation: "",
    },

    // Education
    education: {
      highSchool: {
        name: "",
        address: "",
        from: "",
        to: "",
        graduated: "",
        diploma: "",
      },
      college: {
        name: "",
        address: "",
        from: "",
        to: "",
        graduated: "",
        degree: "",
      },
      other: {
        name: "",
        address: "",
        from: "",
        to: "",
        graduated: "",
        degree: "",
      },
    },

    // References
    references: [
      {
        fullName: "",
        relationship: "",
        company: "",
        phone: "",
        address: "",
      },
      {
        fullName: "",
        relationship: "",
        company: "",
        phone: "",
        address: "",
      },
      {
        fullName: "",
        relationship: "",
        company: "",
        phone: "",
        address: "",
      },
    ],

    // Signature
    signature: "",
    date: "",
  });

  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    initializeForm();
  }, []);

  const getFormKeysForPosition = (positionType) => {
    const baseFormKeys = [
      "personalInformation",
      "professionalExperience",
      "workExperience",
      "education",
      "references",
      "legalDisclosures",
      "positionType",
      "employmentApplication",
      "orientationPresentation",
      "w4Form",
      "w9Form",
      "i9Form",
      "emergencyContact",
      "directDeposit",
      "misconductStatement",
      "codeOfEthics",
      "serviceDeliveryPolicy",
      "nonCompeteAgreement",
      "backgroundCheck",
      "tbSymptomScreen",
      "orientationChecklist",
    ];

    switch (positionType) {
      case 'PCA':
        return [...baseFormKeys, "jobDescriptionPCA", "pcaTrainingQuestions"];
      case 'CNA':
        return [...baseFormKeys, "jobDescriptionCNA"];
      case 'LPN':
        return [...baseFormKeys, "jobDescriptionLPN"];
      case 'RN':
        return [...baseFormKeys, "jobDescriptionRN"];
      default:
        return baseFormKeys;
    }
  };

  const fetchProgressData = async (userId) => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${userId}`,
        { withCredentials: true }
      );

      if (response.data?.data) {
        const backendData = response.data.data;
        const forms = backendData.forms || {};
        const completedSet = new Set(
          backendData.application?.completedForms || []
        );

        const positionType = forms.positionType?.positionAppliedFor || "";
        const formKeys = getFormKeysForPosition(positionType);

        const completedForms = formKeys.filter((key) => {
          const form = forms[key];
          return (
            form?.status === "submitted" ||
            form?.status === "completed" ||
            form?.status === "under_review" ||
            form?.status === "approved" ||
            completedSet.has(key)
          );
        }).length;

        const totalForms = formKeys.length;
        const percentage = Math.round((completedForms / totalForms) * 100);

        setOverallProgress(percentage);
        setCompletedFormsCount(completedForms);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const initializeForm = async () => {
    try {
      const userCookie = Cookies.get("user");
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");

      console.log("User cookie:", userCookie); // Debug log
      console.log("Session token:", sessionToken); // Debug log
      console.log("Access token:", accessToken); // Debug log

      // Try to get user data with fallback
      let user;
      try {
        user = userCookie ? JSON.parse(userCookie) : null;
      } catch (e) {
        console.error("Error parsing user cookie:", e);
        user = null;
      }

      // Use fallback test user if no user cookie (similar to W4Form)
      if (!user || !user._id) {
        console.log("No user found, using test user for development");
        user = { _id: "67e0f8770c6feb6ba99d11d2" };
      }

      // Use token with fallback
      const token = sessionToken || accessToken;

      console.log("Final user:", user); // Debug log
      console.log("Final token:", token); // Debug log

      console.log("Initializing form for user:", user._id); // Debug log

      await fetchProgressData(user._id);

      // Get or create onboarding application
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        {
          headers,
          withCredentials: true,
        }
      );

      console.log("API Response in form:", response.data); // Debug log

      if (
        response.data &&
        response.data.data &&
        response.data.data.application
      ) {
        setApplicationId(response.data.data.application._id);
        console.log("Application ID set:", response.data.data.application._id); // Debug log

        // Load existing employment application data if it exists
        if (response.data.data.forms.employmentApplication) {
          const existingData = response.data.data.forms.employmentApplication;
          setFormData({
            ...existingData,
            applicantInfo: {
              ...existingData.applicantInfo,
              dateAvailable: formatDateForInput(
                existingData.applicantInfo?.dateAvailable
              ),
            },
            education: {
              highSchool: {
                ...existingData.education?.highSchool,
                from: formatDateForInput(
                  existingData.education?.highSchool?.from
                ),
                to: formatDateForInput(existingData.education?.highSchool?.to),
              },
              college: {
                ...existingData.education?.college,
                from: formatDateForInput(existingData.education?.college?.from),
                to: formatDateForInput(existingData.education?.college?.to),
              },
              other: {
                ...existingData.education?.other,
                from: formatDateForInput(existingData.education?.other?.from),
                to: formatDateForInput(existingData.education?.other?.to),
              },
            },
            date: formatDateForInput(existingData.date),
            hrFeedback: existingData.hrFeedback || null,
          });
          console.log("Form data loaded:", existingData); // Debug log
        }
      } else {
        console.error("Invalid response structure in form:", response.data);
        toast.error("Failed to initialize form - invalid response");
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (path, value) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const keys = path.split(".");
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayInputChange = (arrayPath, index, field, value) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const keys = arrayPath.split(".");
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      if (!current[keys[keys.length - 1]]) {
        current[keys[keys.length - 1]] = [];
      }

      if (!current[keys[keys.length - 1]][index]) {
        current[keys[keys.length - 1]][index] = {};
      }

      current[keys[keys.length - 1]][index][field] = value;
      return newData;
    });
  };

  const saveForm = async (status = "draft") => {
    if (!applicationId) {
      toast.error("Application ID not found");
      return;
    }

    setSaving(true);
    try {
      const userCookie = Cookies.get("user");
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");

      // Use fallback user if needed
      const user = userCookie
        ? JSON.parse(userCookie)
        : { _id: "67e0f8770c6feb6ba99d11d2" };
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${baseURL}/onboarding/save-employment-application`,
        {
          applicationId,
          employeeId: user._id,
          formData,
          status,
        },
        {
          headers,
          withCredentials: true,
        }
      );

      if (response.data) {
        const message =
          status === "draft"
            ? "Employment application saved as draft"
            : "Employment application completed successfully!";

        toast.success(message);
        await fetchProgressData(user._id);
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error(error.response?.data?.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveForm("completed");
    // Wait for backend to save before triggering refresh
    setTimeout(() => {
      window.dispatchEvent(new Event('formStatusUpdated'));
      navigate("/employee/orientation-presentation");
    }, 500);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RotateCcw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading employment application...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {/* HR Feedback Section */}
            <HRFeedback
              hrFeedback={formData.hrFeedback}
              formStatus={formData.status}
            />

            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/employee/onboarding")}
                className="inline-flex items-center px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium w-24"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            {/* Main Form Container */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <form onSubmit={handleSubmit}>
                {/* Header Section */}
                <div className="bg-[#1F3A93] text-white p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                          Employment Application
                        </h1>
                        <p className="text-blue-100">
                          Complete your employment application for Pacific
                          Health Services
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => saveForm("draft")}
                        disabled={saving}
                        type="button"
                        className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Saving..." : "Save Draft"}
                      </button>
                    </div>
                  </div>
                </div>
                {/* Personal Information */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-[#1F3A93] mb-6 pb-2 border-b-2 border-[#1F3A93]">
                    Personal Information
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.applicantInfo.firstName}
                          onChange={(e) =>
                            handleInputChange(
                              "applicantInfo.firstName",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Middle Name
                        </label>
                        <input
                          type="text"
                          value={formData.applicantInfo.middleName}
                          onChange={(e) =>
                            handleInputChange(
                              "applicantInfo.middleName",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.applicantInfo.lastName}
                          onChange={(e) =>
                            handleInputChange(
                              "applicantInfo.lastName",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
                        />
                      </div>
                    </div>



                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.applicantInfo.phone}
                          onChange={(e) =>
                            handleInputChange(
                              "applicantInfo.phone",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.applicantInfo.email}
                          onChange={(e) =>
                            handleInputChange(
                              "applicantInfo.email",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
                        />
                      </div>
                    </div>

                    {/* Employment Questions */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Are you authorized to work in the United States?{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="Yes"
                              checked={
                                formData.applicantInfo.authorizedToWork ===
                                "Yes"
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "applicantInfo.authorizedToWork",
                                  e.target.value
                                )
                              }
                              className="mr-2 text-blue-600 focus:ring-blue-600"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="No"
                              checked={
                                formData.applicantInfo.authorizedToWork === "No"
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "applicantInfo.authorizedToWork",
                                  e.target.value
                                )
                              }
                              className="mr-2 text-blue-600 focus:ring-blue-600"
                            />
                            No
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="p-6 border-t border-gray-200">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Application Progress
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {completedFormsCount}/{getFormKeysForPosition("").length}
                        </div>
                        <div className="text-xs text-gray-600">
                          Forms Completed
                        </div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">
                          Overall Progress
                        </span>
                        <span className="text-xs font-bold text-blue-600">
                          {overallProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${overallProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="p-6 border-t border-gray-200">
                  <h2 className="text-xl font-bold text-[#1F3A93] mb-6 pb-2 border-b-2 border-[#1F3A93]">
                    Signature
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Digital Signature{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.signature}
                        onChange={(e) =>
                          handleInputChange("signature", e.target.value)
                        }
                        placeholder="Type your full name as your digital signature"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) =>
                          handleInputChange("date", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        By submitting this form, I certify that the information
                        provided is true and accurate.
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {saving ? (
                        <RotateCcw className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      {saving ? "Completing..." : "Complete Form"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Floating HR Notes Indicator */}
      {formData.hrFeedback && (
        <div className="fixed bottom-6 right-6 z-50">
          <HRNotesIndicator
            hrFeedback={formData.hrFeedback}
            formStatus={formData.status}
            formTitle="Employment Application"
          />
        </div>
      )}
    </Layout>
  );
};

export default EmploymentApplication;
