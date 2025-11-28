import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  AlertTriangle,
  Stethoscope,
  Target,
  FileText,
  RotateCcw,
} from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import toast from "react-hot-toast";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";
import axios from "axios";
import Cookies from "js-cookie";

const SymptomScreenForm = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dateOfBirth: "",
    lastSkinTest: "",
    testDate: "",
    results: "",
    positive: false,
    negative: false,
    chestXRayNormal: false,
    chestXRayAbnormal: false,
    treatedLTBI: "",
    ltbiMonths: "",
    treatedTBDisease: "",
    tbDiseaseMonths: "",
    whenTreated: "",
    whereTreated: "",
    medications: "",
    todaysDate: "",
    cough: false,
    coughDays: "",
    coughWeeks: "",
    coughMonths: "",
    mucusColor: "",
    coughingBlood: false,
    nightSweats: false,
    fevers: false,
    weightLoss: false,
    weightLossPounds: "",
    tiredWeak: false,
    tiredWeakDays: "",
    tiredWeakWeeks: "",
    tiredWeakMonths: "",
    chestPain: false,
    chestPainDays: "",
    chestPainWeeks: "",
    chestPainMonths: "",
    shortnessBreath: false,
    shortnessBreathDays: "",
    shortnessBreathWeeks: "",
    shortnessBreathMonths: "",
    knowAnyone: false,
    contactName: "",
    contactAddress: "",
    contactPhone: "",
    // Action taken checkboxes
    noActiveTB: false,
    xrayNotNeeded: false,
    discussedSymptoms: false,
    clientKnows: false,
    furtherActionNeeded: false,
    isolated: false,
    surgicalMask: false,
    xrayNeeded: false,
    sputumSamples: false,
    referredTo: false,
    referredToText: "",
    other: false,
    otherText: "",
    assessmentSignature: "",
    clientSignature: "",
    signatureDate: "",
    hrFeedback: null,
    status: null,
  });
  const [applicationStatus, setApplicationStatus] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formStatus, setFormStatus] = useState("draft");
  const [hrFeedback, setHrFeedback] = useState(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie
        ? JSON.parse(userCookie)
        : { _id: "67e0f8770c6feb6ba99d11d2" };

      const response = await axios.get(
        `https://api-hrms-backend.kyptronix.us/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      if (response.data?.data?.application) {
        const forms = response.data.data.forms;
        setApplicationStatus(forms);

        // Load TB Symptom Screen form status and HR feedback
        if (forms.tbSymptomScreen) {
          setFormData(forms.tbSymptomScreen);
          setFormStatus(forms.tbSymptomScreen.status || "draft");
          setHrFeedback(forms.tbSymptomScreen.hrFeedback || null);
        }

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

        const completedFormsArray =
          response.data.data.application?.completedForms || [];
        const completedSet = new Set(completedFormsArray);

        const completedForms = formKeys.filter((key) => {
          const form = forms[key];
          return (
            form &&
            (form.status === "completed" ||
              form.status === "submitted" ||
              form.employeeUploadedForm ||
              completedSet.has(key) ||
              (key === "employmentType" &&
                response.data.data.application.employmentType))
          );
        }).length;

        const progressPercentage = Math.round((completedForms / 25) * 100);
        setOverallProgress(progressPercentage);
      }
    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // Show saving state and toast, then navigate
    setSaving(true);
    toast.success("TB Symptom Screen Form saved successfully!", {
      style: {
        background: "#10B981",
        color: "white",
        fontWeight: "bold",
        borderRadius: "8px",
        padding: "12px 20px",
      },
      duration: 1500,
    });

    setTimeout(() => {
      setSaving(false);
      navigate("/employee/i9-form");
    }, 1500);
  };

  return (
    <Layout>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] to-[#F0F5FF] p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => navigate("/employee/task-management")}
              className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base font-medium w-auto"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Back to Tasks</span>
              <span className="xs:hidden">Back</span>
            </button>
          </div>

          {/* HR Feedback Section */}
          <HRFeedback hrFeedback={hrFeedback} formStatus={formStatus} />

          {/* Status Banner */}
          <div
            className={`mb-6 p-4 rounded-lg border ${
              formData.assessmentSignature && formData.clientSignature
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              {formData.assessmentSignature && formData.clientSignature ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div>
                {formData.assessmentSignature && formData.clientSignature ? (
                  <>
                    <p className="text-base font-semibold text-green-800">
                      ✅ Progress Updated - Form Completed Successfully
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      You cannot make any changes to the form until HR provides
                      their feedback.
                    </p>
                  </>
                ) : (
                  <p className="text-base font-semibold text-red-800">
                    ⚠️ Not filled yet - Sign the form to complete your progress
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white text-center py-6 sm:py-8 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-3 sm:mb-4">
                <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-0 sm:mr-3" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-center">
                  TB or X-RAY Form
                </h2>
                <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 mt-2 sm:mt-0 sm:ml-3 hidden sm:block" />
              </div>
              <p className="text-blue-100 text-sm sm:text-base">
                Health Assessment & Screening Form
              </p>
              {taskId && (
                <p className="text-sm sm:text-base opacity-90 mt-1">
                  Task ID: {taskId}
                </p>
              )}
            </div>

            <div className="p-4 sm:p-6 md:p-8 lg:p-12 space-y-6 sm:space-y-8">
              {/* Personal Information Section */}
              <div className="bg-[#F8FAFF] p-6 rounded-xl border border-[#E8EDFF]">
                <h3 className="text-lg sm:text-xl font-bold text-[#1F3A93] mb-4 sm:mb-6 flex items-center">
                  <span className="bg-[#1F3A93] text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3 flex-shrink-0">
                    1
                  </span>
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full h-10 sm:h-12 px-3 sm:px-4 border-2 rounded-lg border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-200"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      className="w-full h-10 sm:h-12 px-3 sm:px-4 border-2 rounded-lg border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="mt-4 sm:mt-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    Gender
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="M"
                        checked={formData.gender === "M"}
                        onChange={() => handleInputChange("gender", "M")}
                        className="w-5 h-5 text-[#1F3A93] border-2 border-gray-300 focus:ring-2 focus:ring-[#1F3A93]/20"
                      />
                      <span className="ml-2 text-gray-700">Male</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="F"
                        checked={formData.gender === "F"}
                        onChange={() => handleInputChange("gender", "F")}
                        className="w-5 h-5 text-[#1F3A93] border-2 border-gray-300 focus:ring-2 focus:ring-[#1F3A93]/20"
                      />
                      <span className="ml-2 text-gray-700">Female</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* TB Testing History */}
              <div className="bg-[#FFF9E6] p-6 rounded-xl border border-orange-200">
                <h3 className="text-xl font-bold text-[#1F3A93] mb-6 flex items-center">
                  <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                    2
                  </span>
                  TB Testing History
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Skin Test Location
                    </label>
                    <input
                      type="text"
                      value={formData.lastSkinTest}
                      onChange={(e) =>
                        handleInputChange("lastSkinTest", e.target.value)
                      }
                      className="w-full h-12 px-4 border-2 rounded-lg border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-base transition-all duration-200"
                      placeholder="Name, address, city, state, zip, and phone number of place where test was given"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Date
                      </label>
                      <input
                        type="date"
                        value={formData.testDate}
                        onChange={(e) =>
                          handleInputChange("testDate", e.target.value)
                        }
                        className="w-full h-12 px-4 border-2 rounded-lg border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-base transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Results (mm)
                      </label>
                      <input
                        type="number"
                        value={formData.results}
                        onChange={(e) =>
                          handleInputChange("results", e.target.value)
                        }
                        className="w-full h-12 px-4 border-2 rounded-lg border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-base transition-all duration-200"
                        placeholder="Enter result in mm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Test Result
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.positive}
                            onChange={(e) =>
                              handleInputChange("positive", e.target.checked)
                            }
                            className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-green-500/20"
                          />
                          <span className="ml-2 text-gray-700">Positive</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.negative}
                            onChange={(e) =>
                              handleInputChange("negative", e.target.checked)
                            }
                            className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-red-500/20"
                          />
                          <span className="ml-2 text-gray-700">Negative</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Chest X-Ray
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.chestXRayNormal}
                            onChange={(e) =>
                              handleInputChange(
                                "chestXRayNormal",
                                e.target.checked
                              )
                            }
                            className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-green-500/20"
                          />
                          <span className="ml-2 text-gray-700">Normal</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.chestXRayAbnormal}
                            onChange={(e) =>
                              handleInputChange(
                                "chestXRayAbnormal",
                                e.target.checked
                              )
                            }
                            className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-red-500/20"
                          />
                          <span className="ml-2 text-gray-700">Abnormal</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Symptoms */}
              <div className="bg-[#FEF7F0] p-6 rounded-xl border border-red-200">
                <h3 className="text-xl font-bold text-[#1F3A93] mb-6 flex items-center">
                  <span className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                    3
                  </span>
                  Current Symptoms Assessment
                </h3>

                <div className="space-y-6">
                  {/* Cough */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="cough"
                        checked={formData.cough}
                        onChange={(e) =>
                          handleInputChange("cough", e.target.checked)
                        }
                        className="w-5 h-5 text-[#1F3A93] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#1F3A93]/20"
                      />
                      <label
                        htmlFor="cough"
                        className="ml-3 text-base font-medium text-gray-700"
                      >
                        Do you have a cough?
                      </label>
                    </div>

                    {formData.cough && (
                      <div className="ml-8 space-y-4 bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Days
                            </label>
                            <input
                              type="number"
                              value={formData.coughDays}
                              onChange={(e) =>
                                handleInputChange("coughDays", e.target.value)
                              }
                              className="w-full h-10 px-3 border rounded-lg border-gray-300 focus:border-[#1F3A93] focus:outline-none"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Weeks
                            </label>
                            <input
                              type="number"
                              value={formData.coughWeeks}
                              onChange={(e) =>
                                handleInputChange("coughWeeks", e.target.value)
                              }
                              className="w-full h-10 px-3 border rounded-lg border-gray-300 focus:border-[#1F3A93] focus:outline-none"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Months
                            </label>
                            <input
                              type="number"
                              value={formData.coughMonths}
                              onChange={(e) =>
                                handleInputChange("coughMonths", e.target.value)
                              }
                              className="w-full h-10 px-3 border rounded-lg border-gray-300 focus:border-[#1F3A93] focus:outline-none"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Mucus Color
                            </label>
                            <input
                              type="text"
                              value={formData.mucusColor}
                              onChange={(e) =>
                                handleInputChange("mucusColor", e.target.value)
                              }
                              className="w-full h-10 px-3 border rounded-lg border-gray-300 focus:border-[#1F3A93] focus:outline-none"
                              placeholder="Clear, yellow, green, etc."
                            />
                          </div>
                          <div className="flex items-center pt-6">
                            <input
                              type="checkbox"
                              id="coughingBlood"
                              checked={formData.coughingBlood}
                              onChange={(e) =>
                                handleInputChange(
                                  "coughingBlood",
                                  e.target.checked
                                )
                              }
                              className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-red-500/20"
                            />
                            <label
                              htmlFor="coughingBlood"
                              className="ml-2 text-sm text-gray-700"
                            >
                              Coughing up blood
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Other Symptoms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: "nightSweats", label: "Night sweats" },
                      { key: "fevers", label: "Fevers" },
                      { key: "tiredWeak", label: "Tired or weak" },
                      { key: "chestPain", label: "Chest pain" },
                      { key: "shortnessBreath", label: "Shortness of breath" },
                      {
                        key: "weightLoss",
                        label: "Weight loss without trying",
                      },
                    ].map(({ key, label }) => (
                      <div
                        key={key}
                        className="p-4 bg-white rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center mb-3">
                          <input
                            type="checkbox"
                            id={key}
                            checked={formData[key]}
                            onChange={(e) =>
                              handleInputChange(key, e.target.checked)
                            }
                            className="w-5 h-5 text-[#1F3A93] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#1F3A93]/20"
                          />
                          <label
                            htmlFor={key}
                            className="ml-3 text-base font-medium text-gray-700"
                          >
                            {label}
                          </label>
                        </div>

                        {formData[key] &&
                          [
                            "tiredWeak",
                            "chestPain",
                            "shortnessBreath",
                          ].includes(key) && (
                            <div className="ml-8 grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Days
                                </label>
                                <input
                                  type="number"
                                  value={formData[`${key}Days`]}
                                  onChange={(e) =>
                                    handleInputChange(
                                      `${key}Days`,
                                      e.target.value
                                    )
                                  }
                                  className="w-full h-8 px-2 text-sm border rounded border-gray-300 focus:border-[#1F3A93] focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Weeks
                                </label>
                                <input
                                  type="number"
                                  value={formData[`${key}Weeks`]}
                                  onChange={(e) =>
                                    handleInputChange(
                                      `${key}Weeks`,
                                      e.target.value
                                    )
                                  }
                                  className="w-full h-8 px-2 text-sm border rounded border-gray-300 focus:border-[#1F3A93] focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Months
                                </label>
                                <input
                                  type="number"
                                  value={formData[`${key}Months`]}
                                  onChange={(e) =>
                                    handleInputChange(
                                      `${key}Months`,
                                      e.target.value
                                    )
                                  }
                                  className="w-full h-8 px-2 text-sm border rounded border-gray-300 focus:border-[#1F3A93] focus:outline-none"
                                />
                              </div>
                            </div>
                          )}

                        {formData[key] && key === "weightLoss" && (
                          <div className="ml-8">
                            <label className="block text-sm text-gray-600 mb-1">
                              Pounds Lost
                            </label>
                            <input
                              type="number"
                              value={formData.weightLossPounds}
                              onChange={(e) =>
                                handleInputChange(
                                  "weightLossPounds",
                                  e.target.value
                                )
                              }
                              className="w-32 h-8 px-2 text-sm border rounded border-gray-300 focus:border-[#1F3A93] focus:outline-none"
                              placeholder="0"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Taken Section */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border-2 border-red-200">
                <h3 className="text-xl font-bold text-[#1F3A93] mb-6 flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
                  Action Taken (Check all that apply)
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      key: "noActiveTB",
                      label: "No sign of active TB at this time",
                    },
                    {
                      key: "xrayNotNeeded",
                      label: "Chest X-ray not needed at this time",
                    },
                    {
                      key: "discussedSymptoms",
                      label: "Discussed signs and symptoms of TB with client",
                    },
                    {
                      key: "clientKnows",
                      label:
                        "Client knows to seek health care if symptoms of TB appear",
                    },
                    {
                      key: "furtherActionNeeded",
                      label: "Further action needed",
                    },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={key}
                        checked={formData[key]}
                        onChange={(e) =>
                          handleInputChange(key, e.target.checked)
                        }
                        className="w-5 h-5 text-[#1F3A93] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#1F3A93]/20 mt-1"
                      />
                      <label
                        htmlFor={key}
                        className="text-base text-gray-700 font-medium"
                      >
                        {label}
                      </label>
                    </div>
                  ))}

                  {formData.furtherActionNeeded && (
                    <div className="ml-8 mt-4 space-y-3 bg-white p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Further Actions Required:
                      </h4>
                      {[
                        { key: "isolated", label: "Isolated" },
                        { key: "surgicalMask", label: "Given surgical mask" },
                        { key: "xrayNeeded", label: "Chest X-ray is needed" },
                        {
                          key: "sputumSamples",
                          label: "Sputum samples are needed",
                        },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-gray-600">â€¢</span>
                          <input
                            type="checkbox"
                            id={key}
                            checked={formData[key]}
                            onChange={(e) =>
                              handleInputChange(key, e.target.checked)
                            }
                            className="w-4 h-4 text-[#1F3A93] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#1F3A93]/20"
                          />
                          <label
                            htmlFor={key}
                            className="text-sm text-gray-700"
                          >
                            {label}
                          </label>
                        </div>
                      ))}

                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">â€¢</span>
                        <input
                          type="checkbox"
                          id="referredTo"
                          checked={formData.referredTo}
                          onChange={(e) =>
                            handleInputChange("referredTo", e.target.checked)
                          }
                          className="w-4 h-4 text-[#1F3A93] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#1F3A93]/20"
                        />
                        <label
                          htmlFor="referredTo"
                          className="text-sm text-gray-700"
                        >
                          Referred to Doctor/Clinic:
                        </label>
                        <input
                          type="text"
                          value={formData.referredToText}
                          onChange={(e) =>
                            handleInputChange("referredToText", e.target.value)
                          }
                          className="flex-1 h-8 px-3 text-sm border rounded border-gray-300 focus:border-[#1F3A93] focus:outline-none"
                          placeholder="Specify doctor/clinic"
                          disabled={!formData.referredTo}
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">â€¢</span>
                        <input
                          type="checkbox"
                          id="other"
                          checked={formData.other}
                          onChange={(e) =>
                            handleInputChange("other", e.target.checked)
                          }
                          className="w-4 h-4 text-[#1F3A93] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#1F3A93]/20"
                        />
                        <label
                          htmlFor="other"
                          className="text-sm text-gray-700"
                        >
                          Other:
                        </label>
                        <input
                          type="text"
                          value={formData.otherText}
                          onChange={(e) =>
                            handleInputChange("otherText", e.target.value)
                          }
                          className="flex-1 h-8 px-3 text-sm border rounded border-gray-300 focus:border-[#1F3A93] focus:outline-none"
                          placeholder="Specify other action"
                          disabled={!formData.other}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature Section */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-xl font-bold text-[#1F3A93] mb-6">
                  Signatures
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <label className="block text-base font-medium text-[#1F3A93] mb-2">
                      Signature of Person Making the Assessment
                    </label>
                    <input
                      type="text"
                      placeholder="Type your full name to sign"
                      value={formData.assessmentSignature}
                      onChange={(e) =>
                        handleInputChange("assessmentSignature", e.target.value)
                      }
                      className="w-full h-12 px-4 border-2 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none bg-white text-gray-900 font-signature text-base transition-all duration-200"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      By typing your name above, you are signing this document
                      electronically
                    </p>
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-800 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.signatureDate}
                      onChange={(e) =>
                        handleInputChange("signatureDate", e.target.value)
                      }
                      className="w-full h-12 px-4 border-2 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none bg-white text-gray-900 text-base transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-800 mb-2">
                    Signature of Client
                  </label>
                  <input
                    type="text"
                    placeholder="Client signature"
                    value={formData.clientSignature}
                    onChange={(e) =>
                      handleInputChange("clientSignature", e.target.value)
                    }
                    className="w-full h-12 px-4 border-2 rounded-lg border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none bg-white text-gray-900 font-signature text-base transition-all duration-200"
                  />
                </div>

                <div className="mt-6 text-right text-sm text-gray-500">
                  GA DPH TB Unit Rev. 12/2011
                </div>
              </div>

              {/* Progress Bar in Form Footer */}
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
                      {Math.round((overallProgress / 100) * 25)}/25
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
                  📝 Current: TB or X-RAY Form
                </div>
              </div>

              {/* Submit Button - three-zone footer: Previous | Exit Application | Save & Next */}
              <div className="bg-[#F8FAFF] px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 rounded-lg border border-[#E8EDFF]">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                      Complete TB Symptom Screen
                    </h4>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Left - Previous */}
                    <div className="w-full sm:w-1/3 flex justify-start">
                      <button
                        type="button"
                        onClick={() =>
                          navigate("/employee/background-check-upload")
                        }
                        className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
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
                        onClick={() => navigate("/employee/task-management")}
                        className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
                        disabled={saving}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        <span>Exit Application</span>
                      </button>
                    </div>

                    {/* Save & Next Button with HR Feedback Logic */}
                    <div className="w-full sm:w-1/3 flex justify-end">
                      {(() => {
                        const hasHrNotes =
                          hrFeedback &&
                          (hrFeedback.generalNotes ||
                            hrFeedback.personalInfoNotes ||
                            hrFeedback.professionalExperienceNotes ||
                            hrFeedback.emergencyContactNotes ||
                            hrFeedback.backgroundCheckNotes ||
                            hrFeedback.cprCertificateNotes ||
                            hrFeedback.drivingLicenseNotes ||
                            hrFeedback.professionalCertificatesNotes ||
                            hrFeedback.tbSymptomScreenNotes ||
                            hrFeedback.orientationNotes ||
                            hrFeedback.w4FormNotes ||
                            hrFeedback.w9FormNotes ||
                            hrFeedback.i9FormNotes ||
                            hrFeedback.directDepositNotes ||
                            hrFeedback.codeOfEthicsNotes ||
                            hrFeedback.serviceDeliveryPoliciesNotes ||
                            hrFeedback.nonCompeteAgreementNotes ||
                            hrFeedback.misconductStatementNotes);
                        const isSubmitted =
                          formStatus === "submitted" && !hasHrNotes;

                        return (
                          <button
                            type="button"
                            onClick={handleSubmit}
                            className={`inline-flex items-center px-4 py-3 text-white font-bold rounded-xl focus:ring-2 transition-all duration-300 shadow-lg text-sm sm:text-base ${
                              isSubmitted
                                ? "bg-gray-400 cursor-not-allowed opacity-60"
                                : "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-[#1F3A93]/30 hover:shadow-xl"
                            }`}
                            disabled={saving || isSubmitted}
                            title={isSubmitted ? "Waiting for HR feedback" : ""}
                          >
                            {saving ? (
                              <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4 mr-2" />
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SymptomScreenForm;
