import React, { useEffect, useState, useMemo } from "react";
// Using external logo URL instead of local TempLogo
const SIDEBAR_LOGO_URL =
  "https://i.pinimg.com/1200x/fd/81/16/fd81160d9bb6751db8d120e675069b10.jpg";
import {
  CalendarIcon,
  CommunicationIcon,
  DocumentManagementIcon,
  EmployeeDirectoryIcon,
  ErrorLogs,
  LogoutIcon,
  MonitorSystemIcon,
  PersonalDetailsIcon,
  ReportIcon,
  SettingsIcon,
  SliderBarGroupIcon,
  SliderBarHomeIcon,
  TaskmanagementIcon,
} from "../../../assets/Svgs/AllSvgs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { FileText, Video } from "lucide-react";

// Custom hamburger menu icon component (ChatGPT style)
const HamburgerIcon = ({ isCollapsed }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="transition-transform duration-200"
  >
    <rect
      x="2"
      y="4"
      width={isCollapsed ? "16" : "10"}
      height="2"
      rx="1"
      fill="currentColor"
      className="transition-all duration-200"
    />
    <rect x="2" y="9" width="16" height="2" rx="1" fill="currentColor" />
    <rect
      x="2"
      y="14"
      width={isCollapsed ? "16" : "10"}
      height="2"
      rx="1"
      fill="currentColor"
      className="transition-all duration-200"
    />
  </svg>
);

