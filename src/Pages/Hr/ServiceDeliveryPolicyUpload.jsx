import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText, CheckCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";

const ServiceDeliveryPolicyUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const baseURL = import.meta.env.VITE__BASEURL;

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
        `${baseURL}/onboarding/hr-upload-service-delivery-policy-template`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.data) {
        toast.success("Service Delivery Policy template uploaded successfully!");
        setFile(null);
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      console.error("Error uploading template:", error);
      toast.error("Failed to upload template");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
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
              Upload Service Delivery Policy Template (Exhibit 4)
            </h1>
            <p className="text-gray-600">
              Upload a PDF template that employees will review, sign digitally, and submit
            </p>
          </div>

          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-[#1F3A93] text-white rounded-lg hover:bg-[#16307E] transition-colors"
              >
                <FileText className="w-5 h-5" />
                Select PDF File
              </label>
              {file && (
                <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{file.name}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {uploading ? "Uploading..." : "Upload Template"}
            </button>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default ServiceDeliveryPolicyUpload;
