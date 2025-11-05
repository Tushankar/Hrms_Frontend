import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Save, RotateCcw, Trash2, Undo2 } from "lucide-react";
import toast from "react-hot-toast";
import "./SignaturePad.css";

const SignaturePad = ({
  initialValue,
  onSave,
  label,
  required = false,
  disabled = false,
  width = 400,
  height = 150,
}) => {
  const sigPad = useRef(null);
  const [signatureURL, setSignatureURL] = useState("");
  const [signatureFile, setSignatureFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Get base URL from environment variable - used for both API calls and file uploads
  const baseURL = import.meta.env.VITE__BASEURL || "http://localhost:3000";

  // Helper to build a normalized absolute URL from baseURL and a relative path
  const buildFullUrl = (relativePath) => {
    if (!relativePath) return "";
    // Ensure baseURL has no trailing slash
    const base = baseURL.replace(/\/+$/, "");
    // Ensure relative path has no leading slash
    const rel = relativePath.replace(/^\/+/, "");
    return `${base}/${rel}`;
  };

  // Load initial signature if provided
  useEffect(() => {
    console.log("🔍 SignaturePad initialValue received:", initialValue);
    console.log("🔍 SignaturePad baseURL:", baseURL);

    setImageLoadError(false);

    if (initialValue && initialValue.trim()) {
      const trimmedValue = initialValue.trim();
      console.log("🔍 Trimmed value:", trimmedValue);

      // If it's a base64 data URL
      if (trimmedValue.startsWith("data:image")) {
        console.log("✅ Setting signature from base64 data URL");
        setSignatureURL(trimmedValue);
      }
      // If it's already a full HTTP/HTTPS URL
      else if (
        trimmedValue.startsWith("http://") ||
        trimmedValue.startsWith("https://")
      ) {
        console.log("✅ Setting signature from full URL:", trimmedValue);
        setSignatureURL(trimmedValue);
      }
      // If it's a relative path (starts with /uploads or uploads/)
      else if (
        trimmedValue.startsWith("/uploads") ||
        trimmedValue.startsWith("uploads/")
      ) {
        const fullURL = buildFullUrl(trimmedValue);
        console.log(
          "✅ Setting signature from relative path. Full URL:",
          fullURL
        );
        setSignatureURL(fullURL);
      }
      // If it contains "uploads/" anywhere in the path
      else if (trimmedValue.includes("uploads/")) {
        const uploadsIndex = trimmedValue.indexOf("uploads/");
        const relativePath = trimmedValue.substring(uploadsIndex);
        const fullURL = buildFullUrl(relativePath);
        console.log(
          "✅ Setting signature from path with uploads. Full URL:",
          fullURL
        );
        setSignatureURL(fullURL);
      } else {
        console.warn("⚠️ Unknown signature format:", trimmedValue);
        console.warn("⚠️ Attempting to construct URL anyway...");
        const fullURL = buildFullUrl(trimmedValue);
        console.log("⚠️ Constructed URL:", fullURL);
        setSignatureURL(fullURL);
      }
    } else {
      console.log("ℹ️ No initialValue provided or empty");
      setSignatureURL("");
    }
  }, [initialValue, baseURL]);

  // Save signature state for undo functionality
  const saveHistory = () => {
    if (!sigPad.current) return;

    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(sigPad.current.toDataURL());
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  // Undo last action
  const handleUndo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      const prevState = history[prevStep];

      if (sigPad.current && prevState) {
        sigPad.current.fromDataURL(prevState);
        setHistoryStep(prevStep);
      }
    }
  };

  // Convert dataURL to File object
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Save signature and upload to server
  const saveSignature = async () => {
    if (!sigPad.current || sigPad.current.isEmpty()) {
      toast.error("Please provide a signature before saving");
      return false;
    }

    try {
      // Get signature as base64 image URL
      const dataURL = sigPad.current.toDataURL("image/png");

      // Convert to file for upload
      const file = dataURLtoFile(dataURL, `signature-${Date.now()}.png`);

      // Create FormData for multer upload
      const formData = new FormData();
      formData.append("signature", file);

      // Upload to server
      const response = await fetch(`${baseURL}/upload/signature`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        const serverPath = result.filePath;
        console.log("✅ Signature uploaded. Server path:", serverPath);
        console.log("✅ BaseURL:", baseURL);

        // Construct full URL using baseURL for displaying the uploaded signature
        const fullURL = buildFullUrl(serverPath);
        console.log("✅ Full signature URL:", fullURL);
        setSignatureURL(fullURL);
        setSignatureFile(serverPath);

        // Pass the server path to parent component
        if (onSave) onSave(serverPath);

        toast.success("Signature saved successfully!");
        return true;
      } else {
        throw new Error("Failed to upload signature");
      }
    } catch (error) {
      console.error("Error saving signature:", error);
      toast.error("Failed to save signature. Please try again.");
      return false;
    }
  };

  // Clear signature
  const clearSignature = () => {
    if (sigPad.current) {
      sigPad.current.clear();
    }
    setSignatureURL("");
    setSignatureFile(null);
    setHistory([]);
    setHistoryStep(-1);
    setImageLoadError(false);
    if (onSave) onSave("");
  };

  // Handle canvas events for history tracking
  const handleMouseUp = () => {
    saveHistory();
  };

  const handleTouchEnd = () => {
    saveHistory();
  };

  // Log before render
  console.log("🎨 SignaturePad render - signatureURL state:", signatureURL);
  console.log("🎨 SignaturePad render - baseURL:", baseURL);

  return (
    <div className="mb-4">
      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
        {signatureURL && !imageLoadError ? (
          // Display saved signature with clear button
          <div className="p-3 sm:p-4">
            <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
              <img
                src={signatureURL}
                alt="Signature"
                className="max-h-24 sm:max-h-32 mx-auto block"
                style={{ maxWidth: "100%" }}
                onLoad={() => {
                  console.log(
                    "✅ SignaturePad - Image loaded successfully:",
                    signatureURL
                  );
                  setImageLoadError(false);
                }}
                onError={(e) => {
                  console.error(
                    "❌ SignaturePad - Image failed to load:",
                    signatureURL
                  );
                  console.error("❌ SignaturePad - Error:", e);
                  setImageLoadError(true);
                  toast.error("Signature image not found. Please sign again.");
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-green-600 font-medium">
                ✓ Signature loaded
              </span>
              <button
                type="button"
                onClick={clearSignature}
                disabled={disabled}
                className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>
        ) : (
          // Signature canvas
          <div className="p-3 sm:p-4">
            <div className="signature-container border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 relative overflow-hidden">
              <SignatureCanvas
                ref={sigPad}
                penColor="black"
                canvasProps={{
                  width:
                    typeof window !== "undefined" && window.innerWidth < 640
                      ? Math.min(window.innerWidth - 80, 300)
                      : width,
                  height:
                    typeof window !== "undefined" && window.innerWidth < 640
                      ? 120
                      : height,
                  className: "signature-canvas w-full",
                }}
                onEnd={handleMouseUp}
                onTouchEnd={handleTouchEnd}
                backgroundColor="rgba(255,255,255,0)"
              />

              {/* Canvas overlay instructions */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-gray-400 text-xs sm:text-sm font-medium px-2 text-center">
                  Sign here using mouse or touch
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0 mt-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={disabled || historyStep <= 0}
                  className="flex items-center justify-center gap-1 px-3 py-2 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                  title="Undo last stroke"
                >
                  <Undo2 className="w-3 h-3" />
                  Undo
                </button>

                <button
                  type="button"
                  onClick={clearSignature}
                  disabled={disabled}
                  className="flex items-center justify-center gap-1 px-3 py-2 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                  title="Clear all"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              </div>

              <button
                type="button"
                onClick={saveSignature}
                disabled={disabled}
                className="flex items-center justify-center gap-1 px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <Save className="w-3 h-3" />
                Save Signature
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
              Draw your signature above, then click "Save Signature" to confirm
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignaturePad;
