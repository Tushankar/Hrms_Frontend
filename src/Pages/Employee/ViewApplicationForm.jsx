import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import PacificHealthLogo from "../../Components/Common/PacificHealthLogo";
import {
  Calendar,
  Edit3,
  Eye,
  Save,
  RotateCcw,
  ArrowLeft,
  Target,
  CheckCircle2,
  Send,
  Clock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import SignaturePad from "../../Components/Common/SignaturePad";
// import { Edit3, Eye, Save, ArrowLeft } from 'lucide-react';

const ViewApplicationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showToaster, setShowToaster] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState("draft");
  const [overallProgress, setOverallProgress] = useState({
    completed: 1,
    total: 17,
    percentage: 6,
    isComplete: false,
  });

  const baseURL = import.meta.env.VITE__BASEURL;

  // Fetch progress data from task management API
  const fetchProgressData = async (userId, existingData = null) => {
    try {
      let backendData = existingData;

      if (!backendData) {
        const response = await axios.get(
          `${baseURL}/onboarding/get-application/${userId}`,
          { withCredentials: true }
        );
        if (response.data?.data) {
          backendData = response.data.data;
        }
      }

      if (backendData) {
        setApplicationStatus(
          backendData.application?.applicationStatus || "draft"
        );

        // Calculate progress like in task management
        const forms = backendData.forms || {};
        const completedFormsArray =
          backendData.application?.completedForms || [];
        const completedSet = new Set(completedFormsArray);

        const formKeys = [
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

        setOverallProgress({
          completed: completedForms,
          total: totalForms,
          percentage,
          isComplete: completedForms === totalForms,
        });
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  // Check if coming from edit route and initialize backend
  useEffect(() => {
    initializeForm();
  }, [location.pathname, taskId]);

  const initializeForm = async () => {
    try {
      setLoading(true);

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
        // Pass the fetched data to fetchProgressData to avoid a second API call
        await fetchProgressData(user._id, response.data.data);
        
        setApplicationId(response.data.data.application._id);
        console.log("Application ID set:", response.data.data.application._id); // Debug log

        // Load existing employment application data if it exists
        if (response.data.data.forms.employmentApplication) {
          const backendData = response.data.data.forms.employmentApplication;
          console.log("Raw backend data:", backendData); // Debug log

          // Map backend data structure to frontend structure
          const mappedData = {
            // Personal Information - map applicantInfo to root level
            firstName: backendData.applicantInfo?.firstName || "",
            middleName: backendData.applicantInfo?.middleName || "",
            lastName: backendData.applicantInfo?.lastName || "",
            address: backendData.applicantInfo?.address || "",
            city: backendData.applicantInfo?.city || "",
            state: backendData.applicantInfo?.state || "",
            zip: backendData.applicantInfo?.zip || "",
            phone: backendData.applicantInfo?.phone || "",
            email: backendData.applicantInfo?.email || "",
            ssn: backendData.applicantInfo?.ssn || "",
            positionApplied: backendData.applicantInfo?.positionApplied || "",
            positionType: backendData.applicantInfo?.positionType || "",
            desiredSalary: backendData.applicantInfo?.desiredSalary || "",
            dateAvailable: backendData.applicantInfo?.dateAvailable || "",
            employmentType: backendData.applicantInfo?.employmentType || "",
            authorizedToWork: backendData.applicantInfo?.authorizedToWork || "",
            workedForCompanyBefore: backendData.applicantInfo
              ?.workedForCompanyBefore?.hasWorked
              ? "YES"
              : "NO",
            workedWhen:
              backendData.applicantInfo?.workedForCompanyBefore?.when || "",
            convictedOfFelony:
              backendData.applicantInfo?.convictedOfFelony || "",
            felonyExplanation:
              backendData.applicantInfo?.felonyExplanation || "",

            // Education - keep existing structure
            highSchool: backendData.education?.highSchool || {
              name: "",
              address: "",
              from: "",
              to: "",
              graduated: "",
              diploma: "",
            },
            college: backendData.education?.college || {
              name: "",
              address: "",
              from: "",
              to: "",
              graduated: "",
              degree: "",
            },
            other: backendData.education?.other || {
              name: "",
              address: "",
              from: "",
              to: "",
              graduated: "",
              degree: "",
            },

            // References
            references: backendData.references || [
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

            // Previous Employment - keep existing structure
            previousEmployments: backendData.previousEmployments || [
              {
                company: "",
                phone: "",
                address: "",
                supervisor: "",
                jobTitle: "",
                startingSalary: "",
                endingSalary: "",
                responsibilities: "",
                from: "",
                to: "",
                reasonForLeaving: "",
                mayContactSupervisor: "",
              },
              {
                company: "",
                phone: "",
                address: "",
                supervisor: "",
                jobTitle: "",
                startingSalary: "",
                endingSalary: "",
                responsibilities: "",
                from: "",
                to: "",
                reasonForLeaving: "",
                mayContactSupervisor: "",
              },
              {
                company: "",
                phone: "",
                address: "",
                supervisor: "",
                jobTitle: "",
                startingSalary: "",
                endingSalary: "",
                responsibilities: "",
                from: "",
                to: "",
                reasonForLeaving: "",
                mayContactSupervisor: "",
              },
            ],

            // Military Service
            militaryService: backendData.militaryService || {
              branch: "",
              from: "",
              to: "",
              rankAtDischarge: "",
              typeOfDischarge: "",
              otherThanHonorable: "",
              mayContactSupervisor: "",
              reasonForLeaving: "",
            },

            // Signature
            signature: backendData.signature || "",
            date: backendData.date || "",
          };

          setApplicationData(mappedData);
          console.log("Mapped form data:", mappedData); // Debug log
        }

        // Check if coming from edit route
        if (location.pathname.includes("edit-application-form")) {
          setIsEditMode(true);
        } else if (location.pathname.includes("view-application-form")) {
          setIsEditMode(false);
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

  const [applicationData, setApplicationData] = useState({
    // Personal Information
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
    positionType: "", // PCA, CNA, LPN, RN
    desiredSalary: "",
    dateAvailable: "",
    employmentType: "", // Full-time, Part-time, etc.

    // Employment Questions
    authorizedToWork: "",
    workedForCompanyBefore: "",
    workedWhen: "",
    convictedOfFelony: "",
    felonyExplanation: "",

    // Education
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

    // Previous Employment
    previousEmployments: [
      {
        company: "",
        phone: "",
        address: "",
        supervisor: "",
        jobTitle: "",
        startingSalary: "",
        endingSalary: "",
        responsibilities: "",
        from: "",
        to: "",
        reasonForLeaving: "",
        mayContactSupervisor: "",
      },
      {
        company: "",
        phone: "",
        address: "",
        supervisor: "",
        jobTitle: "",
        startingSalary: "",
        endingSalary: "",
        responsibilities: "",
        from: "",
        to: "",
        reasonForLeaving: "",
        mayContactSupervisor: "",
      },
      {
        company: "",
        phone: "",
        address: "",
        supervisor: "",
        jobTitle: "",
        startingSalary: "",
        endingSalary: "",
        responsibilities: "",
        from: "",
        to: "",
        reasonForLeaving: "",
        mayContactSupervisor: "",
      },
    ],

    // Military Service
    militaryService: {
      branch: "",
      from: "",
      to: "",
      rankAtDischarge: "",
      typeOfDischarge: "",
      otherThanHonorable: "",
      mayContactSupervisor: "",
      reasonForLeaving: "",
    },

    // Disclaimer and Signature
    signature: "",
    signatureImage: null,
    signatureImageUrl: "",
    date: "",
  });

  const handleInputChange = (section, field, value, index = null) => {
    setApplicationData((prev) => {
      if (section === "root") {
        return {
          ...prev,
          [field]: value,
        };
      } else if (
        section === "references" ||
        section === "previousEmployments"
      ) {
        const newArray = [...prev[section]];
        newArray[index] = {
          ...newArray[index],
          [field]: value,
        };
        return {
          ...prev,
          [section]: newArray,
        };
      } else {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value,
          },
        };
      }
    });
  };

  const handleSignatureSave = (signatureType, imagePath) => {
    console.log("Signature saved:", signatureType, imagePath);

    setApplicationData((prev) => ({
      ...prev,
      signature: imagePath || "",
      signatureImage: imagePath || null,
      signatureImageUrl: imagePath || "",
    }));

    toast.success("Signature saved successfully!");
  };

  // Validation: show toast errors when fields have wrong type/format
  const validateForm = () => {
    console.log("Validating form with data:", {
      firstName: applicationData.firstName,
      lastName: applicationData.lastName,
      signature: applicationData.signature,
      signatureImageUrl: applicationData.signatureImageUrl,
    });

    const errors = [];

    // Required field validation
    if (!applicationData.firstName || applicationData.firstName.trim() === "") {
      console.log("First Name validation failed");
      errors.push("First Name is required");
    }

    if (!applicationData.lastName || applicationData.lastName.trim() === "") {
      console.log("Last Name validation failed");
      errors.push("Last Name is required");
    }

    if (!applicationData.signature && !applicationData.signatureImageUrl) {
      console.log("Signature validation failed");
      errors.push("Signature is required");
    }

    // Show all missing required fields at once
    if (errors.length > 0) {
      console.log("Validation failed with errors:", errors);
      toast.error(
        `Please fill in the following required fields: ${errors.join(", ")}`
      );
      return false;
    }

    const currentYear = new Date().getFullYear();
    const isYearValid = (y) =>
      /^\d{4}$/.test(String(y)) &&
      Number(y) >= 1900 &&
      Number(y) <= currentYear;
    const numeric = (v) =>
      v === "" || v === null || v === undefined ? true : !isNaN(Number(v));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const checkYearField = (label, value) => {
      if (value === "" || value === null || value === undefined) return true;
      if (!isYearValid(value)) {
        toast.error(
          `${label} must be a 4-digit year between 1900 and ${currentYear}`
        );
        return false;
      }
      return true;
    };

    // Education years
    console.log("Checking education years:", {
      highSchoolFrom: applicationData.highSchool?.from,
      highSchoolTo: applicationData.highSchool?.to,
      collegeFrom: applicationData.college?.from,
      collegeTo: applicationData.college?.to,
      otherFrom: applicationData.other?.from,
      otherTo: applicationData.other?.to,
    });

    if (
      !checkYearField('High school "From"', applicationData.highSchool?.from)
    ) {
      console.log("High school From validation failed");
      return false;
    }
    if (!checkYearField('High school "To"', applicationData.highSchool?.to)) {
      console.log("High school To validation failed");
      return false;
    }
    if (
      applicationData.highSchool?.from &&
      applicationData.highSchool?.to &&
      Number(applicationData.highSchool.from) >
        Number(applicationData.highSchool.to)
    ) {
      console.log("High school year range validation failed");
      toast.error('High school "From" year cannot be greater than "To" year');
      return false;
    }

    if (!checkYearField('College "From"', applicationData.college?.from)) {
      console.log("College From validation failed");
      return false;
    }
    if (!checkYearField('College "To"', applicationData.college?.to)) {
      console.log("College To validation failed");
      return false;
    }
    if (
      applicationData.college?.from &&
      applicationData.college?.to &&
      Number(applicationData.college.from) > Number(applicationData.college.to)
    ) {
      console.log("College year range validation failed");
      toast.error('College "From" year cannot be greater than "To" year');
      return false;
    }

    if (
      !checkYearField('Other education "From"', applicationData.other?.from)
    ) {
      console.log("Other education From validation failed");
      return false;
    }
    if (!checkYearField('Other education "To"', applicationData.other?.to)) {
      console.log("Other education To validation failed");
      return false;
    }
    if (
      applicationData.other?.from &&
      applicationData.other?.to &&
      Number(applicationData.other.from) > Number(applicationData.other.to)
    ) {
      console.log("Other education year range validation failed");
      toast.error(
        'Other education "From" year cannot be greater than "To" year'
      );
      return false;
    }

    // Basic format checks
    console.log("Checking basic formats:", {
      email: applicationData.email,
      zip: applicationData.zip,
      phone: applicationData.phone,
      ssn: applicationData.ssn,
    });

    if (applicationData.email && !emailRegex.test(applicationData.email)) {
      console.log("Email validation failed");
      toast.error("Please enter a valid email address");
      return false;
    }

    if (applicationData.zip && !numeric(applicationData.zip)) {
      console.log("ZIP validation failed");
      toast.error("ZIP code must be numeric");
      return false;
    }

    if (applicationData.phone && !numeric(applicationData.phone)) {
      console.log("Phone validation failed");
      toast.error("Phone must contain only numbers");
      return false;
    }

    if (
      applicationData.ssn &&
      !/^\d{3}-?\d{2}-?\d{4}$/.test(applicationData.ssn) &&
      !/^\d+$/.test(applicationData.ssn)
    ) {
      console.log("SSN validation failed");
      // allow plain digits or formatted SSN xxx-xx-xxxx
      toast.error("SSN should be numeric (format: 123-45-6789 or 123456789)");
      return false;
    }

    // previousEmployments numeric salary checks
    console.log(
      "Checking previous employments:",
      applicationData.previousEmployments
    );
    for (let i = 0; i < applicationData.previousEmployments.length; i++) {
      const emp = applicationData.previousEmployments[i];
      if (emp.startingSalary && !numeric(emp.startingSalary)) {
        console.log(
          `Previous employment #${i + 1} starting salary validation failed:`,
          emp.startingSalary
        );
        toast.error(
          `Previous employment #${i + 1}: Starting Salary must be numeric`
        );
        return false;
      }
      if (emp.endingSalary && !numeric(emp.endingSalary)) {
        console.log(
          `Previous employment #${i + 1} ending salary validation failed:`,
          emp.endingSalary
        );
        toast.error(
          `Previous employment #${i + 1}: Ending Salary must be numeric`
        );
        return false;
      }
    }

    return true;
  };

  // Simplified saveForm for testing
  const saveFormDirectly = async (status = "draft") => {
    console.log("saveFormDirectly called with status:", status);
    setSaving(true);

    try {
      const userCookie = Cookies.get("user");
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");

      const user = userCookie
        ? JSON.parse(userCookie)
        : { _id: "67e0f8770c6feb6ba99d11d2" };
      const token = sessionToken || accessToken;

      const backendFormData = {
        applicantInfo: {
          firstName: applicationData.firstName || "",
          middleName: applicationData.middleName || "",
          lastName: applicationData.lastName || "",
          address: applicationData.address || "",
          city: applicationData.city || "",
          state: applicationData.state || "",
          zip: applicationData.zip || "",
          phone: applicationData.phone || "",
          email: applicationData.email || "",
          ssn: applicationData.ssn || "",
          positionApplied: applicationData.positionApplied || "",
          positionType: applicationData.positionType || "",
          desiredSalary: applicationData.desiredSalary || "",
          dateAvailable: applicationData.dateAvailable || "",
          employmentType: applicationData.employmentType || "",
          authorizedToWork: applicationData.authorizedToWork || "",
          workedForCompanyBefore: {
            hasWorked: applicationData.workedForCompanyBefore === "YES",
            when: applicationData.workedWhen || "",
          },
          convictedOfFelony: applicationData.convictedOfFelony || "",
          felonyExplanation: applicationData.felonyExplanation || "",
        },
        education: {
          highSchool: applicationData.highSchool || {},
          college: applicationData.college || {},
          other: applicationData.other || {},
        },
        references: applicationData.references || [],
        previousEmployments: applicationData.previousEmployments || [],
        militaryService: applicationData.militaryService || {},
        signature:
          applicationData.signatureImageUrl || applicationData.signature || "",
        signatureImage: applicationData.signatureImage || null,
        signatureImageUrl: applicationData.signatureImageUrl || "",
        date: applicationData.date || "",
      };

      console.log("Sending form data to backend...");
      console.log(
        "🔍 positionType being sent:",
        backendFormData.applicantInfo.positionType
      );
      console.log("🔍 Full applicantInfo:", backendFormData.applicantInfo);

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${baseURL}/onboarding/save-employment-application`,
        {
          applicationId,
          employeeId: user._id,
          formData: backendFormData,
          status,
        },
        {
          headers,
          withCredentials: true,
        }
      );

      console.log("Backend response:", response.data);

      if (response.data) {
        const message =
          status === "draft"
            ? "Employment application saved as draft"
            : "Employment application completed successfully!";

        toast.success(message);

        // Dispatch custom event to notify sidebar of employment application update
        // This will trigger PCA eligibility re-check if positionType is PCA
        console.log(
          "[ViewApplicationForm] Dispatching event with positionType:",
          backendFormData.applicantInfo.positionType
        );
        window.dispatchEvent(
          new CustomEvent("employmentApplicationSaved", {
            detail: {
              positionType: backendFormData.applicantInfo.positionType,
            },
          })
        );
        window.dispatchEvent(new Event('formStatusUpdated'));
        console.log("[ViewApplicationForm] Event dispatched successfully");

        if (status === "completed") {
          console.log(
            "Form completed successfully, navigating to Job Description (PCA)..."
          );
          setTimeout(() => {
            navigate("/employee/job-description-pca");
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error(error.response?.data?.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const saveForm = async (status = "draft") => {
    try {
      alert("saveForm called with status: " + status); // This should show if saveForm is called
      console.log("saveForm called with status:", status);

      // Validate first
      console.log("About to call validateForm...");
      const valid = validateForm();
      console.log("Validation result:", valid);

      if (!valid && status === "completed") {
        console.log("Validation failed for completed status");
        alert("Validation failed - check console for details");
        toast.error("Please fix the highlighted errors before submitting.");
        return; // block final submission
      } else if (!valid && status === "draft") {
        console.log("Validation failed for draft status");
        toast(
          "Some fields look invalid — draft will be saved but please correct before submitting",
          { icon: "⚠️" }
        );
        // allow saving draft
      }

      console.log("Validation passed, proceeding with save...");
    } catch (error) {
      console.error("Error in saveForm start:", error);
      alert("Error in saveForm: " + error.message);
      return;
    }

    setSaving(true);
    try {
      if (!applicationId) {
        // Inform user that a new application will be created
        toast(
          "No existing application found — a new application will be created.",
          { icon: "ℹ️" }
        );
      }

      const userCookie = Cookies.get("user");
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");

      // Use fallback user if needed
      const user = userCookie
        ? JSON.parse(userCookie)
        : { _id: "67e0f8770c6feb6ba99d11d2" };
      const token = sessionToken || accessToken;

      // Map frontend data structure to backend structure
      const backendFormData = {
        applicantInfo: {
          firstName: applicationData.firstName || "",
          middleName: applicationData.middleName || "",
          lastName: applicationData.lastName || "",
          address: applicationData.address || "",
          city: applicationData.city || "",
          state: applicationData.state || "",
          zip: applicationData.zip || "",
          phone: applicationData.phone || "",
          email: applicationData.email || "",
          ssn: applicationData.ssn || "",
          positionApplied: applicationData.positionApplied || "",
          positionType: applicationData.positionType || "",
          desiredSalary: applicationData.desiredSalary || "",
          dateAvailable: applicationData.dateAvailable || "",
          employmentType: applicationData.employmentType || "",
          authorizedToWork: applicationData.authorizedToWork || "",
          workedForCompanyBefore: {
            hasWorked: applicationData.workedForCompanyBefore === "YES",
            when: applicationData.workedWhen || "",
          },
          convictedOfFelony: applicationData.convictedOfFelony || "",
          felonyExplanation: applicationData.felonyExplanation || "",
        },
        education: {
          highSchool: applicationData.highSchool || {},
          college: applicationData.college || {},
          other: applicationData.other || {},
        },
        references: applicationData.references || [],
        previousEmployments: applicationData.previousEmployments || [],
        militaryService: applicationData.militaryService || {},
        signature:
          applicationData.signatureImageUrl || applicationData.signature || "",
        signatureImage: applicationData.signatureImage || null,
        signatureImageUrl: applicationData.signatureImageUrl || "",
        date: applicationData.date || "",
      };

      console.log("Saving backend form data:", backendFormData); // Debug log

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${baseURL}/onboarding/save-employment-application`,
        {
          applicationId,
          employeeId: user._id,
          formData: backendFormData,
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
        setShowToaster(true);
        setTimeout(() => {
          setShowToaster(false);
        }, 3000);

        // Dispatch custom event to notify sidebar of employment application update
        // This will trigger PCA eligibility re-check if positionType is PCA
        console.log(
          "[ViewApplicationForm] Dispatching event with positionType:",
          backendFormData.applicantInfo.positionType
        );
        window.dispatchEvent(
          new CustomEvent("employmentApplicationSaved", {
            detail: {
              positionType: backendFormData.applicantInfo.positionType,
            },
          })
        );
        console.log("[ViewApplicationForm] Event dispatched successfully");

        if (status === "completed") {
          setTimeout(() => {
            setShowSuccessPopup(true);
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error(error.response?.data?.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    console.log("=== SUBMIT HANDLER CALLED ===");
    e.preventDefault();
    console.log("Submit button clicked - preventDefault called");
    console.log("Application data:", applicationData);
    console.log("Is edit mode:", isEditMode);
    console.log("Is saving:", saving);

    try {
      // Temporarily bypass validation to test submission
      console.log("Calling saveForm directly...");
      saveFormDirectly("completed");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert("Error in submit: " + error.message);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveForm("draft");
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    navigate("/employee/job-description-pca");
  };

  const nextPage = () => {
    setCurrentPage(2);
  };

  const prevPage = () => {
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
        <Navbar />

        {/* Main Content Container with sidebar layout */}
        <div className="pt-6 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex gap-6">
            {/* Vertical Progress Bar Sidebar */}
            <div className="w-16 flex-shrink-0 hidden md:block">
              <div className="sticky top-6 flex flex-col items-center">
                {/* Vertical Progress Bar */}
                <div className="w-4 h-[500px] bg-gray-200 rounded-full relative shadow-inner">
                  <div
                    className="w-4 bg-gradient-to-t from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out absolute bottom-0 shadow-sm"
                    style={{ height: `${overallProgress.percentage}%` }}
                  ></div>
                </div>

                {/* Percentage Text */}
                <div className="mt-4 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {overallProgress.percentage}%
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

            {/* Main Form Content with scroll */}
            <div className="flex-1 min-h-screen md:max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
              <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Logo Header - Inside the form container */}
                <div className="bg-[#1F3A93] flex justify-center items-center py-8 px-6">
                  <div className="bg-white rounded-xl p-4 shadow-lg">
                    <PacificHealthLogo className="h-20 w-auto" />
                  </div>
                </div>

                {/* Form Title and Page Info */}
                <div className="px-6 py-6 text-center border-b border-gray-200 bg-[#1F3A93]">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Employment Application Form
                  </h1>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <div className="inline-flex items-center px-5 py-3 bg-white/10 border border-white/20 text-white rounded-full text-sm font-semibold shadow-md">
                      <span className="mr-2">📄</span>
                      Page {currentPage} of 2
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 sm:p-10">
                  {currentPage === 1 && (
                    <div className="space-y-12">
                      {/* Applicant Information Section */}
                      <div>
                        <div className="bg-[#1F3A93] text-white px-4 md:px-6 py-4 mb-8 rounded-xl text-center shadow-lg">
                          <h3 className="font-bold text-lg md:text-xl">
                            Applicant Information
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              First Name:{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={applicationData.firstName}
                              onChange={(e) =>
                                handleInputChange(
                                  "root",
                                  "firstName",
                                  e.target.value
                                )
                              }
                              className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-colors shadow-sm hover:border-slate-400 ${
                                !isEditMode
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : ""
                              }`}
                              placeholder="Enter first name"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Middle Name:
                            </label>
                            <input
                              type="text"
                              value={applicationData.middleName}
                              onChange={(e) =>
                                handleInputChange(
                                  "root",
                                  "middleName",
                                  e.target.value
                                )
                              }
                              className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-colors shadow-sm hover:border-slate-400 ${
                                !isEditMode
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : ""
                              }`}
                              placeholder="Enter middle name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">
                              Last Name: <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={applicationData.lastName}
                              onChange={(e) =>
                                handleInputChange(
                                  "root",
                                  "lastName",
                                  e.target.value
                                )
                              }
                              className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-colors shadow-sm hover:border-slate-400 ${
                                !isEditMode
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : ""
                              }`}
                              placeholder="Enter last name"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Address:
                            </label>
                            <input
                              type="text"
                              value={applicationData.address}
                              onChange={(e) =>
                                handleInputChange(
                                  "root",
                                  "address",
                                  e.target.value
                                )
                              }
                              className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-colors shadow-sm hover:border-slate-400 ${
                                !isEditMode
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : ""
                              }`}
                              placeholder="Street Address"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City:
                            </label>
                            <input
                              type="text"
                              value={applicationData.city}
                              onChange={(e) =>
                                handleInputChange(
                                  "root",
                                  "city",
                                  e.target.value
                                )
                              }
                              className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-colors shadow-sm hover:border-slate-400 ${
                                !isEditMode
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : ""
                              }`}
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              State:
                            </label>
                            <input
                              type="text"
                              value={applicationData.state}
                              onChange={(e) =>
                                handleInputChange(
                                  "root",
                                  "state",
                                  e.target.value
                                )
                              }
                              className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-colors shadow-sm hover:border-slate-400 ${
                                !isEditMode
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : ""
                              }`}
                              placeholder="State"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              ZIP Code:
                            </label>
                            <input
                              type="number"
                              value={applicationData.zip}
                              onChange={(e) =>
                                handleInputChange("root", "zip", e.target.value)
                              }
                              className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-colors shadow-sm hover:border-slate-400 ${
                                !isEditMode
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : ""
                              }`}
                              placeholder="ZIP Code"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone:
                            </label>
                            <input
                              type="tel"
                              value={applicationData.phone}
                              onChange={(e) =>
                                handleInputChange(
                                  "root",
                                  "phone",
                                  e.target.value
                                )
                              }
                              className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-colors shadow-sm hover:border-slate-400 ${
                                !isEditMode
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : ""
                              }`}
                              placeholder="Phone Number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email:
                            </label>
                            <input
                              type="email"
                              value={applicationData.email}
                              onChange={(e) =>
                                handleInputChange(
                                  "root",
                                  "email",
                                  e.target.value
                                )
                              }
                              className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-colors shadow-sm hover:border-slate-400 ${
                                !isEditMode
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : ""
                              }`}
                              placeholder="Email Address"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SSN:
                            </label>
                            <input
                              type="text"
                              value={applicationData.ssn}
                              onChange={(e) =>
                                handleInputChange("root", "ssn", e.target.value)
                              }
                              className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-colors shadow-sm hover:border-slate-400 ${
                                !isEditMode
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : ""
                              }`}
                              placeholder="Social Security Number"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Position Type{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              required
                              value={applicationData.positionType}
                              onChange={(e) =>
                                handleInputChange(
                                  "root",
                                  "positionType",
                                  e.target.value
                                )
                              }
                              disabled={!isEditMode}
                              className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                !isEditMode
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <option value="">Select Position Type</option>
                              <option value="PCA">
                                Personal Care Assistant (PCA)
                              </option>
                              <option value="CNA">
                                Certified Nursing Assistant (CNA)
                              </option>
                              <option value="LPN">
                                Licensed Practical Nurse (LPN)
                              </option>
                              <option value="RN">Registered Nurse (RN)</option>
                            </select>
                            {applicationData.positionType === "PCA" && (
                              <p className="mt-1 text-xs text-blue-600 font-medium">
                                ✓ PCA Training Questions will be available in
                                Part 3 after submission
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Desired Salary:
                            </label>
                            <input
                              type="number"
                              value={applicationData.desiredSalary}
                              onChange={(e) =>
                                handleInputChange(
                                  "root",
                                  "desiredSalary",
                                  e.target.value
                                )
                              }
                              className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                !isEditMode
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : ""
                              }`}
                              placeholder="Desired Salary"
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              Date Available:
                            </label>
                            <input
                              type="date"
                              value={applicationData.dateAvailable}
                              onChange={(e) =>
                                handleInputChange(
                                  "root",
                                  "dateAvailable",
                                  e.target.value
                                )
                              }
                              className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                !isEditMode ? "bg-white" : ""
                              }`}
                            />
                          </div>
                        </div>

                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Type of Employment Desired:
                          </label>
                          <div className="flex flex-wrap gap-6">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                disabled={!isEditMode}
                                name="employmentType"
                                value="Full-time"
                                checked={
                                  applicationData.employmentType === "Full-time"
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "root",
                                    "employmentType",
                                    e.target.value
                                  )
                                }
                                className="mr-2 text-slate-700 focus:ring-2 focus:ring-slate-600"
                              />
                              <span className="text-sm">Full-time</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                disabled={!isEditMode}
                                name="employmentType"
                                value="Part-time"
                                checked={
                                  applicationData.employmentType === "Part-time"
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "root",
                                    "employmentType",
                                    e.target.value
                                  )
                                }
                                className="mr-2 text-slate-700 focus:ring-2 focus:ring-slate-600"
                              />
                              <span className="text-sm">Part-time</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                disabled={!isEditMode}
                                name="employmentType"
                                value="Temporary"
                                checked={
                                  applicationData.employmentType === "Temporary"
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "root",
                                    "employmentType",
                                    e.target.value
                                  )
                                }
                                className="mr-2 text-slate-700 focus:ring-2 focus:ring-slate-600"
                              />
                              <span className="text-sm">Temporary</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Employment Questions Section */}
                      <div>
                        <div className="bg-[#1F3A93] text-white px-4 md:px-6 py-4 mb-8 rounded-xl text-center shadow-lg">
                          <h3 className="font-bold text-lg md:text-xl">
                            Employment Questions
                          </h3>
                        </div>

                        <div className="space-y-6 sm:space-y-8">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">
                              Are you authorized to work in the United States?
                            </p>
                            <div className="flex gap-6 mb-4">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  disabled={!isEditMode}
                                  name="authorizedToWork"
                                  value="YES"
                                  checked={
                                    applicationData.authorizedToWork === "YES"
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      "root",
                                      "authorizedToWork",
                                      e.target.value
                                    )
                                  }
                                  className="mr-2 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                />
                                <span className="text-sm">YES</span>
                              </label>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  disabled={!isEditMode}
                                  name="authorizedToWork"
                                  value="NO"
                                  checked={
                                    applicationData.authorizedToWork === "NO"
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      "root",
                                      "authorizedToWork",
                                      e.target.value
                                    )
                                  }
                                  className="mr-2 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                />
                                <span className="text-sm">NO</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">
                              Have you ever worked for this company?
                            </p>
                            <div className="flex gap-6 mb-4">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  disabled={!isEditMode}
                                  name="workedForCompanyBefore"
                                  value="YES"
                                  checked={
                                    applicationData.workedForCompanyBefore ===
                                    "YES"
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      "root",
                                      "workedForCompanyBefore",
                                      e.target.value
                                    )
                                  }
                                  className="mr-2 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                />
                                <span className="text-sm">YES</span>
                              </label>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  disabled={!isEditMode}
                                  name="workedForCompanyBefore"
                                  value="NO"
                                  checked={
                                    applicationData.workedForCompanyBefore ===
                                    "NO"
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      "root",
                                      "workedForCompanyBefore",
                                      e.target.value
                                    )
                                  }
                                  className="mr-2 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                />
                                <span className="text-sm">NO</span>
                              </label>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">
                                If yes, when?
                              </label>
                              <input
                                type="text"
                                value={applicationData.workedWhen}
                                onChange={(e) =>
                                  handleInputChange(
                                    "root",
                                    "workedWhen",
                                    e.target.value
                                  )
                                }
                                className="w-full md:w-64 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition-colors shadow-sm hover:border-slate-400"
                                placeholder="Month/Year"
                              />
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">
                              Have you ever been convicted of a felony?
                            </p>
                            <div className="flex gap-6 mb-4">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  disabled={!isEditMode}
                                  name="convictedOfFelony"
                                  value="YES"
                                  checked={
                                    applicationData.convictedOfFelony === "YES"
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      "root",
                                      "convictedOfFelony",
                                      e.target.value
                                    )
                                  }
                                  className="mr-2 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                />
                                <span className="text-sm">YES</span>
                              </label>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  disabled={!isEditMode}
                                  name="convictedOfFelony"
                                  value="NO"
                                  checked={
                                    applicationData.convictedOfFelony === "NO"
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      "root",
                                      "convictedOfFelony",
                                      e.target.value
                                    )
                                  }
                                  className="mr-2 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                />
                                <span className="text-sm">NO</span>
                              </label>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-2">
                                If yes, explain:
                              </label>
                              <textarea
                                disabled={!isEditMode}
                                value={applicationData.felonyExplanation}
                                onChange={(e) =>
                                  handleInputChange(
                                    "root",
                                    "felonyExplanation",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="Please provide explanation if applicable"
                                rows="3"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Education Section */}
                      <div>
                        <div className="bg-[#1F3A93] text-white px-4 md:px-6 py-4 mb-8 rounded-xl text-center shadow-lg">
                          <h3 className="font-bold text-lg md:text-xl">
                            Education
                          </h3>
                        </div>

                        {/* High School */}
                        <div className="mb-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                High School:
                              </label>
                              <input
                                type="text"
                                value={applicationData.highSchool.name}
                                onChange={(e) =>
                                  handleInputChange(
                                    "highSchool",
                                    "name",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="High School Name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Address:
                              </label>
                              <input
                                type="text"
                                value={applicationData.highSchool.address}
                                onChange={(e) =>
                                  handleInputChange(
                                    "highSchool",
                                    "address",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="School Address"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                From:
                              </label>
                              <input
                                type="number"
                                inputMode="numeric"
                                min="1900"
                                max={new Date().getFullYear()}
                                step="1"
                                value={applicationData.highSchool.from}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  // optional: enforce max 4 digits and keep as string for your data model
                                  if (v === "" || /^\d{0,4}$/.test(v)) {
                                    handleInputChange("highSchool", "from", v);
                                  }
                                }}
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="YYYY"
                                aria-label="High school start year"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                To:
                              </label>
                              <input
                                type="number"
                                inputMode="numeric"
                                min="1900"
                                max={new Date().getFullYear()}
                                step="1"
                                value={applicationData.highSchool.to}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  // optional: enforce max 4 digits and keep as string for your data model
                                  if (v === "" || /^\d{0,4}$/.test(v)) {
                                    handleInputChange("highSchool", "to", v);
                                  }
                                }}
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="YYYY"
                                aria-label="High school end year"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-3">
                                Did you graduate?
                              </p>
                              <div className="flex gap-4">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    disabled={!isEditMode}
                                    name="highSchoolGraduated"
                                    value="YES"
                                    checked={
                                      applicationData.highSchool.graduated ===
                                      "YES"
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        "highSchool",
                                        "graduated",
                                        e.target.value
                                      )
                                    }
                                    className="mr-1 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                  />
                                  <span className="text-xs">YES</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    disabled={!isEditMode}
                                    name="highSchoolGraduated"
                                    value="NO"
                                    checked={
                                      applicationData.highSchool.graduated ===
                                      "NO"
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        "highSchool",
                                        "graduated",
                                        e.target.value
                                      )
                                    }
                                    className="mr-1 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                  />
                                  <span className="text-xs">NO</span>
                                </label>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Diploma:
                              </label>
                              <input
                                type="text"
                                value={applicationData.highSchool.diploma}
                                onChange={(e) =>
                                  handleInputChange(
                                    "highSchool",
                                    "diploma",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="Diploma Type"
                              />
                            </div>
                          </div>
                        </div>

                        {/* College */}
                        <div className="mb-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                College:
                              </label>
                              <input
                                type="text"
                                value={applicationData.college.name}
                                onChange={(e) =>
                                  handleInputChange(
                                    "college",
                                    "name",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="College/University Name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Address:
                              </label>
                              <input
                                type="text"
                                value={applicationData.college.address}
                                onChange={(e) =>
                                  handleInputChange(
                                    "college",
                                    "address",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="College Address"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                From:
                              </label>
                              <input
                                type="number"
                                inputMode="numeric"
                                min="1900"
                                max={new Date().getFullYear()}
                                step="1"
                                value={applicationData.college.from}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  // optional: enforce max 4 digits and keep as string for your data model
                                  if (v === "" || /^\d{0,4}$/.test(v)) {
                                    handleInputChange("college", "from", v);
                                  }
                                }}
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="YYYY"
                                aria-label="College start year"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                To:
                              </label>
                              <input
                                type="number"
                                inputMode="numeric"
                                min="1900"
                                max={new Date().getFullYear()}
                                step="1"
                                value={applicationData.college.to}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  // optional: enforce max 4 digits and keep as string for your data model
                                  if (v === "" || /^\d{0,4}$/.test(v)) {
                                    handleInputChange("college", "to", v);
                                  }
                                }}
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="YYYY"
                                aria-label="College end year"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-3">
                                Did you graduate?
                              </p>
                              <div className="flex gap-4">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    disabled={!isEditMode}
                                    name="collegeGraduated"
                                    value="YES"
                                    checked={
                                      applicationData.college.graduated ===
                                      "YES"
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        "college",
                                        "graduated",
                                        e.target.value
                                      )
                                    }
                                    className="mr-1 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                  />
                                  <span className="text-xs">YES</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    disabled={!isEditMode}
                                    name="collegeGraduated"
                                    value="NO"
                                    checked={
                                      applicationData.college.graduated === "NO"
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        "college",
                                        "graduated",
                                        e.target.value
                                      )
                                    }
                                    className="mr-1 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                  />
                                  <span className="text-xs">NO</span>
                                </label>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Degree:
                              </label>
                              <input
                                type="text"
                                value={applicationData.college.degree}
                                onChange={(e) =>
                                  handleInputChange(
                                    "college",
                                    "degree",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="Degree Type"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Other */}
                        <div className="mb-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Other:
                              </label>
                              <input
                                type="text"
                                value={applicationData.other.name}
                                onChange={(e) =>
                                  handleInputChange(
                                    "other",
                                    "name",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="Other Education/Training"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Address:
                              </label>
                              <input
                                type="text"
                                value={applicationData.other.address}
                                onChange={(e) =>
                                  handleInputChange(
                                    "other",
                                    "address",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="Institution Address"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                From:
                              </label>
                              <input
                                type="number"
                                inputMode="numeric"
                                min="1900"
                                max={new Date().getFullYear()}
                                step="1"
                                value={applicationData.other.from}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  // optional: enforce max 4 digits and keep as string for your data model
                                  if (v === "" || /^\d{0,4}$/.test(v)) {
                                    handleInputChange("other", "from", v);
                                  }
                                }}
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="YYYY"
                                aria-label="Other education start year"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                To:
                              </label>
                              <input
                                type="number"
                                inputMode="numeric"
                                min="1900"
                                max={new Date().getFullYear()}
                                step="1"
                                value={applicationData.other.to}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  // optional: enforce max 4 digits and keep as string for your data model
                                  if (v === "" || /^\d{0,4}$/.test(v)) {
                                    handleInputChange("other", "to", v);
                                  }
                                }}
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="YYYY"
                                aria-label="Other education end year"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-3">
                                Did you graduate?
                              </p>
                              <div className="flex gap-4">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    disabled={!isEditMode}
                                    name="otherGraduated"
                                    value="YES"
                                    checked={
                                      applicationData.other.graduated === "YES"
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        "other",
                                        "graduated",
                                        e.target.value
                                      )
                                    }
                                    className="mr-1 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                  />
                                  <span className="text-xs">YES</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    disabled={!isEditMode}
                                    name="otherGraduated"
                                    value="NO"
                                    checked={
                                      applicationData.other.graduated === "NO"
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        "other",
                                        "graduated",
                                        e.target.value
                                      )
                                    }
                                    className="mr-1 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                  />
                                  <span className="text-xs">NO</span>
                                </label>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Degree:
                              </label>
                              <input
                                type="text"
                                value={applicationData.other.degree}
                                onChange={(e) =>
                                  handleInputChange(
                                    "other",
                                    "degree",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="Certificate/Degree"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar in Form Footer */}
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
                              {overallProgress.completed}/
                              {overallProgress.total}
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
                              {overallProgress.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${overallProgress.percentage}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 text-center">
                          {applicationStatus === "submitted"
                            ? "✅ Submitted"
                            : "📝 Draft"}{" "}
                          • Current: Employment Application
                        </div>
                      </div>

                      {/* Page 1 Navigation */}
                      <div className="mt-6 pt-8 border-t-2 border-gray-200 flex flex-col lg:flex-row gap-4 lg:justify-between lg:items-center">
                        <button
                          type="button"
                          onClick={() => navigate("/employee/position-type")}
                          className="w-full lg:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#2748B4] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                        >
                          ← Previous
                        </button>

                        <div className="w-full sm:w-auto flex justify-center lg:flex-1">
                          <button
                            type="button"
                            onClick={() =>
                              navigate("/employee/task-management")
                            }
                            className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                          >
                            Exit Application
                          </button>
                        </div>

                        <div className="w-full lg:w-auto flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={nextPage}
                            className="w-full max-w-xs px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                          >
                            Save & Next →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentPage === 2 && (
                    <div className="space-y-12">
                      {/* References Section */}
                      <div>
                        <div className="bg-[#1F3A93] text-white px-4 md:px-6 py-4 mb-8 rounded-xl text-center shadow-lg">
                          <h3 className="font-bold text-lg md:text-xl">
                            References
                          </h3>
                        </div>

                        {applicationData.references.map((reference, index) => (
                          <div
                            key={index}
                            className="mb-8 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Full Name:
                                </label>
                                <input
                                  type="text"
                                  value={reference.fullName}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "references",
                                      "fullName",
                                      e.target.value,
                                      index
                                    )
                                  }
                                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                    !isEditMode
                                      ? "bg-gray-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  placeholder="Full Name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Relationship:
                                </label>
                                <input
                                  type="text"
                                  value={reference.relationship}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "references",
                                      "relationship",
                                      e.target.value,
                                      index
                                    )
                                  }
                                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                    !isEditMode
                                      ? "bg-gray-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  placeholder="Relationship"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Company:
                                </label>
                                <input
                                  type="text"
                                  value={reference.company}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "references",
                                      "company",
                                      e.target.value,
                                      index
                                    )
                                  }
                                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                    !isEditMode
                                      ? "bg-gray-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  placeholder="Company"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Phone:
                                </label>
                                <input
                                  type="tel"
                                  value={reference.phone}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "references",
                                      "phone",
                                      e.target.value,
                                      index
                                    )
                                  }
                                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                    !isEditMode
                                      ? "bg-gray-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  placeholder="Phone Number"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Address:
                                </label>
                                <input
                                  type="text"
                                  value={reference.address}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "references",
                                      "address",
                                      e.target.value,
                                      index
                                    )
                                  }
                                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                    !isEditMode
                                      ? "bg-gray-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  placeholder="Address"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Previous Employment Section */}
                      <div>
                        <div className="bg-[#1F3A93] text-white px-4 md:px-6 py-4 mb-8 rounded-xl text-center shadow-lg">
                          <h3 className="font-bold text-lg md:text-xl">
                            Previous Employment
                          </h3>
                        </div>

                        {applicationData.previousEmployments.map(
                          (employment, index) => (
                            <div
                              key={index}
                              className="mb-8 p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Company:
                                  </label>
                                  <input
                                    type="text"
                                    value={employment.company}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "previousEmployments",
                                        "company",
                                        e.target.value,
                                        index
                                      )
                                    }
                                    className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                      !isEditMode
                                        ? "bg-gray-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    placeholder="Company Name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone:
                                  </label>
                                  <input
                                    type="tel"
                                    value={employment.phone}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "previousEmployments",
                                        "phone",
                                        e.target.value,
                                        index
                                      )
                                    }
                                    className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                      !isEditMode
                                        ? "bg-gray-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    placeholder="Phone Number"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Address:
                                  </label>
                                  <input
                                    type="text"
                                    value={employment.address}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "previousEmployments",
                                        "address",
                                        e.target.value,
                                        index
                                      )
                                    }
                                    className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                      !isEditMode
                                        ? "bg-gray-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    placeholder="Company Address"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Supervisor:
                                  </label>
                                  <input
                                    type="text"
                                    value={employment.supervisor}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "previousEmployments",
                                        "supervisor",
                                        e.target.value,
                                        index
                                      )
                                    }
                                    className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                      !isEditMode
                                        ? "bg-gray-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    placeholder="Supervisor Name"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Job Title:
                                  </label>
                                  <input
                                    type="text"
                                    value={employment.jobTitle}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "previousEmployments",
                                        "jobTitle",
                                        e.target.value,
                                        index
                                      )
                                    }
                                    className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                      !isEditMode
                                        ? "bg-gray-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    placeholder="Job Title"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Starting Salary $:
                                  </label>
                                  <input
                                    type="number"
                                    value={employment.startingSalary}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "previousEmployments",
                                        "startingSalary",
                                        e.target.value,
                                        index
                                      )
                                    }
                                    className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                      !isEditMode
                                        ? "bg-gray-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    placeholder="Starting Salary"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Ending Salary $:
                                  </label>
                                  <input
                                    type="number"
                                    value={employment.endingSalary}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "previousEmployments",
                                        "endingSalary",
                                        e.target.value,
                                        index
                                      )
                                    }
                                    className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                      !isEditMode
                                        ? "bg-gray-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    placeholder="Ending Salary"
                                  />
                                </div>
                              </div>

                              <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Responsibilities:
                                </label>
                                <textarea
                                  disabled={!isEditMode}
                                  value={employment.responsibilities}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "previousEmployments",
                                      "responsibilities",
                                      e.target.value,
                                      index
                                    )
                                  }
                                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                    !isEditMode
                                      ? "bg-gray-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  placeholder="Job Responsibilities"
                                  rows="3"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div>
                                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 text-gray-600" />
                                    From:
                                  </label>
                                  <input
                                    type="date"
                                    value={employment.from}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "previousEmployments",
                                        "from",
                                        e.target.value,
                                        index
                                      )
                                    }
                                    className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                      !isEditMode ? "bg-white" : ""
                                    }`}
                                  />
                                </div>
                                <div>
                                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 text-gray-600" />
                                    To:
                                  </label>
                                  <input
                                    type="date"
                                    value={employment.to}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "previousEmployments",
                                        "to",
                                        e.target.value,
                                        index
                                      )
                                    }
                                    className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                      !isEditMode ? "bg-white" : ""
                                    }`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Reason for Leaving:
                                  </label>
                                  <input
                                    type="text"
                                    value={employment.reasonForLeaving}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "previousEmployments",
                                        "reasonForLeaving",
                                        e.target.value,
                                        index
                                      )
                                    }
                                    className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                      !isEditMode
                                        ? "bg-gray-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    placeholder="Reason for Leaving"
                                  />
                                </div>
                              </div>

                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-3">
                                  May we contact your previous supervisor for a
                                  reference?
                                </p>
                                <div className="flex gap-6">
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="radio"
                                      disabled={!isEditMode}
                                      name={`previousEmploymentContact${index}`}
                                      value="YES"
                                      checked={
                                        employment.mayContactSupervisor ===
                                        "YES"
                                      }
                                      onChange={(e) =>
                                        handleInputChange(
                                          "previousEmployments",
                                          "mayContactSupervisor",
                                          e.target.value,
                                          index
                                        )
                                      }
                                      className="mr-2 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                    />
                                    <span className="text-sm">YES</span>
                                  </label>
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="radio"
                                      disabled={!isEditMode}
                                      name={`previousEmploymentContact${index}`}
                                      value="NO"
                                      checked={
                                        employment.mayContactSupervisor === "NO"
                                      }
                                      onChange={(e) =>
                                        handleInputChange(
                                          "previousEmployments",
                                          "mayContactSupervisor",
                                          e.target.value,
                                          index
                                        )
                                      }
                                      className="mr-2 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                    />
                                    <span className="text-sm">NO</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {/* Military Service Section */}
                      <div>
                        <div className="bg-[#1F3A93] text-white px-4 md:px-6 py-4 mb-8 rounded-xl text-center shadow-lg">
                          <h3 className="font-bold text-lg md:text-xl">
                            Military Service
                          </h3>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Branch:
                              </label>
                              <input
                                type="text"
                                value={applicationData.militaryService.branch}
                                onChange={(e) =>
                                  handleInputChange(
                                    "militaryService",
                                    "branch",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="Military Branch"
                              />
                            </div>
                            <div>
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                From:
                              </label>
                              <input
                                type="date"
                                value={applicationData.militaryService.from}
                                onChange={(e) =>
                                  handleInputChange(
                                    "militaryService",
                                    "from",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode ? "bg-white" : ""
                                }`}
                              />
                            </div>
                            <div>
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                To:
                              </label>
                              <input
                                type="date"
                                value={applicationData.militaryService.to}
                                onChange={(e) =>
                                  handleInputChange(
                                    "militaryService",
                                    "to",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode ? "bg-white" : ""
                                }`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Rank at Discharge:
                              </label>
                              <input
                                type="text"
                                value={
                                  applicationData.militaryService
                                    .rankAtDischarge
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "militaryService",
                                    "rankAtDischarge",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="Rank at Discharge"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Type of Discharge:
                              </label>
                              <input
                                type="text"
                                value={
                                  applicationData.militaryService
                                    .typeOfDischarge
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "militaryService",
                                    "typeOfDischarge",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="Type of Discharge"
                              />
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              If other than honorable, explain:
                            </label>
                            <textarea
                              disabled={!isEditMode}
                              value={
                                applicationData.militaryService
                                  .otherThanHonorable
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "militaryService",
                                  "otherThanHonorable",
                                  e.target.value
                                )
                              }
                              className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                !isEditMode
                                  ? "bg-gray-50 cursor-not-allowed"
                                  : ""
                              }`}
                              placeholder="Explanation if applicable"
                              rows="3"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-3">
                                May we contact your previous supervisor for a
                                reference?
                              </p>
                              <div className="flex gap-6">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    disabled={!isEditMode}
                                    name="militaryContactSupervisor"
                                    value="YES"
                                    checked={
                                      applicationData.militaryService
                                        .mayContactSupervisor === "YES"
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        "militaryService",
                                        "mayContactSupervisor",
                                        e.target.value
                                      )
                                    }
                                    className="mr-2 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                  />
                                  <span className="text-sm">YES</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    disabled={!isEditMode}
                                    name="militaryContactSupervisor"
                                    value="NO"
                                    checked={
                                      applicationData.militaryService
                                        .mayContactSupervisor === "NO"
                                    }
                                    onChange={(e) =>
                                      handleInputChange(
                                        "militaryService",
                                        "mayContactSupervisor",
                                        e.target.value
                                      )
                                    }
                                    className="mr-2 text-slate-700 focus:ring-2 focus:ring-slate-600"
                                  />
                                  <span className="text-sm">NO</span>
                                </label>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Reason for Leaving:
                              </label>
                              <input
                                type="text"
                                value={
                                  applicationData.militaryService
                                    .reasonForLeaving
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "militaryService",
                                    "reasonForLeaving",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode
                                    ? "bg-gray-50 cursor-not-allowed"
                                    : ""
                                }`}
                                placeholder="Reason for Leaving"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Disclaimer and Signature Section */}
                      <div>
                        <div className="bg-[#1F3A93] text-white px-4 md:px-6 py-4 mb-8 rounded-xl text-center shadow-lg">
                          <h3 className="font-bold text-lg md:text-xl">
                            Disclaimer and Signature
                          </h3>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 mb-2">
                              I certify that my answers are true and complete to
                              the best of my knowledge.
                            </p>
                            <p className="text-sm text-gray-700 mb-4">
                              If this application leads to employment, I
                              understand that false or misleading information in
                              my application or interview may result in my
                              release.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Signature:
                              </label>
                              <div className="space-y-4">
                                <SignaturePad
                                  label="Staff Signature"
                                  initialValue={applicationData.signature}
                                  onSave={(imagePath) =>
                                    handleSignatureSave(
                                      "staffSignature",
                                      imagePath
                                    )
                                  }
                                  required={true}
                                  width={400}
                                  height={150}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                Date:
                              </label>
                              <input
                                type="date"
                                value={applicationData.date}
                                onChange={(e) =>
                                  handleInputChange(
                                    "root",
                                    "date",
                                    e.target.value
                                  )
                                }
                                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 ${
                                  !isEditMode ? "bg-white" : ""
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar in Form Footer */}
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
                              {overallProgress.completed}/
                              {overallProgress.total}
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
                              {overallProgress.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${overallProgress.percentage}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 text-center">
                          {applicationStatus === "submitted"
                            ? "✅ Submitted"
                            : "📝 Draft"}{" "}
                          • Current: Employment Application
                        </div>
                      </div>

                      {/* Page 2 Navigation */}
                      <div className="mt-6 pt-8 border-t-2 border-gray-200 flex flex-col lg:flex-row gap-4 lg:justify-between lg:items-center">
                        <button
                          type="button"
                          onClick={prevPage}
                          className="w-full lg:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#2748B4] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                        >
                          ← Previous Page
                        </button>
                        <div className="w-full lg:w-auto flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#2748B4] hover:to-[#1F3A93] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                          >
                            {saving ? (
                              <>
                                <RotateCcw className="w-4 h-4 mr-2 animate-spin inline" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2 inline" />
                                Save as Draft
                              </>
                            )}
                          </button>
                          <button
                            type="submit"
                            disabled={saving}
                            className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#2748B4] hover:to-[#1F3A93] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                          >
                            {saving ? (
                              <>
                                <RotateCcw className="w-4 h-4 mr-2 animate-spin inline" />
                                Submitting...
                              </>
                            ) : (
                              <>📄 Save & Next</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Toaster Notification */}
        {showToaster && (
          <div className="fixed top-4 right-4 z-50 transform transition-all duration-500 ease-in-out">
            <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Changes are successfully done
                </p>
              </div>
              <button
                onClick={() => setShowToaster(false)}
                className="flex-shrink-0 ml-4 text-green-200 hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-pulse">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Application Submitted!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your employment application has been successfully submitted.
                  We will review your application and get back to you soon.
                </p>
                <button
                  onClick={closeSuccessPopup}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#2748B4] hover:to-[#1F3A93] transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Back to Tasks
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ViewApplicationForm;
