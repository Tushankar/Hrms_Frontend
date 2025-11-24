import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle,
  Target,
  Send,
  Calendar,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import SignaturePad from "../../Components/Common/SignaturePad";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const FORM_KEYS = [
  "personalInformation",
  "professionalExperience",
  "workExperience",
  "references",
  "education",
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

const PCAJobDescription = ({
  position,
  employeeSignature,
  signatureDate,
  onSignatureChange,
  onDateChange,
}) => {
  const getPositionTitle = () => {
    switch (position) {
      case "PCA":
        return "Personal Care Assistant (PCA) Job Description";
      case "CNA":
        return "Certified Nursing Assistant (CNA) Job Description";
      case "LPN":
        return "Licensed Practical Nurse (LPN) Job Description";
      case "RN":
        return "Registered Nurse (RN) Job Description";
      default:
        return "Job Description";
    }
  };

  const getPositionContent = () => {
    switch (position) {
      case "PCA":
        return {
          summary:
            "The Personal Care Assistant (PCA) provides non-medical support services to clients in their homes, helping them with activities of daily living (ADLs) to enhance their independence, comfort, and safety. The PCA works under the supervision of a Registered Nurse or designated supervisor.",
          duties: [
            "Assist with personal hygiene including bathing, grooming, dressing, and toileting.",
            "Provide mobility support, including transferring and ambulation.",
            "Assist with meal preparation and feeding if necessary.",
            "Perform light housekeeping tasks such as laundry, dishes, and sweeping.",
            "Offer companionship and emotional support to clients.",
            "Monitor and report changes in client condition to the supervisor.",
            "Comply with infection control protocols and safety procedures.",
            "Maintain client confidentiality and respect client rights.",
            "Accurately document care and services provided each day.",
          ],
          qualifications: [
            "High school diploma or GED.",
            "Completion of a state-approved PCA training program or equivalent.",
            "Current CPR and First Aid certification.",
            "Must pass background checks and health screenings (e.g., TB test).",
            "Reliable, compassionate, and good interpersonal skills.",
          ],
          conditions:
            "PCAs work in client homes and may encounter a variety of living environments. The role requires physical effort including lifting, standing, and assisting with mobility. Flexibility in schedule and travel between clients may be required.",
          reporting:
            "The PCA reports directly to the Supervisory Nurse or designated agency supervisor.",
        };
      case "CNA":
        return {
          summary:
            "The Certified Nursing Assistant (CNA) provides basic nursing care and assistance to patients under the supervision of licensed nursing staff. CNAs help patients with daily living activities and monitor their health status.",
          duties: [
            "Assist patients with bathing, dressing, and personal hygiene.",
            "Help patients with mobility, including transferring and ambulation.",
            "Take and record vital signs such as temperature, blood pressure, and pulse.",
            "Assist with feeding and maintaining nutrition.",
            "Change bed linens and maintain clean patient environments.",
            "Observe and report changes in patient condition to nursing staff.",
            "Provide emotional support and companionship to patients.",
            "Follow infection control and safety protocols.",
            "Document care provided and patient observations.",
          ],
          qualifications: [
            "High school diploma or GED.",
            "Completion of state-approved CNA training program.",
            "Current CNA certification.",
            "Current CPR certification.",
            "Must pass background checks and health screenings.",
            "Strong communication and interpersonal skills.",
          ],
          conditions:
            "CNAs work in various healthcare settings including hospitals, nursing homes, and assisted living facilities. The role involves physical demands such as lifting and assisting patients. Shift work including nights, weekends, and holidays may be required.",
          reporting:
            "The CNA reports to the Charge Nurse or designated licensed nursing staff.",
        };
      case "LPN":
        return {
          summary:
            "The Licensed Practical Nurse (LPN) provides nursing care under the supervision of registered nurses and physicians. LPNs administer medications, monitor patient health, and assist with patient care in various healthcare settings.",
          duties: [
            "Administer medications and treatments as prescribed.",
            "Monitor and record patient vital signs and health status.",
            "Assist with patient assessments and care planning.",
            "Provide wound care and dressing changes.",
            "Insert and maintain IV lines under supervision.",
            "Educate patients and families about health conditions and care.",
            "Collaborate with healthcare team members.",
            "Maintain accurate patient records and documentation.",
            "Follow safety and infection control protocols.",
          ],
          qualifications: [
            "Completion of accredited LPN program.",
            "Current LPN license.",
            "Current CPR and Basic Life Support certification.",
            "Knowledge of nursing procedures and medical terminology.",
            "Strong clinical skills and attention to detail.",
            "Must pass background checks and health screenings.",
          ],
          conditions:
            "LPNs work in hospitals, clinics, long-term care facilities, and home health settings. The role requires standing for long periods, physical stamina, and the ability to work various shifts including nights and weekends.",
          reporting:
            "The LPN reports to the Registered Nurse or physician in charge.",
        };
      case "RN":
        return {
          summary:
            "The Registered Nurse (RN) provides comprehensive nursing care, coordinates patient care plans, and supervises nursing staff. RNs assess patient needs, administer treatments, and ensure high-quality healthcare delivery.",
          duties: [
            "Assess patient health conditions and develop care plans.",
            "Administer medications, treatments, and IV therapy.",
            "Monitor patient progress and adjust care plans as needed.",
            "Educate patients and families about health conditions and treatments.",
            "Coordinate with physicians and healthcare team members.",
            "Supervise and delegate tasks to nursing assistants and LPNs.",
            "Maintain accurate patient records and documentation.",
            "Ensure compliance with healthcare regulations and standards.",
            "Provide emergency care and respond to patient needs.",
          ],
          qualifications: [
            "Bachelor's or Associate degree in Nursing.",
            "Current RN license.",
            "Current CPR and Advanced Cardiac Life Support certification.",
            "Clinical experience in relevant specialty areas preferred.",
            "Strong critical thinking and decision-making skills.",
            "Must pass background checks and health screenings.",
          ],
          conditions:
            "RNs work in hospitals, clinics, emergency rooms, and specialty care units. The role involves high-stress situations, long hours, and shift work including nights, weekends, and holidays. Physical stamina and emotional resilience are required.",
          reporting:
            "The RN reports to the Nurse Manager or Director of Nursing.",
        };
      default:
        return {
          summary: "",
          duties: [],
          qualifications: [],
          conditions: "",
          reporting: "",
        };
    }
  };

  const content = getPositionContent();

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white">
        {/* Header */}
        <div className="border-b-4 border-blue-900 pb-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <img
              src="https://www.pacifichealthsystems.net/wp-content/themes/pacifichealth/images/logo.png"
              alt="Pacific Health Systems"
              className="h-24"
            />
          </div>
          <h1 className="text-center text-sm text-gray-700 font-semibold">
            {getPositionTitle()}
          </h1>
        </div>

        {/* Position Summary */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-blue-900 mb-3">
            Position Summary
          </h2>
          <p className="text-sm text-gray-800 leading-relaxed">
            {content.summary}
          </p>
        </div>

        {/* Duties and Responsibilities */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-blue-900 mb-3">
            Duties and Responsibilities
          </h2>
          <p className="text-sm text-gray-800 mb-3">
            The {position} is responsible for performing the following tasks:
          </p>
          <ul className="space-y-2 ml-6">
            {content.duties.map((duty, index) => (
              <li
                key={index}
                className="text-sm text-gray-800 leading-relaxed flex"
              >
                <span className="mr-3">-</span>
                <span>{duty}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Qualifications */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-blue-900 mb-3">
            Qualifications
          </h2>
          <ul className="space-y-2 ml-6">
            {content.qualifications.map((qual, index) => (
              <li
                key={index}
                className="text-sm text-gray-800 leading-relaxed flex"
              >
                <span className="mr-3">-</span>
                <span>{qual}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Working Conditions */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-blue-900 mb-3">
            Working Conditions
          </h2>
          <p className="text-sm text-gray-800 leading-relaxed">
            {content.conditions}
          </p>
        </div>

        {/* Reporting */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-900 mb-3">Reporting</h2>
          <p className="text-sm text-gray-800 leading-relaxed">
            {content.reporting}
          </p>
        </div>

        {/* Signature Section */}
        <div className="border-t-2 border-gray-900 pt-8 mt-12">
          <div className="max-w-md">
            <div className="pb-2 mb-8">
              <label className="text-xs text-gray-800 font-medium mb-2 block">
                Employee Signature
              </label>
              <input
                type="text"
                value={employeeSignature}
                onChange={(e) =>
                  onSignatureChange && onSignatureChange(e.target.value)
                }
                placeholder="Type your full name"
                className="w-full border-b border-gray-900 pb-1 bg-transparent focus:outline-none focus:ring-0 px-0"
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  fontSize: "28px",
                  fontWeight: "400",
                  letterSpacing: "0.5px",
                }}
              />
            </div>
            <div className="pb-2">
              <label className="text-xs text-gray-800 font-medium mb-2 block">
                Date
              </label>
              <input
                type="date"
                value={signatureDate}
                onChange={(e) => onDateChange && onDateChange(e.target.value)}
                className="border-b border-gray-900 pb-1 bg-transparent focus:outline-none focus:ring-0 px-0 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PersonalCareAssistantJD = () => {
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [positionType, setPositionType] = useState("");
  const [applicationId, setApplicationId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeSignature, setEmployeeSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState("");
  const [savedSignatureUrl, setSavedSignatureUrl] = useState("");
  const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0 });
  const [hasSavedSignatureAdded, setHasSavedSignatureAdded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const baseURL = import.meta.env.VITE__BASEURL;

  // Helper to build normalized full URL
  const buildFullUrl = (relativePath) => {
    if (!relativePath) return "";
    const base = (baseURL || "").replace(/\/+$/, "");
    const rel = relativePath.replace(/^\/+/, "");
    return `${base}/${rel}`;
  };

  const viewerRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(800);
  const overlaySigPad = useRef(null);
  const overlayContainerRef = useRef(null);
  const [showSignOnDoc, setShowSignOnDoc] = useState(false);
  const [overlayPageNumber, setOverlayPageNumber] = useState(1);
  const [overlayPageImage, setOverlayPageImage] = useState(null);
  const [overlayDims, setOverlayDims] = useState({ width: 0, height: 0 });
  // Overlay text state (user can add text to be placed on the signed document)
  const [overlayText, setOverlayText] = useState("");
  const [overlayTextPosition, setOverlayTextPosition] = useState({
    x: 20,
    y: 40,
  });
  const [isPlacingText, setIsPlacingText] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [textDragOffset, setTextDragOffset] = useState({ x: 0, y: 0 });

  // Configure pdfjs worker
  useEffect(() => {
    try {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).href;
    } catch (err) {
      console.warn("Failed to set local pdf.worker, falling back to CDN:", err);
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (viewerRef.current) setPageWidth(viewerRef.current.offsetWidth - 16);
      else setPageWidth(Math.min(window.innerWidth - 64, 1000));
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [viewerRef.current]);

  useEffect(() => {
    checkSubmission();
  }, []);

  // Set default date to today
  useEffect(() => {
    if (!signatureDate) {
      const today = new Date().toISOString().split("T")[0];
      setSignatureDate(today);
    }
  }, []);

  useEffect(() => {
    if (positionType) {
      fetchTemplate(positionType);
    }
  }, [positionType]);

  const fetchTemplate = async (position) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-job-description-template/${position}`,
        { withCredentials: true }
      );
      setTemplate(response.data.template);
    } catch (error) {
      console.error("Error fetching template:", error);
      toast.error(`No ${position} template available`);
      setTemplate(null);
    } finally {
      setLoading(false);
    }
  };

  const checkSubmission = async () => {
    try {
      const userToken = Cookies.get("session");
      const decodedToken = userToken && jwtDecode(userToken);
      const user = decodedToken?.user;

      if (user?._id) {
        setEmployeeId(user._id);
        // Try to get signature from JWT token first
        if (user?.signatureImage) {
          // Check if it's already a full URL or just a relative path
          let signaturePath = user.signatureImage;
          if (signaturePath.startsWith("http")) {
            // It's already a full URL, use it directly
            setSavedSignatureUrl(signaturePath);
          } else {
            // It's a relative path, build full URL
            setSavedSignatureUrl(buildFullUrl(signaturePath));
          }
        } else {
          // If not in JWT, try to fetch from backend
          try {
            const profileResponse = await axios.get(
              `${baseURL}/onboarding/get-employee-profile/${user._id}`,
              { withCredentials: true }
            );
            if (profileResponse.data?.employee?.signatureImage) {
              let signaturePath = profileResponse.data.employee.signatureImage;
              if (signaturePath.startsWith("http")) {
                // It's already a full URL, use it directly
                setSavedSignatureUrl(signaturePath);
              } else {
                // It's a relative path, build full URL
                setSavedSignatureUrl(buildFullUrl(signaturePath));
              }
            }
          } catch (profileError) {
            console.warn(
              "Could not load signature from profile:",
              profileError
            );
          }
        }
        const appResponse = await axios.get(
          `${baseURL}/onboarding/get-application/${user._id}`,
          { withCredentials: true }
        );

        const appId = appResponse.data?.data?.application?._id;
        setApplicationId(appId);

        const savedPosition =
          appResponse.data?.data?.forms?.positionType?.positionAppliedFor;
        if (savedPosition) {
          setPositionType(savedPosition);
        }

        if (appResponse.data?.data) {
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
      }
    } catch (error) {
      console.error("Error checking submission:", error);
    }
  };

  // Load saved signature and date when position type changes
  useEffect(() => {
    if (positionType && applicationId && employeeId) {
      loadSignatureAndDate();
    }
  }, [positionType, applicationId, employeeId]);

  // Handle mouse events for dragging saved signature
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && hasSavedSignatureAdded) {
        // Find the overlay div containing the canvas and img
        const overlayContainer = overlayContainerRef.current?.querySelector(
          "[style*='position: absolute']"
        );
        const containerRect = overlayContainer?.getBoundingClientRect();
        if (containerRect) {
          const newX = e.clientX - containerRect.left - dragOffset.x;
          const newY = e.clientY - containerRect.top - dragOffset.y;
          // Constrain to container bounds (accounting for img size)
          const constrainedX = Math.max(
            0,
            Math.min(newX, containerRect.width - 200)
          );
          const constrainedY = Math.max(
            0,
            Math.min(newY, containerRect.height - 100)
          );
          setSignaturePosition({ x: constrainedX, y: constrainedY });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, hasSavedSignatureAdded, dragOffset]);

  // Handle dragging for overlay text
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingText) {
        const overlayContainer = overlayContainerRef.current?.querySelector(
          "[style*='position: absolute']"
        );
        const containerRect = overlayContainer?.getBoundingClientRect();
        if (containerRect) {
          const newX = e.clientX - containerRect.left - textDragOffset.x;
          const newY = e.clientY - containerRect.top - textDragOffset.y;
          const constrainedX = Math.max(
            0,
            Math.min(newX, containerRect.width - 20)
          );
          const constrainedY = Math.max(
            0,
            Math.min(newY, containerRect.height - 10)
          );
          setOverlayTextPosition({ x: constrainedX, y: constrainedY });
        }
      }
    };

    const handleMouseUp = () => setIsDraggingText(false);

    if (isDraggingText) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingText, textDragOffset]);

  const loadSignatureAndDate = async () => {
    try {
      console.log("Loading signature and date for position:", positionType);
      const response = await axios.get(
        `${baseURL}/onboarding/job-description/${applicationId}/${positionType}`,
        { withCredentials: true }
      );

      console.log("Job description response:", response.data);

      if (response.data?.data) {
        const jobDescData = response.data.data;
        if (jobDescData.employeeSignature) {
          console.log(
            "Loading saved signature:",
            jobDescData.employeeSignature
          );
          setEmployeeSignature(jobDescData.employeeSignature);
        }
        if (jobDescData.signatureDate) {
          console.log("Loading saved date:", jobDescData.signatureDate);
          setSignatureDate(jobDescData.signatureDate);
        }
      }
    } catch (error) {
      console.error("Error loading signature and date:", error);
    }
  };

  // Function to use saved signature from PersonalDetails
  const useSavedSignature = async () => {
    try {
      const userToken = Cookies.get("session");
      const decodedToken = userToken && jwtDecode(userToken);
      const user = decodedToken?.user;

      if (user && user.signatureImage) {
        // Check if it's already a full URL or just a relative path
        let signaturePath = user.signatureImage;
        if (signaturePath.startsWith("http")) {
          // It's already a full URL, use it directly
          setEmployeeSignature(signaturePath);
        } else {
          // It's a relative path, ensure it doesn't start with slash for SignaturePad
          if (signaturePath.startsWith("/")) {
            signaturePath = signaturePath.substring(1);
          }
          setEmployeeSignature(signaturePath);
        }
        toast.success("Saved signature loaded successfully!");
      } else {
        toast.error(
          "No saved signature found in your profile. Please add one in Personal Details first."
        );
      }
    } catch (error) {
      console.error("Error loading saved signature:", error);
      toast.error("Failed to load saved signature");
    }
  };

  // Open sign-on-document modal and prepare preview image from rendered PDF page
  const openSignOnDocument = async (pageNum = 1) => {
    try {
      // Try to find the page canvas for a short period to handle react-pdf async render
      let pageCanvas = null;
      const maxAttempts = 6;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const canvases = viewerRef.current?.querySelectorAll("canvas");
        pageCanvas = canvases ? canvases[pageNum - 1] : null;
        if (pageCanvas) break;
        // wait 200ms before retrying
        await new Promise((res) => setTimeout(res, 200));
      }

      if (!pageCanvas) {
        toast.error(
          "PDF viewer not ready — please wait a moment and try again"
        );
        return;
      }

      // Prepare preview image and overlay dimensions
      try {
        const imageData = pageCanvas.toDataURL("image/png");
        setOverlayPageImage(imageData);
        setOverlayDims({ width: pageCanvas.width, height: pageCanvas.height });
        setOverlayPageNumber(pageNum);
        setShowSignOnDoc(true);

        // Clear signature pad shortly after modal opens so it has the right size
        setTimeout(() => {
          if (overlaySigPad.current) overlaySigPad.current.clear();
        }, 80);
      } catch (err) {
        console.error("Error preparing overlay image:", err);
        toast.error("Failed to prepare page for signing");
      }
    } catch (err) {
      console.error("Error in openSignOnDocument:", err);
      toast.error("Failed to open sign dialog");
    }
  };

  // Function to add saved signature to the overlay canvas
  const addSavedSignatureToCanvas = async () => {
    console.log("addSavedSignatureToCanvas called");
    console.log("savedSignatureUrl:", savedSignatureUrl);
    console.log("hasSavedSignatureAdded:", hasSavedSignatureAdded);

    if (!savedSignatureUrl) {
      console.log("No savedSignatureUrl found, attempting to reload...");
      // Try to reload signature from session token
      try {
        const userToken = Cookies.get("session");
        const decodedToken = userToken && jwtDecode(userToken);
        const user = decodedToken?.user;
        if (user?.signatureImage) {
          let signaturePath = user.signatureImage;
          if (signaturePath.startsWith("http")) {
            setSavedSignatureUrl(signaturePath);
          } else {
            setSavedSignatureUrl(buildFullUrl(signaturePath));
          }
          // Wait a bit for state to update
          setTimeout(() => {
            const overlayContainer = overlayContainerRef.current?.querySelector(
              "[style*='position: absolute']"
            );
            const containerRect = overlayContainer?.getBoundingClientRect();
            if (containerRect) {
              const defaultX = containerRect.width - 250;
              const defaultY = containerRect.height - 150;
              setSignaturePosition({ x: defaultX, y: defaultY });
              setHasSavedSignatureAdded(true);
              toast.success(
                "Saved signature added to document - drag to position it"
              );
            }
          }, 100);
        } else {
          toast.error(
            "No saved signature found. Please add one in Personal Details first."
          );
        }
      } catch (error) {
        console.error("Error reloading signature:", error);
        toast.error(
          "No saved signature found in your profile. Please add one in Personal Details first."
        );
      }
      return;
    }

    // Set default position for the draggable signature relative to the overlay container
    const overlayContainer = overlayContainerRef.current?.querySelector(
      "[style*='position: absolute']"
    );
    const containerRect = overlayContainer?.getBoundingClientRect();
    if (containerRect) {
      const defaultX = containerRect.width - 250; // 200px width + 50px margin from right
      const defaultY = containerRect.height - 150; // 100px height + 50px margin from bottom
      setSignaturePosition({ x: defaultX, y: defaultY });
      setHasSavedSignatureAdded(true);
      toast.success("Saved signature added to document - drag to position it");
    }
  };

  // Handler to place overlay text where user clicks when in placing mode
  const handleOverlayClickToPlaceText = (e) => {
    if (!isPlacingText) return;
    const overlayContainer = overlayContainerRef.current?.querySelector(
      "[style*='position: absolute']"
    );
    const containerRect = overlayContainer?.getBoundingClientRect();
    if (!containerRect) return;
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    // Constrain within container
    const constrainedX = Math.max(0, Math.min(x, containerRect.width - 10));
    const constrainedY = Math.max(0, Math.min(y, containerRect.height - 10));
    setOverlayTextPosition({ x: constrainedX, y: constrainedY });
    setIsPlacingText(false);
    toast.success("Text placed on document");
  };

  // Set text position to bottom when modal opens or dims change
  useEffect(() => {
    if (showSignOnDoc && overlayDims.height > 0) {
      setOverlayTextPosition({ x: 20, y: overlayDims.height - 60 });
    }
  }, [showSignOnDoc, overlayDims.height]);
  const handlePositionChange = async (value) => {
    setPositionType(value);

    if (applicationId && employeeId) {
      try {
        await axios.post(
          `${baseURL}/onboarding/position-type/save`,
          {
            positionAppliedFor: value,
            employeeId,
            applicationId,
            status: "completed",
          },
          { withCredentials: true }
        );

        window.dispatchEvent(new CustomEvent("positionTypeSaved"));
        toast.success(`Position type set to ${value}`);
      } catch (error) {
        console.error("Error saving position type:", error);
        toast.error("Failed to save position type");
      }
    }
  };

  const handleDownload = () => {
    if (template) {
      window.open(`${baseURL}/${template.filePath}`, "_blank");
    }
  };

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

  const saveOverlaySignature = async () => {
    try {
      if (!overlaySigPad.current) {
        toast.error("Signature pad not available");
        return;
      }

      // Get the rendered page canvas from the viewer
      const canvases = viewerRef.current?.querySelectorAll("canvas");
      const pageCanvas = canvases ? canvases[overlayPageNumber - 1] : null;
      if (!pageCanvas) {
        toast.error("Could not find PDF page to sign");
        return;
      }

      const sigDataUrl = overlaySigPad.current.toDataURL("image/png");

      // If we have a draggable signature, draw it on the canvas first
      let finalSigDataUrl = sigDataUrl;
      if (hasSavedSignatureAdded && savedSignatureUrl) {
        const canvas = overlaySigPad.current.getCanvas();
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = savedSignatureUrl;
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.drawImage(
              img,
              signaturePosition.x,
              signaturePosition.y,
              200,
              100
            );
            finalSigDataUrl = overlaySigPad.current.toDataURL("image/png");
            resolve();
          };
        });
      } else if (overlaySigPad.current.isEmpty()) {
        toast.error("Please draw a signature on the document before saving");
        return;
      }

      // Create offscreen canvas matching page canvas pixels
      const out = document.createElement("canvas");
      out.width = pageCanvas.width;
      out.height = pageCanvas.height;
      const ctx = out.getContext("2d");
      ctx.drawImage(pageCanvas, 0, 0);

      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = finalSigDataUrl;
      });

      const sigImg = new Image();
      sigImg.src = finalSigDataUrl;
      await new Promise((resolve, reject) => {
        sigImg.onload = () => {
          ctx.drawImage(sigImg, 0, 0, out.width, out.height);
          // If user added overlay text, draw it onto the final canvas
          try {
            if (overlayText) {
              ctx.save();
              // Choose a reasonable font size relative to canvas width
              const fontSize = 18; // fixed size; adjust as needed
              ctx.font = `${fontSize}px sans-serif`;
              ctx.fillStyle = "#000";
              ctx.textBaseline = "top";
              const lines = overlayText.split("\n");
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const x = overlayTextPosition?.x || 20;
                const y = (overlayTextPosition?.y || 40) + i * (fontSize + 4);
                ctx.fillText(line, x, y);
              }
              ctx.restore();
            }
          } catch (err) {
            console.warn("Failed to draw overlay text on final image:", err);
          }
          resolve();
        };
        sigImg.onerror = reject;
      });

      const combined = out.toDataURL("image/png");
      const file = dataURLtoFile(
        combined,
        `job-description-signed-${Date.now()}.png`
      );

      // Upload to generic signature upload route which accepts images
      const fd = new FormData();
      fd.append("signature", file);

      const toastId = toast.loading("Uploading signed image...");

      const uploadResp = await fetch(`${baseURL}/upload/signature`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      toast.dismiss(toastId);

      if (!uploadResp.ok) {
        const txt = await uploadResp.text();
        console.error("Upload failed:", txt);
        toast.error("Failed to upload signature image");
        return;
      }

      const uploadResult = await uploadResp.json();
      const uploadedPath = uploadResult.filePath;

      if (uploadedPath) {
        const url = uploadedPath.startsWith("http")
          ? uploadedPath
          : `${baseURL}/${uploadedPath.replace(/^\//, "")}`;
        setEmployeeSignature(url);

        const today = new Date().toISOString().split("T")[0];
        setSignatureDate(today);

        // Save the signature to the backend with position-based storage
        const saveSigToastId = toast.loading(
          "Saving signature for position..."
        );
        try {
          const saveResp = await axios.post(
            `${baseURL}/onboarding/job-description/save-signature`,
            {
              applicationId,
              employeeId,
              positionType,
              signatureImage: url,
              signatureDate: today,
            },
            { withCredentials: true }
          );

          toast.dismiss(saveSigToastId);

          if (saveResp.data.success) {
            console.log(
              "✅ Signature saved successfully for position:",
              positionType
            );
            toast.success(
              `Signature saved successfully for ${positionType} position`
            );
            window.dispatchEvent(new Event("formStatusUpdated"));
          }
        } catch (saveError) {
          toast.dismiss(saveSigToastId);
          console.error("Error saving signature to backend:", saveError);
          toast.warning("Signature uploaded but failed to save metadata");
        }
      } else {
        toast.success("Signed image uploaded");
      }

      setShowSignOnDoc(false);
    } catch (err) {
      console.error("Error saving overlay signature:", err);
      toast.error("Failed to save signature on document");
    }
  };

  return (
    <Layout>
      <Navbar />
      {/* Add cursive signature fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&family=Dancing+Script:wght@400;700&family=Pacifico&display=swap"
        rel="stylesheet"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate("/employee/task-management")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8">
          {/* Status Banner */}
          {!loading && positionType && (
            <div className="mb-6 p-4 rounded-lg border bg-green-50 border-green-200">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-base font-semibold text-green-800">
                    ✅ Progress Updated - Form Completed Successfully
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Job Description
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Select your position and complete the job description form
            </p>
          </div>

          <div className="mb-6 border border-blue-200 rounded-lg p-4 sm:p-6 bg-blue-50">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">
              Position Applied For *
            </label>
            <select
              value={positionType}
              onChange={(e) => handlePositionChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Position</option>
              <option value="PCA">Personal Care Assistant (PCA)</option>
              <option value="CNA">Certified Nursing Assistant (CNA)</option>
              <option value="LPN">Licensed Practical Nurse (LPN)</option>
              <option value="RN">Registered Nurse (RN)</option>
            </select>
            {positionType && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs sm:text-sm font-medium text-green-800">
                    Position set to: {positionType}
                  </span>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {positionType && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                        📋 Instructions
                      </h3>
                      <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                        <li className="flex gap-2 sm:gap-3">
                          <span className="font-bold text-blue-600 flex-shrink-0">
                            1.
                          </span>
                          <span>
                            View the {positionType} Job Description template
                            below
                          </span>
                        </li>
                        <li className="flex gap-2 sm:gap-3">
                          <span className="font-bold text-blue-600 flex-shrink-0">
                            2.
                          </span>
                          <span>Review the document carefully</span>
                        </li>
                        <li className="flex gap-2 sm:gap-3">
                          <span className="font-bold text-blue-600 flex-shrink-0">
                            3.
                          </span>
                          <span>
                            Click "Save & Next" to proceed to the next form
                          </span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {positionType && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 space-y-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                      Step 1: View Template
                    </h2>
                    {template ? (
                      <div className="space-y-4">
                        {["PCA", "CNA", "LPN", "RN"].includes(positionType) ? (
                          <div className="w-full bg-white border border-gray-200 rounded-lg p-4">
                            <PCAJobDescription
                              position={positionType}
                              employeeSignature={employeeSignature}
                              signatureDate={signatureDate}
                              onSignatureChange={setEmployeeSignature}
                              onDateChange={setSignatureDate}
                            />
                          </div>
                        ) : (
                          <div
                            ref={viewerRef}
                            className="w-full h-[400px] sm:h-[500px] md:h-[650px] bg-white border border-gray-200 rounded-lg overflow-auto p-2 sm:p-4"
                          >
                            <Document
                              file={`${baseURL}/${template.filePath}`}
                              onLoadSuccess={({ numPages }) =>
                                setNumPages(numPages)
                              }
                              onLoadError={(err) =>
                                console.error("Error loading PDF:", err)
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
                          </div>
                        )}

                        {!["PCA", "CNA", "LPN", "RN"].includes(
                          positionType
                        ) && (
                          <button
                            type="button"
                            onClick={() => openSignOnDocument(1)}
                            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                          >
                            Sign on Document
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        No template available yet. Please contact HR.
                      </p>
                    )}
                  </div>
                </div>
              )}

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
                  📝 Current:{" "}
                  {positionType
                    ? `${positionType} Job Description`
                    : "Job Description"}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                  <button
                    type="button"
                    onClick={() => navigate("/employee/legal-disclosures")}
                    className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                  >
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

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        // Validate signature and date
                        if (!employeeSignature || !employeeSignature.trim()) {
                          toast.error(
                            "Please provide your signature before proceeding"
                          );
                          return;
                        }

                        if (!signatureDate) {
                          toast.error(
                            "Please provide a date before proceeding"
                          );
                          return;
                        }

                        // Mark as completed since position is selected and user is ready to proceed
                        const status = positionType ? "completed" : "draft";

                        console.log(
                          "Saving job description with status:",
                          status
                        );
                        console.log("Application ID:", applicationId);
                        console.log("Employee ID:", employeeId);
                        console.log("Position Type:", positionType);
                        console.log("Signature:", employeeSignature);
                        console.log("Date:", signatureDate);

                        // Save signature with the position type
                        await axios.post(
                          `${baseURL}/onboarding/save-position-signature`,
                          {
                            applicationId,
                            employeeId,
                            positionType,
                            signatureImage: employeeSignature,
                            signatureDate,
                          },
                          { withCredentials: true }
                        );

                        // Also save the status
                        await axios.post(
                          `${baseURL}/onboarding/job-description/save-status`,
                          {
                            applicationId,
                            employeeId,
                            positionType,
                            status,
                          },
                          { withCredentials: true }
                        );

                        console.log("Status saved successfully");
                        window.dispatchEvent(new Event("formStatusUpdated"));
                        toast.success(
                          `Job Description signed successfully for ${positionType} position`
                        );

                        // Fetch the saved signature and date to verify
                        try {
                          const fetchResp = await axios.get(
                            `${baseURL}/onboarding/job-description/${applicationId}/${positionType}`,
                            { withCredentials: true }
                          );

                          if (fetchResp.data?.data) {
                            const savedData = fetchResp.data.data;
                            console.log(
                              "✅ Fetched saved signature:",
                              savedData.employeeSignature
                            );
                            console.log(
                              "✅ Fetched saved date:",
                              savedData.signatureDate
                            );

                            // Update state with fetched data
                            if (savedData.employeeSignature) {
                              setEmployeeSignature(savedData.employeeSignature);
                            }
                            if (savedData.signatureDate) {
                              setSignatureDate(savedData.signatureDate);
                            }
                          }
                        } catch (fetchError) {
                          console.warn(
                            "Could not fetch saved data, but submission succeeded:",
                            fetchError
                          );
                        }

                        // Small delay to ensure event is processed before navigation
                        await new Promise((resolve) =>
                          setTimeout(resolve, 100)
                        );

                        navigate("/employee/code-of-ethics");
                      } catch (error) {
                        console.error("Error in Save & Next:", error);
                        toast.error("Failed to save and proceed");
                      }
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <Send className="w-5 h-5" />
                    <span className="text-sm sm:text-base">Save & Next</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster position="top-right" />
      {showSignOnDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                Sign Document (Page {overlayPageNumber})
              </h3>
              <button
                onClick={() => setShowSignOnDoc(false)}
                className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>

            <div className="px-4 py-2 bg-blue-50 border-b">
              <span className="text-sm font-medium text-gray-700">
                {hasSavedSignatureAdded
                  ? "Drag the signature to position it on the document"
                  : "Add your saved signature to the document or draw directly"}
              </span>
            </div>

            <div
              ref={overlayContainerRef}
              className="relative overflow-auto flex-1 bg-gray-100"
              onClick={handleOverlayClickToPlaceText}
            >
              <div className="flex justify-center p-4">
                {overlayPageImage ? (
                  <div className="relative">
                    <img
                      src={overlayPageImage}
                      alt={`page-${overlayPageNumber}`}
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <SignatureCanvas
                        ref={overlaySigPad}
                        canvasProps={{
                          width: overlayDims.width || 1000,
                          height: overlayDims.height || 1200,
                          className: "w-full h-full",
                          style: {
                            background: "transparent",
                            cursor: "crosshair",
                          },
                        }}
                      />

                      {/* Draggable signature image - positioned within the same overlay as the canvas */}
                      {hasSavedSignatureAdded && savedSignatureUrl && (
                        <img
                          src={savedSignatureUrl}
                          alt="Draggable Signature"
                          style={{
                            position: "absolute",
                            left: signaturePosition.x,
                            top: signaturePosition.y,
                            width: "200px",
                            height: "100px",
                            cursor: isDragging ? "grabbing" : "grab",
                            zIndex: 10,
                            pointerEvents: "auto",
                            userSelect: "none",
                          }}
                          onMouseDown={(e) => {
                            setIsDragging(true);
                            const overlayRect =
                              e.currentTarget.parentElement.getBoundingClientRect();
                            setDragOffset({
                              x:
                                e.clientX -
                                overlayRect.left -
                                signaturePosition.x,
                              y:
                                e.clientY -
                                overlayRect.top -
                                signaturePosition.y,
                            });
                            e.preventDefault();
                          }}
                          onError={(e) => {
                            console.error(
                              "Failed to load signature image:",
                              savedSignatureUrl
                            );
                            toast.error("Failed to load signature image");
                          }}
                          draggable={false}
                        />
                      )}

                      {/* Overlay text - placed and draggable */}
                      {overlayText && (
                        <div
                          style={{
                            position: "absolute",
                            left: overlayTextPosition.x,
                            top: overlayTextPosition.y,
                            cursor: isDraggingText ? "grabbing" : "grab",
                            zIndex: 11,
                            pointerEvents: "auto",
                            userSelect: "none",
                            background: "transparent",
                          }}
                          onMouseDown={(e) => {
                            setIsDraggingText(true);
                            const overlayRect =
                              e.currentTarget.parentElement.getBoundingClientRect();
                            setTextDragOffset({
                              x:
                                e.clientX -
                                overlayRect.left -
                                overlayTextPosition.x,
                              y:
                                e.clientY -
                                overlayRect.top -
                                overlayTextPosition.y,
                            });
                            e.preventDefault();
                          }}
                        >
                          <span
                            style={{
                              color: "#000",
                              fontSize: 18,
                              fontWeight: 600,
                              whiteSpace: "pre",
                            }}
                          >
                            {overlayText}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-gray-600">Preparing preview...</div>
                )}
              </div>
            </div>

            <div className="p-3 border-t bg-white">
              <div className="mb-2">
                <span className="text-sm font-medium">
                  {hasSavedSignatureAdded
                    ? "Drag the signature to position it on the document"
                    : "Add your saved signature to the document"}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Text to add"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  className="px-2 py-1 border rounded-md text-sm w-full"
                />
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => {
                      if (!overlayText) {
                        toast.error(
                          "Enter text before placing it on the document"
                        );
                        return;
                      }
                      setIsPlacingText(true);
                      toast(
                        "Click anywhere on the document preview to place the text",
                        { duration: 3000 }
                      );
                    }}
                    className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Place Text
                  </button>
                  <button
                    onClick={() => {
                      setOverlayText("");
                      setOverlayTextPosition({ x: 20, y: 40 });
                      setIsPlacingText(false);
                      setIsDraggingText(false);
                    }}
                    className="px-3 py-1.5 text-sm bg-yellow-200 rounded-md hover:bg-yellow-300"
                  >
                    Clear Text
                  </button>
                  <button
                    onClick={addSavedSignatureToCanvas}
                    className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Add Saved Signature
                  </button>
                  <button
                    onClick={() => {
                      if (overlaySigPad.current) overlaySigPad.current.clear();
                      setSignaturePosition({ x: 0, y: 0 });
                      setHasSavedSignatureAdded(false);
                      setIsDragging(false);
                    }}
                    className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Clear Signature
                  </button>
                  <button
                    onClick={saveOverlaySignature}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save Signed Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PersonalCareAssistantJD;
