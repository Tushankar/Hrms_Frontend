import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  ArrowLeft,
  Send,
  Save,
  RotateCcw,
  Target,
  Upload,
  User,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";
import { getNextFormPath } from "../../utils/formNavigationSequence";

// FormInput component
const FormInput = ({
  label,
  value,
  onChange,
  type = "text",
  className = "",
  placeholder = "",
  required = false,
  onFocus = () => {},
  onBlur = () => {},
}) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
      required={required}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  </div>
);

FormInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
};

// FormSelect component
const FormSelect = ({
  label,
  value,
  onChange,
  options,
  className = "",
  required = false,
  disabled = false,
  showPlaceholder = true,
}) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 max-h-48 overflow-y-auto"
      required={required}
      disabled={disabled}
    >
      {showPlaceholder && <option value="">Select...</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

FormSelect.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  showPlaceholder: PropTypes.bool,
};

const formatDateForInput = (isoDate) => {
  if (!isoDate) return "";
  return isoDate.split("T")[0];
};

// Format SSN as 000-00-0000
const formatSSN = (value) => {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, "");

  // Limit to 9 digits
  const limited = cleaned.slice(0, 9);

  // Format as XXX-XX-XXXX
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 5) {
    return `${limited.slice(0, 3)}-${limited.slice(3)}`;
  } else {
    return `${limited.slice(0, 3)}-${limited.slice(3, 5)}-${limited.slice(5)}`;
  }
};

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
    return `+1 (${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(
      6
    )}`;
  }
};

// Format Government ID based on type
const formatGovernmentId = (value, idType) => {
  if (!idType) return value;

  // Remove all non-alphanumeric characters and convert to uppercase
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (idType === "Passport") {
    // Passport format: typically 9 characters (1 letter + 8 digits)
    const limited = cleaned.slice(0, 9);

    // If it starts with a letter followed by digits, format accordingly
    if (limited.length > 1 && /^[A-Z]/.test(limited)) {
      const letter = limited[0];
      const numbers = limited.slice(1).replace(/[^0-9]/g, "");
      return letter + numbers.slice(0, 8);
    }

    return limited;
  } else if (idType === "Driver's License" || idType === "State ID") {
    // Driver's License/State ID: alphanumeric, typically 1-12 characters
    // Many states use formats like: 123456789 (9 digits) or A1234567 (1 letter + 7 digits)
    const limited = cleaned.slice(0, 12);

    // Common formats: if it looks like it should have a letter prefix
    if (limited.length > 1 && /^\d/.test(limited) && limited.length >= 8) {
      // Pure numeric - format as groups if long enough
      if (limited.length === 9) {
        return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(
          6
        )}`;
      } else if (limited.length === 8) {
        return `${limited.slice(0, 2)}-${limited.slice(2, 5)}-${limited.slice(
          5
        )}`;
      }
    } else if (limited.length > 1 && /^[A-Z]\d/.test(limited)) {
      // Letter followed by digits - common format
      const letter = limited[0];
      const numbers = limited.slice(1).replace(/[^0-9]/g, "");
      if (numbers.length >= 7) {
        return `${letter}${numbers.slice(0, 3)}-${numbers.slice(
          3,
          6
        )}-${numbers.slice(6, 9)}`;
      } else if (numbers.length >= 6) {
        return `${letter}${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      }
    }

    return limited;
  }

  return cleaned.slice(0, 20); // Default max length
};

// Mask SSN for display
const maskSSN = (value) => {
  if (!value) return "";
  if (value.length < 11) return value; // Show as is if not fully formatted
  return "***-**-****";
};

