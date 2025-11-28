import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle, FileText, Target } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const FORM_KEYS = [
  "employmentType",
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

const DirectDepositForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applicationId, setApplicationId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState("draft");
  const [formStatus, setFormStatus] = useState("draft");
  const [hrFeedback, setHrFeedback] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [employmentType, setEmploymentType] = useState(null);
  const [totalForms, setTotalForms] = useState(20); // default to 20
  const baseURL = import.meta.env.VITE__BASEURL;

  const shouldCountForm = (formKey) => {
    if (employmentType === "W-2 Employee") {
      return formKey !== "w9Form";
    } else if (employmentType === "1099 Contractor") {
      return formKey !== "w4Form";
    }
    return true; // default
  };

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
    const handleFormStatusUpdate = () => {
      initializeForm();
    };
    window.addEventListener("formStatusUpdated", handleFormStatusUpdate);
    return () => {
      window.removeEventListener("formStatusUpdated", handleFormStatusUpdate);
    };
  }, []);

  const initializeForm = async () => {
    try {
      const userToken = Cookies.get("session");
      const decodedToken = userToken && jwtDecode(userToken);
      const user = decodedToken?.user;

      if (!user?._id) {
        console.error("User not found in token");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      setEmployeeId(user._id);

      // Get application
      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      if (appResponse.data?.data?.application) {
        setApplicationId(appResponse.data.data.application._id);
        const empType = appResponse.data.data.application.employmentType;
        setEmploymentType(empType);

        // Calculate progress
        const backendData = appResponse.data.data;
        const forms = backendData.forms || {};
        const completedFormsArray =
          backendData.application?.completedForms || [];
        const completedSet = new Set(completedFormsArray);

        // Calculate total forms based on employment type
        let calculatedTotalForms = 20; // default
        if (empType === "1099 Contractor") {
          calculatedTotalForms = 20;
        } else if (empType === "W-2 Employee") {
          calculatedTotalForms = 20;
        }
        setTotalForms(calculatedTotalForms);

        const completedForms = FORM_KEYS.filter((key) => {
          const form = forms[key];
          return (
            form?.status === "submitted" ||
            form?.status === "completed" ||
            form?.status === "under_review" ||
            form?.status === "approved" ||
            completedSet.has(key) ||
            (key === "employmentType" && empType)
          );
        }).length;

        const percentage = Math.round(
          (completedForms / calculatedTotalForms) * 100
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

  const loadDirectDepositData = async () => {
    try {
      if (!applicationId) return;

      const response = await axios.get(
        `${baseURL}/onboarding/get-direct-deposit/${applicationId}`,
        { withCredentials: true }
      );

      if (response.data?.directDeposit) {
        const depositData = response.data.directDeposit;

        // Properly reconstruct the form data with accounts array
        const reconstructedFormData = {
          companyName:
            depositData.companyName || "Care Smart LLC / 39 18167860",
          employeeName: depositData.employeeName || "",
          employeeNumber: depositData.employeeNumber || "",
          accounts:
            depositData.accounts && depositData.accounts.length === 3
              ? depositData.accounts
              : [
                  {
                    action: depositData.accounts_1_action || "",
                    accountType: depositData.accounts_1_accountType || "",
                    accountHolderName:
                      depositData.accounts_1_accountHolderName || "",
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
                    accountHolderName:
                      depositData.accounts_2_accountHolderName || "",
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
                    accountHolderName:
                      depositData.accounts_3_accountHolderName || "",
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

        setFormData(reconstructedFormData);
        setFormStatus(depositData.status || "draft");
        setHrFeedback(depositData.hrFeedback || null);

        // Check if form has meaningful data
        const hasData =
          reconstructedFormData.employeeName?.trim() ||
          reconstructedFormData.employeeNumber?.trim() ||
          reconstructedFormData.accounts.some(
            (acc) =>
              acc.action?.trim() ||
              acc.routingNumber?.trim() ||
              acc.accountNumber?.trim() ||
              acc.bankName?.trim()
          );
        setIsFormCompleted(hasData);
      } else {
        setIsFormCompleted(false);
      }
    } catch (error) {
      console.error("Error loading Direct Deposit data:", error);
      setIsFormCompleted(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      loadDirectDepositData();
    }
  }, [applicationId]);

  // Debug effect to log form data changes
  useEffect(() => {
    console.log("Form Data Updated:", formData);
  }, [formData]);

  const saveDirectDepositForm = async () => {
    try {
      if (!applicationId || !employeeId) {
        toast.error("Application not found. Please refresh the page.");
        return;
      }

      const response = await axios.post(
        `${baseURL}/onboarding/save-direct-deposit-form`,
        {
          applicationId,
          employeeId,
          formData: formData,
          status: "submitted",
        },
        { withCredentials: true }
      );

      if (response.data) {
        toast.success("Direct Deposit Form saved successfully!");
        window.dispatchEvent(new Event("formStatusUpdated"));
        // Reload data to reflect updates
        loadDirectDepositData();
        setTimeout(() => {
          navigate("/employee/orientation-presentation");
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving Direct Deposit form:", error);
      toast.error("Failed to save Direct Deposit Form");
    }
  };

  const handleInputChange = (index, field, value) => {
    const newAccounts = [...formData.accounts];
    newAccounts[index][field] = value;
    setFormData({ ...formData, accounts: newAccounts });
  };

  const handleTopLevelChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleLastFourDigitsChange = (accountIndex, digitIndex, value) => {
    const currentDigits = formData.accounts[accountIndex].lastFourDigits || "";
    const digitsArray = currentDigits.padEnd(4, " ").split("");
    digitsArray[digitIndex] = value.replace(/\D/g, "") || " ";
    const newDigits = digitsArray.join("").trim();
    handleInputChange(accountIndex, "lastFourDigits", newDigits);
  };

  const handleRoutingNumberChange = (accountIndex, digitIndex, value) => {
    const currentDigits = formData.accounts[accountIndex].routingNumber || "";
    const digitsArray = currentDigits.padEnd(9, " ").split("");
    digitsArray[digitIndex] = value.replace(/\D/g, "") || " ";
    const newDigits = digitsArray.join("").trim();
    handleInputChange(accountIndex, "routingNumber", newDigits);
  };

  const handleAccountNumberChange = (accountIndex, digitIndex, value) => {
    const currentDigits = formData.accounts[accountIndex].accountNumber || "";
    const digitsArray = currentDigits.padEnd(17, " ").split("");
    digitsArray[digitIndex] = value.replace(/\D/g, "") || " ";
    const newDigits = digitsArray.join("").trim();
    handleInputChange(accountIndex, "accountNumber", newDigits);
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
      {/* HR Feedback Section */}
      <HRFeedback hrFeedback={hrFeedback} formStatus={formStatus} />
      {/* Status Banner */}
      {!loading && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            isFormCompleted ||
            formStatus === "under_review" ||
            formStatus === "approved"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            {isFormCompleted || formStatus === "approved" ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : formStatus === "under_review" ? (
              <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
            ) : (
              <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <div>
              {isFormCompleted ? (
                <>
                  <p className="text-base font-semibold text-green-800">
                    ✅ Progress Updated - Form Completed Successfully
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    You cannot make any changes to the form until HR provides
                    their feedback.
                  </p>
                </>
              ) : formStatus === "approved" ? (
                <p className="text-base font-semibold text-green-800">
                  ✅ Form Approved
                </p>
              ) : formStatus === "under_review" ? (
                <p className="text-base font-semibold text-blue-800">
                  📋 Form Under Review
                </p>
              ) : (
                <p className="text-base font-semibold text-red-800">
                  ⚠️ Not filled yet - Complete this form to update your progress
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto bg-white p-6">
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
            <span className="font-bold">Company Name and/or Client Number</span>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) =>
                handleTopLevelChange("companyName", e.target.value)
              }
              className="border-0 border-b border-black outline-none bg-[#DDE5FE] ml-2 px-1 text-[13px] py-0"
              style={{ width: "600px", height: "20px" }}
            />
          </div>
          <div className="mb-2">
            <span className="font-bold">Employee/Worker Name</span>
            <input
              type="text"
              value={formData.employeeName}
              onChange={(e) =>
                handleTopLevelChange("employeeName", e.target.value)
              }
              className="border-0 border-b border-black outline-none bg-[#DDE5FE] ml-2 px-1 text-[13px] py-0"
              style={{ width: "350px", height: "20px" }}
            />
            <span className="font-bold ml-6">Employee/Worker Number</span>
            <input
              type="text"
              value={formData.employeeNumber}
              onChange={(e) =>
                handleTopLevelChange("employeeNumber", e.target.value)
              }
              className="border-0 border-b border-black outline-none bg-[#DDE5FE] ml-2 px-1 text-[13px] py-0"
              style={{ width: "100px", height: "20px" }}
            />
          </div>
          <p className="text-[10px] mb-0.5 pl-4 text-black">
            <span className="font-bold">Employee/Worker:</span> Retain a copy of
            this form for your records. Return the original to your
            employer/company.
          </p>
          <p className="text-[10px] pl-4 text-black">
            <span className="font-bold">Employer/Company:</span> Please retain a
            copy of this document for your records.
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
                  onChange={(e) =>
                    handleInputChange(
                      0,
                      "action",
                      e.target.checked ? "add" : ""
                    )
                  }
                  className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                />
                <label className="whitespace-nowrap">Add new</label>
              </div>
              <div className="flex items-center px-2 py-1.5 border-r border-black">
                <input
                  type="checkbox"
                  checked={formData.accounts[0].action === "update"}
                  onChange={(e) =>
                    handleInputChange(
                      0,
                      "action",
                      e.target.checked ? "update" : ""
                    )
                  }
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
                  onChange={(e) =>
                    handleInputChange(
                      0,
                      "action",
                      e.target.checked ? "replace" : ""
                    )
                  }
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
                      onChange={(e) =>
                        handleLastFourDigitsChange(
                          0,
                          digitIndex,
                          e.target.value
                        )
                      }
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
                  onChange={(e) =>
                    handleInputChange(
                      0,
                      "accountType",
                      e.target.checked ? "checking" : ""
                    )
                  }
                  className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                />
                <label className="whitespace-nowrap">Checking</label>
              </div>
              <div className="flex items-center px-2 py-1.5 border-r border-black">
                <input
                  type="checkbox"
                  checked={formData.accounts[0].accountType === "savings"}
                  onChange={(e) =>
                    handleInputChange(
                      0,
                      "accountType",
                      e.target.checked ? "savings" : ""
                    )
                  }
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
                  onChange={(e) =>
                    handleInputChange(0, "accountHolderName", e.target.value)
                  }
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
                      onChange={(e) =>
                        handleRoutingNumberChange(0, digitIndex, e.target.value)
                      }
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
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
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
                      onChange={(e) =>
                        handleAccountNumberChange(0, digitIndex, e.target.value)
                      }
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
                  onChange={(e) =>
                    handleInputChange(0, "bankName", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange(
                      0,
                      "depositPercent",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
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
                  onChange={(e) =>
                    handleInputChange(
                      0,
                      "depositAmount",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  className="w-20 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px]"
                />
                <span className="ml-1 text-[13px] self-center">.00</span>
              </div>
              <div className="flex items-center px-2 py-1.5 flex-1">
                <input
                  type="checkbox"
                  checked={formData.accounts[0].depositRemainder}
                  onChange={(e) =>
                    handleInputChange(0, "depositRemainder", e.target.checked)
                  }
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
                  onChange={(e) =>
                    handleInputChange(
                      1,
                      "action",
                      e.target.checked ? "add" : ""
                    )
                  }
                  className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                />
                <label className="whitespace-nowrap">Add new</label>
              </div>
              <div className="flex items-center px-2 py-1.5 border-r border-black">
                <input
                  type="checkbox"
                  checked={formData.accounts[1].action === "update"}
                  onChange={(e) =>
                    handleInputChange(
                      1,
                      "action",
                      e.target.checked ? "update" : ""
                    )
                  }
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
                  onChange={(e) =>
                    handleInputChange(
                      1,
                      "action",
                      e.target.checked ? "replace" : ""
                    )
                  }
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
                      onChange={(e) =>
                        handleLastFourDigitsChange(
                          1,
                          digitIndex,
                          e.target.value
                        )
                      }
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
                  onChange={(e) =>
                    handleInputChange(
                      1,
                      "accountType",
                      e.target.checked ? "checking" : ""
                    )
                  }
                  className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                />
                <label className="whitespace-nowrap">Checking</label>
              </div>
              <div className="flex items-center px-2 py-1.5 border-r border-black">
                <input
                  type="checkbox"
                  checked={formData.accounts[1].accountType === "savings"}
                  onChange={(e) =>
                    handleInputChange(
                      1,
                      "accountType",
                      e.target.checked ? "savings" : ""
                    )
                  }
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
                  onChange={(e) =>
                    handleInputChange(1, "accountHolderName", e.target.value)
                  }
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
                      onChange={(e) =>
                        handleRoutingNumberChange(1, digitIndex, e.target.value)
                      }
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
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
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
                      onChange={(e) =>
                        handleAccountNumberChange(1, digitIndex, e.target.value)
                      }
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
                  onChange={(e) =>
                    handleInputChange(1, "bankName", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange(
                      1,
                      "depositPercent",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
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
                  onChange={(e) =>
                    handleInputChange(
                      1,
                      "depositAmount",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  className="w-20 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px]"
                />
                <span className="ml-1 text-[13px] self-center">.00</span>
              </div>
              <div className="flex items-center px-2 py-1.5 flex-1">
                <input
                  type="checkbox"
                  checked={formData.accounts[1].depositRemainder}
                  onChange={(e) =>
                    handleInputChange(1, "depositRemainder", e.target.checked)
                  }
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
                  onChange={(e) =>
                    handleInputChange(
                      2,
                      "action",
                      e.target.checked ? "add" : ""
                    )
                  }
                  className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                />
                <label className="whitespace-nowrap">Add new</label>
              </div>
              <div className="flex items-center px-2 py-1.5 border-r border-black">
                <input
                  type="checkbox"
                  checked={formData.accounts[2].action === "update"}
                  onChange={(e) =>
                    handleInputChange(
                      2,
                      "action",
                      e.target.checked ? "update" : ""
                    )
                  }
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
                  onChange={(e) =>
                    handleInputChange(
                      2,
                      "action",
                      e.target.checked ? "replace" : ""
                    )
                  }
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
                      onChange={(e) =>
                        handleLastFourDigitsChange(
                          2,
                          digitIndex,
                          e.target.value
                        )
                      }
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
                  onChange={(e) =>
                    handleInputChange(
                      2,
                      "accountType",
                      e.target.checked ? "checking" : ""
                    )
                  }
                  className="mr-1 w-3 h-3 bg-[#DDE5FE]"
                />
                <label className="whitespace-nowrap">Checking</label>
              </div>
              <div className="flex items-center px-2 py-1.5 border-r border-black">
                <input
                  type="checkbox"
                  checked={formData.accounts[2].accountType === "savings"}
                  onChange={(e) =>
                    handleInputChange(
                      2,
                      "accountType",
                      e.target.checked ? "savings" : ""
                    )
                  }
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
                  onChange={(e) =>
                    handleInputChange(2, "accountHolderName", e.target.value)
                  }
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
                      onChange={(e) =>
                        handleRoutingNumberChange(2, digitIndex, e.target.value)
                      }
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
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
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
                      onChange={(e) =>
                        handleAccountNumberChange(2, digitIndex, e.target.value)
                      }
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
                  onChange={(e) =>
                    handleInputChange(2, "bankName", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange(
                      2,
                      "depositPercent",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
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
                  onChange={(e) =>
                    handleInputChange(
                      2,
                      "depositAmount",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  className="w-20 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px]"
                />
                <span className="ml-1 text-[13px] self-center">.00</span>
              </div>
              <div className="flex items-center px-2 py-1.5 flex-1">
                <input
                  type="checkbox"
                  checked={formData.accounts[2].depositRemainder}
                  onChange={(e) =>
                    handleInputChange(2, "depositRemainder", e.target.checked)
                  }
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
              remain in effect until I notify Company in writing that I wish to
              revoke it. I certify the account number accurately reflects my
              intended receiving account. I agree that direct deposit
              transactions I authorize comply with all applicable laws. My
              signature below indicates that I am agreeing to all terms that are
              set forth in this document. I further agree that the authority of
              the accountholder to authorize my employer/company make direct
              deposits into the named account. I understand that this
              authorization will remain in full force and effect until I notify
              Company in writing that I wish to revoke my authorization and
              understand that the Company requires at least 5 business days
              prior notice to cancel this authorization.
            </p>

            <div className="flex items-center mb-3">
              <label className="font-bold whitespace-nowrap mr-2">
                Employee/Worker Signature:
              </label>
              <input
                type="text"
                value={formData.employeeSignature}
                onChange={(e) =>
                  handleTopLevelChange("employeeSignature", e.target.value)
                }
                className="flex-1 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px] mr-4"
                placeholder="Type your full name"
                style={{ fontFamily: "Brush Script MT, cursive" }}
              />
              <label className="font-bold whitespace-nowrap mr-2">Date:</label>
              <input
                type="text"
                value={formData.employeeDate}
                onChange={(e) =>
                  handleTopLevelChange("employeeDate", e.target.value)
                }
                className="w-28 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px]"
                placeholder="M/DD/YY"
              />
            </div>

            <p className="mb-3">
              I confirm that the above named employee/worker has passed or
              changed a bank account for direct deposit transactions processed
              by Paychex, Inc. I have reviewed the information provided and it
              is accurate to the best of my knowledge. My signature below
              indicates that I have the authority to execute this document on
              behalf of the Client.
            </p>

            <div className="flex items-center mb-3">
              <label className="font-bold whitespace-nowrap mr-2">
                Employer/Company Representative Printed Name:
              </label>
              <input
                type="text"
                value={formData.employerName}
                onChange={(e) =>
                  handleTopLevelChange("employerName", e.target.value)
                }
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
                onChange={(e) =>
                  handleTopLevelChange("employerSignature", e.target.value)
                }
                className="flex-1 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px] mr-4"
                placeholder="Type full name"
                style={{ fontFamily: "Brush Script MT, cursive" }}
              />
              <label className="font-bold whitespace-nowrap mr-2">Date:</label>
              <input
                type="text"
                value={formData.employerDate}
                onChange={(e) =>
                  handleTopLevelChange("employerDate", e.target.value)
                }
                className="w-28 border-0 border-b border-black px-1 py-0 outline-none bg-[#DDE5FE] text-[13px]"
                placeholder="M/DD/YY"
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
                <span className="font-bold">Note:</span> Digital or Electronic
                Signatures are not acceptable.
              </p>
            </div>

            <div className="text-right mt-2 text-[10px] text-black">
              <p>DP0002 10/20</p>
              <p>Form Expires 10/31/23</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mt-8 mx-8 sm:mx-16 lg:mx-32 xl:mx-40">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">
                Application Progress
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                {completedFormsCount}/{totalForms}
              </div>
              <div className="text-xs text-gray-900">Forms Completed</div>
            </div>
          </div>
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-900">Overall Progress</span>
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
          <div className="text-xs text-gray-900 text-center">
            📝 Current: Direct Deposit Form
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 pt-6 border-t border-gray-200 mx-8 sm:mx-16 lg:mx-32 xl:mx-40">
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <button
            type="button"
            onClick={() => navigate("/employee/w9-form")}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#2748B4] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
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
            const isSubmitted = formStatus === "submitted" && !hasHrNotes;

            return (
              <button
                type="button"
                onClick={saveDirectDepositForm}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 text-white font-bold tracking-wide rounded-lg focus:ring-2 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                  isSubmitted
                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-[#1F3A93]/30"
                }`}
                disabled={isSubmitted}
                title={isSubmitted ? "Waiting for HR feedback" : ""}
              >
                <Send className="w-5 h-5" />
                <span className="text-sm sm:text-base">
                  {isSubmitted ? "Awaiting HR Feedback" : "Save & Next"}
                </span>
              </button>
            );
          })()}
        </div>
      </div>

      <Toaster position="top-right" />
    </Layout>
  );
};

export default DirectDepositForm;
