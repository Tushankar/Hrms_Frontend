import React, { useRef, useState, useEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { Download, Trash2, Send, Loader } from "lucide-react";
import toast from "react-hot-toast";

const PDFSignaturePad = ({
  pdfURL,
  onSave,
  onSignatureUploaded,
  applicationId,
  employeeId,
}) => {
  const canvasRef = useRef(null);
  const signatureCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [signatureDate, setSignatureDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const baseURL = import.meta.env.VITE__BASEURL;

  // Load PDF and render it
  useEffect(() => {
    const loadPDF = async () => {
      try {
        let cleanPath = pdfURL.replace(/\\/g, "/");
        const fullURL = cleanPath.startsWith("/")
          ? `${baseURL}${cleanPath}`
          : `${baseURL}/${cleanPath}`;
        console.log("Loading PDF from:", fullURL);

        renderPDF(fullURL);
      } catch (error) {
        console.error("Error loading PDF:", error);
        toast.error("Failed to load PDF");
      }
    };

    if (pdfURL) {
      loadPDF();
    }
  }, [pdfURL]);

  // Render PDF using pdfjs
  const renderPDF = async (pdfUrl) => {
    try {
      const { getDocument, GlobalWorkerOptions, version } = await import(
        "pdfjs-dist"
      );

      // Set up worker - use CDN for production reliability
      try {
        // Try local worker first
        GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).href;
        console.log("Using local PDF worker");
      } catch (err) {
        console.warn("Local worker not available, using CDN:", err);
        // Fallback to CDN
        GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
        console.log(
          "Using CDN PDF worker from:",
          GlobalWorkerOptions.workerSrc
        );
      }

      console.log("Fetching PDF from:", pdfUrl);
      const response = await fetch(pdfUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch PDF: ${response.status} ${response.statusText}`
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log("PDF fetched successfully, size:", arrayBuffer.byteLength);

      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);

      // Set scale for proper rendering
      const renderScale = 2;
      const viewport = page.getViewport({ scale: renderScale });

      // Render PDF on main canvas
      if (canvasRef.current) {
        canvasRef.current.width = viewport.width;
        canvasRef.current.height = viewport.height;

        const context = canvasRef.current.getContext("2d");
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        console.log("PDF rendered successfully");
      }

      // Setup signature canvas with same dimensions
      if (signatureCanvasRef.current) {
        signatureCanvasRef.current.width = viewport.width;
        signatureCanvasRef.current.height = viewport.height;
      }

      setScale(renderScale);
      setPdfLoaded(true);
    } catch (error) {
      console.error("Error rendering PDF:", error);
      toast.error(`Failed to render PDF: ${error.message}`);
    }
  };

  // Handle signature drawing on overlay canvas
  const handleMouseDown = (e) => {
    if (!signatureCanvasRef.current) return;
    setIsDrawing(true);

    const rect = signatureCanvasRef.current.getBoundingClientRect();
    const canvas = signatureCanvasRef.current;

    // Calculate position relative to canvas (accounting for scaling)
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !signatureCanvasRef.current) return;

    const rect = signatureCanvasRef.current.getBoundingClientRect();
    const canvas = signatureCanvasRef.current;

    // Calculate position relative to canvas (accounting for scaling)
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext("2d");
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Handle touch events
  const handleTouchStart = (e) => {
    if (!signatureCanvasRef.current) return;
    e.preventDefault();
    setIsDrawing(true);

    const touch = e.touches[0];
    const rect = signatureCanvasRef.current.getBoundingClientRect();
    const canvas = signatureCanvasRef.current;

    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleTouchMove = (e) => {
    if (!isDrawing || !signatureCanvasRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = signatureCanvasRef.current.getBoundingClientRect();
    const canvas = signatureCanvasRef.current;

    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);

    const ctx = canvas.getContext("2d");
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  // Clear signature
  const clearSignature = async () => {
    if (signatureCanvasRef.current) {
      const ctx = signatureCanvasRef.current.getContext("2d");
      ctx.clearRect(
        0,
        0,
        signatureCanvasRef.current.width,
        signatureCanvasRef.current.height
      );
    }
  };

  // Download signed PDF as image
  const downloadSignedPDF = async () => {
    if (!signatureCanvasRef.current) {
      toast.error("Please sign the PDF first");
      return;
    }

    try {
      let cleanPath = pdfURL.replace(/\\/g, "/");
      const fullURL = cleanPath.startsWith("/")
        ? `${baseURL}${cleanPath}`
        : `${baseURL}/${cleanPath}`;
      console.log("Loading PDF for download from:", fullURL);

      const pdfBytes = await fetch(fullURL).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // Get signature image data from overlay canvas
      const signatureCanvasData =
        signatureCanvasRef.current.toDataURL("image/png");
      const signatureImageBytes = await fetch(signatureCanvasData).then((res) =>
        res.arrayBuffer()
      );
      const signatureImagePng = await pdfDoc.embedPng(signatureImageBytes);

      // Get canvas dimensions
      const canvasWidth = signatureCanvasRef.current.width;
      const canvasHeight = signatureCanvasRef.current.height;

      console.log("PDF dimensions:", { width, height });
      console.log("Canvas dimensions:", { canvasWidth, canvasHeight });

      // Calculate scaling factors from canvas to PDF coordinates
      const scaleX = width / canvasWidth;
      const scaleY = height / canvasHeight;

      // Draw the entire signature overlay directly onto the PDF
      // The signature canvas contains the full PDF, so place it at origin
      firstPage.drawImage(signatureImagePng, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });

      // Save the modified PDF as bytes
      const pdfBytesOutput = await pdfDoc.save();

      // Convert the PDF to an image using pdfjs
      console.log("Converting signed PDF to image for download...");
      const { getDocument } = await import("pdfjs-dist");

      const pdfDoc2 = await getDocument({ data: pdfBytesOutput }).promise;
      const page = await pdfDoc2.getPage(1);

      // Create canvas for rendering PDF as image
      const renderScale = 2;
      const viewport = page.getViewport({ scale: renderScale });

      const renderCanvas = document.createElement("canvas");
      renderCanvas.width = viewport.width;
      renderCanvas.height = viewport.height;

      const context = renderCanvas.getContext("2d");
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // Download the image
      renderCanvas.toBlob(
        (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `CodeOfEthics_Signed_${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("PDF downloaded as image successfully!");
        },
        "image/png",
        1.0
      );
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  // Upload signed PDF as image to backend
  const uploadSignedPDF = async () => {
    if (!signatureCanvasRef.current) {
      toast.error("Please sign the PDF first");
      return;
    }

    setIsUploading(true);
    try {
      let cleanPath = pdfURL.replace(/\\/g, "/");
      const fullURL = cleanPath.startsWith("/")
        ? `${baseURL}${cleanPath}`
        : `${baseURL}/${cleanPath}`;
      console.log("Loading PDF for upload from:", fullURL);

      const pdfBytes = await fetch(fullURL).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // Get signature image data from overlay canvas
      const signatureCanvasData =
        signatureCanvasRef.current.toDataURL("image/png");
      const signatureImageBytes = await fetch(signatureCanvasData).then((res) =>
        res.arrayBuffer()
      );
      const signatureImagePng = await pdfDoc.embedPng(signatureImageBytes);

      // Get canvas dimensions
      const canvasWidth = signatureCanvasRef.current.width;
      const canvasHeight = signatureCanvasRef.current.height;

      console.log("PDF dimensions:", { width, height });
      console.log("Canvas dimensions:", { canvasWidth, canvasHeight });

      // Calculate scaling factors from canvas to PDF coordinates
      const scaleX = width / canvasWidth;
      const scaleY = height / canvasHeight;

      // Draw the entire signature overlay directly onto the PDF
      // The signature canvas contains the full PDF, so place it at origin
      firstPage.drawImage(signatureImagePng, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });

      // Save the modified PDF as bytes
      const pdfBytesOutput = await pdfDoc.save();

      // Convert the PDF to an image using pdfjs
      console.log("Converting signed PDF to image for upload...");
      const { getDocument } = await import("pdfjs-dist");

      const pdfDoc2 = await getDocument({ data: pdfBytesOutput }).promise;
      const page = await pdfDoc2.getPage(1);

      // Create canvas for rendering PDF as image
      const renderScale = 2;
      const viewport = page.getViewport({ scale: renderScale });

      const renderCanvas = document.createElement("canvas");
      renderCanvas.width = viewport.width;
      renderCanvas.height = viewport.height;

      const context = renderCanvas.getContext("2d");
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // Convert canvas to blob and upload
      renderCanvas.toBlob(
        async (blob) => {
          const formData = new FormData();
          formData.append(
            "signedImage",
            blob,
            `CodeOfEthics_Signed_${Date.now()}.png`
          );
          formData.append("applicationId", applicationId);
          formData.append("employeeId", employeeId);
          formData.append("signatureDate", signatureDate);

          try {
            const response = await fetch(
              `${baseURL}/onboarding/upload-signed-pdf`,
              {
                method: "POST",
                body: formData,
              }
            );

            const data = await response.json();

            if (response.ok) {
              toast.success("Signature uploaded successfully!");
              onSignatureUploaded(data.filePath);
            } else {
              toast.error(data.message || "Failed to upload signature");
            }
          } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload signature");
          } finally {
            setIsUploading(false);
          }
        },
        "image/png",
        1.0
      );
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error("Failed to upload PDF");
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* PDF Canvas Container with Overlay */}
      <div
        className="border border-gray-300 rounded-lg bg-gray-50"
        style={{ position: "relative", overflow: "visible" }}
      >
        {pdfLoaded ? (
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              textAlign: "center",
              padding: "20px",
              overflowX: "auto",
            }}
          >
            {/* Main PDF Canvas - Non-interactive display */}
            <canvas
              ref={canvasRef}
              className="bg-white"
              style={{
                display: "block",
                position: "relative",
                margin: "0 auto",
                maxWidth: "100%",
                height: "auto",
              }}
            />

            {/* Signature Overlay Canvas - Interactive drawing surface */}
            <canvas
              ref={signatureCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="cursor-crosshair"
              style={{
                display: "block",
                position: "absolute",
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                opacity: 0.7,
                backgroundColor: "rgba(100, 150, 255, 0.05)",
                maxWidth: "100%",
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700 mb-2">
          <strong>Instructions:</strong> Sign directly on the PDF using your
          mouse or touch. The signature will be added to the PDF when you upload
          it.
        </p>
      </div>

      {/* Date Input */}
      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700">Signature Date:</label>
        <input
          type="date"
          value={signatureDate}
          onChange={(e) => setSignatureDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={clearSignature}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear Signature
        </button>

        <button
          onClick={downloadSignedPDF}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>

        <button
          onClick={uploadSignedPDF}
          disabled={isUploading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {isUploading ? "Uploading..." : "Upload Signed PDF"}
        </button>
      </div>
    </div>
  );
};

export default PDFSignaturePad;
