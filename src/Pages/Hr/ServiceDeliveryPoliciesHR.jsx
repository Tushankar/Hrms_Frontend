import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Save, X } from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export default function ServiceDeliveryPoliciesHR() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [employeeSignature, setEmployeeSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState("");
  const [policyInitials, setPolicyInitials] = useState({
    policy1: "",
    policy2: "",
    policy3: "",
    policy4: "",
    policy5: "",
  });
  const [policyContent, setPolicyContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState(null);
  const [savingContent, setSavingContent] = useState(false);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
      fetchPolicyContent();
    }
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      // Get employee's service delivery policy data from application
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        { withCredentials: true }
      );

      console.log(
        "Service Delivery Policy Response:",
        response.data?.data?.forms
      );

      if (response.data?.data?.forms?.serviceDeliveryPolicy) {
        const policyData = response.data.data.forms.serviceDeliveryPolicy;

        console.log("Policy Data:", policyData);

        // Set signature data
        if (policyData.employeeSignature) {
          setEmployeeSignature(policyData.employeeSignature);
        }
        if (policyData.employeeSignatureDate) {
          const dateObj = new Date(policyData.employeeSignatureDate);
          const formattedDate = dateObj.toISOString().split("T")[0];
          setSignatureDate(formattedDate);
        }

        // Set policy initials
        if (policyData.policyInitials) {
          setPolicyInitials(policyData.policyInitials);
        }
      } else {
        console.warn("No service delivery policy data found");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      toast.error("Failed to load employee data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicyContent = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-service-delivery-policy-content`,
        { withCredentials: true }
      );

      if (response.data?.content) {
        setPolicyContent(response.data.content);
        setEditedContent(JSON.parse(JSON.stringify(response.data.content)));
      }
    } catch (error) {
      console.error("Error fetching policy content:", error);
      toast.error("Failed to load policy content");
    }
  };

  const handleSaveContent = async () => {
    try {
      setSavingContent(true);

      const userToken = Cookies.get("session");
      const decodedToken = userToken && jwtDecode(userToken);
      const userId = decodedToken?.user?._id;

      console.log("Saving policy content:", editedContent);

      const response = await axios.post(
        `${baseURL}/onboarding/hr-update-service-delivery-policy-content`,
        {
          ...editedContent,
          updatedBy: userId,
        },
        { withCredentials: true }
      );

      console.log("Save response:", response.data);

      if (response.data?.success) {
        toast.success("Policy content updated successfully");
        // Update policyContent with the saved content
        if (response.data?.content) {
          setPolicyContent(response.data.content);
          setEditedContent(JSON.parse(JSON.stringify(response.data.content)));
        } else {
          // Refetch to ensure we have latest data
          await fetchPolicyContent();
        }
        setIsEditingContent(false);
      } else {
        toast.error(response.data?.message || "Failed to save policy content");
      }
    } catch (error) {
      console.error("Error saving policy content:", error);
      toast.error(
        error.response?.data?.message || "Failed to update policy content"
      );
    } finally {
      setSavingContent(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employee data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const displayContent = isEditingContent ? editedContent : policyContent;

  return (
    <Layout>
      <Navbar />
      {/* Add cursive signature fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&family=Dancing+Script:wght@400;700&family=Pacifico&display=swap"
        rel="stylesheet"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div className="text-center flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Service Delivery Policy Review
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Review the employee's Service Delivery Policy submission
              </p>
            </div>
            <button
              onClick={() => {
                if (isEditingContent) {
                  setEditedContent(JSON.parse(JSON.stringify(policyContent)));
                  setIsEditingContent(false);
                } else {
                  setIsEditingContent(true);
                }
              }}
              className={`ml-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isEditingContent
                  ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              title={
                isEditingContent ? "Cancel editing" : "Edit policy content"
              }
            >
              {isEditingContent ? (
                <>
                  <X className="w-4 h-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Edit Content
                </>
              )}
            </button>
          </div>

          <div className="space-y-6">
            {/* Instructions Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                    📋 HR Review Instructions
                  </h3>
                  <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        1.
                      </span>
                      <span>
                        Review the employee's policy initials and signature
                        below
                      </span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        2.
                      </span>
                      <span>Add your review notes at the bottom</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        3.
                      </span>
                      <span>
                        Click "Edit Content" to modify policy statements for
                        future employees
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Edit Content Section */}
            {isEditingContent && displayContent && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-bold text-yellow-900 mb-4">
                  ✏️ Edit Policy Content
                </h3>
                <div className="space-y-4">
                  {/* Company Info Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={editedContent.companyName || ""}
                        onChange={(e) =>
                          setEditedContent({
                            ...editedContent,
                            companyName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo URL
                      </label>
                      <input
                        type="text"
                        value={editedContent.logoUrl || ""}
                        onChange={(e) =>
                          setEditedContent({
                            ...editedContent,
                            logoUrl: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Policy Title
                    </label>
                    <input
                      type="text"
                      value={editedContent.policyTitle || ""}
                      onChange={(e) =>
                        setEditedContent({
                          ...editedContent,
                          policyTitle: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Introduction Text
                    </label>
                    <textarea
                      value={editedContent.introductionText || ""}
                      onChange={(e) =>
                        setEditedContent({
                          ...editedContent,
                          introductionText: e.target.value,
                        })
                      }
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Policy Statements */}
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-3">
                      Policy Statements
                    </h4>
                    <div className="space-y-3">
                      {Object.keys(editedContent.policyStatements || {}).map(
                        (key) => {
                          const policy = editedContent.policyStatements[key];
                          return (
                            <div key={key} className="border rounded-lg p-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {`Policy ${key.replace("policy", "")} - Text`}
                              </label>
                              <textarea
                                value={policy.text || ""}
                                onChange={(e) =>
                                  setEditedContent({
                                    ...editedContent,
                                    policyStatements: {
                                      ...editedContent.policyStatements,
                                      [key]: {
                                        ...policy,
                                        text: e.target.value,
                                      },
                                    },
                                  })
                                }
                                rows="2"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                              />
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveContent}
                      disabled={savingContent}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                      {savingContent ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditedContent(
                          JSON.parse(JSON.stringify(policyContent))
                        );
                        setIsEditingContent(false);
                      }}
                      className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Content Section - Display Policy */}
            {displayContent && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                <div className="max-w-3xl w-full px-12 py-8">
                  {/* Header with Logo */}
                  <div className="flex items-center justify-center mb-6">
                    <img
                      src={displayContent.logoUrl}
                      alt={displayContent.companyName}
                      className="h-20"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>

                  {/* Title */}
                  <h1 className="text-center text-base font-bold mb-6 underline">
                    {displayContent.policyTitle}
                  </h1>

                  {/* Introduction Text */}
                  <div className="text-[13px] leading-normal mb-6">
                    <p>{displayContent.introductionText}</p>
                  </div>

                  {/* Policy Statements */}
                  <div className="space-y-6">
                    {Object.keys(displayContent.policyStatements || {}).map(
                      (key, index) => {
                        const policy = displayContent.policyStatements[key];
                        const policyInitialKey = key;

                        return (
                          <div key={key} className="flex items-start gap-3">
                            <input
                              type="text"
                              value={policyInitials[policyInitialKey] || ""}
                              readOnly
                              className="w-16 mt-3 shrink-0 text-center text-sm bg-transparent outline-none italic border-b border-gray-300"
                              style={{ fontStyle: "italic" }}
                            />
                            <div className="text-[13px] leading-normal">
                              <span>{policy.text}</span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* Signature Section */}
                  <div className="mt-16 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-8">
                    <div className="w-full sm:flex-1 sm:max-w-xs">
                      <div className="border-b border-black mb-2 min-h-12 flex items-end pb-1">
                        <p
                          className="text-lg"
                          style={{
                            fontFamily: "'Great Vibes', cursive",
                            fontSize: "28px",
                            fontWeight: "400",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {employeeSignature || "No Signature"}
                        </p>
                      </div>
                      <p className="text-sm font-bold mt-1">
                        Employee Signature
                      </p>
                    </div>
                    <div className="w-full sm:flex-1 sm:max-w-xs">
                      <div className="border-b border-black mb-2 min-h-12 flex items-end pb-1">
                        <input
                          type="date"
                          value={signatureDate}
                          readOnly
                          className="w-full bg-transparent border-none outline-none text-sm"
                        />
                      </div>
                      <p className="text-sm font-bold mt-1 text-center">Date</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HR Notes Section */}
            <div className="mt-8">
              <HRNotesInput
                formType="service-delivery-policies"
                employeeId={employeeId}
                onNoteSaved={fetchEmployeeData}
                showSignature={false}
              />

              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() => navigate(`/hr/code-of-ethics/${employeeId}`)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous: Code of Ethics
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Exit to Dashboard
                </button>
                <button
                  onClick={() =>
                    navigate(`/hr/non-compete-agreement/${employeeId}`)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  Next: Non-Compete Agreement
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
}
