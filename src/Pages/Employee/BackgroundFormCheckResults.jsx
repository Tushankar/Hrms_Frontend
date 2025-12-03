import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Target,
  Send,
  Calendar,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";
import axios from "axios";
import Cookies from "js-cookie";

const GemaltoRegistrationForm = ({ onFormDataChange, initialData }) => {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleInitial: "",
    ssn: "",
    height: "",
    weight: "",
    eyeColor: "",
    hairColor: "",
    dob: "",
    sex: "",
    race: "",
    streetAddress: "",
    city: "",
    state: "",
    zip: "",
    provider: "",
    position: "",
    signature: "",
    date: "",
    providerName: "",
    applicantName: "",
    directContact: "",
    contactPhone: "",
    emailAddress: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData);
    } else {
      // Set default date to today if not provided
      const today = new Date();
      const todayDate = today.toISOString().slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        date: todayDate,
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Notify parent component of form data changes
    if (onFormDataChange) {
      onFormDataChange(updatedFormData);
    }
  };

  const handleSSNChange = (digitIndex, value) => {
    const currentDigits = formData.ssn || "";
    const digitsArray = currentDigits.padEnd(9, " ").split("");
    digitsArray[digitIndex] = value.replace(/\D/g, "") || " ";
    const newDigits = digitsArray.join("").trim();
    const updatedFormData = {
      ...formData,
      ssn: newDigits,
    };
    setFormData(updatedFormData);

    // Auto-focus next input
    if (value && digitIndex < 8) {
      const nextInput = document.querySelector(
        `input[name="ssn-${digitIndex + 1}"]`
      );
      if (nextInput) nextInput.focus();
    }

    // Notify parent component
    if (onFormDataChange) {
      onFormDataChange(updatedFormData);
    }
  };

  const handleSSNKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      const prevInput = document.querySelector(
        `input[name="ssn-${index - 1}"]`
      );
      if (prevInput) prevInput.focus();
    }
  };

  const LogoHeader = () => (
    <div className="flex flex-col sm:flex-row items-start mb-4">
      <div
        className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-3 sm:mb-0 sm:mr-4 flex-shrink-0 relative"
        style={{ backgroundColor: "#1D1A53" }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 128 128"
          className="absolute inset-0 sm:w-24 sm:h-24"
        >
          <g transform="translate(64, 45)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x2 = Math.cos(rad) * 25;
              const y2 = Math.sin(rad) * 25;
              return (
                <line
                  key={i}
                  x1="0"
                  y1="0"
                  x2={x2}
                  y2={y2}
                  stroke="#FDB714"
                  strokeWidth="2.5"
                />
              );
            })}
            <circle cx="0" cy="0" r="3" fill="#FDB714" />
          </g>
        </svg>
        <div className="text-white font-bold text-base sm:text-lg mt-10 sm:mt-12 relative z-10">
          DBHDD
        </div>
      </div>
      <div className="flex-1">
        <h1 className="text-sm sm:text-xl font-bold text-center sm:text-right mb-1">
          Georgia Department of Behavioral Health & Developmental Disabilities
        </h1>
        <p className="text-xs sm:text-sm text-center sm:text-right italic mb-3">
          Judy Fitzgerald, Commissioner
        </p>
        <div className="border-t-2 border-black pt-2">
          <h2 className="text-center text-sm sm:text-base font-bold">
            Office of Enterprise Compliance
          </h2>
          <p className="text-[10px] sm:text-xs text-center">
            Two Peachtree Street, NW • 2nd Floor • Atlanta, Georgia 30303-3142 •
            Telephone: 404-463-2507 • Fax: 770-339-5473
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-200 p-2">
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
        rel="stylesheet"
      />
      {/* PAGE 1 - Registration Form */}
      <div className="w-full max-w-[700px] min-h-[900px] mx-auto p-3 sm:p-6 bg-white shadow-lg mb-4">
        <LogoHeader />

        <h2 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6">
          Gemalto Applicant Registration Form
        </h2>

        <div className="space-y-3">
          {/* Name Row */}
          <div className="grid grid-cols-12 gap-2 sm:gap-4">
            <div className="col-span-12 sm:col-span-5">
              <label className="block text-xs mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
            <div className="col-span-12 sm:col-span-5">
              <label className="block text-xs mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
            <div className="col-span-12 sm:col-span-2">
              <label className="block text-xs mb-1">Middle Initial</label>
              <input
                type="text"
                name="middleInitial"
                value={formData.middleInitial}
                onChange={handleChange}
                maxLength={1}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
          </div>

          {/* Physical Details Row */}
          <div className="grid grid-cols-12 gap-2 sm:gap-4">
            <div className="col-span-12 sm:col-span-4">
              <label className="block text-xs mb-1">Social Security No.</label>
              <div className="flex gap-[1px] justify-start items-center">
                {[...Array(9)].map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    name={`ssn-${i}`}
                    maxLength="1"
                    value={(formData.ssn || "")[i] || ""}
                    onChange={(e) => handleSSNChange(i, e.target.value)}
                    onKeyDown={(e) => handleSSNKeyDown(e, i)}
                    className="w-5 h-6 text-center border border-black px-0 py-0 outline-none bg-white text-[12px] font-bold text-black flex-shrink-0"
                  />
                ))}
              </div>
            </div>
            <div className="col-span-6 sm:col-span-2">
              <label className="block text-xs mb-1">Height</label>
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
            <div className="col-span-6 sm:col-span-2">
              <label className="block text-xs mb-1">Weight</label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
            <div className="col-span-6 sm:col-span-2">
              <label className="block text-xs mb-1">Eye color</label>
              <input
                type="text"
                name="eyeColor"
                value={formData.eyeColor}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
            <div className="col-span-6 sm:col-span-2">
              <label className="block text-xs mb-1">Hair Color</label>
              <input
                type="text"
                name="hairColor"
                value={formData.hairColor}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
          </div>

          {/* DOB, Sex, Race Row */}
          <div className="grid grid-cols-12 gap-2 sm:gap-4">
            <div className="col-span-12 sm:col-span-4">
              <label className="block text-xs mb-1">Date of Birth</label>
              <input
                type="text"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label className="block text-xs mb-1">Sex</label>
              <input
                type="text"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
            <div className="col-span-6 sm:col-span-5">
              <label className="block text-xs mb-1">Race</label>
              <input
                type="text"
                name="race"
                value={formData.race}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
          </div>

          {/* Address Row */}
          <div className="grid grid-cols-12 gap-2 sm:gap-4">
            <div className="col-span-12 sm:col-span-5">
              <label className="block text-xs mb-1">Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
            <div className="col-span-12 sm:col-span-3">
              <label className="block text-xs mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
            <div className="col-span-6 sm:col-span-2">
              <label className="block text-xs mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
            <div className="col-span-6 sm:col-span-2">
              <label className="block text-xs mb-1">Zip</label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
          </div>

          {/* Provider and Position Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div>
              <label className="block text-xs mb-1">Provider</label>
              <input
                type="text"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Position Applied For</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
          </div>

          {/* Consent Text */}
          <div className="text-[10px] sm:text-xs leading-relaxed my-4">
            <p className="text-justify">
              I am aware that a fingerprint-based background check is required
              for employment with a DBHDD network provider under Policy 04-104.
              I have read and accepted the terms of the Applicant Privacy Rights
              and Privacy Act Statement. I understand that DBHDD Criminal
              History Background Section (CHBC) must approve all applicant
              registrations prior to a fingerprint submission. I also understand
              that registrations will be approved or rejected based upon
              information submitted. In either case, I will receive an email
              from Gemalto explaining the status of my request. I understand
              that incomplete forms or inaccurate information will delay
              approval process.
            </p>
          </div>

          {/* Signature and Date */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div>
              <label className="block text-xs mb-1">Signature</label>
              <input
                type="text"
                name="signature"
                value={formData.signature}
                onChange={handleChange}
                placeholder="Sign here"
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  fontSize: "28px",
                  letterSpacing: "0.5px",
                }}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] sm:text-xs mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
            <p>
              2 Peachtree Street, NW • Atlanta, Georgia 30303 • 404.657.2252
            </p>
            <p>dbhdd.georgia.gov • Facebook: Georgia DBHDD • Twitter: @DBHDD</p>
          </div>
        </div>
      </div>

      {/* PAGE 2 - Notification Form */}
      <div className="w-full max-w-[700px] min-h-[900px] mx-auto p-3 sm:p-6 bg-white shadow-lg">
        <LogoHeader />

        <div className="space-y-3 sm:space-y-4">
          {/* TO/FROM/RE Section */}
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex">
              <div className="font-bold w-16 sm:w-24">TO:</div>
              <div>DBHDD Provider Network</div>
            </div>
            <div className="flex">
              <div className="font-bold w-16 sm:w-24">FROM:</div>
              <div>
                <div>DBHDD Office of Enterprise Compliance</div>
                <div>Criminal History Background Checks Section</div>
              </div>
            </div>
            <div className="flex">
              <div className="font-bold w-16 sm:w-24">RE:</div>
              <div>Gemalto Applicant Registration Notification</div>
            </div>
          </div>

          {/* Notification Text */}
          <div className="text-xs sm:text-sm">
            <p>
              Please send notification forms to CHBC by facsimile to (404),
              656-0008 or via email at{" "}
              <span className="text-blue-600 underline font-bold">
                DBHDD.REG@DBHDD.GA.GOV
              </span>{" "}
              with this Cover Sheet after completing the information required
              below:
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 mt-4 sm:mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <label className="font-bold text-xs sm:text-sm sm:w-64">
                Provider Name
              </label>
              <input
                type="text"
                name="providerName"
                value={formData.providerName}
                onChange={handleChange}
                className="flex-1 border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <label className="font-bold text-xs sm:text-sm sm:w-64">
                Applicant Name
              </label>
              <input
                type="text"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleChange}
                className="flex-1 border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <label className="font-bold text-xs sm:text-sm sm:w-64">
                Name of Direct Contact
              </label>
              <input
                type="text"
                name="directContact"
                value={formData.directContact}
                onChange={handleChange}
                className="flex-1 border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <label className="font-bold text-xs sm:text-sm sm:w-64">
                Contact Phone Number
              </label>
              <input
                type="text"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="flex-1 border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <label className="font-bold text-xs sm:text-sm sm:w-64">
                Email address
              </label>
              <input
                type="text"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                className="flex-1 border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1"
              />
            </div>
          </div>

          {/* Mandatory Notice */}
          <div className="text-center text-xs sm:text-sm font-bold mt-4 sm:mt-6">
            ***The Notification Form and Cover Letter are Mandatory for
            Processing***
          </div>

          {/* Contact Information */}
          <div className="text-xs sm:text-sm mt-3 sm:mt-4">
            <p>
              If you have questions, please contact our office at 404-232-1541,
              404-463-2507 or 404-232-1641.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] sm:text-xs mt-6 sm:mt-8 pt-3 sm:pt-4 border-t">
            <p className="font-bold">
              Georgia Department of Behavioral Health & Developmental
              Disabilities
            </p>
            <p>
              2 Peachtree Street, NW • Atlanta, Georgia 30303 • 404.657.2252
              dbhdd.georgia.gov • Facebook: GeorgiaDBHDD • Twitter: @DBHDD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FORM_KEYS = [
  "employmentType",
  "personalInformation",
  "professionalExperience",
  "workExperience",
  "education",
  "references",
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

const shouldCountForm = (key, employmentType) => {
  if (key === "w4Form") return employmentType === "W-2";
  if (key === "w9Form") return employmentType === "1099";
  return true;
};

const flattenBackgroundData = (data) => {
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US"); // MM/DD/YYYY
  };

  return {
    lastName: data.applicantInfo?.lastName || "",
    firstName: data.applicantInfo?.firstName || "",
    middleInitial: data.applicantInfo?.middleInitial || "",
    ssn: data.applicantInfo?.socialSecurityNumber || "",
    height: data.applicantInfo?.height || "",
    weight: data.applicantInfo?.weight || "",
    eyeColor: data.applicantInfo?.eyeColor || "",
    hairColor: data.applicantInfo?.hairColor || "",
    dob: formatDate(data.applicantInfo?.dateOfBirth),
    sex: data.applicantInfo?.sex || "",
    race: data.applicantInfo?.race || "",
    streetAddress: data.applicantInfo?.address?.street || "",
    city: data.applicantInfo?.address?.city || "",
    state: data.applicantInfo?.address?.state || "",
    zip: data.applicantInfo?.address?.zipCode || "",
    provider: data.employmentInfo?.provider || "",
    position: data.employmentInfo?.positionAppliedFor || "",
    signature: data.applicantSignature || "",
    date: formatDate(data.applicantSignatureDate),
    providerName: data.notification?.providerName || "",
    applicantName: data.notification?.applicantName || "",
    directContact: data.notification?.directContactName || "",
    contactPhone: data.notification?.contactPhone || "",
    emailAddress: data.notification?.contactEmail || "",
  };
};

