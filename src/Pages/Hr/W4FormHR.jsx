import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Download, FileText, Eye } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";
import axios from "axios";
import Cookies from "js-cookie";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const W4FormHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    if (employeeId) {
      fetchSubmission();
    } else {
      setLoading(false);
    }
  }, [employeeId]);

  const fetchSubmission = async () => {
    try {
      console.log("Fetching W4 form for employee:", employeeId);
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("API Response:", response);
      console.log("Response data:", response.data);
      console.log("W4 Form data:", response.data?.data?.forms?.w4Form);

      const w4Data = response.data?.data?.forms?.w4Form;
      setSubmission(w4Data);
      if (w4Data) {
        console.log("Setting form data with:", w4Data);
        // Data from get-application is already flattened by backend, use it directly
        setFormData(w4Data);
      } else {
        console.warn("No W4 form data found for employee");
        setFormData({});
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
      toast.error("Failed to load employee submission: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFormAsPDF = async () => {
    setDownloading(true);
    try {
      const pdf = new jsPDF("p", "in", [8.5, 20]);
      const pages = document.querySelectorAll(".w4-page");

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

      pdf.save("W4_Form.pdf");
      toast.success("Form downloaded as PDF");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
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
              W-4 Form Management
            </h1>
            <p className="text-gray-600">View employee submissions</p>
          </div>

          <div className="space-y-8">
            {employeeId && submission && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Employee W-4 Form Submission
                </h2>
                <div className="mb-6 space-y-2">
                  <p className="text-sm text-gray-600">
                    Status:{" "}
                    <span className="capitalize px-2 py-1 rounded bg-green-100 text-green-800">
                      {submission.status || "draft"}
                    </span>
                  </p>
                </div>

                <div className="max-w-[8.5in] mx-auto py-[0.5in] px-[0.5in] bg-white font-[Arial,sans-serif] text-[10pt] leading-[1.2] w4-page">
                  {/* Header */}
                  <table className="w-full mb-1 border-collapse">
                    <tbody>
                      <tr>
                        <td className="w-1/5 align-top pr-2">
                          <div className="text-[8pt] mb-0.5">Form</div>
                          <div className="text-[32pt] font-bold font-[Arial_Black,sans-serif] leading-[0.9]">
                            W-4
                          </div>
                          <div className="border-t border-black mt-1 pt-0.5">
                            <div className="text-[7pt] leading-[1.1]">
                              Department of the Treasury
                            </div>
                            <div className="text-[7pt] leading-[1.1]">
                              Internal Revenue Service
                            </div>
                          </div>
                        </td>
                        <td className="align-top text-center pt-1">
                          <div className="text-[13pt] font-bold mb-1">
                            Employee's Withholding Certificate
                          </div>
                          <div className="text-[7.5pt] leading-[1.3]">
                            <div>
                              <span className="font-bold">
                                Complete Form W-4 so that your employer can
                                withhold the correct federal income tax from
                                your pay.
                              </span>
                            </div>
                            <div>
                              <span className="font-bold">
                                Give Form W-4 to your employer.
                              </span>
                            </div>
                            <div>
                              <span className="font-bold">
                                Your withholding is subject to review by the
                                IRS.
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="w-[15%] align-top text-right pl-2">
                          <div className="text-[7pt] mb-1">
                            OMB No. 1545-0074
                          </div>
                          <div className="border-2 border-black py-0.5 px-2 text-[18pt] font-bold inline-block">
                            <span className="text-white [-webkit-text-stroke:1.5px_black]">
                              20
                            </span>
                            <span>25</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Step 1 */}
                  <table className="w-full border-2 border-black border-collapse mt-0">
                    <tbody>
                      <tr>
                        <td className="w-[12%] border-r-2 border-black p-1 align-top font-bold text-[8.5pt] leading-[1.2]">
                          <div>Step 1:</div>
                          <div>Enter</div>
                          <div>Personal</div>
                          <div>Information</div>
                        </td>
                        <td className="p-0">
                          <table className="w-full border-collapse">
                            <tbody>
                              <tr>
                                <td
                                  colSpan="2"
                                  className="py-1 px-1.5 pt-1 pb-0 border-r border-black"
                                >
                                  <table className="w-full border-collapse">
                                    <tbody>
                                      <tr>
                                        <td className="w-1/2 p-0 pr-1.5 border-r border-black">
                                          <div className="text-[7pt] mb-px">
                                            (a) First name and middle initial
                                          </div>
                                          <input
                                            name="firstName"
                                            value={formData.firstName}
                                            type="text"
                                            disabled
                                            className="w-full border-none border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                                          />
                                        </td>
                                        <td className="p-0 pl-1.5">
                                          <div className="text-[7pt] mb-px">
                                            Last name
                                          </div>
                                          <input
                                            name="lastName"
                                            value={formData.lastName}
                                            type="text"
                                            disabled
                                            className="w-full border-none border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                                          />
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                                <td
                                  rowSpan="2"
                                  className="w-[28%] p-1 px-1.5 align-top"
                                >
                                  <div className="text-[7pt] mb-px font-bold">
                                    (b) Social security number
                                  </div>
                                  <input
                                    name="ssn"
                                    value={formData.ssn}
                                    type="text"
                                    disabled
                                    className="w-full border-none border-b border-black outline-none text-[8pt] py-0.5 mb-1.5 bg-transparent"
                                  />
                                  <div className="text-[6.5pt] leading-[1.3]">
                                    <span className="font-bold">
                                      Does your name match the name on your
                                      social security card?
                                    </span>{" "}
                                    If not, to ensure you get credit for your
                                    earnings, contact SSA at 800-772-1213 or go
                                    to{" "}
                                    <span className="font-bold">
                                      www.ssa.gov
                                    </span>
                                    .
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td
                                  colSpan="2"
                                  className="p-0 border-r border-black border-t border-black"
                                >
                                  <div className="px-1.5 pt-1.5 pb-1.5">
                                    <div className="text-[7pt] mb-px">
                                      Address
                                    </div>
                                    <input
                                      name="address"
                                      value={formData.address}
                                      type="text"
                                      disabled
                                      className="w-full border-none border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                                    />
                                  </div>
                                  <div className="border-t border-black px-1.5 pt-1.5 pb-1">
                                    <div className="text-[7pt] mb-px">
                                      City or town, state, and ZIP code
                                    </div>
                                    <input
                                      name="city"
                                      value={formData.city}
                                      type="text"
                                      disabled
                                      className="w-full border-none border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                                    />
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td
                                  colSpan="3"
                                  className="border-t border-black p-1 px-1.5 text-[8pt]"
                                >
                                  <table className="w-full border-collapse">
                                    <tbody>
                                      <tr>
                                        <td className="w-[3%] align-top pr-1">
                                          <span className="font-bold">(c)</span>
                                        </td>
                                        <td>
                                          <div className="flex items-center mb-0.5">
                                            <input
                                              name="filingStatus"
                                              value="single"
                                              checked={
                                                formData.filingStatus ===
                                                "single"
                                              }
                                              type="checkbox"
                                              disabled
                                              className="mr-1.5 w-[11px] h-[11px] shrink-0"
                                            />
                                            <span className="text-[8pt]">
                                              Single or Married filing
                                              separately
                                            </span>
                                          </div>
                                          <div className="flex items-center mb-0.5">
                                            <input
                                              name="filingStatus"
                                              value="married"
                                              checked={
                                                formData.filingStatus ===
                                                "married"
                                              }
                                              type="checkbox"
                                              disabled
                                              className="mr-1.5 w-[11px] h-[11px] shrink-0"
                                            />
                                            <span className="text-[8pt]">
                                              Married filing jointly or
                                              Qualifying surviving spouse
                                            </span>
                                          </div>
                                          <div className="flex items-start">
                                            <input
                                              name="filingStatus"
                                              value="head"
                                              checked={
                                                formData.filingStatus === "head"
                                              }
                                              type="checkbox"
                                              disabled
                                              className="mr-1.5 w-[11px] h-[11px] mt-0.5 shrink-0"
                                            />
                                            <span className="text-[8pt]">
                                              Head of household (Check only if
                                              you're unmarried and pay more than
                                              half the costs of keeping up a
                                              home for yourself and a qualifying
                                              individual.)
                                            </span>
                                          </div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* TIP */}
                  <div className="border border-black p-[5px] mt-1 text-[7pt] leading-[1.3]">
                    <span className="font-bold">TIP:</span> Consider using the
                    estimator at{" "}
                    <span className="font-bold italic">www.irs.gov/W4App</span>{" "}
                    to determine the most accurate withholding for the rest of
                    the year if: you are completing this form after the
                    beginning of the year; expect to work only part of the year;
                    or have changes during the year in your marital status,
                    number of jobs for you (and/or your spouse if married filing
                    jointly), dependents, other income (not from jobs),
                    deductions, or credits. Have your most recent pay stub(s)
                    from this year available when using the estimator. At the
                    beginning of next year, use the estimator again to recheck
                    your withholding.
                  </div>

                  <div className="text-[8pt] my-1 leading-[1.3]">
                    <span className="font-bold">
                      Complete Steps 2–4 ONLY if they apply to you; otherwise,
                      skip to Step 5.
                    </span>{" "}
                    See page 2 for more information on each step, who can claim
                    exemption from withholding, and when to use the estimator at{" "}
                    <span className="italic">www.irs.gov/W4App</span>.
                  </div>

                  {/* Step 2 */}
                  <table className="w-full border-2 border-black border-collapse mt-0">
                    <tbody>
                      <tr>
                        <td className="w-[12%] border-r-2 border-black p-1 align-top font-bold text-[8.5pt] leading-[1.2]">
                          <div>Step 2:</div>
                          <div>Multiple Jobs</div>
                          <div>or Spouse</div>
                          <div>Works</div>
                        </td>
                        <td className="p-[5px] text-[8pt]">
                          <div className="mb-[3px]">
                            Complete this step if you (1) hold more than one job
                            at a time, or (2) are married filing jointly and
                            your spouse also works. The correct amount of
                            withholding depends on income earned from all of
                            these jobs.
                          </div>
                          <div className="font-bold mb-[3px]">
                            Do only one of the following.
                          </div>
                          <div className="mb-0.5">
                            <span className="font-bold">(a)</span> Use the
                            estimator at{" "}
                            <span className="font-bold italic">
                              www.irs.gov/W4App
                            </span>{" "}
                            for the most accurate withholding for this step (and
                            Steps 3–4). If you or your spouse have
                            self-employment income, use this option;{" "}
                            <span className="font-bold">or</span>
                          </div>
                          <div className="mb-0.5">
                            <span className="font-bold">(b)</span> Use the
                            Multiple Jobs Worksheet on page 3 and enter the
                            result in Step 4(c) below;{" "}
                            <span className="font-bold">or</span>
                          </div>
                          <div className="flex items-start mb-[3px]">
                            <span className="font-bold mr-1">(c)</span>
                            <div className="flex-1 flex items-end">
                              <span className="flex-1">
                                If there are only two jobs total, you may check
                                this box. Do the same on Form W-4 for the other
                                job. This option is generally more accurate than
                                (b) if pay at the lower paying job is more than
                                half of the pay at the higher paying job.
                                Otherwise, (b) is more accurate . . . . . . . .
                                . . . . . . . . . . .
                              </span>
                              <input
                                name="twoJobs"
                                checked={formData.twoJobs}
                                type="checkbox"
                                disabled
                                className="ml-1.5 w-[11px] h-[11px] shrink-0"
                              />
                            </div>
                          </div>
                          <div className="border-t border-black pt-[3px] text-[7pt]">
                            <span className="font-bold">
                              Complete Steps 3–4(b) on Form W-4 for only ONE of
                              these jobs.
                            </span>{" "}
                            Leave those steps blank for the other jobs. (Your
                            withholding will be most accurate if you complete
                            Steps 3–4(b) on the Form W-4 for the highest paying
                            job.)
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Step 3 */}
                  <table className="w-full border-2 border-black border-collapse mt-1">
                    <tbody>
                      <tr>
                        <td className="w-[12%] border-r-2 border-black p-1 align-top font-bold text-[8.5pt] leading-[1.2]">
                          <div>Step 3:</div>
                          <div>Claim</div>
                          <div>Dependent</div>
                          <div>and Other</div>
                          <div>Credits</div>
                        </td>
                        <td className="p-0">
                          <table className="w-full h-full border-collapse">
                            <tbody>
                              <tr>
                                <td className="p-[5px] text-[8pt] border-r border-black">
                                  <div className="mb-1">
                                    If your total income will be $200,000 or
                                    less ($400,000 or less if married filing
                                    jointly):
                                  </div>
                                  <div className="flex items-center mb-[3px]">
                                    <span className="flex-1">
                                      Multiply the number of qualifying children
                                      under age 17 by $2,000 . .
                                    </span>
                                    <span className="mr-1 whitespace-nowrap">
                                      $
                                    </span>
                                    <input
                                      name="childrenAmount"
                                      value={formData.childrenAmount}
                                      type="text"
                                      disabled
                                      className="w-[110px] border-0 border-b border-black outline-none text-[8pt] py-0.5 shrink-0 bg-transparent"
                                    />
                                  </div>
                                  <div className="flex items-center mb-[3px]">
                                    <span className="flex-1">
                                      Multiply the number of other dependents by
                                      $500 . . . . . . . . . . . . .
                                    </span>
                                    <span className="mr-1 whitespace-nowrap">
                                      $
                                    </span>
                                    <input
                                      name="otherDependents"
                                      value={formData.otherDependents}
                                      type="text"
                                      disabled
                                      className="w-[110px] border-0 border-b border-black outline-none text-[8pt] py-0.5 shrink-0 bg-transparent"
                                    />
                                  </div>
                                  <div>
                                    <span>
                                      Add the amounts above for qualifying
                                      children and other dependents. You may add
                                      to this the amount of any other credits.
                                      Enter the total here . . . . . . . . . . .
                                      .
                                    </span>
                                  </div>
                                </td>
                                <td className="w-[30px] text-center font-bold text-[8pt] border-r border-black align-bottom pb-[5px]">
                                  3
                                </td>
                                <td className="px-[5px] pb-[5px] text-[8pt] align-bottom">
                                  <div className="flex items-center">
                                    <span className="mr-1 whitespace-nowrap">
                                      $
                                    </span>
                                    <input
                                      name="step3Total"
                                      value={formData.step3Total}
                                      type="text"
                                      disabled
                                      className="w-[110px] border-0 border-b border-black outline-none text-[8pt] py-0.5 shrink-0 bg-transparent"
                                    />
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Step 4 */}
                  <table className="w-full border-2 border-black border-collapse mt-1">
                    <tbody>
                      <tr>
                        <td className="w-[12%] border-r-2 border-black p-1 align-top font-bold text-[8.5pt] leading-[1.2]">
                          <div>Step 4</div>
                          <div>(optional):</div>
                          <div>&nbsp;</div>
                          <div>Other</div>
                          <div>Adjustments</div>
                        </td>
                        <td className="p-0">
                          <table className="w-full border-collapse">
                            <tbody>
                              <tr>
                                <td className="p-[5px] text-[8pt] border-r border-black">
                                  <span className="font-bold">(a)</span> Other
                                  income (not from jobs). If you want tax
                                  withheld for other income you expect this year
                                  that won't have withholding, enter the amount
                                  of other income here. This may include
                                  interest, dividends, and retirement income . .
                                  . . . . . . . . . .
                                </td>
                                <td className="w-[40px] text-center font-bold text-[8pt] border-r border-black border-t border-b border-black align-bottom pb-[5px]">
                                  4(a)
                                </td>
                                <td className="px-[5px] pb-[5px] text-[8pt] align-bottom">
                                  <div className="flex items-center">
                                    <span className="mr-1 whitespace-nowrap">
                                      $
                                    </span>
                                    <input
                                      name="step4a"
                                      value={formData.step4a}
                                      type="text"
                                      disabled
                                      className="w-[110px] border-0 border-b border-black outline-none text-[8pt] py-0.5 shrink-0 bg-transparent"
                                    />
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td className="p-[5px] text-[8pt] border-r border-black">
                                  <span className="font-bold">
                                    (b) Deductions.
                                  </span>{" "}
                                  If you expect to claim deductions other than
                                  the standard deduction and want to reduce your
                                  withholding, use the Deductions Worksheet on
                                  page 3 and enter the result here . . . . . . .
                                  . . . . . . . . . . . . . . . . . . .
                                </td>
                                <td className="w-[40px] text-center font-bold text-[8pt] border-r border-black border-t border-b border-black align-bottom pb-[5px]">
                                  4(b)
                                </td>
                                <td className="px-[5px] pb-[5px] text-[8pt] align-bottom">
                                  <div className="flex items-center">
                                    <span className="mr-1 whitespace-nowrap">
                                      $
                                    </span>
                                    <input
                                      name="step4b"
                                      value={formData.step4b}
                                      type="text"
                                      disabled
                                      className="w-[110px] border-0 border-b border-black outline-none text-[8pt] py-0.5 shrink-0 bg-transparent"
                                    />
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td className="p-[5px] text-[8pt] border-r border-black">
                                  <span className="font-bold">
                                    (c) Extra withholding.
                                  </span>{" "}
                                  Enter any additional tax you want withheld
                                  each{" "}
                                  <span className="font-bold">pay period</span>{" "}
                                  . . .
                                </td>
                                <td className="w-[40px] text-center font-bold text-[8pt] border-r border-black border-t border-b border-black align-bottom pb-[5px]">
                                  4(c)
                                </td>
                                <td className="px-[5px] pb-[5px] text-[8pt] align-bottom">
                                  <div className="flex items-center">
                                    <span className="mr-1 whitespace-nowrap">
                                      $
                                    </span>
                                    <input
                                      name="step4c"
                                      value={formData.step4c}
                                      type="text"
                                      disabled
                                      className="w-[110px] border-0 border-b border-black outline-none text-[8pt] py-0.5 shrink-0 bg-transparent"
                                    />
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Step 5 */}
                  <table className="w-full border-2 border-black border-collapse mt-1">
                    <tbody>
                      <tr>
                        <td className="w-[12%] border-r-2 border-black p-1 align-top font-bold text-[8.5pt] leading-[1.2]">
                          <div>Step 5:</div>
                          <div>Sign</div>
                          <div>Here</div>
                        </td>
                        <td className="p-[5px] text-[8pt]">
                          <div className="mb-2">
                            Under penalties of perjury, I declare that this
                            certificate, to the best of my knowledge and belief,
                            is true, correct, and complete.
                          </div>
                          <div className="pt-2">
                            <div className="flex gap-5 items-end">
                              <div className="flex-[2]">
                                <input
                                  name="signature"
                                  value={formData.signature}
                                  type="text"
                                  disabled
                                  className="w-full border-0 border-b border-black outline-none text-[8pt] py-0.5 h-5 bg-transparent"
                                  style={{
                                    fontFamily: "Brush Script MT, cursive",
                                  }}
                                />
                                <div className="text-[7pt] mt-0.5">
                                  <span className="font-bold">
                                    Employee's signature
                                  </span>{" "}
                                  (This form is not valid unless you sign it.)
                                </div>
                              </div>
                              <div className="flex-1">
                                <input
                                  name="signatureDate"
                                  value={formData.signatureDate}
                                  type="text"
                                  disabled
                                  className="w-full border-0 border-b border-black outline-none text-[8pt] py-0.5 h-5 bg-transparent"
                                />
                                <div className="text-[7pt] mt-0.5 font-bold">
                                  Date
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Employers Only */}
                  <table className="w-full border-2 border-black border-collapse mt-1">
                    <tbody>
                      <tr>
                        <td
                          colSpan="3"
                          className="border-b-2 border-black py-[3px] px-[5px] font-bold text-[9pt]"
                        >
                          Employers Only
                        </td>
                      </tr>
                      <tr>
                        <td className="w-1/2 border-r border-black p-[5px] text-[7pt] align-top">
                          <div className="mb-1">
                            Employer's name and address
                          </div>
                          <textarea
                            name="employerName"
                            value={formData.employerName}
                            disabled
                            className="w-full border-0 outline-none text-[8pt] p-0.5 resize-none h-10 font-[Arial,sans-serif] bg-transparent"
                          ></textarea>
                        </td>
                        <td className="w-1/4 border-r border-black p-[5px] text-[7pt] align-top">
                          <div className="mb-1">First date of employment</div>
                          <input
                            name="employmentDate"
                            value={formData.employmentDate}
                            type="text"
                            disabled
                            className="w-full border-0 border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                          />
                        </td>
                        <td className="w-1/4 p-[5px] text-[7pt] align-top">
                          <div className="mb-1">
                            Employer identification number (EIN)
                          </div>
                          <input
                            name="ein"
                            value={formData.ein}
                            type="text"
                            disabled
                            className="w-full border-0 border-b border-dotted border-gray-400 outline-none text-[8pt] py-0.5 bg-transparent"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Footer */}
                  <div className="flex justify-between mt-1.5 text-[7pt]">
                    <div>
                      For Privacy Act and Paperwork Reduction Act Notice, see
                      page 3.
                    </div>
                    <div className="text-right">
                      <div>Cat. No. 10220Q</div>
                      <div className="font-bold">
                        Form <span className="font-bold">W-4</span> (2025)
                      </div>
                    </div>
                  </div>

                  {/* Page 2 */}
                  <div className="break-before-page mt-10">
                    <div className="flex justify-between mb-1 text-[7pt]">
                      <div>Form W-4 (2025)</div>
                      <div className="font-bold">
                        Page <span className="text-[9pt]">2</span>
                      </div>
                    </div>
                    <div className="border-b border-black mb-2"></div>

                    <div className="flex gap-3">
                      <div className="flex-1 text-[8pt] leading-[1.3]">
                        <h2 className="text-[11pt] font-bold m-0 mb-1.5">
                          General Instructions
                        </h2>
                        <p className="m-0 mb-1.5">
                          Section references are to the Internal Revenue Code
                          unless otherwise noted.
                        </p>
                        <h3 className="text-[9pt] font-bold my-1.5 mt-1.5 mb-1">
                          Future Developments
                        </h3>
                        <p className="m-0 mb-1.5">
                          For the latest information about developments related
                          to Form W-4, such as legislation enacted after it was
                          published, go to{" "}
                          <span className="italic">www.irs.gov/FormW4</span>.
                        </p>
                        <h3 className="text-[9pt] font-bold my-1.5 mt-1.5 mb-1">
                          Purpose of Form
                        </h3>
                        <p className="m-0 mb-1.5">
                          Complete Form W-4 so that your employer can withhold
                          the correct federal income tax from your pay. If too
                          little is withheld, you will generally owe tax when
                          you file your tax return and may owe a penalty. If too
                          much is withheld, you will generally be due a refund.
                          Complete a new Form W-4 when changes to your personal
                          or financial situation would change the entries on the
                          form. For more information on withholding and when you
                          must furnish a new Form W-4, see Pub. 505, Tax
                          Withholding and Estimated Tax.
                        </p>
                        <h3 className="text-[9pt] font-bold my-1.5 mt-1.5 mb-1">
                          Exemption from withholding.
                        </h3>
                        <p className="m-0 mb-1.5">
                          You may claim exemption from withholding for 2025 if
                          you meet both of the following conditions: you had no
                          federal income tax liability in 2024{" "}
                          <span className="font-bold">and</span> you expect to
                          have no federal income tax liability in 2025. You had
                          no federal income tax liability in 2024 if (1) your
                          total tax on line 24 on your 2024 Form 1040 or 1040-SR
                          is zero (or less than the sum of lines 27, 28, and
                          29), or (2) you were not required to file a return
                          because your income was below the filing threshold for
                          your correct filing status. If you claim exemption,
                          you will have no income tax withheld from your
                          paycheck and may owe taxes and penalties when you file
                          your 2025 tax return. To claim exemption from
                          withholding, certify that you meet both of the
                          conditions above by writing "Exempt" on Form W-4 in
                          the space below Step 4(c). Then, complete Steps 1(a),
                          1(b), and 5. Do not complete any other steps. You will
                          need to submit a new Form W-4 by February 17, 2026.
                        </p>
                        <h3 className="text-[9pt] font-bold my-1.5 mt-1.5 mb-1">
                          Your privacy.
                        </h3>
                        <p className="m-0 mb-1.5">
                          Steps 2(c) and 4(a) ask for information regarding
                          income you received from sources other than the job
                          associated with this Form W-4. If you have concerns
                          with providing the information asked about in Step(s)
                          2(c) and/or 4(a), you may choose not to provide it. If
                          you choose not to provide the information, then you
                          must use the estimator at{" "}
                          <span className="italic">www.irs.gov/W4App</span> and
                          enter in Step 4(c) the amount from that estimator as
                          an alternative; if you have concerns with providing
                          the information asked about in Step 2(c), you may
                          choose not to provide it and instead enter in Step
                          4(c) the additional amount you want withheld per pay
                          period in Step 4(c) as an alternative.
                        </p>
                        <h3 className="text-[9pt] font-bold my-1.5 mt-1.5 mb-1">
                          When to use the estimator.
                        </h3>
                        <p className="m-0 mb-1.5">
                          Consider using the estimator at{" "}
                          <span className="italic">www.irs.gov/W4App</span> if
                          you:
                        </p>
                        <p className="m-0 mb-1.5">
                          1. Are submitting this form after the beginning of the
                          year;
                        </p>
                        <p className="m-0 mb-1.5">
                          2. Expect to work only part of the year;
                        </p>
                        <p className="m-0 mb-1.5">
                          3. Have changes during the year in your marital
                          status, number of jobs for you (and/or your spouse if
                          married filing jointly), or number of dependents, or
                          changes in your deductions or credits;
                        </p>
                        <p className="m-0 mb-1.5">
                          4. Receive dividends, capital gains, social security,
                          bonuses, or business income, or are subject to the
                          Additional Medicare Tax or Net Investment Income Tax;
                          or
                        </p>
                        <p className="m-0 mb-1.5">
                          5. Prefer the most accurate withholding for multiple
                          job situations.
                        </p>
                        <p className="m-0 mb-1.5">
                          <span className="font-bold">TIP:</span> Have your most
                          recent pay stub(s) from this year available when using
                          the estimator to account for federal income tax that
                          has already been withheld this year. At the beginning
                          of next year, use the estimator again to recheck your
                          withholding.
                        </p>
                        <h3 className="text-[9pt] font-bold my-1.5 mt-1.5 mb-1">
                          Self-employment.
                        </h3>
                        <p className="m-0 mb-1.5">
                          Generally, you will owe both income and
                          self-employment taxes on any self-employment income
                          you receive separate from the wages you receive as an
                          employee. If you want to pay these taxes through
                          withholding from your wages, use the estimator at{" "}
                          <span className="italic">www.irs.gov/W4App</span> to
                          figure the amount to have withheld.
                        </p>
                      </div>

                      <div className="flex-1 text-[8pt] leading-[1.3]">
                        <h3 className="text-[9pt] font-bold m-0 mb-1">
                          Nonresident alien.
                        </h3>
                        <p className="m-0 mb-1.5">
                          If you're a nonresident alien, see Notice 1392,
                          Supplemental Form W-4 Instructions for Nonresident
                          Aliens, before completing this form.
                        </p>
                        <h2 className="text-[11pt] font-bold my-2 mt-2 mb-1.5">
                          Specific Instructions
                        </h2>
                        <h3 className="text-[9pt] font-bold my-1.5 mt-1.5 mb-1">
                          Step 1(c).
                        </h3>
                        <p className="m-0 mb-1.5">
                          Check your anticipated filing status. This will
                          determine the standard deduction and tax rates used to
                          compute your withholding.
                        </p>
                        <h3 className="text-[9pt] font-bold my-1.5 mt-1.5 mb-1">
                          Step 2.
                        </h3>
                        <p className="m-0 mb-1.5">
                          Use this step if you (1) hold more than one job at the
                          same time, or (2) are married filing jointly and you
                          and your spouse both work. Submit a separate Form W-4
                          for each job.
                        </p>
                        <p className="m-0 mb-1.5 pl-3">
                          Option <span className="font-bold">(a)</span> most
                          accurately calculates the additional tax you need to
                          have withheld, while option{" "}
                          <span className="font-bold">(b)</span> does so with a
                          little less accuracy.
                        </p>
                        <p className="m-0 mb-1.5 pl-3">
                          Instead, if you (and your spouse) have a total of only
                          two jobs, you may check the box in option{" "}
                          <span className="font-bold">(c)</span>. The box must
                          also be checked on the Form W-4 for the other job. If
                          the box is checked, the standard deduction and tax
                          brackets will be cut in half for each job to calculate
                          withholding. This option is accurate for jobs with
                          similar pay; otherwise, more tax than necessary may be
                          withheld, and this extra amount will be larger the
                          greater the difference in pay is between the two jobs.
                        </p>
                        <div className="border-2 border-black p-1.5 my-1.5">
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 border-2 border-black bg-black text-white flex items-center justify-center font-bold text-[14pt] shrink-0 mt-0.5">
                              !
                            </div>
                            <div className="flex-1">
                              <div className="font-bold mb-0.5">CAUTION</div>
                              <div className="font-bold mb-0.5">
                                Multiple jobs.
                              </div>
                              <div>
                                Complete Steps 3 through 4(b) on only one Form
                                W-4. Withholding will be most accurate if you do
                                this on the Form W-4 for the highest paying job.
                              </div>
                            </div>
                          </div>
                        </div>
                        <h3 className="text-[9pt] font-bold my-1.5 mt-1.5 mb-1">
                          Step 3.
                        </h3>
                        <p className="m-0 mb-1.5">
                          This step provides instructions for determining the
                          amount of the child tax credit and the credit for
                          other dependents that you may be able to claim when
                          you file your tax return. To qualify for the child tax
                          credit, the child must be under age 17 as of December
                          31, must be your dependent who generally lives with
                          you for more than half the year, and must have the
                          required social security number. You may be able to
                          claim a credit for other dependents for whom a child
                          tax credit can't be claimed, such as an older child or
                          a qualifying relative. For additional eligibility
                          requirements for these credits, see Pub. 501,
                          Dependents, Standard Deduction, and Filing
                          Information. You can also include other tax credits
                          for which you are eligible in this step, such as the
                          foreign tax credit and the education tax credits. To
                          do so, add an estimate of the amount for the year to
                          your credits for dependents and enter the total amount
                          in Step 3. Including these credits will increase your
                          paycheck and reduce the amount of any refund you may
                          receive when you file your tax return.
                        </p>
                        <h3 className="text-[9pt] font-bold my-1.5 mt-1.5 mb-1">
                          Step 4 (optional).
                        </h3>
                        <p className="m-0 mb-1.5">
                          <span className="font-bold italic">Step 4(a).</span>{" "}
                          Enter in this step the total of your other estimated
                          income for the year, if any. You shouldn't include
                          income from any jobs or self-employment. If you
                          complete Step 4(a), you likely won't have to make
                          estimated tax payments for that income. If you prefer
                          to pay estimated tax rather than having tax on other
                          income withheld from your paycheck, see Form 1040-ES,
                          Estimated Tax for Individuals.
                        </p>
                        <p className="m-0 mb-1.5">
                          <span className="font-bold italic">Step 4(b).</span>{" "}
                          Enter in this step the amount from the Deductions
                          Worksheet, line 5, if you expect to claim deductions
                          other than the basic standard deduction on your 2025
                          tax return and want to reduce your withholding to
                          account for these deductions. This includes both
                          itemized deductions and other deductions such as for
                          student loan interest and IRAs.
                        </p>
                        <p className="m-0 mb-1.5">
                          <span className="font-bold italic">Step 4(c).</span>{" "}
                          Enter in this step any additional tax you want
                          withheld from your pay each{" "}
                          <span className="font-bold">pay period</span>,
                          including any amounts from the Multiple Jobs
                          Worksheet, line 4. Entering an amount here will reduce
                          your paycheck and will either increase your refund or
                          reduce any amount of tax that you owe.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Page 3 */}
                  <div className="break-before-page mt-10">
                    <div className="flex justify-between mb-1 text-[7pt]">
                      <div>Form W-4 (2025)</div>
                      <div className="font-bold">
                        Page <span className="text-[9pt]">3</span>
                      </div>
                    </div>
                    <div className="border-b border-black mb-2"></div>

                    {/* Multiple Jobs Worksheet */}
                    <div className="border-2 border-black p-2 mb-3 relative">
                      <div className="absolute top-[2.5px] right-4 w-6 h-6 border-2 border-black bg-black flex items-center justify-center">
                        <span className="text-white text-[14pt] font-bold">
                          ✓
                        </span>
                      </div>
                      <div className="mb-1.5 pr-[45px]">
                        <h3 className="text-[10pt] font-bold m-0 text-center">
                          Step 2(b)—Multiple Jobs Worksheet{" "}
                          <span className="italic font-normal">
                            (Keep for your records.)
                          </span>
                        </h3>
                      </div>
                      <div className="border-b-2 border-black mb-1.5"></div>
                      <p className="text-[8pt] leading-[1.3] m-0 mb-1.5">
                        If you choose the option in Step 2(b) on Form W-4,
                        complete this worksheet (which calculates the total
                        extra tax for all jobs) on{" "}
                        <span className="font-bold">only ONE</span> Form W-4.
                        Withholding will be most accurate if you complete the
                        worksheet and enter the result on the Form W-4 for the
                        highest paying job. To be accurate, submit a new Form
                        W-4 for all other jobs if you have not updated your
                        withholding since 2019.
                      </p>
                      <p className="text-[8pt] leading-[1.3] m-0 mb-1.5">
                        <span className="font-bold">Note:</span> If more than
                        one job has annual wages of more than $120,000 or there
                        are more than three jobs, see Pub. 505 for additional
                        tables; or, you can use the online withholding estimator
                        at <span className="italic">www.irs.gov/W4App</span>.
                      </p>

                      <table className="w-full text-[8pt] leading-[1.3] mt-2">
                        <tbody>
                          <tr>
                            <td className="w-[30px] align-top font-bold">1</td>
                            <td className="align-top">
                              <span className="font-bold">Two jobs.</span> If
                              you (and your spouse) each have one job, find the
                              amount from the appropriate table on page 4. Using
                              the "Higher Paying Job" row and the "Lower Paying
                              Job" column, find the value at the intersection of
                              the two household salaries and enter that value on
                              line 1. Then,{" "}
                              <span className="font-bold">skip</span> to line 3
                              . . . . . . . . . . . . . . . . . . . . . . . . .
                              .
                            </td>
                            <td className="w-[40px] text-center align-bottom font-bold">
                              1
                            </td>
                            <td className="w-[100px] align-bottom">
                              <div className="flex items-center">
                                <span className="mr-1">$</span>
                                <input
                                  name="multipleJobs1"
                                  value={formData.multipleJobs1}
                                  type="text"
                                  disabled
                                  className="flex-1 border-0 border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                                />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="4" className="h-2"></td>
                          </tr>
                          <tr>
                            <td className="w-[30px] align-top font-bold">2</td>
                            <td className="align-top">
                              <span className="font-bold">Three jobs.</span> If
                              you (and/or your spouse) have three jobs at the
                              same time, complete lines 2a, 2b, and 2c below.
                              Otherwise, <span className="font-bold">skip</span>{" "}
                              to line 3.
                            </td>
                            <td colSpan="2"></td>
                          </tr>
                          <tr>
                            <td></td>
                            <td colSpan="3">
                              <table className="w-full mt-1">
                                <tbody>
                                  <tr>
                                    <td className="w-[30px] align-top font-bold">
                                      a
                                    </td>
                                    <td>
                                      Find the amount from the appropriate table
                                      on page 4 using the annual wages from the
                                      highest paying job in the "Higher Paying
                                      Job" row and the annual wages for your
                                      next highest paying job in the "Lower
                                      Paying Job" column. Find the value at the
                                      intersection of the two household salaries
                                      and enter that value on line 2a . . . . .
                                      . . . . . . . . . . . . . . . . . . . . .
                                      . .
                                    </td>
                                    <td className="w-[40px] text-center align-bottom font-bold">
                                      2a
                                    </td>
                                    <td className="w-[100px] align-bottom">
                                      <div className="flex items-center">
                                        <span className="mr-1">$</span>
                                        <input
                                          name="multipleJobs2a"
                                          value={formData.multipleJobs2a}
                                          type="text"
                                          disabled
                                          className="flex-1 border-0 border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td colSpan="4" className="h-1.5"></td>
                                  </tr>
                                  <tr>
                                    <td className="w-[30px] align-top font-bold">
                                      b
                                    </td>
                                    <td>
                                      Add the annual wages of the two highest
                                      paying jobs from line 2a together and use
                                      the total as the wages in the "Higher
                                      Paying Job" row and use the annual wages
                                      for your third job in the "Lower Paying
                                      Job" column to find the amount from the
                                      appropriate table on page 4 and enter this
                                      amount on line 2b . . . . . . . . . . . .
                                      . . . . . . . . . . . . . . . . . . . . .
                                      .
                                    </td>
                                    <td className="w-[40px] text-center align-bottom font-bold">
                                      2b
                                    </td>
                                    <td className="w-[100px] align-bottom">
                                      <div className="flex items-center">
                                        <span className="mr-1">$</span>
                                        <input
                                          name="multipleJobs2b"
                                          value={formData.multipleJobs2b}
                                          type="text"
                                          disabled
                                          className="flex-1 border-0 border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td colSpan="4" className="h-1.5"></td>
                                  </tr>
                                  <tr>
                                    <td className="w-[30px] align-top font-bold">
                                      c
                                    </td>
                                    <td>
                                      Add the amounts from lines 2a and 2b and
                                      enter the result on line 2c . . . . . . .
                                      . . . .
                                    </td>
                                    <td className="w-[40px] text-center align-bottom font-bold">
                                      2c
                                    </td>
                                    <td className="w-[100px] align-bottom">
                                      <div className="flex items-center">
                                        <span className="mr-1">$</span>
                                        <input
                                          name="multipleJobs2c"
                                          value={formData.multipleJobs2c}
                                          type="text"
                                          disabled
                                          className="flex-1 border-0 border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="4" className="h-2"></td>
                          </tr>
                          <tr>
                            <td className="w-[30px] align-top font-bold">3</td>
                            <td className="align-top">
                              Enter the number of pay periods per year for the
                              highest paying job. For example, if that job pays
                              weekly, enter 52; if it pays every other week,
                              enter 26; if it pays monthly, enter 12, etc. . . .
                              . .
                            </td>
                            <td className="w-[40px] text-center align-bottom font-bold">
                              3
                            </td>
                            <td className="w-[100px] align-bottom">
                              <input
                                name="multipleJobs3"
                                value={formData.multipleJobs3}
                                type="text"
                                disabled
                                className="w-full border-0 border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="4" className="h-2"></td>
                          </tr>
                          <tr>
                            <td className="w-[30px] align-top font-bold">4</td>
                            <td className="align-top">
                              <span className="font-bold">Divide</span> the
                              annual amount on line 1 or line 2c by the number
                              of pay periods on line 3. Enter this amount here
                              and in{" "}
                              <span className="font-bold">Step 4(c)</span> of
                              Form W-4 for the highest paying job (along with
                              any other additional amount you want withheld) . .
                              . . . . . . . . . . . . . . . . . . . . . . . . .
                              . . .
                            </td>
                            <td className="w-[40px] text-center align-bottom font-bold">
                              4
                            </td>
                            <td className="w-[100px] align-bottom">
                              <div className="flex items-center">
                                <span className="mr-1">$</span>
                                <input
                                  name="multipleJobs4"
                                  value={formData.multipleJobs4}
                                  type="text"
                                  disabled
                                  className="flex-1 border-0 border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                                />
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Deductions Worksheet */}
                    <div className="border-2 border-black p-2 mb-3 relative">
                      <div className="absolute top-[2.5px] right-4 w-6 h-6 border-2 border-black bg-black flex items-center justify-center">
                        <span className="text-white text-[14pt] font-bold">
                          ✓
                        </span>
                      </div>
                      <div className="mb-1.5 pr-[45px]">
                        <h3 className="text-[10pt] font-bold m-0 text-center">
                          Step 4(b)—Deductions Worksheet{" "}
                          <span className="italic font-normal">
                            (Keep for your records.)
                          </span>
                        </h3>
                      </div>
                      <div className="border-b-2 border-black mb-1.5"></div>

                      <table className="w-full text-[8pt] leading-[1.3] mt-2">
                        <tbody>
                          <tr>
                            <td className="w-[30px] align-top font-bold">1</td>
                            <td className="align-top">
                              Enter an estimate of your 2025 itemized deductions
                              (from Schedule A (Form 1040)). Such deductions may
                              include qualifying home mortgage interest,
                              charitable contributions, state and local taxes
                              (up to $10,000), and medical expenses in excess of
                              7.5% of your income . . . . . . . . . . . . . . .
                            </td>
                            <td className="w-[40px] text-center align-bottom font-bold">
                              1
                            </td>
                            <td className="w-[100px] align-bottom">
                              <div className="flex items-center">
                                <span className="mr-1">$</span>
                                <input
                                  name="deductions1"
                                  value={formData.deductions1}
                                  type="text"
                                  disabled
                                  className="flex-1 border-0 border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                                />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="4" className="h-2"></td>
                          </tr>
                          <tr>
                            <td className="w-[30px] align-top font-bold">2</td>
                            <td className="align-top">
                              <div className="flex items-center">
                                <span>Enter:</span>
                                <div className="ml-2 flex items-center">
                                  <div className="text-[40pt] leading-[0.8] mr-1">
                                    &#123;
                                  </div>
                                  <div>
                                    <div>
                                      • $30,000 if you're married filing jointly
                                      or a qualifying surviving spouse
                                    </div>
                                    <div>
                                      • $22,500 if you're head of household
                                    </div>
                                    <div>
                                      • $15,000 if you're single or married
                                      filing separately
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="w-[40px] text-center align-bottom font-bold">
                              2
                            </td>
                            <td className="w-[100px] align-bottom">
                              <div className="flex items-center">
                                <span className="mr-1">$</span>
                                <input
                                  name="deductions2"
                                  value={formData.deductions2}
                                  type="text"
                                  disabled
                                  className="flex-1 border-0 border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                                />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="4" className="h-2"></td>
                          </tr>
                          <tr>
                            <td className="w-[30px] align-top font-bold">3</td>
                            <td className="align-top">
                              If line 1 is greater than line 2, subtract line 2
                              from line 1 and enter the result here. If line 2
                              is greater than line 1, enter "-0-" . . . . . . .
                              . . . . . . . . . . . . . . . . . . . . . . . .
                            </td>
                            <td className="w-[40px] text-center align-bottom font-bold">
                              3
                            </td>
                            <td className="w-[100px] align-bottom">
                              <div className="flex items-center">
                                <span className="mr-1">$</span>
                                <input
                                  name="deductions3"
                                  value={formData.deductions3}
                                  type="text"
                                  disabled
                                  className="flex-1 border-0 border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                                />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="4" className="h-2"></td>
                          </tr>
                          <tr>
                            <td className="w-[30px] align-top font-bold">4</td>
                            <td className="align-top">
                              Enter an estimate of your student loan interest,
                              deductible IRA contributions, and certain other
                              adjustments (from Part II of Schedule 1 (Form
                              1040)). See Pub. 505 for more information . . . .
                              .
                            </td>
                            <td className="w-[40px] text-center align-bottom font-bold">
                              4
                            </td>
                            <td className="w-[100px] align-bottom">
                              <div className="flex items-center">
                                <span className="mr-1">$</span>
                                <input
                                  name="deductions4"
                                  value={formData.deductions4}
                                  type="text"
                                  disabled
                                  className="flex-1 border-0 border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                                />
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="4" className="h-2"></td>
                          </tr>
                          <tr>
                            <td className="w-[30px] align-top font-bold">5</td>
                            <td className="align-top">
                              <span className="font-bold">Add</span> lines 3 and
                              4. Enter the result here and in{" "}
                              <span className="font-bold">Step 4(b)</span> of
                              Form W-4 . . . . . . . . . . . . . .
                            </td>
                            <td className="w-[40px] text-center align-bottom font-bold">
                              5
                            </td>
                            <td className="w-[100px] align-bottom">
                              <div className="flex items-center">
                                <span className="mr-1">$</span>
                                <input
                                  name="deductions5"
                                  value={formData.deductions5}
                                  type="text"
                                  disabled
                                  className="flex-1 border-0 border-b border-black outline-none text-[8pt] py-0.5 bg-transparent"
                                />
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Privacy Act Notice */}
                    <div className="border-t-2 border-black pt-2">
                      <div className="flex gap-3 text-[7pt] leading-[1.3]">
                        <div className="flex-1">
                          <p className="m-0 mb-1.5">
                            <span className="font-bold">
                              Privacy Act and Paperwork Reduction Act Notice.
                            </span>{" "}
                            We ask for the information on this form to carry out
                            the Internal Revenue laws of the United States.
                            Internal Revenue Code sections 3402(f)(2) and 6109
                            and their regulations require you to provide this
                            information; your employer uses it to determine your
                            federal income tax withholding. Failure to provide a
                            properly completed form will result in your being
                            treated as a single person with no other entries on
                            the form; providing fraudulent information may
                            subject you to penalties. Routine uses of this
                            information include giving it to the Department of
                            Justice for civil and criminal litigation; to
                            cities, states, the District of Columbia, and U.S.
                            commonwealths and territories for use in
                            administering their tax laws; and to the Department
                            of Health and Human Services for use in the National
                            Directory of New Hires. We may also disclose this
                            information to other countries under a tax treaty,
                            to federal and state agencies to enforce federal
                            nontax criminal laws, or to federal law enforcement
                            and intelligence agencies to combat terrorism.
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="m-0 mb-1.5">
                            You are not required to provide the information
                            requested on a form that is subject to the Paperwork
                            Reduction Act unless the form displays a valid OMB
                            control number. Books or records relating to a form
                            or its instructions must be retained as long as
                            their contents may become material in the
                            administration or enforcement of any Internal
                            Revenue law. Generally, tax returns and return
                            information are confidential, as required by Code
                            section 6103.
                          </p>
                          <p className="m-0 mb-1.5">
                            The average time and expenses required to complete
                            and file this form will vary depending on individual
                            circumstances. For estimated averages, see the
                            instructions for your income tax return.
                          </p>
                          <p className="m-0">
                            If you have suggestions for making this form
                            simpler, we would be happy to hear from you. See the
                            instructions for your income tax return.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="max-w-[8.5in] mx-auto py-[0.5in] px-[0.5in] bg-white font-[Arial,sans-serif] text-[10pt] leading-[1.2] mt-1.5 w4-page">
                  <img
                    src="/page-4r.svg"
                    alt="Page 4"
                    className="w-full h-auto"
                  />
                </div>

                <div className="mb-4 space-y-2">
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
                    {downloading ? "Downloading..." : "Download Form as PDF"}
                  </button>
                </div>

                <HRNotesInput
                  formType="w4"
                  employeeId={employeeId}
                  existingNote={submission?.hrFeedback?.comment}
                  existingReviewedAt={submission?.hrFeedback?.reviewedAt}
                  onNoteSaved={fetchSubmission}
                  formData={submission}
                  showSignature={false}
                />
              </div>
            )}

            {employeeId && !submission && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-yellow-800">
                  No W-4 submission found for this employee.
                </p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 items-center px-6 md:px-8 pb-6 mt-8">
            <button
              onClick={() => navigate(`/hr/i9-form/${employeeId}`)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous: I-9 Form
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Exit to Dashboard
            </button>
            <button
              onClick={() => navigate(`/hr/w9-form/${employeeId}`)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Next: W-9 Form
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default W4FormHR;
