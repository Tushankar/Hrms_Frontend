import { useState, useEffect } from "react";
import { ArrowLeft, Send, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
const OrientationChecklistHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams(); // Changed from userId to employeeId

  // Base URL configuration
  const baseURL = import.meta.env.VITE__BASEURL || "http://localhost:1111";

  // State for form fields
  const [formData, setFormData] = useState({
    policies: false,
    duties: false,
    emergencies: false,
    tbExposure: false,
    clientRights: false,
    complaints: false,
    documentation: false,
    handbook: false,
    applicantSignature: "",
    signatureDate: "",
  });

  // State for notes section
  const [notes, setNotes] = useState("");
  const [existingFeedback, setExistingFeedback] = useState(null);

  // State for application data
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load application data on component mount
  useEffect(() => {
    const loadApplicationData = async () => {
      try {
        setLoading(true);
        console.log(
          "Loading orientation checklist data for employeeId:",
          employeeId
        );

        if (employeeId) {
          const apiUrl = `${baseURL}/onboarding/get-application/${employeeId}`;
          console.log("🔗 Making request to:", apiUrl);

          // Fetch orientation checklist data from backend using userId
          const response = await axios.get(apiUrl, { withCredentials: true });

          console.log("Orientation checklist API response:", response.data);

          // Check if we have data (the API returns data directly without a success flag)
          if (response.data && response.data.data) {
            const orientationChecklistData =
              response.data.data.forms?.orientationChecklist;
            console.log("Full API Response:", response.data.data);
            console.log(
              "Orientation Checklist Data:",
              orientationChecklistData
            );

            if (orientationChecklistData) {
              // Set application data for display
              setApplicationData({
                employeeName:
                  `${orientationChecklistData.firstName || ""} ${
                    orientationChecklistData.lastName || ""
                  }`.trim() || "N/A",
                employeeEmail: orientationChecklistData.email || "N/A",
                applicationId: employeeId,
              });

              // Map backend data to form structure - properly extract all checkbox values
              setFormData({
                policies:
                  orientationChecklistData.policies === true ||
                  orientationChecklistData.policies === "true" ||
                  false,
                duties:
                  orientationChecklistData.duties === true ||
                  orientationChecklistData.duties === "true" ||
                  false,
                emergencies:
                  orientationChecklistData.emergencies === true ||
                  orientationChecklistData.emergencies === "true" ||
                  false,
                tbExposure:
                  orientationChecklistData.tbExposure === true ||
                  orientationChecklistData.tbExposure === "true" ||
                  false,
                clientRights:
                  orientationChecklistData.clientRights === true ||
                  orientationChecklistData.clientRights === "true" ||
                  false,
                complaints:
                  orientationChecklistData.complaints === true ||
                  orientationChecklistData.complaints === "true" ||
                  false,
                documentation:
                  orientationChecklistData.documentation === true ||
                  orientationChecklistData.documentation === "true" ||
                  false,
                handbook:
                  orientationChecklistData.handbook === true ||
                  orientationChecklistData.handbook === "true" ||
                  false,
                applicantSignature:
                  orientationChecklistData.applicantSignature || "",
                signatureDate: orientationChecklistData.signatureDate
                  ? new Date(orientationChecklistData.signatureDate)
                      .toISOString()
                      .slice(0, 10)
                  : "",
              });

              console.log("Form Data Set:", {
                policies: orientationChecklistData.policies,
                duties: orientationChecklistData.duties,
                emergencies: orientationChecklistData.emergencies,
                tbExposure: orientationChecklistData.tbExposure,
                clientRights: orientationChecklistData.clientRights,
                complaints: orientationChecklistData.complaints,
                documentation: orientationChecklistData.documentation,
                handbook: orientationChecklistData.handbook,
                applicantSignature: orientationChecklistData.applicantSignature,
                signatureDate: orientationChecklistData.signatureDate,
              });

              // Load existing HR feedback
              if (orientationChecklistData.hrFeedback) {
                setExistingFeedback(orientationChecklistData.hrFeedback);
              }
            } else {
              console.warn("No orientationChecklist object in forms");
              toast.error("No orientation checklist data found for this user");
              setApplicationData({
                employeeName: "No data found",
                employeeEmail: "No data found",
                applicationId: employeeId,
              });
            }
          } else {
            console.error(
              "No orientation checklist data received:",
              response.data?.message || "No data in response"
            );
            toast.error("No orientation checklist data found for this user");
            setApplicationData({
              employeeName: "No data found",
              employeeEmail: "No data found",
              applicationId: employeeId,
            });
          }
        }
      } catch (error) {
        console.error("Error loading orientation checklist data:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
          toast.error(
            `Failed to load orientation checklist data: ${
              error.response.data?.message || error.response.statusText
            }`
          );
        } else if (error.request) {
          console.error("Network error:", error.request);
          toast.error("Network error: Unable to connect to server");
        } else {
          console.error("Error:", error.message);
          toast.error("Failed to load orientation checklist data");
        }
        setApplicationData({
          employeeName: "Error loading data",
          employeeEmail: "Error loading data",
          applicationId: employeeId,
        });
      } finally {
        setLoading(false);
      }
    };

    loadApplicationData();
  }, [employeeId]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSendNotes = async () => {
    if (!notes.trim()) {
      toast.error("Please enter some notes before sending.");
      return;
    }

    try {
      console.log(
        "Sending orientation checklist notes for employeeId:",
        employeeId
      );

      const apiUrl = `${baseURL}/onboarding/submit-notes`;
      console.log("🔗 Making notes request to:", apiUrl);

      const payload = {
        userId: employeeId,
        notes: notes.trim(),
        formType: "OrientationChecklist",
        timestamp: new Date().toISOString(),
      };

      console.log("📝 Notes payload:", payload);

      // Send notes to backend
      const response = await axios.post(apiUrl, payload, {
        withCredentials: true,
      });

      console.log("Notes submission response:", response.data);

      if (
        response.data &&
        response.data.message === "HR feedback submitted successfully"
      ) {
        toast.success("Notes sent successfully!");
        setNotes("");
        // Update existing feedback with the new feedback
        if (response.data.form && response.data.form.hrFeedback) {
          setExistingFeedback(response.data.form.hrFeedback);
        }
      } else {
        console.error(
          "Notes submission failed:",
          response.data?.message || "Unknown error"
        );
        toast.error(
          `Failed to send notes: ${response.data?.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error sending notes:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(
          `Failed to send notes: ${
            error.response.data?.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        console.error("Network error:", error.request);
        toast.error("Network error: Unable to connect to server");
      } else {
        console.error("Error:", error.message);
        toast.error("Failed to send notes. Please try again.");
      }
    }
  };

  const statements = [
    {
      key: "policies",
      text: "I have read and understand the policies and procedures regarding scope of services and the types of clients served",
      highlight: "bg-gradient-to-r from-blue-50 to-indigo-50",
    },
    {
      key: "duties",
      text: "I have read and understand my assigned duties and responsibilities",
      highlight: "bg-gradient-to-r from-amber-50 to-yellow-50",
    },
    {
      key: "emergencies",
      text: "I understand to report client emergencies, problems and/or progress to supervisory nurse",
      highlight: "bg-gradient-to-r from-sky-50 to-blue-50",
    },
    {
      key: "tbExposure",
      text: "I understand that I must report suspected exposure to TB to the agency",
      highlight: "bg-gradient-to-r from-emerald-50 to-green-50",
    },
    {
      key: "clientRights",
      text: "I have read and understand the client rights",
      highlight: "bg-gradient-to-r from-orange-50 to-amber-50",
    },
    {
      key: "complaints",
      text: "I have read procedures regarding handling of complaints, medical emergencies and other incidents",
      highlight: "bg-gradient-to-r from-purple-50 to-violet-50",
    },
    {
      key: "documentation",
      text: "I have read and understand the required daily documentation of activities as client is being served",
      highlight: "bg-gradient-to-r from-teal-50 to-emerald-50",
    },
    {
      key: "handbook",
      text: "I have received a copy of the Pacific Health Systems Employee Handbook",
      highlight: "bg-gradient-to-r from-indigo-50 to-blue-50",
    },
  ];

  return (
    <Layout>
      {/* Add Southampton Script font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
        rel="stylesheet"
      />
      <div className="h-full flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium w-24"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93]"></div>
                  <span className="ml-3 text-gray-600">
                    Loading application data...
                  </span>
                </div>
              </div>
            ) : (
              /* Main Form Container */
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Header Section */}
                <div className="bg-[#1F3A93] text-white p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            PHS
                          </span>
                        </div>
                      </div>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                          PACIFIC HEALTH SYSTEMS
                        </h1>
                        <p className="text-blue-100">
                          PRIVATE HOMECARE SERVICES
                        </p>
                      </div>
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold mb-2">
                      Employee Orientation Checklist
                    </h2>
                    <p className="text-blue-100 text-sm">
                      HR Review - Orientation Documentation Form
                    </p>
                    {employeeId && (
                      <p className="text-blue-100 text-xs mt-1">
                        User ID: {employeeId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6 md:p-8">
                  {/* Introduction */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b-2 border-[#1F3A93]">
                      Orientation Requirements
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      This checklist documents that the employee has completed
                      all required orientation activities and understands their
                      responsibilities, policies, and procedures for providing
                      quality homecare services.
                    </p>
                  </div>

                  {/* Orientation Checklist Items */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[#1F3A93] mb-6 pb-2 border-b-2 border-[#1F3A93]">
                      Completed Orientation Items
                    </h3>
                    <div className="space-y-4">
                      {statements.map((statement, index) => (
                        <div
                          key={statement.key}
                          className={`p-4 rounded-lg border border-gray-200 transition-all duration-200 ${statement.highlight}`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  formData[statement.key]
                                    ? "bg-[#1F3A93] border-[#1F3A93] text-white"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                {formData[statement.key] && (
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-800 leading-relaxed">
                                <span className="font-semibold text-[#1F3A93] mr-2">
                                  {index + 1}.
                                </span>
                                {statement.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Completion Summary */}
                  <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-bold text-green-800 mb-4">
                      Checklist Completion Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {statements.map((statement) => (
                        <div
                          key={statement.key}
                          className={`p-3 rounded-lg text-center text-sm font-medium ${
                            formData[statement.key]
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-gray-100 text-gray-600 border border-gray-300"
                          }`}
                        >
                          <div className="text-lg mb-1">
                            {formData[statement.key] ? "✓" : "✗"}
                          </div>
                          <div>
                            {statement.key === "policies"
                              ? "Policies"
                              : statement.key === "duties"
                              ? "Duties"
                              : statement.key === "emergencies"
                              ? "Emergencies"
                              : statement.key === "tbExposure"
                              ? "TB Exposure"
                              : statement.key === "clientRights"
                              ? "Client Rights"
                              : statement.key === "complaints"
                              ? "Complaints"
                              : statement.key === "documentation"
                              ? "Documentation"
                              : "Handbook"}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Completion Rate:</span>{" "}
                        <span className="text-lg font-bold text-green-700">
                          {Math.round(
                            (Object.values(formData).slice(0, 8).filter(Boolean)
                              .length /
                              8) *
                              100
                          )}
                          %
                        </span>{" "}
                        (
                        {
                          Object.values(formData).slice(0, 8).filter(Boolean)
                            .length
                        }
                        /8 items completed)
                      </p>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Employee Signatures & Date
                    </h3>
                    <div className="grid grid-cols-1 gap-8">
                      <div>
                        {formData.applicantSignature ? (
                          <div className="mb-6 bg-white p-4 rounded-lg border-2 border-blue-300">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Employee Signature
                            </label>
                            <div
                              className="w-full px-4 py-6 text-center border-2 border-dashed border-green-400 bg-green-50 rounded-lg"
                              style={{
                                fontFamily: "'Great Vibes', cursive",
                                fontSize: "48px",
                                letterSpacing: "0.5px",
                                color: "#1F3A93",
                              }}
                            >
                              {formData.applicantSignature}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              ✓ Signature provided (displayed in Great Vibes
                              font)
                            </p>
                          </div>
                        ) : (
                          <div className="mb-6 bg-white p-4 rounded-lg border-2 border-red-300">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Employee Signature
                            </label>
                            <div className="w-full px-4 py-6 text-center border-2 border-dashed border-red-300 bg-red-50 rounded-lg text-gray-500">
                              No signature provided
                            </div>
                            <p className="text-xs text-red-600 mt-2">
                              ✗ Employee has not provided a signature
                            </p>
                          </div>
                        )}

                        <div>
                          {formData.signatureDate ? (
                            <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Signature Date
                              </label>
                              <div className="w-full px-4 py-3 border rounded-md bg-green-50 border-green-400 font-semibold text-gray-800">
                                {new Date(
                                  formData.signatureDate
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                ✓ Date signed: {formData.signatureDate}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-white p-4 rounded-lg border-2 border-red-300">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Signature Date
                              </label>
                              <div className="w-full px-4 py-3 border rounded-md bg-red-50 border-red-400 text-gray-500">
                                No date provided
                              </div>
                              <p className="text-xs text-red-600 mt-2">
                                ✗ No signature date available
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Existing HR Feedback Display */}
                  {existingFeedback && existingFeedback.length > 0 && (
                    <div className="mt-8 bg-green-50 p-6 rounded-lg border border-green-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-green-600" />
                        Previous HR Feedback
                      </h3>
                      <div className="space-y-4">
                        {existingFeedback.map((feedback, index) => (
                          <div
                            key={index}
                            className="bg-white p-4 rounded-md border border-green-200"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-gray-600">
                                {new Date(
                                  feedback.timestamp
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span className="text-xs text-gray-500">
                                #{existingFeedback.length - index}
                              </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {feedback.notes}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes Section */}
                  <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      HR Notes
                    </h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your notes about this orientation checklist review..."
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1F3A93] focus:border-[#1F3A93] resize-none"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm text-gray-500">
                        {notes.length}/500 characters
                      </span>
                      <button
                        onClick={handleSendNotes}
                        disabled={!notes.trim()}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                          notes.trim()
                            ? "bg-[#1F3A93] text-white hover:bg-[#1A3280] focus:ring-2 focus:ring-[#1F3A93]/20 shadow-sm hover:shadow-md"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <Send className="h-4 w-4" />
                        Send Notes
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-500">
                      © 2025 Pacific Health Systems - Private Homecare Services.
                      All rights reserved.
                    </p>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-center gap-4 items-center px-6 md:px-8 pb-6 mt-8">
                  <button
                    onClick={() =>
                      navigate(`/hr/orientation-presentation/${employeeId}`)
                    }
                    className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous: Orientation Presentation
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Exit to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toaster for notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              style: {
                background: "#10B981",
                color: "#fff",
              },
            },
            error: {
              style: {
                background: "#EF4444",
                color: "#fff",
              },
            },
          }}
        />
      </div>
    </Layout>
  );
};

export default OrientationChecklistHR;