const BackgroundFormCheckResults = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applicationId, setApplicationId] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [totalForms, setTotalForms] = useState(20);
  const [employeeId, setEmployeeId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState("draft");
  const [formStatus, setFormStatus] = useState("draft");
  const [backgroundFormData, setBackgroundFormData] = useState({});
  const [hrFeedback, setHrFeedback] = useState(null);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    initializeForm();
  }, []);

  const initializeForm = async () => {
    try {
      const userCookie = Cookies.get("user");
      let user;

      try {
        user = userCookie ? JSON.parse(userCookie) : null;
      } catch (e) {
        console.error("Error parsing user cookie:", e);
        user = null;
      }

      if (!user || !user._id) {
        console.error("No user found in cookies");
        toast.error("User session not found. Please log in again.");
        navigate("/login");
        return;
      }

      setEmployeeId(user._id);

      // Get application and fetch progress data
      await fetchProgressData(user._id);

      // Get application ID
      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      if (appResponse.data?.data?.application) {
        setApplicationId(appResponse.data.data.application._id);
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoading(false);
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

        // Calculate progress with filtered forms based on employment type
        const forms = backendData.forms || {};
        const completedSet = new Set(
          backendData.application?.completedForms || []
        );

        const currentEmploymentType =
          backendData.application.employmentType || "";
        const filteredKeys = FORM_KEYS.filter((key) =>
          shouldCountForm(key, currentEmploymentType)
        );

        console.log("📋 All Forms Data:", forms);
        console.log("📋 Available Form Keys in DB:", Object.keys(forms));
        console.log("📋 Completed Forms Array:", Array.from(completedSet));
        console.log("📋 Filtered Keys based on employment type:", filteredKeys);

        const completedForms = filteredKeys.filter((key) => {
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

          // Special case for employmentType
          if (key === "employmentType" && currentEmploymentType) {
            console.log(`ℹ️ ${key}: employment type selected — COMPLETED ✓`);
            return true;
          }

          console.log(`❌ ${key}: NOT FOUND`);
          return false;
        }).length;

        const totalForms = filteredKeys.length;
        const percentage = Math.round((completedForms / totalForms) * 100);

        console.log(
          `📊 Completed: ${completedForms}/${totalForms} (${percentage}%)`
        );

        setCompletedFormsCount(completedForms);
        setTotalForms(totalForms);
        setOverallProgress(percentage);

        // Populate background check data if exists
        if (backendData.forms?.backgroundCheck) {
          console.log(
            "Background check data found:",
            backendData.forms.backgroundCheck
          );
          const flattened = flattenBackgroundData(
            backendData.forms.backgroundCheck
          );
          console.log("Flattened data:", flattened);
          setBackgroundFormData(flattened);
          setFormStatus(backendData.forms.backgroundCheck.status || "draft");

          // Load HR feedback if available
          if (backendData.forms.backgroundCheck.hrFeedback) {
            setHrFeedback(backendData.forms.backgroundCheck.hrFeedback);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const handleFormDataChange = (formData) => {
    setBackgroundFormData(formData);
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate("/employee/task-management")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* HR Feedback Section */}
        <HRFeedback hrFeedback={hrFeedback} formStatus={formStatus} />

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-8">
          {/* Status Banner */}
          {!loading && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                (backgroundFormData &&
                  Object.keys(backgroundFormData).length > 0) ||
                formStatus === "under_review" ||
                formStatus === "approved"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {(backgroundFormData &&
                  Object.keys(backgroundFormData).length > 0) ||
                formStatus === "approved" ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : formStatus === "under_review" ? (
                  <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                ) : (
                  <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  {backgroundFormData &&
                  Object.keys(backgroundFormData).length > 0 ? (
                    <>
                      <p className="text-base font-semibold text-green-800">
                        ✅ Progress Updated - Form Completed Successfully
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        You cannot make any changes to the form until HR
                        provides their feedback.
                      </p>
                    </>
                  ) : formStatus === "approved" ? (
                    <p className="text-base font-semibold text-green-800">
                      ✅ Form Approved
                    </p>
                  ) : formStatus === "under_review" ? (
                    <p className="text-base font-semibold text-blue-800">
                      📋 Form Under Review
                    </p>
                  ) : (
                    <p className="text-base font-semibold text-red-800">
                      ⚠️ Not filled yet - Complete this form to update your
                      progress
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Background Check
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Review the background check registration form below
            </p>
          </div>

          <div className="space-y-6">
            {/* Instructions Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                    📋 Instructions
                  </h3>
                  <ol className="space-y-3 text-sm text-gray-700">
                    <li className="flex gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        1.
                      </span>
                      <span>
                        Fill out the Background Check registration form below
                        with your personal information
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        2.
                      </span>
                      <span>
                        Complete both pages of the form (Registration and
                        Notification)
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        3.
                      </span>
                      <span>
                        Click Save & Next to submit your background check
                        information
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Template Preview Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Step 1: Complete Background Check Form
              </h2>
              <div
                className="w-full bg-white border border-gray-200 rounded-lg overflow-auto max-h-[600px] sm:max-h-[800px] hide-scrollbar"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <GemaltoRegistrationForm
                  onFormDataChange={handleFormDataChange}
                  initialData={backgroundFormData}
                />
              </div>
            </div>

            {/* Progress Section */}
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
                    {completedFormsCount}/{totalForms}
                  </div>
                  <div className="text-xs text-gray-600">Forms Completed</div>
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
                📝 Current: Background Check
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate("/employee/driving-license-upload")}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#2748B4] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-2" />
                  Previous Form
                </button>

                <div className="w-full sm:w-auto flex justify-center">
                  <button
                    type="button"
                    onClick={() => navigate("/employee/task-management")}
                    className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                  >
                    Exit Application
                  </button>
                </div>

                {(() => {
                  // Check if form has HR notes
                  const hasHrNotes =
                    hrFeedback &&
                    Object.keys(hrFeedback).length > 0 &&
                    (hrFeedback.comment ||
                      hrFeedback.notes ||
                      hrFeedback.feedback ||
                      hrFeedback.note ||
                      hrFeedback.companyRepSignature ||
                      hrFeedback.companyRepresentativeSignature ||
                      hrFeedback.notarySignature ||
                      hrFeedback.agencySignature ||
                      hrFeedback.clientSignature ||
                      Object.keys(hrFeedback).some(
                        (key) =>
                          hrFeedback[key] &&
                          typeof hrFeedback[key] === "string" &&
                          hrFeedback[key].trim().length > 0
                      ));

                  // Check if form is submitted (and no HR notes)
                  const isSubmitted = formStatus === "submitted" && !hasHrNotes;

                  return (
                    <button
                      type="button"
                      onClick={async () => {
                        // Validate signature and date
                        const newErrors = {};
                        if (!backgroundFormData.signature) {
                          newErrors.signature = "Signature is required";
                        }
                        if (!backgroundFormData.date) {
                          newErrors.date = "Date is required";
                        }

                        if (Object.keys(newErrors).length > 0) {
                          toast.error(
                            "Please fill in signature and date fields"
                          );
                          return;
                        }

                        setIsSaving(true);
                        try {
                          const userCookie = Cookies.get("user");
                          let user;

                          try {
                            user = userCookie ? JSON.parse(userCookie) : null;
                          } catch (e) {
                            console.error("Error parsing user cookie:", e);
                            user = null;
                          }

                          if (!user || !user._id) {
                            console.error("No user found in cookies");
                            toast.error(
                              "User session not found. Please log in again."
                            );
                            navigate("/login");
                            return;
                          }

                          // Status is submitted (will become completed after HR reviews)
                          const status = "submitted";

                          // Structure form data according to backend expectations
                          const structuredFormData = {
                            applicantInfo: {
                              lastName: backgroundFormData.lastName || "",
                              firstName: backgroundFormData.firstName || "",
                              middleInitial:
                                backgroundFormData.middleInitial || "",
                              socialSecurityNumber:
                                backgroundFormData.ssn || "",
                              dateOfBirth: backgroundFormData.dob
                                ? new Date(backgroundFormData.dob)
                                : null,
                              height: backgroundFormData.height || "",
                              weight: backgroundFormData.weight || "",
                              sex: backgroundFormData.sex || "",
                              eyeColor: backgroundFormData.eyeColor || "",
                              hairColor: backgroundFormData.hairColor || "",
                              race: backgroundFormData.race || "",
                              address: {
                                street: backgroundFormData.streetAddress || "",
                                city: backgroundFormData.city || "",
                                state: backgroundFormData.state || "",
                                zipCode: backgroundFormData.zip || "",
                              },
                            },
                            employmentInfo: {
                              provider: backgroundFormData.provider || "",
                              positionAppliedFor:
                                backgroundFormData.position || "",
                            },
                            consentAcknowledgment: {
                              awareOfFingerprintCheck: true, // Assuming consent since they're filling the form
                              acceptedPrivacyRights: true,
                              understoodApprovalProcess: true,
                            },
                            notification: {
                              providerName:
                                backgroundFormData.providerName || "",
                              applicantName:
                                backgroundFormData.applicantName || "",
                              directContactName:
                                backgroundFormData.directContact || "",
                              contactPhone:
                                backgroundFormData.contactPhone || "",
                              contactEmail:
                                backgroundFormData.emailAddress || "",
                            },
                            applicantSignature:
                              backgroundFormData.signature || "",
                            applicantSignatureDate: backgroundFormData.date
                              ? new Date(backgroundFormData.date)
                              : null,
                          };

                          console.log(
                            "Saving background check with structured data:",
                            structuredFormData
                          );

                          const response = await axios.post(
                            `${baseURL}/onboarding/save-background-check`,
                            {
                              applicationId,
                              employeeId: user._id,
                              formData: structuredFormData,
                              status,
                            },
                            { withCredentials: true }
                          );

                          console.log("Save response:", response.data);

                          if (response.data) {
                            toast.success(
                              "Background Check completed successfully!"
                            );
                            // Refresh progress data
                            await fetchProgressData(user._id);
                            window.dispatchEvent(
                              new Event("formStatusUpdated")
                            );

                            setTimeout(() => {
                              navigate("/employee/misconduct-form");
                            }, 1500);
                          }
                        } catch (error) {
                          console.error(
                            "Error saving background check:",
                            error
                          );
                          toast.error("Failed to save form");
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving || isSubmitted}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 font-bold tracking-wide rounded-lg focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                        isSaving || isSubmitted
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                          : "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white hover:from-[#16306e] hover:to-[#1F3A93] active:from-[#112451] active:to-[#16306e]"
                      }`}
                      title={
                        isSubmitted
                          ? "Form is submitted. HR notes are required to make changes."
                          : "Save and proceed to next form"
                      }
                    >
                      {isSaving ? (
                        <RotateCcw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      <span className="text-sm sm:text-base">
                        {isSaving
                          ? "Saving..."
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
      <Toaster position="top-right" />
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Layout>
  );
};

export default BackgroundFormCheckResults;
