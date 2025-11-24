import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Clock,
  AlertCircle,
  Download,
  MessageSquare,
  Save,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { Avatar } from "@mui/material";

const ApplicationReview = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [applicationForms, setApplicationForms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hrNotes, setHrNotes] = useState({});
  const [savingNotes, setSavingNotes] = useState({});
  const baseURL = import.meta.env.VITE__BASEURL;

  // Form configuration with descriptions and navigation paths
  const formsConfig = [
    {
      key: "personalInformation",
      name: "Personal Information",
      description: "Personal details and contact information",
      icon: <User className="w-5 h-5" />,
      color: "sky",
      hrViewPath: "/hr/form/personal-information",
    },
    {
      key: "professionalExperience",
      name: "Professional Experience",
      description: "Professional background and experience",
      icon: <Briefcase className="w-5 h-5" />,
      color: "fuchsia",
      hrViewPath: "/hr/form/professional-experience",
    },
    {
      key: "workExperience",
      name: "Work Experience",
      description: "Previous work history",
      icon: <Briefcase className="w-5 h-5" />,
      color: "teal",
      hrViewPath: "/hr/form/work-experience",
    },
    {
      key: "education",
      name: "Education",
      description: "Educational background and qualifications",
      icon: <FileText className="w-5 h-5" />,
      color: "emerald",
      hrViewPath: "/hr/form/education",
    },
    {
      key: "references",
      name: "References",
      description: "Professional references",
      icon: <User className="w-5 h-5" />,
      color: "orange",
      hrViewPath: "/hr/form/references",
    },
    {
      key: "legalDisclosures",
      name: "Legal Disclosures",
      description: "Legal disclosures and acknowledgments",
      icon: <FileText className="w-5 h-5" />,
      color: "red",
      hrViewPath: "/hr/form/legal-disclosures",
    },

    {
      key: "w4Form",
      name: "W-4 Tax Form",
      description: "Employee's Withholding Certificate",
      icon: <FileText className="w-5 h-5" />,
      color: "green",
      hrViewPath: "/hr/form/w4-form",
    },
    {
      key: "w9Form",
      name: "W-9 Tax Form",
      description: "Taxpayer Identification Number and Certification",
      icon: <FileText className="w-5 h-5" />,
      color: "purple",
      hrViewPath: "/hr/form/w9-form",
    },
    {
      key: "i9Form",
      name: "I-9 Form",
      description: "Employment Eligibility Verification",
      icon: <FileText className="w-5 h-5" />,
      color: "indigo",
      hrViewPath: "/hr/form/i9-form",
    },
    {
      key: "emergencyContact",
      name: "Emergency Contact",
      description: "Emergency contact information",
      icon: <Phone className="w-5 h-5" />,
      color: "red",
      hrViewPath: "/hr/form/emergency-contact",
    },
    {
      key: "directDeposit",
      name: "Direct Deposit Form",
      description: "Banking information for payroll",
      icon: <Briefcase className="w-5 h-5" />,
      color: "yellow",
      hrViewPath: "/hr/form/direct-deposit",
    },
    {
      key: "misconductStatement",
      name: "Staff Statement of Misconduct",
      description: "Disclosure of criminal history or misconduct",
      icon: <AlertCircle className="w-5 h-5" />,
      color: "orange",
      hrViewPath: "/hr/form/misconduct-statement",
    },
    {
      key: "codeOfEthics",
      name: "Code of Ethics",
      description: "Company ethical standards acknowledgment",
      icon: <FileText className="w-5 h-5" />,
      color: "teal",
      hrViewPath: "/hr/form/code-of-ethics",
    },
    {
      key: "serviceDeliveryPolicy",
      name: "Service Delivery Policies",
      description: "Service delivery standards acknowledgment",
      icon: <FileText className="w-5 h-5" />,
      color: "cyan",
      hrViewPath: "/hr/form/service-delivery-policies",
    },
    {
      key: "nonCompeteAgreement",
      name: "Non-Compete Agreement",
      description: "Non-compete and confidentiality agreement",
      icon: <FileText className="w-5 h-5" />,
      color: "pink",
      hrViewPath: "/hr/form/non-compete-agreement",
    },
    {
      key: "backgroundCheck",
      name: "Background Check Form",
      description: "Background verification authorization",
      icon: <FileText className="w-5 h-5" />,
      color: "gray",
      hrViewPath: "/hr/form/background-check",
    },
    {
      key: "tbSymptomScreen",
      name: "TB Symptom Screen",
      description: "Tuberculosis screening questionnaire",
      icon: <FileText className="w-5 h-5" />,
      color: "emerald",
      hrViewPath: "/hr/form/tb-symptom-screen",
    },
    {
      key: "orientationChecklist",
      name: "Orientation Checklist",
      description: "Employee orientation requirements",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "lime",
      hrViewPath: "/hr/form/orientation-checklist",
    },
    {
      key: "orientationPresentation",
      name: "Orientation Presentation",
      description: "Orientation training completion",
      icon: <FileText className="w-5 h-5" />,
      color: "blue",
      hrViewPath: "/hr/orientation-presentation",
    },
    {
      key: "jobDescriptionPCA",
      name: "Job Description",
      description: "Position-specific job description",
      icon: <Briefcase className="w-5 h-5" />,
      color: "violet",
      hrViewPath: "/hr/form/job-description-pca",
    },

  ];

  // Fetch application data
  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        setLoading(true);

        // First get the application basic info
        const appResponse = await axios.get(
          `${baseURL}/onboarding/get-all-applications`,
          {
            withCredentials: true,
          }
        );

        if (appResponse.data?.applications) {
          const foundApp = appResponse.data.applications.find(
            (app) => app._id === applicationId
          );

          if (foundApp) {
            setApplication(foundApp);

            // Now get detailed form data using employeeId
            const formsResponse = await axios.get(
              `${baseURL}/onboarding/get-application/${foundApp.employeeId._id}`,
              {
                withCredentials: true,
              }
            );

            if (formsResponse.data?.data?.forms) {
              setApplicationForms(formsResponse.data.data.forms);
              
              // Initialize HR notes from existing feedback
              const initialNotes = {};
              Object.keys(formsResponse.data.data.forms).forEach(key => {
                const form = formsResponse.data.data.forms[key];
                if (form?.hrFeedback?.comment) {
                  initialNotes[key] = form.hrFeedback.comment;
                }
              });
              setHrNotes(initialNotes);
            }
          } else {
            toast.error("Application not found");
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Error fetching application data:", error);
        toast.error("Failed to load application data");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchApplicationData();
    }
  }, [applicationId, navigate]);

  // Handle application status update
  const handleStatusUpdate = async (status) => {
    try {
      setUpdating(true);

      const applicationStatus = status === "approve" ? "approved" : "rejected";
      const response = await axios.put(
        `${baseURL}/onboarding/update-status/${applicationId}`,
        {
          status: applicationStatus,
          reviewComments: `Application ${applicationStatus} by HR`,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data?.application) {
        if (status === "approve") {
          toast.success(
            `✅ Application approved for ${application.employeeId.userName}!`,
            {
              style: {
                background: "#10B981",
                color: "white",
                fontWeight: "bold",
                borderRadius: "12px",
                padding: "16px 24px",
              },
              duration: 4000,
            }
          );
        } else {
          toast.success(
            `❌ Application rejected for ${application.employeeId.userName}`,
            {
              style: {
                background: "#EF4444",
                color: "white",
                fontWeight: "bold",
                borderRadius: "12px",
                padding: "16px 24px",
              },
              duration: 4000,
            }
          );
        }

        // Navigate back to dashboard
        navigate("/");
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Failed to update application status");
    } finally {
      setUpdating(false);
    }
  };

  // Get form status and styling
  const getFormStatus = (form) => {
    if (!form) return { status: "Not Started", color: "gray" };

    switch (form.status) {
      case "submitted":
        return { status: "Completed", color: "green" };
      case "draft":
        return { status: "In Progress", color: "yellow" };
      default:
        return { status: "Not Started", color: "gray" };
    }
  };

  // Handle HR notes save
  const handleSaveNote = async (formKey, formName) => {
    const note = hrNotes[formKey]?.trim();
    if (!note) {
      toast.error("Please enter a note before saving");
      return;
    }

    try {
      setSavingNotes(prev => ({ ...prev, [formKey]: true }));

      const endpoint = formKey.replace(/([A-Z])/g, '-$1').toLowerCase();
      const response = await axios.post(
        `${baseURL}/onboarding/save-${endpoint}`,
        {
          employeeId: application.employeeId._id,
          hrFeedback: {
            comment: note,
            reviewedAt: new Date()
          }
        },
        { withCredentials: true }
      );

      if (response.data) {
        toast.success(`Note saved for ${formName}`);
        // Refresh form data
        const formsResponse = await axios.get(
          `${baseURL}/onboarding/get-application/${application.employeeId._id}`,
          { withCredentials: true }
        );
        if (formsResponse.data?.data?.forms) {
          setApplicationForms(formsResponse.data.data.forms);
        }
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    } finally {
      setSavingNotes(prev => ({ ...prev, [formKey]: false }));
    }
  };

  const getColorClasses = (color, isCompleted) => {
    const colors = {
      blue: isCompleted
        ? "bg-blue-50 border-blue-200 text-blue-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      green: isCompleted
        ? "bg-green-50 border-green-200 text-green-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      purple: isCompleted
        ? "bg-purple-50 border-purple-200 text-purple-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      indigo: isCompleted
        ? "bg-indigo-50 border-indigo-200 text-indigo-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      red: isCompleted
        ? "bg-red-50 border-red-200 text-red-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      yellow: isCompleted
        ? "bg-yellow-50 border-yellow-200 text-yellow-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      orange: isCompleted
        ? "bg-orange-50 border-orange-200 text-orange-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      teal: isCompleted
        ? "bg-teal-50 border-teal-200 text-teal-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      cyan: isCompleted
        ? "bg-cyan-50 border-cyan-200 text-cyan-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      pink: isCompleted
        ? "bg-pink-50 border-pink-200 text-pink-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      gray: isCompleted
        ? "bg-gray-50 border-gray-200 text-gray-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      emerald: isCompleted
        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      lime: isCompleted
        ? "bg-lime-50 border-lime-200 text-lime-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      violet: isCompleted
        ? "bg-violet-50 border-violet-200 text-violet-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      rose: isCompleted
        ? "bg-rose-50 border-rose-200 text-rose-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      amber: isCompleted
        ? "bg-amber-50 border-amber-200 text-amber-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      slate: isCompleted
        ? "bg-slate-50 border-slate-200 text-slate-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      sky: isCompleted
        ? "bg-sky-50 border-sky-200 text-sky-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
      fuchsia: isCompleted
        ? "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900"
        : "bg-gray-50 border-gray-200 text-gray-600",
    };

    return colors[color] || colors.gray;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading application details...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!application || !applicationForms) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Application not found</p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex items-center gap-4">
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    {application.employeeId.userName.charAt(0).toUpperCase()}
                  </Avatar>

                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {application.employeeId.userName}'s Application
                    </h1>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {application.employeeId.email}
                      </div>
                      {application.employeeId.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {application.employeeId.phoneNumber}
                        </div>
                      )}
                      {application.employeeId.position && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {application.employeeId.position}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    application.applicationStatus === "submitted"
                      ? "bg-yellow-100 text-yellow-800"
                      : application.applicationStatus === "approved"
                      ? "bg-green-100 text-green-800"
                      : application.applicationStatus === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {application.applicationStatus === "submitted"
                    ? "Pending Review"
                    : application.applicationStatus.charAt(0).toUpperCase() +
                      application.applicationStatus.slice(1)}
                </span>

                <div className="text-right text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Submitted:{" "}
                    {new Date(
                      application.submittedAt || application.createdAt
                    ).toLocaleDateString()}
                  </div>
                  {application.reviewedAt && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-4 h-4" />
                      Reviewed:{" "}
                      {new Date(application.reviewedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Overview */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {
                    formsConfig.filter((config) => {
                      let form = applicationForms[config.key];
                      if (config.key === "jobDescriptionPCA") {
                        form = applicationForms.jobDescriptionPCA || applicationForms.jobDescriptionCNA || applicationForms.jobDescriptionLPN || applicationForms.jobDescriptionRN;
                      }
                      return form && (form.status === "submitted" || form.status === "completed");
                    }).length
                  }
                </div>
                <div className="text-sm text-gray-600">Forms Submitted</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {application.completionPercentage || 0}%
                </div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formsConfig.length}
                </div>
                <div className="text-sm text-gray-600">Total Forms</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {Math.ceil(
                    (Date.now() -
                      new Date(
                        application.submittedAt || application.createdAt
                      ).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Days Since Submitted
                </div>
              </div>
            </div>
          </div>

          {/* Forms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {formsConfig.map((formConfig) => {
              let form = applicationForms[formConfig.key];
              if (formConfig.key === "jobDescriptionPCA") {
                form = applicationForms.jobDescriptionPCA || applicationForms.jobDescriptionCNA || applicationForms.jobDescriptionLPN || applicationForms.jobDescriptionRN;
              }
              const formStatus = getFormStatus(form);
              const isCompleted = form && form.status === "submitted";

              return (
                <div
                  key={formConfig.key}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getColorClasses(
                    formConfig.color,
                    isCompleted
                  )}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isCompleted
                            ? `bg-${formConfig.color}-100`
                            : "bg-gray-100"
                        }`}
                      >
                        {formConfig.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">
                          {formConfig.name}
                        </h3>
                        <p className="text-xs opacity-75 mt-1">
                          {formConfig.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        formStatus.color === "green"
                          ? "bg-green-100 text-green-800"
                          : formStatus.color === "yellow"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {formStatus.status}
                    </span>

                    {form && (
                      <button
                        onClick={() => {
                          const employeeId = application?.employeeId?._id;
                          if (!employeeId) {
                            toast.error("Employee ID not found");
                            return;
                          }
                          if (formConfig.hrViewPath) {
                            navigate(`${formConfig.hrViewPath}/${employeeId}`);
                          } else {
                            toast.info(`Form viewer not available for ${formConfig.name}`);
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    )}
                  </div>

                  {form && form.updatedAt && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                      Last updated:{" "}
                      {new Date(form.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* HR Notes Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">HR Notes & Feedback</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">Add notes or feedback for each form. These notes are saved with the form data.</p>
            
            <div className="space-y-4">
              {formsConfig.map((formConfig) => {
                let form = applicationForms[formConfig.key];
                if (formConfig.key === "jobDescriptionPCA") {
                  form = applicationForms.jobDescriptionPCA || applicationForms.jobDescriptionCNA || applicationForms.jobDescriptionLPN || applicationForms.jobDescriptionRN;
                }
                
                if (!form) return null;

                return (
                  <div key={formConfig.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-${formConfig.color}-100`}>
                        {formConfig.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{formConfig.name}</h4>
                        {form.hrFeedback?.reviewedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last reviewed: {new Date(form.hrFeedback.reviewedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <textarea
                      value={hrNotes[formConfig.key] || ''}
                      onChange={(e) => setHrNotes(prev => ({ ...prev, [formConfig.key]: e.target.value }))}
                      placeholder={`Add notes or feedback for ${formConfig.name}...`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      rows="3"
                    />
                    
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleSaveNote(formConfig.key, formConfig.name)}
                        disabled={savingNotes[formConfig.key]}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        {savingNotes[formConfig.key] ? 'Saving...' : 'Save Note'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          {application.applicationStatus === "submitted" && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Review Actions
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => handleStatusUpdate("approve")}
                  disabled={updating}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {updating ? "Approving..." : "Approve Application"}
                </button>

                <button
                  onClick={() => handleStatusUpdate("reject")}
                  disabled={updating}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  {updating ? "Rejecting..." : "Reject Application"}
                </button>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Review Checklist:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Verify all required forms are completed</li>
                      <li>Check personal information accuracy</li>
                      <li>Validate employment eligibility documentation</li>
                      <li>Review background check and TB screening results</li>
                      <li>Ensure all signatures are present and valid</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ApplicationReview;
