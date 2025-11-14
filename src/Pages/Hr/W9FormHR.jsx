import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Target, CheckCircle, FileText, Send } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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

export default function W9FormHR() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const baseURL = import.meta.env.VITE__BASEURL;
  const [loading, setLoading] = useState(true);
  const [applicationId, setApplicationId] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [notes, setNotes] = useState("");
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    taxClassification: "",
    llcClassification: "",
    otherClassification: "",
    foreignPartners: false,
    exemptPayeeCode: "",
    fatcaCode: "",
    address: "",
    requesterInfo: "",
    city: "",
    accountNumbers: "",
    ssn: Array(9).fill(""),
    ein: Array(9).fill(""),
    signature: "",
    signatureDate: "",
  });
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Refs for TIN inputs
  const ssnInputs = useRef([]);
  const einInputs = useRef([]);

  useEffect(() => {
    initializeForm();
  }, []);

  useEffect(() => {
    if (applicationId) {
      loadW9FormData();
    }
  }, [applicationId]);

  const loadW9FormData = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-w9-form/${applicationId}`,
        { withCredentials: true }
      );

      if (response.data?.w9Form) {
        const data = response.data.w9Form;
        setFormData({
          name: data.name || "",
          businessName: data.businessName || "",
          taxClassification: data.taxClassification || "",
          llcClassification: data.llcClassification || "",
          otherClassification: "",
          foreignPartners: data.foreignPartners || false,
          exemptPayeeCode: data.exemptPayeeCode || "",
          fatcaCode: data.fatcaCode || "",
          address: data.address || "",
          requesterInfo: "",
          city: data.city || "",
          accountNumbers: data.accountNumbers || "",
          ssn: data.ssn || Array(9).fill(""),
          ein: data.ein || Array(9).fill(""),
          signature: data.signature || "",
          signatureDate: data.signatureDate
            ? new Date(data.signatureDate).toISOString().split("T")[0]
            : "",
        });
        const hasData =
          data.name ||
          data.businessName ||
          data.taxClassification ||
          data.address ||
          data.city ||
          data.signature ||
          (data.ssn && data.ssn.some((d) => d)) ||
          (data.ein && data.ein.some((d) => d));
        setIsFormCompleted(hasData);
      } else {
        setIsFormCompleted(false);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error loading W9 form:", error);
      }
    }
  };

  const initializeForm = async () => {
    try {
      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        { withCredentials: true }
      );

      if (appResponse.data?.data?.application) {
        setApplicationId(appResponse.data.data.application._id);

        const backendData = appResponse.data.data;
        const forms = backendData.forms || {};
        const completedFormsArray =
          backendData.application?.completedForms || [];
        const completedSet = new Set(completedFormsArray);

        const completedForms = FORM_KEYS.filter((key) => {
          const form = forms[key];
          return (
            form?.status === "submitted" ||
            form?.status === "completed" ||
            form?.status === "under_review" ||
            form?.status === "approved" ||
            completedSet.has(key)
          );
        }).length;

        const percentage = Math.round(
          (completedForms / FORM_KEYS.length) * 100
        );
        setOverallProgress(percentage);
        setCompletedFormsCount(completedForms);
      }

      // Load existing HR feedback
      const feedbackResponse = await axios.get(
        `${baseURL}/onboarding/get-w9-form/${appResponse.data.data.application._id}`,
        { withCredentials: true }
      );
      if (feedbackResponse.data?.w9Form?.hrFeedback) {
        setExistingFeedback(feedbackResponse.data.w9Form.hrFeedback);
      }
    } catch (error) {
      console.error("Error initializing form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotes = async () => {
    if (!notes.trim()) {
      toast.error("Please enter some notes before sending.");
      return;
    }

    try {
      const payload = {
        userId: employeeId,
        notes: notes.trim(),
        formType: "W9Form",
        timestamp: new Date().toISOString(),
      };

      const response = await axios.post(
        `${baseURL}/onboarding/submit-notes`,
        payload,
        { withCredentials: true }
      );

      if (
        response.data &&
        response.data.message === "HR feedback submitted successfully"
      ) {
        toast.success("Notes sent successfully!");
        setNotes("");
        if (response.data.form && response.data.form.hrFeedback) {
          setExistingFeedback(response.data.form.hrFeedback);
        }
      } else {
        toast.error(
          `Failed to send notes: ${response.data?.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error sending notes:", error);
      toast.error("Failed to send notes. Please try again.");
    }
  };

  const handleDownloadFormAsPDF = async () => {
    setDownloading(true);
    try {
      const pdf = new jsPDF("p", "in", [8.5, 20]);
      const pages = document.querySelectorAll(".w9-page");

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 4,
          useCORS: true,
          backgroundColor: "#ffffff",
          allowTaint: true,
          letterRendering: true,
          logging: false,
        });
        const imgData = canvas.toDataURL("image/png");

        const pageWidth = 8.5;
        const aspectRatio = canvas.width / canvas.height;

        const finalWidth = pageWidth;
        const finalHeight = pageWidth / aspectRatio;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, finalWidth, finalHeight);
      }

      pdf.save("W9_Form.pdf");
      toast.success("Form downloaded as PDF");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrevious = () => {
    navigate(-1);
  };

  // Helper to create TIN input fields (read-only)
  const createTinInputs = (type, lengths) => {
    const inputRefs = type === "ssn" ? ssnInputs : einInputs;
    let digitIndex = 0;

    const gridClass =
      type === "ssn"
        ? "tin-display-container-grid grid-ssn"
        : "tin-display-container-grid grid-ein";

    return (
      <div
        className={gridClass}
        style={{
          border: "1px solid black",
          height: "25px",
          overflow: "hidden",
        }}
      >
        {lengths.map((length, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {Array.from({ length }, (_, i) => {
              const currentIndex = digitIndex++;

              let needsRightBorder = true;

              const isEndOfGroup =
                i === length - 1 && groupIndex < lengths.length - 1;

              const isAbsoluteLastDigit = currentIndex === 8;

              if (isEndOfGroup || isAbsoluteLastDigit) {
                needsRightBorder = false;
              }

              const borderStyle = needsRightBorder ? "1px solid black" : "none";

              return (
                <input
                  key={`${type}-${currentIndex}`}
                  type="text"
                  value={formData[type][currentIndex]}
                  className={`w-full h-full text-center text-[11px] font-sans p-0 m-0 box-border`}
                  style={{
                    border: "none",
                    borderRight: borderStyle,
                    boxSizing: "border-box",
                  }}
                  readOnly
                />
              );
            })}
            {groupIndex < lengths.length - 1 && (
              <span
                className="tin-separator-simple"
                style={{
                  width: "10px",
                  height: "100%",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "11px",
                  boxSizing: "border-box",
                  borderLeft: "1px solid black",
                  borderRight: "1px solid black",
                }}
              >
                –
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
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
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8">
          {/* Status Banner */}
          {!loading && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                isFormCompleted
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {isFormCompleted ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  {isFormCompleted ? (
                    <p className="text-base font-semibold text-green-800">
                      ✅ Progress Updated - Form Completed Successfully
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
              W-9 Form
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Request for Taxpayer Identification Number and Certification (HR
              Review)
            </p>
          </div>

          <div
            className="p-4 bg-white text-black w9-page"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: "12pt",
            }}
          >
            <style>{`
        input[type="text"] {
          outline: none;
          font-family: Arial, sans-serif;
          background: transparent;
        }
        
        input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          width: 10px;
          height: 10px;
          border: 0.8px solid black;
          background-color: white;
          vertical-align: middle;
          margin: 0 3px 0 0;
          padding: 0;
          position: relative;
          display: inline-block;
          top: -1px;
        }
        
        input[type="checkbox"]:checked::after {
          content: 'X';
          font-family: Arial, sans-serif;
          font-weight: bold;
          font-size: 8px;
          color: black;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          line-height: 1;
        }

        .tin-display-container-grid {
          display: grid;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }
        
        .grid-ssn {
             grid-template-columns: repeat(3, 1fr) 10px repeat(2, 1fr) 10px repeat(4, 1fr);
        }
        
        .grid-ein {
             grid-template-columns: repeat(2, 1fr) 10px repeat(7, 1fr);
        }

        .tin-label {
          font-size: 8.5pt; 
          font-weight: bold;
          margin-bottom: 2px;
          border: 1px solid black; 
          border-bottom: none;
          padding: 2px 4px;
          display: inline-block;
          width: 100%; 
          box-sizing: border-box;
        }
      `}</style>

            <form>
              <div style={{ border: "3px solid black" }}>
                {/* Top Header Row */}
                <div
                  className="flex"
                  style={{ borderBottom: "3px solid black" }}
                >
                  {/* Form W-9 Section */}
                  <div
                    style={{
                      width: "180px",
                      padding: "6px 8px",
                      borderRight: "1px solid black",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10pt",
                        lineHeight: "1",
                        marginBottom: "2px",
                      }}
                    >
                      Form
                    </div>
                    <div
                      style={{
                        fontSize: "50pt",
                        fontWeight: "900",
                        lineHeight: "0.8",
                        fontFamily: "Arial Black, sans-serif",
                        letterSpacing: "-3px",
                      }}
                    >
                      W-9
                    </div>
                    <div
                      style={{
                        fontSize: "7.5pt",
                        lineHeight: "1.1",
                        marginTop: "2px",
                      }}
                    >
                      (Rev. March 2024)
                    </div>
                    <div style={{ fontSize: "7.5pt", lineHeight: "1.1" }}>
                      Department of the Treasury
                    </div>
                    <div style={{ fontSize: "7.5pt", lineHeight: "1.1" }}>
                      Internal Revenue Service
                    </div>
                  </div>

                  {/* Center Title */}
                  <div
                    className="flex-1 flex flex-col justify-center items-center text-center"
                    style={{
                      padding: "10px 16px",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "18pt",
                        fontWeight: "bold",
                        lineHeight: "1.05",
                      }}
                    >
                      Request for Taxpayer
                    </div>
                    <div
                      style={{
                        fontSize: "18pt",
                        fontWeight: "bold",
                        lineHeight: "1.05",
                      }}
                    >
                      Identification Number and Certification
                    </div>
                    <div
                      style={{
                        fontSize: "8.5pt",
                        marginTop: "6px",
                        lineHeight: "1.2",
                      }}
                    >
                      <span style={{ fontWeight: "bold" }}>
                        Go to{" "}
                        <span style={{ fontStyle: "italic" }}>
                          www.irs.gov/FormW9
                        </span>{" "}
                        for instructions and the latest information.
                      </span>
                    </div>
                  </div>

                  {/* Right Instructions */}
                  <div
                    style={{
                      width: "140px",
                      padding: "6px 8px",
                      borderLeft: "1px solid black",
                      textAlign: "left",
                      fontWeight: "bold",
                      fontSize: "9.5pt",
                      lineHeight: "1.25",
                      fontFamily: "Arial, sans-serif",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    <div>
                      <div>Give form to the</div>
                      <div>requester. Do not</div>
                      <div>send to the IRS.</div>
                    </div>
                  </div>
                </div>

                {/* Before you begin */}
                <div
                  style={{
                    padding: "5px 8px",
                    borderBottom: "1px solid black",
                    fontSize: "8.5pt",
                    lineHeight: "1.25",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>Before you begin.</span>{" "}
                  For guidance related to the purpose of Form W-9, see{" "}
                  <span style={{ fontStyle: "italic" }}>Purpose of Form</span>,
                  below.
                </div>

                {/* Main Content */}
                <div style={{ padding: "8px" }}>
                  {/* Line 1 (Full width, inside box) */}
                  <div style={{ marginBottom: "6px" }}>
                    <div
                      style={{
                        fontSize: "10pt",
                        marginBottom: "2px",
                        lineHeight: "1.2",
                      }}
                    >
                      <span style={{ fontWeight: "bold" }}>1</span>
                      &nbsp;&nbsp;Name of entity/individual. An entry is
                      required. (For a sole proprietor or disregarded entity,
                      enter the owner's name on line 1, and enter the
                      business/disregarded entity's name on line 2.))
                    </div>
                    <div
                      style={{
                        borderBottom: "1px solid black",
                        height: "22px",
                      }}
                    >
                      <input
                        type="text"
                        value={formData.name}
                        style={{
                          width: "100%",
                          border: "none",
                          height: "100%",
                          paddingLeft: "2px",
                          fontSize: "9pt",
                        }}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Line 2 (Full width, inside box) */}
                  <div style={{ marginBottom: "6px" }}>
                    <div
                      style={{
                        fontSize: "10pt",
                        marginBottom: "2px",
                        lineHeight: "1.2",
                      }}
                    >
                      <span style={{ fontWeight: "bold" }}>2</span>
                      &nbsp;&nbsp;Business name/disregarded entity name, if
                      different from above.
                    </div>
                    <div
                      style={{
                        borderBottom: "1px solid black",
                        height: "22px",
                      }}
                    >
                      <input
                        type="text"
                        value={formData.businessName}
                        style={{
                          width: "100%",
                          border: "none",
                          height: "100%",
                          paddingLeft: "2px",
                          fontSize: "9pt",
                        }}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* REFACTORED SECTION (Lines 3, 4, 5, 6, 7) - FLEX CONTAINER FOR COLUMNS AND LINE 7 */}
                  <div
                    style={{
                      border: "1px solid black",
                      marginBottom: "6px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Row 1: Vertical Label and Two Main Columns */}
                    <div style={{ display: "flex", flexGrow: 1 }}>
                      {/* Child 1: Vertical "Print or type" text */}
                      <div
                        style={{
                          width: "55px",
                          borderRight: "1px solid black",
                          padding: "6px 2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "Arial, sans-serif",
                          alignSelf: "stretch",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            transform: "rotate(-90deg)",
                            whiteSpace: "nowrap",
                            fontSize: "8pt",
                            fontWeight: "bold",
                            width: "200px",
                            textAlign: "center",
                            lineHeight: "1.2",
                          }}
                        >
                          Print or type.
                          <br />
                          See Specific Instructions on page 3.
                        </div>
                      </div>

                      {/* Child 2: Main Content Area (Split into two columns) */}
                      <div style={{ flex: 1, display: "flex" }}>
                        {/* Left Column (Line 3, 5, 6) - NARROWER (flex: 1.5) */}
                        <div
                          style={{
                            flex: "1.5",
                            borderRight: "1px solid black",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* 3a and 3b content */}
                          <div style={{ padding: "6px 8px" }}>
                            <div
                              style={{
                                fontSize: "9pt",
                                marginBottom: "8px",
                                lineHeight: "1.2",
                              }}
                            >
                              <span style={{ fontWeight: "bold" }}>3a</span>
                              &nbsp;&nbsp;Check the appropriate box for federal
                              tax classification of the entity/individual whose
                              name is entered on line 1. Check{" "}
                              <span style={{ fontWeight: "bold" }}>
                                only one
                              </span>{" "}
                              of the following seven boxes.
                            </div>

                            {/* Checkboxes - All on one line */}
                            <div
                              style={{
                                fontSize: "9pt",
                                marginBottom: "10px",
                                fontFamily: "Arial, sans-serif",
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    formData.taxClassification === "individual"
                                  }
                                  readOnly
                                />
                                <span>Individual/sole proprietor</span>
                              </label>
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    formData.taxClassification === "c-corp"
                                  }
                                  readOnly
                                />
                                <span>C corporation</span>
                              </label>
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    formData.taxClassification === "s-corp"
                                  }
                                  readOnly
                                />
                                <span>S corporation</span>
                              </label>
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    formData.taxClassification === "partnership"
                                  }
                                  readOnly
                                />
                                <span>Partnership</span>
                              </label>
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    formData.taxClassification === "trust"
                                  }
                                  readOnly
                                />
                                <span>Trust/estate</span>
                              </label>
                            </div>

                            {/* LLC line */}
                            <div
                              style={{
                                fontSize: "9pt",
                                marginBottom: "10px",
                                fontFamily: "Arial, sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                flexWrap: "nowrap",
                              }}
                            >
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.taxClassification === "llc"}
                                  readOnly
                                />
                                <span>
                                  LLC. Enter the tax classification (C = C corp,
                                  S = S corp, P = Partnership) . . . .
                                </span>
                              </label>
                              <input
                                type="text"
                                value={formData.llcClassification}
                                style={{
                                  width: "28px",
                                  height: "16px",
                                  border: "none",
                                  borderBottom: "1px solid black",
                                  textAlign: "center",
                                  fontSize: "9pt",
                                  flexShrink: 0,
                                }}
                                maxLength="1"
                                readOnly
                              />
                            </div>

                            {/* Note */}
                            <div
                              style={{
                                fontSize: "7.5pt",
                                marginBottom: "10px",
                                marginLeft: "14px",
                                lineHeight: "1.15",
                              }}
                            >
                              <span style={{ fontWeight: "bold" }}>Note:</span>{" "}
                              Check the "LLC" box above and, in the entity
                              space, enter the appropriate code (C, S, or P) for
                              the tax classification of the LLC, unless it is a
                              disregarded entity. A disregarded entity should
                              instead check the appropriate box for the tax
                              classification of its owner.
                            </div>

                            {/* Other */}
                            <div
                              style={{
                                fontSize: "9pt",
                                marginBottom: "10px",
                                fontFamily: "Arial, sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                flexWrap: "wrap",
                              }}
                            >
                              <label
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    formData.taxClassification === "other"
                                  }
                                  readOnly
                                />
                                <span>Other (see instructions)</span>
                              </label>
                              <input
                                type="text"
                                value={formData.otherClassification}
                                style={{
                                  width: "180px",
                                  height: "16px",
                                  border: "none",
                                  borderBottom: "1px solid black",
                                  textAlign: "center",
                                  fontSize: "9pt",
                                }}
                                readOnly
                              />
                            </div>

                            {/* Line 3b */}
                            <div
                              style={{
                                fontSize: "9pt",
                                paddingTop: "5px",
                                borderTop: "1px solid black",
                                lineHeight: "1.2",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: "8px",
                              }}
                            >
                              <span>
                                <span style={{ fontWeight: "bold" }}>3b</span>
                                &nbsp;&nbsp;If on line 3a you checked
                                "Partnership" or "Trust/estate," or checked
                                "LLC" and entered "P" as its tax classification,
                                and you are providing this form to a
                                partnership, trust, or estate in which you have
                                an ownership interest, check this box if you
                                have any foreign partners, owners, or
                                beneficiaries. See
                                instructions&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.
                              </span>
                              <input
                                type="checkbox"
                                checked={formData.foreignPartners}
                                readOnly
                                style={{ flexShrink: 0, marginTop: "2px" }}
                              />
                            </div>
                          </div>

                          {/* Line 5 */}
                          <div
                            style={{
                              borderTop: "1px solid black",
                              padding: "6px 8px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "9pt",
                                marginBottom: "2px",
                                lineHeight: "1.2",
                              }}
                            >
                              <span style={{ fontWeight: "bold" }}>5</span>
                              &nbsp;&nbsp;Address (number, street, and apt. or
                              suite no.). See instructions.
                            </div>
                            <div
                              style={{
                                borderBottom: "1px solid black",
                                height: "22px",
                              }}
                            >
                              <input
                                type="text"
                                value={formData.address}
                                style={{
                                  width: "100%",
                                  border: "none",
                                  height: "100%",
                                  paddingLeft: "2px",
                                  fontSize: "9pt",
                                }}
                                readOnly
                              />
                            </div>
                          </div>

                          {/* Line 6 */}
                          <div
                            style={{
                              borderTop: "1px solid black",
                              padding: "6px 8px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "9pt",
                                marginBottom: "2px",
                                lineHeight: "1.2",
                              }}
                            >
                              <span style={{ fontWeight: "bold" }}>6</span>
                              &nbsp;&nbsp;City, state, and ZIP code
                            </div>
                            <div
                              style={{
                                borderBottom: "1px solid black",
                                height: "22px",
                              }}
                            >
                              <input
                                type="text"
                                value={formData.city}
                                style={{
                                  width: "100%",
                                  border: "none",
                                  height: "100%",
                                  paddingLeft: "2px",
                                  fontSize: "9pt",
                                }}
                                readOnly
                              />
                            </div>
                          </div>

                          {/* Empty space filler for flex column matching height */}
                          <div
                            style={{
                              flexGrow: 1,
                              borderTop: "1px solid black",
                            }}
                          ></div>
                        </div>

                        {/* Right Column (Line 4, Requester) - FLEX: 1 */}
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* Line 4a */}
                          <div
                            style={{
                              padding: "6px 8px",
                              fontSize: "9pt",
                              lineHeight: "1.2",
                            }}
                          >
                            <span style={{ fontWeight: "bold" }}>4</span>
                            &nbsp;&nbsp;Exemptions (codes apply only to certain
                            entities, not individuals; see instructions).
                            <div style={{ fontSize: "9pt", marginTop: "10px" }}>
                              Exempt payee code (if any)
                            </div>
                            <div
                              style={{
                                borderBottom: "1px solid black",
                                height: "22px",
                                width: "100px",
                                marginTop: "2px",
                              }}
                            >
                              <input
                                type="text"
                                value={formData.exemptPayeeCode}
                                style={{
                                  width: "100%",
                                  border: "none",
                                  height: "100%",
                                  paddingLeft: "2px",
                                  fontSize: "9pt",
                                }}
                                maxLength="1"
                                readOnly
                              />
                            </div>
                          </div>

                          {/* Line 4b - BORDER REMOVED */}
                          <div
                            style={{
                              padding: "6px 8px",
                              fontSize: "9pt",
                              lineHeight: "1.2",
                            }}
                          >
                            <div style={{ fontSize: "9pt" }}>
                              Exemption from FATCA reporting code (if any)
                            </div>
                            <div
                              style={{
                                borderBottom: "1px solid black",
                                height: "22px",
                                width: "100px",
                                marginTop: "8px",
                              }}
                            >
                              <input
                                type="text"
                                value={formData.fatcaCode}
                                style={{
                                  width: "100%",
                                  border: "none",
                                  height: "100%",
                                  paddingLeft: "2px",
                                  fontSize: "9pt",
                                }}
                                maxLength="1"
                                readOnly
                              />
                            </div>
                            <div style={{ fontSize: "9pt", marginTop: "10px" }}>
                              (Applies to accounts maintained outside the U.S.)
                            </div>
                          </div>

                          {/* Requester Info - MODIFIED for flex grow */}
                          <div
                            style={{
                              borderTop: "1px solid black",
                              padding: "6px 8px",
                              fontSize: "9pt",
                              lineHeight: "1.2",
                              flexGrow: 1,
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <div>Requester's name and address (optional)</div>
                            <div
                              style={{
                                border: "1px solid black",
                                marginTop: "2px",
                                padding: "2px",
                                flexGrow: 1,
                              }}
                            >
                              <textarea
                                value={formData.requesterInfo}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  border: "none",
                                  fontSize: "9pt",
                                  fontFamily: "Arial, sans-serif",
                                  minHeight: "50px",
                                }}
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Line 7 - FULL WIDTH (to the right of the vertical label) */}
                    <div
                      style={{ borderTop: "1px solid black", display: "flex" }}
                    >
                      <div
                        style={{
                          width: "55px",
                          borderRight: "1px solid black",
                          padding: "6px 2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "Arial, sans-serif",
                          flexShrink: 0,
                        }}
                      >
                        {/* Empty space to align with Print/Type label on the left */}
                      </div>
                      <div style={{ flex: 1, padding: "6px 8px" }}>
                        <div
                          style={{
                            fontSize: "10pt",
                            marginBottom: "2px",
                            lineHeight: "1.2",
                          }}
                        >
                          <span style={{ fontWeight: "bold" }}>7</span>
                          &nbsp;&nbsp;List account number(s) here (optional)
                        </div>
                        <div
                          style={{
                            borderBottom: "1px solid black",
                            height: "22px",
                          }}
                        >
                          <input
                            type="text"
                            value={formData.accountNumbers}
                            style={{
                              width: "100%",
                              border: "none",
                              height: "100%",
                              paddingLeft: "2px",
                              fontSize: "9pt",
                            }}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* END REFACTORED SECTION */}

                  {/* Part I Header */}
                  <div
                    style={{
                      background: "black",
                      color: "white",
                      padding: "3px 8px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                      fontSize: "10.5pt",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    Part I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Taxpayer
                    Identification Number (TIN)
                  </div>

                  {/* Part I Content */}
                  <div
                    className="flex"
                    style={{ marginBottom: "10px", gap: "10px" }}
                  >
                    {/* Part I Text - NARROWER (flex: 1) */}
                    <div
                      style={{ flex: 1, fontSize: "10pt", lineHeight: "1.25" }}
                    >
                      <p style={{ marginBottom: "6px" }}>
                        Enter your TIN in the appropriate box. The TIN provided
                        must match the name given on line 1 to avoid backup
                        withholding. For individuals, this is generally your
                        social security number (SSN). However, for a resident
                        alien, sole proprietor, or disregarded entity, see the
                        instructions for Part I, later. For other entities, it
                        is your employer identification number (EIN). If you do
                        not have a number, see{" "}
                        <span style={{ fontStyle: "italic" }}>
                          How to get a TIN
                        </span>
                        , later.
                      </p>
                      <p style={{ fontWeight: "bold", marginBottom: "0" }}>
                        Note: If the account is in more than one name, see the
                        instructions for line 1. See also{" "}
                        <span style={{ fontStyle: "italic" }}>
                          What Name and Number To Give the Requester
                        </span>{" "}
                        for guidelines on whose number to enter.
                      </p>
                    </div>

                    {/* TIN Input Boxes - WIDER (width: 300px) */}
                    <div
                      style={{
                        width: "300px",
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      <div className="tin-label" style={{ width: "100%" }}>
                        Social security number
                      </div>
                      <div style={{ marginBottom: "5px" }}>
                        {/* SSN: 3-2-4 grouping */}
                        {createTinInputs("ssn", [3, 2, 4])}
                      </div>

                      <div
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "11pt",
                          margin: "5px 0",
                        }}
                      >
                        or
                      </div>

                      <div className="tin-label" style={{ width: "100%" }}>
                        Employer identification number
                      </div>
                      <div>
                        {/* EIN: 2-7 grouping */}
                        {createTinInputs("ein", [2, 7])}
                      </div>
                    </div>
                  </div>

                  {/* Part II Header */}
                  <div
                    style={{
                      background: "black",
                      color: "white",
                      padding: "3px 8px",
                      marginBottom: "6px",
                      fontWeight: "bold",
                      fontSize: "10.5pt",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    Part II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Certification
                  </div>

                  {/* Certification Text */}
                  <div
                    style={{
                      fontSize: "10pt",
                      lineHeight: "1.25",
                      marginBottom: "8px",
                    }}
                  >
                    <p style={{ marginBottom: "3px" }}>
                      Under penalties of perjury, I certify that:
                    </p>
                    <p style={{ marginBottom: "3px" }}>
                      1. The number shown on this form is my correct taxpayer
                      identification number (or I am waiting for a number to be
                      issued to me); and
                    </p>
                    <p style={{ marginBottom: "3px" }}>
                      2. I am not subject to backup withholding because (a) I am
                      exempt from backup withholding, or (b) I have not been
                      notified by the Internal Revenue Service (IRS) that I am
                      subject to backup withholding as a result of a failure to
                      report all interest or dividends, or (c) the IRS has
                      notified me that I am no longer subject to backup
                      withholding; and
                    </p>
                    <p style={{ marginBottom: "3px" }}>
                      3. I am a U.S. citizen or other U.S. person (defined
                      below); and
                    </p>
                    <p style={{ marginBottom: "6px" }}>
                      4. The FATCA code(s) entered on this form (if any)
                      indicating that I am exempt from FATCA reporting is
                      correct.
                    </p>
                    <p style={{ marginBottom: "0" }}>
                      <span style={{ fontWeight: "bold" }}>
                        Certification instructions.
                      </span>{" "}
                      You must cross out item 2 above if you have been notified
                      by the IRS that you are currently subject to backup
                      withholding because you have failed to report all interest
                      and dividends on your tax return. For real estate
                      transactions, item 2 does not apply. For mortgage interest
                      paid, acquisition or abandonment of secured property,
                      cancellation of debt, contributions to an individual
                      retirement arrangement (IRA), and, generally, payments
                      other than interest and dividends, you are not required to
                      sign the certification, but you must provide your correct
                      TIN. See the instructions for Part II, later.
                    </p>
                  </div>

                  {/* Signature Line */}
                  <div
                    className="flex"
                    style={{
                      borderTop: "2px solid black",
                      paddingTop: "6px",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    <div
                      style={{
                        width: "75px",
                        fontWeight: "bold",
                        fontSize: "9.5pt",
                        paddingRight: "10px",
                        lineHeight: "1.1",
                      }}
                    >
                      Sign
                      <br />
                      Here
                    </div>
                    <div
                      style={{
                        flex: 1,
                        borderRight: "1px solid black",
                        paddingRight: "10px",
                      }}
                    >
                      <input
                        type="text"
                        value={formData.signature}
                        placeholder="Type your signature"
                        style={{
                          width: "100%",
                          border: "none",
                          borderBottom: "1px solid black",
                          height: "32px",
                          marginBottom: "3px",
                          paddingLeft: "4px",
                          fontSize: "10pt",
                          fontFamily: "Brush Script MT, cursive",
                        }}
                        readOnly
                      />
                      <div style={{ fontSize: "7.5pt" }}>
                        Signature of U.S. person
                      </div>
                    </div>
                    <div style={{ width: "175px", paddingLeft: "10px" }}>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "9.5pt",
                          marginBottom: "3px",
                        }}
                      >
                        Date
                      </div>
                      <input
                        type="date"
                        value={formData.signatureDate}
                        style={{
                          width: "100%",
                          border: "none",
                          borderBottom: "1px solid black",
                          height: "32px",
                          paddingLeft: "4px",
                          fontSize: "9pt",
                        }}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* General Instructions Section */}
            <div
              style={{
                marginTop: "14px",
                fontSize: "10pt",
                lineHeight: "1.25",
                display: "flex",
                gap: "18px",
              }}
            >
              {/* Left Column (General Instructions, What's New) */}
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontWeight: "bold",
                    marginBottom: "6px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11pt",
                  }}
                >
                  General Instructions
                </h3>
                <p style={{ marginBottom: "6px" }}>
                  Section references are to the Internal Revenue Code unless
                  otherwise noted.
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <span style={{ fontWeight: "bold" }}>
                    Future developments.
                  </span>{" "}
                  For the latest information about developments related to Form
                  W-9 and its instructions, such as legislation enacted after
                  they were published, go to{" "}
                  <span style={{ fontStyle: "italic" }}>
                    www.irs.gov/FormW9
                  </span>
                  .
                </p>

                <h3
                  style={{
                    fontWeight: "bold",
                    marginBottom: "6px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11pt",
                  }}
                >
                  What's New
                </h3>
                <p style={{ marginBottom: "10px" }}>
                  Line 3a has been modified to clarify how a disregarded entity
                  completes this line. An LLC that is a disregarded entity
                  should check the appropriate box for the tax classification of
                  its owner. Otherwise, it should check the "LLC" box and enter
                  its appropriate tax classification.
                </p>
              </div>

              {/* Right Column (Instructions part 2, Purpose of Form) */}
              <div style={{ flex: 1 }}>
                <p style={{ marginBottom: "10px" }}>
                  New line 3b has been added to this form. A flow-through entity
                  is required to check line 3b to indicate that it has one or
                  more direct or indirect foreign partners, owners, or
                  beneficiaries when it provides the Form W-9 to another
                  flow-through entity in which it has an ownership interest.
                  This change is intended to provide a flow-through entity with
                  information regarding the status of its direct and indirect
                  foreign partners, owners, or beneficiaries, so that it can
                  satisfy any applicable reporting requirements. See, for
                  example, a partnership that may be required to complete
                  Schedules K-2 and K-3. See the Partnership Instructions for
                  Schedules K-2 and K-3 (Form 1065).
                </p>

                <h3
                  style={{
                    fontWeight: "bold",
                    marginBottom: "6px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11pt",
                  }}
                >
                  Purpose of Form
                </h3>
                <p>
                  An individual or entity (Form W-9 requester) who is required
                  to file an information return with the IRS is giving you this
                  form because they
                </p>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex justify-between items-center"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "7.5pt",
                marginTop: "10px",
              }}
            >
              <div>Cat. No. 10231X</div>
              <div>
                Form <span style={{ fontWeight: "bold" }}>W-9</span> (Rev.
                3-2024)
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="mb-4 space-y-2">
            <button
              onClick={handleDownloadFormAsPDF}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1F3A93] text-white rounded hover:bg-[#16307E] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {downloading ? "Downloading..." : "Download Form as PDF"}
            </button>
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
                  {completedFormsCount}/20
                </div>
                <div className="text-xs text-gray-600">Forms Completed</div>
              </div>
            </div>
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">Overall Progress</span>
                <span className="text-xs font-semibold text-blue-600">
                  {overallProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* HR Notes Section */}
          <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              HR Notes & Feedback
            </h3>

            {/* Display existing HR feedback */}
            {existingFeedback && (
              <div className="bg-white p-4 rounded-md border border-gray-200 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Previous HR Feedback:
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {existingFeedback.comment}
                </p>
                <div className="text-xs text-gray-500">
                  <span>
                    Reviewed by: {existingFeedback.reviewedBy || "HR"}
                  </span>
                  {existingFeedback.reviewedAt && (
                    <span className="ml-4">
                      Date:{" "}
                      {new Date(
                        existingFeedback.reviewedAt
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about this W-9 form review..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1F3A93] focus:border-[#1F3A93] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">
                {notes.length}/500 characters
              </span>
              <button
                onClick={handleSendNotes}
                disabled={!notes.trim()}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  notes.trim()
                    ? "bg-[#1F3A93] text-white hover:bg-[#1A3280] focus:ring-2 focus:ring-[#1F3A93]/20 shadow-sm hover:shadow-md"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Send className="h-4 w-4" />
                Send Notes
              </button>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 items-center px-6 md:px-8 pb-6 mt-8">
            <button
              onClick={() => navigate(`/hr/w4-form/${employeeId}`)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous: W-4 Form
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Exit to Dashboard
            </button>
            <button
              onClick={() => navigate(`/hr/direct-deposit-form/${employeeId}`)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Next: Direct Deposit
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
