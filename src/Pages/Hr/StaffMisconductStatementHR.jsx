import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, Target, Send } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";
const StaffMisconductStatementHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams(); // Changed from userId to employeeId
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    staffTitle: "",
    companyName: "",
    employeeNameParagraph: "",
    employeeName: "",
    employmentPosition: "",
    signatureLine: "",
    dateField1: "",
    exhibitName: "",
    printName: "",
    signatureField: "",
    dateField2: "",
    notaryDay: "",
    notaryMonth: "",
    notaryYear: "",
    notarySignature: "",
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
      console.log(
        "Loading staff misconduct statement data for employeeId:",
        employeeId
      );

      if (employeeId) {
        const apiUrl = `${baseURL}/onboarding/get-application/${employeeId}`;
        console.log("🔗 Making request to:", apiUrl);

        // Fetch staff misconduct statement data from backend using employeeId
        const response = await axios.get(apiUrl, { withCredentials: true });

        console.log("Staff misconduct statement API response:", response.data);
        console.log("Response.data.data:", response.data?.data);
        console.log("Response.data.data.forms:", response.data?.data?.forms);
        console.log(
          "Response.data.data.forms.misconductStatement:",
          response.data?.data?.forms?.misconductStatement
        );

        // Check if we have data (the API returns data.data.forms.misconductStatement)
        if (response.data && response.data.data && response.data.data.forms) {
          const applicationData = response.data.data.forms.misconductStatement;

          if (!applicationData) {
            console.warn("❌ No misconduct statement data found in response");
            toast.info(
              "No staff misconduct statement data found for this employee. The form has not been submitted yet."
            );
            setLoading(false);
            return;
          }

          console.log(
            "✅ Found misconduct statement form data:",
            applicationData
          );

          // Check if we have any actual data
          const hasData =
            applicationData.staffTitle ||
            applicationData.companyName ||
            applicationData.employeeName ||
            applicationData.employmentPosition ||
            applicationData.dateField1 ||
            applicationData.dateField2 ||
            applicationData.signatureLine ||
            applicationData.signatureField;

          if (!hasData) {
            console.warn(
              "⚠️ Form exists but is empty - no data fields populated"
            );
            toast.warning(
              "Form exists but has not been completed yet. Employee may still be filling it out."
            );
          } else {
            console.log("✅ Form has data - displaying content");
          }

          // Map backend data to form structure (matching employee form exactly)
          setFormData({
            // Staff Information
            staffTitle: applicationData.staffTitle || "",
            companyName: applicationData.companyName || "",
            employeeNameParagraph: applicationData.employeeNameParagraph || "",
            employeeName: applicationData.employeeName || "",
            employmentPosition: applicationData.employmentPosition || "",

            // Signatures and Dates - handle digital signatures
            signatureLine: applicationData.signatureLine || "",
            dateField1: applicationData.dateField1 || "",
            exhibitName: applicationData.exhibitName || "",
            printName: applicationData.printName || "",
            signatureField: applicationData.signatureField || "",
            dateField2: applicationData.dateField2 || "",

            // Notary Information
            notaryDay: applicationData.notaryDay || "",
            notaryMonth: applicationData.notaryMonth || "",
            notaryYear: applicationData.notaryYear || "",
            notarySignature: applicationData.notarySignature || "",
          });

          // Load existing HR feedback
          if (applicationData.hrFeedback) {
            setExistingFeedback(applicationData.hrFeedback);
            console.log(
              "✅ Loaded existing HR feedback:",
              applicationData.hrFeedback
            );
          }

          console.log("✅ Form data set in state successfully");
        } else {
          console.error(
            "No staff misconduct statement data received:",
            response.data?.message || "No data in response"
          );
          toast.error("No staff misconduct statement data found for this user");
        }
      }
    } catch (error) {
      console.error("Error loading staff misconduct statement data:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(
          `Failed to load staff misconduct statement data: ${
            error.response.data?.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        console.error("Network error:", error.request);
        toast.error("Network error: Unable to connect to server");
      } else {
        console.error("Error:", error.message);
        toast.error("Failed to load staff misconduct statement data");
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
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
        rel="stylesheet"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium mb-6"
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
              Staff Misconduct Statement
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              HR Review - Complete disclosure of criminal history or misconduct
            </p>
          </div>

          <div className="space-y-6">
            {/* Instructions Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                    📋 Instructions
                  </h3>
                  <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        1.
                      </span>
                      <span>
                        Review the Staff Misconduct Statement form below
                      </span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        2.
                      </span>
                      <span>
                        Verify all required fields have been completed
                      </span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        3.
                      </span>
                      <span>Check digital signatures in the form template</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        4.
                      </span>
                      <span>Add HR notes and approval status below</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Template Preview Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Step 1: Staff Misconduct Statement Form
              </h2>
              <div className="max-w-6xl mx-auto bg-white p-12 my-8">
                <div className="border-4 border-black p-12 min-h-screen">
                  <div className="space-y-4">
                    <h1 className="text-sm font-bold mb-6">
                      STAFF MISCONDUCT ABUSE STATEMENT FORM
                    </h1>

                    <div className="flex items-baseline mb-8">
                      <span className="mr-2 text-xs">STAFF TITLE:</span>
                      <input
                        type="text"
                        value={formData.staffTitle}
                        readOnly
                        className="border-b border-black flex-1 px-1 bg-gray-50 text-xs cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-4 leading-relaxed text-xs">
                      <p>
                        I <u>understand and acknowledge</u> that I must comply
                        with Pacific Health Systems LLC{" "}
                        <input
                          type="text"
                          value={formData.companyName}
                          readOnly
                          className="border-b border-black w-20 mx-1 px-1 bg-gray-50 cursor-not-allowed"
                        />
                        , Code of Conduct and Abuse & Misconduct program.
                      </p>

                      <p>
                        All laws, regulations, policies & procedures as well as
                        any other applicable state or local ordinances as it
                        pertains to the responsibilities of my position.
                      </p>

                      <p>
                        I <u>understand</u> that my failure to report any
                        concerns regarding possible violations of these laws,
                        regulations, and Policies may result in disciplinary
                        action, up to and including termination.
                      </p>

                      <p>
                        I{" "}
                        <input
                          type="text"
                          value={formData.employeeNameParagraph}
                          readOnly
                          className="border-b border-black w-64 mx-1 px-1 bg-gray-50 cursor-not-allowed"
                        />
                        , as an employee of Pacific Health Systems LLC{" "}
                        <input
                          type="text"
                          value={formData.employeeNameParagraph}
                          readOnly
                          className="border-b border-black w-16 mx-1 px-1 bg-gray-50 cursor-not-allowed"
                        />
                        , I hereby state that, I have never shown any misconduct
                        nor have a history of abuse and neglect of others.
                      </p>

                      <p className="mb-6">
                        I acknowledge that I have received and read the
                        Misconduct or abuse statement form and that I clearly
                        understand it.
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-baseline">
                          <span className="mr-2 whitespace-nowrap">
                            Name of Employee (print):
                          </span>
                          <input
                            type="text"
                            value={formData.employeeName}
                            readOnly
                            className="border-b border-black flex-1 px-1 bg-gray-50 cursor-not-allowed"
                          />
                        </div>

                        <div className="flex items-baseline">
                          <span className="mr-2 whitespace-nowrap">
                            Employment Position:
                          </span>
                          <input
                            type="text"
                            value={formData.employmentPosition}
                            readOnly
                            className="border-b border-black flex-1 px-1 bg-gray-50 cursor-not-allowed"
                          />
                        </div>

                        <div className="flex items-baseline">
                          <span className="mr-2">Signature:</span>
                          <p
                            style={{
                              fontFamily: "'Great Vibes', cursive",
                              fontSize: "48px",
                              letterSpacing: "0.5px",
                            }}
                            className="flex-1 px-1"
                          >
                            {formData.signatureLine || "No Signature"}
                          </p>
                          <span className="mx-2">Date:</span>
                          <input
                            type="text"
                            value={formData.dateField1}
                            readOnly
                            className="border-b border-black w-32 px-1 bg-gray-50 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="my-6">
                        <p className="mb-2">
                          Who having been first duly sworn depose and say
                        </p>
                        <div className="mb-1">
                          <span>that </span>
                          <input
                            type="text"
                            value={formData.exhibitName}
                            readOnly
                            className="border-b border-black w-full px-1 bg-gray-50 cursor-not-allowed"
                          />
                          <span> has never been shown to have exhibited</span>
                        </div>
                        <p>
                          any violent or abusive behavior or intentional or
                          grossly negligent misconduct{" "}
                          <input
                            type="text"
                            readOnly
                            className="border-b border-black w-24 mx-1 px-1 bg-gray-50 cursor-not-allowed"
                          />
                          .
                        </p>
                        <p className="mt-2">
                          Also have never been accused or convicted to have been
                          abused, neglected, sexually assaulted, exploited, or
                          deprived any person or to have subjected any person to
                          serious injury as a result of intentional or grossly
                          negligent misconduct as evidenced by an out-of written
                          statement to this affect obtained at the time of
                          application.
                        </p>
                      </div>

                      <div
                        className="flex items-baseline gap-1"
                        style={{ maxWidth: "100%" }}
                      >
                        <span
                          className="whitespace-nowrap"
                          style={{
                            verticalAlign: "middle",
                            display: "inline-block",
                            lineHeight: "20px",
                            fontSize: "12px",
                          }}
                        >
                          Print Name:
                        </span>
                        <span
                          className="flex-1 border-b border-black"
                          style={{
                            minHeight: "20px",
                            verticalAlign: "middle",
                            display: "inline-block",
                          }}
                        >
                          <input
                            type="text"
                            value={formData.printName}
                            readOnly
                            className="border-0 bg-transparent w-full px-1 focus:outline-none cursor-not-allowed"
                            style={{
                              lineHeight: "20px",
                              fontSize: "12px",
                              margin: "0",
                              padding: "0 2px",
                              boxSizing: "border-box",
                              display: "block",
                            }}
                          />
                        </span>
                        <span
                          className="whitespace-nowrap ml-4"
                          style={{
                            verticalAlign: "middle",
                            display: "inline-block",
                            lineHeight: "20px",
                            fontSize: "12px",
                          }}
                        >
                          Signature:
                        </span>
                        <span
                          className="flex-1 border-b border-black"
                          style={{
                            minHeight: "20px",
                            verticalAlign: "middle",
                            display: "inline-block",
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "'Great Vibes', cursive",
                              fontSize: "20px",
                              letterSpacing: "0.5px",
                              lineHeight: "20px",
                              margin: "0",
                              padding: "0 2px",
                              boxSizing: "border-box",
                              display: "block",
                            }}
                          >
                            {formData.signatureField || ""}
                          </p>
                        </span>
                        <span
                          className="whitespace-nowrap ml-4"
                          style={{
                            verticalAlign: "middle",
                            display: "inline-block",
                            lineHeight: "20px",
                            fontSize: "12px",
                          }}
                        >
                          Date:
                        </span>
                        <span
                          className="border-b border-black"
                          style={{
                            minHeight: "20px",
                            verticalAlign: "middle",
                            display: "inline-block",
                            width: "120px",
                          }}
                        >
                          <input
                            type="text"
                            value={formData.dateField2}
                            readOnly
                            className="border-0 bg-transparent w-full px-1 focus:outline-none cursor-not-allowed"
                            style={{
                              lineHeight: "20px",
                              fontSize: "12px",
                              margin: "0",
                              padding: "0 2px",
                              boxSizing: "border-box",
                              display: "block",
                            }}
                          />
                        </span>
                      </div>

                      <div className="mt-8 space-y-4">
                        <p
                          style={{
                            fontStyle: "italic",
                            fontWeight: "bold",
                            marginTop: "24px",
                          }}
                        >
                          Notary Affidavit
                        </p>
                        <p>State of Georgia</p>

                        <div className="flex items-baseline flex-wrap">
                          <span className="mr-2" style={{ fontSize: "12px" }}>
                            Sworn and subscribed before me this
                          </span>
                          <span
                            className="border-b border-black"
                            style={{
                              minHeight: "20px",
                              verticalAlign: "middle",
                              display: "inline-block",
                              width: "60px",
                              margin: "0 4px",
                            }}
                          >
                            <input
                              type="text"
                              value={formData.notaryDay}
                              readOnly
                              className="border-0 bg-transparent w-full px-1 focus:outline-none cursor-not-allowed"
                              style={{
                                lineHeight: "20px",
                                fontSize: "12px",
                                margin: "0",
                                padding: "0 2px",
                                boxSizing: "border-box",
                                display: "block",
                              }}
                            />
                          </span>
                          <span style={{ margin: "0 4px", fontSize: "12px" }}>
                            day of
                          </span>
                          <span
                            className="border-b border-black"
                            style={{
                              minHeight: "20px",
                              verticalAlign: "middle",
                              display: "inline-block",
                              width: "140px",
                              margin: "0 4px",
                            }}
                          >
                            <input
                              type="text"
                              value={formData.notaryMonth}
                              readOnly
                              className="border-0 bg-transparent w-full px-1 focus:outline-none cursor-not-allowed"
                              style={{
                                lineHeight: "20px",
                                fontSize: "12px",
                                margin: "0",
                                padding: "0 2px",
                                boxSizing: "border-box",
                                display: "block",
                              }}
                            />
                          </span>
                          <span style={{ margin: "0 4px", fontSize: "12px" }}>
                            Year
                          </span>
                          <span
                            className="border-b border-black"
                            style={{
                              minHeight: "20px",
                              verticalAlign: "middle",
                              display: "inline-block",
                              width: "80px",
                              margin: "0 4px",
                            }}
                          >
                            <input
                              type="text"
                              value={formData.notaryYear}
                              readOnly
                              className="border-0 bg-transparent w-full px-1 focus:outline-none cursor-not-allowed"
                              style={{
                                lineHeight: "20px",
                                fontSize: "12px",
                                margin: "0",
                                padding: "0 2px",
                                boxSizing: "border-box",
                                display: "block",
                              }}
                            />
                          </span>
                        </div>

                        <div className="mt-6">
                          <p className="mb-3">Notary Seal</p>
                          <div
                            className="flex items-baseline gap-1"
                            style={{ maxWidth: "50%" }}
                          >
                            <span
                              className="whitespace-nowrap"
                              style={{
                                verticalAlign: "middle",
                                display: "inline-block",
                                lineHeight: "20px",
                                fontSize: "12px",
                              }}
                            >
                              Notary Signature:
                            </span>
                            <span
                              className="flex-1 border-b border-black"
                              style={{
                                minHeight: "20px",
                                verticalAlign: "middle",
                                display: "inline-block",
                              }}
                            >
                              <p
                                style={{
                                  fontFamily: "'Great Vibes', cursive",
                                  fontSize: "20px",
                                  letterSpacing: "0.5px",
                                  lineHeight: "20px",
                                  margin: "0",
                                  padding: "0 2px",
                                  boxSizing: "border-box",
                                  display: "block",
                                }}
                              >
                                {formData.notarySignature || ""}
                              </p>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* HR Notes Section */}
            <div className="mt-10">
              <HRNotesInput
                formType="misconduct-statement"
                employeeId={employeeId}
                existingNote={existingFeedback?.comment}
                existingReviewedAt={existingFeedback?.reviewedAt}
                onNoteSaved={loadFormData}
                formData={formData}
                showSignature={false}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 items-center px-6 md:px-8 pb-6 mt-8">
            <button
              onClick={() =>
                navigate(`/hr/background-check-form/${employeeId}`)
              }
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous: Background Check
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Exit to Dashboard
            </button>
            <button
              onClick={() => navigate(`/hr/tb-symptom-screen/${employeeId}`)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Next: TB Screening
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default StaffMisconductStatementHR;
