import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Target,
  Send,
  Calendar,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";

const TBSymptomScreen = ({ onFormDataChange, initialData }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    gender: "",
    dateOfBirth: "",
    lastSkinTest: "",
    testDate: "",
    testResults: "",
    positive: false,
    negative: false,
    chestXRayNormal: false,
    chestXRayAbnormal: false,
    treatedForLTBI: "",
    monthsLTBI: "",
    treatedForTB: "",
    monthsTB: "",
    whenTreated: "",
    whereTreated: "",
    medications: "",
    todaysDate: "",

    // Symptoms
    hasCough: "",
    coughDurationDays: "",
    coughDurationWeeks: "",
    coughDurationMonths: "",
    mucusColor: "",
    coughingUpBlood: "",
    hasNightSweats: "",
    hasFevers: "",
    lostWeight: "",
    weightLost: "",
    tiredOrWeak: "",
    tirednessDurationDays: "",
    tirednessDurationWeeks: "",
    tirednessDurationMonths: "",
    hasChestPain: "",
    chestPainDurationDays: "",
    chestPainDurationWeeks: "",
    chestPainDurationMonths: "",
    hasShortnessOfBreath: "",
    shortnessOfBreathDurationDays: "",
    shortnessOfBreathDurationWeeks: "",
    shortnessOfBreathDurationMonths: "",
    knowsSomeoneWithSymptoms: "",
    contactName: "",
    contactAddress: "",
    contactPhone: "",

    // Action Taken
    noSignOfActiveTB: false,
    chestXRayNotNeeded: false,
    discussedSignsAndSymptoms: false,
    clientKnowsToSeekCare: false,
    furtherActionNeeded: false,
    isolated: false,
    givenSurgicalMask: false,
    chestXRayNeeded: false,
    sputumSamplesNeeded: false,
    referredToDoctorClinic: false,
    otherAction: false,

    // Signatures
    assessorSignature: "",
    clientSignature: "",
    signatureDate: "",
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData);
    } else {
      // Set default date to today if not provided
      const today = new Date();
      const todayDate = today.toISOString().slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        signatureDate: todayDate,
      }));
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    if (onFormDataChange) {
      onFormDataChange(updatedData);
    }
  };

  const handleCheckboxChange = (field, checked) => {
    const updatedData = { ...formData, [field]: checked };
    setFormData(updatedData);
    if (onFormDataChange) {
      onFormDataChange(updatedData);
    }
  };

  return (
    <div
      className="max-w-6xl mx-auto p-3 sm:p-6 bg-white text-xs sm:text-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
        rel="stylesheet"
      />
      {/* Header */}
      <div className="bg-gray-300 text-center py-2 sm:py-3 mb-3 sm:mb-4">
        <h1 className="text-base sm:text-xl font-bold">
          Tuberculosis (TB) Symptom Screen
        </h1>
      </div>

      {/* Basic Information Section */}
      <div className="mb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-3">
          <div className="w-full sm:flex-1">
            <span>Name: </span>
            <input
              type="text"
              className="border-b border-black w-full sm:w-3/4 outline-none bg-transparent"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span>M</span>
            <input
              type="radio"
              name="gender"
              className="border border-black w-4 h-4"
              checked={formData.gender === "M"}
              onChange={() => handleInputChange("gender", "M")}
            />
            <span>F</span>
            <input
              type="radio"
              name="gender"
              className="border border-black w-4 h-4"
              checked={formData.gender === "F"}
              onChange={() => handleInputChange("gender", "F")}
            />
          </div>
          <div className="w-full sm:flex-1">
            <span>Date of Birth: </span>
            <input
              type="text"
              className="border-b border-black w-full sm:w-1/2 outline-none bg-transparent"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            />
          </div>
        </div>

        <div className="mb-3">
          <div>
            <span>Last skin test: </span>
            <input
              type="text"
              className="border-b border-black w-full sm:w-5/6 outline-none bg-transparent"
              value={formData.lastSkinTest}
              onChange={(e) =>
                handleInputChange("lastSkinTest", e.target.value)
              }
            />
          </div>
          <div className="text-[10px] sm:text-xs ml-0 sm:ml-24 mt-1 sm:-mt-1">
            (Name, address, city, state, zip, and phone number of place where
            test was given)
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">Test Date:</span>
            <input
              type="text"
              className="border-b border-black w-20 outline-none bg-transparent"
              value={formData.testDate}
              onChange={(e) => handleInputChange("testDate", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span>Results</span>
            <input
              type="text"
              className="border-b border-black w-12 outline-none bg-transparent"
              value={formData.testResults}
              onChange={(e) => handleInputChange("testResults", e.target.value)}
            />
            <span>mm</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Positive</span>
            <input
              type="checkbox"
              className="border border-black w-4 h-4"
              checked={formData.positive}
              onChange={(e) =>
                handleCheckboxChange("positive", e.target.checked)
              }
            />
            <span>Negative</span>
            <input
              type="checkbox"
              className="border border-black w-4 h-4"
              checked={formData.negative}
              onChange={(e) =>
                handleCheckboxChange("negative", e.target.checked)
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">Chest X-Ray: Normal</span>
            <input
              type="checkbox"
              className="border border-black w-4 h-4"
              checked={formData.chestXRayNormal}
              onChange={(e) =>
                handleCheckboxChange("chestXRayNormal", e.target.checked)
              }
            />
            <span>Abnormal</span>
            <input
              type="checkbox"
              className="border border-black w-4 h-4"
              checked={formData.chestXRayAbnormal}
              onChange={(e) =>
                handleCheckboxChange("chestXRayAbnormal", e.target.checked)
              }
            />
          </div>
        </div>

        <div className="mb-3 text-[10px] sm:text-xs leading-relaxed">
          <span>
            Were you treated for: <strong>Latent TB infection (LTBI)?</strong>{" "}
            Yes{" "}
          </span>
          <input
            type="radio"
            name="treatedLTBI"
            className="border border-black w-3 h-3 mx-1"
            checked={formData.treatedForLTBI === "yes"}
            onChange={() => handleInputChange("treatedForLTBI", "yes")}
          />
          <span> No </span>
          <input
            type="radio"
            name="treatedLTBI"
            className="border border-black w-3 h-3 mx-1"
            checked={formData.treatedForLTBI === "no"}
            onChange={() => handleInputChange("treatedForLTBI", "no")}
          />
          <span> #Months </span>
          <input
            type="text"
            className="border-b border-black w-12 outline-none bg-transparent mx-1"
            value={formData.monthsLTBI}
            onChange={(e) => handleInputChange("monthsLTBI", e.target.value)}
          />
          <span>
            {" "}
            <strong>TB Disease?</strong> Yes{" "}
          </span>
          <input
            type="radio"
            name="treatedTB"
            className="border border-black w-3 h-3 mx-1"
            checked={formData.treatedForTB === "yes"}
            onChange={() => handleInputChange("treatedForTB", "yes")}
          />
          <span> No </span>
          <input
            type="radio"
            name="treatedTB"
            className="border border-black w-3 h-3 mx-1"
            checked={formData.treatedForTB === "no"}
            onChange={() => handleInputChange("treatedForTB", "no")}
          />
          <span> #Months </span>
          <input
            type="text"
            className="border-b border-black w-12 outline-none bg-transparent mx-1"
            value={formData.monthsTB}
            onChange={(e) => handleInputChange("monthsTB", e.target.value)}
          />
        </div>

        <div className="mb-3">
          <span>
            If yes, <strong>When?</strong>{" "}
          </span>
          <input
            type="text"
            className="border-b border-black w-32 outline-none bg-transparent"
            value={formData.whenTreated}
            onChange={(e) => handleInputChange("whenTreated", e.target.value)}
          />
          <span className="ml-8">
            <strong>Where?</strong>{" "}
          </span>
          <input
            type="text"
            className="border-b border-black w-96 outline-none bg-transparent"
            value={formData.whereTreated}
            onChange={(e) => handleInputChange("whereTreated", e.target.value)}
          />
        </div>

        <div className="mb-3">
          <span>Name of Medications: </span>
          <input
            type="text"
            className="border-b border-black w-full sm:w-5/6 outline-none bg-transparent"
            value={formData.medications}
            onChange={(e) => handleInputChange("medications", e.target.value)}
          />
        </div>

        <div className="bg-gray-300 py-2 px-3 mb-4">
          <span className="font-bold">Today's Date </span>
          <input
            type="text"
            className="border-b border-black w-full sm:w-48 outline-none bg-transparent ml-0 sm:ml-2"
            value={formData.todaysDate}
            onChange={(e) => handleInputChange("todaysDate", e.target.value)}
          />
        </div>
      </div>

      {/* Symptoms Section */}
      <div className="space-y-2 text-[10px] sm:text-xs mb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">Do you have a cough?</div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1">
              <span>Yes</span>
              <input
                type="radio"
                name="cough"
                className="border border-black w-4 h-4"
                checked={formData.hasCough === "yes"}
                onChange={() => handleInputChange("hasCough", "yes")}
              />
            </div>
            <div className="flex items-center gap-1">
              <span>No</span>
              <input
                type="radio"
                name="cough"
                className="border border-black w-4 h-4"
                checked={formData.hasCough === "no"}
                onChange={() => handleInputChange("hasCough", "no")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="pl-6">If yes, how long have you had it?</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span># Days</span>
              <input
                type="text"
                className="border-b border-black w-12 outline-none bg-transparent"
                value={formData.coughDurationDays}
                onChange={(e) =>
                  handleInputChange("coughDurationDays", e.target.value)
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <span># Weeks</span>
              <input
                type="text"
                className="border-b border-black w-12 outline-none bg-transparent"
                value={formData.coughDurationWeeks}
                onChange={(e) =>
                  handleInputChange("coughDurationWeeks", e.target.value)
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <span># Months</span>
              <input
                type="text"
                className="border-b border-black w-12 outline-none bg-transparent"
                value={formData.coughDurationMonths}
                onChange={(e) =>
                  handleInputChange("coughDurationMonths", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="pl-6 flex items-center gap-2">
            <span>What color is the mucus?</span>
            <input
              type="text"
              className="border-b border-black w-28 outline-none bg-transparent"
              value={formData.mucusColor}
              onChange={(e) => handleInputChange("mucusColor", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <span>Are you coughing up blood?</span>
            <div className="flex items-center gap-1">
              <span>Yes</span>
              <input
                type="radio"
                name="coughingBlood"
                className="border border-black w-4 h-4"
                checked={formData.coughingUpBlood === "yes"}
                onChange={() => handleInputChange("coughingUpBlood", "yes")}
              />
            </div>
            <div className="flex items-center gap-1">
              <span>No</span>
              <input
                type="radio"
                name="coughingBlood"
                className="border border-black w-4 h-4"
                checked={formData.coughingUpBlood === "no"}
                onChange={() => handleInputChange("coughingUpBlood", "no")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex-1">Do you have night sweats?</div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1">
              <span>Yes</span>
              <input
                type="radio"
                name="nightSweats"
                className="border border-black w-4 h-4"
                checked={formData.hasNightSweats === "yes"}
                onChange={() => handleInputChange("hasNightSweats", "yes")}
              />
            </div>
            <div className="flex items-center gap-1">
              <span>No</span>
              <input
                type="radio"
                name="nightSweats"
                className="border border-black w-4 h-4"
                checked={formData.hasNightSweats === "no"}
                onChange={() => handleInputChange("hasNightSweats", "no")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex-1">Do you have fevers?</div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1">
              <span>Yes</span>
              <input
                type="radio"
                name="fevers"
                className="border border-black w-4 h-4"
                checked={formData.hasFevers === "yes"}
                onChange={() => handleInputChange("hasFevers", "yes")}
              />
            </div>
            <div className="flex items-center gap-1">
              <span>No</span>
              <input
                type="radio"
                name="fevers"
                className="border border-black w-4 h-4"
                checked={formData.hasFevers === "no"}
                onChange={() => handleInputChange("hasFevers", "no")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex-1">Have you lost weight without trying?</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span>Yes</span>
              <input
                type="radio"
                name="weightLoss"
                className="border border-black w-4 h-4"
                checked={formData.lostWeight === "yes"}
                onChange={() => handleInputChange("lostWeight", "yes")}
              />
            </div>
            <div className="flex items-center gap-1">
              <span>No</span>
              <input
                type="radio"
                name="weightLoss"
                className="border border-black w-4 h-4"
                checked={formData.lostWeight === "no"}
                onChange={() => handleInputChange("lostWeight", "no")}
              />
            </div>
            <div className="flex items-center gap-1">
              <span># Pounds</span>
              <input
                type="text"
                className="border-b border-black w-12 outline-none bg-transparent"
                value={formData.weightLost}
                onChange={(e) =>
                  handleInputChange("weightLost", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex-1">Have you been tired or weak?</div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1">
              <span>Yes</span>
              <input
                type="radio"
                name="tiredness"
                className="border border-black w-4 h-4"
                checked={formData.tiredOrWeak === "yes"}
                onChange={() => handleInputChange("tiredOrWeak", "yes")}
              />
            </div>
            <div className="flex items-center gap-1">
              <span>No</span>
              <input
                type="radio"
                name="tiredness"
                className="border border-black w-4 h-4"
                checked={formData.tiredOrWeak === "no"}
                onChange={() => handleInputChange("tiredOrWeak", "no")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="pl-6">If yes, how long has it lasted?</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span># Days</span>
              <input
                type="text"
                className="border-b border-black w-12 outline-none bg-transparent"
                value={formData.tirednessDurationDays}
                onChange={(e) =>
                  handleInputChange("tirednessDurationDays", e.target.value)
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <span># Weeks</span>
              <input
                type="text"
                className="border-b border-black w-12 outline-none bg-transparent"
                value={formData.tirednessDurationWeeks}
                onChange={(e) =>
                  handleInputChange("tirednessDurationWeeks", e.target.value)
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <span># Months</span>
              <input
                type="text"
                className="border-b border-black w-12 outline-none bg-transparent"
                value={formData.tirednessDurationMonths}
                onChange={(e) =>
                  handleInputChange("tirednessDurationMonths", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex-1">Do you have chest pain?</div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1">
              <span>Yes</span>
              <input
                type="radio"
                name="chestPain"
                className="border border-black w-4 h-4"
                checked={formData.hasChestPain === "yes"}
                onChange={() => handleInputChange("hasChestPain", "yes")}
              />
            </div>
            <div className="flex items-center gap-1">
              <span>No</span>
              <input
                type="radio"
                name="chestPain"
                className="border border-black w-4 h-4"
                checked={formData.hasChestPain === "no"}
                onChange={() => handleInputChange("hasChestPain", "no")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="pl-6">If yes, how long has it lasted?</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span># Days</span>
              <input
                type="text"
                className="border-b border-black w-12 outline-none bg-transparent"
                value={formData.chestPainDurationDays}
                onChange={(e) =>
                  handleInputChange("chestPainDurationDays", e.target.value)
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <span># Weeks</span>
              <input
                type="text"
                className="border-b border-black w-12 outline-none bg-transparent"
                value={formData.chestPainDurationWeeks}
                onChange={(e) =>
                  handleInputChange("chestPainDurationWeeks", e.target.value)
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <span># Months</span>
              <input
                type="text"
                className="border-b border-black w-12 outline-none bg-transparent"
                value={formData.chestPainDurationMonths}
                onChange={(e) =>
                  handleInputChange("chestPainDurationMonths", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex-1">Do you have shortness of breath?</div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1">
              <span>Yes</span>
              <input
                type="radio"
                name="shortnessOfBreath"
                className="border border-black w-4 h-4"
                checked={formData.hasShortnessOfBreath === "yes"}
                onChange={() =>
                  handleInputChange("hasShortnessOfBreath", "yes")
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <span>No</span>
              <input
                type="radio"
                name="shortnessOfBreath"
                className="border border-black w-4 h-4"
                checked={formData.hasShortnessOfBreath === "no"}
                onChange={() => handleInputChange("hasShortnessOfBreath", "no")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="pl-6">If yes, how long has it lasted?</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span># Days</span>
              <input
                type="text"
                className="border-b border-black w-12 outline-none bg-transparent"
                value={formData.shortnessOfBreathDurationDays}
                onChange={(e) =>
                  handleInputChange(
                    "shortnessOfBreathDurationDays",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <span># Weeks</span>
              <input
                type="text"
                className="border-b border-black w-12 outline-none bg-transparent"
                value={formData.shortnessOfBreathDurationWeeks}
                onChange={(e) =>
                  handleInputChange(
                    "shortnessOfBreathDurationWeeks",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <span># Months</span>
              <input
                type="text"
                className="border-b border-black w-12 outline-none bg-transparent"
                value={formData.shortnessOfBreathDurationMonths}
                onChange={(e) =>
                  handleInputChange(
                    "shortnessOfBreathDurationMonths",
                    e.target.value
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex-1">
            Do you know anyone who has these symptoms?
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1">
              <span>Yes</span>
              <input
                type="radio"
                name="knowsSomeone"
                className="border border-black w-4 h-4"
                checked={formData.knowsSomeoneWithSymptoms === "yes"}
                onChange={() =>
                  handleInputChange("knowsSomeoneWithSymptoms", "yes")
                }
              />
            </div>
            <div className="flex items-center gap-1">
              <span>No</span>
              <input
                type="radio"
                name="knowsSomeone"
                className="border border-black w-4 h-4"
                checked={formData.knowsSomeoneWithSymptoms === "no"}
                onChange={() =>
                  handleInputChange("knowsSomeoneWithSymptoms", "no")
                }
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <span>Name</span>
            <input
              type="text"
              className="border-b border-black w-40 outline-none bg-transparent"
              value={formData.contactName}
              onChange={(e) => handleInputChange("contactName", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span>Address</span>
            <input
              type="text"
              className="border-b border-black w-80 outline-none bg-transparent"
              value={formData.contactAddress}
              onChange={(e) =>
                handleInputChange("contactAddress", e.target.value)
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <span>Phone</span>
            <input
              type="text"
              className="border-b border-black w-32 outline-none bg-transparent"
              value={formData.contactPhone}
              onChange={(e) =>
                handleInputChange("contactPhone", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Action Taken Section */}
      <div className="bg-gray-300 py-2 px-3 mb-2">
        <span className="font-bold">Action Taken</span>
        <span className="text-[10px] sm:text-xs ml-1">
          (check all that apply)
        </span>
      </div>

      <table className="w-full border border-black text-[10px] sm:text-xs mb-4">
        <tbody>
          <tr className="border-b border-black">
            <td className="p-2 pl-4 border-r border-black">
              No sign of active TB at this time
            </td>
            <td className="p-2 w-12">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={formData.noSignOfActiveTB}
                onChange={(e) =>
                  handleCheckboxChange("noSignOfActiveTB", e.target.checked)
                }
              />
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-2 pl-4 border-r border-black">
              Chest X-ray not needed at this time
            </td>
            <td className="p-2 w-12">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={formData.chestXRayNotNeeded}
                onChange={(e) =>
                  handleCheckboxChange("chestXRayNotNeeded", e.target.checked)
                }
              />
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-2 pl-4 border-r border-black">
              Discussed signs and symptoms of TB with client
            </td>
            <td className="p-2 w-12">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={formData.discussedSignsAndSymptoms}
                onChange={(e) =>
                  handleCheckboxChange(
                    "discussedSignsAndSymptoms",
                    e.target.checked
                  )
                }
              />
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-2 pl-4 border-r border-black">
              Client knows to seek health care if symptoms of TB appear
            </td>
            <td className="p-2 w-12">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={formData.clientKnowsToSeekCare}
                onChange={(e) =>
                  handleCheckboxChange(
                    "clientKnowsToSeekCare",
                    e.target.checked
                  )
                }
              />
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-2 pl-4 border-r border-black">
              Further action needed
            </td>
            <td className="p-2 w-12">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={formData.furtherActionNeeded}
                onChange={(e) =>
                  handleCheckboxChange("furtherActionNeeded", e.target.checked)
                }
              />
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-2 pl-16 border-r border-black">• Isolated</td>
            <td className="p-2 w-12">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={formData.isolated}
                onChange={(e) =>
                  handleCheckboxChange("isolated", e.target.checked)
                }
              />
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-2 pl-16 border-r border-black">
              • Given surgical mask
            </td>
            <td className="p-2 w-12">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={formData.givenSurgicalMask}
                onChange={(e) =>
                  handleCheckboxChange("givenSurgicalMask", e.target.checked)
                }
              />
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-2 pl-16 border-r border-black">
              • Chest X-Ray is needed
            </td>
            <td className="p-2 w-12">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={formData.chestXRayNeeded}
                onChange={(e) =>
                  handleCheckboxChange("chestXRayNeeded", e.target.checked)
                }
              />
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-2 pl-16 border-r border-black">
              • Sputum samples are needed
            </td>
            <td className="p-2 w-12">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={formData.sputumSamplesNeeded}
                onChange={(e) =>
                  handleCheckboxChange("sputumSamplesNeeded", e.target.checked)
                }
              />
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="p-2 pl-16 border-r border-black">
              • Referred to Doctor / Clinic (Specify):
            </td>
            <td className="p-2 w-12">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={formData.referredToDoctorClinic}
                onChange={(e) =>
                  handleCheckboxChange(
                    "referredToDoctorClinic",
                    e.target.checked
                  )
                }
              />
            </td>
          </tr>
          <tr>
            <td className="p-2 pl-16 border-r border-black">
              • Other (Specify):
            </td>
            <td className="p-2 w-12">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={formData.otherAction}
                onChange={(e) =>
                  handleCheckboxChange("otherAction", e.target.checked)
                }
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* Signature Section */}
      <div className="space-y-3 sm:space-y-4 mb-4 mt-6">
        <div>
          <label className="block text-xs font-semibold mb-2">
            Signature of Person Making the Assessment
          </label>
          <input
            type="text"
            className="border-b-2 border-black w-full focus:outline-none focus:border-blue-600 pb-1 bg-transparent"
            value={formData.assessorSignature}
            onChange={(e) =>
              handleInputChange("assessorSignature", e.target.value)
            }
            placeholder="Sign here"
            style={{
              fontFamily: "'Great Vibes', cursive",
              fontSize: "28px",
              letterSpacing: "0.5px",
            }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          <div>
            <label className="block text-xs font-semibold mb-2">
              Signature of Client
            </label>
            <input
              type="text"
              className="border-b-2 border-black w-full focus:outline-none focus:border-blue-600 pb-1 bg-transparent"
              value={formData.clientSignature}
              onChange={(e) =>
                handleInputChange("clientSignature", e.target.value)
              }
              placeholder="Sign here"
              style={{
                fontFamily: "'Great Vibes', cursive",
                fontSize: "28px",
                letterSpacing: "0.5px",
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2">Date</label>
            <input
              type="date"
              className="border-b-2 border-black w-full focus:outline-none focus:border-blue-600 pb-1 bg-transparent"
              value={formData.signatureDate}
              onChange={(e) =>
                handleInputChange("signatureDate", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between text-[10px] sm:text-xs text-gray-600 mt-6 gap-2 sm:gap-0">
        <span>GA DPH TB Unit</span>
        <span>Rev. 12/2011</span>
      </div>
    </div>
  );
};

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

const EditSymptomScreenForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [employeeId, setEmployeeId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [tbFormData, setTbFormData] = useState({});
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    initializeForm();
  }, []);

  const fetchProgressData = async (userId) => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${userId}`,
        { withCredentials: true }
      );

      console.log("🔍 Progress Data Response:", response.data);

      if (response.data?.data) {
        const backendData = response.data.data;
        // Calculate progress with 20 total forms
        const forms = backendData.forms || {};
        const completedSet = new Set(
          backendData.application?.completedForms || []
        );

        console.log("📋 All Forms Data:", forms);
        console.log("📋 Available Form Keys in DB:", Object.keys(forms));
        console.log("📋 Completed Forms Array:", Array.from(completedSet));

        const completedForms = FORM_KEYS.filter((key) => {
          const form = forms[key];

          if (form) {
            const isCompleted =
              form?.status === "submitted" ||
              form?.status === "completed" ||
              form?.status === "under_review" ||
              form?.status === "approved";

            console.log(
              `✅ ${key}: status='${form?.status}' - ${
                isCompleted ? "COMPLETED ✓" : "NOT COMPLETED ✗"
              }`
            );
            return isCompleted;
          }

          if (completedSet.has(key)) {
            console.log(
              `ℹ️ ${key}: not in forms but in completedForms array — COMPLETED ✓`
            );
            return true;
          }

          console.log(`❌ ${key}: NOT FOUND`);
          return false;
        }).length;

        const totalForms = FORM_KEYS.length;
        const percentage = Math.round((completedForms / totalForms) * 100);

        console.log(
          `📊 Completed: ${completedForms}/${totalForms} (${percentage}%)`
        );

        setCompletedFormsCount(completedForms);
        setOverallProgress(percentage);

        // Populate TB Symptom Screen data if exists
        if (backendData.forms?.tbSymptomScreen) {
          console.log(
            "TB Symptom Screen data found:",
            backendData.forms.tbSymptomScreen
          );
          // The data is already being fetched separately in initializeForm
          // This is just for consistency with other forms
        }
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const initializeForm = async () => {
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie
        ? JSON.parse(userCookie)
        : { _id: "67e0f8770c6feb6ba99d11d2" };

      setEmployeeId(user._id);

      // Fetch progress data first
      await fetchProgressData(user._id);

      // Get application
      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      if (appResponse.data?.data?.application) {
        setApplicationId(appResponse.data.data.application._id);

        // Try to fetch previously saved TB Symptom Screen data
        try {
          const tbResponse = await axios.get(
            `${baseURL}/onboarding/get-tb-symptom-screen/${appResponse.data.data.application._id}`,
            { withCredentials: true }
          );

          if (tbResponse.data?.tbSymptomScreen) {
            const tbData = tbResponse.data.tbSymptomScreen;

            // Format the data back to the form structure expected by TBSymptomScreen component
            const formattedFormData = {
              // Basic Information
              name: tbData.basicInfo?.fullName || "",
              gender: tbData.basicInfo?.sex || "",
              dateOfBirth: tbData.basicInfo?.dateOfBirth
                ? new Date(tbData.basicInfo.dateOfBirth).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    }
                  )
                : "",

              // Last Skin Test
              lastSkinTest: tbData.lastSkinTest?.facilityName || "",
              testDate: tbData.lastSkinTest?.testDate
                ? new Date(tbData.lastSkinTest.testDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    }
                  )
                : "",
              testResults: tbData.lastSkinTest?.resultMM || "",
              positive: tbData.lastSkinTest?.resultPositive || false,
              negative: tbData.lastSkinTest?.resultNegative || false,
              chestXRayNormal: tbData.lastSkinTest?.chestXrayNormal || false,
              chestXRayAbnormal:
                tbData.lastSkinTest?.chestXrayAbnormal || false,

              // Treatment History
              treatedForLTBI: tbData.treatmentHistory?.latentTB ? "yes" : "no",
              monthsLTBI: tbData.treatmentHistory?.latentMonths || "",
              treatedForTB: tbData.treatmentHistory?.tbDisease ? "yes" : "no",
              monthsTB: tbData.treatmentHistory?.tbDiseaseMonths || "",
              whenTreated: tbData.treatmentHistory?.treatmentWhen || "",
              whereTreated: tbData.treatmentHistory?.treatmentWhere || "",
              medications: tbData.treatmentHistory?.medications || "",

              // Screening Date
              todaysDate: tbData.screeningDate
                ? new Date(tbData.screeningDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : "",

              // Symptoms
              hasCough: tbData.symptoms?.cough ? "yes" : "no",
              coughDurationDays: tbData.symptoms?.coughDurationDays || "",
              coughDurationWeeks: tbData.symptoms?.coughDurationWeeks || "",
              coughDurationMonths: tbData.symptoms?.coughDurationMonths || "",
              mucusColor: tbData.symptoms?.mucusColor || "",
              coughingUpBlood: tbData.symptoms?.coughingBlood ? "yes" : "no",
              hasNightSweats: tbData.symptoms?.nightSweats ? "yes" : "no",
              hasFevers: tbData.symptoms?.fevers ? "yes" : "no",
              lostWeight: tbData.symptoms?.weightLoss ? "yes" : "no",
              weightLost: tbData.symptoms?.weightLossPounds || "",
              tiredOrWeak: tbData.symptoms?.fatigue ? "yes" : "no",
              tirednessDurationDays: tbData.symptoms?.fatigueDurationDays || "",
              tirednessDurationWeeks:
                tbData.symptoms?.fatigueDurationWeeks || "",
              tirednessDurationMonths:
                tbData.symptoms?.fatigueDurationMonths || "",
              hasChestPain: tbData.symptoms?.chestPain ? "yes" : "no",
              chestPainDurationDays:
                tbData.symptoms?.chestPainDurationDays || "",
              chestPainDurationWeeks:
                tbData.symptoms?.chestPainDurationWeeks || "",
              chestPainDurationMonths:
                tbData.symptoms?.chestPainDurationMonths || "",
              hasShortnessOfBreath: tbData.symptoms?.shortnessOfBreath
                ? "yes"
                : "no",
              shortnessOfBreathDurationDays:
                tbData.symptoms?.shortnessBreathDurationDays || "",
              shortnessOfBreathDurationWeeks:
                tbData.symptoms?.shortnessBreathDurationWeeks || "",
              shortnessOfBreathDurationMonths:
                tbData.symptoms?.shortnessBreathDurationMonths || "",
              knowsSomeoneWithSymptoms: tbData.symptoms
                ?.knowsSomeoneWithSymptoms
                ? "yes"
                : "no",
              contactName: tbData.symptoms?.contactName || "",
              contactAddress: tbData.symptoms?.contactAddress || "",
              contactPhone: tbData.symptoms?.contactPhone || "",

              // Action Taken
              noSignOfActiveTB: tbData.actionTaken?.noSignOfTB || false,
              chestXRayNotNeeded:
                tbData.actionTaken?.chestXrayNotNeeded || false,
              discussedSignsAndSymptoms:
                tbData.actionTaken?.discussedSigns || false,
              clientKnowsToSeekCare: tbData.actionTaken?.clientAware || false,
              furtherActionNeeded:
                tbData.actionTaken?.furtherActionNeeded || false,
              isolated: tbData.actionTaken?.isolated || false,
              givenSurgicalMask: tbData.actionTaken?.givenMask || false,
              chestXRayNeeded: tbData.actionTaken?.chestXrayNeeded || false,
              sputumSamplesNeeded:
                tbData.actionTaken?.sputumSamplesNeeded || false,
              referredToDoctorClinic: tbData.actionTaken?.referredToDoctor
                ? true
                : false,
              otherAction: tbData.actionTaken?.other ? true : false,

              // Signatures
              assessorSignature: tbData.screenerSignature || "",
              clientSignature: tbData.clientSignature || "",
              signatureDate: tbData.clientSignatureDate
                ? new Date(tbData.clientSignatureDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    }
                  )
                : "",
            };

            // Set the formatted data to populate the form
            setTbFormData(formattedFormData);
            console.log(
              "Loaded previously saved TB Symptom Screen data:",
              formattedFormData
            );
          }
        } catch (tbError) {
          console.log(
            "No previously saved TB Symptom Screen data found, starting with empty form"
          );
          // No previously saved data, that's okay - form will start empty
        }
      }

      // Get template
      const templateResponse = await axios.get(
        `${baseURL}/onboarding/get-tb-symptom-screen-template`,
        { withCredentials: true }
      );

      if (templateResponse.data?.template) {
        setTemplate(templateResponse.data.template);
      }
    } catch (error) {
      console.error("Error initializing form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUpload = async () => {
    // File upload removed - only signature and date required
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
      <div className="h-full flex flex-col">
        <Navbar />

        <div className="pt-6 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex gap-6">
            {/* Vertical Progress Bar Sidebar - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:block md:w-12 lg:w-16 flex-shrink-0">
              <div className="sticky top-6 flex flex-col items-center">
                <div className="w-3 lg:w-4 h-[500px] bg-gray-200 rounded-full relative shadow-inner">
                  <div
                    className="w-3 lg:w-4 bg-gradient-to-t from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out absolute bottom-0 shadow-sm"
                    style={{ height: `${overallProgress}%` }}
                  ></div>
                </div>

                <div className="mt-4 text-center">
                  <div className="text-sm lg:text-lg font-bold text-blue-600">
                    {overallProgress}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Application Progress
                  </div>
                </div>

                {isSaving && (
                  <div className="mt-4">
                    <RotateCcw className="w-4 lg:w-5 h-4 lg:h-5 text-blue-600 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Main Form Content */}
            <div className="flex-1 max-h-screen md:max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
                <button
                  onClick={() => navigate("/employee/task-management")}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-8">
                  {/* Status Banner */}
                  {!loading && (
                    <div
                      className={`mb-6 p-4 rounded-lg border ${
                        tbFormData && Object.keys(tbFormData).length > 0
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-3">
                        {tbFormData && Object.keys(tbFormData).length > 0 ? (
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        ) : (
                          <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                        )}
                        <div>
                          {tbFormData && Object.keys(tbFormData).length > 0 ? (
                            <p className="text-base font-semibold text-green-800">
                              ✅ Progress Updated - Form Completed Successfully
                            </p>
                          ) : (
                            <p className="text-base font-semibold text-red-800">
                              ⚠️ Not filled yet - Complete this form to update
                              your progress
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                      TB Symptom Screen
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                      Review the form below and click Save & Next to acknowledge
                      your understanding
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Instructions Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                            📋 Instructions
                          </h3>
                          <ol className="space-y-3 text-sm text-gray-700">
                            <li className="flex gap-3">
                              <span className="font-bold text-blue-600 flex-shrink-0">
                                1.
                              </span>
                              <span>
                                View the TB Symptom Screen template below
                              </span>
                            </li>
                            <li className="flex gap-3">
                              <span className="font-bold text-blue-600 flex-shrink-0">
                                2.
                              </span>
                              <span>Carefully review the document</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="font-bold text-blue-600 flex-shrink-0">
                                3.
                              </span>
                              <span>Click Save & Next to confirm</span>
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* Template Preview Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                        Step 1: View Template
                      </h2>
                      {template ? (
                        <div className="space-y-4">
                          <div className="w-full bg-white border border-gray-200 rounded-lg overflow-auto p-2 sm:p-4">
                            <TBSymptomScreen
                              onFormDataChange={setTbFormData}
                              initialData={tbFormData}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600">
                          No template available yet. Please contact HR.
                        </p>
                      )}
                    </div>

                    {/* Step 2 removed: Digital Signature & Date */}

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
                        📝 Current: TB Symptom Screen
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                        <button
                          type="button"
                          onClick={() =>
                            navigate("/employee/edit-background-check-results")
                          }
                          className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#2748B4] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                        >
                          <ArrowLeft className="w-4 h-4 inline mr-2" />
                          Previous Form
                        </button>

                        <div className="w-full sm:w-auto flex justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              navigate("/employee/task-management")
                            }
                            className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                          >
                            Exit Application
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            setIsSaving(true);
                            try {
                              const userCookie = Cookies.get("user");
                              const user = userCookie
                                ? JSON.parse(userCookie)
                                : { _id: "67e0f8770c6feb6ba99d11d2" };

                              const status = "completed";

                              // Get form data from TBSymptomScreen component and format dates
                              let formData = { ...tbFormData };

                              // Format dateOfBirth to proper date format if it exists
                              if (formData.dateOfBirth) {
                                try {
                                  const date = new Date(formData.dateOfBirth);
                                  if (!isNaN(date.getTime())) {
                                    formData.dateOfBirth = date.toISOString();
                                  } else {
                                    // If invalid date, set to null or remove the field
                                    formData.dateOfBirth = null;
                                  }
                                } catch (error) {
                                  console.error(
                                    "Error formatting dateOfBirth:",
                                    error
                                  );
                                  formData.dateOfBirth = null;
                                }
                              }

                              // Format testDate if it exists
                              if (formData.testDate) {
                                try {
                                  const date = new Date(formData.testDate);
                                  if (!isNaN(date.getTime())) {
                                    formData.testDate = date.toISOString();
                                  } else {
                                    formData.testDate = null;
                                  }
                                } catch (error) {
                                  console.error(
                                    "Error formatting testDate:",
                                    error
                                  );
                                  formData.testDate = null;
                                }
                              }

                              // Format todaysDate if it exists
                              if (formData.todaysDate) {
                                try {
                                  const date = new Date(formData.todaysDate);
                                  if (!isNaN(date.getTime())) {
                                    formData.todaysDate = date.toISOString();
                                  } else {
                                    formData.todaysDate = null;
                                  }
                                } catch (error) {
                                  console.error(
                                    "Error formatting todaysDate:",
                                    error
                                  );
                                  formData.todaysDate = null;
                                }
                              }

                              // Format signatureDate if it exists
                              if (formData.signatureDate) {
                                try {
                                  const date = new Date(formData.signatureDate);
                                  if (!isNaN(date.getTime())) {
                                    formData.signatureDate = date.toISOString();
                                  } else {
                                    formData.signatureDate = null;
                                  }
                                } catch (error) {
                                  console.error(
                                    "Error formatting signatureDate:",
                                    error
                                  );
                                  formData.signatureDate = null;
                                }
                              }

                              console.log("Formatted formData:", formData);

                              const response = await axios.post(
                                `${baseURL}/onboarding/save-tb-symptom-screen`,
                                {
                                  applicationId,
                                  employeeId: user._id,
                                  formData,
                                  status,
                                },
                                { withCredentials: true }
                              );

                              if (response.data) {
                                toast.success(
                                  "TB Symptom Screen completed successfully!"
                                );
                                // Refresh progress data after saving
                                await fetchProgressData(user._id);
                                window.dispatchEvent(
                                  new Event("formStatusUpdated")
                                );

                                setTimeout(() => {
                                  navigate("/employee/emergency-contact");
                                }, 1500);
                              }
                            } catch (error) {
                              console.error(
                                "Error saving tb symptom screen:",
                                error
                              );
                              toast.error("Failed to save form");
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isSaving}
                        >
                          <Send className="w-5 h-5" />
                          <span className="text-sm sm:text-base">
                            {isSaving ? "Saving..." : "Save & Next"}
                          </span>
                        </button>
                      </div>
                    </div>
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

export default EditSymptomScreenForm;
