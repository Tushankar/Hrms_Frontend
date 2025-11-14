import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Download,
  FileText,
  CheckCircle,
  Eye,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";
import axios from "axios";
import Cookies from "js-cookie";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function FormI9({ initialFormData = {}, readOnly = false }) {
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleChange = (e) => {
    if (readOnly) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSSNInput = (e, index) => {
    if (readOnly) return;
    const value = e.target.value;
    if (value && index < 8) {
      const nextInput = e.target.parentElement.children[index + 1];
      if (nextInput) nextInput.focus();
    }
    // Update SSN in formData
    const currentSSN = formData.socialSecurityNumber || "";
    const newSSN = currentSSN.split("");
    newSSN[index] = value;
    setFormData((prev) => ({ ...prev, socialSecurityNumber: newSSN.join("") }));
  };

  const handleSSNKeyDown = (e, index) => {
    if (readOnly) return;
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      const prevInput = e.target.parentElement.children[index - 1];
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <>
      <div
        className={`max-w-[8.5in] mx-auto py-[0.5in] px-[0.5in] bg-white font-[Arial,sans-serif] text-[10pt] leading-[1.2] i9-page`}
      >
        {/* === HEADER === */}
        <header className="flex justify-between items-start mb-1 pb-1 border-b-4 border-black">
          <div className="flex-shrink-0">
            <img
              src="/us-department-of-homeland-security.svg"
              alt="Department of Homeland Security"
              className="h-8 w-8"
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
                      disabled={readOnly}
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
                      disabled={readOnly}
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
                      disabled={readOnly}
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
                      disabled={readOnly}
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
                      disabled={readOnly}
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt] whitespace-nowrap">
                      Apt. Number (if any)
                    </div>
                    <input
                      type="text"
                      name="aptNumber"
                      value={formData.aptNumber || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                      disabled={readOnly}
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt] whitespace-nowrap">
                      City or Town
                    </div>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                      disabled={readOnly}
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt] whitespace-nowrap">State</div>
                    <select
                      name="state"
                      value={formData.state || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt]"
                      disabled={readOnly}
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
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt] whitespace-nowrap">ZIP Code</div>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                      disabled={readOnly}
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
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                      disabled={readOnly}
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
                          onInput={(e) => handleSSNInput(e, i)}
                          onKeyDown={(e) => handleSSNKeyDown(e, i)}
                          className="w-4 h-4 border-r border-black text-center focus:outline-none"
                          style={{
                            borderLeft: i === 0 ? "1px solid black" : "none",
                            borderTop: "1px solid black",
                            borderBottom: "1px solid black",
                          }}
                          disabled={readOnly}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt] whitespace-nowrap">
                      Employee's Email Address
                    </div>
                    <input
                      type="text"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                      disabled={readOnly}
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
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                      disabled={readOnly}
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
                          if (readOnly) return;
                          const newValue = e.target.checked ? "citizen" : "";
                          setFormData((prev) => ({
                            ...prev,
                            citizenshipStatus: newValue,
                          }));
                        }}
                        disabled={readOnly}
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
                          if (readOnly) return;
                          const newValue = e.target.checked ? "national" : "";
                          setFormData((prev) => ({
                            ...prev,
                            citizenshipStatus: newValue,
                          }));
                        }}
                        disabled={readOnly}
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
                          if (readOnly) return;
                          const newValue = e.target.checked ? "alien" : "";
                          setFormData((prev) => ({
                            ...prev,
                            citizenshipStatus: newValue,
                          }));
                        }}
                        disabled={readOnly}
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
                        disabled={readOnly}
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
                          if (readOnly) return;
                          const newValue = e.target.checked ? "authorized" : "";
                          setFormData((prev) => ({
                            ...prev,
                            citizenshipStatus: newValue,
                          }));
                        }}
                        disabled={readOnly}
                      />
                      <div className="flex-1">
                        <div>
                          4. An alien authorized to work until{" "}
                          <input
                            type="text"
                            name="workAuthExpDate"
                            value={formData.workAuthExpDate || ""}
                            onChange={handleChange}
                            placeholder="(exp. date, if any)"
                            className="w-40 border-0 border-b border-black px-1 ml-2 focus:outline-none"
                            disabled={readOnly}
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
                          disabled={readOnly}
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
                          disabled={readOnly}
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
                          disabled={readOnly}
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
                      disabled={readOnly}
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
                      disabled={readOnly}
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
                          disabled={readOnly}
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
                      disabled={readOnly}
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
                      disabled={readOnly}
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
                          disabled={readOnly}
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
                      disabled={readOnly}
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <input
                      type="text"
                      name="listCIssuingAuth1"
                      value={formData.listCIssuingAuth1 || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                      disabled={readOnly}
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
                          disabled={readOnly}
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
                      disabled={readOnly}
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <input
                      type="text"
                      name="listCDocNumber1"
                      value={formData.listCDocNumber1 || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                      disabled={readOnly}
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
                          disabled={readOnly}
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
                      disabled={readOnly}
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <input
                      type="text"
                      name="listCExpDate1"
                      value={formData.listCExpDate1 || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt] bg-transparent"
                      disabled={readOnly}
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
                          disabled={readOnly}
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
                      disabled={readOnly}
                    ></textarea>
                    <div className="flex items-center mr-1 ml-1">
                      <input
                        type="checkbox"
                        className="mr-1 w-3 h-3"
                        disabled={readOnly}
                      />
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
                          disabled={readOnly}
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
                          disabled={readOnly}
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
                          disabled={readOnly}
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
                          disabled={readOnly}
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
                          disabled={readOnly}
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
                          disabled={readOnly}
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
                          disabled={readOnly}
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
                      disabled={readOnly}
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
                      disabled={readOnly}
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
                      disabled={readOnly}
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
      <div
        className={`max-w-[8.5in] mx-auto py-[0.5in] px-[0.5in] bg-white i9-page`}
      >
        <img
          src="/i9_page2.png"
          alt="I-9 Form Page 2"
          className="w-full h-auto"
        />
      </div>
      {/* === PAGE 3 === */}
      <div
        className={`max-w-[8.5in] mx-auto py-[0.5in] px-[0.5in] bg-white font-[Arial,sans-serif] text-[7pt] leading-[1.2] i9-page`}
      >
        <header className="flex justify-between items-start mb-0 pb-1 border-b-4 border-black">
          <div className="flex-shrink-0">
            <img
              src="/us-department-of-homeland-security.svg"
              alt="Department of Homeland Security"
              className="h-8 w-8"
            />
          </div>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold">Supplement A,</h1>
            <h2 className="text-base font-bold">
              Preparer and/or Translator Certification for Section 1
            </h2>
            <p className="text-sm mt-1">Department of Homeland Security</p>
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
                    disabled={readOnly}
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
                    disabled={readOnly}
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
                    disabled={readOnly}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-[7pt] mb-2 leading-[1.3]">
          <strong>Instructions:</strong> This supplement must be completed by
          any preparer and/or translator who assists an employee in completing
          Section 1 of Form I-9. The preparer and/or translator must enter the
          employee's name in the spaces provided above. Each preparer or
          translator must complete, sign, and date a separate certification
          area. Employers must retain completed supplement sheets with the
          employee's completed Form I-9.
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
                      disabled={readOnly}
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
                      disabled={readOnly}
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
                      disabled={readOnly}
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
                      disabled={readOnly}
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
                      disabled={readOnly}
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
                      disabled={readOnly}
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
                      disabled={readOnly}
                    />
                  </td>
                  <td className="border border-black p-[2px]">
                    <div className="text-[7pt]">State</div>
                    <select
                      name={`prep${num}State`}
                      value={formData[`prep${num}State`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none text-[7pt]"
                      disabled={readOnly}
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
                  <td className="border border-black p-[2px]" colSpan="2">
                    <div className="text-[7pt]">ZIP Code</div>
                    <input
                      type="text"
                      name={`prep${num}ZipCode`}
                      value={formData[`prep${num}ZipCode`] || ""}
                      onChange={handleChange}
                      className="w-full border-0 p-0 focus:outline-none"
                      disabled={readOnly}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
        <footer className="flex justify-between items-center mt-40 text-[7pt] border-t border-black pt-1">
          <div>Form I-9 Edition 01/20/25</div>
          <div>Page 3 of 4</div>
        </footer>
      </div>
      {/* === PAGE 4 === */}
      <div
        className={`max-w-[8.5in] mx-auto py-[0.5in] px-[0.5in] bg-white font-[Arial,sans-serif] text-[7pt] leading-[1.2] i9-page`}
      >
        <header className="flex justify-between items-start mb-0 pb-1 border-b-4 border-black">
          <div className="flex-shrink-0">
            <img
              src="/us-department-of-homeland-security.svg"
              alt="Department of Homeland Security"
              className="h-8 w-8"
            />
          </div>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold">Supplement B,</h1>
            <h2 className="text-base font-bold">
              Reverification and Rehire (formerly Section 3)
            </h2>
            <p className="text-sm mt-1">Department of Homeland Security</p>
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
                    disabled={readOnly}
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
                    disabled={readOnly}
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
                    disabled={readOnly}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-[7pt] mb-2 leading-[1.3]">
          <strong>Instructions:</strong> This supplement replaces Section 3 on
          the previous version of Form I-9. Only use this page if your employee
          requires reverification, is rehired within three years of the date the
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
          .
        </div>
        {[1, 2, 3].map((num) => (
          <div key={num} className="mb-2">
            <table className="w-full border-collapse border border-black">
              <tbody>
                <tr>
                  <td className="border border-black p-[2px] bg-gray-100">
                    <div className="text-[7pt]">
                      Date of Rehire (if applicable)
                    </div>
                  </td>
                  <td
                    className="border border-black p-[2px] bg-gray-100"
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
                      disabled={readOnly}
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
                      disabled={readOnly}
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
                      disabled={readOnly}
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
                      disabled={readOnly}
                    />
                  </td>
                </tr>
                <tr>
                  <td
                    className="border border-black p-[2px] bg-gray-100"
                    colSpan="4"
                  >
                    <div className="font-bold text-[7pt] mb-1">
                      Reverification: If the employee requires reverification,
                      your employee can choose to present any acceptable List A
                      or List C documentation to show continued employment
                      authorization. Enter the document information in the
                      spaces below.
                    </div>
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
                              disabled={readOnly}
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
                              disabled={readOnly}
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
                              disabled={readOnly}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-[2px]" colSpan="4">
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
                  <td className="border border-black p-[2px]" colSpan="4">
                    <div className="flex gap-2">
                      <div className="flex-1">
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
                          disabled={readOnly}
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
                          onChange={(e) => {
                            if (readOnly) return;
                            setFormData((prev) => ({
                              ...prev,
                              [`rev${num}AltProcedure`]: e.target.checked,
                            }));
                          }}
                          className="mr-1 w-3 h-3 mt-0.5 flex-shrink-0"
                          disabled={readOnly}
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

const I9FormHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [template, setTemplate] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workAuthSubmission, setWorkAuthSubmission] = useState(null);
  const [isNonCitizen, setIsNonCitizen] = useState(false);
  const [hasWorkAuthorization, setHasWorkAuthorization] = useState(false);
  const [formData, setFormData] = useState({});
  const [downloading, setDownloading] = useState(false);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    fetchTemplate();
    if (employeeId) {
      fetchSubmission();
    }
  }, [employeeId]);

  const fetchTemplate = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-i9-template`,
        { withCredentials: true }
      );
      setTemplate(response.data.template);
    } catch (error) {
      console.error("Error fetching template:", error);
    } finally {
      if (!employeeId) setLoading(false);
    }
  };

  const fetchSubmission = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const i9Data = response.data?.data?.forms?.i9Form;
      setSubmission(i9Data);

      // Load work authorization data
      if (i9Data?.workAuthorization) {
        setIsNonCitizen(i9Data.workAuthorization.isNonCitizen || false);
        setHasWorkAuthorization(
          i9Data.workAuthorization.hasWorkAuthorization || false
        );
        if (i9Data.workAuthorization.workAuthorizationDocument) {
          setWorkAuthSubmission(
            i9Data.workAuthorization.workAuthorizationDocument
          );
        }
      }
      // Populate formData - backend already provides flattened structure
      if (i9Data) {
        setFormData(i9Data || {});
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
      toast.error("Failed to load employee submission");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast.error("Please select a PDF file");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie ? JSON.parse(userCookie) : null;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadedBy", user?._id || "");

      const response = await axios.post(
        `${baseURL}/onboarding/hr-upload-i9-template`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.data) {
        toast.success("Template uploaded successfully!");
        setFile(null);
        fetchTemplate();
      }
    } catch (error) {
      console.error("Error uploading template:", error);
      toast.error("Failed to upload template");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    if (template) {
      window.open(`${baseURL}/${template.filePath}`, "_blank");
    }
  };

  const generateFormHTML = (data) => {
    const pages = [];

    // Page 1 HTML
    const page1HTML = `
      <div style="max-width: 8.5in; margin: 0 auto; padding: 0.5in; background-color: white; font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.2;">
        <!-- HEADER -->
        <header style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5in; padding-bottom: 0.125in; border-bottom: 4px solid black;">
          <div style="flex-shrink: 0;">
            <img src="/us-department-of-homeland-security.svg" alt="Department of Homeland Security" style="height: 32px; width: 32px;" />
          </div>
          <div style="text-align: center; flex: 1;">
            <h1 style="font-size: 20pt; font-weight: bold;">Employment Eligibility Verification</h1>
            <h2 style="font-size: 16pt; font-weight: bold;">Department of Homeland Security</h2>
            <p style="font-size: 12pt;">U.S. Citizenship and Immigration Services</p>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <div style="font-weight: bold; font-size: 12pt;">USCIS</div>
            <div style="font-weight: bold; font-size: 12pt;">Form I-9</div>
            <div style="font-size: 10pt;">OMB No.1615-0047</div>
            <div style="font-size: 10pt;">Expires 05/31/2027</div>
          </div>
        </header>
        <!-- SECTION 1 -->
        <section style="border: 1px solid black; margin-bottom: 0.125in;">
          <header style="background-color: #d1d5db; color: black; padding: 5px; border-bottom: 1px solid black;">
            <h3 style="font-size: 8.5pt; font-weight: bold;">
              Section 1. Employee Information and Attestation: 
              <span style="font-weight: normal;">
                Employees must complete and sign Section 1 of Form I-9 no later than the first day of employment, but not before accepting a job offer.
              </span>
            </h3>
          </header>
          <div style="padding: 5px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 7pt; line-height: 1.1;">
              <tbody>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" colspan="2">
                    <div style="font-size: 7pt;">Last Name (Family Name)</div>
                    <div>${data.lastName || ""}</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;" colspan="2">
                    <div style="font-size: 7pt;">First Name (Given Name)</div>
                    <div>${data.firstName || ""}</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt;">Middle Initial (if any)</div>
                    <div>${data.middleInitial || ""}</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt;">Other Last Names Used (if any)</div>
                    <div>${data.otherLastNames || ""}</div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" colspan="2">
                    <div style="font-size: 7pt;">Address (Street Number and Name)</div>
                    <div>${data.address || ""}</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt;">Apt. Number (if any)</div>
                    <div>${data.aptNumber || ""}</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt;">City or Town</div>
                    <div>${data.city || ""}</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt;">State</div>
                    <div>${data.state || ""}</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt;">ZIP Code</div>
                    <div>${data.zipCode || ""}</div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt;">Date of Birth (mm/dd/yyyy)</div>
                    <div>${data.dateOfBirth || ""}</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;" colspan="2">
                    <div style="font-size: 7pt;">U.S. Social Security Number</div>
                    <div style="display: flex; gap: 0; justify-content: center;">
                      ${[...Array(9)]
                        .map(
                          (_, i) =>
                            `<input type="text" value="${
                              (data.socialSecurityNumber || "")[i] || ""
                            }" style="width: 16px; height: 16px; border-right: 1px solid black; text-align: center; border-left: ${
                              i === 0 ? "1px" : "none"
                            } solid black; border-top: 1px solid black; border-bottom: 1px solid black;" readonly />`
                        )
                        .join("")}
                    </div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;" colspan="2">
                    <div style="font-size: 7pt;">Employee's Email Address</div>
                    <div>${data.email || ""}</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt;">Employee's Telephone Number</div>
                    <div>${data.telephone || ""}</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- Attestation -->
            <table style="width: 100%; border-collapse: collapse; font-size: 7pt; margin-top: 0.0625in;">
              <tbody>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" rowspan="6" style="width: 25%;">
                    <strong style="font-size: 7pt;">
                      I am aware that federal law provides for imprisonment and/or fines for false statements, or the use of false documents, in connection with the completion of this form. I attest, under penalty of perjury, that this information, including my selection of the box attesting to my citizenship or immigration status, is true and correct.
                    </strong>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;" colspan="3">
                    <div style="font-size: 7pt;">
                      Check one of the following boxes to attest to your citizenship or immigration status (See page 2 and 3 of the instructions.):
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" colspan="3">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <input type="checkbox" ${
                        data.citizenshipStatus === "citizen" ? "checked" : ""
                      } disabled />
                      <span>1. A citizen of the United States</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" colspan="3">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <input type="checkbox" ${
                        data.citizenshipStatus === "national" ? "checked" : ""
                      } disabled />
                      <span>2. A noncitizen national of the United States (See Instructions.)</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" colspan="3">
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <input type="checkbox" ${
                        data.citizenshipStatus === "alien" ? "checked" : ""
                      } disabled />
                      <span>3. A lawful permanent resident (Enter USCIS or A-Number.)</span>
                      <input type="text" value="${
                        data.aNumber || ""
                      }" style="flex: 1; border: none; border-bottom: 1px solid black; padding: 2px;" readonly />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" colspan="3">
                    <div style="display: flex; align-items: flex-start; gap: 4px;">
                      <input type="checkbox" ${
                        data.citizenshipStatus === "authorized" ? "checked" : ""
                      } disabled />
                      <div style="flex: 1;">
                        <div>4. An alien authorized to work until <input type="text" value="${
                          data.workAuthExpDate || ""
                        }" placeholder="(exp. date, if any)" style="width: 160px; border: none; border-bottom: 1px solid black; padding: 2px; margin-left: 8px;" readonly /></div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" colspan="3">
                    <div style="font-size: 7pt; text-align: center;">If you check Item Number 4., enter one of these:</div>
                    <div style="display: flex; align-items: flex-start; gap: 4px;">
                      <div style="border: 1px solid black; padding: 2px; width: 20%;">
                        <div style="font-size: 7pt; margin-bottom: 2px;">USCIS A-Number</div>
                        <input type="text" value="${
                          data.uscisANumber || ""
                        }" style="width: 100%; border: none; border-bottom: 1px solid black;" readonly />
                      </div>
                      <div style="display: flex; align-items: center; justify-content: center; font-weight: bold;">OR</div>
                      <div style="border: 1px solid black; padding: 2px; width: 28%;">
                        <div style="font-size: 7pt; margin-bottom: 2px;">Form I-94 Admission Number</div>
                        <input type="text" value="${
                          data.i94Number || ""
                        }" style="width: 100%; border: none; border-bottom: 1px solid black;" readonly />
                      </div>
                      <div style="display: flex; align-items: center; justify-content: center; font-weight: bold;">OR</div>
                      <div style="flex: 1; border: 1px solid black; padding: 2px;">
                        <div style="font-size: 7pt; margin-bottom: 2px;">Foreign Passport Number and Country of Issuance</div>
                        <input type="text" value="${
                          data.passportNumber || ""
                        }" style="width: 100%; border: none; border-bottom: 1px solid black;" readonly />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" colspan="2">
                    <div style="font-size: 7pt;">Signature of Employee</div>
                    <div style="font-family: 'Brush Script MT', cursive;">${
                      data.employeeSignature || ""
                    }</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;" colspan="2">
                    <div style="font-size: 7pt;">Today's Date (mm/dd/yyyy)</div>
                    <div>${data.employeeSignatureDate || ""}</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div style="margin-top: 0.0625in; padding: 2px; background-color: #f9fafb; border: 1px solid black; font-size: 7pt;">
              <strong>
                If a preparer and/or translator assisted you in completing Section 1, that person MUST complete the 
                <a href="https://www.uscis.gov/i-9" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">Preparer and/or Translator Certification</a> on Page 3.
              </strong>
            </div>
          </div>
        </section>
        <!-- SECTION 2 -->
        <section style="border: 1px solid black; margin-top: 0.125in;">
          <header style="background-color: #d1d5db; color: black; padding: 5px; border-bottom: 1px solid black;">
            <h3 style="font-size: 7pt; font-weight: bold; line-height: 1.3;">
              Section 2. Employer or Authorized Representative Review and Verification: 
              <span style="font-weight: normal;">
                Employers or their authorized representative must complete and sign Section 2 within three business days after the employee's first day of employment, and must physically examine, or examine consistent with an alternative procedure authorized by the Secretary of DHS, documentation from List A OR a combination of documentation from List B and List C. Enter any additional documentation in the Additional Information box; see Instructions.
              </span>
            </h3>
          </header>
          <div style="padding: 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 7pt; line-height: 1.3;">
              <tbody>
                <tr>
                  <td style="border: 1px solid black; padding: 2px; text-align: center; font-weight: bold; background-color: #f9fafb;" style="width: 35%;">List A</td>
                  <td style="border: 1px solid black; text-align: center; background-color: #f9fafb;" style="width: 0%;">OR</td>
                  <td style="border: 1px solid black; padding: 2px; text-align: center; font-weight: bold; background-color: #f9fafb;" style="width: 28%;">List B</td>
                  <td style="border: 1px solid black; text-align: center; background-color: #f9fafb;" style="width: 0%;">AND</td>
                  <td style="border: 1px solid black; padding: 2px; text-align: center; font-weight: bold; background-color: #f9fafb;" style="width: 28%;">List C</td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 0;">
                    <div style="display: flex;">
                      <div style="background-color: #f3f4f6; padding: 2px; font-size: 7pt; flex-shrink: 0; width: 50%; font-weight: bold;">Document Title 1</div>
                      <div style="border-left: 1px solid black; flex: 1; padding: 2px;">
                        <div style="font-size: 7pt; background-color: transparent;">${
                          data.listADocTitle1 || ""
                        }</div>
                      </div>
                    </div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px; background-color: #fafafa;" rowspan="4"></td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt; background-color: transparent;">${
                      data.listBDocTitle1 || ""
                    }</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px; background-color: #fafafa;" rowspan="4"></td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt; background-color: transparent;">${
                      data.listCDocTitle1 || ""
                    }</div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 0;">
                    <div style="display: flex;">
                      <div style="background-color: #f3f4f6; padding: 2px; font-size: 7pt; flex-shrink: 0; width: 50%;">Issuing Authority</div>
                      <div style="border-left: 1px solid black; flex: 1; padding: 2px;">
                        <div style="font-size: 7pt; background-color: transparent;">${
                          data.listAIssuingAuth1 || ""
                        }</div>
                      </div>
                    </div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt; background-color: transparent;">${
                      data.listBIssuingAuth1 || ""
                    }</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt; background-color: transparent;">${
                      data.listCIssuingAuth1 || ""
                    }</div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 0;">
                    <div style="display: flex;">
                      <div style="background-color: #f3f4f6; padding: 2px; font-size: 7pt; flex-shrink: 0; width: 50%;">Document Number (if any)</div>
                      <div style="border-left: 1px solid black; flex: 1; padding: 2px;">
                        <div style="font-size: 7pt; background-color: transparent;">${
                          data.listADocNumber1 || ""
                        }</div>
                      </div>
                    </div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt; background-color: transparent;">${
                      data.listBDocNumber1 || ""
                    }</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt; background-color: transparent;">${
                      data.listCDocNumber1 || ""
                    }</div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 0;">
                    <div style="display: flex;">
                      <div style="background-color: #f3f4f6; padding: 2px; font-size: 7pt; flex-shrink: 0; width: 50%;">Expiration Date (if any)</div>
                      <div style="border-left: 1px solid black; flex: 1; padding: 2px;">
                        <div style="font-size: 7pt; background-color: transparent;">${
                          data.listAExpDate1 || ""
                        }</div>
                      </div>
                    </div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt; background-color: transparent;">${
                      data.listBExpDate1 || ""
                    }</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt; background-color: transparent;">${
                      data.listCExpDate1 || ""
                    }</div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 0;">
                    <div style="display: flex;">
                      <div style="background-color: #f3f4f6; padding: 2px; font-size: 7pt; flex-shrink: 0; width: 50%; font-weight: bold;">Document Title 2 (if any)</div>
                      <div style="border-left: 1px solid black; flex: 1; padding: 2px;">
                        <div style="font-size: 7pt; background-color: transparent;"></div>
                      </div>
                    </div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;" colspan="4" rowspan="8">
                    <div style="background-color: #f3f4f6;">
                      <div style="font-weight: bold; font-size: 7pt; margin-right: 2px; margin-left: 2px;">Additional Information</div>
                    </div>
                    <textarea style="width: 100%; border: none; padding: 0; font-size: 7pt; background-color: transparent; margin-top: 2px; margin-right: 2px; margin-left: 2px;" rows="7" readonly></textarea>
                    <div style="display: flex; align-items: center; margin-right: 2px; margin-left: 2px;">
                      <input type="checkbox" style="margin-right: 2px; width: 12px; height: 12px;" disabled />
                      <span style="font-size: 7pt;">Check here if you used an alternative procedure authorized by DHS to examine documents.</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 0;">
                    <div style="display: flex;">
                      <div style="background-color: #f3f4f6; padding: 2px; font-size: 7pt; flex-shrink: 0; width: 50%;">Issuing Authority</div>
                      <div style="border-left: 1px solid black; flex: 1; padding: 2px;">
                        <div style="font-size: 7pt; background-color: transparent;"></div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 0;">
                    <div style="display: flex;">
                      <div style="background-color: #f3f4f6; padding: 2px; font-size: 7pt; flex-shrink: 0; width: 50%;">Document Number (if any)</div>
                      <div style="border-left: 1px solid black; flex: 1; padding: 2px;">
                        <div style="font-size: 7pt; background-color: transparent;"></div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 0;">
                    <div style="display: flex;">
                      <div style="background-color: #f3f4f6; padding: 2px; font-size: 7pt; flex-shrink: 0; width: 50%;">Expiration Date (if any)</div>
                      <div style="border-left: 1px solid black; flex: 1; padding: 2px;">
                        <div style="font-size: 7pt; background-color: transparent;"></div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 0;">
                    <div style="display: flex;">
                      <div style="background-color: #f3f4f6; padding: 2px; font-size: 7pt; flex-shrink: 0; width: 50%; font-weight: bold;">Document Title 3 (if any)</div>
                      <div style="border-left: 1px solid black; flex: 1; padding: 2px;">
                        <div style="font-size: 7pt; background-color: transparent;">${
                          data.listADocTitle3 || ""
                        }</div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 0;">
                    <div style="display: flex;">
                      <div style="background-color: #f3f4f6; padding: 2px; font-size: 7pt; flex-shrink: 0; width: 50%;">Issuing Authority</div>
                      <div style="border-left: 1px solid black; flex: 1; padding: 2px;">
                        <div style="font-size: 7pt; background-color: transparent;">${
                          data.listAIssuingAuth3 || ""
                        }</div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 0;">
                    <div style="display: flex;">
                      <div style="background-color: #f3f4f6; padding: 2px; font-size: 7pt; flex-shrink: 0; width: 50%;">Document Number (if any)</div>
                      <div style="border-left: 1px solid black; flex: 1; padding: 2px;">
                        <div style="font-size: 7pt; background-color: transparent;">${
                          data.listADocNumber3 || ""
                        }</div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 0;">
                    <div style="display: flex;">
                      <div style="background-color: #f3f4f6; padding: 2px; font-size: 7pt; flex-shrink: 0; width: 50%;">Expiration Date (if any)</div>
                      <div style="border-left: 1px solid black; flex: 1; padding: 2px;">
                        <div style="font-size: 7pt; background-color: transparent;">${
                          data.listAExpDate3 || ""
                        }</div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" colspan="4">
                    <div style="font-weight: bold; font-size: 7pt;">
                      Certification: I attest, under penalty of perjury, that (1) I have examined the documentation presented by the above-named employee, (2) the above-listed documentation appears to be genuine and to relate to the employee named, and (3) to the best of my knowledge, the employee is authorized to work in the United States.
                    </div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;" colspan="2">
                    <div style="font-size: 7pt;">First Day of Employment</div>
                    <div style="font-size: 7pt;">(mm/dd/yyyy):</div>
                    <div style="font-size: 7pt; background-color: transparent;">${
                      data.firstDayEmployment || ""
                    }</div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" colspan="4">
                    <div style="font-size: 7pt;">Employer's Business or Organization Name</div>
                    <div style="font-size: 7pt; background-color: transparent;">${
                      data.employerBusinessName || ""
                    }</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;" colspan="4">
                    <div style="font-size: 7pt;">Employer's Business or Organization Address, City or Town, State, ZIP Code</div>
                    <div style="font-size: 7pt; background-color: transparent;">${
                      data.employerBusinessAddress || ""
                    }</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <!-- FOOTER -->
        <footer style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.125in; font-size: 7pt; border-top: 1px solid black; padding-top: 0.0625in;">
          <div>
            For reverification or rehire, complete Supplement B, Reverification and Rehire on Page 4.
          </div>
          <div>Form I-9 Edition 01/20/25</div>
          <div>Page 1 of 4</div>
        </footer>
      </div>
    `;

    pages.push(page1HTML);

    // Page 2 - Image
    const page2HTML = `
      <div style="max-width: 8.5in; margin: 0 auto; padding: 0.5in; background-color: white;">
        <img src="/i9_page2.png" alt="I-9 Form Page 2" style="width: 100%; height: auto;" />
      </div>
    `;

    pages.push(page2HTML);

    // Page 3 - Supplement A
    const page3HTML = `
      <div style="max-width: 8.5in; margin: 0 auto; padding: 0.5in; background-color: white; font-family: Arial, sans-serif; font-size: 7pt; line-height: 1.2;">
        <header style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0; padding-bottom: 0.125in; border-bottom: 4px solid black;">
          <div style="flex-shrink: 0;">
            <img src="/us-department-of-homeland-security.svg" alt="Department of Homeland Security" style="height: 32px; width: 32px;" />
          </div>
          <div style="text-align: center; flex: 1;">
            <h1 style="font-size: 20pt; font-weight: bold;">Supplement A,</h1>
            <h2 style="font-size: 16pt; font-weight: bold;">Preparer and/or Translator Certification for Section 1</h2>
            <p style="font-size: 12pt; margin-top: 2px;">Department of Homeland Security</p>
            <p style="font-size: 12pt;">U.S. Citizenship and Immigration Services</p>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <div style="font-weight: bold; font-size: 12pt;">USCIS</div>
            <div style="font-weight: bold; font-size: 12pt;">Form I-9</div>
            <div style="font-weight: bold; font-size: 12pt;">Supplement A</div>
            <div style="font-size: 10pt;">OMB No. 1615-0047</div>
            <div style="font-size: 10pt;">Expires 05/31/2027</div>
          </div>
        </header>
        <div style="border: 1px solid black; padding: 5px; margin-bottom: 0.125in;">
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr>
                <td style="border: 1px solid black; padding: 2px;">
                  <div style="font-size: 7pt;">Last Name (Family Name) from Section 1.</div>
                  <div>${data.suppALastName || ""}</div>
                </td>
                <td style="border: 1px solid black; padding: 2px;">
                  <div style="font-size: 7pt;">First Name (Given Name) from Section 1.</div>
                  <div>${data.suppAFirstName || ""}</div>
                </td>
                <td style="border: 1px solid black; padding: 2px;">
                  <div style="font-size: 7pt;">Middle Initial (if any) from Section 1.</div>
                  <div>${data.suppAMiddleInitial || ""}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="font-size: 7pt; margin-bottom: 0.125in; line-height: 1.3;">
          <strong>Instructions:</strong> This supplement must be completed by any preparer and/or translator who assists an employee in completing Section 1 of Form I-9. The preparer and/or translator must enter the employee's name in the spaces provided above. Each preparer or translator must complete, sign, and date a separate certification area. Employers must retain completed supplement sheets with the employee's completed Form I-9.
        </div>
        ${[1, 2, 3, 4]
          .map(
            (num) => `
          <div style="margin-bottom: 0.125in;">
            <div style="font-weight: bold; font-size: 7pt; margin-bottom: 2px;">
              I attest, under penalty of perjury, that I have assisted in the completion of Section 1 of this form and that to the best of my knowledge the information is true and correct.
            </div>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
              <tbody>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" colspan="3">
                    <div style="font-size: 7pt;">Signature of Preparer or Translator</div>
                  <div style="font-family: 'Brush Script MT', cursive;">${
                    data["prep" + num + "Signature"] || ""
                  }</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;" colspan="3">
                    <div style="font-size: 7pt;">Date (mm/dd/yyyy)</div>
                    <div>${data["prep" + num + "Date"] || ""}</div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" colspan="2">
                    <div style="font-size: 7pt;">Last Name (Family Name)</div>
                    <div>${data["prep" + num + "LastName"] || ""}</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;" colspan="2">
                    <div style="font-size: 7pt;">First Name (Given Name)</div>
                    <div>${data["prep" + num + "FirstName"] || ""}</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt;">Middle Initial (if any)</div>
                    <div>${data["prep" + num + "MiddleInitial"] || ""}</div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" colspan="2">
                    <div style="font-size: 7pt;">Address (Street Number and Name)</div>
                    <div>${data["prep" + num + "Address"] || ""}</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt;">City or Town</div>
                    <div>${data["prep" + num + "City"] || ""}</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;">
                    <div style="font-size: 7pt;">State</div>
                    <div>${data["prep" + num + "State"] || ""}</div>
                  </td>
                  <td style="border: 1px solid black; padding: 2px;" colspan="2">
                    <div style="font-size: 7pt;">ZIP Code</div>
                    <div>${data["prep" + num + "ZipCode"] || ""}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        `
          )
          .join("")}
        <footer style="display: flex; justify-content: space-between; align-items: center; margin-top: 160px; font-size: 7pt; border-top: 1px solid black; padding-top: 0.0625in;">
          <div>Form I-9 Edition 01/20/25</div>
          <div>Page 3 of 4</div>
        </footer>
      </div>
    `;

    pages.push(page3HTML);

    // Page 4 - Supplement B
    const page4HTML = `
      <div style="max-width: 8.5in; margin: 0 auto; padding: 0.5in; background-color: white; font-family: Arial, sans-serif; font-size: 7pt; line-height: 1.2;">
        <header style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0; padding-bottom: 0.125in; border-bottom: 4px solid black;">
          <div style="flex-shrink: 0;">
            <img src="/us-department-of-homeland-security.svg" alt="Department of Homeland Security" style="height: 32px; width: 32px;" />
          </div>
          <div style="text-align: center; flex: 1;">
            <h1 style="font-size: 20pt; font-weight: bold;">Supplement B,</h1>
            <h2 style="font-size: 16pt; font-weight: bold;">Reverification and Rehire (formerly Section 3)</h2>
            <p style="font-size: 12pt; margin-top: 2px;">Department of Homeland Security</p>
            <p style="font-size: 12pt;">U.S. Citizenship and Immigration Services</p>
          </div>
          <div style="text-align: right; flex-shrink: 0;">
            <div style="font-weight: bold; font-size: 12pt;">USCIS</div>
            <div style="font-weight: bold; font-size: 12pt;">Form I-9</div>
            <div style="font-weight: bold; font-size: 12pt;">Supplement B</div>
            <div style="font-size: 10pt;">OMB No. 1615-0047</div>
            <div style="font-size: 10pt;">Expires 05/31/2027</div>
          </div>
        </header>
        <div style="border: 1px solid black; padding: 5px; margin-bottom: 0.125in;">
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr>
                <td style="border: 1px solid black; padding: 2px;">
                  <div style="font-size: 7pt;">Last Name (Family Name) from Section 1.</div>
                  <div>${data.suppBLastName || ""}</div>
                </td>
                <td style="border: 1px solid black; padding: 2px;">
                  <div style="font-size: 7pt;">First Name (Given Name) from Section 1.</div>
                  <div>${data.suppBFirstName || ""}</div>
                </td>
                <td style="border: 1px solid black; padding: 2px;">
                  <div style="font-size: 7pt;">Middle Initial (if any) from Section 1.</div>
                  <div>${data.suppBMiddleInitial || ""}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="font-size: 7pt; margin-bottom: 0.125in; line-height: 1.3;">
          <strong>Instructions:</strong> This supplement replaces Section 3 on the previous version of Form I-9. Only use this page if your employee requires reverification, is rehired within three years of the date the original Form I-9 was completed, or provides proof of a legal name change. Enter the employee's name in the fields above. Use a new section for each reverification or rehire. Review the Form I-9 instructions before completing this page. Keep this page as part of the employee's Form I-9 record. Additional guidance can be found in the <a href="https://www.uscis.gov/i-9-central/form-i-9-resources/handbook-for-employers-m-274" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">Handbook for Employers: Guidance for Completing Form I-9 (M-274)</a>.
        </div>
        ${[1, 2, 3]
          .map(
            (num) => `
          <div style="margin-bottom: 0.125in;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
              <tbody>
                <tr>
                  <td style="border: 1px solid black; padding: 2px; background-color: #f9fafb;" colspan="4">
                    <div style="font-weight: bold; font-size: 7pt; margin-bottom: 2px;">Reverification: If the employee requires reverification, your employee can choose to present any acceptable List A or List C documentation to show continued employment authorization. Enter the document information in the spaces below.</div>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tbody>
                        <tr>
                          <td style="padding: 2px; border-right: 1px solid black;" style="width: 33%;">
                            <div style="font-size: 7pt;">Document Title</div>
                            <div style="font-size: 7pt; background-color: transparent;">${
                              data["rev" + num + "DocTitle"] || ""
                            }</div>
                          </td>
                          <td style="padding: 2px; border-right: 1px solid black;" style="width: 33%;">
                            <div style="font-size: 7pt;">Document Number (if any)</div>
                            <div style="font-size: 7pt; background-color: transparent;">${
                              data["rev" + num + "DocNumber"] || ""
                            }</div>
                          </td>
                          <td style="padding: 2px;" style="width: 34%;">
                            <div style="font-size: 7pt;">Expiration Date (if any) (mm/dd/yyyy)</div>
                            <div style="font-size: 7pt; background-color: transparent;">${
                              data["rev" + num + "ExpDate"] || ""
                            }</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" colspan="4">
                    <div style="font-weight: bold; font-size: 7pt; margin-bottom: 2px;">
                      I attest, under penalty of perjury, that to the best of my knowledge, this employee is authorized to work in the United States, and if the employee presented documentation, the documentation I examined appears to be genuine and to relate to the individual who presented it.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid black; padding: 2px;" colspan="4">
                    <div style="display: flex; gap: 8px;">
                      <div style="flex: 1;">
                        <div style="font-size: 7pt; margin-bottom: 2px;">Additional Information (Initial and date each notation.)</div>
                        <div style="font-size: 7pt; background-color: transparent;">${
                          data["rev" + num + "AdditionalInfo"] || ""
                        }</div>
                      </div>
                      <div style="display: flex; align-items: flex-start;" style="width: 35%;">
                        <input type="checkbox" ${
                          data["rev" + num + "AltProcedure"] ? "checked" : ""
                        } style="margin-right: 2px; width: 12px; height: 12px; margin-top: 0; flex-shrink: 0;" disabled />
                        <span style="font-size: 7pt; line-height: 1.1;">Check here if you used an alternative procedure authorized by DHS to examine documents.</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        `
          )
          .join("")}
        <footer style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.125in; font-size: 7pt; border-top: 1px solid black; padding-top: 0.0625in;">
          <div>Form I-9 Edition 01/20/25</div>
          <div>Page 4 of 4</div>
        </footer>
      </div>
    `;

    pages.push(page4HTML);

    return pages;
  };

  const handleDownloadFormAsPDF = async () => {
    setDownloading(true);
    try {
      const pdf = new jsPDF("p", "in", [8.5, 11]);
      const formPages = generateFormHTML(formData);

      for (let i = 0; i < formPages.length; i++) {
        // Create a temporary div with the HTML content
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = formPages[i];
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        tempDiv.style.top = "-9999px";
        tempDiv.style.width = "8.5in";
        tempDiv.style.height = "11in";
        tempDiv.style.overflow = "hidden";
        tempDiv.style.fontFamily = "Arial, sans-serif";
        tempDiv.style.fontSize = "10pt";
        tempDiv.style.lineHeight = "1.2";
        tempDiv.style.backgroundColor = "#ffffff";
        tempDiv.style.padding = "0.5in";
        tempDiv.style.boxSizing = "border-box";
        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, {
          scale: 4,
          useCORS: true,
          backgroundColor: "#ffffff",
          allowTaint: true,
          letterRendering: true,
          logging: false,
          width: 816, // 8.5in * 96px
          height: 1056, // 11in * 96px
        });

        document.body.removeChild(tempDiv);

        const imgData = canvas.toDataURL("image/png");
        const pageWidth = 8.5;
        const aspectRatio = canvas.width / canvas.height;
        const finalWidth = pageWidth;
        const finalHeight = pageWidth / aspectRatio;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, finalWidth, finalHeight);
      }

      pdf.save("I9_Form.pdf");
      toast.success("Form downloaded as PDF");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Layout>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to HR Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              I-9 Form Management
            </h1>
            <p className="text-gray-600">
              Review employee I-9 form submissions
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
            </div>
          ) : (
            <>
              {employeeId && !submission && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <p className="text-yellow-800">
                    No I-9 submission found for this employee.
                  </p>
                </div>
              )}
              <div className="space-y-8">
                {employeeId && submission && (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Employee I-9 Form
                    </h2>
                    <div
                      className="w-full bg-white border border-gray-200 rounded-lg p-4 mb-4 overflow-auto"
                      style={{ maxHeight: "none" }}
                    >
                      <FormI9 initialFormData={formData} readOnly={true} />
                    </div>
                    <div className="mb-4 space-y-2">
                      <p className="text-sm text-gray-600">
                        Status:{" "}
                        <span className="capitalize px-2 py-1 rounded bg-green-100 text-green-800">
                          {submission.status || "draft"}
                        </span>
                      </p>
                      {submission.employeeUploadedForm?.filePath && (
                        <button
                          onClick={() =>
                            window.open(
                              `${baseURL}/${submission.employeeUploadedForm.filePath}`,
                              "_blank"
                            )
                          }
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1F3A93] text-white rounded hover:bg-[#16307E] transition-colors text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download Submission
                        </button>
                      )}
                      <button
                        onClick={handleDownloadFormAsPDF}
                        disabled={downloading}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1F3A93] text-white rounded hover:bg-[#16307E] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {downloading
                          ? "Downloading..."
                          : "Download Form as PDF"}
                      </button>
                    </div>
                    <HRNotesInput
                      formType="i9"
                      employeeId={employeeId}
                      existingNote={submission?.hrFeedback?.comment}
                      existingReviewedAt={submission?.hrFeedback?.reviewedAt}
                      onNoteSaved={fetchSubmission}
                      formData={submission}
                      showSignature={false} // hide HR signature area for I-9 HR view
                    />
                  </div>
                )}

                {employeeId && submission?.workAuthorization?.isNonCitizen && (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Work Authorization Documents
                    </h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-700 mb-3">
                          <strong>Non-Citizen Status:</strong>{" "}
                          {isNonCitizen ? "Yes" : "No"}
                        </p>
                        <p className="text-sm text-gray-700 mb-3">
                          <strong>Work Authorization:</strong>{" "}
                          {hasWorkAuthorization ? "Yes" : "No"}
                        </p>

                        {workAuthSubmission && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-gray-700">
                                  Work Authorization Document uploaded
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  window.open(
                                    `${baseURL}/${workAuthSubmission.filePath}`,
                                    "_blank"
                                  )
                                }
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1F3A93] text-white rounded hover:bg-[#16307E] transition-colors text-sm"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                              Uploaded:{" "}
                              {new Date(
                                workAuthSubmission.uploadedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 items-center px-6 md:px-8 pb-6 mt-8">
            <button
              onClick={() => navigate(`/hr/tb-symptom-screen/${employeeId}`)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous: TB Screening
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Exit to Dashboard
            </button>
            <button
              onClick={() => navigate(`/hr/w4-form/${employeeId}`)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Next: W-4 Form
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default I9FormHR;
