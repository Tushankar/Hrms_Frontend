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
            <div className="bg-white p-0">
              <div
                className="mx-auto bg-white p-12 my-0"
                style={{
                  maxWidth: "700px",
                  fontFamily: "Times New Roman, serif",
                  lineHeight: "1.6",
                  fontSize: "12px",
                  border: "1px solid #333",
                }}
              >
                <div className="space-y-0">
                  {/* Header - Centered */}
                  <div className="mb-4">
                    <h1
                      className="text-sm tracking-wider"
                      style={{ fontSize: "13px" }}
                    >
                      STAFF MISCONDUCT ABUSE STATEMENT FORM
                    </h1>
                  </div>

                  {/* Staff Title */}
                  <div className="mb-6" style={{ fontSize: "12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        verticalAlign: "middle",
                        lineHeight: "20px",
                      }}
                    >
                      STAFF TITLE:{" "}
                    </span>
                    <span
                      className="inline-block border-b border-black"
                      style={{
                        minHeight: "20px",
                        width: "300px",
                        marginLeft: "4px",
                        verticalAlign: "middle",
                      }}
                    >
                      <span
                        className="px-1"
                        style={{
                          fontSize: "12px",
                          fontFamily: "Times New Roman, serif",
                          lineHeight: "20px",
                          margin: "0",
                          padding: "0 2px",
                          boxSizing: "border-box",
                          display: "block",
                        }}
                      >
                        {formData.staffTitle || ""}
                      </span>
                    </span>
                  </div>

                  {/* Body Text - Left Aligned with proper spacing */}
                  <div
                    className="space-y-4"
                    style={{
                      fontSize: "12px",
                      textAlign: "justify",
                      marginTop: "40px",
                    }}
                  >
                    <p>
                      I understand and acknowledge that I must comply with{" "}
                      <u>Pacific Health Systems LLC</u>, Code of Conduct and
                      Abuse or Misconduct program.
                    </p>

                    <p>
                      All laws, regulations, policies & procedure as well as any
                      other applicable state or local ordinances as it pertains
                      to the responsibilities of my position.
                    </p>

                    <p>
                      I understand that my failure to report any concerns
                      regarding possible violations of these laws, regulations,
                      and Policies may result in disciplinary action, up to and
                      including termination.
                    </p>

                    <p>
                      I{" "}
                      <span
                        className="inline-block border-b border-black"
                        style={{
                          minHeight: "20px",
                          minWidth: "220px",
                          verticalAlign: "middle",
                        }}
                      >
                        <span
                          className="px-1"
                          style={{
                            fontSize: "12px",
                            fontFamily: "Times New Roman, serif",
                            lineHeight: "20px",
                            margin: "0",
                            padding: "0 2px",
                            boxSizing: "border-box",
                            display: "block",
                          }}
                        >
                          {formData.employeeNameParagraph || ""}
                        </span>
                      </span>{" "}
                      as an employee of <u>Pacific Health Systems LLC</u>, I
                      hereby state that, I have never shown any misconduct nor
                      have a history of abuse and neglect of others.
                    </p>

                    <p style={{ whiteSpace: "nowrap", marginBottom: "12px" }}>
                      I acknowledge that I have received and read the Misconduct
                      or abuse statement form and that I clearly understand it.
                    </p>
                  </div>

                  {/* Employee Information Fields */}
                  <div className="space-y-4" style={{ fontSize: "12px" }}>
                    <div className="flex items-baseline gap-2 mt-4">
                      <span
                        className="whitespace-nowrap"
                        style={{
                          verticalAlign: "middle",
                          display: "inline-block",
                          lineHeight: "20px",
                        }}
                      >
                        Name of Employee (print):
                      </span>
                      <span
                        className="border-b border-black"
                        style={{
                          minHeight: "20px",
                          verticalAlign: "middle",
                          display: "inline-block",
                          width: "200px",
                        }}
                      >
                        <span
                          className="px-1"
                          style={{
                            fontSize: "12px",
                            fontFamily: "Times New Roman, serif",
                            lineHeight: "20px",
                            margin: "0",
                            padding: "0 2px",
                            boxSizing: "border-box",
                            display: "block",
                          }}
                        >
                          {formData.employeeName || ""}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span
                        className="whitespace-nowrap"
                        style={{
                          verticalAlign: "middle",
                          display: "inline-block",
                          lineHeight: "20px",
                        }}
                      >
                        Employment Position:
                      </span>
                      <span
                        className="border-b border-black"
                        style={{
                          minHeight: "20px",
                          verticalAlign: "middle",
                          display: "inline-block",
                          width: "200px",
                        }}
                      >
                        <span
                          className="px-1"
                          style={{
                            fontSize: "12px",
                            fontFamily: "Times New Roman, serif",
                            lineHeight: "20px",
                            margin: "0",
                            padding: "0 2px",
                            boxSizing: "border-box",
                            display: "block",
                          }}
                        >
                          {formData.employmentPosition || ""}
                        </span>
                      </span>
                    </div>

                    {/* Signature and Date Row 1 */}
                    <div className="flex items-baseline gap-8">
                      <div className="flex items-baseline gap-1 flex-1">
                        <span
                          className="whitespace-nowrap"
                          style={{
                            verticalAlign: "middle",
                            display: "inline-block",
                            lineHeight: "20px",
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
                          <span
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
                            {formData.signatureLine || ""}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 flex-1">
                        <span
                          className="whitespace-nowrap"
                          style={{
                            verticalAlign: "middle",
                            display: "inline-block",
                            lineHeight: "20px",
                          }}
                        >
                          Date:
                        </span>
                        <span
                          className="flex-1 border-b border-black"
                          style={{
                            minHeight: "20px",
                            verticalAlign: "middle",
                            display: "inline-block",
                          }}
                        >
                          <span
                            className="px-1"
                            style={{
                              fontSize: "12px",
                              fontFamily: "Times New Roman, serif",
                              lineHeight: "20px",
                              margin: "0",
                              padding: "0 2px",
                              boxSizing: "border-box",
                              display: "block",
                            }}
                          >
                            {formData.dateField1 || ""}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Affidavit Section */}
                  <div
                    className="space-y-1 mt-8"
                    style={{ fontSize: "12px", textAlign: "justify" }}
                  >
                    <p className="mb-0" style={{ marginTop: "20px" }}>
                      Who having been first duly sworn depose and say
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "4px",
                        marginTop: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          verticalAlign: "baseline",
                          display: "inline",
                          lineHeight: "20px",
                          marginRight: "4px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        that
                      </span>
                      <span
                        className="inline-block border-b border-black"
                        style={{
                          minHeight: "20px",
                          minWidth: "350px",
                          verticalAlign: "middle",
                          flex: "0 0 auto",
                        }}
                      >
                        <span
                          className="px-1"
                          style={{
                            fontSize: "12px",
                            fontFamily: "Times New Roman, serif",
                            lineHeight: "20px",
                            margin: "0",
                            padding: "0 2px",
                            boxSizing: "border-box",
                            display: "block",
                          }}
                        >
                          {formData.exhibitName || ""}
                        </span>
                      </span>
                      <span
                        style={{
                          verticalAlign: "middle",
                          display: "inline-block",
                          lineHeight: "20px",
                          whiteSpace: "nowrap",
                          marginLeft: "4px",
                        }}
                      >
                        has never been shown to have exhibited
                      </span>
                    </div>
                    <p style={{ marginTop: "2px" }}>
                      any violent or abusive behavior or intentional or grossly
                      negligent misconduct.
                    </p>
                    <p>
                      Also have never been accused or convicted to have been
                      abused, neglected, sexually assaulted, exploited, or
                      deprived any person or to have subjected any person to
                      serious injury as a result of intentional or grossly
                      negligent misconduct as evidence by an oral or written
                      statement to this effect obtained at the time of
                      application.
                    </p>
                  </div>

                  {/* Witness Section */}
                  <div className="space-y-4 mt-2" style={{ fontSize: "12px" }}>
                    <div className="flex items-baseline gap-4 mt-4">
                      <div
                        className="flex items-baseline gap-1"
                        style={{ flex: "1.5" }}
                      >
                        <span
                          className="whitespace-nowrap"
                          style={{
                            verticalAlign: "middle",
                            display: "inline-block",
                            lineHeight: "20px",
                          }}
                        >
                          <b>Pr</b>int Name:
                        </span>
                        <span
                          className="flex-1 border-b border-black"
                          style={{
                            minHeight: "20px",
                            verticalAlign: "middle",
                            display: "inline-block",
                          }}
                        >
                          <span
                            className="px-1"
                            style={{
                              fontSize: "12px",
                              fontFamily: "Times New Roman, serif",
                              lineHeight: "20px",
                              margin: "0",
                              padding: "0 2px",
                              boxSizing: "border-box",
                              display: "block",
                            }}
                          >
                            {formData.printName || ""}
                          </span>
                        </span>
                      </div>
                      <div
                        className="flex items-baseline gap-1"
                        style={{ flex: "1.2" }}
                      >
                        <span
                          className="whitespace-nowrap"
                          style={{
                            verticalAlign: "middle",
                            display: "inline-block",
                            lineHeight: "20px",
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
                          <span
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
                          </span>
                        </span>
                      </div>
                      <div
                        className="flex items-baseline gap-1"
                        style={{ flex: "0.8" }}
                      >
                        <span
                          className="whitespace-nowrap"
                          style={{
                            verticalAlign: "middle",
                            display: "inline-block",
                            lineHeight: "20px",
                          }}
                        >
                          Date:
                        </span>
                        <span
                          className="flex-1 border-b border-black"
                          style={{
                            minHeight: "20px",
                            verticalAlign: "middle",
                            display: "inline-block",
                          }}
                        >
                          <span
                            className="px-1"
                            style={{
                              fontSize: "12px",
                              fontFamily: "Times New Roman, serif",
                              lineHeight: "20px",
                              margin: "0",
                              padding: "0 2px",
                              boxSizing: "border-box",
                              display: "block",
                            }}
                          >
                            {formData.dateField2 || ""}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notary Affidavit Section */}
                  <div className="space-y-2 mt-8" style={{ fontSize: "12px" }}>
                    <p
                      className="italic font-bold"
                      style={{ marginTop: "10px", fontWeight: "bold" }}
                    >
                      Notary Affidavit
                    </p>
                    <p className="text-xs sm:text-sm">State of: Georgia</p>

                    <p
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "4px",
                        flexWrap: "nowrap",
                      }}
                    >
                      <span style={{ whiteSpace: "nowrap" }}>
                        Sworn and subscribed before me this
                      </span>
                      <span
                        className="border-b border-black inline-block text-center"
                        style={{
                          width: "40px",
                          minHeight: "20px",
                          verticalAlign: "middle",
                          flex: "0 0 auto",
                        }}
                      >
                        <span
                          className="text-center px-1"
                          style={{
                            fontSize: "12px",
                            fontFamily: "Times New Roman, serif",
                            lineHeight: "20px",
                            margin: "0",
                            padding: "0 2px",
                            boxSizing: "border-box",
                            display: "block",
                          }}
                        >
                          {formData.notaryDay || ""}
                        </span>
                      </span>
                      <span style={{ whiteSpace: "nowrap" }}>day of</span>
                      <span
                        className="border-b border-black inline-block"
                        style={{
                          width: "70px",
                          minHeight: "20px",
                          verticalAlign: "middle",
                          flex: "0 0 auto",
                        }}
                      >
                        <span
                          className="px-1"
                          style={{
                            fontSize: "12px",
                            fontFamily: "Times New Roman, serif",
                            lineHeight: "20px",
                            margin: "0",
                            padding: "0 2px",
                            boxSizing: "border-box",
                            display: "block",
                          }}
                        >
                          {formData.notaryMonth || ""}
                        </span>
                      </span>
                      <span style={{ whiteSpace: "nowrap" }}>Year</span>
                      <span
                        className="border-b border-black inline-block text-center"
                        style={{
                          width: "50px",
                          minHeight: "20px",
                          verticalAlign: "middle",
                          flex: "0 0 auto",
                        }}
                      >
                        <span
                          className="text-center px-1"
                          style={{
                            fontSize: "12px",
                            fontFamily: "Times New Roman, serif",
                            lineHeight: "20px",
                            margin: "0",
                            padding: "0 2px",
                            boxSizing: "border-box",
                            display: "block",
                          }}
                        >
                          {formData.notaryYear || ""}
                        </span>
                      </span>
                    </p>

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
                          <span
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
                          </span>
                        </span>
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
