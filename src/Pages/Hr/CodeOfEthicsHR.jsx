import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";
import axios from "axios";
import Cookies from "js-cookie";

const CodeOfEthicsHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams(); // Changed from userId to employeeId
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    signature: "",
    date: null,
  });
  const [existingFeedback, setExistingFeedback] = useState(null);

  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    if (employeeId) {
      loadFormData();
    }
  }, [employeeId]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      console.log("Loading code of ethics data for employeeId:", employeeId);

      if (employeeId) {
        const apiUrl = `${baseURL}/onboarding/get-application/${employeeId}`;
        console.log("🔗 Making request to:", apiUrl);

        // Fetch code of ethics data from backend using employeeId
        const response = await axios.get(apiUrl, { withCredentials: true });

        console.log("Code of ethics API response:", response.data);

        // Check if we have data (the API returns data directly without a success flag)
        if (response.data && response.data.data) {
          const applicationData = response.data.data.forms.codeOfEthics;
          console.log("Setting code of ethics form data:", applicationData);

          // Map backend data to form structure
          setFormData({
            // Employee uploaded document information
            signature:
              applicationData.employeeUploadedForm?.filePath ||
              applicationData.signature ||
              `${applicationData.firstName || ""} ${
                applicationData.lastName || ""
              }`.trim() ||
              "",
            date: applicationData.date ? new Date(applicationData.date) : null,
            // Store additional document info
            uploadedForm: applicationData.employeeUploadedForm || null,
          });

          // Load existing HR feedback
          if (applicationData.hrFeedback) {
            setExistingFeedback(applicationData.hrFeedback);
          }
        } else {
          console.error(
            "No code of ethics data received:",
            response.data?.message || "No data in response"
          );
          toast.error("No code of ethics data found for this user");
        }
      }
    } catch (error) {
      console.error("Error loading code of ethics data:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(
          `Failed to load code of ethics data: ${
            error.response.data?.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        console.error("Network error:", error.request);
        toast.error("Network error: Unable to connect to server");
      } else {
        console.error("Error:", error.message);
        toast.error("Failed to load code of ethics data");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-gray-600">Loading form data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      {/* Add cursive signature fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&family=Dancing+Script:wght@400;700&family=Pacifico&display=swap"
        rel="stylesheet"
      />

      {/* Back Button - Outside of form with proper spacing */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-4">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to HR Dashboard
        </button>
      </div>

      {/* Main Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Code of Ethics - HR Review
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Review employee's signed Code of Ethics document
            </p>
          </div>

          <div className="space-y-6">
            {/* Instructions Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                    📋 HR Review Instructions
                  </h3>
                  <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        1.
                      </span>
                      <span>Review the Code of Ethics document below</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        2.
                      </span>
                      <span>Verify employee's signature and date</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        3.
                      </span>
                      <span>Add HR notes if needed</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="max-w-4xl w-full px-12 py-8">
                {/* Header with Logo */}
                <div className="flex items-center justify-center mb-6">
                  <img
                    src="https://www.pacifichealthsystems.net/wp-content/themes/pacifichealth/images/logo.png"
                    alt="Pacific Health Systems Logo"
                    className="h-20"
                  />
                </div>

                {/* Title */}
                <h1 className="text-center text-base font-bold mb-4 underline">
                  CODE OF ETHICS
                </h1>

                {/* Ethics List */}
                <div className="space-y-2 text-[13px] leading-normal">
                  <div className="flex">
                    <span className="mr-3 shrink-0">1.</span>
                    <p>
                      PHS employees will not use the client's car for personal
                      reasons.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">2.</span>
                    <p>
                      Employees will not consume the client's food or beverages,
                      nor will they eat inside the client's home without
                      permission.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">3.</span>
                    <p>
                      Employees will not use the client's telephone for personal
                      calls.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">4.</span>
                    <p>
                      Employees will not discuss political, religious beliefs,
                      or personal problems with the client.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">5.</span>
                    <p>
                      Employees will not accept gifts or financial gratuities
                      (tips) from the client or client's representative.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">6.</span>
                    <p>
                      Employees will not loan money or other items to the client
                      and/or client representative.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">7.</span>
                    <p>
                      Employees will not sell gifts, food, or other items to or
                      for the client.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">8.</span>
                    <p>
                      Employees will not purchase any items for the client
                      unless directed in the client care plan.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">9.</span>
                    <p>
                      Employees will not bring other visitors to client's home
                      (children, friends, relatives, etc...).
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">10.</span>
                    <p>
                      Employees will not smoke in or around the client's home
                      with or without permission.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">11.</span>
                    <p>
                      Employees will not report to duty under the influence of
                      alcohol or drugs.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">12.</span>
                    <p>
                      Employees will not sleep in the client's house unless
                      ordered in service care plan.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">13.</span>
                    <p>
                      Employees will not remain in the client's home after
                      services have been rendered and completed.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">14.</span>
                    <p>
                      Employees will not falsify client's records/timesheets.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">15.</span>
                    <p>
                      Employees must report any unusual changes or events with
                      client during work hours.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">16.</span>
                    <p>
                      Employees must not breach clients' and or primary care
                      giver's privacy and confidentiality of information and
                      records against HIPPA regulations.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">17.</span>
                    <p>
                      Employees must not assume control of the financial or
                      personal affairs, or both, of the client or his/her
                      estate, including power of attorney or guardianship.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">18.</span>
                    <p>
                      Employees must not be committing any act of abuse, neglect
                      or exploitation.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">19.</span>
                    <p>
                      Employees will wear, have badge visible and adhere to the
                      dress code of appropriate scrubs for PHS.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">20.</span>
                    <p>
                      Employees will attend all mandatory quarterly meetings.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">21.</span>
                    <p>
                      Employees will notify the office if they are unable to
                      report to work for their assigned schedule, at least 2
                      hours before the start of the shift. If it's an emergency
                      (A written doctor's excuse will be needed to make this an
                      excused absence). Employees will provide at least a 2weeks
                      notice to request and schedule time off.
                    </p>
                  </div>
                </div>

                {/* Agreement Text */}
                <div className="mt-6 text-[13px] leading-normal">
                  <p>
                    By signing my name below, I agree and promise that while in
                    the employment of Pacific Health Systems, I will abide by
                    the Code of Ethics established for Pacific Health Systems. I
                    understand that failure to abide by the code of ethics will
                    result in disciplinary action and may result in termination
                    of my employment with PHS.
                  </p>
                </div>

                {/* Signature Section */}
                <div className="mt-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-8">
                  <div className="w-full sm:flex-1 sm:max-w-xs">
                    <div className="border-b border-black mb-2 min-h-12 flex items-end pb-1">
                      <p
                        className="text-lg"
                        style={{
                          fontFamily: "'Great Vibes', cursive",
                          fontSize: "28px",
                          fontWeight: "400",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {formData.signature || "No Signature"}
                      </p>
                    </div>
                    <p className="text-sm font-bold mt-1">Employee Signature</p>
                  </div>
                  <div className="w-full sm:flex-1 sm:max-w-xs">
                    <div className="border-b border-black mb-2 min-h-12 flex items-end pb-1">
                      <input
                        type="date"
                        value={
                          formData.date
                            ? new Date(formData.date)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        readOnly
                        className="w-full bg-transparent border-none outline-none text-sm"
                      />
                    </div>
                    <p className="text-sm font-bold mt-1 text-center">Date</p>
                  </div>
                </div>
              </div>
            </div>

            {/* HR Notes Section */}
            <div className="mt-8">
              <HRNotesInput
                formType="code-of-ethics"
                employeeId={employeeId}
                existingNote={existingFeedback?.comment}
                existingReviewedAt={existingFeedback?.reviewedAt}
                onNoteSaved={loadFormData}
                formData={formData}
                showSignature={false}
              />

              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() =>
                    navigate(`/hr/job-description/pca/${employeeId}`)
                  }
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous: Job Description
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Exit to Dashboard
                </button>
                <button
                  onClick={() =>
                    navigate(`/hr/service-delivery-policies/${employeeId}`)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  Next: Service Delivery
                  <svg
                    className="w-4 h-4"
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
                </button>
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
    </Layout>
  );
};

export default CodeOfEthicsHR;
