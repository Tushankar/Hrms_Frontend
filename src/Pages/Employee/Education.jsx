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
  GraduationCap,
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

const Education = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [applicationId, setApplicationId] = useState(
    location.state?.applicationId || null
  );
  const [employeeId, setEmployeeId] = useState(
    location.state?.employeeId || null
  );

  const [educations, setEducations] = useState([
    {
      type: "High School",
      institutionName: "",
      address: "",
      from: "",
      to: "",
      didGraduate: "",
      diploma: "",
    },
    {
      type: "College",
      institutionName: "",
      address: "",
      from: "",
      to: "",
      didGraduate: "",
      degree: "",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [applicationStatus, setApplicationStatus] = useState("draft");
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);

  const baseURL = import.meta.env.VITE__BASEURL;

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

      const decoded = JSON.parse(jsonPayload);
      return decoded.user;
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
        const completedSet = new Set(
          backendData.application?.completedForms || []
        );

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

        setCompletedFormsCount(completedForms);
        setOverallProgress(percentage);
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

          const educationData = data.data.forms?.education;

          if (educationData) {
            // Check if it's an array with items
            if (Array.isArray(educationData) && educationData.length > 0) {
              const formattedEducations = educationData.map((edu) => ({
                ...edu,
                from: formatDate(edu.from),
                to: formatDate(edu.to),
              }));
              setEducations(formattedEducations);
            }
            // Check for status at the root level or first item
            const formStatus = educationData.status || educationData[0]?.status;
            if (formStatus) {
              setApplicationStatus(formStatus);
            }
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    return dateStr.split("T")[0];
  };

  const updateEducation = (index, field, value) => {
    setEducations((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addEducation = () => {
    setEducations((prev) => [
      ...prev,
      {
        type: "",
        institutionName: "",
        address: "",
        from: "",
        to: "",
        didGraduate: "",
        degree: "",
      },
    ]);
  };

  const removeEducation = (index) => {
    setEducations((prev) => prev.filter((_, i) => i !== index));
  };

  const getMissingFields = () => {
    const missing = [];

    educations.forEach((edu, index) => {
      const entryName =
        edu.institutionName || edu.type || `Education Entry ${index + 1}`;

      if (!edu.institutionName) {
        missing.push(`Institution Name for ${entryName}`);
      }
      if (!edu.address) {
        missing.push(`Address for ${entryName}`);
      }
      if (!edu.didGraduate) {
        missing.push(`Graduation Status for ${entryName}`);
      }
      if (edu.didGraduate === "YES" && !edu.degree && !edu.diploma) {
        missing.push(`Degree/Certificate for ${entryName}`);
      }
      if (index > 1 && !edu.type) {
        missing.push(`Institution Type for ${entryName}`);
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
    const hasValidEducation = educations.some(
      (edu) => edu.didGraduate && edu.address
    );

    const status =
      statusOverride || (hasValidEducation ? "completed" : "draft");

    if (!employeeId) {
      alert("Missing employee information. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const baseURL = import.meta.env.VITE__BASEURL;
      const payload = {
        employeeId,
        educations,
        status,
      };

      if (applicationId) {
        payload.applicationId = applicationId;
      }

      const response = await fetch(`${baseURL}/onboarding/education/save`, {
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

        toast.success(data.message || "Education saved successfully!");
        window.dispatchEvent(new Event("formStatusUpdated"));

        setTimeout(() => {
          const nextPath = getNextFormPath("/employee/education");
          navigate(nextPath, {
            state: { applicationId: savedAppId, employeeId },
          });
        }, 100);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to save education");
      }
    } catch (error) {
      console.error("Error saving education:", error);
      alert("Error saving education. Please try again.");
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
            <p className="text-gray-600">Loading education form...</p>
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
            <div className="w-16 flex-shrink-0 hidden md:block">
              <div className="sticky top-6 flex flex-col items-center">
                <div className="w-4 h-[500px] bg-gray-200 rounded-full relative shadow-inner">
                  <div
                    className="w-4 bg-gradient-to-t from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out absolute bottom-0 shadow-sm"
                    style={{ height: `${overallProgress}%` }}
                  ></div>
                </div>

                <div className="mt-4 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {overallProgress}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Application Progress
                  </div>
                </div>

                {isLoading && (
                  <div className="mt-4">
                    <RotateCcw className="w-5 h-5 text-blue-600 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-screen md:max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
              <div className="mb-6">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium w-24"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>

              <HRFeedback
                hrFeedback={educations[0]?.hrFeedback}
                formStatus={applicationStatus}
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
                          <div>
                            <p className="text-base font-semibold text-green-800">
                              ✅ Progress Updated - Form Completed Successfully
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                              You cannot make any changes to the form until HR
                              provides their feedback.
                            </p>
                          </div>
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
                <div className="bg-[#1F3A93] text-white p-6">
                  <div className="text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center mb-2">
                      <GraduationCap className="w-8 h-8 mr-3" />
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                          EDUCATION & CERTIFICATES
                        </h1>
                        <p className="text-blue-100"></p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-[#1F3A93] mb-6 pb-2 border-b-2 border-[#1F3A93]">
                    Education
                  </h2>

                  {/* Education Entries */}
                  {educations.map((education, index) => (
                    <div
                      key={index}
                      className="mb-8 p-6 border border-gray-200 rounded-lg relative"
                    >
                      {index > 1 && (
                        <button
                          onClick={() => removeEducation(index)}
                          className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded"
                          title="Remove education entry"
                        >
                          ✕
                        </button>
                      )}

                      <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        {education.type || `Education Entry ${index + 1}`}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {index > 1 && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Institution Type
                            </label>
                            <input
                              type="text"
                              value={education?.type || ""}
                              onChange={(e) =>
                                updateEducation(index, "type", e.target.value)
                              }
                              placeholder="e.g., University, Trade School, Online Course"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {index === 0
                              ? "High School Name"
                              : index === 1
                              ? "College/University Name"
                              : "Institution Name"}
                          </label>
                          <input
                            type="text"
                            value={education?.institutionName || ""}
                            onChange={(e) =>
                              updateEducation(
                                index,
                                "institutionName",
                                e.target.value
                              )
                            }
                            placeholder={
                              index === 0
                                ? "e.g., Lincoln High School"
                                : index === 1
                                ? "e.g., Harvard University"
                                : "e.g., Institution Name"
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            value={education?.address || ""}
                            onChange={(e) =>
                              updateEducation(index, "address", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            From
                          </label>
                          <input
                            type="date"
                            value={formatDate(education?.from)}
                            onChange={(e) =>
                              updateEducation(index, "from", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            To
                          </label>
                          <input
                            type="date"
                            value={formatDate(education?.to)}
                            onChange={(e) =>
                              updateEducation(index, "to", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Did you graduate?
                          </label>
                          <div className="flex gap-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`graduate_${index}`}
                                value="YES"
                                checked={education?.didGraduate === "YES"}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "didGraduate",
                                    e.target.value
                                  )
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-gray-700">YES</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`graduate_${index}`}
                                value="NO"
                                checked={education?.didGraduate === "NO"}
                                onChange={(e) =>
                                  updateEducation(
                                    index,
                                    "didGraduate",
                                    e.target.value
                                  )
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-gray-700">NO</span>
                            </label>
                          </div>
                        </div>

                        {education?.didGraduate === "YES" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {education.type === "High School"
                                ? "Diploma"
                                : "Degree/Certificate"}
                            </label>
                            <input
                              type="text"
                              value={
                                education?.degree || education?.diploma || ""
                              }
                              onChange={(e) =>
                                updateEducation(
                                  index,
                                  education.type === "High School"
                                    ? "diploma"
                                    : "degree",
                                  e.target.value
                                )
                              }
                              placeholder={
                                education.type === "High School"
                                  ? "e.g., High School Diploma"
                                  : "e.g., Bachelor of Science, Certificate"
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add Education Button */}
                  <button
                    onClick={addEducation}
                    className="mb-8 w-full px-4 py-3 bg-green-50 border-2 border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <span>+ Add Education Entry</span>
                  </button>

                  <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          Application Progress
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
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
                      🎓 Current: Education & Certificates
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8FAFF] px-4 md:px-8 lg:px-12 py-6 md:py-8 mt-6 border border-[#E8EDFF]">
                  <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-4">
                    <div className="w-full md:w-auto">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(getPreviousFormPath("/employee/education"))
                        }
                        className="inline-flex items-center justify-center gap-2 w-full max-w-xs py-3 px-6 sm:px-8 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        <span className="text-sm sm:text-base">
                          Previous Form
                        </span>
                      </button>
                    </div>

                    <div className="w-full sm:w-auto flex justify-center md:flex-1">
                      <button
                        type="button"
                        onClick={() => navigate("/employee/task-management")}
                        className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                      >
                        Exit Application
                      </button>
                    </div>

                    <div className="w-full md:w-auto flex items-center justify-end gap-3">
                      {(() => {
                        // Check if form has HR notes
                        const hasHrNotes =
                          educations[0]?.hrFeedback &&
                          Object.keys(educations[0].hrFeedback).length > 0 &&
                          (educations[0].hrFeedback.comment ||
                            educations[0].hrFeedback.notes ||
                            educations[0].hrFeedback.feedback ||
                            educations[0].hrFeedback.note ||
                            educations[0].hrFeedback.companyRepSignature ||
                            educations[0].hrFeedback
                              .companyRepresentativeSignature ||
                            educations[0].hrFeedback.notarySignature ||
                            educations[0].hrFeedback.agencySignature ||
                            educations[0].hrFeedback.clientSignature ||
                            Object.keys(educations[0].hrFeedback || {}).some(
                              (key) =>
                                educations[0].hrFeedback[key] &&
                                typeof educations[0].hrFeedback[key] ===
                                  "string" &&
                                educations[0].hrFeedback[key].trim().length > 0
                            ));

                        // Check if form is submitted or completed (and no HR notes)
                        const isLocked =
                          (applicationStatus === "submitted" ||
                            applicationStatus === "completed") &&
                          !hasHrNotes;

                        return (
                          <button
                            type="button"
                            onClick={() => handleSave()}
                            disabled={isLoading || isLocked}
                            className={`inline-flex items-center justify-center gap-3 w-full max-w-xs py-3 px-5 font-bold tracking-wide rounded-lg focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm sm:text-base ${
                              isLoading || isLocked
                                ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                                : "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white hover:from-[#16306e] hover:to-[#1F3A93] active:from-[#112451] active:to-[#16306e]"
                            }`}
                            title={
                              isLocked
                                ? "Form is submitted. HR notes are required to make changes."
                                : "Save and proceed to next form"
                            }
                          >
                            {isLoading ? (
                              <RotateCcw className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                              <Send className="w-5 h-5 mr-2" />
                            )}
                            <span>
                              {isLoading
                                ? "Submitting..."
                                : isLocked
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

export default Education;
