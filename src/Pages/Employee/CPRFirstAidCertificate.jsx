import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  Send,
  Trash2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";

const FORM_KEYS = [
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

const CPRFirstAidCertificate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cprFile, setCprFile] = useState(null);
  const [uploadingCpr, setUploadingCpr] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [uploadedCprCert, setUploadedCprCert] = useState(null);
  const [completedForms, setCompletedForms] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    initializeForm();
  }, []);

  const initializeForm = async () => {
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) {
        toast.error("User not found. Please log in again.");
        setLoading(false);
        return;
      }
      const user = JSON.parse(userCookie);

      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      if (appResponse.data?.data?.application) {
        setApplicationId(appResponse.data.data.application._id);
        if (
          appResponse.data.data.forms.backgroundCheck?.cprFirstAidCertificate
        ) {
          setUploadedCprCert(
            appResponse.data.data.forms.backgroundCheck.cprFirstAidCertificate
          );
        }

        const forms = appResponse.data.data.forms;
        const completedFormsArray =
          appResponse.data.data.application?.completedForms || [];
        const completedSet = new Set(completedFormsArray);

        const completed = FORM_KEYS.filter((key) => {
          let form = forms[key];
          if (key === "jobDescriptionPCA") {
            form =
              forms.jobDescriptionPCA ||
              forms.jobDescriptionCNA ||
              forms.jobDescriptionLPN ||
              forms.jobDescriptionRN;
          }
          return [
            "submitted",
            "completed",
            "under_review",
            "approved",
          ].includes(form?.status);
        });

        setCompletedForms(completed);

        const progressPercentage = Math.round(
          (completed.length / FORM_KEYS.length) * 100
        );
        setOverallProgress(progressPercentage);
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      toast.error("Could not load application data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCprFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setCprFile(selectedFile);
    } else {
      setCprFile(null);
      toast.error("Please select a PDF file");
    }
  };

  const handleCprUpload = async () => {
    if (!cprFile) {
      toast.error("Please select a CPR/First Aid certificate file");
      return;
    }

    if (!applicationId) {
      toast.error("Application ID not found");
      return;
    }

    setUploadingCpr(true);
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) {
        toast.error("Session expired. Please log in again.");
        setUploadingCpr(false);
        return;
      }
      const user = JSON.parse(userCookie);

      const formData = new FormData();
      formData.append("file", cprFile);
      formData.append("applicationId", applicationId);
      formData.append("employeeId", user._id);

      const response = await axios.post(
        `${baseURL}/onboarding/employee-upload-cpr-certificate`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.data) {
        toast.success("CPR/First Aid certificate uploaded successfully!");
        setCprFile(null);
        setUploadedCprCert(
          response.data.backgroundCheck.cprFirstAidCertificate
        );
        window.dispatchEvent(new Event("formStatusUpdated"));
      }
    } catch (error) {
      console.error("Error uploading CPR certificate:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload certificate"
      );
    } finally {
      setUploadingCpr(false);
    }
  };

  const handleRemoveCprUpload = async () => {
    if (!uploadedCprCert) {
      toast.error("No certificate to remove");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to remove the uploaded certificate?"
      )
    ) {
      return;
    }

    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      const user = JSON.parse(userCookie);

      await axios.post(
        `${baseURL}/onboarding/remove-cpr-certificate-upload`,
        {
          applicationId,
          employeeId: user._id,
        },
        { withCredentials: true }
      );

      toast.success("Certificate removed successfully");
      setUploadedCprCert(null);
      window.dispatchEvent(new Event("formStatusUpdated"));
    } catch (error) {
      console.error("Error removing certificate:", error);
      toast.error("Failed to remove certificate");
    }
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mb-6 pt-8">
        <button
          onClick={() => navigate("/employee/task-management")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Vertical Progress Bar Sidebar */}
          <div className="w-16 flex-shrink-0 hidden md:block">
            <div className="sticky top-6 flex md:flex-col items-center">
              <div className="w-full md:w-4 h-4 md:h-[500px] bg-gray-200 rounded-full relative shadow-inner">
                <div
                  className="bg-gradient-to-t from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out absolute bottom-0 shadow-sm h-full md:h-auto md:w-4"
                  style={{
                    width: `${overallProgress}%`,
                    height:
                      window.innerWidth < 768 ? "100%" : `${overallProgress}%`,
                  }}
                ></div>
              </div>
              <div className="mt-0 md:mt-4 text-center ml-4 md:ml-0">
                <div className="text-lg font-bold text-blue-600">
                  {overallProgress}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Progress</div>
              </div>
            </div>
          </div>

          {/* Main Form Content */}
          <div className="flex-1 min-h-screen md:max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              {/* Status Banner */}
              {!loading && (
                <div
                  className={`mb-6 p-4 rounded-lg border ${
                    uploadedCprCert
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    {uploadedCprCert ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      {uploadedCprCert ? (
                        <p className="text-base font-semibold text-green-800">
                          ✅ Progress Updated - Uploaded Successfully on{" "}
                          {new Date(
                            uploadedCprCert.uploadedAt
                          ).toLocaleDateString()}
                        </p>
                      ) : (
                        <p className="text-base font-semibold text-red-800">
                          ⚠️ Not filled yet - Upload your certificate to
                          complete your progress
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  CPR/First Aid Certificate
                </h1>
                <p className="text-gray-600">
                  Upload your CPR/First Aid certificate (Optional)
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  Progress: {completedForms.length}/{FORM_KEYS.length} forms
                  completed
                </div>
              </div>

              <div className="space-y-6">
                {/* Instructions Section */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <FileText className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        📋 Instructions
                      </h3>
                      <ol className="space-y-3 text-sm text-gray-700">
                        <li className="flex gap-3">
                          <span className="font-bold text-purple-600 flex-shrink-0">
                            1.
                          </span>
                          <span>
                            Ensure you have a valid CPR/First Aid certificate
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-purple-600 flex-shrink-0">
                            2.
                          </span>
                          <span>Scan the certificate as a PDF</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-purple-600 flex-shrink-0">
                            3.
                          </span>
                          <span>
                            Upload the PDF using the upload button below
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-purple-600 flex-shrink-0">
                            4.
                          </span>
                          <span>
                            Click "Save & Next" to proceed to the next form
                          </span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Upload CPR/First Aid Certificate
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    This is optional. If you have a CPR/First Aid certificate,
                    please upload it here.
                  </p>

                  {uploadedCprCert ? (
                    <div className="bg-white border border-purple-300 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-purple-600 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">
                          Certificate Uploaded!
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm break-words">
                        File: {uploadedCprCert.filename}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Uploaded:{" "}
                        {new Date(uploadedCprCert.uploadedAt).toLocaleString()}
                      </p>
                      <button
                        onClick={handleRemoveCprUpload}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove Certificate
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleCprFileChange}
                          className="hidden"
                          id="cpr-file-upload"
                        />
                        <label
                          htmlFor="cpr-file-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <FileText className="w-5 h-5" />
                          Select CPR/First Aid Certificate PDF
                        </label>
                        {cprFile && (
                          <div className="mt-3 flex items-center justify-center gap-2 text-purple-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium break-all">
                              {cprFile.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleCprUpload}
                        disabled={!cprFile || uploadingCpr}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {uploadingCpr ? "Uploading..." : "Upload Certificate"}
                      </button>
                    </>
                  )}
                </div>

                {/* Progress Bar in Form Footer */}
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">
                        Application Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {completedForms.length}/{FORM_KEYS.length}
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
                    📝 Current: CPR/First Aid Certificate
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/employee/background-check-upload")
                      }
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
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

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const userCookie = Cookies.get("user");
                          if (userCookie && applicationId) {
                            const user = JSON.parse(userCookie);
                            const status = uploadedCprCert
                              ? "completed"
                              : "draft";
                            await axios.post(
                              `${baseURL}/onboarding/save-cpr-certificate`,
                              {
                                applicationId,
                                employeeId: user._id,
                                formData: {},
                                status,
                              },
                              { withCredentials: true }
                            );
                          }
                        } catch (error) {
                          console.error("Error saving status:", error);
                        }
                        window.dispatchEvent(new Event("formStatusUpdated"));
                        navigate("/employee/driving-license-upload");
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <span className="text-sm sm:text-base">Save & Next</span>
                      <Send className="w-5 h-5" />
                    </button>
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

export default CPRFirstAidCertificate;
