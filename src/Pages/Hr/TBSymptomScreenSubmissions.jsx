import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Eye, Trash2, Stethoscope, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
// required CSS for correct text/annotation rendering
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const TBSymptomScreenSubmissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(800);
  const baseURL = import.meta.env.VITE__BASEURL;

  const viewerRef = useRef(null);

  // Configure pdfjs worker
  useEffect(() => {
    // Use local worker from pdfjs-dist using import.meta.url resolution
    try {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).href;
    } catch (err) {
      console.warn(
        "Failed to set local pdf.worker via import.meta.url, falling back to CDN:",
        err
      );
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (viewerRef.current) {
        setPageWidth(viewerRef.current.offsetWidth - 16); // padding
      } else {
        setPageWidth(Math.min(window.innerWidth - 64, 1000));
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [viewerRef.current]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/hr-get-all-tb-symptom-screen-submissions`,
        { withCredentials: true }
      );
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (filePath) => {
    window.open(`${baseURL}/${filePath}`, "_blank");
  };

  const handlePreview = (submission) => {
    setSelectedSubmission(submission);
    setPreviewModalOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewModalOpen(false);
    setSelectedSubmission(null);
    setNumPages(null);
  };

  const handleClear = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to clear this submission? The employee will be able to re-upload."
      )
    ) {
      return;
    }
    try {
      await axios.delete(
        `${baseURL}/onboarding/hr-clear-tb-symptom-screen-submission/${id}`,
        { withCredentials: true }
      );
      toast.success("Submission cleared successfully");
      fetchSubmissions();
    } catch (error) {
      console.error("Error clearing submission:", error);
      toast.error("Failed to clear submission");
    }
  };

  return (
    <Layout>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to HR Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Stethoscope className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                TB Symptom Screen Submissions
              </h1>
              <p className="text-gray-600">
                Review all employee-submitted TB Symptom Screen forms
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.employeeId?.firstName}{" "}
                          {submission.employeeId?.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {submission.employeeId?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(
                            submission.employeeUploadedForm.uploadedAt
                          ).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            submission.status === "submitted"
                              ? "bg-green-100 text-green-800"
                              : submission.status === "under_review"
                              ? "bg-yellow-100 text-yellow-800"
                              : submission.status === "approved"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handlePreview(submission)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            title="Preview document"
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </button>
                          <button
                            onClick={() =>
                              handleDownload(
                                submission.employeeUploadedForm.filePath
                              )
                            }
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1F3A93] text-white rounded hover:bg-[#16307E] transition-colors"
                            title="Download submitted document"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                          <button
                            onClick={() =>
                              window.open(
                                `${baseURL}/${submission.employeeUploadedForm.filePath}`,
                                "_blank"
                              )
                            }
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            title="View document in new tab"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleClear(submission._id)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            title="Clear this submission"
                          >
                            <Trash2 className="w-4 h-4" />
                            Clear
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* PDF Preview Modal */}
      {previewModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  TB Symptom Screen - {selectedSubmission.employeeId?.firstName}{" "}
                  {selectedSubmission.employeeId?.lastName}
                </h2>
                <p className="text-sm text-gray-600">
                  Submitted on{" "}
                  {new Date(
                    selectedSubmission.employeeUploadedForm.uploadedAt
                  ).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={handleClosePreview}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
              <div
                ref={viewerRef}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg overflow-auto p-4"
              >
                <Document
                  file={`${baseURL}/${selectedSubmission.employeeUploadedForm.filePath}`}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  onLoadError={(err) => {
                    console.error("Error loading PDF:", err);
                  }}
                  loading={
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mr-2"></div>
                      <span className="text-gray-600">Loading PDF...</span>
                    </div>
                  }
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <div
                      key={`page_${index + 1}`}
                      className="mb-4 flex justify-center"
                    >
                      <Page
                        pageNumber={index + 1}
                        width={pageWidth}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </div>
                  ))}
                </Document>
                {/* Fallback link in case fetching the file fails due to CORS or other issues */}
                <div className="text-sm text-gray-600 mt-2 text-center">
                  If the document doesn't load, you can{" "}
                  <a
                    href={`${baseURL}/${selectedSubmission.employeeUploadedForm.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    open it in a new tab
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </Layout>
  );
};

export default TBSymptomScreenSubmissions;
