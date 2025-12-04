import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Upload,
  FileText,
  CheckCircle,
  Send,
  Trash2,
  RotateCcw,
  Edit,
  Save,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";
import axios from "axios";
import Cookies from "js-cookie";

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

function FormI9({ initialFormData = {}, onFormDataChange }) {
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange(formData);
    }
  }, [formData, onFormDataChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSSNChange = (digitIndex, value) => {
    const currentDigits = formData.socialSecurityNumber || "";
    const digitsArray = currentDigits.padEnd(9, " ").split("");
    digitsArray[digitIndex] = value.replace(/\D/g, "") || " ";
    const newDigits = digitsArray.join("").trim();
    setFormData((prev) => ({ ...prev, socialSecurityNumber: newDigits }));
  };

  const handleSSNKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      const prevInput = e.target.parentElement.children[index - 1];
      if (prevInput) prevInput.focus();
    }
  };

  // Helper function to check if a year is a leap year
  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  // Helper function to get max days in a month
  const getMaxDaysInMonth = (month, year) => {
    const daysInMonth = {
      1: 31,  // January
      2: isLeapYear(year) ? 29 : 28,  // February
      3: 31,  // March
      4: 30,  // April
      5: 31,  // May
      6: 30,  // June
      7: 31,  // July
      8: 31,  // August
      9: 30,  // September
      10: 31, // October
      11: 30, // November
      12: 31  // December
    };
    return daysInMonth[month] || 31;
  };

  // Helper function to validate and format date
  const validateAndFormatDate = (value) => {
    // Limit to 8 digits (mmddyyyy)
    value = value.slice(0, 8);
    
    // Smart month handling
    if (value.length >= 1) {
      const firstDigit = parseInt(value[0]);
      
      // If user has typed 3+ digits and first digit is 1-9, check if we need to prepend 0
      if (value.length >= 3) {
        // If month part is single digit (1-9), prepend 0
        const potentialMonth = value.slice(0, 2);
        if (potentialMonth[0] !== '0' && potentialMonth[0] !== '1') {
          // First digit is 2-9, so month must be 02-09
          value = '0' + value;
        } else if (potentialMonth[0] === '1') {
          const month = parseInt(potentialMonth);
          if (month > 12) {
            // 13-19 is invalid, treat first digit as month 01-09
            value = '0' + value;
          }
        }
      } else if (value.length === 2) {
        // Check if two-digit month is valid
        const month = parseInt(value);
        if (month > 12) {
          // Invalid month like 13-99, treat as single digit month + day
          value = '0' + value;
        } else if (month === 0) {
          value = '01';
        }
      } else if (value.length === 1 && firstDigit > 1) {
        // Single digit 2-9 immediately becomes 02-09
        value = '0' + value;
      }
    }
    
    // Revalidate month after prepending
    if (value.length >= 2) {
      const month = parseInt(value.slice(0, 2));
      if (month > 12) {
        value = '12' + value.slice(2);
      } else if (month === 0) {
        value = '01' + value.slice(2);
      }
    }
    
    // Smart day handling - immediately prepend 0 for days 4-9
    if (value.length >= 3) {
      const month = parseInt(value.slice(0, 2));
      const dayFirstDigit = value[2];
      const firstDayDigit = parseInt(dayFirstDigit);
      
      // If day starts with 4-9, immediately prepend 0
      if (value.length === 3 && firstDayDigit >= 4 && firstDayDigit <= 9) {
        value = value.slice(0, 2) + '0' + value.slice(2);
      }
      // If user has typed more digits, check if day exceeds max
      else if (value.length >= 5) {
        const dayPart = value.slice(2, 4);
        const day = parseInt(dayPart);
        
        if (firstDayDigit >= 4 && firstDayDigit <= 9) {
          // Get max days for the month
          let year = new Date().getFullYear();
          if (value.length >= 8) {
            year = parseInt(value.slice(4, 8));
          }
          const maxDays = getMaxDaysInMonth(month, year);
          
          // If the two-digit day exceeds max days, prepend 0
          if (day > maxDays) {
            value = value.slice(0, 2) + '0' + value.slice(2);
          }
        }
      }
    }
    
    // Validate day (digits 3-4)
    if (value.length >= 4) {
      const month = parseInt(value.slice(0, 2));
      const day = parseInt(value.slice(2, 4));
      
      // Get year if available, otherwise use current year for validation
      let year = new Date().getFullYear();
      if (value.length >= 8) {
        year = parseInt(value.slice(4, 8));
      }
      
      const maxDays = getMaxDaysInMonth(month, year);
      
      if (day > maxDays) {
        value = value.slice(0, 2) + maxDays.toString().padStart(2, '0') + value.slice(4);
      } else if (day === 0) {
        value = value.slice(0, 2) + '01' + value.slice(4);
      }
    }
    
    // Format as mm/dd/yyyy
    let formatted = value;
    if (value.length >= 2) {
      formatted = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (value.length >= 4) {
      formatted = value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4);
    }
    
    return formatted;
  };

  const handleDateOfBirthChange = (e) => {
    const input = e.target.value;
    // Remove all non-digits
    let value = input.replace(/\D/g, "");
    
    const formatted = validateAndFormatDate(value);
    setFormData((prev) => ({ ...prev, dateOfBirth: formatted }));
  };

  const handleDateOfBirthKeyDown = (e) => {
    if (e.key === 'Backspace') {
      const currentValue = formData.dateOfBirth || "";
      const digits = currentValue.replace(/\D/g, "");
      
      if (digits.length > 0) {
        e.preventDefault();
        const newDigits = digits.slice(0, -1);
        const formatted = validateAndFormatDate(newDigits);
        setFormData((prev) => ({ ...prev, dateOfBirth: formatted }));
      }
    }
  };

  const handleWorkAuthExpDateChange = (e) => {
    const input = e.target.value;
    // Remove all non-digits
    let value = input.replace(/\D/g, "");
    
    const formatted = validateAndFormatDate(value);
    setFormData((prev) => ({ ...prev, workAuthExpDate: formatted }));
  };

  const handleWorkAuthExpDateKeyDown = (e) => {
    if (e.key === 'Backspace') {
      const currentValue = formData.workAuthExpDate || "";
      const digits = currentValue.replace(/\D/g, "");
      
      if (digits.length > 0) {
        e.preventDefault();
        const newDigits = digits.slice(0, -1);
        const formatted = validateAndFormatDate(newDigits);
        setFormData((prev) => ({ ...prev, workAuthExpDate: formatted }));
      }
    }
  };

  // Format phone number as +1 (XXX) XXX-XXXX
  const formatPhone = (value) => {
    // Remove +1 prefix if it exists, then remove all non-digit characters
    const withoutPrefix = value.replace(/^\+1\s*/, "");
    const cleaned = withoutPrefix.replace(/\D/g, "");

    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);

    // Format as +1 (XXX) XXX-XXXX
    if (limited.length === 0) {
      return "";
    } else if (limited.length <= 3) {
      return `+1 (${limited}`;
    } else if (limited.length <= 6) {
      return `+1 (${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else {
      return `+1 (${limited.slice(0, 3)}) ${limited.slice(
        3,
        6
      )}-${limited.slice(6)}`;
    }
  };

  const handleTelephoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, telephone: formatted }));
  };

  return (
    <>
      <div className="max-w-full sm:max-w-[8.5in] mx-auto py-[0.25in] sm:py-[0.5in] px-2 sm:px-[0.5in] bg-white font-[Arial,sans-serif] text-[10pt] leading-[1.2]">
        {/* === HEADER === */}
        <header className="flex justify-between items-start mb-1 pb-1 border-b-4 border-black">
          <div className="flex-shrink-0">
            <img
              src="/us-department-of-homeland-security.svg"
              alt="Department of Homeland Security"
              className="h-12 w-12"
            />
          </div>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold">
              Employment Eligibility Verification
            </h1>
            <h2 className="text-base font-bold">
              Department of Homeland Security
            </h2>
            <p className="text-sm">U.S. Citizenship and Immigration Services</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-bold text-sm">USCIS</div>
            <div className="font-bold text-sm">Form I-9</div>
            <div className="text-xs">OMB No.1615-0047</div>
            <div className="text-xs">Expires 05/31/2027</div>
          </div>
        </header>
        {/* === SECTION 1: EMPLOYEE INFORMATION === */}
        <section className="border border-black mb-1">
          <header className="bg-gray-300 text-black p-[5px] border-b border-black">
            <h3 className="text-[8.5pt] font-bold">
              Section 1. Employee Information and Attestation:{" "}
              <span className="font-normal">
                Employees must complete and sign Section 1 of Form I-9 no later
                than the first day of employment, but not before accepting a job
                offer.
              </span>
            </h3>
          </header>
          <div className="p-[5px]">
            <table className="w-full border-collapse text-[7pt] leading-[1.1]">
              <tbody>
                <tr>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt] whitespace-nowrap">
                      Last Name (Family Name)
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt] whitespace-nowrap">
                      First Name (Given Name)
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt] whitespace-nowrap">
                      Middle Initial (if any)
                    </div>
                    <input
                      type="text"
                      name="middleInitial"
                      value={formData.middleInitial || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt] whitespace-nowrap">
                      Other Last Names Used (if any)
                    </div>
                    <input
                      type="text"
                      name="otherLastNames"
                      value={formData.otherLastNames || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt] whitespace-nowrap">
                      Address (Street Number and Name)
                    </div>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-[2px] w-[80px]">
                    <div className="text-[7pt] whitespace-nowrap">
                      Apt. Number (if any)
                    </div>
                    <input
                      type="text"
                      name="aptNumber"
                      value={formData.aptNumber || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt] whitespace-nowrap">
                      City or Town
                    </div>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-[2px] w-[50px]">
                    <div className="text-[7pt] whitespace-nowrap">State</div>
                    <select
                      name="state"
                      value={formData.state || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt]"
                    >
                      <option value=""></option>
                      <option value="AL">AL</option>
                      <option value="AK">AK</option>
                      <option value="AZ">AZ</option>
                      <option value="AR">AR</option>
                      <option value="CA">CA</option>
                      <option value="CO">CO</option>
                      <option value="CT">CT</option>
                      <option value="DE">DE</option>
                      <option value="FL">FL</option>
                      <option value="GA">GA</option>
                      <option value="HI">HI</option>
                      <option value="ID">ID</option>
                      <option value="IL">IL</option>
                      <option value="IN">IN</option>
                      <option value="IA">IA</option>
                      <option value="KS">KS</option>
                      <option value="KY">KY</option>
                      <option value="LA">LA</option>
                      <option value="ME">ME</option>
                      <option value="MD">MD</option>
                      <option value="MA">MA</option>
                      <option value="MI">MI</option>
                      <option value="MN">MN</option>
                      <option value="MS">MS</option>
                      <option value="MO">MO</option>
                      <option value="MT">MT</option>
                      <option value="NE">NE</option>
                      <option value="NV">NV</option>
                      <option value="NH">NH</option>
                      <option value="NJ">NJ</option>
                      <option value="NM">NM</option>
                      <option value="NY">NY</option>
                      <option value="NC">NC</option>
                      <option value="ND">ND</option>
                      <option value="OH">OH</option>
                      <option value="OK">OK</option>
                      <option value="OR">OR</option>
                      <option value="PA">PA</option>
                      <option value="RI">RI</option>
                      <option value="SC">SC</option>
                      <option value="SD">SD</option>
                      <option value="TN">TN</option>
                      <option value="TX">TX</option>
                      <option value="UT">UT</option>
                      <option value="VT">VT</option>
                      <option value="VA">VA</option>
                      <option value="WA">WA</option>
                      <option value="WV">WV</option>
                      <option value="WI">WI</option>
                      <option value="WY">WY</option>
                    </select>
                  </td>
                  <td className="border border-black p-[2px] w-[70px]">
                    <div className="text-[7pt] whitespace-nowrap">ZIP Code</div>
                    <input
                      type="text"
                      name="zipCode"
                      maxLength="9"
                      value={formData.zipCode || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[9pt]"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt] whitespace-nowrap">
                      Date of Birth (mm/dd/yyyy)
                    </div>
                    <input
                      type="text"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ""}
                      onChange={handleDateOfBirthChange}
                      onKeyDown={handleDateOfBirthKeyDown}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt] whitespace-nowrap">
                      U.S. Social Security Number
                    </div>
                    <div className="flex gap-0 justify-center">
                      {[...Array(9)].map((_, i) => (
                        <input
                          key={i}
                          type="text"
                          maxLength="1"
                          value={(formData.socialSecurityNumber || "")[i] || ""}
                          onChange={(e) => handleSSNChange(i, e.target.value)}
                          onKeyDown={(e) => handleSSNKeyDown(e, i)}
                          className="w-6 h-6 text-center border border-black px-0 py-0 outline-none bg-white text-[13px] font-bold text-black"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt] whitespace-nowrap">
                      Employee's Email Address
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[9pt]"
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt] whitespace-nowrap">
                      Employee's Telephone Number
                    </div>
                    <input
                      type="text"
                      name="telephone"
                      value={formData.telephone || ""}
                      onChange={handleTelephoneChange}
                      className="w-full border-0 p-0 focus:outline-none text-[9pt]"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            {/* === Attestation === */}
            <table className="w-full border-collapse text-[7pt] mt-1">
              <tbody>
                <tr>
                  <td
                    className="border border-black p-[2px]"
                    rowSpan="6"
                    style={{ width: "25%" }}
                  >
                    <strong className="text-[7pt]">
                      I am aware that federal law provides for imprisonment
                      and/or fines for false statements, or the use of false
                      documents, in connection with the completion of this form.
                      I attest, under penalty of perjury, that this information,
                      including my selection of the box attesting to my
                      citizenship or immigration status, is true and correct.
                    </strong>
                  </td>
                  <td className="border border-black p-[2px]" colSpan="3">
                    <div className="text-[7pt]">
                      Check one of the following boxes to attest to your
                      citizenship or immigration status (See page 2 and 3 of the
                      instructions.):
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]" colSpan="3">
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={formData.citizenshipStatus === "citizen"}
                        onChange={(e) => {
                          const newValue = e.target.checked ? "citizen" : "";
                          setFormData((prev) => ({
                            ...prev,
                            citizenshipStatus: newValue,
                          }));
                        }}
                      />
                      <span>1. A citizen of the United States</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]" colSpan="3">
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={formData.citizenshipStatus === "national"}
                        onChange={(e) => {
                          const newValue = e.target.checked ? "national" : "";
                          setFormData((prev) => ({
                            ...prev,
                            citizenshipStatus: newValue,
                          }));
                        }}
                      />
                      <span>
                        2. A noncitizen national of the United States (See
                        Instructions.)
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]" colSpan="3">
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={formData.citizenshipStatus === "alien"}
                        onChange={(e) => {
                          const newValue = e.target.checked ? "alien" : "";
                          setFormData((prev) => ({
                            ...prev,
                            citizenshipStatus: newValue,
                          }));
                        }}
                      />
                      <span>
                        3. A lawful permanent resident (Enter USCIS or
                        A-Number.)
                      </span>
                      <input
                        type="text"
                        name="aNumber"
                        value={formData.aNumber || ""}
                        onChange={handleChange}
                        className="flex-1 border-0 border-b border-black px-1 focus:outline-none"
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]" colSpan="3">
                    <div className="flex items-start gap-1">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={formData.citizenshipStatus === "authorized"}
                        onChange={(e) => {
                          const newValue = e.target.checked ? "authorized" : "";
                          setFormData((prev) => ({
                            ...prev,
                            citizenshipStatus: newValue,
                          }));
                        }}
                      />
                      <div className="flex-1">
                        <div>
                          4. An alien authorized to work until{" "}
                          <input
                            type="text"
                            name="workAuthExpDate"
                            value={formData.workAuthExpDate || ""}
                            onChange={handleWorkAuthExpDateChange}
                            onKeyDown={handleWorkAuthExpDateKeyDown}
                            placeholder="(mm/dd/yyyy)"
                            className="w-40 border-0 border-b border-black px-1 ml-2 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]" colSpan="3">
                    <div className="text-[7pt] text-center">
                      If you check Item Number 4., enter one of these:
                    </div>
                    <div className="flex items-start gap-1">
                      <div
                        className="border border-black p-1"
                        style={{ width: "20%" }}
                      >
                        <div className="text-[7pt] mb-1">USCIS A-Number</div>
                        <input
                          type="text"
                          name="uscisANumber"
                          value={formData.uscisANumber || ""}
                          onChange={handleChange}
                          className="w-full border-0 border-b border-black focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center justify-center font-bold ">
                        OR
                      </div>
                      <div
                        className="border border-black p-1"
                        style={{ width: "28%" }}
                      >
                        <div className="text-[7pt] mb-1 ">
                          Form I-94 Admission Number
                        </div>
                        <input
                          type="text"
                          name="i94Number"
                          value={formData.i94Number || ""}
                          onChange={handleChange}
                          className="w-full border-0 border-b border-black focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center justify-center font-bold ">
                        OR
                      </div>
                      <div className="flex-1 border border-black p-1">
                        <div className="text-[7pt] mb-1">
                          Foreign Passport Number and Country of Issuance
                        </div>
                        <input
                          type="text"
                          name="passportNumber"
                          value={formData.passportNumber || ""}
                          onChange={handleChange}
                          className="w-full border-0 border-b border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt]">Signature of Employee</div>
                    <input
                      type="text"
                      name="employeeSignature"
                      value={formData.employeeSignature || ""}
                      onChange={handleChange}
                      className="w-full border-0 focus:outline-none"
                      style={{ fontFamily: "Brush Script MT, cursive" }}
                    />
                  </td>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt]">Today's Date (mm/dd/yyyy)</div>
                    <input
                      type="text"
                      name="employeeSignatureDate"
                      value={formData.employeeSignatureDate || ""}
                      onChange={handleChange}
                      className="w-full border-0 focus:outline-none"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-1 p-1 bg-gray-100 border border-black text-[7pt]">
              <strong>
                If a preparer and/or translator assisted you in completing
                Section 1, that person MUST complete the{" "}
                <a
                  href="https://www.uscis.gov/i-9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Preparer and/or Translator Certification
                </a>{" "}
                on Page 3.
              </strong>
            </div>
          </div>
        </section>
        {/* === SECTION 2: EMPLOYER REVIEW === */}
        <section className="border border-black mt-1">
          <header className="bg-gray-300 text-black p-[5px] border-b border-black">
            <h3 className="text-[7pt] font-bold leading-[1.3]">
              Section 2. Employer or Authorized Representative Review and
              Verification:{" "}
              <span className="font-normal">
                Employers or their authorized representative must complete and
                sign Section 2 within three business days after the employee's
                first day of employment, and must physically examine, or examine
                consistent with an alternative procedure authorized by the
                Secretary of DHS, documentation from List A OR a combination of
                documentation from List B and List C. Enter any additional
                documentation in the Additional Information box; see
                Instructions.
              </span>
            </h3>
          </header>
          <div className="p-0">
            <table className="w-full border-collapse text-[7pt] leading-[1.3]">
              <tbody>
                <tr>
                  <td
                    className="border border-black p-[2px] text-center font-bold bg-gray-100"
                    style={{ width: "35%" }}
                  >
                    List A
                  </td>
                  <td
                    className="border border-black text-center bg-gray-100"
                    style={{ width: "0%" }}
                  >
                    OR
                  </td>
                  <td
                    className="border border-black p-[2px] text-center font-bold bg-gray-100"
                    style={{ width: "28%" }}
                  >
                    List B
                  </td>
                  <td
                    className="border border-black text-center bg-gray-100"
                    style={{ width: "0%" }}
                  >
                    AND
                  </td>
                  <td
                    className="border border-black p-[2px] text-center font-bold bg-gray-100"
                    style={{ width: "28%" }}
                  >
                    List C
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-0">
                    <div className="flex">
                      <div
                        className="bg-gray-200 p-[2px] text-[7pt] flex-shrink-0 font-bold"
                        style={{ width: "50%" }}
                      >
                        Document Title 1
                      </div>
                      <div className="border-l border-black flex-1 p-[2px]">
                        <input
                          type="text"
                          name="listADocTitle1"
                          value={formData.listADocTitle1 || ""}
                          onChange={handleChange}
                          className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                        />
                      </div>
                    </div>
                  </td>
                  <td
                    className="border border-black p-[2px] bg-gray-50"
                    rowSpan="4"
                  ></td>
                  <td className="border border-black p-[2px]">
                    <input
                      type="text"
                      name="listBDocTitle1"
                      value={formData.listBDocTitle1 || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                    />
                  </td>
                  <td
                    className="border border-black p-[2px] bg-gray-50"
                    rowSpan="4"
                  ></td>
                  <td className="border border-black p-[2px]">
                    <input
                      type="text"
                      name="listCDocTitle1"
                      value={formData.listCDocTitle1 || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-0">
                    <div className="flex">
                      <div
                        className="bg-gray-200 p-[2px] text-[7pt] flex-shrink-0"
                        style={{ width: "50%" }}
                      >
                        Issuing Authority
                      </div>
                      <div className="border-l border-black flex-1 p-[2px]">
                        <input
                          type="text"
                          name="listAIssuingAuth1"
                          value={formData.listAIssuingAuth1 || ""}
                          onChange={handleChange}
                          className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="border border-black p-[2px]">
                    <input
                      type="text"
                      name="listBIssuingAuth1"
                      value={formData.listBIssuingAuth1 || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <input
                      type="text"
                      name="listCIssuingAuth1"
                      value={formData.listCIssuingAuth1 || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-0">
                    <div className="flex">
                      <div
                        className="bg-gray-200 p-[2px] text-[7pt] flex-shrink-0"
                        style={{ width: "50%" }}
                      >
                        Document Number (if any)
                      </div>
                      <div className="border-l border-black flex-1 p-[2px]">
                        <input
                          type="text"
                          name="listADocNumber1"
                          value={formData.listADocNumber1 || ""}
                          onChange={handleChange}
                          className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="border border-black p-[2px]">
                    <input
                      type="text"
                      name="listBDocNumber1"
                      value={formData.listBDocNumber1 || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <input
                      type="text"
                      name="listCDocNumber1"
                      value={formData.listCDocNumber1 || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-0">
                    <div className="flex">
                      <div
                        className="bg-gray-200 p-[2px] text-[7pt] flex-shrink-0"
                        style={{ width: "50%" }}
                      >
                        Expiration Date (if any)
                      </div>
                      <div className="border-l border-black flex-1 p-[2px]">
                        <input
                          type="text"
                          name="listAExpDate1"
                          value={formData.listAExpDate1 || ""}
                          onChange={handleChange}
                          className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="border border-black p-[2px]">
                    <input
                      type="text"
                      name="listBExpDate1"
                      value={formData.listBExpDate1 || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <input
                      type="text"
                      name="listCExpDate1"
                      value={formData.listCExpDate1 || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-0">
                    <div className="flex">
                      <div
                        className="bg-gray-200 p-[2px] text-[7pt] font-bold flex-shrink-0"
                        style={{ width: "50%" }}
                      >
                        Document Title 2 (if any)
                      </div>
                      <div className="border-l border-black flex-1 p-[2px]">
                        <input
                          type="text"
                          className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                        />
                      </div>
                    </div>
                  </td>
                  <td
                    className="border border-black p-[2px]"
                    colSpan="4"
                    rowSpan="8"
                  >
                    <div className="bg-gray-200">
                      <div className="font-bold text-[7pt] mr-1 ml-1">
                        Additional Information
                      </div>
                    </div>
                    <textarea
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent mt-1 mr-1 ml-1"
                      rows="7"
                    ></textarea>
                    <div className="flex items-center mr-1 ml-1">
                      <input type="checkbox" className="mr-1 w-3 h-3" />
                      <span className="text-[7pt]">
                        Check here if you used an alternative procedure
                        authorized by DHS to examine documents.
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-0">
                    <div className="flex">
                      <div
                        className="bg-gray-200 p-[2px] text-[7pt] flex-shrink-0"
                        style={{ width: "50%" }}
                      >
                        Issuing Authority
                      </div>
                      <div className="border-l border-black flex-1 p-[2px]">
                        <input
                          type="text"
                          className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-0">
                    <div className="flex">
                      <div
                        className="bg-gray-200 p-[2px] text-[7pt] flex-shrink-0"
                        style={{ width: "50%" }}
                      >
                        Document Number (if any)
                      </div>
                      <div className="border-l border-black flex-1 p-[2px]">
                        <input
                          type="text"
                          className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-0">
                    <div className="flex">
                      <div
                        className="bg-gray-200 p-[2px] text-[7pt] flex-shrink-0"
                        style={{ width: "50%" }}
                      >
                        Expiration Date (if any)
                      </div>
                      <div className="border-l border-black flex-1 p-[2px]">
                        <input
                          type="text"
                          className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-0">
                    <div className="flex">
                      <div
                        className="bg-gray-200 p-[2px] text-[7pt] font-bold flex-shrink-0"
                        style={{ width: "50%" }}
                      >
                        Document Title 3 (if any)
                      </div>
                      <div className="border-l border-black flex-1 p-[2px]">
                        <input
                          type="text"
                          name="listADocTitle3"
                          value={formData.listADocTitle3 || ""}
                          onChange={handleChange}
                          className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-0">
                    <div className="flex">
                      <div
                        className="bg-gray-200 p-[2px] text-[7pt] flex-shrink-0"
                        style={{ width: "50%" }}
                      >
                        Issuing Authority
                      </div>
                      <div className="border-l border-black flex-1 p-[2px]">
                        <input
                          type="text"
                          name="listAIssuingAuth3"
                          value={formData.listAIssuingAuth3 || ""}
                          onChange={handleChange}
                          className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-0">
                    <div className="flex">
                      <div
                        className="bg-gray-200 p-[2px] text-[7pt] flex-shrink-0"
                        style={{ width: "50%" }}
                      >
                        Document Number (if any)
                      </div>
                      <div className="border-l border-black flex-1 p-[2px]">
                        <input
                          type="text"
                          name="listADocNumber3"
                          value={formData.listADocNumber3 || ""}
                          onChange={handleChange}
                          className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-0">
                    <div className="flex">
                      <div
                        className="bg-gray-200 p-[2px] text-[7pt] flex-shrink-0"
                        style={{ width: "50%" }}
                      >
                        Expiration Date (if any)
                      </div>
                      <div className="border-l border-black flex-1 p-[2px]">
                        <input
                          type="text"
                          name="listAExpDate3"
                          value={formData.listAExpDate3 || ""}
                          onChange={handleChange}
                          className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]" colSpan="4">
                    <div className="font-bold text-[7pt]">
                      Certification: I attest, under penalty of perjury, that
                      (1) I have examined the documentation presented by the
                      above-named employee, (2) the above-listed documentation
                      appears to be genuine and to relate to the employee named,
                      and (3) to the best of my knowledge, the employee is
                      authorized to work in the United States.
                    </div>
                  </td>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt]">First Day of Employment</div>
                    <div className="text-[7pt]">(mm/dd/yyyy):</div>
                    <input
                      type="text"
                      name="firstDayEmployment"
                      value={formData.firstDayEmployment || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt] whitespace-nowrap">
                      Last Name, First Name and Title of Employer or Authorized
                      Representative
                    </div>
                    <input
                      type="text"
                      name="employerName"
                      value={formData.employerName || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                    />
                  </td>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt] whitespace-nowrap">
                      Signature of Employer or Authorized Representative
                    </div>
                    <input
                      type="text"
                      name="employerSignature"
                      value={formData.employerSignature || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                      style={{ fontFamily: "Brush Script MT, cursive" }}
                    />
                  </td>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt] whitespace-nowrap">
                      Today's Date (mm/dd/yyyy)
                    </div>
                    <input
                      type="text"
                      name="employerSignatureDate"
                      value={formData.employerSignatureDate || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt] whitespace-nowrap">
                      Employer's Business or Organization Name
                    </div>
                    <input
                      type="text"
                      name="employerBusinessName"
                      value={formData.employerBusinessName || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                    />
                  </td>
                  <td className="border border-black p-[2px]" colSpan="4">
                    <div className="text-[7pt] whitespace-nowrap">
                      Employer's Business or Organization Address, City or Town,
                      State, ZIP Code
                    </div>
                    <input
                      type="text"
                      name="employerBusinessAddress"
                      value={formData.employerBusinessAddress || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        {/* === FOOTER === */}
        <footer className="flex justify-between items-center mt-2 text-[7pt] border-t border-black pt-1">
          <div>
            For reverification or rehire, complete Supplement B, Reverification
            and Rehire on Page 4.
          </div>
          <div>Form I-9 Edition 01/20/25</div>
          <div>Page 1 of 4</div>
        </footer>
      </div>
      {/* === PAGE 2 === */}
      <div className="max-w-full sm:max-w-[8.5in] mx-auto py-[0.25in] sm:py-[0.5in] px-2 sm:px-[0.5in] bg-white">
        <img
          src="/i9_page2.png"
          alt="I-9 Form Page 2"
          className="w-full h-auto"
        />
      </div>
      {/* === PAGE 3 === */}
      <div className="max-w-full sm:max-w-[8.5in] mx-auto py-[0.25in] sm:py-[0.5in] px-2 sm:px-[0.5in] bg-white font-[Arial,sans-serif] text-[7pt] leading-[1.2]">
        <header className="flex justify-between items-start mb-0 pb-1 border-b-4 border-black">
          <div className="flex-shrink-0">
            <img
              src="/us-department-of-homeland-security.svg"
              alt="Department of Homeland Security"
              className="h-12 w-12"
            />
          </div>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold">Supplement A,</h1>
            <h2 className="text-base font-bold">
              Preparer and/or Translator Certification for Section 1
            </h2>
            <p className="text-sm mt-1 font-bold">
              Department of Homeland Security
            </p>
            <p className="text-sm">U.S. Citizenship and Immigration Services</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-bold text-sm">USCIS</div>
            <div className="font-bold text-sm">Form I-9</div>
            <div className="font-bold text-sm">Supplement A</div>
            <div className="text-xs">OMB No. 1615-0047</div>
            <div className="text-xs">Expires 05/31/2027</div>
          </div>
        </header>
        <div className="border border-black p-[5px] mb-1">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-black p-[2px]">
                  <div className="text-[7pt]">
                    Last Name (Family Name) from Section 1.
                  </div>
                  <input
                    type="text"
                    name="suppALastName"
                    value={formData.suppALastName || ""}
                    onChange={handleChange}
                    className="w-full border-0 p-0 focus:outline-none"
                  />
                </td>
                <td className="border border-black p-[2px]">
                  <div className="text-[7pt]">
                    First Name (Given Name) from Section 1.
                  </div>
                  <input
                    type="text"
                    name="suppAFirstName"
                    value={formData.suppAFirstName || ""}
                    onChange={handleChange}
                    className="w-full border-0 p-0 focus:outline-none"
                  />
                </td>
                <td className="border border-black p-[2px]">
                  <div className="text-[7pt]">
                    Middle Initial (if any) from Section 1.
                  </div>
                  <input
                    type="text"
                    name="suppAMiddleInitial"
                    value={formData.suppAMiddleInitial || ""}
                    onChange={handleChange}
                    className="w-full border-0 p-0 focus:outline-none"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-[7pt] mb-2 leading-[1.3]">
          <strong>
            Instructions: This supplement must be completed by any preparer
            and/or translator who assists an employee in completing Section 1 of
            Form I-9. The preparer and/or translator must enter the employee's
            name in the spaces provided above. Each preparer or translator must
            complete, sign, and date a separate certification area. Employers
            must retain completed supplement sheets with the employee's
            completed Form I-9.
          </strong>
        </div>
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className="mb-2">
            <div className="font-bold text-[7pt] mb-1">
              I attest, under penalty of perjury, that I have assisted in the
              completion of Section 1 of this form and that to the best of my
              knowledge the information is true and correct.
            </div>
            <table className="w-full border-collapse border border-black">
              <tbody>
                <tr>
                  <td className="border border-black p-[2px]" colSpan="3">
                    <div className="text-[7pt]">
                      Signature of Preparer or Translator
                    </div>
                    <input
                      type="text"
                      name={`prep${num}Signature`}
                      value={formData[`prep${num}Signature`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                      style={{ fontFamily: "Brush Script MT, cursive" }}
                    />
                  </td>
                  <td className="border border-black p-[2px]" colSpan="3">
                    <div className="text-[7pt]">Date (mm/dd/yyyy)</div>
                    <input
                      type="text"
                      name={`prep${num}Date`}
                      value={formData[`prep${num}Date`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt]">Last Name (Family Name)</div>
                    <input
                      type="text"
                      name={`prep${num}LastName`}
                      value={formData[`prep${num}LastName`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt]">First Name (Given Name)</div>
                    <input
                      type="text"
                      name={`prep${num}FirstName`}
                      value={formData[`prep${num}FirstName`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt]">Middle Initial (if any)</div>
                    <input
                      type="text"
                      name={`prep${num}MiddleInitial`}
                      value={formData[`prep${num}MiddleInitial`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt]">
                      Address (Street Number and Name)
                    </div>
                    <input
                      type="text"
                      name={`prep${num}Address`}
                      value={formData[`prep${num}Address`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt]">City or Town</div>
                    <input
                      type="text"
                      name={`prep${num}City`}
                      value={formData[`prep${num}City`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt]">State</div>
                    <select
                      name={`prep${num}State`}
                      value={formData[`prep${num}State`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt]"
                    >
                      <option value=""></option>
                      <option value="AL">AL</option>
                      <option value="AK">AK</option>
                      <option value="AZ">AZ</option>
                      <option value="AR">AR</option>
                      <option value="CA">CA</option>
                      <option value="CO">CO</option>
                      <option value="CT">CT</option>
                      <option value="DE">DE</option>
                      <option value="FL">FL</option>
                      <option value="GA">GA</option>
                      <option value="HI">HI</option>
                      <option value="ID">ID</option>
                      <option value="IL">IL</option>
                      <option value="IN">IN</option>
                      <option value="IA">IA</option>
                      <option value="KS">KS</option>
                      <option value="KY">KY</option>
                      <option value="LA">LA</option>
                      <option value="ME">ME</option>
                      <option value="MD">MD</option>
                      <option value="MA">MA</option>
                      <option value="MI">MI</option>
                      <option value="MN">MN</option>
                      <option value="MS">MS</option>
                      <option value="MO">MO</option>
                      <option value="MT">MT</option>
                      <option value="NE">NE</option>
                      <option value="NV">NV</option>
                      <option value="NH">NH</option>
                      <option value="NJ">NJ</option>
                      <option value="NM">NM</option>
                      <option value="NY">NY</option>
                      <option value="NC">NC</option>
                      <option value="ND">ND</option>
                      <option value="OH">OH</option>
                      <option value="OK">OK</option>
                      <option value="OR">OR</option>
                      <option value="PA">PA</option>
                      <option value="RI">RI</option>
                      <option value="SC">SC</option>
                      <option value="SD">SD</option>
                      <option value="TN">TN</option>
                      <option value="TX">TX</option>
                      <option value="UT">UT</option>
                      <option value="VT">VT</option>
                      <option value="VA">VA</option>
                      <option value="WA">WA</option>
                      <option value="WV">WV</option>
                      <option value="WI">WI</option>
                      <option value="WY">WY</option>
                    </select>
                  </td>
                  <td className="border border-black p-[2px] w-[90px]">
                    <div className="text-[7pt]">ZIP Code</div>
                    <input
                      type="text"
                      name={`prep${num}ZipCode`}
                      value={formData[`prep${num}ZipCode`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
        <footer className="flex justify-between items-center mt-30 text-[7pt] border-t border-black pt-1">
          <div>Form I-9 Edition 01/20/25</div>
          <div>Page 3 of 4</div>
        </footer>
      </div>
      {/* === PAGE 4 === */}
      <div className="max-w-full sm:max-w-[8.5in] mx-auto pt-0 sm:pt-0 pb-[0.25in] sm:pb-[0.5in] px-2 sm:px-[0.5in] bg-white font-[Arial,sans-serif] text-[7pt] leading-[1.2]">
        <header className="flex justify-between items-start mb-0 pb-1 border-b-4 border-black">
          <div className="flex-shrink-0">
            <img
              src="/us-department-of-homeland-security.svg"
              alt="Department of Homeland Security"
              className="h-12 w-12"
            />
          </div>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold">Supplement B,</h1>
            <h2 className="text-base font-bold">
              Reverification and Rehire (formerly Section 3)
            </h2>
            <p className="text-sm mt-1 font-bold">
              Department of Homeland Security
            </p>
            <p className="text-sm">U.S. Citizenship and Immigration Services</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-bold text-sm">USCIS</div>
            <div className="font-bold text-sm">Form I-9</div>
            <div className="font-bold text-sm">Supplement B</div>
            <div className="text-xs">OMB No. 1615-0047</div>
            <div className="text-xs">Expires 05/31/2027</div>
          </div>
        </header>
        <div className="border border-black p-[5px] mb-1">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-black p-[2px]">
                  <div className="text-[7pt]">
                    Last Name (Family Name) from Section 1.
                  </div>
                  <input
                    type="text"
                    name="suppBLastName"
                    value={formData.suppBLastName || ""}
                    onChange={handleChange}
                    className="w-full border-0 p-0 focus:outline-none"
                  />
                </td>
                <td className="border border-black p-[2px]">
                  <div className="text-[7pt]">
                    First Name (Given Name) from Section 1.
                  </div>
                  <input
                    type="text"
                    name="suppBFirstName"
                    value={formData.suppBFirstName || ""}
                    onChange={handleChange}
                    className="w-full border-0 p-0 focus:outline-none"
                  />
                </td>
                <td className="border border-black p-[2px]">
                  <div className="text-[7pt]">
                    Middle Initial (if any) from Section 1.
                  </div>
                  <input
                    type="text"
                    name="suppBMiddleInitial"
                    value={formData.suppBMiddleInitial || ""}
                    onChange={handleChange}
                    className="w-full border-0 p-0 focus:outline-none"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-[7pt] mb-2 leading-[1.3]">
          <strong>
            Instructions: This supplement replaces Section 3 on the previous
            version of Form I-9. Only use this page if your employee requires
            reverification, is rehired within three years of the date the
            original Form I-9 was completed, or provides proof of a legal name
            change. Enter the employee's name in the fields above. Use a new
            section for each reverification or rehire. Review the Form I-9
            instructions before completing this page. Keep this page as part of
            the employee's Form I-9 record. Additional guidance can be found in
            the{" "}
            <a
              href="https://www.uscis.gov/i-9-central/form-i-9-resources/handbook-for-employers-m-274"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Handbook for Employers: Guidance for Completing Form I-9 (M-274)
            </a>
          </strong>
          .
        </div>
        {[1, 2, 3].map((num) => (
          <div key={num} className="mb-2">
            <table className="w-full border-collapse border border-black">
              <tbody>
                <tr>
                  <td className="border border-black p-[2px] bg-gray-300">
                    <div className="text-[7pt]">
                      Date of Rehire (if applicable)
                    </div>
                  </td>
                  <td
                    className="border border-black p-[2px] bg-gray-300"
                    colSpan="3"
                  >
                    <div className="text-[7pt]">New Name (if applicable)</div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt]">Date (mm/dd/yyyy)</div>
                    <input
                      type="text"
                      name={`rev${num}Date`}
                      value={formData[`rev${num}Date`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt]">Last Name (Family Name)</div>
                    <input
                      type="text"
                      name={`rev${num}LastName`}
                      value={formData[`rev${num}LastName`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt]">First Name (Given Name)</div>
                    <input
                      type="text"
                      name={`rev${num}FirstName`}
                      value={formData[`rev${num}FirstName`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt]">Middle Initial</div>
                    <input
                      type="text"
                      name={`rev${num}MiddleInitial`}
                      value={formData[`rev${num}MiddleInitial`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                </tr>
                <tr>
                  <td
                    className="border border-black p-[2px] bg-gray-300"
                    colSpan="4"
                  >
                    <div className="font-bold text-[7pt] mb-1">
                      Reverification: If the employee requires reverification,
                      your employee can choose to present any acceptable List A
                      or List C documentation to show continued employment
                      authorization. Enter the document information in the
                      spaces below.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    className="border border-black p-[2px] bg-gray-100"
                    colSpan="4"
                  >
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr>
                          <td
                            className="p-[2px] border-r border-black"
                            style={{ width: "33%" }}
                          >
                            <div className="text-[7pt]">Document Title</div>
                            <input
                              type="text"
                              name={`rev${num}DocTitle`}
                              value={formData[`rev${num}DocTitle`] || ""}
                              onChange={handleChange}
                              className="w-full border-0 p-0 focus:outline-none bg-transparent"
                            />
                          </td>
                          <td
                            className="p-[2px] border-r border-black"
                            style={{ width: "33%" }}
                          >
                            <div className="text-[7pt]">
                              Document Number (if any)
                            </div>
                            <input
                              type="text"
                              name={`rev${num}DocNumber`}
                              value={formData[`rev${num}DocNumber`] || ""}
                              onChange={handleChange}
                              className="w-full border-0 p-0 focus:outline-none bg-transparent"
                            />
                          </td>
                          <td className="p-[2px]" style={{ width: "34%" }}>
                            <div className="text-[7pt]">
                              Expiration Date (if any) (mm/dd/yyyy)
                            </div>
                            <input
                              type="text"
                              name={`rev${num}ExpDate`}
                              value={formData[`rev${num}ExpDate`] || ""}
                              onChange={handleChange}
                              className="w-full border-0 p-0 focus:outline-none bg-transparent"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td
                    className="border border-black p-[2px] bg-gray-300"
                    colSpan="4"
                  >
                    <div className="font-bold text-[7pt] mb-1">
                      I attest, under penalty of perjury, that to the best of my
                      knowledge, this employee is authorized to work in the
                      United States, and if the employee presented
                      documentation, the documentation I examined appears to be
                      genuine and to relate to the individual who presented it.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt]">
                      Name of Employer or Authorized Representative
                    </div>
                    <input
                      type="text"
                      name={`rev${num}EmployerName`}
                      value={formData[`rev${num}EmployerName`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt]">
                      Signature of Employer or Authorized Representative
                    </div>
                    <input
                      type="text"
                      name={`rev${num}EmployerSignature`}
                      value={formData[`rev${num}EmployerSignature`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                      style={{ fontFamily: "Brush Script MT, cursive" }}
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt]">Today's Date (mm/dd/yyyy)</div>
                    <input
                      type="text"
                      name={`rev${num}EmployerDate`}
                      value={formData[`rev${num}EmployerDate`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]" colSpan="4">
                    <div className="flex gap-2">
                      <div style={{ width: "95%" }}>
                        <div className="text-[7pt] mb-1">
                          Additional Information (Initial and date each
                          notation.)
                        </div>
                        <textarea
                          name={`rev${num}AdditionalInfo`}
                          value={formData[`rev${num}AdditionalInfo`] || ""}
                          onChange={handleChange}
                          className="w-full border-0 p-0 focus:outline-none"
                          rows="3"
                        ></textarea>
                      </div>
                      <div
                        className="flex items-start"
                        style={{ width: "35%" }}
                      >
                        <input
                          type="checkbox"
                          name={`rev${num}AltProcedure`}
                          checked={formData[`rev${num}AltProcedure`] || false}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              [`rev${num}AltProcedure`]: e.target.checked,
                            }))
                          }
                          className="mr-1 w-3 h-3 mt-0.5 flex-shrink-0"
                        />
                        <span className="text-[7pt] leading-tight">
                          Check here if you used an alternative procedure
                          authorized by DHS to examine documents.
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
        <footer className="flex justify-between items-center mt-2 text-[7pt] border-t border-black pt-1">
          <div>Form I-9 Edition 01/20/25</div>
          <div>Page 4 of 4</div>
        </footer>
      </div>
    </>
  );
}

const I9Form = () => {
  const navigate = useNavigate();
  const [applicationId, setApplicationId] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isNonCitizen, setIsNonCitizen] = useState(false);
  const [hasWorkAuthorization, setHasWorkAuthorization] = useState(false);
  const [workAuthFile, setWorkAuthFile] = useState(null);
  const [workAuthUploading, setWorkAuthUploading] = useState(false);
  const [workAuthSubmission, setWorkAuthSubmission] = useState(null);
  const [formData, setFormData] = useState({});
  const [formStatus, setFormStatus] = useState("draft");
  const [hrFeedback, setHrFeedback] = useState(null);

  const [employmentType, setEmploymentType] = useState(null);
  const [totalForms, setTotalForms] = useState(20); // default to 20
  const baseURL = import.meta.env.VITE__BASEURL;

  const shouldCountForm = (formKey) => {
    if (employmentType === "W-2 Employee") {
      return formKey !== "w9Form";
    } else if (employmentType === "1099 Contractor") {
      return formKey !== "w4Form";
    }
    return formKey !== "w9Form"; // default to W-2 if not set
  };

  // useCallback to memoize the function and avoid re-creating it on each render.
  const fetchPageData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie ? JSON.parse(userCookie) : null;
      if (!user?._id) {
        toast.error("User session not found. Please log in again.");
        return;
      }

      // Fetch application data
      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      const applicationData = appResponse.data?.data;
      if (applicationData?.application) {
        const appId = applicationData.application._id;
        setApplicationId(appId);
        setEmploymentType(applicationData.application.employmentType);

        // Load I9 form data using dedicated endpoint
        try {
          const i9Response = await axios.get(
            `${baseURL}/onboarding/get-i9-form/${appId}`,
            { withCredentials: true }
          );

          if (i9Response.data?.i9Form) {
            const i9FormData = i9Response.data.i9Form;
            const loadedFormData = {};

            if (i9FormData.section1) {
              Object.assign(loadedFormData, {
                lastName: i9FormData.section1.lastName || "",
                firstName: i9FormData.section1.firstName || "",
                middleInitial: i9FormData.section1.middleInitial || "",
                otherLastNames: i9FormData.section1.otherLastNames || "",
                address: i9FormData.section1.address || "",
                aptNumber: i9FormData.section1.aptNumber || "",
                city: i9FormData.section1.cityOrTown || "",
                state: i9FormData.section1.state || "",
                zipCode: i9FormData.section1.zipCode || "",
                dateOfBirth: i9FormData.section1.dateOfBirth || "",
                socialSecurityNumber:
                  i9FormData.section1.socialSecurityNumber || "",
                email: i9FormData.section1.employeeEmail || "",
                telephone: i9FormData.section1.employeePhone || "",
                citizenshipStatus: i9FormData.section1.citizenshipStatus || "",
                aNumber: i9FormData.section1.uscisNumber || "",
                workAuthExpDate: i9FormData.section1.expirationDate || "",
                uscisANumber: i9FormData.section1.uscisNumber || "",
                i94Number: i9FormData.section1.formI94Number || "",
                passportNumber: i9FormData.section1.foreignPassportNumber || "",
                countryOfIssuance: i9FormData.section1.countryOfIssuance || "",
                employeeSignature: i9FormData.section1.employeeSignature || "",
                employeeSignatureDate:
                  i9FormData.section1.employeeSignatureDate || "",
              });
            }

            if (i9FormData.section2) {
              Object.assign(loadedFormData, {
                listADocTitle1: i9FormData.section2.documentTitle1 || "",
                listAIssuingAuth1: i9FormData.section2.issuingAuthority1 || "",
                listADocNumber1: i9FormData.section2.documentNumber1 || "",
                listAExpDate1: i9FormData.section2.expirationDate1 || "",
                listADocTitle3: i9FormData.section2.documentTitle3 || "",
                listAIssuingAuth3: i9FormData.section2.issuingAuthority3 || "",
                listADocNumber3: i9FormData.section2.documentNumber3 || "",
                listAExpDate3: i9FormData.section2.expirationDate3 || "",
                firstDayEmployment:
                  i9FormData.section2.employmentStartDate || "",
                employerName: i9FormData.section2.employerName || "",
                employerSignature: i9FormData.section2.employerSignature || "",
                employerSignatureDate:
                  i9FormData.section2.employerSignatureDate || "",
                employerBusinessName:
                  i9FormData.section2.employerBusinessName || "",
                employerBusinessAddress:
                  i9FormData.section2.employerBusinessAddress || "",
              });
            }

            // Load Supplement A data
            if (i9FormData.supplementA) {
              Object.assign(loadedFormData, {
                suppALastName:
                  i9FormData.supplementA.employeeName?.lastName || "",
                suppAFirstName:
                  i9FormData.supplementA.employeeName?.firstName || "",
                suppAMiddleInitial:
                  i9FormData.supplementA.employeeName?.middleInitial || "",
              });

              // Load preparer data (up to 4 preparers)
              if (
                i9FormData.supplementA.preparers &&
                i9FormData.supplementA.preparers.length > 0
              ) {
                i9FormData.supplementA.preparers.forEach((preparer, index) => {
                  const num = index + 1;
                  if (num <= 4) {
                    Object.assign(loadedFormData, {
                      [`prep${num}Signature`]: preparer.signature || "",
                      [`prep${num}Date`]: preparer.date || "",
                      [`prep${num}LastName`]: preparer.lastName || "",
                      [`prep${num}FirstName`]: preparer.firstName || "",
                      [`prep${num}MiddleInitial`]: preparer.middleInitial || "",
                      [`prep${num}Address`]: preparer.address || "",
                      [`prep${num}City`]: preparer.city || "",
                      [`prep${num}State`]: preparer.state || "",
                      [`prep${num}ZipCode`]: preparer.zipCode || "",
                    });
                  }
                });
              }
            }

            // Load Supplement B data
            if (i9FormData.supplementB) {
              Object.assign(loadedFormData, {
                suppBLastName:
                  i9FormData.supplementB.employeeName?.lastName || "",
                suppBFirstName:
                  i9FormData.supplementB.employeeName?.firstName || "",
                suppBMiddleInitial:
                  i9FormData.supplementB.employeeName?.middleInitial || "",
              });

              // Load reverification data (up to 3 reverifications)
              if (
                i9FormData.supplementB.reverifications &&
                i9FormData.supplementB.reverifications.length > 0
              ) {
                i9FormData.supplementB.reverifications.forEach((rev, index) => {
                  const num = index + 1;
                  if (num <= 3) {
                    Object.assign(loadedFormData, {
                      [`rev${num}Date`]: rev.dateOfRehire || "",
                      [`rev${num}LastName`]: rev.newName?.lastName || "",
                      [`rev${num}FirstName`]: rev.newName?.firstName || "",
                      [`rev${num}MiddleInitial`]:
                        rev.newName?.middleInitial || "",
                      [`rev${num}DocTitle`]: rev.documentTitle || "",
                      [`rev${num}DocNumber`]: rev.documentNumber || "",
                      [`rev${num}ExpDate`]: rev.expirationDate || "",
                      [`rev${num}EmployerName`]: rev.employerName || "",
                      [`rev${num}EmployerSignature`]:
                        rev.employerSignature || "",
                      [`rev${num}EmployerDate`]: rev.employerDate || "",
                      [`rev${num}AdditionalInfo`]: rev.additionalInfo || "",
                      [`rev${num}AltProcedure`]: rev.altProcedureUsed || false,
                    });
                  }
                });
              }
            }

            setFormData(loadedFormData);
            setFormStatus(i9FormData.status || "draft");
            setHrFeedback(i9FormData.hrFeedback || null);

            // Load work authorization data
            if (i9FormData.workAuthorization) {
              setIsNonCitizen(
                i9FormData.workAuthorization.isNonCitizen || false
              );
              setHasWorkAuthorization(
                i9FormData.workAuthorization.hasWorkAuthorization || false
              );
              if (i9FormData.workAuthorization.workAuthorizationDocument) {
                setWorkAuthSubmission(
                  i9FormData.workAuthorization.workAuthorizationDocument
                );
              }
            }
          }
        } catch (i9Error) {
          // Form doesn't exist yet, that's okay
          console.log("No I9 form found yet");
        }

        // Calculate overall progress dynamically
        const { forms } = applicationData;
        const filteredKeys = FORM_KEYS.filter(shouldCountForm);
        setTotalForms(filteredKeys.length);
        const completedCount = filteredKeys.filter((key) => {
          let form = forms[key];
          if (key === "jobDescriptionPCA") {
            form =
              forms.jobDescriptionPCA ||
              forms.jobDescriptionCNA ||
              forms.jobDescriptionLPN ||
              forms.jobDescriptionRN;
          }
          return (
            ["submitted", "completed", "under_review", "approved"].includes(
              form?.status
            ) ||
            (key === "employmentType" &&
              applicationData.application.employmentType)
          );
        }).length;

        // Avoid division by zero and use dynamic length
        const progress =
          filteredKeys.length > 0
            ? Math.round((completedCount / filteredKeys.length) * 100)
            : 0;
        setOverallProgress(progress);
      }
    } catch (error) {
      console.error("Error fetching page data:", error);
      toast.error(error.response?.data?.message || "Failed to load page data.");
    } finally {
      setIsLoading(false);
    }
  }, [baseURL]); // Dependency array for useCallback

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]); // Effect runs when fetchPageData is initialized

  useEffect(() => {
    const handleFormStatusUpdate = () => {
      fetchPageData();
    };
    window.addEventListener("formStatusUpdated", handleFormStatusUpdate);
    return () => {
      window.removeEventListener("formStatusUpdated", handleFormStatusUpdate);
    };
  }, [fetchPageData]);

  const handleWorkAuthFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setWorkAuthFile(selectedFile);
    } else {
      toast.error("Please select a PDF file");
    }
  };

  const handleWorkAuthUpload = async () => {
    if (!workAuthFile) return toast.error("Please select a file first.");
    if (!applicationId)
      return toast.error("Application ID not found. Cannot upload.");

    setWorkAuthUploading(true);
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie ? JSON.parse(userCookie) : null;
      if (!user?._id) throw new Error("User not found");

      const formData = new FormData();
      formData.append("file", workAuthFile);
      formData.append("applicationId", applicationId);
      formData.append("employeeId", user._id);

      const response = await axios.post(
        `${baseURL}/onboarding/employee-upload-work-authorization`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      toast.success("Work authorization document uploaded successfully!");
      setWorkAuthFile(null);
      setWorkAuthSubmission(
        response.data.i9Form.workAuthorization.workAuthorizationDocument
      );
      window.dispatchEvent(new Event("formStatusUpdated"));
      fetchPageData();
    } catch (error) {
      console.error("Error uploading work authorization:", error);
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setWorkAuthUploading(false);
    }
  };

  const handleRemoveWorkAuthUpload = async () => {
    if (!window.confirm("Are you sure you want to remove this document?")) {
      return;
    }

    try {
      const userCookie = Cookies.get("user");
      const user = userCookie ? JSON.parse(userCookie) : null;

      if (!user?._id) {
        toast.error("User not found");
        return;
      }

      if (!applicationId) {
        toast.error("Application not found");
        return;
      }

      const response = await axios.post(
        `${baseURL}/onboarding/remove-work-authorization`,
        { applicationId, employeeId: user._id },
        { withCredentials: true }
      );

      if (response.data) {
        toast.success("Work authorization document removed successfully");
        setWorkAuthSubmission(null);
        setWorkAuthFile(null);
        window.dispatchEvent(new Event("formStatusUpdated"));
        fetchPageData();
      }
    } catch (error) {
      console.error("Error removing work authorization:", error);
      toast.error(error.response?.data?.message || "Failed to remove document");
    }
  };

  const completedFormsCount = Math.round((overallProgress / 100) * totalForms);

  return (
    <Layout>
      <Navbar />
      <Toaster position="top-right" />
      <div className="max-w-full sm:max-w-5xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-2 sm:pt-6 pb-2 sm:pb-8">
        <button
          onClick={() => navigate("/employee/task-management")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* HR Feedback Section */}
        <HRFeedback hrFeedback={hrFeedback} formStatus={formStatus} />

        <div className="bg-white rounded-none sm:rounded-xl shadow-none sm:shadow-lg border-none sm:border sm:border-gray-200 p-2 sm:p-4 md:p-6 lg:p-8">
          {/* Status Banner */}
          {!isLoading && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                (formData && Object.keys(formData).length > 0) ||
                formStatus === "under_review" ||
                formStatus === "approved"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {(formData && Object.keys(formData).length > 0) ||
                formStatus === "approved" ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : formStatus === "under_review" ? (
                  <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                ) : (
                  <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  {formData && Object.keys(formData).length > 0 ? (
                    <>
                      <p className="text-base font-semibold text-green-800">
                        ✅ Progress Updated - Form Completed Successfully
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        You cannot make any changes to the form until HR
                        provides their feedback.
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
              I-9 Form
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Employment Eligibility Verification - Department of Homeland
              Security
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-lg text-gray-600">Loading...</div>
            </div>
          ) : (
            <div className="p-4 bg-white font-sans">
              <div className="space-y-6">
                {/* I-9 Form Content */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Step 1: Fill I-9 Form
                  </h2>
                  <div className="space-y-4">
                    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden p-4">
                      <FormI9
                        initialFormData={formData}
                        onFormDataChange={setFormData}
                      />
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        💡 <strong>Tip:</strong> Fill the interactive form above
                        by entering information in the fields. When complete,
                        you can proceed to the next step.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Work Authorization Section */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Step 2: Work Authorization (for Non-Citizens)
                  </h2>

                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isNonCitizen}
                        onChange={(e) => {
                          setIsNonCitizen(e.target.checked);
                          // Reset work auth status if unchecking
                          if (!e.target.checked) {
                            setHasWorkAuthorization(false);
                            setWorkAuthSubmission(null);
                          }
                        }}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-gray-700 font-medium">
                        I am a non-citizen and need to provide work
                        authorization documents
                      </span>
                    </label>
                  </div>

                  {isNonCitizen && (
                    <>
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasWorkAuthorization}
                            onChange={(e) =>
                              setHasWorkAuthorization(e.target.checked)
                            }
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-gray-700 font-medium">
                            I have valid work authorization
                          </span>
                        </label>
                      </div>

                      {hasWorkAuthorization && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Upload Work Authorization Document
                          </h3>

                          {workAuthSubmission ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-green-700 mb-2">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">
                                  Work authorization document uploaded
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Uploaded on:{" "}
                                {new Date(
                                  workAuthSubmission.uploadedAt
                                ).toLocaleDateString()}
                              </p>
                              <div className="mt-4 pt-4 border-t border-green-200">
                                <button
                                  onClick={handleRemoveWorkAuthUpload}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove Document
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-center mb-4">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={handleWorkAuthFileChange}
                                  className="hidden"
                                  id="work-auth-upload"
                                />
                                <label
                                  htmlFor="work-auth-upload"
                                  className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-[#1F3A93] text-white rounded-lg hover:bg-[#16307E] transition-colors"
                                >
                                  <FileText className="w-5 h-5" />
                                  Select Work Authorization Document
                                </label>
                                {workAuthFile && (
                                  <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">
                                      {workAuthFile.name}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={handleWorkAuthUpload}
                                disabled={!workAuthFile || workAuthUploading}
                                className="w-full py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                              >
                                {workAuthUploading
                                  ? "Uploading..."
                                  : "Upload Work Authorization"}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress Section */}
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
                  {completedFormsCount}/{totalForms}
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

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate("/employee/emergency-contact")}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base font-medium"
            >
              Previous
            </button>
            <div className="flex-1 flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/employee/task-management")}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
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
                  onClick={async () => {
                    try {
                      const userCookie = Cookies.get("user");
                      const user = userCookie ? JSON.parse(userCookie) : null;
                      if (user?._id) {
                        const appResponse = await axios.get(
                          `${baseURL}/onboarding/get-application/${user._id}`,
                          { withCredentials: true }
                        );
                        const applicationId =
                          appResponse.data?.data?.application?._id;
                        if (applicationId) {
                          await axios.post(
                            `${baseURL}/onboarding/save-i9-form`,
                            {
                              applicationId,
                              employeeId: user._id,
                              formData: {
                                ...formData,
                                workAuthorization: {
                                  isNonCitizen,
                                  hasWorkAuthorization,
                                },
                              },
                              status: "submitted",
                            },
                            { withCredentials: true }
                          );
                          toast.success("I-9 Form saved successfully!");
                        }
                      }
                    } catch (error) {
                      console.error("Error saving status:", error);
                      toast.error("Failed to save I-9 Form");
                      return;
                    }
                    window.dispatchEvent(new Event("formStatusUpdated"));
                    setTimeout(() => {
                      navigate("/employee/employment-type");
                    }, 1500);
                  }}
                  className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 text-white rounded-lg transition-all duration-200 shadow-md text-sm sm:text-base font-medium ${
                    isSubmitted
                      ? "bg-gray-400 cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] hover:from-[#16306e] hover:to-[#1F3A93]"
                  }`}
                  disabled={isSubmitted}
                  title={isSubmitted ? "Waiting for HR feedback" : ""}
                >
                  {isSubmitted ? "Awaiting HR Feedback" : "Save & Next"}
                </button>
              );
            })()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default I9Form;
