import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect as useRedirect } from "react";
import {
  ArrowLeft,
  Send,
  Calendar,
  Eye,
  FileText,
  RotateCcw,
  Target,
} from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import SignaturePad from "../../Components/Common/SignaturePad";

const EditBackgroundFormCheckResults = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if this is being viewed by HR
  const searchParams = new URLSearchParams(location.search);
  const isHRView = searchParams.get("hr") === "true";
  const isViewMode = searchParams.get("view") === "true";
  const hrApplicationId = searchParams.get("applicationId");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);

  const [employmentType, setEmploymentType] = useState(null);
  const [totalForms, setTotalForms] = useState(25); // default to 25

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleInitial: "",
    socialSecurityNo: "",
    height: "",
    weight: "",
    eyeColor: "",
    hairColor: "",
    dateOfBirth: new Date(),
    sex: "",
    race: "",
    streetAddress: "",
    city: "",
    state: "",
    zip: "",
    provider: "",
    positionAppliedFor: "",
    signature: "",
    date: new Date(),
  });

  // Signature state
  const [signatureData, setSignatureData] = useState("");

  // Signature handler
  const handleSignatureChange = (signature) => {
    setSignatureData(signature);
    setFormData((prev) => ({
      ...prev,
      signature: signature,
    }));
  };

  // Configure axios
  const baseURL =
    import.meta.env.VITE__BASEURL || "https://api.carecompapp.com";
  const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const shouldCountForm = (formKey) => {
    if (employmentType === "W-2 Employee") {
      return formKey !== "w9Form";
    } else if (employmentType === "1099 Contractor") {
      return formKey !== "w4Form";
    }
    return formKey !== "w9Form"; // default to W-2 if not set
  };

  const fetchProgressData = async (userId, existingData = null) => {
    try {
      let backendData = existingData;
      
      const userCookie = Cookies.get("user");
      const user = userCookie
        ? JSON.parse(userCookie)
        : { _id: "67e0f8770c6feb6ba99d11d2" };

      if (!backendData) {
        const response = await axios.get(
          `${baseURL}/onboarding/get-application/${user._id}`,
          { withCredentials: true },
        );
        if (response.data?.data) {
           backendData = response.data.data;
        }
      }

      if (backendData?.application) {
        const forms = backendData.forms;
        setApplicationStatus(forms);
        setEmploymentType(backendData.application.employmentType);

        const formKeys = [
          "employmentType",
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
          "jobDescriptionPCA",
          "jobDescriptionCNA",
          "jobDescriptionLPN",
          "jobDescriptionRN",
        ];

        const completedFormsArray =
          response.data.data.application?.completedForms || [];
        const completedSet = new Set(completedFormsArray);

        const filteredKeys = formKeys.filter(shouldCountForm);
        setTotalForms(filteredKeys.length);

        const completedForms = filteredKeys.filter((key) => {
          const form = forms[key];
          return (
            form?.status === "submitted" ||
            form?.status === "completed" ||
            form?.status === "under_review" ||
            form?.status === "approved" ||
            completedSet.has(key) ||
            (key === "employmentType" &&
              response.data.data.application.employmentType)
          );
        }).length;

        // const totalForms = 25; // using state now
        const progressPercentage = Math.round(
          (completedForms / filteredKeys.length) * 100,
        );
        setOverallProgress(progressPercentage);
      }
    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  };

  // Redirect to upload page if not HR view
  useEffect(() => {
    if (!isHRView && !isViewMode) {
      navigate("/employee/background-check-upload", { replace: true });
      return;
    }
  }, [isHRView, isViewMode, navigate]);

  // Initialize form data
  useEffect(() => {
    if (isHRView || isViewMode) {
      initializeForm();
      if (!isHRView) {

      }
    }
  }, [isHRView, isViewMode]);

  const initializeForm = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      if (token) {
        api.defaults.headers["Authorization"] = `Bearer ${token}`;
      }

      let targetApplicationId;
      if (isHRView && hrApplicationId) {
        targetApplicationId = hrApplicationId;
      } else {
        const userCookie = Cookies.get("user");
        const user = userCookie ? JSON.parse(userCookie) : {};
        const currentUserId = user._id || "67e0f8770c6feb6ba99d11d2"; // Fallback for dev
        setUserId(currentUserId);

        const appResponse = await api.get(
          `/onboarding/get-application/${currentUserId}`,
        );
        targetApplicationId = appResponse.data?.data?.application?._id;

        if (targetApplicationId) {
          // Pass fetched data to fetchProgressData
          if (appResponse.data?.data) {
             fetchProgressData(currentUserId, appResponse.data.data);
          } else {
             fetchProgressData(currentUserId);
          }
        }
      }

      if (!targetApplicationId) {
        toast.error("Could not find an application associated with this user.");
        setLoading(false);
        return;
      }

      setApplicationId(targetApplicationId);

      // --- REFACTORED DATA FETCHING LOGIC ---
      let backgroundData = {};
      let personalInfoData = {};

      // 1. Fetch Background Check data (if it exists)
      try {
        const bgResponse = await api.get(
          `/onboarding/get-background-check/${targetApplicationId}`,
        );
        if (bgResponse.data?.backgroundCheck) {
          backgroundData = bgResponse.data.backgroundCheck;
          console.log(
            "🟢 Found existing Background Check data:",
            backgroundData,
          );
        }
      } catch (error) {
        console.log(
          "📝 No existing Background Check data found. Will rely on Personal Info data.",
        );
      }

      // 2. Fetch Personal Information data (where name, SSN, DOB, address are stored)
      try {
        const personalResponse = await api.get(
          `/onboarding/get-personal-information/${targetApplicationId}`,
        );
        if (personalResponse.data?.personalInformation) {
          personalInfoData = personalResponse.data.personalInformation;
          console.log("🟢 Found Personal Information data:", personalInfoData);
        }
      } catch (error) {
        console.error(
          "🔴 Critical Error: Could not load Personal Information data.",
          error,
        );
        toast.error("Failed to load required personal information.");
      }

      // 3. Merge data and set state
      const bgAppInfo = backgroundData.applicantInfo || {};
      const bgEmpInfo = backgroundData.employmentInfo || {};

      console.log("🔵 DEBUG - Full backgroundData:", backgroundData);
      console.log("🔵 DEBUG - Full personalInfoData:", personalInfoData);
      console.log("🔵 DEBUG - Background Check applicantInfo:", bgAppInfo);

      // IMPORTANT: Physical fields (height, weight, eyeColor, hairColor) are ONLY in Background Check
      // Personal Information stores basic details like name, SSN, DOB, address
      const finalData = {
        // Basic info from Background Check or Personal Information
        lastName: bgAppInfo.lastName || personalInfoData.lastName || "",
        firstName: bgAppInfo.firstName || personalInfoData.firstName || "",
        middleInitial:
          bgAppInfo.middleInitial || personalInfoData.middleName || "",
        socialSecurityNo:
          bgAppInfo.socialSecurityNumber || personalInfoData.ssn || "",

        // Physical fields - ONLY from Background Check (these don't exist in Personal Info)
        height: bgAppInfo.height || "",
        weight: bgAppInfo.weight || "",
        eyeColor: bgAppInfo.eyeColor || "",
        hairColor: bgAppInfo.hairColor || "",
        sex: bgAppInfo.sex || personalInfoData.gender || "",
        race: bgAppInfo.race || personalInfoData.race || "",

        // Address and other info from either source
        streetAddress:
          bgAppInfo.address?.street || personalInfoData.address || "",
        city: bgAppInfo.address?.city || personalInfoData.city || "",
        state: bgAppInfo.address?.state || personalInfoData.state || "",
        zip: bgAppInfo.address?.zipCode || personalInfoData.zipCode || "",
        provider: bgEmpInfo.provider || "",
        positionAppliedFor:
          bgEmpInfo.positionAppliedFor ||
          personalInfoData.positionApplied ||
          "",
        signature: backgroundData.applicantSignature || "",
        date: backgroundData.applicantSignatureDate
          ? new Date(backgroundData.applicantSignatureDate)
          : new Date(),
        dateOfBirth:
          bgAppInfo.dateOfBirth || personalInfoData.dateOfBirth
            ? new Date(bgAppInfo.dateOfBirth || personalInfoData.dateOfBirth)
            : new Date(),
      };

      console.log("🟣 Final merged form data:", finalData);
      console.log("✅ Data loaded successfully!");

      setFormData(finalData);
      if (finalData.signature) {
        setSignatureData(finalData.signature);
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      toast.error("Error loading form data.");
    } finally {
      setLoading(false);
    }
  };

  const saveForm = async (status = "draft") => {
    try {
      setSaving(true);

      // Ensure we have a valid application ID
      if (!applicationId) {
        toast.error(
          "No application ID available. Please refresh the page and try again.",
        );
        return false;
      }

      // Ensure we have a valid user ID
      if (!userId) {
        toast.error(
          "No user ID available. Please refresh the page and try again.",
        );
        return false;
      }

      // Map frontend form data to backend schema format
      const mappedFormData = {
        applicantInfo: {
          lastName: formData.lastName || "",
          firstName: formData.firstName || "",
          middleInitial: formData.middleInitial || "",
          socialSecurityNumber: formData.socialSecurityNo || "",
          height: formData.height || "",
          weight: formData.weight || "",
          eyeColor: formData.eyeColor || "",
          hairColor: formData.hairColor || "",
          dateOfBirth: formData.dateOfBirth || null,
          sex: formData.sex || "",
          race: formData.race || "",
          address: {
            street: formData.streetAddress || "",
            city: formData.city || "",
            state: formData.state || "",
            zipCode: formData.zip || "",
          },
        },
        employmentInfo: {
          provider: formData.provider || "",
          positionAppliedFor: formData.positionAppliedFor || "",
        },
        consentAcknowledgment: {
          // Add any consent fields if they exist in your form
          consentGiven: true, // Default to true if form is being submitted
        },
        notification: {
          // Add any notification fields if they exist in your form
        },
        applicantSignature: formData.signature || "",
        applicantSignatureDate: formData.date || null,
      };

      const payload = {
        applicationId: applicationId, // Use the actual application ID
        employeeId: userId, // Use the actual user ID
        formData: mappedFormData,
        status: status,
      };

      console.log("Saving background check form with payload:", payload);
      console.log("🔴 Payload structure:", {
        applicationId: payload.applicationId,
        employeeId: payload.employeeId,
        formDataKeys: Object.keys(payload.formData),
        applicantInfoKeys: payload.formData.applicantInfo
          ? Object.keys(payload.formData.applicantInfo)
          : null,
        hasBackgroundFields: {
          height: !!payload.formData.applicantInfo?.height,
          weight: !!payload.formData.applicantInfo?.weight,
          eyeColor: !!payload.formData.applicantInfo?.eyeColor,
          hairColor: !!payload.formData.applicantInfo?.hairColor,
        },
        actualBackgroundFieldValues: {
          height: payload.formData.applicantInfo?.height,
          weight: payload.formData.applicantInfo?.weight,
          eyeColor: payload.formData.applicantInfo?.eyeColor,
          hairColor: payload.formData.applicantInfo?.hairColor,
        },
      });

      const response = await api.post(
        "/onboarding/save-background-check",
        payload,
      );

      console.log("🟢 Save response received:", response);
      console.log("🟢 Save response data:", response.data);

      if (response.data) {
        console.log("🟢 Save successful, response:", response.data);
        toast.success(
          `Background check form ${
            status === "completed" ? "submitted" : "saved"
          } successfully!`,
        );
        return true;
      }
    } catch (error) {
      console.error("Error saving form:", error);

      // Provide more specific error messages
      if (error.response?.status === 400) {
        toast.error("Invalid form data. Please check all required fields.");
      } else if (error.response?.status === 404) {
        toast.error("Application not found. Please refresh and try again.");
      } else {
        toast.error("Error saving form. Please try again.");
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`🔵 Form input changed: ${field} = "${value}"`);

    // Special logging for physical fields
    if (["height", "weight", "eyeColor", "hairColor"].includes(field)) {
      console.log(`⭐ PHYSICAL FIELD CHANGED: ${field} = "${value}"`);
    }

    setFormData((prev) => {
      const newState = {
        ...prev,
        [field]: value,
      };
      console.log(`🔵 Form state after change for ${field}:`, newState);
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("========== FORM SUBMISSION STARTED ==========");
    console.log("📋 FULL FORM DATA STATE:", formData);
    console.log("⭐ PHYSICAL FIELDS AT SUBMIT:", {
      height: formData.height,
      weight: formData.weight,
      eyeColor: formData.eyeColor,
      hairColor: formData.hairColor,
    });

    console.log("Form submission validation check:");
    console.log("formData.signature:", formData.signature);
    console.log("signatureData:", signatureData);
    console.log("typeof formData.signature:", typeof formData.signature);
    console.log("formData.signature length:", formData.signature?.length || 0);

    console.log(
      "lastName:",
      formData.lastName,
      "- trimmed:",
      formData.lastName?.trim(),
    );
    console.log(
      "firstName:",
      formData.firstName,
      "- trimmed:",
      formData.firstName?.trim(),
    );
    console.log(
      "socialSecurityNo:",
      formData.socialSecurityNo,
      "- trimmed:",
      formData.socialSecurityNo?.trim(),
    );
    console.log(
      "signature:",
      formData.signature,
      "- trimmed:",
      formData.signature?.trim(),
    );

    // Validate required fields
    const requiredFields = [
      "lastName",
      "firstName",
      "socialSecurityNo",
      "signature",
    ];

    // Special validation for signature - accept either editable signature data OR existing signature URL
    const missingFields = [];
    for (const field of requiredFields) {
      if (field === "signature") {
        // For signature, accept either:
        // 1. Editable signature data (non-empty string not starting with 'http')
        // 2. Existing signature URL (string starting with 'http')
        const signatureValue = formData[field];
        const hasValidSignature =
          signatureValue &&
          (signatureValue.trim() !== "" ||
            (typeof signatureValue === "string" &&
              signatureValue.startsWith("http")));

        if (!hasValidSignature) {
          missingFields.push(field);
        }
      } else {
        // Regular validation for other fields
        if (!formData[field]?.trim()) {
          missingFields.push(field);
        }
      }
    }

    console.log("Missing fields:", missingFields);

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in all required fields! Missing: ${missingFields.join(
          ", ",
        )}`,
        {
          duration: 4000,
          position: "top-right",
        },
      );
      // Force signature validation for debugging
      if (missingFields.includes("signature")) {
        console.log("SIGNATURE DEBUGGING:");
        console.log("- signatureData state:", signatureData);
        console.log("- formData.signature:", formData.signature);
        console.log("- Signature PAD value prop:", signatureData);
      }
      return;
    }

    const success = await saveForm("completed");
    if (success) {
      // Continue the onboarding flow: after background check, go to TB Symptom Screen edit
      setTimeout(() => {
        navigate("/employee/edit-tb-symptom-screen-form");
      }, 2000);
    }
  };

  return (
    <Layout>
      <Navbar />
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F3A93] mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Loading background check form...
            </p>
          </div>
        </div>
      ) : (
        <>
          <style jsx global>{`
            .react-datepicker-wrapper {
              width: 100%;
            }
            .react-datepicker__input-container input {
              width: 100%;
              height: 3rem;
              padding: 0.75rem 1rem;
              border: 2px solid #d1d5db;
              border-radius: 0.75rem;
              background-color: white;
              color: #111827;
              font-size: 1rem;
              transition: all 0.2s;
            }
            .react-datepicker__input-container input:focus {
              outline: none;
              border-color: #1f3a93;
              box-shadow: 0 0 0 3px rgba(31, 58, 147, 0.1);
            }
          `}</style>

          {/* Back Button - Outside main container for consistent positioning */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mb-6 pt-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (isHRView) {
                    navigate("/hr/dashboard");
                  } else {
                    navigate("/employee/task-management");
                  }
                }}
                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base font-semibold transform hover:-translate-y-0.5"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span>
                  {isHRView ? "Back to HR Dashboard" : "Back to Tasks"}
                </span>
              </button>

              {/* HR Context Indicator */}
              {isHRView && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 border border-amber-300 rounded-lg">
                  <Eye className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-800 font-medium text-sm">
                    HR Review Mode
                  </span>
                  {isViewMode && (
                    <span className="text-amber-700 text-xs">(Read-Only)</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Container with sidebar layout */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-12">
            <div className="flex gap-6">
              {/* Vertical Progress Bar Sidebar */}
              {!isHRView && (
                <div className="w-16 flex-shrink-0">
                  <div className="sticky top-6 flex flex-col items-center">
                    {/* Vertical Progress Bar */}
                    <div className="w-4 h-[500px] bg-gray-200 rounded-full relative shadow-inner">
                      <div
                        className="w-4 bg-gradient-to-t from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out absolute bottom-0 shadow-sm"
                        style={{ height: `${overallProgress}%` }}
                      ></div>
                    </div>

                    {/* Percentage Text */}
                    <div className="mt-4 text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {overallProgress}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Application Progress
                      </div>
                    </div>

                    {/* Loading Indicator */}
                    {saving && (
                      <div className="mt-4">
                        <RotateCcw className="w-5 h-5 text-blue-600 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Main Form Content with scroll */}
              <div className="flex-1 max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
                <div className="w-full max-w-[75%] mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  {/* Header with DBHDD Logo */}
                  <div className="bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white px-4 sm:px-6 md:px-9 py-4 sm:py-6 md:py-8">
                    <div className="flex flex-col lg:flex-row items-start justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-white/20">
                      <div className="flex flex-col sm:flex-row items-center mb-4 lg:mb-0">
                        {/* DBHDD Logo */}
                        <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-[#4a4a9e] to-[#6366f1] rounded-lg flex items-center justify-center mb-3 sm:mb-0 sm:mr-4 md:mr-6 relative overflow-hidden shadow-lg flex-shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#4a4a9e] to-[#6366f1]"></div>
                          <div className="relative z-10 text-center">
                            <div className="text-yellow-300 text-lg sm:text-xl mb-1">
                              ⭐
                            </div>
                            <div className="text-white text-xs sm:text-sm font-bold">
                              DBHDD
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Department Info */}
                      <div className="text-center lg:text-right flex-1">
                        <div className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
                          Georgia Department of Behavioral Health &
                          Developmental Disabilities
                        </div>
                        <div className="text-sm sm:text-base italic text-blue-100 mb-2 sm:mb-3">
                          Judy Fitzgerald, Commissioner
                        </div>
                        <div className="text-base sm:text-lg font-semibold text-white mb-2">
                          Office of Enterprise Compliance
                        </div>
                        <div className="text-xs sm:text-sm text-blue-100">
                          Two Peachtree Street, NW • 9th Floor • Atlanta,
                          Georgia 30303-3142 •<br />
                          Telephone: 404-463-2507 • Fax: 770-339-5473
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-center">
                      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-wide leading-tight underline">
                        EDIT GEMALTO APPLICANT REGISTRATION FORM
                      </h2>
                    </div>
                  </div>

                  {/* Document Content */}
                  <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm md:text-base leading-relaxed text-gray-700 px-3 sm:px-6 md:px-8 lg:px-16 py-6 sm:py-8 md:py-12">
                    {/* Form Fields */}
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4 sm:space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          <div className="lg:col-span-1">
                            <label className="block text-xs sm:text-sm font-semibold text-[#1F3A93] mb-2">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) =>
                                handleInputChange("lastName", e.target.value)
                              }
                              readOnly={isHRView}
                              className={`w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md ${
                                isHRView
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : "bg-white"
                              }`}
                              placeholder="Enter last name"
                              required
                            />
                          </div>
                          <div className="lg:col-span-1">
                            <label className="block text-xs sm:text-sm font-semibold text-[#1F3A93] mb-2">
                              First Name *
                            </label>
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) =>
                                handleInputChange("firstName", e.target.value)
                              }
                              readOnly={isHRView}
                              className={`w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md ${
                                isHRView
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : "bg-white"
                              }`}
                              placeholder="Enter first name"
                              required
                            />
                          </div>
                          <div className="lg:col-span-1">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2">
                              Middle Initial
                            </label>
                            <input
                              type="text"
                              value={formData.middleInitial}
                              onChange={(e) =>
                                handleInputChange(
                                  "middleInitial",
                                  e.target.value,
                                )
                              }
                              readOnly={isHRView}
                              className={`w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md ${
                                isHRView
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : "bg-white"
                              }`}
                              placeholder="MI"
                              maxLength="1"
                            />
                          </div>
                        </div>

                        {/* Personal Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                          <div className="sm:col-span-2 lg:col-span-2">
                            <label className="block text-xs sm:text-sm font-semibold text-[#1F3A93] mb-2">
                              Social Security No. *
                            </label>
                            <input
                              type="text"
                              value={formData.socialSecurityNo}
                              onChange={(e) =>
                                handleInputChange(
                                  "socialSecurityNo",
                                  e.target.value,
                                )
                              }
                              readOnly={isHRView}
                              className={`w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md ${
                                isHRView
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : "bg-white"
                              }`}
                              placeholder="XXX-XX-XXXX"
                              required
                            />
                          </div>
                          <div className="lg:col-span-1">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2">
                              Height
                            </label>
                            <input
                              type="text"
                              value={formData.height}
                              onChange={(e) =>
                                handleInputChange("height", e.target.value)
                              }
                              readOnly={isHRView}
                              className={`w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md ${
                                isHRView
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : "bg-white"
                              }`}
                              placeholder="5'8&quot;"
                            />
                          </div>
                          <div className="lg:col-span-1">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2">
                              Weight
                            </label>
                            <input
                              type="text"
                              value={formData.weight}
                              onChange={(e) =>
                                handleInputChange("weight", e.target.value)
                              }
                              readOnly={isHRView}
                              className={`w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md ${
                                isHRView
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : "bg-white"
                              }`}
                              placeholder="lbs"
                            />
                          </div>
                          <div className="lg:col-span-1">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2">
                              Eye Color
                            </label>
                            <input
                              type="text"
                              value={formData.eyeColor}
                              onChange={(e) =>
                                handleInputChange("eyeColor", e.target.value)
                              }
                              readOnly={isHRView}
                              className={`w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md ${
                                isHRView
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : "bg-white"
                              }`}
                              placeholder="Brown"
                            />
                          </div>
                        </div>

                        {/* Additional Personal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Hair Color
                            </label>
                            <input
                              type="text"
                              value={formData.hairColor}
                              onChange={(e) =>
                                handleInputChange("hairColor", e.target.value)
                              }
                              readOnly={isHRView}
                              className={`w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md ${
                                isHRView
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : "bg-white"
                              }`}
                              placeholder="Black"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Date of Birth
                            </label>
                            <div className="relative">
                              <DatePicker
                                selected={formData.dateOfBirth}
                                onChange={(date) =>
                                  handleInputChange("dateOfBirth", date)
                                }
                                className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                                dateFormat="MM/dd/yyyy"
                                placeholderText="Select date"
                                showPopperArrow={false}
                                popperClassName="react-datepicker-popper"
                              />
                              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                          <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Sex
                            </label>
                            <select
                              value={formData.sex}
                              onChange={(e) =>
                                handleInputChange("sex", e.target.value)
                              }
                              className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                              <option value="">Select</option>
                              <option value="M">Male</option>
                              <option value="F">Female</option>
                            </select>
                          </div>
                          <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Race
                            </label>
                            <input
                              type="text"
                              value={formData.race}
                              onChange={(e) =>
                                handleInputChange("race", e.target.value)
                              }
                              className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                              placeholder="Enter race"
                            />
                          </div>
                        </div>

                        {/* Address Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Street Address
                            </label>
                            <input
                              type="text"
                              value={formData.streetAddress}
                              onChange={(e) =>
                                handleInputChange(
                                  "streetAddress",
                                  e.target.value,
                                )
                              }
                              className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                              placeholder="Enter street address"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              City
                            </label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) =>
                                handleInputChange("city", e.target.value)
                              }
                              className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                              placeholder="City"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              State
                            </label>
                            <input
                              type="text"
                              value={formData.state}
                              onChange={(e) =>
                                handleInputChange("state", e.target.value)
                              }
                              className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                              placeholder="GA"
                              maxLength="2"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Zip Code
                            </label>
                            <input
                              type="text"
                              value={formData.zip}
                              onChange={(e) =>
                                handleInputChange("zip", e.target.value)
                              }
                              className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                              placeholder="30303"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Provider
                            </label>
                            <input
                              type="text"
                              value={formData.provider}
                              onChange={(e) =>
                                handleInputChange("provider", e.target.value)
                              }
                              className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                              placeholder="Provider name"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Position Applied For
                            </label>
                            <input
                              type="text"
                              value={formData.positionAppliedFor}
                              onChange={(e) =>
                                handleInputChange(
                                  "positionAppliedFor",
                                  e.target.value,
                                )
                              }
                              className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                              placeholder="Position title"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Consent Text */}
                      <div className="mt-8 sm:mt-12 mb-6 sm:mb-8">
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 rounded-xl border border-gray-200 shadow-lg">
                          <h3 className="text-base sm:text-lg font-bold text-[#1F3A93] mb-3 sm:mb-4">
                            Consent & Agreement
                          </h3>
                          <p className="text-xs sm:text-sm md:text-base leading-relaxed text-gray-700 text-justify">
                            I am aware that a fingerprint-based background check
                            is required for employment with a DBHDD network
                            provider under Policy 04-104. I have read and
                            accepted the terms of the Applicant Privacy Rights
                            and Privacy Act Statement. I understand that DBHDD
                            Criminal History Background Section (CHBC) must
                            approve all applicant registrations prior to a
                            fingerprint submission. I also understand that
                            registrations will be approved or rejected based
                            upon information submitted. In either case, I will
                            receive an email from Gemalto explaining the status
                            of my request. I understand that incomplete forms or
                            inaccurate information will delay approval process.
                          </p>
                        </div>
                      </div>

                      {/* Signature Section */}
                      <div className="mt-8 sm:mt-12 bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 rounded-xl border border-gray-200 shadow-lg">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1F3A93] mb-4 sm:mb-6 text-center">
                          Electronic Signatures
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                          <div>
                            <label className="block text-sm sm:text-base font-semibold text-[#1F3A93] mb-2 sm:mb-3">
                              Signature *
                            </label>
                            <div className="relative">
                              <SignaturePad
                                initialValue={signatureData}
                                onSave={handleSignatureChange}
                                width="100%"
                                height="200px"
                                className="border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] transition-all duration-300 shadow-sm hover:shadow-md"
                              />
                              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                                Please sign above using your mouse, touchpad, or
                                touch screen
                              </p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">
                              Date *
                            </label>
                            <div className="relative">
                              <DatePicker
                                selected={formData.date}
                                onChange={(date) =>
                                  handleInputChange("date", date)
                                }
                                className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                                dateFormat="MM/dd/yyyy"
                                placeholderText="Select date"
                                showPopperArrow={false}
                                popperClassName="react-datepicker-popper"
                              />
                              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-200 text-center text-xs sm:text-sm text-gray-600">
                        <p>
                          2 Peachtree Street, NW • Atlanta, Georgia 30303 •
                          404.657.2252
                        </p>
                        <p className="mt-1">
                          dbhdd.georgia.gov • Facebook: Georgia DBHDD • Twitter:
                          @DBHDD
                        </p>
                      </div>

                      {/* Progress Bar in Form Footer */}
                      {!isHRView && (
                        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Target className="w-5 h-5 text-blue-600" />
                              <span className="text-sm font-semibold text-gray-700">
                                Application Progress
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">
                                {Math.round(
                                  (overallProgress / 100) * totalForms,
                                )}
                                /{totalForms}
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
                            📝 Current: Background Check Form
                          </div>
                        </div>
                      )}

                      {/* Submit Button - standardized three-zone footer */}
                      {!isHRView && (
                        <div className="bg-white px-3 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 rounded-b-2xl border-t border-gray-100">
                          <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-6 sm:mb-8">
                              <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2">
                                Complete Your Background Check Form
                              </h4>
                              <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                                Review all information above before submitting
                              </p>
                            </div>

                            {/* Three-zone footer: Previous (left) | Exit Application (center) | Save & Next (right) */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                              {/* Left - Previous */}
                              <div className="w-full sm:w-1/3 flex justify-start">
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate("/employee/non-compete")
                                  }
                                  className="inline-flex items-center px-4 py-3 sm:px-5 sm:py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
                                  disabled={saving}
                                >
                                  <ArrowLeft className="w-4 h-4 mr-2" />
                                  <span>Previous Form</span>
                                </button>
                              </div>

                              {/* Center - Exit Application */}
                              <div className="w-full sm:w-1/3 flex justify-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate("/employee/task-management")
                                  }
                                  className="inline-flex items-center px-4 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
                                  disabled={saving}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  <span>Exit Application</span>
                                </button>
                              </div>

                              {/* Right - Save & Next */}
                              <div className="w-full sm:w-1/3 flex justify-end">
                                <button
                                  type="submit"
                                  className="inline-flex items-center px-4 py-3 sm:px-5 sm:py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                                  disabled={saving}
                                >
                                  {saving ? (
                                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                  )}
                                  <span>
                                    {saving ? "Submitting..." : "Save & Next"}
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* HR View Information */}
                      {isHRView && (
                        <div className="bg-gray-50 px-3 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 rounded-b-2xl border-t border-gray-200">
                          <div className="max-w-4xl mx-auto text-center">
                            <div className="flex items-center justify-center gap-2 mb-4">
                              <Eye className="w-6 h-6 text-blue-600" />
                              <h4 className="text-lg font-bold text-gray-800">
                                HR Review - Background Check Form
                              </h4>
                            </div>
                            <p className="text-gray-600 text-sm">
                              This form is being viewed in read-only mode for HR
                              review purposes.
                              {hrApplicationId && (
                                <span className="block mt-2 text-xs text-gray-500">
                                  Application ID: {hrApplicationId}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
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
        </>
      )}
    </Layout>
  );
};

export default EditBackgroundFormCheckResults;
