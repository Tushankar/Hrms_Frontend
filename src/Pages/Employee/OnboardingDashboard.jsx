import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  User,
  DollarSign,
  Shield,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  RotateCcw,
  GraduationCap,
  Heart,
  Briefcase,
} from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Cookies from "js-cookie";

const OnboardingDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [applicationId, setApplicationId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState("");

  const baseURL = import.meta.env.VITE__BASEURL;

  const getFormKeysForPosition = (positionType) => {
    const baseFormKeys = [
      "personal-information",
      "professional-experience",
      "work-experience",
      "education",
      "references",
      "legal-disclosures",
      "position-type",
      "employment-application",
      "orientation-presentation",
      "w4-form",
      "w9-form",
      "i9-form",
      "emergency-contact",
      "direct-deposit",
      "misconduct-form",
      "code-of-ethics",
      "service-delivery-policies",
      "non-compete-agreement",
      "background-check",
      "tb-symptom-screen",
      "orientation-checklist",
    ];

    switch (positionType) {
      case "PCA":
        return [
          ...baseFormKeys,
          "job-description-pca",
          "employee-details-upload",
          "pca-training-questions",
        ];
      case "CNA":
        return [
          ...baseFormKeys,
          "job-description-cna",
          "employee-details-upload",
        ];
      case "LPN":
        return [
          ...baseFormKeys,
          "job-description-lpn",
          "employee-details-upload",
        ];
      case "RN":
        return [
          ...baseFormKeys,
          "job-description-rn",
          "employee-details-upload",
        ];
      default:
        return baseFormKeys;
    }
  };

  const forms = [
    {
      id: "personal-information",
      name: "Personal Information",
      description: "Provide your basic personal information",
      icon: User,
      color: "blue",
      path: "/employee/personal-information",
      required: true,
    },
    {
      id: "professional-experience",
      name: "Professional Experience",
      description: "Share your professional background and skills",
      icon: Briefcase,
      color: "purple",
      path: "/employee/professional-experience",
      required: true,
    },
    {
      id: "work-experience",
      name: "Work Experience",
      description:
        "Provide your previous work experience and employment history",
      icon: Briefcase,
      color: "emerald",
      path: "/employee/work-experience",
      required: true,
    },
    {
      id: "education",
      name: "Education & Certificates",
      description: "Add your educational background and certifications",
      icon: GraduationCap,
      color: "indigo",
      path: "/employee/education",
      required: true,
    },
    {
      id: "references",
      name: "Professional References",
      description: "Provide professional references",
      icon: User,
      color: "teal",
      path: "/employee/references",
      required: true,
    },
    {
      id: "legal-disclosures",
      name: "Legal Disclosures & Consents",
      description: "Review and consent to legal disclosures",
      icon: Shield,
      color: "red",
      path: "/employee/legal-disclosures",
      required: true,
    },
    {
      id: "position-type",
      name: "Position Type",
      description: "Specify the position you are applying for",
      icon: Briefcase,
      color: "amber",
      path: "/employee/position-type",
      required: true,
    },
    {
      id: "employment-application",
      name: "Employment Application",
      description: "Complete your employment application",
      icon: FileText,
      color: "blue",
      path: "/employee/employment-application",
      required: true,
    },
    {
      id: "w4-form",
      name: "W-4 Tax Form",
      description: "Employee's Withholding Certificate for tax purposes",
      icon: DollarSign,
      color: "green",
      path: "/employee/w4-form",
      required: true,
    },
    {
      id: "w9-form",
      name: "W-9 Tax Form",
      description:
        "Request for Taxpayer Identification Number and Certification",
      icon: FileText,
      color: "purple",
      path: "/employee/w9-form",
      required: true,
    },
    {
      id: "i9-form",
      name: "I-9 Form",
      description: "Employment Eligibility Verification form",
      icon: Shield,
      color: "indigo",
      path: "/employee/i9-form",
      required: true,
    },
    {
      id: "emergency-contact",
      name: "Emergency Contact",
      description: "Provide emergency contact information",
      icon: Phone,
      color: "red",
      path: "/employee/emergency-contact",
      required: true,
    },
    {
      id: "direct-deposit",
      name: "Direct Deposit Form",
      description: "Set up direct deposit for payroll",
      icon: DollarSign,
      color: "yellow",
      path: "/employee/direct-deposit",
      required: true,
    },
    {
      id: "misconduct-form",
      name: "Staff Misconduct Statement",
      description: "Staff misconduct acknowledgment form",
      icon: AlertCircle,
      color: "orange",
      path: "/employee/misconduct-form",
      required: true,
    },
    {
      id: "code-of-ethics",
      name: "Code of Ethics",
      description: "Review and acknowledge code of ethics",
      icon: Heart,
      color: "pink",
      path: "/employee/code-of-ethics",
      required: true,
    },
    {
      id: "service-delivery-policies",
      name: "Service Delivery Policies",
      description: "Review service delivery policies",
      icon: FileText,
      color: "teal",
      path: "/employee/service-delivery-policies",
      required: true,
    },
    {
      id: "non-compete-agreement",
      name: "Compete Agreement",
      description: "Compete agreement acknowledgment",
      icon: Shield,
      color: "cyan",
      path: "/employee/non-compete-agreement",
      required: true,
    },
    {
      id: "background-check",
      name: "Background Check",
      description: "Download template, sign, and upload background check form",
      icon: Shield,
      color: "gray",
      path: "/employee/background-check-upload",
      required: true,
    },
    {
      id: "tb-symptom-screen",
      name: "TB or X-RAY Form",
      description: "TB or X-RAY screening form",
      icon: Heart,
      color: "rose",
      path: "/employee/edit-tb-symptom-screen-form",
      required: true,
    },
    {
      id: "orientation-checklist",
      name: "Orientation Checklist",
      description: "Complete orientation requirements checklist",
      icon: GraduationCap,
      color: "lime",
      path: "/employee/orientation-checklist",
      required: true,
    },
    {
      id: "job-description-pca",
      name: "PCA Job Description",
      description: "Personal Care Assistant job description",
      icon: FileText,
      color: "blue",
      path: "/employee/job-description-pca",
      required: true,
      positionSpecific: "PCA",
    },
    {
      id: "employee-details-upload",
      name: "Professional Certificate(s)",
      description: "Upload your professional certificates",
      icon: FileText,
      color: "indigo",
      path: "/employee/employee-details-upload",
      required: true,
    },
    {
      id: "pca-training-questions",
      name: "PCA Training Questions",
      description: "Complete PCA training questions (3 questions)",
      icon: GraduationCap,
      color: "blue",
      path: "/employee/pca-training-questions",
      required: true,
      positionSpecific: "PCA",
    },
    {
      id: "job-description-cna",
      name: "CNA Job Description",
      description: "Certified Nursing Assistant job description",
      icon: FileText,
      color: "green",
      path: "/employee/certified-nursing-assistant-form",
      required: true,
      positionSpecific: "CNA",
    },
    {
      id: "job-description-lpn",
      name: "LPN Job Description",
      description: "Licensed Practical Nurse job description",
      icon: FileText,
      color: "purple",
      path: "/employee/licensed-practical-nurse-form",
      required: true,
      positionSpecific: "LPN",
    },
    {
      id: "job-description-rn",
      name: "RN Job Description",
      description: "Registered Nurse job description",
      icon: FileText,
      color: "indigo",
      path: "/employee/registered-nurse-form",
      required: true,
      positionSpecific: "RN",
    },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token =
          Cookies.get("session") ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("session");
        const userInfo = JSON.parse(
          localStorage.getItem("userInfo") ||
            sessionStorage.getItem("user") ||
            "{}"
        );
        const empId = userInfo._id || userInfo.id;
        setEmployeeId(empId);

        if (empId) {
          const response = await fetch(
            `${baseURL}/onboarding/get-application/${empId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("🔍 Dashboard API Response:", data);
            console.log("🔍 Forms Data:", data.data?.forms);
            console.log(
              "🔍 Completed Forms Array:",
              data.data?.application?.completedForms
            );

            if (data.data?.application?._id) {
              setApplicationId(data.data.application._id);
              setApplicationData(data.data);

              // Get selected position type
              const positionType =
                data.data.forms?.positionType?.positionAppliedFor || "";
              console.log("🎯 Selected Position Type:", positionType);
              setSelectedPosition(positionType);

              // Log PCA Training Questions data
              if (positionType === "PCA") {
                console.log(
                  "📚 PCA Training Questions Data:",
                  data.data.forms?.pcaTrainingQuestions
                );
              }

              // Calculate completion percentage
              const formsData = data.data.forms || {};
              const completedSet = new Set(
                data.data.application?.completedForms || []
              );

              // Filter forms based on position type
              const relevantFormIds = getFormKeysForPosition(positionType);
              console.log(
                "🔑 Relevant Form IDs for position",
                positionType,
                ":",
                relevantFormIds
              );

              const relevantForms = forms.filter((form) =>
                relevantFormIds.includes(form.id)
              );
              console.log(
                "📝 Relevant Forms:",
                relevantForms.map((f) => f.id)
              );

              const totalForms = relevantForms.length;

              console.log("📊 Total Forms:", totalForms);
              console.log("📊 Completed Set:", Array.from(completedSet));

              // Check if PCA Training Questions is in the list
              const hasPCATraining = relevantForms.some(
                (f) => f.id === "pca-training-questions"
              );
              console.log(
                "🎓 Has PCA Training Questions in relevant forms:",
                hasPCATraining
              );

              const completedForms = relevantForms.filter((form) => {
                let formKey = form.id.replace(/-/g, "");
                if (form.id === "misconduct-form")
                  formKey = "misconductStatement";
                if (form.id === "non-compete-agreement")
                  formKey = "nonCompeteAgreement";
                if (form.id === "tb-symptom-screen")
                  formKey = "tbSymptomScreen";
                if (form.id === "position-type") formKey = "positionType";
                if (form.id === "orientation-presentation")
                  formKey = "orientationPresentation";
                if (form.id === "job-description-pca")
                  formKey = "jobDescriptionPCA";
                if (form.id === "employee-details-upload")
                  formKey = "employeeDetailsUpload";
                if (form.id === "pca-training-questions")
                  formKey = "pcaTrainingQuestions";
                if (form.id === "job-description-cna")
                  formKey = "jobDescriptionCNA";
                if (form.id === "job-description-lpn")
                  formKey = "jobDescriptionLPN";
                if (form.id === "job-description-rn")
                  formKey = "jobDescriptionRN";

                const formData = formsData[formKey];
                const isCompleted =
                  formData &&
                  (formData.status === "completed" ||
                    formData.status === "submitted" ||
                    formData.status === "under_review" ||
                    formData.status === "approved");
                const inCompletedSet = completedSet.has(formKey);

                console.log(
                  `📋 ${form.id} (${formKey}): formData=${!!formData}, status=${
                    formData?.status
                  }, inSet=${inCompletedSet}, result=${
                    isCompleted || inCompletedSet
                  }`
                );

                return isCompleted || inCompletedSet;
              }).length;

              console.log("✅ Completed Forms Count:", completedForms);

              setCompletedCount(completedForms);
              setCompletionPercentage(
                Math.round((completedForms / totalForms) * 100)
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getColorClasses = (color) => {
    const colorMap = {
      blue: "from-blue-500 to-blue-600",
      emerald: "from-emerald-500 to-emerald-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      indigo: "from-indigo-500 to-indigo-600",
      red: "from-red-500 to-red-600",
      yellow: "from-yellow-500 to-yellow-600",
      gray: "from-gray-500 to-gray-600",
      amber: "from-amber-500 to-amber-600",
      orange: "from-orange-500 to-orange-600",
      pink: "from-pink-500 to-pink-600",
      teal: "from-teal-500 to-teal-600",
      cyan: "from-cyan-500 to-cyan-600",
      lime: "from-lime-500 to-lime-600",
      rose: "from-rose-500 to-rose-600",
    };
    return colorMap[color] || "from-gray-500 to-gray-600";
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RotateCcw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">
              Loading your onboarding dashboard...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome to PHS Onboarding
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Complete all{" "}
                    {
                      forms.filter(
                        (f) =>
                          !f.positionSpecific ||
                          f.positionSpecific === selectedPosition
                      ).length
                    }{" "}
                    forms to finish your onboarding process
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Overall Progress</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {completionPercentage}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {completedCount}/
                    {
                      forms.filter(
                        (f) =>
                          !f.positionSpecific ||
                          f.positionSpecific === selectedPosition
                      ).length
                    }{" "}
                    Forms Completed
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Forms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {(() => {
              const filteredForms = forms.filter(
                (form) =>
                  !form.positionSpecific ||
                  form.positionSpecific === selectedPosition
              );
              console.log(
                "📋 Filtered Forms to Display:",
                filteredForms.map((f) => ({
                  id: f.id,
                  positionSpecific: f.positionSpecific,
                }))
              );
              console.log("👤 Current Selected Position:", selectedPosition);
              return filteredForms;
            })().map((form) => {
              const IconComponent = form.icon;

              return (
                <div
                  key={form.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${getColorClasses(
                          form.color
                        )} rounded-lg flex items-center justify-center`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-2">
                        {form.required && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {form.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {form.description}
                    </p>

                    <div className="flex items-center justify-between">
                      {(() => {
                        let formKey = form.id.replace(/-/g, "");
                        if (form.id === "misconduct-form")
                          formKey = "misconductStatement";
                        if (form.id === "non-compete-agreement")
                          formKey = "nonCompeteAgreement";
                        if (form.id === "tb-symptom-screen")
                          formKey = "tbSymptomScreen";
                        if (form.id === "job-description-pca")
                          formKey = "jobDescriptionPCA";
                        if (form.id === "employee-details-upload")
                          formKey = "employeeDetailsUpload";
                        if (form.id === "job-description-cna")
                          formKey = "jobDescriptionCNA";
                        if (form.id === "job-description-lpn")
                          formKey = "jobDescriptionLPN";
                        if (form.id === "job-description-rn")
                          formKey = "jobDescriptionRN";
                        if (form.id === "pca-training-questions")
                          formKey = "pcaTrainingQuestions";
                        const formData = applicationData?.forms?.[formKey];
                        const isCompleted =
                          formData &&
                          (formData.status === "completed" ||
                            formData.status === "submitted" ||
                            formData.status === "under_review" ||
                            formData.status === "approved");

                        return (
                          <>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                isCompleted
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                            >
                              {isCompleted ? "Completed" : "Not Started"}
                            </span>

                            <button
                              onClick={() =>
                                navigate(form.path, {
                                  state: { applicationId, employeeId },
                                })
                              }
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                              {isCompleted ? "View" : "Start"}
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Application */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to Submit?
              </h2>
              <p className="text-gray-600 mb-6">
                Complete all required forms above, then submit your onboarding
                application for HR review.
              </p>

              <button
                disabled={completionPercentage < 100}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5 mr-2" />
                Submit Application
              </button>

              {completionPercentage < 100 && (
                <p className="text-sm text-gray-500 mt-2">
                  Complete all required forms to enable submission
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OnboardingDashboard;
