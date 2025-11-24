import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  FileText,
  Target,
  Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

const DirectDepositFormHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [applicationId, setApplicationId] = useState(null);
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [notes, setNotes] = useState("");
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const baseURL = import.meta.env.VITE__BASEURL;

  const [formData, setFormData] = useState({
    companyName: "Care Smart LLC / 39 18167860",
    employeeName: "",
    employeeNumber: "",
    accounts: [
      {
        action: "",
        accountType: "",
        accountHolderName: "",
        routingNumber: "",
        accountNumber: "",
        bankName: "",
        depositType: "",
        depositPercent: "",
        depositAmount: "",
        depositRemainder: false,
        lastFourDigits: "",
      },
      {
        action: "",
        accountType: "",
        accountHolderName: "",
        routingNumber: "",
        accountNumber: "",
        bankName: "",
        depositType: "",
        depositPercent: "",
        depositAmount: "",
        depositRemainder: false,
        lastFourDigits: "",
      },
      {
        action: "",
        accountType: "",
        accountHolderName: "",
        routingNumber: "",
        accountNumber: "",
        bankName: "",
        depositType: "",
        depositPercent: "",
        depositAmount: "",
        depositRemainder: false,
        lastFourDigits: "",
      },
    ],
    employeeSignature: "",
    employeeDate: "",
    employerName: "",
    employerSignature: "",
    employerDate: "",
  });

  useEffect(() => {
    initializeForm();
  }, []);

  useEffect(() => {
    if (applicationId) {
      loadDirectDepositData();
    }
  }, [applicationId]);

  const loadDirectDepositData = async () => {
    try {
      if (!applicationId) return;

      const response = await axios.get(
        `${baseURL}/onboarding/get-direct-deposit/${applicationId}`,
        { withCredentials: true }
      );

      if (response.data?.directDeposit) {
        const depositData = response.data.directDeposit;

        // Map the flat structure to the accounts array structure
        const mappedFormData = {
          companyName:
            depositData.companyName || "Care Smart LLC / 39 18167860",
          employeeName: depositData.employeeName || "",
          employeeNumber: depositData.employeeNumber || "",
          accounts: [
            {
              action: depositData.accounts_1_action || "",
              accountType: depositData.accounts_1_accountType || "",
              accountHolderName: depositData.accounts_1_accountHolderName || "",
              routingNumber: depositData.accounts_1_routingNumber || "",
              accountNumber: depositData.accounts_1_accountNumber || "",
              bankName: depositData.accounts_1_bankName || "",
              depositType: depositData.accounts_1_depositType || "",
              depositPercent: depositData.accounts_1_depositPercent || "",
              depositAmount: depositData.accounts_1_depositAmount || "",
              depositRemainder:
                depositData.accounts_1_depositRemainder || false,
              lastFourDigits: depositData.accounts_1_lastFourDigits || "",
            },
            {
              action: depositData.accounts_2_action || "",
              accountType: depositData.accounts_2_accountType || "",
              accountHolderName: depositData.accounts_2_accountHolderName || "",
              routingNumber: depositData.accounts_2_routingNumber || "",
              accountNumber: depositData.accounts_2_accountNumber || "",
              bankName: depositData.accounts_2_bankName || "",
              depositType: depositData.accounts_2_depositType || "",
              depositPercent: depositData.accounts_2_depositPercent || "",
              depositAmount: depositData.accounts_2_depositAmount || "",
              depositRemainder:
                depositData.accounts_2_depositRemainder || false,
              lastFourDigits: depositData.accounts_2_lastFourDigits || "",
            },
            {
              action: depositData.accounts_3_action || "",
              accountType: depositData.accounts_3_accountType || "",
              accountHolderName: depositData.accounts_3_accountHolderName || "",
              routingNumber: depositData.accounts_3_routingNumber || "",
              accountNumber: depositData.accounts_3_accountNumber || "",
              bankName: depositData.accounts_3_bankName || "",
              depositType: depositData.accounts_3_depositType || "",
              depositPercent: depositData.accounts_3_depositPercent || "",
              depositAmount: depositData.accounts_3_depositAmount || "",
              depositRemainder:
                depositData.accounts_3_depositRemainder || false,
              lastFourDigits: depositData.accounts_3_lastFourDigits || "",
            },
          ],
          employeeSignature: depositData.employeeSignature || "",
          employeeDate: depositData.employeeDate || "",
          employerName: depositData.employerName || "",
          employerSignature: depositData.employerSignature || "",
          employerDate: depositData.employerDate || "",
        };

        setFormData(mappedFormData);

        // Check if form has meaningful data
        const hasData =
          mappedFormData.employeeName?.trim() ||
          mappedFormData.employeeNumber?.trim() ||
          mappedFormData.accounts.some(
            (acc) =>
              acc.action?.trim() ||
              acc.routingNumber?.trim() ||
              acc.accountNumber?.trim() ||
              acc.accountHolderName?.trim()
          );
        setIsFormCompleted(hasData);

        if (depositData.hrFeedback) {
          setExistingFeedback(depositData.hrFeedback);
        }
      } else {
        setIsFormCompleted(false);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error loading Direct Deposit data:", error);
      }
      setIsFormCompleted(false);
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

        // Calculate progress
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
        formType: "DirectDeposit",
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
      const element = document.querySelector(".direct-deposit-page");
      if (!element) {
        toast.error("Form element not found");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("Direct_Deposit_Form.pdf");
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrevious = () => {
    navigate(-1);
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={handlePrevious}
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

          <div className="text-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Direct Deposit Enrollment/Change Form - HR Review
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Paychex Form (HR Review)
            </p>
          </div>

          {/* Form Content */}
          <div className="direct-deposit-page max-w-4xl mx-auto bg-white p-6">
            {/* Header */}
            <div className="mb-4 border-t-[3px] border-black pt-4">
              <div className="text-center">
                <h1
                  className="text-4xl font-black tracking-wide italic mb-0"
                  style={{
                    fontFamily: "Arial Black, sans-serif",
                    letterSpacing: "-0.05em",
                    fontWeight: "900",
                  }}
                >
                  PAYCHEX
                </h1>
              </div>
              <div className="text-center">
                <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-black font-[Arial,Helvetica,sans-serif]">
                  Direct Deposit Enrollment/Change Form*
                </h2>
              </div>
            </div>

            {/* Company and Employee Info */}
            <div className="mb-3 text-[13px] text-black">
              <div className="mb-2">
                <span className="font-bold">
                  Company Name and/or Client Number
                </span>
                <input
                  type="text"
                  value={formData.companyName}
                  readOnly
                  className="border-0 border-b border-black outline-none bg-[#DDE5FE] ml-2 px-1 text-[13px] py-0"
                  style={{ width: "600px", height: "20px" }}
                />
              </div>
              <div className="mb-2">
                <span className="font-bold">Employee/Worker Name</span>
                <input
                  type="text"
                  value={formData.employeeName}
                  readOnly
                  className="border-0 border-b border-black outline-none bg-[#DDE5FE] ml-2 px-1 text-[13px] py-0"
                  style={{ width: "350px", height: "20px" }}
                />
                <span className="font-bold ml-6">Employee/Worker Number</span>
                <input
                  type="text"
                  value={formData.employeeNumber}
                  readOnly
                  className="border-0 border-b border-black outline-none bg-[#DDE5FE] ml-2 px-1 text-[13px] py-0"
                  style={{ width: "100px", height: "20px" }}
                />
              </div>
              <p className="text-[10px] mb-0.5 pl-4 text-black">
                <span className="font-bold">Employee/Worker:</span> Retain a
                copy of this form for your records. Return the original to your
                employer/company.
              </p>
              <p className="text-[10px] pl-4 text-black">
                <span className="font-bold">Employer/Company:</span> Please
                retain a copy of this document for your records.
              </p>
            </div>

            {/* Main Form Section */}
            <div className="border-[2px] border-black">
              <div className="bg-black text-white px-2 py-1.5 text-[10px] font-bold text-center">
                COMPLETE TO ENROLL / ADD / CHANGE BANK ACCOUNTS –{" "}
                <span className="italic">
                  PLEASE PRINT CLEARLY IN BLACK/BLUE INK ONLY
                </span>
              </div>

              {/* Account 1 */}
              <div className="border-b-[5px] border-black">
                {/* Action Row */}
                <div className="flex border-t border-b border-black text-[10px] text-black">
                  <div className="flex items-center px-2 py-1.5 border-r border-black">
                    <input
                      type="checkbox"
                      checked={formData.accounts[0].action === "add"}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">Add new</label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 border-r border-black">
                    <input
                      type="checkbox"
                      checked={formData.accounts[0].action === "update"}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">
                      Update existing account
                    </label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 border-r border-black">
                    <input
                      type="checkbox"
                      checked={formData.accounts[0].action === "replace"}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">
                      Replace existing account
                    </label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 flex-1">
                    <label className="whitespace-nowrap mr-2">
                      Last 4 digits of the existing account number
                    </label>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((digitIndex) => (
                        <input
                          key={digitIndex}
                          type="text"
                          maxLength="1"
                          value={
                            (formData.accounts[0].lastFourDigits || "")[
                              digitIndex
                            ] || ""
                          }
                          readOnly
                          className="w-6 h-6 text-center border border-black px-0 py-0 outline-none bg-[#DDE5FE] text-[13px] font-bold"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Account Type Row */}
                <div className="flex border-b border-black text-[10px] text-black">
                  <div className="flex items-center px-2 py-1.5 whitespace-nowrap">
                    Type of Account
                  </div>
                  <div className="flex items-center px-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={formData.accounts[0].accountType === "checking"}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">Checking</label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 border-r border-black">
                    <input
                      type="checkbox"
                      checked={formData.accounts[0].accountType === "savings"}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">Savings</label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 flex-1">
                    <label className="whitespace-nowrap mr-1">
                      Account holder's Name:
                    </label>
                    <input
                      type="text"
                      value={formData.accounts[0].accountHolderName}
                      readOnly
                      className="flex-1 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px]"
                    />
                  </div>
                </div>

                {/* Routing Number Row */}
                <div className="flex border-b border-black text-[10px] text-black">
                  <div className="flex items-center px-2 py-1.5 whitespace-nowrap w-44">
                    Routing/Transit Number
                  </div>
                  <div className="flex-1 px-2 py-1.5">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((digitIndex) => (
                        <input
                          key={digitIndex}
                          type="text"
                          maxLength="1"
                          value={
                            (formData.accounts[0].routingNumber || "")[
                              digitIndex
                            ] || ""
                          }
                          readOnly
                          className="w-6 h-6 text-center border border-black px-0 py-0 outline-none bg-[#DDE5FE] text-[13px] font-bold"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Account Number Row */}
                <div className="flex border-b border-black text-[10px] text-black">
                  <div className="flex items-center px-2 py-1.5 whitespace-nowrap w-44">
                    Checking/Savings Account Number**
                  </div>
                  <div className="flex-1 px-2 py-1.5">
                    <div className="flex gap-1">
                      {[
                        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
                        16,
                      ].map((digitIndex) => (
                        <input
                          key={digitIndex}
                          type="text"
                          maxLength="1"
                          value={
                            (formData.accounts[0].accountNumber || "")[
                              digitIndex
                            ] || ""
                          }
                          readOnly
                          className="w-6 h-6 text-center border border-black px-0 py-0 outline-none bg-[#DDE5FE] text-[13px] font-bold"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bank Name Row */}
                <div className="flex border-b border-black text-[10px]">
                  <div className="flex items-center px-2 py-1.5 whitespace-nowrap w-44">
                    Financial Institution ("Bank") Name
                  </div>
                  <div className="flex-1 px-2 py-1.5 border-0">
                    <input
                      type="text"
                      value={formData.accounts[0].bankName}
                      readOnly
                      className="w-full px-1 py-0 outline-none bg-[#DDE5FE] text-[13px] border-0 border-b border-black"
                    />
                  </div>
                </div>

                {/* Deposit Amount Row */}
                <div className="flex border-b border-black text-[10px]">
                  <div className="flex items-center px-2 py-1.5 whitespace-nowrap">
                    I wish to deposit (check one):
                  </div>
                  <div className="flex items-center px-2 py-1.5 border-0">
                    <input
                      type="text"
                      value={formData.accounts[0].depositPercent}
                      readOnly
                      className="w-10 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px] mr-1"
                    />
                    <label className="whitespace-nowrap">% of Net</label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 border-0">
                    <label className="whitespace-nowrap mr-1">
                      Specific Dollar Amount $
                    </label>
                    <input
                      type="text"
                      value={formData.accounts[0].depositAmount}
                      readOnly
                      className="w-20 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px]"
                    />
                    <span className="ml-1 text-[13px] self-center">.00</span>
                  </div>
                  <div className="flex items-center px-2 py-1.5 flex-1">
                    <input
                      type="checkbox"
                      checked={formData.accounts[0].depositRemainder}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">
                      Remainder of Net Pay
                    </label>
                  </div>
                </div>
              </div>

              {/* Account 2 */}
              <div className="border-b-[5px] border-black">
                {/* Action Row */}
                <div className="flex border-t border-b border-black text-[10px] text-black">
                  <div className="flex items-center px-2 py-1.5 border-r border-black">
                    <input
                      type="checkbox"
                      checked={formData.accounts[1].action === "add"}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">Add new</label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 border-r border-black">
                    <input
                      type="checkbox"
                      checked={formData.accounts[1].action === "update"}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">
                      Update existing account
                    </label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 border-r border-black">
                    <input
                      type="checkbox"
                      checked={formData.accounts[1].action === "replace"}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">
                      Replace existing account
                    </label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 flex-1">
                    <label className="whitespace-nowrap mr-2">
                      Last 4 digits of the existing account number
                    </label>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((digitIndex) => (
                        <input
                          key={digitIndex}
                          type="text"
                          maxLength="1"
                          value={
                            (formData.accounts[1].lastFourDigits || "")[
                              digitIndex
                            ] || ""
                          }
                          readOnly
                          className="w-6 h-6 text-center border border-black px-0 py-0 outline-none bg-[#DDE5FE] text-[13px] font-bold"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Account Type Row */}
                <div className="flex border-b border-black text-[10px]">
                  <div className="flex items-center px-2 py-1.5  whitespace-nowrap">
                    Type of Account
                  </div>
                  <div className="flex items-center px-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={formData.accounts[1].accountType === "checking"}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">Checking</label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 border-r border-black">
                    <input
                      type="checkbox"
                      checked={formData.accounts[1].accountType === "savings"}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">Savings</label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 flex-1">
                    <label className=" whitespace-nowrap mr-1">
                      Account holder's Name:
                    </label>
                    <input
                      type="text"
                      value={formData.accounts[1].accountHolderName}
                      readOnly
                      className="flex-1 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px]"
                    />
                  </div>
                </div>

                {/* Routing Number Row */}
                <div className="flex border-b border-black text-[10px]">
                  <div className="flex items-center px-2 py-1.5 whitespace-nowrap w-44">
                    Routing/Transit Number
                  </div>
                  <div className="flex-1 px-2 py-1.5">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((digitIndex) => (
                        <input
                          key={digitIndex}
                          type="text"
                          maxLength="1"
                          value={
                            (formData.accounts[1].routingNumber || "")[
                              digitIndex
                            ] || ""
                          }
                          readOnly
                          className="w-6 h-6 text-center border border-black px-0 py-0 outline-none bg-[#DDE5FE] text-[13px] font-bold"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Account Number Row */}
                <div className="flex border-b border-black text-[10px]">
                  <div className="flex items-center px-2 py-1.5  whitespace-nowrap w-44">
                    Checking/Savings Account Number**
                  </div>
                  <div className="flex-1 px-2 py-1.5">
                    <div className="flex gap-1">
                      {[
                        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
                        16,
                      ].map((digitIndex) => (
                        <input
                          key={digitIndex}
                          type="text"
                          maxLength="1"
                          value={
                            (formData.accounts[1].accountNumber || "")[
                              digitIndex
                            ] || ""
                          }
                          readOnly
                          className="w-6 h-6 text-center border border-black px-0 py-0 outline-none bg-[#DDE5FE] text-[13px] font-bold"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bank Name Row */}
                <div className="flex border-b border-black text-[10px]">
                  <div className="flex items-center px-2 py-1.5 whitespace-nowrap w-44">
                    Financial Institution ("Bank") Name
                  </div>
                  <div className="flex-1 px-2 py-1.5 border-0">
                    <input
                      type="text"
                      value={formData.accounts[1].bankName}
                      readOnly
                      className="w-full px-1 py-0 outline-none bg-[#DDE5FE] text-[13px] border-0 border-b border-black"
                    />
                  </div>
                </div>

                {/* Deposit Amount Row */}
                <div className="flex border-b border-black text-[10px]">
                  <div className="flex items-center px-2 py-1.5 whitespace-nowrap">
                    I wish to deposit (check one):
                  </div>
                  <div className="flex items-center px-2 py-1.5 border-0">
                    <input
                      type="text"
                      value={formData.accounts[1].depositPercent}
                      readOnly
                      className="w-10 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px] mr-1"
                    />
                    <label className="whitespace-nowrap">% of Net</label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 border-0">
                    <label className="whitespace-nowrap mr-1">
                      Specific Dollar Amount $
                    </label>
                    <input
                      type="text"
                      value={formData.accounts[1].depositAmount}
                      readOnly
                      className="w-20 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px]"
                    />
                    <span className="ml-1 text-[13px] self-center">.00</span>
                  </div>
                  <div className="flex items-center px-2 py-1.5 flex-1">
                    <input
                      type="checkbox"
                      checked={formData.accounts[1].depositRemainder}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">
                      Remainder of Net Pay
                    </label>
                  </div>
                </div>
              </div>

              {/* Account 3 */}
              <div className="border-b-[5px] border-black">
                {/* Action Row */}
                <div className="flex border-t border-b border-black text-[10px] text-black">
                  <div className="flex items-center px-2 py-1.5 border-r border-black">
                    <input
                      type="checkbox"
                      checked={formData.accounts[2].action === "add"}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">Add new</label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 border-r border-black">
                    <input
                      type="checkbox"
                      checked={formData.accounts[2].action === "update"}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">
                      Update existing account
                    </label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 border-r border-black">
                    <input
                      type="checkbox"
                      checked={formData.accounts[2].action === "replace"}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">
                      Replace existing account
                    </label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 flex-1">
                    <label className="whitespace-nowrap mr-2">
                      Last 4 digits of the existing account number
                    </label>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((digitIndex) => (
                        <input
                          key={digitIndex}
                          type="text"
                          maxLength="1"
                          value={
                            (formData.accounts[2].lastFourDigits || "")[
                              digitIndex
                            ] || ""
                          }
                          readOnly
                          className="w-6 h-6 text-center border border-black px-0 py-0 outline-none bg-[#DDE5FE] text-[13px] font-bold"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Account Type Row */}
                <div className="flex border-b border-black text-[10px]">
                  <div className="flex items-center px-2 py-1.5  whitespace-nowrap">
                    Type of Account
                  </div>
                  <div className="flex items-center px-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={formData.accounts[2].accountType === "checking"}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">Checking</label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 border-r border-black">
                    <input
                      type="checkbox"
                      checked={formData.accounts[2].accountType === "savings"}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">Savings</label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 flex-1">
                    <label className=" whitespace-nowrap mr-1">
                      Account holder's Name:
                    </label>
                    <input
                      type="text"
                      value={formData.accounts[2].accountHolderName}
                      readOnly
                      className="flex-1 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px]"
                    />
                  </div>
                </div>

                {/* Routing Number Row */}
                <div className="flex border-b border-black text-[10px]">
                  <div className="flex items-center px-2 py-1.5 whitespace-nowrap w-44">
                    Routing/Transit Number
                  </div>
                  <div className="flex-1 px-2 py-1.5">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((digitIndex) => (
                        <input
                          key={digitIndex}
                          type="text"
                          maxLength="1"
                          value={
                            (formData.accounts[2].routingNumber || "")[
                              digitIndex
                            ] || ""
                          }
                          readOnly
                          className="w-6 h-6 text-center border border-black px-0 py-0 outline-none bg-[#DDE5FE] text-[13px] font-bold"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Account Number Row */}
                <div className="flex border-b border-black text-[10px]">
                  <div className="flex items-center px-2 py-1.5  whitespace-nowrap w-44">
                    Checking/Savings Account Number**
                  </div>
                  <div className="flex-1 px-2 py-1.5">
                    <div className="flex gap-1">
                      {[
                        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
                        16,
                      ].map((digitIndex) => (
                        <input
                          key={digitIndex}
                          type="text"
                          maxLength="1"
                          value={
                            (formData.accounts[2].accountNumber || "")[
                              digitIndex
                            ] || ""
                          }
                          readOnly
                          className="w-6 h-6 text-center border border-black px-0 py-0 outline-none bg-[#DDE5FE] text-[13px] font-bold"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bank Name Row */}
                <div className="flex border-b border-black text-[10px]">
                  <div className="flex items-center px-2 py-1.5 whitespace-nowrap w-44">
                    Financial Institution ("Bank") Name
                  </div>
                  <div className="flex-1 px-2 py-1.5 border-0">
                    <input
                      type="text"
                      value={formData.accounts[2].bankName}
                      readOnly
                      className="w-full px-1 py-0 outline-none bg-[#DDE5FE] text-[13px] border-0 border-b border-black"
                    />
                  </div>
                </div>

                {/* Deposit Amount Row */}
                <div className="flex border-b border-black text-[10px]">
                  <div className="flex items-center px-2 py-1.5 whitespace-nowrap">
                    I wish to deposit (check one):
                  </div>
                  <div className="flex items-center px-2 py-1.5 border-0">
                    <input
                      type="text"
                      value={formData.accounts[2].depositPercent}
                      readOnly
                      className="w-10 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px] mr-1"
                    />
                    <label className="whitespace-nowrap">% of Net</label>
                  </div>
                  <div className="flex items-center px-2 py-1.5 border-0">
                    <label className="whitespace-nowrap mr-1">
                      Specific Dollar Amount $
                    </label>
                    <input
                      type="text"
                      value={formData.accounts[2].depositAmount}
                      readOnly
                      className="w-20 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px]"
                    />
                    <span className="ml-1 text-[13px] self-center">.00</span>
                  </div>
                  <div className="flex items-center px-2 py-1.5 flex-1">
                    <input
                      type="checkbox"
                      checked={formData.accounts[2].depositRemainder}
                      readOnly
                      className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                    />
                    <label className="whitespace-nowrap">
                      Remainder of Net Pay
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Statement */}
            <div className="mt-4 border-[2px] border-black">
              <div className="bg-black text-white px-2 py-1.5 text-[10px] font-bold text-center">
                CONFIRMATION STATEMENT –{" "}
                <span className="italic">
                  PLEASE PRINT CLEARLY IN BLACK/BLUE INK ONLY
                </span>
              </div>
              <div className="p-3 text-[10px] leading-tight text-black">
                <p className="mb-3">
                  I authorize my employer/company to deposit and I authorize my
                  earnings into the bank account(s) specified above and, if
                  necessary, to electronically debit the account to correct
                  erroneous credits. I understand that this authorization will
                  remain in effect until I notify Company in writing that I wish
                  to revoke it. I certify the account number accurately reflects
                  my intended receiving account. I agree that direct deposit
                  transactions I authorize comply with all applicable laws. My
                  signature below indicates that I am agreeing to all terms that
                  are set forth in this document. I further agree that the
                  authority of the accountholder to authorize my
                  employer/company make direct deposits into the named account.
                  I understand that this authorization will remain in full force
                  and effect until I notify Company in writing that I wish to
                  revoke my authorization and understand that the Company
                  requires at least 5 business days prior notice to cancel this
                  authorization.
                </p>

                <div className="flex items-center mb-3">
                  <label className="font-bold whitespace-nowrap mr-2">
                    Employee/Worker Signature:
                  </label>
                  <input
                    type="text"
                    value={formData.employeeSignature}
                    readOnly
                    className="flex-1 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px] mr-4"
                    style={{ fontFamily: "Brush Script MT, cursive" }}
                  />
                  <label className="font-bold whitespace-nowrap mr-2">
                    Date:
                  </label>
                  <input
                    type="text"
                    value={formData.employeeDate}
                    readOnly
                    className="w-28 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px]"
                  />
                </div>

                <p className="mb-3">
                  I confirm that the above named employee/worker has passed or
                  changed a bank account for direct deposit transactions
                  processed by Paychex, Inc. I have reviewed the information
                  provided and it is accurate to the best of my knowledge. My
                  signature below indicates that I have the authority to execute
                  this document on behalf of the Client.
                </p>

                <div className="flex items-center mb-3">
                  <label className="font-bold whitespace-nowrap mr-2">
                    Employer/Company Representative Printed Name:
                  </label>
                  <input
                    type="text"
                    value={formData.employerName}
                    readOnly
                    className="flex-1 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px]"
                  />
                </div>

                <div className="flex items-center mb-3">
                  <label className="font-bold whitespace-nowrap mr-2">
                    Employer/Company Representative Signature:
                  </label>
                  <input
                    type="text"
                    value={formData.employerSignature}
                    readOnly
                    className="flex-1 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px] mr-4"
                    style={{ fontFamily: "Brush Script MT, cursive" }}
                  />
                  <label className="font-bold whitespace-nowrap mr-2">
                    Date:
                  </label>
                  <input
                    type="text"
                    value={formData.employerDate}
                    readOnly
                    className="w-28 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px]"
                  />
                </div>

                <div className="bg-gray-100 p-2 text-[10px] leading-tight text-black">
                  <p className="mb-1">
                    <span className="font-bold">
                      * All fields are required unless noted.
                    </span>{" "}
                    <span className="ml-8">M/DD/YY</span>
                  </p>
                  <p className="mb-1">
                    <span className="font-bold">
                      ** Certain accounts may have restrictions on deposits and
                      withdrawals.
                    </span>{" "}
                    Check with your bank for more information specific to your
                    account.
                  </p>
                  <p className="italic">
                    <span className="font-bold">Note:</span> Digital or
                    Electronic Signatures are not acceptable.
                  </p>
                </div>

                <div className="text-right mt-2 text-[10px] text-black">
                  <p>DP0002 10/20</p>
                  <p>Form Expires 10/31/23</p>
                </div>
              </div>
            </div>
          </div>

          {/* Download PDF Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleDownloadFormAsPDF}
              disabled={downloading}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
                downloading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] hover:from-[#16306e] hover:to-[#1F3A93] shadow-md hover:shadow-lg"
              }`}
            >
              {downloading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
              {downloading ? "Generating PDF..." : "Download as PDF"}
            </button>
          </div>

          {/* Progress Section */}
          <div className="mt-8 mx-8 sm:mx-16 lg:mx-32 xl:mx-40">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 max-w-2xl mx-auto">
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
                📝 Current: Direct Deposit Form
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
              placeholder="Add your notes about this direct deposit form review..."
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
              onClick={() => navigate(`/hr/w9-form/${employeeId}`)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous: W-9 Form
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Exit to Dashboard
            </button>
            <button
              onClick={() =>
                navigate(`/hr/orientation-presentation/${employeeId}`)
              }
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Next: Orientation Presentation
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DirectDepositFormHR;
