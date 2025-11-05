import { useState, useEffect } from "react";
import { ArrowLeft, Save, FileText, Calendar, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";

const EditMisconductForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [formData, setFormData] = useState({
    staffTitle: "",
    employeeName: "",
    employmentPosition: "",
    signature: "",
    date: null,
    witnessName: "",
    witnessSignature: "",
    witnessDate: null,
    witnessStatement: "",
    notaryDate: "",
    notaryMonth: "",
    notaryYear: "",
    notarySignature: "",
  });

  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    initializeForm();
  }, []);

  const initializeForm = async () => {
    try {
      const userCookie = Cookies.get("user");
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");

      // Use fallback user if needed
      let user;
      try {
        user = userCookie ? JSON.parse(userCookie) : null;
      } catch (e) {
        console.error("Error parsing user cookie:", e);
        user = null;
      }

      if (!user || !user._id) {
        console.log("No user found, using test user for development");
        user = { _id: "67e0f8770c6feb6ba99d11d2" };
      }

      const token = sessionToken || accessToken;

      console.log("Initializing Edit Misconduct form for user:", user._id); // Debug log

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

      if (
        response.data &&
        response.data.data &&
        response.data.data.application
      ) {
        setApplicationId(response.data.data.application._id);

        // Load existing form data if it exists
        if (response.data.data.forms.misconductStatement) {
          setFormData(response.data.data.forms.misconductStatement);
        }
      }
    } catch (error) {
      console.error("Error initializing edit form:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

      const user = userCookie
        ? JSON.parse(userCookie)
        : { _id: "67e0f8770c6feb6ba99d11d2" };
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${baseURL}/onboarding/save-traditional-misconduct-statement`,
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
            ? "Form saved as draft"
            : "Form completed successfully!";

        toast.success(message);

        if (status === "completed") {
          setTimeout(() => navigate("/employee/onboarding"), 2000);
        }
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error(error.response?.data?.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.employeeName || !formData.signature) {
      toast.error(
        "Please fill in required fields: Employee Name and Signature"
      );
      return;
    }
    saveForm("completed");
  };

  const handleSaveDraft = () => {
    saveForm("draft");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Layout>
      <style jsx global>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker__input-container input {
          width: 100%;
        }
        .react-datepicker {
          border: 1px solid #1f3a93;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .react-datepicker__header {
          background-color: #1f3a93;
          border-bottom: 1px solid #1f3a93;
        }
        .react-datepicker__current-month {
          color: white;
        }
        .react-datepicker__day-name {
          color: white;
        }
        .react-datepicker__day--selected {
          background-color: #1f3a93;
        }
        .react-datepicker__day:hover {
          background-color: #f0f5ff;
        }
      `}</style>

      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] to-[#F0F5FF] p-2 sm:p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-3 sm:px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base font-medium w-20 sm:w-24"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Back
            </button>
          </div>

          {/* Main Form Container */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div>
              {/* Header Section */}
              <div className="bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white p-4 sm:p-6 md:p-9">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-center tracking-wide leading-tight">
                    EDIT STAFF MISCONDUCT ABUSE STATEMENT FORM
                  </h1>
                </div>
                <p className="text-blue-100 text-center max-w-2xl mx-auto text-xs sm:text-sm md:text-base font-medium px-2">
                  Edit and complete this form to acknowledge compliance with
                  Pacific Health Systems LLC policies and procedures
                </p>
              </div>

              {/* Form Content */}
              <div className="px-4 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 md:py-12 space-y-4 sm:space-y-6 text-sm sm:text-base leading-relaxed text-gray-700">
                {/* Staff Title */}
                <div className="mb-8 sm:mb-12">
                  <label className="block text-sm sm:text-base uppercase tracking-wide font-bold text-gray-700 mb-2 sm:mb-3">
                    STAFF TITLE: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.staffTitle}
                    onChange={(e) =>
                      handleInputChange("staffTitle", e.target.value)
                    }
                    placeholder="Enter your staff title or position"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                  />
                </div>

                {/* Declaration Section */}
                <div className="mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
                  <p className="mb-3 sm:mb-4 text-justify">
                    I understand and acknowledge that I must comply with{" "}
                    <span className="font-semibold">
                      Pacific Health Systems LLC
                    </span>{" "}
                    Code of Conduct and Abuse or Misconduct program.
                  </p>
                  <p className="mb-3 sm:mb-4 text-justify">
                    All laws, regulations, policies & procedure as well as any
                    other applicable state or local ordinances as it pertains to
                    the responsibilities of my position.
                  </p>
                  <p className="mb-4 sm:mb-6 text-justify">
                    I understand that my failure to report any concerns
                    regarding possible violations of these laws, regulations,
                    and Policies may result in disciplinary action, up to and
                    including termination.
                  </p>
                </div>

                {/* Employee Information */}
                <div className="mb-6 sm:mb-8">
                  <div className="text-sm sm:text-base mb-3 sm:mb-4">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                      <span className="font-medium">I,</span>
                      <div className="flex-1 min-w-48 sm:min-w-64">
                        <input
                          type="text"
                          value={formData.employeeName}
                          onChange={(e) =>
                            handleInputChange("employeeName", e.target.value)
                          }
                          placeholder="Enter your full name"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                        />
                      </div>
                      <span className="text-red-500">*</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <span>as an employee of</span>
                      <span className="font-semibold">
                        Pacific Health Systems LLC
                      </span>
                      <span>,</span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base mb-4 sm:mb-6 text-justify">
                    hereby state that, I have never shown any misconduct nor
                    have a history of abuse and neglect of others.
                  </p>
                  <p className="text-sm sm:text-base mb-6 sm:mb-8 text-justify">
                    I acknowledge that I have received and read the Misconduct
                    or abuse statement form and that I clearly understand it.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {/* Employment Position */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm sm:text-base uppercase tracking-wide font-bold text-gray-700 mb-2 sm:mb-3">
                      Employment Position:
                    </label>
                    <input
                      type="text"
                      value={formData.employmentPosition}
                      onChange={(e) =>
                        handleInputChange("employmentPosition", e.target.value)
                      }
                      placeholder="Enter your current position"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                    {/* Signature */}
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-sm sm:text-base uppercase tracking-wide font-bold text-gray-700 mb-2 sm:mb-3">
                        Signature: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.signature}
                        onChange={(e) =>
                          handleInputChange("signature", e.target.value)
                        }
                        placeholder="Type your signature here"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                      />
                    </div>

                    {/* Date */}
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-sm sm:text-base uppercase tracking-wide font-bold text-gray-700 mb-2 sm:mb-3">
                        Date:
                      </label>
                      <div className="relative">
                        <DatePicker
                          selected={formData.date}
                          onChange={(date) => handleInputChange("date", date)}
                          placeholderText="Select date"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                          dateFormat="MM/dd/yyyy"
                        />
                        <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Witness Statement */}
                <div className="mb-6 sm:mb-8">
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm sm:text-base tracking-wide font-bold text-gray-700 mb-2 sm:mb-3">
                      Who having been first duly sworn depose and say that:
                    </label>
                    <textarea
                      value={formData.witnessStatement}
                      onChange={(e) =>
                        handleInputChange("witnessStatement", e.target.value)
                      }
                      placeholder="Enter witness statement details..."
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-transparent text-gray-800 p-3 text-sm sm:text-base transition-all duration-200 hover:border-[#1F3A93] resize-vertical"
                    />
                  </div>

                  <p className="text-sm sm:text-base mb-3 sm:mb-4 text-justify">
                    has never been shown to have exhibited any violent or
                    abusive behavior or intentional or grossly negligent
                    misconduct.
                  </p>
                  <p className="text-sm sm:text-base mb-4 sm:mb-6 text-justify">
                    Also have never been accused or convicted to have been
                    abused, neglected, sexually assaulted, exploited, or
                    deprived any person or to have subjected any person to
                    serious injury as a result of intentional or grossly
                    negligent misconduct as evidence by an oral or written
                    statement to the effect obtained at the time of application.
                  </p>
                </div>

                {/* Witness Signature Section */}
                <div className="mb-8 sm:mb-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                    {/* Print Name */}
                    <div className="mb-4 sm:mb-6 lg:col-span-1">
                      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3">
                        Print Name:
                      </label>
                      <input
                        type="text"
                        value={formData.witnessName}
                        onChange={(e) =>
                          handleInputChange("witnessName", e.target.value)
                        }
                        placeholder="Enter witness full name"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:col-span-1">
                      {/* Signature */}
                      <div className="mb-4 sm:mb-6">
                        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3">
                          Signature:
                        </label>
                        <input
                          type="text"
                          value={formData.witnessSignature}
                          onChange={(e) =>
                            handleInputChange(
                              "witnessSignature",
                              e.target.value
                            )
                          }
                          placeholder="Witness signature"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                        />
                      </div>

                      {/* Date */}
                      <div className="mb-4 sm:mb-6">
                        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3">
                          Date:
                        </label>
                        <div className="relative">
                          <DatePicker
                            selected={formData.witnessDate}
                            onChange={(date) =>
                              handleInputChange("witnessDate", date)
                            }
                            placeholderText="Select date"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                            dateFormat="MM/dd/yyyy"
                          />
                          <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notary Section */}
                <div className="pt-3 sm:pt-4">
                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4 sm:mb-6 tracking-wide font-mono">
                    Notary Affidavit
                  </h3>
                  <p className="text-sm sm:text-base mb-3 sm:mb-4 font-semibold tracking-wide font-mono">
                    State of: Georgia
                  </p>

                  <div className="mb-6 sm:mb-8">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm sm:text-base">
                      <span>Sworn and subscribed before me this</span>
                      <input
                        type="text"
                        value={formData.notaryDate}
                        onChange={(e) =>
                          handleInputChange("notaryDate", e.target.value)
                        }
                        placeholder="day"
                        className="w-12 sm:w-20 border border-gray-300 rounded px-2 py-1 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200 text-center"
                      />
                      <span>day of</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-sm sm:text-base">
                      <input
                        type="text"
                        value={formData.notaryMonth || ""}
                        onChange={(e) =>
                          handleInputChange("notaryMonth", e.target.value)
                        }
                        placeholder="month"
                        className="w-20 sm:w-28 border border-gray-300 rounded px-2 py-1 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200 text-center"
                      />
                      <span>Year</span>
                      <input
                        type="text"
                        value={formData.notaryYear}
                        onChange={(e) =>
                          handleInputChange("notaryYear", e.target.value)
                        }
                        placeholder="Year"
                        className="w-16 sm:w-20 border border-gray-300 rounded px-2 py-1 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200 text-center"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center mt-8 sm:mt-12">
                    <div className="w-full max-w-md text-center">
                      <label className="block text-sm sm:text-base uppercase tracking-wide font-bold text-gray-700 mb-2 sm:mb-3">
                        Notary Signature
                      </label>
                      <input
                        type="text"
                        value={formData.notarySignature || ""}
                        onChange={(e) =>
                          handleInputChange("notarySignature", e.target.value)
                        }
                        placeholder="Enter notary signature"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button Section */}
              <div className="px-4 sm:px-6 md:px-12 lg:px-16 pb-8 sm:pb-12">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-6 sm:mb-8">
                    <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                      Complete Your Statement
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600">
                      Review all information above before submitting
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto min-w-40 sm:min-w-48 py-3 sm:py-4 px-4 sm:px-6 bg-white border-2 border-[#1F3A93] text-[#1F3A93] font-semibold rounded-lg sm:rounded-xl hover:bg-[#F0F5FF] focus:ring-2 focus:ring-[#1F3A93]/20 active:bg-[#E8EDFF] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
                      onClick={handleSaveDraft}
                    >
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-base sm:text-lg">
                        Save as Draft
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto min-w-40 sm:min-w-48 py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-lg sm:rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 active:from-[#112451] active:to-[#16306e] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
                    >
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-base sm:text-lg">
                        Submit Statement
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              © 2024 PHS Healthcare Services. All rights reserved.
            </p>
          </div>

          {/* Toast Configuration */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "white",
                color: "#1F3A93",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "white",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "white",
                },
              },
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default EditMisconductForm;
