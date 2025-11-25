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
  Briefcase,
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

const WorkExperience = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [applicationId, setApplicationId] = useState(
    location.state?.applicationId || null
  );
  const [employeeId, setEmployeeId] = useState(
    location.state?.employeeId || null
  );

  const [workExperiences, setWorkExperiences] = useState([
    {
      company: "",
      phone: "",
      address: "",
      supervisor: "",
      jobTitle: "",
      startingSalaryType: "hourly",
      startingSalaryAmount: "",
      endingSalaryType: "hourly",
      endingSalaryAmount: "",
      responsibilities: "",
      from: "",
      to: "",
      reasonForLeaving: "",
      contactSupervisor: null,
    },
  ]);

  // Job Preferences state
  const [jobPreferences, setJobPreferences] = useState({
    expectedSalary: "",
    salaryType: "hourly", // Changed from "per annum" to "hourly"
    preferredWorkLocation: "",
    willingToRelocate: false,
    availabilityToStart: "",
    employmentTypePreference: "",
  });

  // References state
  const [references, setReferences] = useState([
    {
      name: "",
      relationship: "",
      company: "",
      contactNumber: "",
      email: "",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [applicationStatus, setApplicationStatus] = useState("draft");
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [hasWorkedBefore, setHasWorkedBefore] = useState(null); // null, true, or false

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

      if (!empId) {
        console.log("[WorkExperience] No employee ID found in token");
        return;
      }

      console.log("[WorkExperience] Using employee ID:", empId);
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
        console.log("📦 [WorkExperience] Full API response:", data);
        console.log("📦 [WorkExperience] Application data:", data.data);
        console.log("📦 [WorkExperience] Forms data:", data.data?.forms);
        console.log(
          "📦 [WorkExperience] WorkExperience form:",
          data.data?.forms?.workExperience
        );

        if (data.data?.application?._id) {
          setApplicationId(data.data.application._id);
          console.log(
            "✅ [WorkExperience] Application ID set:",
            data.data.application._id
          );

          // workExperience form object contains workExperiences array
          const workExpForm = data.data.forms?.workExperience;

          if (workExpForm) {
            // Check if hasPreviousWorkExperience field exists (new field)
            if (workExpForm.hasPreviousWorkExperience !== undefined) {
              setHasWorkedBefore(workExpForm.hasPreviousWorkExperience);
              console.log(
                "✅ [WorkExperience] Has previous work experience:",
                workExpForm.hasPreviousWorkExperience
              );
            } else if (workExpForm.workExperiences?.length > 0) {
              // Fallback: if old data without the field, check array length
              setHasWorkedBefore(true);
            } else {
              setHasWorkedBefore(null); // Not answered yet
            }

            if (workExpForm.workExperiences?.length > 0) {
              console.log(
                "✅ [WorkExperience] Found saved work experiences:",
                workExpForm.workExperiences.length,
                "items"
              );
              console.log(
                "📋 [WorkExperience] Data:",
                workExpForm.workExperiences
              );
              // Convert old format to new format if needed
              const convertedExperiences = workExpForm.workExperiences.map(
                (exp) => ({
                  company: exp.company || exp.companyName || "",
                  phone: exp.phone || exp.supervisorContact || "",
                  address: exp.address || exp.location || "",
                  supervisor: exp.supervisor || exp.supervisorName || "",
                  jobTitle: exp.jobTitle || "",
                  startingSalaryType: exp.startingSalaryType || "hourly",
                  startingSalaryAmount:
                    exp.startingSalaryAmount || exp.startingSalary || "",
                  endingSalaryType: exp.endingSalaryType || "hourly",
                  endingSalaryAmount:
                    exp.endingSalaryAmount || exp.endingSalary || "",
                  responsibilities:
                    exp.responsibilities || exp.keyResponsibilities || "",
                  from: exp.from || formatDate(exp.startDate) || "",
                  to: exp.to || formatDate(exp.endDate) || "",
                  reasonForLeaving: exp.reasonForLeaving || "",
                  contactSupervisor: exp.contactSupervisor || null,
                })
              );
              setWorkExperiences(convertedExperiences);
            }

            // Set application status from work experience form
            if (workExpForm.status) {
              setApplicationStatus(workExpForm.status);
            }

            // Load Job Preferences if available
            if (
              workExpForm.expectedSalary !== undefined ||
              workExpForm.salaryType !== undefined
            ) {
              setJobPreferences({
                expectedSalary: workExpForm.expectedSalary || "",
                salaryType: workExpForm.salaryType || "hourly",
                preferredWorkLocation: workExpForm.preferredWorkLocation || "",
                willingToRelocate: workExpForm.willingToRelocate || false,
                availabilityToStart:
                  formatDate(workExpForm.availabilityToStart) || "",
                employmentTypePreference:
                  workExpForm.employmentTypePreference || "",
              });
            }

            // Load References if available
            if (workExpForm.references?.length > 0) {
              setReferences(workExpForm.references);
            }
          } else {
            console.log(
              "⚠️ [WorkExperience] No work experience form found in response"
            );
          }
        }
      } else if (response.status === 404) {
        console.log("⚠️ No existing application found - will create on save");
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  // Helper to format ISO date to yyyy-MM-dd
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    // If already yyyy-MM-dd, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // If ISO format, convert
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
  };

  const addWorkExperience = () => {
    setWorkExperiences([
      ...workExperiences,
      {
        company: "",
        phone: "",
        address: "",
        supervisor: "",
        jobTitle: "",
        startingSalaryType: "hourly",
        startingSalaryAmount: "",
        endingSalaryType: "hourly",
        endingSalaryAmount: "",
        responsibilities: "",
        from: "",
        to: "",
        reasonForLeaving: "",
        contactSupervisor: null,
      },
    ]);
  };

  const removeWorkExperience = (index) => {
    if (workExperiences.length > 1) {
      const updated = workExperiences.filter((_, i) => i !== index);
      setWorkExperiences(updated);
    }
  };

  const updateWorkExperience = (index, field, value) => {
    const updated = [...workExperiences];
    updated[index] = { ...updated[index], [field]: value };
    setWorkExperiences(updated);
  };

  // Job Preferences handlers
  const updateJobPreference = (field, value) => {
    setJobPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // References handlers
  const addReference = () => {
    setReferences([
      ...references,
      {
        name: "",
        relationship: "",
        company: "",
        contactNumber: "",
        email: "",
      },
    ]);
  };

  const removeReference = (index) => {
    if (references.length > 1) {
      const updated = references.filter((_, i) => i !== index);
      setReferences(updated);
    }
  };

  const updateReference = (index, field, value) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    setReferences(updated);
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const baseURL = import.meta.env.VITE__BASEURL;
      const response = await fetch(`${baseURL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        updateWorkExperience(index, "proofDocument", data.filePath);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    workExperiences.forEach((exp, index) => {
      if (!exp.company?.trim()) {
        newErrors[`${index}_company`] = "Company is required";
      }
      if (!exp.jobTitle?.trim()) {
        newErrors[`${index}_jobTitle`] = "Job Title is required";
      }
      if (!exp.responsibilities?.trim()) {
        newErrors[`${index}_responsibilities`] =
          "Responsibilities are required";
      }
      if (!exp.from) {
        newErrors[`${index}_from`] = "From date is required";
      }
      if (!exp.to) {
        newErrors[`${index}_to`] = "To date is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getMissingFields = () => {
    const missing = [];

    if (hasWorkedBefore === null) {
      missing.push("Do you have any previous work experience?");
    } else if (hasWorkedBefore) {
      workExperiences.forEach((exp, index) => {
        const entryName = exp.company || `Previous Employment ${index + 1}`;

        if (!exp.company?.trim()) {
          missing.push(`Company for ${entryName}`);
        }
        if (!exp.jobTitle?.trim()) {
          missing.push(`Job Title for ${entryName}`);
        }
        if (!exp.responsibilities?.trim()) {
          missing.push(`Responsibilities for ${entryName}`);
        }
        if (!exp.from) {
          missing.push(`From date for ${entryName}`);
        }
        if (!exp.to) {
          missing.push(`To date for ${entryName}`);
        }
      });
    }

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
    // Check if user has answered the initial question
    if (hasWorkedBefore === null) {
      toast.error("Please answer whether you have previous work experience");
      return;
    }

    // Determine status based on validation
    let hasValidExperience = false;

    if (hasWorkedBefore) {
      // Only validate work experiences if user said they have worked before
      hasValidExperience = workExperiences.some(
        (exp) =>
          exp.company?.trim() &&
          exp.jobTitle?.trim() &&
          exp.responsibilities?.trim() &&
          exp.from &&
          exp.to
      );
    } else {
      // If they haven't worked before, form is considered complete
      hasValidExperience = true;
    }

    const status =
      statusOverride || (hasValidExperience ? "completed" : "draft");

    console.log(
      "💼 [WorkExperience Frontend] Save initiated with status:",
      status
    );

    if (!employeeId) {
      console.log("❌ [WorkExperience Frontend] Missing employeeId");
      alert("Missing employee information. Please try again.");
      return;
    }

    console.log("💼 [WorkExperience Frontend] Current state:");
    console.log("   - employeeId:", employeeId);
    console.log("   - applicationId:", applicationId);
    console.log("   - workExperiences count:", workExperiences.length);
    console.log("   - workExperiences data:", workExperiences);

    setIsLoading(true);
    try {
      const baseURL = import.meta.env.VITE__BASEURL;
      const payload = {
        employeeId,
        hasPreviousWorkExperience: hasWorkedBefore, // Explicitly send the boolean value
        workExperiences: hasWorkedBefore ? workExperiences : [], // Send empty array if no experience
        status,
      };

      if (applicationId) {
        payload.applicationId = applicationId;
      }

      console.log(
        "📤 [WorkExperience Frontend] Sending payload:",
        JSON.stringify(payload, null, 2)
      );
      console.log(
        "📤 [WorkExperience Frontend] URL:",
        `${baseURL}/onboarding/work-experience/save`
      );

      const response = await fetch(
        `${baseURL}/onboarding/work-experience/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      console.log(
        "📥 [WorkExperience Frontend] Response status:",
        response.status
      );
      console.log("📥 [WorkExperience Frontend] Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log(
          "✅ [WorkExperience Frontend] Success! Response data:",
          data
        );
        const savedAppId = data.data?.applicationId || applicationId;
        setApplicationId(savedAppId);
        console.log(
          "✅ [WorkExperience Frontend] Saved application ID:",
          savedAppId
        );

        toast.success(data.message || "Work experience saved successfully!");
        window.dispatchEvent(new Event("formStatusUpdated"));

        console.log("🎉 [WorkExperience Frontend] Navigating to next form");
        setTimeout(() => {
          const nextPath = getNextFormPath("/employee/work-experience");
          navigate(nextPath, {
            state: { applicationId: savedAppId, employeeId },
          });
        }, 100);
      } else {
        const errorData = await response.json();
        console.error(
          "❌ [WorkExperience Frontend] Error response:",
          errorData
        );
        console.error("❌ [WorkExperience Frontend] Status:", response.status);
        alert(errorData.message || "Failed to save work experience");
      }
    } catch (error) {
      console.error("❌ [WorkExperience Frontend] Exception caught:", error);
      console.error("❌ [WorkExperience Frontend] Error stack:", error.stack);
      alert("Error saving work experience. Please try again.");
    } finally {
      setIsLoading(false);
      console.log("🏁 [WorkExperience Frontend] Save operation completed");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RotateCcw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading work experience form...</p>
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
                hrFeedback={workExperiences[0]?.hrFeedback}
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
                <div className="bg-[#1F3A93] text-white p-4 md:p-6">
                  <div className="text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center mb-2">
                      <Briefcase className="w-6 h-6 md:w-8 md:h-8 mb-2 sm:mb-0 sm:mr-3" />
                      <div>
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                          Previous Employment
                        </h1>
                        <p className="text-blue-100 text-sm md:text-base"></p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6 lg:p-8">
                  <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
                    Work Experience
                  </h2>

                  {/* Initial Question */}
                  <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-base md:text-lg font-semibold text-gray-800 mb-4">
                      Do you have any previous work experience?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="hasWorkedBefore"
                          value="yes"
                          checked={hasWorkedBefore === true}
                          onChange={() => setHasWorkedBefore(true)}
                          className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-base font-medium text-gray-700">
                          Yes
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="hasWorkedBefore"
                          value="no"
                          checked={hasWorkedBefore === false}
                          onChange={() => {
                            setHasWorkedBefore(false);
                            // Clear work experiences when "No" is selected
                            setWorkExperiences([
                              {
                                company: "",
                                phone: "",
                                address: "",
                                supervisor: "",
                                jobTitle: "",
                                startingSalaryType: "hourly",
                                startingSalaryAmount: "",
                                endingSalaryType: "hourly",
                                endingSalaryAmount: "",
                                responsibilities: "",
                                from: "",
                                to: "",
                                reasonForLeaving: "",
                                contactSupervisor: null,
                              },
                            ]);
                          }}
                          className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-base font-medium text-gray-700">
                          No
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Show message when they select No */}
                  {hasWorkedBefore === false && (
                    <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-base text-gray-700">
                        ✓ No previous work experience recorded. You can proceed
                        to the next section.
                      </p>
                    </div>
                  )}

                  {/* Show work experience form only if they answered Yes */}
                  {hasWorkedBefore && (
                    <>
                      {workExperiences.map((experience, index) => (
                        <div
                          key={index}
                          className="mb-8 p-6 border border-gray-200 rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">
                              Previous Employment {index + 1}
                            </h3>
                            {workExperiences.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeWorkExperience(index)}
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                🗑 Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={experience.company}
                                onChange={(e) =>
                                  updateWorkExperience(
                                    index,
                                    "company",
                                    e.target.value
                                  )
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
                                Phone
                              </label>
                              <input
                                type="tel"
                                value={experience.phone}
                                onChange={(e) =>
                                  updateWorkExperience(
                                    index,
                                    "phone",
                                    formatPhone(e.target.value)
                                  )
                                }
                                placeholder="+1 (555) 123-4567"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                              </label>
                              <input
                                type="text"
                                value={experience.address}
                                onChange={(e) =>
                                  updateWorkExperience(
                                    index,
                                    "address",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Supervisor
                              </label>
                              <input
                                type="text"
                                value={experience.supervisor}
                                onChange={(e) =>
                                  updateWorkExperience(
                                    index,
                                    "supervisor",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Job Title{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={experience.jobTitle}
                                onChange={(e) =>
                                  updateWorkExperience(
                                    index,
                                    "jobTitle",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors[`${index}_jobTitle`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                              {errors[`${index}_jobTitle`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`${index}_jobTitle`]}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Starting Salary
                              </label>
                              <div className="flex gap-2">
                                <select
                                  value={experience.startingSalaryType}
                                  onChange={(e) =>
                                    updateWorkExperience(
                                      index,
                                      "startingSalaryType",
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="hourly">Hourly</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="bi-weekly">Bi-Weekly</option>
                                  <option value="monthly">Monthly</option>
                                  <option value="yearly">Yearly</option>
                                </select>
                                <input
                                  type="text"
                                  value={experience.startingSalaryAmount}
                                  onChange={(e) =>
                                    updateWorkExperience(
                                      index,
                                      "startingSalaryAmount",
                                      e.target.value
                                    )
                                  }
                                  placeholder="50000"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ending Salary
                              </label>
                              <div className="flex gap-2">
                                <select
                                  value={experience.endingSalaryType}
                                  onChange={(e) =>
                                    updateWorkExperience(
                                      index,
                                      "endingSalaryType",
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="hourly">Hourly</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="bi-weekly">Bi-Weekly</option>
                                  <option value="monthly">Monthly</option>
                                  <option value="yearly">Yearly</option>
                                </select>
                                <input
                                  type="text"
                                  value={experience.endingSalaryAmount}
                                  onChange={(e) =>
                                    updateWorkExperience(
                                      index,
                                      "endingSalaryAmount",
                                      e.target.value
                                    )
                                  }
                                  placeholder="60000"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Responsibilities{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={experience.responsibilities}
                                onChange={(e) =>
                                  updateWorkExperience(
                                    index,
                                    "responsibilities",
                                    e.target.value
                                  )
                                }
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors[`${index}_responsibilities`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                              {errors[`${index}_responsibilities`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`${index}_responsibilities`]}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                From <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                value={experience.from}
                                onChange={(e) =>
                                  updateWorkExperience(
                                    index,
                                    "from",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors[`${index}_from`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                              {errors[`${index}_from`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`${index}_from`]}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                To <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                value={experience.to}
                                onChange={(e) =>
                                  updateWorkExperience(
                                    index,
                                    "to",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  errors[`${index}_to`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                              {errors[`${index}_to`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`${index}_to`]}
                                </p>
                              )}
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reason for Leaving
                              </label>
                              <input
                                type="text"
                                value={experience.reasonForLeaving}
                                onChange={(e) =>
                                  updateWorkExperience(
                                    index,
                                    "reasonForLeaving",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                May we contact your previous supervisor for a
                                reference?
                              </label>
                              <div className="flex gap-6">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`contactSupervisor_${index}`}
                                    value="yes"
                                    checked={
                                      experience.contactSupervisor === true
                                    }
                                    onChange={() =>
                                      updateWorkExperience(
                                        index,
                                        "contactSupervisor",
                                        true
                                      )
                                    }
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  />
                                  <span className="ml-2 text-sm font-medium text-gray-700">
                                    YES
                                  </span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`contactSupervisor_${index}`}
                                    value="no"
                                    checked={
                                      experience.contactSupervisor === false
                                    }
                                    onChange={() =>
                                      updateWorkExperience(
                                        index,
                                        "contactSupervisor",
                                        false
                                      )
                                    }
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  />
                                  <span className="ml-2 text-sm font-medium text-gray-700">
                                    NO
                                  </span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addWorkExperience}
                        className="mb-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        ➕ Add Previous Employment
                      </button>
                    </>
                  )}

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
                      💼 Current: Work Experience
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
                          navigate(
                            getPreviousFormPath("/employee/work-experience")
                          )
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
                          workExperiences[0]?.hrFeedback &&
                          Object.keys(workExperiences[0].hrFeedback).length >
                            0 &&
                          (workExperiences[0].hrFeedback.comment ||
                            workExperiences[0].hrFeedback.notes ||
                            workExperiences[0].hrFeedback.feedback ||
                            workExperiences[0].hrFeedback.note ||
                            workExperiences[0].hrFeedback.companyRepSignature ||
                            workExperiences[0].hrFeedback
                              .companyRepresentativeSignature ||
                            workExperiences[0].hrFeedback.notarySignature ||
                            workExperiences[0].hrFeedback.agencySignature ||
                            workExperiences[0].hrFeedback.clientSignature ||
                            Object.keys(
                              workExperiences[0].hrFeedback || {}
                            ).some(
                              (key) =>
                                workExperiences[0].hrFeedback[key] &&
                                typeof workExperiences[0].hrFeedback[key] ===
                                  "string" &&
                                workExperiences[0].hrFeedback[key].trim()
                                  .length > 0
                            ));

                        // Check if form is locked (submitted or completed, and no HR notes)
                        const isLocked =
                          (applicationStatus === "submitted" ||
                            applicationStatus === "completed") &&
                          !hasHrNotes;

                        return (
                          <button
                            type="button"
                            onClick={() => handleSave()}
                            disabled={isLoading || isLocked}
                            className={`inline-flex items-center justify-center gap-2 md:gap-3 w-full max-w-xs py-2.5 md:py-3 px-3 md:px-5 font-bold tracking-wide rounded-lg focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm md:text-base ${
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
                              <RotateCcw className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-1 md:mr-2" />
                            ) : (
                              <Send className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
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

export default WorkExperience;
