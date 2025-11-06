import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  CheckCircle,
  FileText,
  Send,
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

export default function DirectDepositFormHR() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const baseURL = import.meta.env.VITE__BASEURL;
  const [loading, setLoading] = useState(true);
  const [applicationId, setApplicationId] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    telephone: "",
    areaCode: "",
    personEntitled: "",
    claimId: "",
    accountType: "",
    paymentType: [],
    accountNumber: "",
    allotmentType: "",
    allotmentAmount: "",
    govAgencyName: "",
    govAgencyAddress: "",
    financialInstitution: "",
    routingNumber: "",
    checkDigit: "",
    accountTitle: "",
    repName: "",
    repTelephone: "",
    payeeSignature1: "",
    payeeDate1: "",
    payeeSignature2: "",
    payeeDate2: "",
    jointSignature1: "",
    jointDate1: "",
    jointSignature2: "",
    jointDate2: "",
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
      const response = await axios.get(
        `${baseURL}/onboarding/get-direct-deposit/${applicationId}`,
        { withCredentials: true }
      );

      if (response.data?.directDeposit) {
        const data = response.data.directDeposit;
        setFormData({
          name: data.name || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zipCode || "",
          telephone: data.telephone || "",
          areaCode: data.areaCode || "",
          personEntitled: data.personEntitled || "",
          claimId: data.claimId || "",
          accountType: data.accountType || "",
          paymentType: data.paymentType || [],
          accountNumber: data.accountNumber || "",
          allotmentType: data.allotmentType || "",
          allotmentAmount: data.allotmentAmount || "",
          govAgencyName: data.govAgencyName || "",
          govAgencyAddress: data.govAgencyAddress || "",
          financialInstitution: data.financialInstitution || "",
          routingNumber: data.routingNumber || "",
          checkDigit: data.checkDigit || "",
          accountTitle: data.accountTitle || "",
          repName: data.repName || "",
          repTelephone: data.repTelephone || "",
          payeeSignature1: data.payeeSignature1 || "",
          payeeDate1: data.payeeDate1 || "",
          payeeSignature2: data.payeeSignature2 || "",
          payeeDate2: data.payeeDate2 || "",
          jointSignature1: data.jointSignature1 || "",
          jointDate1: data.jointDate1 || "",
          jointSignature2: data.jointSignature2 || "",
          jointDate2: data.jointDate2 || "",
        });
        const hasData = Object.values(data).some(
          (value) =>
            value &&
            (Array.isArray(value)
              ? value.length > 0
              : value.toString().trim() !== "")
        );
        setIsFormCompleted(hasData);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error loading direct deposit data:", error);
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
        `${baseURL}/onboarding/get-direct-deposit/${appResponse.data.data.application._id}`,
        { withCredentials: true }
      );
      if (feedbackResponse.data?.directDeposit?.hrFeedback) {
        setExistingFeedback(feedbackResponse.data.directDeposit.hrFeedback);
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
        formType: "DirectDepositForm",
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
              Direct Deposit Form
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Standard Form 1199A - Direct Deposit Sign-Up (HR Review)
            </p>
          </div>

          <div className="p-4 bg-white font-sans direct-deposit-page">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="text-[9px] leading-tight">
                <div className="font-bold">Standard Form 1199A</div>
                <div>(Rev. April 2021)</div>
                <div>Prescribed by Treasury Department</div>
                <div>31 CFR 210, 240, 208, 210</div>
              </div>
              <div className="text-[9px]">OMB No. 1530-0006</div>
            </div>

            <h1 className="text-xl font-bold text-center mb-3">
              DIRECT DEPOSIT SIGN-UP FORM
            </h1>

            {/* Directions */}
            <div className="text-[9px] leading-tight mb-4">
              <div className="font-bold mb-1">DIRECTIONS</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <ul className="list-disc pl-3 space-y-0.5">
                    <li>
                      To sign up for Direct Deposit, the payee is to read the
                      back of this form and fill in the information requested in
                      Sections 1 and 2. Then take or mail this form to the
                      financial institution. The financial institution will
                      complete Section 3.
                    </li>
                    <li>
                      The completed form will be returned to the Government
                      agency identified below.
                    </li>
                    <li>
                      A separate form must be completed for each type of payment
                      to be sent by Direct Deposit.
                    </li>
                  </ul>
                </div>
                <div>
                  <ul className="list-disc pl-3 space-y-0.5">
                    <li>
                      The claim number and type of payment are printed on
                      Government checks. (See the sample check on the back of
                      this form.) This information is also stated on
                      beneficiary/annuitant award letters and other documents
                      from the Government agency.
                    </li>
                    <li>
                      Payees must keep the Government agency informed of any
                      address changes in order to receive important information
                      about benefits and to remain qualified for payments.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 1 */}
            <div className="border border-black">
              <div className="bg-[#d4d9f7] p-1.5 font-bold text-[10px] border-b border-black">
                SECTION 1{" "}
                <span className="font-normal italic">
                  (TO BE COMPLETED BY PAYEE)
                </span>
              </div>

              <div className="grid grid-cols-12">
                {/* Row A & D */}
                <div className="col-span-6 border-r border-black p-1.5">
                  <div className="text-[9px] font-bold mb-0.5">
                    A&nbsp;&nbsp;NAME OF PAYEE{" "}
                    <span className="font-normal italic">
                      (last, first, middle initial)
                    </span>
                  </div>
                  <input
                    type="text"
                    className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7]"
                    value={formData.name}
                    readOnly
                  />
                </div>
                <div className="col-span-6 p-1.5">
                  <div className="text-[9px] font-bold mb-0.5 flex items-center gap-2">
                    D&nbsp;&nbsp;TYPE OF DEPOSITOR ACCOUNT
                    <label className="flex items-center gap-0.5 font-normal ml-4">
                      <input
                        type="checkbox"
                        className="w-3 h-3"
                        checked={formData.accountType === "checking"}
                        readOnly
                      />
                      CHECKING
                    </label>
                    <label className="flex items-center gap-0.5 font-normal ml-2">
                      <input
                        type="checkbox"
                        className="w-3 h-3"
                        checked={formData.accountType === "savings"}
                        readOnly
                      />
                      SAVINGS
                    </label>
                  </div>
                  <div className="text-[9px] font-bold mb-0.5 mt-1">
                    E&nbsp;&nbsp;DEPOSITOR ACCOUNT NUMBER
                  </div>
                  <input
                    type="text"
                    className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7]"
                    value={formData.accountNumber}
                    readOnly
                  />
                </div>
              </div>

              {/* Address Row */}
              <div className="border-t border-black p-1.5">
                <div className="text-[9px] font-bold mb-0.5">
                  ADDRESS{" "}
                  <span className="font-normal italic">
                    (street, route, P.O. Box, APO/FPO)
                  </span>
                </div>
                <input
                  type="text"
                  className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7]"
                  value={formData.address}
                  readOnly
                />
              </div>

              {/* City, State, Zip & Payment Type */}
              <div className="grid grid-cols-12 border-t border-black">
                <div className="col-span-6 border-r border-black">
                  <div className="grid grid-cols-12">
                    <div className="col-span-5 border-r border-black p-1.5">
                      <div className="text-[9px] font-bold mb-0.5">CITY</div>
                      <input
                        type="text"
                        className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7]"
                        value={formData.city}
                        readOnly
                      />
                    </div>
                    <div className="col-span-3 border-r border-black p-1.5">
                      <div className="text-[9px] font-bold mb-0.5">STATE</div>
                      <input
                        type="text"
                        className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7]"
                        value={formData.state}
                        readOnly
                      />
                    </div>
                    <div className="col-span-4 p-1.5">
                      <div className="text-[9px] font-bold mb-0.5">
                        ZIP CODE
                      </div>
                      <input
                        type="text"
                        className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7]"
                        value={formData.zipCode}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="col-span-6 p-1.5">
                  <div className="text-[9px] font-bold mb-1">
                    F&nbsp;&nbsp;TYPE OF PAYMENT{" "}
                    <span className="font-normal italic">(Check only one)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 text-[8px] leading-tight">
                    <div className="space-y-0.5">
                      <label className="flex items-center gap-0.5">
                        <input
                          type="checkbox"
                          className="w-2.5 h-2.5 flex-shrink-0"
                          checked={formData.paymentType?.includes(
                            "Social Security"
                          )}
                          readOnly
                        />
                        <span>Social Security</span>
                      </label>
                      <label className="flex items-center gap-0.5">
                        <input
                          type="checkbox"
                          className="w-2.5 h-2.5 flex-shrink-0"
                          checked={formData.paymentType?.includes(
                            "Supplemental Security Income"
                          )}
                          readOnly
                        />
                        <span>Supplemental Security Income</span>
                      </label>
                      <label className="flex items-center gap-0.5">
                        <input
                          type="checkbox"
                          className="w-2.5 h-2.5 flex-shrink-0"
                          checked={formData.paymentType?.includes(
                            "Railroad Retirement"
                          )}
                          readOnly
                        />
                        <span>Railroad Retirement</span>
                      </label>
                      <label className="flex items-center gap-0.5">
                        <input
                          type="checkbox"
                          className="w-2.5 h-2.5 flex-shrink-0"
                          checked={formData.paymentType?.includes(
                            "Civil Service Retirement (OPM)"
                          )}
                          readOnly
                        />
                        <span>Civil Service Retirement (OPM)</span>
                      </label>
                      <label className="flex items-center gap-0.5">
                        <input
                          type="checkbox"
                          className="w-2.5 h-2.5 flex-shrink-0"
                          checked={formData.paymentType?.includes(
                            "VA Compensation or Pension"
                          )}
                          readOnly
                        />
                        <span>VA Compensation or Pension</span>
                      </label>
                    </div>
                    <div className="space-y-0.5">
                      <label className="flex items-center gap-0.5">
                        <input
                          type="checkbox"
                          className="w-2.5 h-2.5 flex-shrink-0"
                          checked={formData.paymentType?.includes(
                            "Fed. Salary/Mil. Civilian Pay"
                          )}
                          readOnly
                        />
                        <span>Fed. Salary/Mil. Civilian Pay</span>
                      </label>
                      <label className="flex items-center gap-0.5">
                        <input
                          type="checkbox"
                          className="w-2.5 h-2.5 flex-shrink-0"
                          checked={formData.paymentType?.includes(
                            "Mil. Active"
                          )}
                          readOnly
                        />
                        <span>Mil. Active</span>
                      </label>
                      <label className="flex items-center gap-0.5">
                        <input
                          type="checkbox"
                          className="w-2.5 h-2.5 flex-shrink-0"
                          checked={formData.paymentType?.includes(
                            "Mil. Retired"
                          )}
                          readOnly
                        />
                        <span>Mil. Retired</span>
                      </label>
                      <label className="flex items-center gap-0.5">
                        <input
                          type="checkbox"
                          className="w-2.5 h-2.5 flex-shrink-0"
                          checked={formData.paymentType?.includes(
                            "Mil. Survivor"
                          )}
                          readOnly
                        />
                        <span>Mil. Survivor</span>
                      </label>
                      <label className="flex items-center gap-0.5">
                        <input
                          type="checkbox"
                          className="w-2.5 h-2.5 flex-shrink-0"
                          checked={formData.paymentType?.includes("Other")}
                          readOnly
                        />
                        <span>Other</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Telephone & Allotment */}
              <div className="grid grid-cols-12 border-t border-black">
                <div className="col-span-6 border-r border-black">
                  <div className="grid grid-cols-2">
                    <div className="border-r border-black p-1.5">
                      <div className="text-[9px] font-bold mb-0.5">
                        TELEPHONE NUMBER
                      </div>
                      <input
                        type="text"
                        className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7]"
                        value={formData.telephone}
                        readOnly
                      />
                    </div>
                    <div className="p-1.5">
                      <div className="text-[9px] font-bold mb-0.5">
                        AREA CODE
                      </div>
                      <input
                        type="text"
                        className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7]"
                        value={formData.areaCode}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="col-span-6 p-1.5">
                  <div className="text-[9px] font-bold mb-0.5">
                    G&nbsp;&nbsp;THIS BOX FOR ALLOTMENT OF PAYMENT ONLY{" "}
                    <span className="font-normal italic">(if applicable)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <div className="text-[9px] font-bold mb-0.5">TYPE</div>
                      <input
                        type="text"
                        className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7]"
                        value={formData.allotmentType}
                        readOnly
                      />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold mb-0.5">AMOUNT</div>
                      <input
                        type="text"
                        className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7]"
                        value={formData.allotmentAmount}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Person Entitled & Claim ID */}
              <div className="grid grid-cols-2 border-t border-black">
                <div className="border-r border-black p-1.5">
                  <div className="text-[9px] font-bold mb-0.5">
                    B&nbsp;&nbsp;NAME OF PERSON(S) ENTITLED TO PAYMENT
                  </div>
                  <input
                    type="text"
                    className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7]"
                    value={formData.personEntitled}
                    readOnly
                  />
                </div>
                <div className="p-1.5">
                  <div className="text-[9px] font-bold mb-0.5">
                    C&nbsp;&nbsp;CLAIM OR PAYROLL ID NUMBER
                  </div>
                  <input
                    type="text"
                    className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7]"
                    value={formData.claimId}
                    readOnly
                  />
                </div>
              </div>

              {/* Certifications */}
              <div className="grid grid-cols-2 border-t border-black">
                <div className="border-r border-black p-1.5">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="text-[8px]">Prefix</div>
                    <input
                      type="text"
                      className="w-12 p-0.5 border-none text-[9px] bg-[#d4d9f7]"
                      readOnly
                    />
                    <div className="text-[8px]">Suffix</div>
                    <input
                      type="text"
                      className="w-12 p-0.5 border-none text-[9px] bg-[#d4d9f7]"
                      readOnly
                    />
                  </div>
                  <div className="text-[9px] font-bold text-center mb-1">
                    PAYEE/JOINT PAYEE CERTIFICATION
                  </div>
                  <div className="text-[7px] leading-tight mb-1">
                    I certify that I have read, understand, and agree to the
                    conditions stated in the Special Notice To Joint Account
                    Holders printed on the back side. I authorize the financial
                    institution named below to receive ACH credit entries, and
                    if necessary, ACH debit entries and adjustments for any ACH
                    credit entries made in error to the account indicated above.
                    I have read and understood the back of this form. In signing
                    this form, I authorize my payment to be sent to the
                    financial institution named below to be deposited to the
                    designated account.
                  </div>
                  <div className="grid grid-cols-2 gap-1 mb-1">
                    <div>
                      <div className="text-[8px] font-bold mb-0.5">
                        SIGNATURE
                      </div>
                      <input
                        type="text"
                        value={formData.payeeSignature1}
                        className="w-full p-0.5 border-none text-[9px] bg-[#d4d9f7] h-5"
                        readOnly
                      />
                    </div>
                    <div>
                      <div className="text-[8px] font-bold mb-0.5">DATE</div>
                      <input
                        type="text"
                        value={formData.payeeDate1}
                        className="w-full p-0.5 border-none text-[9px] bg-[#d4d9f7] h-5"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <div className="text-[8px] font-bold mb-0.5">
                        SIGNATURE
                      </div>
                      <input
                        type="text"
                        value={formData.payeeSignature2}
                        className="w-full p-0.5 border-none text-[9px] bg-[#d4d9f7] h-5"
                        readOnly
                      />
                    </div>
                    <div>
                      <div className="text-[8px] font-bold mb-0.5">DATE</div>
                      <input
                        type="text"
                        value={formData.payeeDate2}
                        className="w-full p-0.5 border-none text-[9px] bg-[#d4d9f7] h-5"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="p-1.5">
                  <div className="text-[9px] font-bold text-center mb-1">
                    JOINT ACCOUNT HOLDERS' CERTIFICATION
                  </div>
                  <div className="text-[7px] leading-tight mb-1">
                    I certify that I have read and understood the back of this
                    form, including the SPECIAL NOTICE TO JOINT ACCOUNT HOLDERS.
                  </div>
                  <div className="grid grid-cols-2 gap-1 mb-1">
                    <div>
                      <div className="text-[8px] font-bold mb-0.5">
                        SIGNATURE
                      </div>
                      <input
                        type="text"
                        value={formData.jointSignature1}
                        className="w-full p-0.5 border-none text-[9px] bg-[#d4d9f7] h-5"
                        readOnly
                      />
                    </div>
                    <div>
                      <div className="text-[8px] font-bold mb-0.5">DATE</div>
                      <input
                        type="text"
                        value={formData.jointDate1}
                        className="w-full p-0.5 border-none text-[9px] bg-[#d4d9f7] h-5"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <div className="text-[8px] font-bold mb-0.5">
                        SIGNATURE
                      </div>
                      <input
                        type="text"
                        value={formData.jointSignature2}
                        className="w-full p-0.5 border-none text-[9px] bg-[#d4d9f7] h-5"
                        readOnly
                      />
                    </div>
                    <div>
                      <div className="text-[8px] font-bold mb-0.5">DATE</div>
                      <input
                        type="text"
                        value={formData.jointDate2}
                        className="w-full p-0.5 border-none text-[9px] bg-[#d4d9f7] h-5"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="border border-black border-t-0">
              <div className="bg-[#d4d9f7] p-1.5 font-bold text-[10px] border-t border-black">
                SECTION 2{" "}
                <span className="font-normal italic">
                  (TO BE COMPLETED BY PAYEE OR FINANCIAL INSTITUTION)
                </span>
              </div>
              <div className="grid grid-cols-2">
                <div className="border-r border-black p-1.5">
                  <div className="text-[9px] font-bold mb-0.5">
                    GOVERNMENT AGENCY NAME
                  </div>
                  <textarea
                    className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7] h-16 resize-none"
                    value={formData.govAgencyName}
                    readOnly
                  />
                </div>
                <div className="p-1.5">
                  <div className="text-[9px] font-bold mb-0.5">
                    GOVERNMENT AGENCY ADDRESS
                  </div>
                  <textarea
                    className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7] h-16 resize-none"
                    value={formData.govAgencyAddress}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="border border-black border-t-0">
              <div className="bg-[#d4d9f7] p-1.5 font-bold text-[10px] border-t border-black">
                SECTION 3{" "}
                <span className="font-normal italic">
                  (TO BE COMPLETED BY FINANCIAL INSTITUTION)
                </span>
              </div>
              <div className="grid grid-cols-12">
                <div className="col-span-6 border-r border-black p-1.5">
                  <div className="text-[9px] font-bold mb-0.5">
                    NAME AND ADDRESS OF FINANCIAL INSTITUTION
                  </div>
                  <textarea
                    className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7] h-20 resize-none"
                    value={formData.financialInstitution}
                    readOnly
                  />
                </div>
                <div className="col-span-6 p-1.5">
                  <div className="text-[9px] font-bold mb-0.5">
                    ROUTING NUMBER
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(9)].map((_, i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength="1"
                        value={(formData.routingNumber || "")[i] || ""}
                        className="w-7 h-8 p-0.5 border-none text-[10px] text-center bg-[#d4d9f7]"
                        readOnly
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    <div>
                      <div className="text-[9px] font-bold mb-0.5">
                        CHECK DIGIT
                      </div>
                      <input
                        type="text"
                        className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7]"
                        value={formData.checkDigit}
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold mb-0.5">
                      DEPOSITOR ACCOUNT TITLE
                    </div>
                    <input
                      type="text"
                      className="w-full p-0.5 border-none text-[10px] bg-[#d4d9f7]"
                      value={formData.accountTitle}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-black p-1.5">
                <div className="text-[9px] font-bold text-center mb-1">
                  FINANCIAL INSTITUTION CERTIFICATION
                </div>
                <div className="text-[7px] leading-tight mb-1">
                  I confirm the identity of the above-named payee(s) and as an
                  account owner or authorized representative of the above-named
                  financial institution, I certify that the financial
                  institution agrees to receive and deposit the payment
                  identified above in accordance with 31 CFR Parts 240, 208, and
                  210.
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <div className="col-span-4">
                    <div className="text-[8px] font-bold mb-0.5">
                      PRINT OR TYPE REPRESENTATIVE'S NAME
                    </div>
                    <input
                      type="text"
                      className="w-full p-0.5 border-none text-[9px] bg-[#d4d9f7] h-5"
                      value={formData.repName}
                      readOnly
                    />
                  </div>
                  <div className="col-span-4">
                    <div className="text-[8px] font-bold mb-0.5">
                      SIGNATURE OF REPRESENTATIVE
                    </div>
                    <input
                      type="text"
                      className="w-full p-0.5 border-none text-[9px] bg-[#d4d9f7] h-5"
                      readOnly
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="text-[8px] font-bold mb-0.5">
                      TELEPHONE NUMBER
                    </div>
                    <input
                      type="text"
                      className="w-full p-0.5 border-none text-[9px] bg-[#d4d9f7] h-5"
                      value={formData.repTelephone}
                      readOnly
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="text-[8px] font-bold mb-0.5">DATE</div>
                    <input
                      type="text"
                      className="w-full p-0.5 border-none text-[9px] bg-[#d4d9f7] h-5"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-black p-1.5 flex justify-between items-center bg-white">
                <div className="text-[7px] leading-tight italic">
                  Financial institutions should refer to the GREEN BOOK for
                  further instructions.
                  <br />
                  THE FINANCIAL INSTITUTION SHOULD MAIL THE COMPLETED FORM TO
                  THE GOVERNMENT AGENCY IDENTIFIED ABOVE.
                </div>
                <button
                  className="px-3 py-1 border border-black text-[9px] font-bold hover:bg-gray-100"
                  disabled
                >
                  Reset
                </button>
              </div>

              <div className="border-t border-black p-1.5 flex justify-between text-[8px] bg-white">
                <div className="font-bold">GOVERNMENT AGENCY COPY</div>
                <div>1199-207</div>
              </div>
            </div>

            {/* Page 2 - Back of Form */}
            <div className="mt-8 max-w-5xl border-t-2 border-black pt-4">
              <div className="text-[8px] mb-3">SF 1199A (Back)</div>

              {/* Burden Estimate Statement */}
              <div className="border border-black mb-3">
                <div className="text-center font-bold text-[9px] py-1.5 border-b border-black">
                  BURDEN ESTIMATE STATEMENT
                </div>
                <div className="text-[7.5px] leading-snug p-2">
                  The estimated average burden associated with this collection
                  of information is 10 minutes per respondent or recordkeeper,
                  depending on individual circumstances. Comments concerning the
                  accuracy of this burden estimates and suggestions for reducing
                  this burden should be directed to the Bureau of the Fiscal
                  Service, Forms Management Officer, Parkersburg, WV 26106-1328.
                </div>
              </div>

              {/* Please Read This Carefully */}
              <div className="text-center font-bold text-[9px] mb-1.5">
                PLEASE READ THIS CAREFULLY
              </div>
              <div className="text-[7.5px] leading-snug mb-3 text-justify">
                All information on this form, including the individual claim
                number, SF 3222, 31 CFR 208 and/or 210. The information is
                confidential and is needed to prove entitlement to payments. The
                information will be used to process payment data from the
                Federal agency to the financial institution and/or its agent.
                Failure to provide the requested information may affect the
                processing of this form and may delay or prevent the receipt of
                payments through the Direct Deposit/Electronic Funds Transfer
                Program.
              </div>

              {/* Information Found on Checks */}
              <div className="text-[8px] font-bold mb-1.5">
                INFORMATION FOUND ON CHECKS
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-[7.5px] leading-snug mb-1.5">
                    Most of the information needed to complete boxes A, C, and F
                    in Section 1 is printed on your government check:
                  </div>
                  <div className="text-[7.5px] leading-snug space-y-1.5">
                    <div className="flex items-start gap-1.5">
                      <div className="flex-shrink-0 w-4 h-4 rounded-full border border-black flex items-center justify-center text-[7px] font-bold mt-0.5">
                        A
                      </div>
                      <div>
                        Be sure that payee's name is written exactly as it
                        appears on the check. Be sure current address is shown.
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <div className="flex-shrink-0 w-4 h-4 rounded-full border border-black flex items-center justify-center text-[7px] font-bold mt-0.5">
                        C
                      </div>
                      <div>
                        Claim numbers and suffixes are printed here on checks
                        and at the top left side for the type of death case.
                        Check the Green Book for the location of prefixes and
                        suffixes for all other types of payments.
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <div className="flex-shrink-0 w-4 h-4 rounded-full border border-black flex items-center justify-center text-[7px] font-bold mt-0.5">
                        F
                      </div>
                      <div>
                        Type of payment is printed to the left of the amount.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-2 border-black p-2 relative">
                  <div className="flex justify-between items-start mb-1 text-[6.5px]">
                    <div className="leading-tight">
                      <div className="font-mono">1541</div>
                      <div className="font-mono">000</div>
                      <div>PHILADELPHIA, PA</div>
                    </div>
                    <div className="text-right leading-tight">
                      <div>Check No.</div>
                      <div className="font-mono">000 0041299</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 20 20">
                        <circle
                          cx="10"
                          cy="10"
                          r="8"
                          fill="none"
                          stroke="black"
                          strokeWidth="1.5"
                        />
                        <text
                          x="10"
                          y="13"
                          textAnchor="middle"
                          fontSize="10"
                          fill="black"
                        >
                          ✱
                        </text>
                      </svg>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="text-[6px] border border-black rounded px-1">
                        HIGH LOW
                      </div>
                      <div className="text-[6px] border border-black rounded px-1">
                        PAY
                      </div>
                      <div className="text-[6px] border border-black rounded px-1">
                        31
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center text-[7px] font-bold bg-white">
                      C
                    </div>
                  </div>

                  <div className="text-[7px] mb-1">
                    Pay to
                    <br />
                    the order of
                  </div>

                  <div className="mb-2">
                    <div className="border-b border-black h-4"></div>
                  </div>

                  <div className="flex justify-end items-start gap-1 mb-2">
                    <div className="text-[6px] font-mono">28 28</div>
                    <div className="border border-black px-1.5 py-0.5 text-[6px]">
                      DOLLARS
                    </div>
                    <div className="border border-black px-1 py-0.5 text-[6px] font-mono">
                      .25
                    </div>
                  </div>

                  <div className="relative mb-2">
                    <div className="border-b border-black h-3"></div>
                    <div className="absolute left-1/3 top-0 flex-shrink-0 w-5 h-5 rounded-full border-2 border-black flex items-center justify-center text-[7px] font-bold bg-white">
                      F
                    </div>
                  </div>

                  <div className="relative mb-2">
                    <div className="border-b border-black h-3"></div>
                    <div className="absolute left-0 top-0 flex-shrink-0 w-5 h-5 rounded-full border-2 border-black flex items-center justify-center text-[7px] font-bold bg-white">
                      A
                    </div>
                  </div>

                  <div className="border-t-2 border-black pt-1 text-right">
                    <div className="text-[8px] font-bold">NOT NEGOTIABLE</div>
                  </div>

                  <div className="text-center text-[6px] font-mono mt-1">
                    00000218: 0415771626*
                  </div>
                </div>
              </div>

              {/* Special Notice to Joint Account Holders */}
              <div className="text-[8px] font-bold mb-1">
                SPECIAL NOTICE TO JOINT ACCOUNT HOLDERS
              </div>
              <div className="text-[7.5px] leading-snug mb-3 text-justify ml-4">
                Joint account holders should immediately advise both the
                Government agency and the financial institution of the death of
                a beneficiary. Funds deposited after the date of death or
                ineligibility for salary payments, are to be returned to the
                Government agency. The Government agency will then make a
                determination regarding survivor rights, calculate survivor
                benefit payments, if any, and begin payments.
              </div>

              {/* Cancellation */}
              <div className="text-[8px] font-bold mb-1">CANCELLATION</div>
              <div className="text-[7px] leading-snug mb-1 text-justify ml-4">
                The agreement represented by this authorization remains in
                effect until cancelled by the recipient by notice to the Federal
                agency or by the death or legal incapacity of the recipient.
                Upon cancellation by the recipient, the recipient should notify
                the receiving financial institution that he/she is doing so.
              </div>
              <div className="text-[7px] leading-snug mb-3 text-justify ml-8">
                The agreement represented by this authorization may be cancelled
                by the financial institution by providing the recipient a
                written notice 30 days in advance of the cancellation date. The
                recipient must immediately advise the Federal agency if the
                authorization is cancelled by the financial institution. The
                financial institution cannot cancel the authorization by advice
                to the Government agency.
              </div>

              {/* Changing Receiving Financial Institutions */}
              <div className="text-[8px] font-bold mb-1">
                CHANGING RECEIVING FINANCIAL INSTITUTIONS
              </div>
              <div className="text-[7px] leading-snug mb-3 text-justify ml-4">
                The payee's Direct Deposit will continue to be received by the
                selected financial institution until the Government agency is
                notified by the payee that the payee wishes to change the
                financial institution receiving the payee's Direct Deposit. To
                effect this change, the payee will contact the serving agency
                and provide updated account information. It is recommended that
                the payee maintain accounts at both financial institutions until
                the transaction is complete, i.e. after the new financial
                institution receives the payee's Direct Deposit payment.
              </div>

              {/* False Statements or Fraudulent Claims */}
              <div className="text-[8px] font-bold mb-1">
                FALSE STATEMENTS OR FRAUDULENT CLAIMS
              </div>
              <div className="text-[7.5px] leading-snug mb-4 text-justify ml-4">
                Federal law provides a fine of not more than $10,000 or
                imprisonment for not more than five (5) years or both for
                presenting a false statement or making a fraudulent claim.
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
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
            <button
              type="button"
              onClick={handlePrevious}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base font-medium"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
