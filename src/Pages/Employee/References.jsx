import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import {
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  Target,
  Users,
  CheckCircle,
  FileText,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";
import {
  getNextFormPath,
  getPreviousFormPath,
} from "../../utils/formNavigationSequence";

const References = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [applicationId, setApplicationId] = useState(
    location.state?.applicationId || null
  );
  const [employeeId, setEmployeeId] = useState(
    location.state?.employeeId || null
  );

  const [references, setReferences] = useState([
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
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [applicationStatus, setApplicationStatus] = useState("draft");
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);

  const baseURL = import.meta.env.VITE__BASEURL;

  // Format phone number as +1 (XXX) XXX-XXXX
  const formatPhone = (value) => {
    // Remove +1 prefix if it exists, then remove all non-digit characters
    const withoutPrefix = value.replace(/^\+1\s*/, "");
    const cleaned = withoutPrefix.replace(/\D/g, "");

    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);

    // Format as +1 (XXX) XXX-XXXX
    if (limited.length === 0) {
      return "";
    } else if (limited.length <= 3) {
      return `+1 (${limited}`;
    } else if (limited.length <= 6) {
      return `+1 (${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else {
      return `+1 (${limited.slice(0, 3)}) ${limited.slice(
        3,
        6
      )}-${limited.slice(6)}`;
    }
  };

  const getUserFromToken = () => {
    try {
      const session = Cookies.get("session");
      if (!session) return null;

      const base64Url = session.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload).user;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    initializeForm();
  }, []);

  const fetchProgressData = async (userId) => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${userId}`,
        { withCredentials: true }
      );

      if (response.data?.data) {
        const backendData = response.data.data;
        setApplicationStatus(
          backendData.application?.applicationStatus || "draft"
        );

        const forms = backendData.forms || {};
        const formKeys = [
          "personalInformation",
          "professionalExperience",
          "workExperience",
          "references",
          "education",
          "legalDisclosures",
          "jobDescriptionPCA",
          "codeOfEthics",
          "serviceDeliveryPolicy",
          "nonCompeteAgreement",
          "misconductStatement",
          "orientationPresentation",
          "orientationChecklist",
          "backgroundCheck",
          "tbSymptomScreen",
          "emergencyContact",
          "i9Form",
          "w4Form",
          "w9Form",
          "directDeposit",
        ];

        const completedSet = new Set(
          backendData.application?.completedForms || []
        );
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
      const userData = getUserFromToken();
      const empId = userData?._id || userData?.id;

      if (!empId) return;

      setEmployeeId(empId);

      await fetchProgressData(empId);
      const response = await fetch(
        `${baseURL}/onboarding/get-application/${empId}`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.data?.application?._id) {
          setApplicationId(data.data.application._id);

          const referencesForm = data.data.forms?.references;

          if (referencesForm?.references?.length > 0) {
            // Ensure we have at least 3 references
            const loadedReferences = referencesForm.references.map((ref) => ({
              ...ref,
              status: referencesForm.status,
            }));
            while (loadedReferences.length < 3) {
              loadedReferences.push({
                fullName: "",
                relationship: "",
                company: "",
                phone: "",
                address: "",
                status: referencesForm.status,
              });
            }
            setReferences(loadedReferences);
            setApplicationStatus(referencesForm.status || "draft");
          } else {
            // If no references found, use the default 3 empty references
            setReferences([
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
            ]);
          }
        }
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const addReference = () => {
    setReferences([
      ...references,
      {
        fullName: "",
        relationship: "",
        company: "",
        phone: "",
        address: "",
      },
    ]);
  };

  const removeReference = (index) => {
    if (index >= 3) {
      const updated = references.filter((_, i) => i !== index);
      setReferences(updated);
    }
  };

  const updateReference = (index, field, value) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    setReferences(updated);
  };

  const getMissingFields = () => {
    const missing = [];

    references.forEach((ref, index) => {
      const refName = ref.fullName || `Reference ${index + 1}`;

      if (!ref.fullName?.trim()) {
        missing.push(`Full Name for ${refName}`);
      }
      if (!ref.relationship?.trim()) {
        missing.push(`Relationship for ${refName}`);
      }
      if (!ref.company?.trim()) {
        missing.push(`Company for ${refName}`);
      }
      if (!ref.phone?.trim()) {
        missing.push(`Phone for ${refName}`);
      }
      if (!ref.address?.trim()) {
        missing.push(`Address for ${refName}`);
      }
    });

    return missing;
  };

  const handleSave = async (statusOverride = null) => {
    const missingFields = getMissingFields();

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in the following required fields: ${missingFields.join(
          ", "
        )}`
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Explicitly prevent form submission when validation fails
      return false;
    }

    // Only proceed with saving if all validations pass
    const hasValidReference = references.some(
      (ref) =>
        ref.fullName?.trim() &&
        ref.relationship?.trim() &&
        ref.company?.trim() &&
        ref.phone?.trim() &&
        ref.address?.trim()
    );

    const status =
      statusOverride || (hasValidReference ? "completed" : "draft");

    if (!employeeId) {
      toast.error("Missing employee information. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const baseURL = import.meta.env.VITE__BASEURL;
      const payload = {
        employeeId,
        references,
        status,
      };

      if (applicationId) {
        payload.applicationId = applicationId;
      }

      const response = await fetch(`${baseURL}/onboarding/references/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const savedAppId = data.data?.applicationId || applicationId;
        setApplicationId(savedAppId);

        toast.success(data.message || "References saved successfully!");
        window.dispatchEvent(new Event("formStatusUpdated"));

        setTimeout(() => {
          const nextPath = getNextFormPath("/employee/references");
          navigate(nextPath, {
            state: { applicationId: savedAppId, employeeId },
          });
        }, 100);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to save references");
      }
    } catch (error) {
      console.error("Error saving references:", error);
      toast.error("Error saving references. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RotateCcw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading references form...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <Navbar />

        <div className="pt-6 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex gap-6">
            {/* Vertical Progress Bar Sidebar - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:block md:w-12 lg:w-16 flex-shrink-0">
              <div className="sticky top-6 flex flex-col items-center">
                <div className="w-3 lg:w-4 h-[500px] bg-gray-200 rounded-full relative shadow-inner">
                  <div
                    className="w-3 lg:w-4 bg-gradient-to-t from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out absolute bottom-0 shadow-sm"
                    style={{ height: `${overallProgress}%` }}
                  ></div>
                </div>

                <div className="mt-4 text-center">
                  <div className="text-sm lg:text-lg font-bold text-blue-600">
                    {overallProgress}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Application Progress
                  </div>
                </div>

                {isLoading && (
                  <div className="mt-4">
                    <RotateCcw className="w-4 lg:w-5 h-4 lg:h-5 text-blue-600 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 max-h-screen md:max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
              <div className="mb-4 md:mb-6">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-3 md:px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base font-medium w-20 md:w-24"
                >
                  <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                  Back
                </button>
              </div>

              <HRFeedback
                hrFeedback={references[0]?.hrFeedback}
                formStatus={references[0]?.status}
              />

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Status Banner */}
                {!loading && (
                  <div
                    className={`m-6 p-4 rounded-lg border ${
                      applicationStatus === "completed" ||
                      applicationStatus === "submitted" ||
                      applicationStatus === "under_review" ||
                      applicationStatus === "approved"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {applicationStatus === "completed" ||
                      applicationStatus === "submitted" ||
                      applicationStatus === "approved" ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : applicationStatus === "under_review" ? (
                        <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      ) : (
                        <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        {applicationStatus === "completed" ||
                        applicationStatus === "submitted" ? (
                          <p className="text-base font-semibold text-green-800">
                            ✅ Progress Updated - Form Completed Successfully
                          </p>
                        ) : applicationStatus === "approved" ? (
                          <p className="text-base font-semibold text-green-800">
                            ✅ Form Approved
                          </p>
                        ) : applicationStatus === "under_review" ? (
                          <p className="text-base font-semibold text-blue-800">
                            📋 Form Under Review
                          </p>
                        ) : (
                          <p className="text-base font-semibold text-red-800">
                            ⚠️ Not filled yet - Complete this form to update
                            your progress
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-[#1F3A93] text-white p-4 md:p-6">
                  <div className="text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center mb-2">
                      <Users className="w-6 h-6 md:w-8 md:h-8 mb-2 sm:mb-0 sm:mr-3" />
                      <div>
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                          PROFESSIONAL REFERENCES
                        </h1>
                        <p className="text-blue-100 text-sm md:text-base"></p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6 lg:p-8">
                  <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
                    Professional References
                  </h2>

                  <p className="text-gray-600 mb-6 text-sm md:text-base">
                    Please list three professional references.
                  </p>

                  {references.map((reference, index) => (
                    <div
                      key={index}
                      className="mb-8 p-6 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                          Reference {index + 1}
                        </h3>
                        {index >= 3 && (
                          <button
                            type="button"
                            onClick={() => removeReference(index)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            🗑 Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={reference.fullName}
                            onChange={(e) =>
                              updateReference(index, "fullName", e.target.value)
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`${index}_fullName`]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors[`${index}_fullName`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`${index}_fullName`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Relationship <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Manager, Colleague, Professor"
                            value={reference.relationship}
                            onChange={(e) =>
                              updateReference(
                                index,
                                "relationship",
                                e.target.value
                              )
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`${index}_relationship`]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors[`${index}_relationship`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`${index}_relationship`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={reference.company}
                            onChange={(e) =>
                              updateReference(index, "company", e.target.value)
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`${index}_company`]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors[`${index}_company`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`${index}_company`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={reference.phone}
                            onChange={(e) =>
                              updateReference(
                                index,
                                "phone",
                                formatPhone(e.target.value)
                              )
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`${index}_phone`]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors[`${index}_phone`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`${index}_phone`]}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={reference.address}
                            onChange={(e) =>
                              updateReference(index, "address", e.target.value)
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`${index}_address`]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors[`${index}_address`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`${index}_address`]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addReference}
                    className="mb-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ➕ Add Reference
                  </button>

                  <div className="mt-6 md:mt-8 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                        <span className="text-xs md:text-sm font-semibold text-gray-700">
                          Application Progress
                        </span>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-base md:text-lg font-bold text-blue-600">
                          {completedFormsCount}/20
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
                    <div className="text-xs text-gray-600 text-center">
                      👥 Current: Professional References
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8FAFF] px-4 md:px-8 lg:px-12 py-6 md:py-8 mt-4 md:mt-6 border border-[#E8EDFF]">
                  <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-3 md:gap-4">
                    {/* Left: Previous Form */}
                    <div className="w-full lg:w-auto order-3 lg:order-1">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(getPreviousFormPath("/employee/references"))
                        }
                        className="inline-flex items-center justify-center gap-2 w-full max-w-xs py-2.5 md:py-3 px-4 md:px-6 lg:px-8 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm md:text-base"
                      >
                        <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        <span className="text-sm md:text-base">
                          Previous Form
                        </span>
                      </button>
                    </div>

                    {/* Center: Exit Application */}
                    <div className="w-full sm:w-auto flex justify-center lg:flex-1 order-2">
                      <button
                        type="button"
                        onClick={() => navigate("/employee/task-management")}
                        className="px-4 md:px-6 lg:px-8 py-2.5 md:py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm md:text-base"
                      >
                        Exit Application
                      </button>
                    </div>

                    {/* Right: Save & Next */}
                    <div className="w-full lg:w-auto flex items-center justify-end gap-3 order-1 lg:order-3">
                      {(() => {
                        // Check if form has HR notes
                        const hasHrNotes =
                          references[0]?.hrFeedback &&
                          Object.keys(references[0].hrFeedback).length > 0 &&
                          (references[0].hrFeedback.comment ||
                            references[0].hrFeedback.notes ||
                            references[0].hrFeedback.feedback ||
                            references[0].hrFeedback.note ||
                            references[0].hrFeedback.companyRepSignature ||
                            references[0].hrFeedback
                              .companyRepresentativeSignature ||
                            references[0].hrFeedback.notarySignature ||
                            references[0].hrFeedback.agencySignature ||
                            references[0].hrFeedback.clientSignature ||
                            Object.keys(references[0].hrFeedback || {}).some(
                              (key) =>
                                references[0].hrFeedback[key] &&
                                typeof references[0].hrFeedback[key] ===
                                  "string" &&
                                references[0].hrFeedback[key].trim().length > 0
                            ));

                        // Check if form is submitted (and no HR notes)
                        const isSubmitted =
                          applicationStatus === "submitted" && !hasHrNotes;

                        return (
                          <button
                            type="button"
                            onClick={() => handleSave()}
                            disabled={isLoading || isSubmitted}
                            className={`inline-flex items-center justify-center gap-2 md:gap-3 w-full max-w-xs py-2.5 md:py-3 px-3 md:px-5 font-bold tracking-wide rounded-lg focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm md:text-base ${
                              isLoading || isSubmitted
                                ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                                : "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white hover:from-[#16306e] hover:to-[#1F3A93] active:from-[#112451] active:to-[#16306e]"
                            }`}
                            title={
                              isSubmitted
                                ? "Form is submitted. HR notes are required to make changes."
                                : "Save and proceed to next form"
                            }
                          >
                            {isLoading ? (
                              <RotateCcw className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-1 md:mr-2" />
                            ) : (
                              <Send className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                            )}
                            <span>
                              {isLoading
                                ? "Submitting..."
                                : isSubmitted
                                ? "Awaiting HR Feedback"
                                : "Save & Next"}
                            </span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default References;