export const Sidebar = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isDesktopCollapsed,
  setIsDesktopCollapsed,
}) => {
  const userToken = Cookies.get("session");
  const decodedToken = userToken && jwtDecode(userToken);
  const user = decodedToken?.user;
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [formCompletionStatus, setFormCompletionStatus] = useState({});
  const [isLoadingFormStatus, setIsLoadingFormStatus] = useState(false);
  const [isApplicationsExpanded, setIsApplicationsExpanded] = useState(false);
  const [hasUserCollapsedSubmenu, setHasUserCollapsedSubmenu] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [expandedParts, setExpandedParts] = useState({
    part1: false,
    part2: true,
    part3: false,
    part4: false,
  });
  const [isPCAEligible, setIsPCAEligible] = useState(false);
  const [pcaEligibilityChecked, setPcaEligibilityChecked] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState("draft");
  const [employmentType, setEmploymentType] = useState(null);

  const baseURL = import.meta.env.VITE__BASEURL;

  // Forms data organized by parts - memoized to update when isPCAEligible and employmentType changes
  const formsByParts = useMemo(() => {
    console.log(
      "[Sidebar useMemo] isPCAEligible:",
      isPCAEligible,
      "applicationStatus:",
      applicationStatus,
      "employmentType:",
      employmentType
    );

    const part4Forms = [];

    // Only show After Hire forms if application is approved
    if (applicationStatus === "approved") {
      part4Forms.push({
        id: "training-video",
        name: "Training Video",
        path: "/employee/training-video",
      });

      // Add PCA Training Questions if eligible
      if (isPCAEligible) {
        console.log(
          "[Sidebar useMemo] Adding PCA Training Questions to Part 4"
        );
        part4Forms.push({
          id: "pca-training-questions",
          name: "PCA Training Examinations",
          path: "/employee/pca-training-questions",
        });
      }
    }

    return {
      part1: {
        title: "Part 1: Employment Application",
        forms: [
          {
            id: "personal-information",
            name: "Applicant Information",
            path: "/employee/personal-information",
          },
          {
            id: "education",
            name: "Education",
            path: "/employee/education",
          },
          {
            id: "references",
            name: "References",
            path: "/employee/references",
          },
          {
            id: "work-experience",
            name: "Previous Employment",
            path: "/employee/work-experience",
          },
          {
            id: "professional-experience",
            name: "Military Service",
            path: "/employee/professional-experience",
          },
          {
            id: "legal-disclosures",
            name: "Disclaimer and Signature",
            path: "/employee/legal-disclosures",
          },
        ],
      },
      part2: {
        title: "Part 2: Documents to Submit",
        forms: [
          {
            id: "job-description-pca",
            name: "Job Description",
            path: "/employee/job-description-pca",
          },
          {
            id: "code-of-ethics",
            name: "Code of Ethics Form",
            path: "/employee/code-of-ethics",
          },
          {
            id: "service-delivery-policies",
            name: "Service Delivery Form",
            path: "/employee/service-delivery-policies",
          },
          {
            id: "non-compete-agreement",
            name: "Non-Compete Agreement",
            path: "/employee/non-compete-agreement",
          },
          {
            id: "emergency-contact",
            name: "Emergency Contact Form",
            path: "/employee/emergency-contact",
          },
          {
            id: "employee-details-upload",
            name: "Professional Certificate(s)",
            path: "/employee/employee-details-upload",
          },
          {
            id: "cpr-first-aid-certificate",
            name: "CPR/First Aid Certificate",
            path: "/employee/cpr-first-aid-certificate",
          },
          {
            id: "driving-license",
            name: "Government ID",
            path: "/employee/driving-license-upload",
          },
          {
            id: "background-check",
            name: "Background Check Form",
            path: "/employee/background-check-upload",
          },
          {
            id: "misconduct-form",
            name: "Staff Misconduct Form",
            path: "/employee/misconduct-form",
          },
          {
            id: "tb-symptom-screen",
            name: "TB or X-Ray Form",
            path: "/employee/edit-tb-symptom-screen-form",
          },
          {
            id: "i9-form",
            name: "I-9 Employment Eligibility",
            path: "/employee/i9-form",
          },
          {
            id: "employment-type",
            name: "Employment Type Selection",
            path: "/employee/employment-type",
          },
          ...(employmentType === "W-2"
            ? [
                {
                  id: "w4-form",
                  name: "W-4 Tax Form",
                  path: "/employee/w4-form",
                },
              ]
            : []),
          ...(employmentType === "1099"
            ? [
                {
                  id: "w9-form",
                  name: "W-9 Tax Form",
                  path: "/employee/w9-form",
                },
              ]
            : []),
          {
            id: "direct-deposit",
            name: "Direct Deposit Form",
            path: "/employee/direct-deposit",
          },
        ],
      },
      part3: {
        title: "Part 3: Orientation Documentation",
        forms: [
          {
            id: "orientation-presentation",
            name: "Orientation PowerPoint Presentation",
            path: "/employee/orientation-presentation",
          },
          {
            id: "orientation-checklist",
            name: "Orientation Checklist",
            path: "/employee/orientation-checklist",
          },
        ],
      },
      part4: {
        title: "Part 4: After Hire",
        forms: part4Forms,
      },
    };
  }, [isPCAEligible, applicationStatus, employmentType]);

  // Flatten all forms for status checking
  const applicationForms = useMemo(
    () => [
      ...formsByParts.part1.forms,
      ...formsByParts.part2.forms,
      ...formsByParts.part3.forms,
      ...formsByParts.part4.forms,
    ],
    [formsByParts]
  );

  // Helper function to get user data from JWT token
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

  // Check PCA eligibility (can be called multiple times to re-check)
  const checkPCAEligibility = async (forceRecheck = false) => {
    // Only skip if already checked AND not forcing a recheck
    if (pcaEligibilityChecked && !forceRecheck) return;

    try {
      const userData = getUserFromToken();
      const employeeId = userData?._id || userData?.id;

      if (!employeeId) return;

      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data?.data?.forms) {
        const forms = response.data.data.forms;
        const positionType = forms.positionType?.positionAppliedFor;
        const isEligible = positionType === "PCA";
        console.log(
          "[Sidebar] Position Type:",
          positionType,
          "isPCAEligible:",
          isEligible
        );
        setIsPCAEligible(isEligible);
        setPcaEligibilityChecked(true);
      }
    } catch (error) {
      console.error("[Sidebar] Error checking PCA eligibility:", error);
    }
  };

  // Fetch form completion status with debouncing (minimum 5 seconds between fetches)
  const fetchFormCompletionStatus = async (force = false) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;

    // Prevent multiple simultaneous calls and enforce minimum 5 second gap unless forced
    if (isLoadingFormStatus || (!force && timeSinceLastFetch < 5000)) {
      console.log("[Fetch] Skipped - too soon or already loading");
      return;
    }

    try {
      setIsLoadingFormStatus(true);
      setLastFetchTime(now);

      const userData = getUserFromToken();
      const employeeId = userData?._id || userData?.id;

      console.log("[Fetch] Employee ID:", employeeId);

      if (!employeeId) {
        console.log("[Fetch] No employee ID found");
        return;
      }

      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        {
          withCredentials: true,
        }
      );

      console.log("[Fetch] Response:", response.data);

      if (response.data && response.data.data) {
        const backendData = response.data.data;
        const forms = backendData.forms || {};

        console.log("[Fetch] Forms data:", forms);

        // Map form IDs to their completion status (true = completed, false = draft/incomplete, undefined = not started)
        const completionMap = {
          "personal-information": getFormStatus(forms.personalInformation),
          "professional-experience": getFormStatus(
            forms.professionalExperience
          ),
          education: getFormStatus(forms.education),
          references: getFormStatus(forms.references),
          "legal-disclosures": getFormStatus(forms.legalDisclosures),
          "work-experience": getFormStatus(forms.workExperience),
          "orientation-presentation": getFormStatus(
            forms.orientationPresentation
          ),

          "w4-form": getFormStatus(forms.w4Form),
          "w9-form": getFormStatus(forms.w9Form),
          "i9-form": getFormStatus(forms.i9Form),
          "emergency-contact": getFormStatus(forms.emergencyContact),
          "direct-deposit": getFormStatus(forms.directDeposit),
          "misconduct-form": getFormStatus(forms.misconductStatement),
          "code-of-ethics": getFormStatus(forms.codeOfEthics),
          "service-delivery-policies": getFormStatus(
            forms.serviceDeliveryPolicy
          ),
          "non-compete-agreement": getFormStatus(forms.nonCompeteAgreement),
          "orientation-checklist": getFormStatus(forms.orientationChecklist),
          "background-check": getFormStatus(forms.backgroundCheck),
          "cpr-first-aid-certificate": getCprCertificateStatus(
            forms.backgroundCheck
          ),
          "tb-symptom-screen": getFormStatus(forms.tbSymptomScreen),
          "driving-license": getFormStatus(forms.drivingLicense),
          "job-description-pca": getFormStatus(forms.jobDescriptionPCA),
          "job-description-cna": getFormStatus(forms.jobDescriptionCNA),
          "job-description-lpn": getFormStatus(forms.jobDescriptionLPN),
          "job-description-rn": getFormStatus(forms.jobDescriptionRN),
          "employee-details-upload": getFormStatus(forms.employeeDetailsUpload),
          "employment-type": !!backendData.application?.employmentType,
        };

        console.log("[Fetch] Completion map:", completionMap);

        // Get position type to check the correct job description field
        const positionType = forms.positionType?.positionAppliedFor;
        let jobDescStatus = undefined;
        
        if (positionType === "PCA") {
          jobDescStatus = getFormStatus(forms.jobDescriptionPCA);
        } else if (positionType === "CNA") {
          jobDescStatus = getFormStatus(forms.jobDescriptionCNA);
        } else if (positionType === "LPN") {
          jobDescStatus = getFormStatus(forms.jobDescriptionLPN);
        } else if (positionType === "RN") {
          jobDescStatus = getFormStatus(forms.jobDescriptionRN);
        }
        
        console.log("[Fetch] Position:", positionType, "Job Desc Status:", jobDescStatus);
        completionMap["job-description-pca"] = jobDescStatus;

        // Check for employee details upload (professional certificates)
        const professionalCertificatesStatus =
          backendData.application?.professionalCertificates &&
          Object.values(backendData.application.professionalCertificates).some(
            (arr) => arr && arr.length > 0
          );

        completionMap["employee-details-upload"] =
          professionalCertificatesStatus ? true : undefined;

        // Log summary
        const completedCount = Object.values(completionMap).filter(
          (v) => v === true
        ).length;
        console.log(`[Fetch] Summary: ${completedCount}/20 forms completed`);

        setFormCompletionStatus(completionMap);
        setApplicationStatus(
          backendData.application?.applicationStatus || "draft"
        );
        setEmploymentType(backendData.application?.employmentType || null);
      } else {
        console.log("[Fetch] No data in response");
      }
    } catch (error) {
      console.error("Error fetching form completion status:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setIsLoadingFormStatus(false);
    }
  };

  // Helper function to get form status (true = completed, false = draft/incomplete, undefined = not started)
  const getFormStatus = (formData) => {
    if (!formData) {
      return undefined; // Form not started
    }

    console.log(
      "[getFormStatus] Checking form:",
      formData._id,
      "Status:",
      formData.status
    );

    // Completed statuses - show green tick
    if (
      formData.status === "submitted" ||
      formData.status === "completed" ||
      formData.status === "under_review" ||
      formData.status === "approved"
    ) {
      console.log("[getFormStatus] ✓ Completed");
      return true;
    }

    // Draft status - show red cross (form started but not completed)
    if (formData.status === "draft") {
      console.log("[getFormStatus] ❌ Draft");
      return false;
    }

    console.log("[getFormStatus] Unknown status");
    return undefined; // Unknown status
  };

  // Helper function to get CPR certificate status (checks if cprFirstAidCertificate file exists)
  const getCprCertificateStatus = (backgroundCheckData) => {
    if (!backgroundCheckData) {
      return undefined; // Not started
    }

    // If CPR certificate file exists, it's completed
    if (backgroundCheckData.cprFirstAidCertificate) {
      console.log("[getCprCertificateStatus] ✓ Completed");
      return true;
    }

    // If background check form is started/completed but no CPR certificate, it's draft
    if (backgroundCheckData.status) {
      console.log("[getCprCertificateStatus] ❌ Draft");
      return false;
    }

    return undefined; // Not started
  };

  // Fetch form status only on component mount
  useEffect(() => {
    if (user && user.userRole === "employee" && !isLoadingFormStatus) {
      fetchFormCompletionStatus();
      checkPCAEligibility();
    }
  }, [user?.userRole]); // Only re-fetch if user role changes

  // Listen for position type updates to re-check PCA eligibility
  useEffect(() => {
    const handlePositionTypeUpdate = () => {
      console.log(
        "[Sidebar] Position type updated, re-checking PCA eligibility"
      );
      // Force recheck both form status and PCA eligibility
      fetchFormCompletionStatus(true);
      checkPCAEligibility(true);
    };

    const handleFormStatusUpdate = () => {
      console.log("[Sidebar] Form status updated, refreshing");
      fetchFormCompletionStatus(true);
    };

    // Listen for custom events
    window.addEventListener("positionTypeSaved", handlePositionTypeUpdate);
    window.addEventListener("formStatusUpdated", handleFormStatusUpdate);

    return () => {
      window.removeEventListener("positionTypeSaved", handlePositionTypeUpdate);
      window.removeEventListener("formStatusUpdated", handleFormStatusUpdate);
    };
  }, []);

  // Auto-refresh form completion status every 2 minutes for employees (reduced frequency)
  // COMMENTED OUT: Only fetch on component mount or when clicking My Applications
  // useEffect(() => {
  //   let interval;
  //   const isOnTaskManagement = location.pathname === "/employee/task-management";

  //   if (user && user.userRole === "employee" && !isOnTaskManagement) {
  //     interval = setInterval(() => {
  //       if (!isLoadingFormStatus) {
  //         fetchFormCompletionStatus(false); // Non-forced refresh
  //       }
  //     }, 120000); // 120 seconds (2 minutes)
  //   }
  //   return () => {
  //     if (interval) {
  //       clearInterval(interval);
  //     }
  //   };
  // }, [user?.userRole, isLoadingFormStatus, location.pathname]);

  // Auto-expand applications submenu when on form routes
  useEffect(() => {
    const currentPath = location.pathname;
    const isOnFormPage = applicationForms.some(
      (form) => form.path === currentPath
    );

    // Always expand submenu when on a form page
    if (isOnFormPage) {
      setIsApplicationsExpanded(true);

      // Also expand the relevant part
      Object.keys(formsByParts).forEach((partKey) => {
        const partForms = formsByParts[partKey].forms;
        const isInThisPart = partForms.some(
          (form) => form.path === currentPath
        );
        if (isInThisPart) {
          setExpandedParts((prev) => ({ ...prev, [partKey]: true }));
        }
      });

      // Reset the manual collapse flag when navigating to a form
      setHasUserCollapsedSubmenu(false);
    }
  }, [location.pathname, applicationForms, formsByParts]);

  // Helper function to render completion indicator
  const renderCompletionIndicator = (formId) => {
    const status = formCompletionStatus[formId];

    // Show green tick for completed forms
    if (status === true) {
      return (
        <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0 flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      );
    }

    // Show red cross for incomplete/draft forms
    if (status === false) {
      return (
        <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0 flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      );
    }

    return null;
  };

  const closeMobileMenu = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const getMenuItemClass = (path, index) => {
    const isActive = isActiveRoute(path);
    const isHovered = hoveredItem === index;

    if (isActive) {
      return `group bg-[#F5F5F5] w-full flex justify-start items-center p-3 md:p-3.5 cursor-pointer transition-all duration-200 relative ${
        isDesktopCollapsed ? "md:justify-center md:px-3" : ""
      }`;
    }

    if (isHovered) {
      return `group bg-white/30 w-full flex justify-start items-center p-3 md:p-3.5 cursor-pointer transition-all duration-200 relative ${
        isDesktopCollapsed ? "md:justify-center md:px-3" : ""
      }`;
    }

    return `group w-full flex justify-start items-center p-3 md:p-3.5 cursor-pointer transition-all duration-200 ${
      isDesktopCollapsed ? "md:justify-center md:px-3" : ""
    }`;
  };

  const getTextColorClass = (path, index) => {
    const isActive = isActiveRoute(path);

    if (isActive) {
      return "text-[#1F3A93]";
    }
    return "text-white";
  };

  const getIconColorClass = (path, index) => {
    const isActive = isActiveRoute(path);

    return isActive
      ? "[&_svg]:fill-[#1F3A93] [&_svg]:stroke-[#1F3A93]"
      : "[&_svg]:fill-white [&_svg]:stroke-white";
  };

  // Check if current path is a form page

  const checkUserRole = (role) => {
    switch (role) {
      case "employee":
        return (
          <>
            <div>
              <ul className="flex flex-col justify-center items-center w-full gap-0">
                <li
                  className={getMenuItemClass("/employee/dashboard", 0)}
                  onMouseEnter={() => setHoveredItem(0)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    to="/employee/dashboard"
                    className={`flex justify-start items-center gap-4 w-full ${
                      isDesktopCollapsed ? "md:justify-center" : ""
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span
                      className={getIconColorClass("/employee/dashboard", 0)}
                    >
                      <SliderBarHomeIcon />
                    </span>
                    <h4
                      className={`text-xs md:text-sm ${getTextColorClass(
                        "/employee/dashboard",
                        0
                      )} font-semibold block transition-all duration-200 ease-linear whitespace-nowrap tracking-wide ${
                        isDesktopCollapsed ? "md:hidden" : ""
                      }`}
                      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                    >
                      Overview
                    </h4>
                  </Link>
                  {isActiveRoute("/employee/dashboard") && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1F3A93] rounded-r-full" />
                  )}
                </li>
                <li
                  className={getMenuItemClass("/employee/personal-details", 1)}
                  onMouseEnter={() => setHoveredItem(1)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    to="/employee/personal-details"
                    className={`flex justify-start items-center gap-4 w-full ${
                      isDesktopCollapsed ? "md:justify-center" : ""
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span
                      className={getIconColorClass(
                        "/employee/personal-details",
                        1
                      )}
                    >
                      <PersonalDetailsIcon />
                    </span>
                    <h4
                      className={`text-xs md:text-sm ${getTextColorClass(
                        "/employee/personal-details",
                        1
                      )} font-semibold block transition-all duration-200 ease-linear whitespace-nowrap tracking-wide ${
                        isDesktopCollapsed ? "md:hidden" : ""
                      }`}
                      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                    >
                      Personal Details
                    </h4>
                  </Link>
                  {isActiveRoute("/employee/personal-details") && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1F3A93] rounded-r-full" />
                  )}
                </li>
                <li
                  className={getMenuItemClass("/employee/task-management", 2)}
                  onMouseEnter={() => setHoveredItem(2)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div
                    className={`flex justify-start items-center gap-4 w-full cursor-pointer ${
                      isDesktopCollapsed ? "md:justify-center" : ""
                    }`}
                    onClick={() => {
                      console.log("=== My Applications Clicked ===");

                      // Fetch fresh form status when clicking My Applications
                      fetchFormCompletionStatus(true); // Force refresh

                      // Navigate to task management
                      navigate("/employee/task-management");
                      closeMobileMenu();

                      // Toggle submenu expansion for desktop view
                      const newExpandedState = !isApplicationsExpanded;
                      setIsApplicationsExpanded(newExpandedState);

                      // Track if user manually collapsed the submenu
                      if (!newExpandedState) {
                        setHasUserCollapsedSubmenu(true);
                      } else {
                        setHasUserCollapsedSubmenu(false);
                      }
                    }}
                  >
                    <span
                      className={getIconColorClass(
                        "/employee/task-management",
                        2
                      )}
                    >
                      <TaskmanagementIcon />
                    </span>
                    <h4
                      className={`text-xs md:text-sm ${getTextColorClass(
                        "/employee/task-management",
                        2
                      )} font-semibold block transition-all duration-200 ease-linear whitespace-nowrap tracking-wide ${
                        isDesktopCollapsed ? "md:hidden" : ""
                      }`}
                      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                    >
                      My Applications
                    </h4>
                    {!isDesktopCollapsed && (
                      <svg
                        className={`w-4 h-4 ml-auto transition-transform duration-200 ${
                          isApplicationsExpanded ? "rotate-90" : ""
                        }`}
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
                    )}
                  </div>
                  {isActiveRoute("/employee/task-management") && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1F3A93] rounded-r-full" />
                  )}
                </li>

                {/* Applications Submenu with Parts */}
                {isApplicationsExpanded && !isDesktopCollapsed && (
                  <ul className="ml-4 space-y-1">
                    {Object.keys(formsByParts).map((partKey) => {
                      const part = formsByParts[partKey];
                      const isPartExpanded = expandedParts[partKey];

                      return (
                        <li key={partKey} className="space-y-1">
                          {/* Part Header */}
                          <div
                            className="group w-full flex justify-start items-center p-2 cursor-pointer transition-all duration-200 relative rounded-lg hover:bg-white/20"
                            onClick={() => {
                              setExpandedParts((prev) => ({
                                ...prev,
                                [partKey]: !prev[partKey],
                              }));
                            }}
                          >
                            <svg
                              className={`w-4 h-4 mr-2 transition-transform duration-200 text-white flex-shrink-0 ${
                                isPartExpanded ? "rotate-90" : ""
                              }`}
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
                            <h4
                              className="text-sm font-bold text-white whitespace-nowrap tracking-wider"
                              style={{
                                fontFamily: "Roboto, sans-serif",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {part.title}
                            </h4>
                          </div>

                          {/* Forms under this part */}
                          {isPartExpanded && (
                            <ul className="ml-6 space-y-1">
                              {part.forms.map((form, index) => (
                                <li
                                  key={form.id}
                                  className={`group w-full flex justify-start items-center p-2 cursor-pointer transition-all duration-200 relative rounded-lg ${
                                    isActiveRoute(form.path)
                                      ? "bg-[#F5F5F5]"
                                      : "hover:bg-white/20"
                                  }`}
                                  onMouseEnter={() =>
                                    setHoveredItem(`${partKey}-form-${index}`)
                                  }
                                  onMouseLeave={() => setHoveredItem(null)}
                                >
                                  <Link
                                    to={form.path}
                                    className="flex justify-start items-center gap-3 w-full"
                                    onClick={closeMobileMenu}
                                  >
                                    {renderCompletionIndicator(form.id)}
                                    {form.id === "training-video" && (
                                      <Video
                                        className={`w-4 h-4 flex-shrink-0 ${
                                          isActiveRoute(form.path)
                                            ? "text-[#1F3A93]"
                                            : "text-white"
                                        }`}
                                      />
                                    )}
                                    <h4
                                      className={`text-xs font-medium block transition-all duration-200 ease-linear whitespace-nowrap ${
                                        isActiveRoute(form.path)
                                          ? "text-[#1F3A93]"
                                          : "text-white"
                                      }`}
                                      style={{
                                        fontFamily:
                                          "Inter, system-ui, sans-serif",
                                      }}
                                    >
                                      {form.name}
                                    </h4>
                                  </Link>
                                  {isActiveRoute(form.path) && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#1F3A93] rounded-r-full" />
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
                <li
                  className={getMenuItemClass("/employee/communications", 3)}
                  onMouseEnter={() => setHoveredItem(3)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    to="/employee/communications"
                    className={`flex justify-start items-center gap-4 w-full ${
                      isDesktopCollapsed ? "md:justify-center" : ""
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span
                      className={getIconColorClass(
                        "/employee/communications",
                        3
                      )}
                    >
                      <CommunicationIcon />
                    </span>
                    <h4
                      className={`text-xs md:text-sm ${getTextColorClass(
                        "/employee/communications",
                        3
                      )} font-semibold block transition-all duration-200 ease-linear whitespace-nowrap tracking-wide ${
                        isDesktopCollapsed ? "md:hidden" : ""
                      }`}
                      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                    >
                      Communication
                    </h4>
                  </Link>
                  {isActiveRoute("/employee/communications") && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1F3A93] rounded-r-full" />
                  )}
                </li>
              </ul>
            </div>
          </>
        );
        break;
      case "admin":
        return (
          <>
            <div>
              <ul className="flex flex-col justify-center items-center w-full gap-0">
                <li
                  className={getMenuItemClass("/admin/dashboard", 0)}
                  onMouseEnter={() => setHoveredItem(0)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    to="/admin/dashboard"
                    className={`flex justify-start items-center gap-4 w-full ${
                      isDesktopCollapsed ? "md:justify-center" : ""
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span className={getIconColorClass("/admin/dashboard", 0)}>
                      <SliderBarHomeIcon />
                    </span>
                    <h4
                      className={`text-xs md:text-sm ${getTextColorClass(
                        "/admin/dashboard",
                        0
                      )} font-medium block transition-all duration-200 ease-linear whitespace-nowrap ${
                        isDesktopCollapsed ? "md:hidden" : ""
                      }`}
                    >
                      Overview
                    </h4>
                  </Link>
                  {isActiveRoute("/admin/dashboard") && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1F3A93] rounded-r-full" />
                  )}
                </li>
                <li
                  className={getMenuItemClass("/admin/user-management", 1)}
                  onMouseEnter={() => setHoveredItem(1)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    to="/admin/user-management"
                    className={`flex justify-start items-center gap-4 w-full ${
                      isDesktopCollapsed ? "md:justify-center" : ""
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span
                      className={getIconColorClass("/admin/user-management", 1)}
                    >
                      <SliderBarGroupIcon />
                    </span>
                    <h4
                      className={`text-xs md:text-sm ${getTextColorClass(
                        "/admin/user-management",
                        1
                      )} font-medium block transition-all duration-200 ease-linear whitespace-nowrap ${
                        isDesktopCollapsed ? "md:hidden" : ""
                      }`}
                    >
                      User Management
                    </h4>
                  </Link>
                  {isActiveRoute("/admin/user-management") && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1F3A93] rounded-r-full" />
                  )}
                </li>
                <li
                  className={getMenuItemClass("/admin/monitor-system", 2)}
                  onMouseEnter={() => setHoveredItem(2)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    to="/admin/monitor-system"
                    className={`flex justify-start items-center gap-4 w-full ${
                      isDesktopCollapsed ? "md:justify-center" : ""
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span
                      className={getIconColorClass("/admin/monitor-system", 2)}
                    >
                      <MonitorSystemIcon />
                    </span>
                    <h4
                      className={`text-xs md:text-sm ${getTextColorClass(
                        "/admin/monitor-system",
                        2
                      )} font-medium block transition-all duration-200 ease-linear whitespace-nowrap ${
                        isDesktopCollapsed ? "md:hidden" : ""
                      }`}
                    >
                      Monitor Tasks
                    </h4>
                  </Link>
                  {isActiveRoute("/admin/monitor-system") && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1F3A93] rounded-r-full" />
                  )}
                </li>
                <li
                  className={getMenuItemClass("/admin/communication", 3)}
                  onMouseEnter={() => setHoveredItem(3)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    to="/admin/communication"
                    className={`flex justify-start items-center gap-4 w-full ${
                      isDesktopCollapsed ? "md:justify-center" : ""
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span
                      className={getIconColorClass("/admin/communication", 3)}
                    >
                      <CommunicationIcon />
                    </span>
                    <h4
                      className={`text-xs md:text-sm ${getTextColorClass(
                        "/admin/communication",
                        3
                      )} font-medium block transition-all duration-200 ease-linear whitespace-nowrap ${
                        isDesktopCollapsed ? "md:hidden" : ""
                      }`}
                    >
                      Communication
                    </h4>
                  </Link>
                  {isActiveRoute("/admin/communication") && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1F3A93] rounded-r-full" />
                  )}
                </li>
                <li
                  className={getMenuItemClass("/admin/error-logs", 4)}
                  onMouseEnter={() => setHoveredItem(4)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    to="/admin/error-logs"
                    className={`flex justify-start items-center gap-4 w-full ${
                      isDesktopCollapsed ? "md:justify-center" : ""
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span className={getIconColorClass("/admin/error-logs", 4)}>
                      <ReportIcon />
                    </span>
                    <h4
                      className={`text-xs md:text-sm ${getTextColorClass(
                        "/admin/error-logs",
                        4
                      )} font-medium block transition-all duration-200 ease-linear whitespace-nowrap ${
                        isDesktopCollapsed ? "md:hidden" : ""
                      }`}
                    >
                      Error Logs
                    </h4>
                  </Link>
                  {isActiveRoute("/admin/error-logs") && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1F3A93] rounded-r-full" />
                  )}
                </li>
              </ul>
            </div>
          </>
        );
        break;
      case "hr":
        return (
          <>
            <div>
              <ul className="flex flex-col justify-center items-center w-full gap-0">
                <Link
                  to="/"
                  className={`flex justify-start items-center w-full ${
                    isDesktopCollapsed ? "md:justify-center" : ""
                  }`}
                  onClick={closeMobileMenu}
                >
                  <li
                    className={`${getMenuItemClass("/", 0)} gap-3`}
                    onMouseEnter={() => setHoveredItem(0)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className={getIconColorClass("/", 0)}>
                      <SliderBarHomeIcon />
                    </span>
                    <h4
                      className={`text-xs md:text-sm ${getTextColorClass(
                        "/",
                        0
                      )} font-medium block transition-all duration-200 ease-linear whitespace-nowrap ${
                        isDesktopCollapsed ? "md:hidden" : ""
                      }`}
                    >
                      Overview
                    </h4>

                    {isActiveRoute("/") && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1F3A93] rounded-r-full" />
                    )}
                  </li>
                </Link>

                <Link
                  to="/task-management"
                  className={`flex justify-start items-center gap-4 w-full ${
                    isDesktopCollapsed ? "md:justify-center" : ""
                  }`}
                  onClick={closeMobileMenu}
                >
                  <li
                    className={`${getMenuItemClass(
                      "/task-management",
                      1
                    )} gap-3`}
                    onMouseEnter={() => setHoveredItem(1)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className={getIconColorClass("/task-management", 1)}>
                      <CalendarIcon />
                    </span>
                    <h4
                      className={`text-xs md:text-sm ${getTextColorClass(
                        "/task-management",
                        1
                      )} font-medium block transition-all duration-200 ease-linear whitespace-nowrap ${
                        isDesktopCollapsed ? "md:hidden" : ""
                      }`}
                    >
                      Task Management
                    </h4>

                    {isActiveRoute("/task-management") && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1F3A93] rounded-r-full" />
                    )}
                  </li>
                </Link>

                <Link
                  to="/document-management"
                  className={`flex justify-start items-center gap-4 w-full ${
                    isDesktopCollapsed ? "md:justify-center" : ""
                  }`}
                  onClick={closeMobileMenu}
                >
                  <li
                    className={`${getMenuItemClass(
                      "/document-management",
                      2
                    )} gap-3`}
                    onMouseEnter={() => setHoveredItem(2)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span
                      className={getIconColorClass("/document-management", 2)}
                    >
                      <DocumentManagementIcon />
                    </span>
                    <h4
                      className={`text-xs md:text-sm ${getTextColorClass(
                        "/document-management",
                        2
                      )} font-medium block transition-all duration-200 ease-linear whitespace-nowrap ${
                        isDesktopCollapsed ? "md:hidden" : ""
                      }`}
                    >
                      Document Management
                    </h4>

                    {isActiveRoute("/document-management") && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1F3A93] rounded-r-full" />
                    )}
                  </li>
                </Link>

                <Link
                  to="/employee-directory"
                  className={`flex justify-start items-center gap-4 w-full ${
                    isDesktopCollapsed ? "md:justify-center" : ""
                  }`}
                  onClick={closeMobileMenu}
                >
                  <li
                    className={`${getMenuItemClass(
                      "/employee-directory",
                      3
                    )} gap-3`}
                    onMouseEnter={() => setHoveredItem(3)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span
                      className={getIconColorClass("/employee-directory", 3)}
                    >
                      <EmployeeDirectoryIcon />
                    </span>
                    <h4
                      className={`text-xs md:text-sm ${getTextColorClass(
                        "/employee-directory",
                        3
                      )} font-medium block transition-all duration-200 ease-linear whitespace-nowrap ${
                        isDesktopCollapsed ? "md:hidden" : ""
                      }`}
                    >
                      Employee Directory
                    </h4>

                    {isActiveRoute("/employee-directory") && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1F3A93] rounded-r-full" />
                    )}
                  </li>
                </Link>

                <Link
                  to="/hr/communication"
                  className={`flex justify-start items-center gap-4 w-full ${
                    isDesktopCollapsed ? "md:justify-center" : ""
                  }`}
                  onClick={closeMobileMenu}
                >
                  <li
                    className={`${getMenuItemClass(
                      "/hr/communication",
                      4
                    )} gap-3`}
                    onMouseEnter={() => setHoveredItem(4)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className={getIconColorClass("/hr/communication", 4)}>
                      <CommunicationIcon />
                    </span>
                    <h4
                      className={`text-xs md:text-sm ${getTextColorClass(
                        "/hr/communication",
                        4
                      )} font-medium block transition-all duration-200 ease-linear whitespace-nowrap ${
                        isDesktopCollapsed ? "md:hidden" : ""
                      }`}
                    >
                      Communication
                    </h4>

                    {isActiveRoute("/hr/communication") && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1F3A93] rounded-r-full" />
                    )}
                  </li>
                </Link>
              </ul>
            </div>
          </>
        );
        break;

      default:
        break;
    }
  };

  const handleLogout = () => {
    const session = Cookies.get("session");
    console.log("Session value:", session);
    Cookies.remove("session");
    sessionStorage.removeItem("hasAutoNavigated");
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 ${
          isDesktopCollapsed ? "w-20" : "w-64"
        } h-full flex flex-col bg-white z-50 transform transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div
          className={`flex ${
            isDesktopCollapsed ? "justify-center" : "justify-between"
          } items-center py-4 px-3 border-b border-[#BDC3C7] shadow-md relative h-[87px]`}
        >
          {!isDesktopCollapsed && (
            <div className="w-12 h-12 transition-all duration-300">
              <img
                src={SIDEBAR_LOGO_URL}
                alt="logo"
                className="object-contain w-full h-full"
              />
            </div>
          )}

          {/* Desktop Toggle Button - Inside the div when open */}
          <button
            onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            className={`hidden md:flex ${
              isDesktopCollapsed ? "" : "mr-2"
            } w-9 h-9 bg-white border border-gray-200 rounded-lg items-center justify-center hover:bg-gray-50 transition-all duration-200 shadow-sm text-gray-600 hover:text-gray-800`}
          >
            <HamburgerIcon isCollapsed={isDesktopCollapsed} />
          </button>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-600 hover:text-gray-800 p-1"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex flex-col justify-between bg-[#1F3A93] flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* User role based menu items */}
          {checkUserRole(user?.userRole)}

          <div className="flex flex-col gap-2 py-4">
            <button
              className={`group flex justify-start items-center gap-3 px-3 py-2.5 md:px-4 md:py-3 w-full hover:bg-white/10 transition-colors duration-200 ${
                isDesktopCollapsed ? "md:justify-center md:px-3" : ""
              }`}
              onMouseEnter={() => setHoveredItem("settings")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <SettingsIcon />
              <h4
                className={`text-xs md:text-sm text-white font-semibold block transition-all duration-200 ease-linear whitespace-nowrap tracking-wide ${
                  isDesktopCollapsed ? "md:hidden" : ""
                }`}
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Settings
              </h4>
            </button>
            <button
              onClick={() => handleLogout()}
              className={`group flex justify-start items-center gap-3 px-3 py-2.5 md:px-4 md:py-3 w-full transition-colors duration-200 ${
                isDesktopCollapsed ? "md:justify-center md:px-3" : ""
              }`}
              onMouseEnter={() => setHoveredItem("logout")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="flex justify-start items-center gap-3 px-3 py-2 rounded-lg w-full bg-[#DD3F3F] hover:bg-red-500">
                <LogoutIcon />
                <h4
                  className={`text-xs md:text-sm text-white font-semibold block transition-all duration-200 ease-linear whitespace-nowrap tracking-wide ${
                    isDesktopCollapsed ? "md:hidden" : ""
                  }`}
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  Log out
                </h4>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