const PersonalInformation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState("draft");
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [ssnFocused, setSsnFocused] = useState(false);
  const [formData, setFormData] = useState({
    // Full Name
    lastName: "",
    firstName: "",
    middleInitial: "",

    // Date
    date: "",

    // Address
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",

    // Contact
    phone: "",
    email: "",

    // Employment Details
    dateAvailable: "",
    socialSecurityNo: "",
    desiredSalary: "",
    desiredSalaryType: "",
    positionAppliedFor: "",

    // Government ID
    governmentIdType: "",
    governmentIdState: "",
    governmentIdCountry: "",
    governmentIdNumber: "",

    // Authorization Questions
    isUSCitizen: "",
    isAuthorizedToWork: "",
    authorizedToWorkExplanation: "",
    hasWorkedHereBefore: "",
    previousWorkDate: "",
    hasBeenConvictedOfFelony: "",
    felonyExplanation: "",
  });

  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    initializeForm();
    fetchCountries().then(() => {
      // Fetch states for default country (United States)
      fetchStates("United States");
    });
  }, []);

  // Fetch countries from API
  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await axios.get(
        "https://countriesnow.space/api/v0.1/countries"
      );
      if (response.data && response.data.data) {
        const countryList = response.data.data.map((country) => ({
          value: country.country,
          label: country.country,
        }));

        // Sort countries with United States first, then alphabetically
        const sortedCountries = countryList.sort((a, b) => {
          if (a.value === "United States") return -1;
          if (b.value === "United States") return 1;
          return a.label.localeCompare(b.label);
        });

        setCountries(sortedCountries);

        // Set United States as default if no country is selected
        if (!formData.country) {
          handleInputChange("country", "United States");
        }
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      // Fallback to some common countries if API fails
      setCountries([
        { value: "United States", label: "United States" },
        { value: "Canada", label: "Canada" },
        { value: "United Kingdom", label: "United Kingdom" },
        { value: "Australia", label: "Australia" },
        { value: "India", label: "India" },
      ]);
    } finally {
      setLoadingCountries(false);
    }
  };

  // Fetch states based on selected country
  const fetchStates = async (countryName) => {
    if (!countryName) {
      setStates([]);
      return;
    }

    setLoadingStates(true);
    try {
      const response = await axios.post(
        "https://countriesnow.space/api/v0.1/countries/states",
        {
          country: countryName,
        }
      );

      if (response.data && response.data.data && response.data.data.states) {
        const stateList = response.data.data.states.map((state) => ({
          value: state.name,
          label: state.name,
        }));
        setStates(stateList);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch cities based on selected country and state
  const fetchCities = async (countryName, stateName) => {
    if (!countryName || !stateName) {
      setCities([]);
      return;
    }

    setLoadingCities(true);
    try {
      const response = await axios.post(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        {
          country: countryName,
          state: stateName,
        }
      );

      if (response.data && response.data.data) {
        const cityList = response.data.data.map((city) => ({
          value: city,
          label: city,
        }));
        setCities(cityList);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchProgressData = async (userId) => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${userId}`,
        { withCredentials: true }
      );

      console.log("🔍 Progress Data Response:", response.data);

      if (response.data?.data) {
        const backendData = response.data.data;
        setApplicationStatus(
          backendData.application?.applicationStatus || "draft"
        );

        // Calculate progress with 23 total forms
        const forms = backendData.forms || {};
        const completedSet = new Set(
          backendData.application?.completedForms || []
        );

        console.log("📋 All Forms Data:", forms);
        console.log("📋 Available Form Keys in DB:", Object.keys(forms));
        console.log("📋 Completed Forms Array:", Array.from(completedSet));

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

          if (form) {
            const isCompleted =
              form?.status === "submitted" ||
              form?.status === "completed" ||
              form?.status === "under_review" ||
              form?.status === "approved";

            console.log(
              `✅ ${key}: status='${form?.status}' - ${
                isCompleted ? "COMPLETED ✓" : "NOT COMPLETED ✗"
              }`
            );
            return isCompleted;
          }

          if (completedSet.has(key)) {
            console.log(
              `ℹ️ ${key}: not in forms but in completedForms array — COMPLETED ✓`
            );
            return true;
          }

          console.log(`❌ ${key}: NOT FOUND`);
          return false;
        }).length;

        const totalForms = formKeys.length;
        const percentage = Math.round((completedForms / totalForms) * 100);

        console.log(
          `📊 Completed: ${completedForms}/${totalForms} (${percentage}%)`
        );

        setCompletedFormsCount(completedForms);
        setOverallProgress(percentage);
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

      // Fetch progress data
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

      if (
        response.data &&
        response.data.data &&
        response.data.data.application
      ) {
        setApplicationId(response.data.data.application._id);

        // Load existing personal information data if it exists
        if (response.data.data.forms.personalInformation) {
          const data = response.data.data.forms.personalInformation;

          setFormData({
            ...data,
            date: formatDateForInput(data.date),
            dateAvailable: formatDateForInput(data.dateAvailable),
            hrFeedback: data.hrFeedback,
            // Ensure country has a default value if empty
            country: data.country || "United States",
          });

          // Load cascading data if country/state exist
          if (data.country) {
            fetchStates(data.country).then(() => {
              if (data.state) {
                fetchCities(data.country, data.state);
              }
            });
          }
        }
      } else {
        console.error("Invalid response structure:", response.data);
        toast.error("Failed to initialize form - invalid response");
      }
    } catch (error) {
      console.error("Error initializing form:", error);
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

    // Handle cascading dropdowns
    if (field === "country") {
      // Reset state and city when country changes
      setFormData((prev) => ({
        ...prev,
        state: "",
        city: "",
      }));
      setStates([]);
      setCities([]);
      if (value) {
        fetchStates(value);
      }
    } else if (field === "state") {
      // Reset city when state changes
      setFormData((prev) => ({
        ...prev,
        city: "",
      }));
      setCities([]);
      if (value && formData.country) {
        fetchCities(formData.country, value);
      }
    } else if (field === "governmentIdType") {
      // Reset government ID fields when type changes
      setFormData((prev) => ({
        ...prev,
        governmentIdState: "",
        governmentIdCountry: "",
        governmentIdNumber: "",
      }));
    }
  };

  const saveForm = async (status = "draft") => {
    if (!applicationId) {
      toast.error("Application ID not found");
      return;
    }

    // If saving as draft, check if form is actually complete and upgrade status
    if (status === "draft") {
      const isComplete =
        formData.firstName &&
        formData.lastName &&
        formData.streetAddress &&
        formData.city &&
        formData.state &&
        formData.zipCode &&
        formData.country &&
        formData.phone &&
        formData.email &&
        formData.socialSecurityNo &&
        formData.positionAppliedFor &&
        formData.governmentIdType &&
        formData.governmentIdNumber &&
        (formData.governmentIdType === "Driver's License" ||
        formData.governmentIdType === "State ID"
          ? formData.governmentIdState
          : true) &&
        (formData.governmentIdType === "Passport"
          ? formData.governmentIdCountry
          : true) &&
        formData.isUSCitizen &&
        (formData.isUSCitizen === "YES" || formData.isAuthorizedToWork) &&
        (formData.isUSCitizen === "YES" ||
          formData.isAuthorizedToWork === "NO" ||
          (formData.isAuthorizedToWork === "YES" &&
            formData.authorizedToWorkExplanation)) &&
        formData.hasWorkedHereBefore &&
        (formData.hasWorkedHereBefore !== "YES" || formData.previousWorkDate) &&
        formData.hasBeenConvictedOfFelony &&
        (formData.hasBeenConvictedOfFelony !== "YES" ||
          formData.felonyExplanation);

      if (isComplete) {
        status = "completed";
      }
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

      // Remove status from formData if it exists to avoid conflicts
      const { status: formDataStatus, ...cleanFormData } = formData;

      // Clean up conditional fields based on form logic
      // If US citizen, clear the authorized to work fields
      if (cleanFormData.isUSCitizen === "YES") {
        cleanFormData.isAuthorizedToWork = "";
        cleanFormData.authorizedToWorkExplanation = "";
      }

      // If never worked here before, clear the previous work date
      if (cleanFormData.hasWorkedHereBefore === "NO") {
        cleanFormData.previousWorkDate = "";
      }

      // If no felony, clear the felony explanation
      if (cleanFormData.hasBeenConvictedOfFelony === "NO") {
        cleanFormData.felonyExplanation = "";
      }

      const response = await axios.post(
        `${baseURL}/onboarding/save-personal-information`,
        {
          applicationId,
          employeeId: user._id,
          formData: cleanFormData,
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
            ? "Personal information saved as draft"
            : "Personal information completed successfully!";

        toast.success(message);
        await fetchProgressData(user._id);

        // Dispatch event to refresh sidebar status
        window.dispatchEvent(new Event("formStatusUpdated"));
      }
    } catch (error) {
      console.error("❌ Error saving form:", error);
      toast.error(error.response?.data?.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const getMissingFields = () => {
    const missing = [];

    if (!formData.firstName) missing.push("First Name");
    if (!formData.lastName) missing.push("Last Name");
    if (!formData.streetAddress) missing.push("Street Address");
    if (!formData.city) missing.push("City");
    if (!formData.state) missing.push("State");
    if (!formData.zipCode) missing.push("ZIP Code");
    if (!formData.country) missing.push("Country");
    if (!formData.phone) missing.push("Phone");
    if (!formData.email) missing.push("Email");
    if (!formData.socialSecurityNo) missing.push("Social Security No.");
    if (!formData.positionAppliedFor) missing.push("Position Applied For");
    if (!formData.governmentIdType) missing.push("ID Type");
    if (!formData.governmentIdNumber) missing.push("Document Number");
    if (
      (formData.governmentIdType === "Driver's License" ||
        formData.governmentIdType === "State ID") &&
      !formData.governmentIdState
    )
      missing.push("ID State");
    if (
      formData.governmentIdType === "Passport" &&
      !formData.governmentIdCountry
    )
      missing.push("ID Country");
    if (!formData.isUSCitizen)
      missing.push("Are you a citizen of the United States?");
    if (formData.isUSCitizen === "NO" && !formData.isAuthorizedToWork)
      missing.push("Are you authorized to work in the U.S.?");
    if (
      formData.isUSCitizen === "NO" &&
      formData.isAuthorizedToWork === "YES" &&
      !formData.authorizedToWorkExplanation
    )
      missing.push("Work Authorization Details");
    if (!formData.hasWorkedHereBefore)
      missing.push("Have you ever worked for this company?");
    if (formData.hasWorkedHereBefore === "YES" && !formData.previousWorkDate)
      missing.push("Previous Work Date");
    if (!formData.hasBeenConvictedOfFelony)
      missing.push("Have you ever been convicted of a felony?");
    if (
      formData.hasBeenConvictedOfFelony === "YES" &&
      !formData.felonyExplanation
    )
      missing.push("Felony Explanation");

    return missing;
  };

  const handleSubmit = async () => {
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
    const isComplete =
      formData.firstName &&
      formData.lastName &&
      formData.streetAddress &&
      formData.city &&
      formData.state &&
      formData.zipCode &&
      formData.country &&
      formData.phone &&
      formData.email &&
      formData.socialSecurityNo &&
      formData.positionAppliedFor &&
      formData.governmentIdType &&
      formData.governmentIdNumber &&
      (formData.governmentIdType === "Driver's License" ||
      formData.governmentIdType === "State ID"
        ? formData.governmentIdState
        : true) &&
      (formData.governmentIdType === "Passport"
        ? formData.governmentIdCountry
        : true) &&
      formData.isUSCitizen &&
      (formData.isUSCitizen === "YES" || formData.isAuthorizedToWork) &&
      (formData.isUSCitizen === "YES" ||
        formData.isAuthorizedToWork === "NO" ||
        (formData.isAuthorizedToWork === "YES" &&
          formData.authorizedToWorkExplanation)) &&
      formData.hasWorkedHereBefore &&
      (formData.hasWorkedHereBefore !== "YES" || formData.previousWorkDate) &&
      formData.hasBeenConvictedOfFelony &&
      (formData.hasBeenConvictedOfFelony !== "YES" ||
        formData.felonyExplanation);

    const status = isComplete ? "completed" : "draft";
    await saveForm(status);
    // Wait a bit for backend to save before triggering refresh
    setTimeout(() => {
      window.dispatchEvent(new Event("formStatusUpdated"));
      const nextPath = getNextFormPath("/employee/personal-information");
      navigate(nextPath);
    }, 500);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RotateCcw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">
              Loading personal information form...
            </p>
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

                {saving && (
                  <div className="mt-4">
                    <RotateCcw className="w-4 lg:w-5 h-4 lg:h-5 text-blue-600 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Main Form Content */}
            <div className="flex-1 max-h-screen md:max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
              {/* Back Button */}
              <div className="mb-4 md:mb-6">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center px-3 md:px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base font-medium w-20 md:w-24"
                >
                  <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                  Back
                </button>
              </div>

              {/* HR Feedback Section */}
              <HRFeedback
                hrFeedback={formData.hrFeedback}
                formStatus={formData.status}
              />

              {/* Main Form Container */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Status Banner */}
                {!loading && (
                  <div
                    className={`m-6 p-4 rounded-lg border ${
                      formData.status === "completed" ||
                      formData.status === "submitted" ||
                      formData.status === "under_review" ||
                      formData.status === "approved"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {formData.status === "completed" ||
                      formData.status === "submitted" ||
                      formData.status === "approved" ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : formData.status === "under_review" ? (
                        <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      ) : (
                        <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        {formData.status === "completed" ||
                        formData.status === "submitted" ? (
                          <p className="text-base font-semibold text-green-800">
                            ✅ Progress Updated - Form Completed Successfully
                          </p>
                        ) : formData.status === "approved" ? (
                          <p className="text-base font-semibold text-green-800">
                            ✅ Form Approved
                          </p>
                        ) : formData.status === "under_review" ? (
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
                <form onSubmit={handleSubmit}>
                  {/* Header Section */}
                  <div className="bg-[#1F3A93] text-white p-4 md:p-6">
                    <div className="text-center">
                      <div className="flex flex-col sm:flex-row items-center justify-center mb-2">
                        <User className="w-6 h-6 md:w-8 md:h-8 mb-2 sm:mb-0 sm:mr-3" />
                        <div>
                          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                            Applicant Information
                          </h1>
                          <p className="text-blue-100 text-sm md:text-base"></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="p-4 md:p-6 lg:p-8">
                    {/* Full Name Section */}
                    <div className="mb-6 md:mb-8">
                      <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
                        Full Name
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <FormInput
                          label="Last Name"
                          value={formData.lastName}
                          onChange={(value) =>
                            handleInputChange("lastName", value)
                          }
                          required
                        />
                        <FormInput
                          label="First Name"
                          value={formData.firstName}
                          onChange={(value) =>
                            handleInputChange("firstName", value)
                          }
                          required
                        />
                        <FormInput
                          label="Middle Initial"
                          value={formData.middleInitial}
                          onChange={(value) =>
                            handleInputChange("middleInitial", value)
                          }
                        />
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="mb-6 md:mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <FormInput
                          label="Date of Birth"
                          value={formData.date}
                          onChange={(value) => handleInputChange("date", value)}
                          type="date"
                        />
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="mb-6 md:mb-8">
                      <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
                        Address
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <FormSelect
                          label="Country"
                          value={formData.country}
                          onChange={(value) =>
                            handleInputChange("country", value)
                          }
                          options={countries}
                          required
                        />
                        <FormSelect
                          label="State"
                          value={formData.state}
                          onChange={(value) =>
                            handleInputChange("state", value)
                          }
                          options={states}
                          required
                          disabled={loadingStates || states.length === 0}
                        />
                        <FormSelect
                          label="City"
                          value={formData.city}
                          onChange={(value) => handleInputChange("city", value)}
                          options={cities}
                          required
                          disabled={loadingCities || cities.length === 0}
                        />
                        <FormInput
                          label="Street Address"
                          value={formData.streetAddress}
                          onChange={(value) =>
                            handleInputChange("streetAddress", value)
                          }
                          required
                          className="md:col-span-2"
                        />
                        <FormInput
                          label="Apartment/Unit #"
                          value={formData.apartment}
                          onChange={(value) =>
                            handleInputChange("apartment", value)
                          }
                        />
                        <FormInput
                          label="ZIP Code"
                          value={formData.zipCode}
                          onChange={(value) =>
                            handleInputChange("zipCode", value)
                          }
                          required
                        />
                      </div>
                    </div>

                    {/* Contact Details Section */}
                    <div className="mb-6 md:mb-8">
                      <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
                        Contact Information
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <FormInput
                          label="Phone"
                          value={formData.phone}
                          onChange={(value) =>
                            handleInputChange("phone", formatPhone(value))
                          }
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                        <FormInput
                          label="Email"
                          value={formData.email}
                          onChange={(value) =>
                            handleInputChange("email", value)
                          }
                          type="email"
                          required
                        />
                      </div>
                    </div>

                    {/* Employment Details Section */}
                    <div className="mb-6 md:mb-8">
                      <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
                        Employment Details
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <FormInput
                          label="Date Available"
                          value={formData.dateAvailable}
                          onChange={(value) =>
                            handleInputChange("dateAvailable", value)
                          }
                          type="date"
                        />
                        <FormInput
                          label="Social Security No."
                          value={
                            ssnFocused
                              ? formData.socialSecurityNo
                              : maskSSN(formData.socialSecurityNo)
                          }
                          onChange={(value) =>
                            handleInputChange(
                              "socialSecurityNo",
                              formatSSN(value)
                            )
                          }
                          onFocus={() => setSsnFocused(true)}
                          onBlur={() => setSsnFocused(false)}
                          placeholder="000-00-0000"
                          required
                        />
                        <div className="md:col-span-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="mb-4">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Desired Salary Amount
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                                  $
                                </span>
                                <input
                                  type="text"
                                  value={formData.desiredSalary}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "desiredSalary",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter amount"
                                  className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
                                />
                              </div>
                            </div>
                            <FormSelect
                              label="Salary Type"
                              value={formData.desiredSalaryType}
                              onChange={(value) =>
                                handleInputChange("desiredSalaryType", value)
                              }
                              options={[
                                { value: "hourly", label: "Hourly" },
                                { value: "weekly", label: "Weekly" },
                                { value: "biweekly", label: "Bi-Weekly" },
                                { value: "monthly", label: "Monthly" },
                                { value: "yearly", label: "Yearly" },
                              ]}
                            />
                          </div>
                        </div>
                        <FormInput
                          label="Position Applied For"
                          value={formData.positionAppliedFor}
                          onChange={(value) =>
                            handleInputChange("positionAppliedFor", value)
                          }
                          required
                        />
                      </div>
                    </div>

                    {/* Government ID Section */}
                    <div className="mb-6 md:mb-8">
                      <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
                        Government ID
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <FormSelect
                          label="ID Type"
                          value={formData.governmentIdType}
                          onChange={(value) =>
                            handleInputChange("governmentIdType", value)
                          }
                          options={[
                            {
                              value: "Driver's License",
                              label: "Driver's License",
                            },
                            { value: "State ID", label: "State ID" },
                            { value: "Passport", label: "Passport" },
                          ]}
                          required
                        />
                        <FormInput
                          label="Document Number"
                          value={formData.governmentIdNumber}
                          onChange={(value) =>
                            handleInputChange(
                              "governmentIdNumber",
                              formatGovernmentId(
                                value,
                                formData.governmentIdType
                              )
                            )
                          }
                          placeholder="Enter document number"
                          required
                        />
                        {(formData.governmentIdType === "Driver's License" ||
                          formData.governmentIdType === "State ID") && (
                          <FormSelect
                            label="State"
                            value={formData.governmentIdState}
                            onChange={(value) =>
                              handleInputChange("governmentIdState", value)
                            }
                            options={states}
                            required
                            disabled={loadingStates || states.length === 0}
                          />
                        )}
                        {formData.governmentIdType === "Passport" && (
                          <FormSelect
                            label="Country"
                            value={formData.governmentIdCountry}
                            onChange={(value) =>
                              handleInputChange("governmentIdCountry", value)
                            }
                            options={countries}
                            required
                          />
                        )}
                      </div>
                    </div>

                    {/* Authorization Questions Section */}
                    <div className="mb-6 md:mb-8">
                      <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
                        Authorization & Background
                      </h2>

                      <div className="space-y-6">
                        {/* US Citizen Question */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Are you a citizen of the United States?{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-6">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="isUSCitizen"
                                value="YES"
                                checked={formData.isUSCitizen === "YES"}
                                onChange={(e) =>
                                  handleInputChange(
                                    "isUSCitizen",
                                    e.target.value
                                  )
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                required
                              />
                              <span className="ml-2 text-gray-700">YES</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="isUSCitizen"
                                value="NO"
                                checked={formData.isUSCitizen === "NO"}
                                onChange={(e) =>
                                  handleInputChange(
                                    "isUSCitizen",
                                    e.target.value
                                  )
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                required
                              />
                              <span className="ml-2 text-gray-700">NO</span>
                            </label>
                          </div>
                        </div>

                        {/* Authorized to Work Question - Only show if NOT a US Citizen */}
                        {formData.isUSCitizen === "NO" && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Are you authorized to work in the U.S.?{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-6">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="isAuthorizedToWork"
                                  value="YES"
                                  checked={
                                    formData.isAuthorizedToWork === "YES"
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      "isAuthorizedToWork",
                                      e.target.value
                                    )
                                  }
                                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  required
                                />
                                <span className="ml-2 text-gray-700">YES</span>
                              </label>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="isAuthorizedToWork"
                                  value="NO"
                                  checked={formData.isAuthorizedToWork === "NO"}
                                  onChange={(e) => {
                                    handleInputChange(
                                      "isAuthorizedToWork",
                                      e.target.value
                                    );
                                    handleInputChange(
                                      "authorizedToWorkExplanation",
                                      ""
                                    );
                                  }}
                                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  required
                                />
                                <span className="ml-2 text-gray-700">NO</span>
                              </label>
                            </div>
                            {formData.isAuthorizedToWork === "YES" && (
                              <div className="mt-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Please provide details about your work
                                  authorization:{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                  value={formData.authorizedToWorkExplanation}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "authorizedToWorkExplanation",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 min-h-[100px]"
                                  placeholder="Please provide details about your work authorization (e.g., visa type, expiration date, etc.)"
                                  required
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Worked Here Before Question */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Have you ever worked for this company?{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-6">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="hasWorkedHereBefore"
                                value="YES"
                                checked={formData.hasWorkedHereBefore === "YES"}
                                onChange={(e) =>
                                  handleInputChange(
                                    "hasWorkedHereBefore",
                                    e.target.value
                                  )
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                required
                              />
                              <span className="ml-2 text-gray-700">YES</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="hasWorkedHereBefore"
                                value="NO"
                                checked={formData.hasWorkedHereBefore === "NO"}
                                onChange={(e) => {
                                  handleInputChange(
                                    "hasWorkedHereBefore",
                                    e.target.value
                                  );
                                  handleInputChange("previousWorkDate", "");
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                required
                              />
                              <span className="ml-2 text-gray-700">NO</span>
                            </label>
                          </div>
                          {formData.hasWorkedHereBefore === "YES" && (
                            <div className="mt-4">
                              <FormInput
                                label="If yes, when?"
                                value={formData.previousWorkDate}
                                onChange={(value) =>
                                  handleInputChange("previousWorkDate", value)
                                }
                                placeholder="e.g., January 2020 - March 2021"
                                required
                              />
                            </div>
                          )}
                        </div>

                        {/* Convicted of Felony Question */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Have you ever been convicted of a felony?{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-6">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="hasBeenConvictedOfFelony"
                                value="YES"
                                checked={
                                  formData.hasBeenConvictedOfFelony === "YES"
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "hasBeenConvictedOfFelony",
                                    e.target.value
                                  )
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                required
                              />
                              <span className="ml-2 text-gray-700">YES</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="hasBeenConvictedOfFelony"
                                value="NO"
                                checked={
                                  formData.hasBeenConvictedOfFelony === "NO"
                                }
                                onChange={(e) => {
                                  handleInputChange(
                                    "hasBeenConvictedOfFelony",
                                    e.target.value
                                  );
                                  handleInputChange("felonyExplanation", "");
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                required
                              />
                              <span className="ml-2 text-gray-700">NO</span>
                            </label>
                          </div>
                          {formData.hasBeenConvictedOfFelony === "YES" && (
                            <div className="mt-4">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                If yes, explain:{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={formData.felonyExplanation}
                                onChange={(e) =>
                                  handleInputChange(
                                    "felonyExplanation",
                                    e.target.value
                                  )
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 min-h-[100px]"
                                placeholder="Please provide details..."
                                required
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar in Form Footer */}
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
                        📝 Current: Personal Information
                      </div>
                    </div>
                  </div>

                  {/* Submit Button Section */}
                  <div className="bg-[#F8FAFF] px-4 md:px-8 lg:px-12 py-6 md:py-8 mt-4 md:mt-6 border border-[#E8EDFF]">
                    <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-3 md:gap-4">
                      {/* Left: Save Draft */}
                      <div className="w-full lg:w-auto order-3 lg:order-1">
                        {/* <button
                          type="button"
                          onClick={() => saveForm("draft")}
                          disabled={saving}
                          className="inline-flex items-center justify-center gap-2 w-full max-w-xs py-2.5 md:py-3 px-4 md:px-6 lg:px-8 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm md:text-base disabled:opacity-50"
                        >
                          <Save className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          <span className="text-sm md:text-base">
                            Save Draft
                          </span> */}
                        {/* </button> */}
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
                            formData.hrFeedback &&
                            Object.keys(formData.hrFeedback).length > 0 &&
                            (formData.hrFeedback.comment ||
                              formData.hrFeedback.notes ||
                              formData.hrFeedback.feedback ||
                              formData.hrFeedback.note ||
                              formData.hrFeedback.companyRepSignature ||
                              formData.hrFeedback
                                .companyRepresentativeSignature ||
                              formData.hrFeedback.notarySignature ||
                              formData.hrFeedback.agencySignature ||
                              formData.hrFeedback.clientSignature ||
                              Object.keys(formData.hrFeedback).some(
                                (key) =>
                                  formData.hrFeedback[key] &&
                                  typeof formData.hrFeedback[key] ===
                                    "string" &&
                                  formData.hrFeedback[key].trim().length > 0
                              ));

                          // Check if form is submitted (and no HR notes)
                          const isSubmitted =
                            formData.status === "submitted" && !hasHrNotes;

                          return (
                            <button
                              type="button"
                              onClick={handleSubmit}
                              disabled={saving || isSubmitted}
                              className={`inline-flex items-center justify-center gap-2 md:gap-3 w-full max-w-xs py-2.5 md:py-3 px-3 md:px-5 font-bold tracking-wide rounded-lg focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm md:text-base ${
                                saving || isSubmitted
                                  ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                                  : "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white hover:from-[#16306e] hover:to-[#1F3A93] active:from-[#112451] active:to-[#16306e]"
                              }`}
                              title={
                                isSubmitted
                                  ? "Form is submitted. HR notes are required to make changes."
                                  : "Save and proceed to next form"
                              }
                            >
                              {saving ? (
                                <RotateCcw className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-1 md:mr-2" />
                              ) : (
                                <Send className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                              )}
                              <span>
                                {saving
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
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default PersonalInformation;
