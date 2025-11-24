import React, { useEffect, useRef, useState } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import VecIcon from "../../assets/VecIcon.png";
import { TrashIcon, UploadIcon } from "../../assets/Svgs/AllSvgs";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Cookies from "js-cookie";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import { toast } from "react-toastify";
import { CircleX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from 'react-signature-canvas';
export const ESignature = () => {
    const baseURL = import.meta.env.VITE__BASEURL;
    const navigate = useNavigate();
    const sigCanvasRef = useRef(null);
    const [imageURL, setImageURL] = useState(null);
    const [employeeInfo, setEmployeeInfo] = useState(null);
    const [clientSession, setClientSession] = useState("");
    const getEmployeeInfo = async (token) => {
        const employeeInfo = await axios.get(
            `${baseURL}/employee/get-employee-info`,
            {
                headers: {
                    Authorization: token,
                },
            }
        );

        setEmployeeInfo(employeeInfo.data.employeeInfo);
    };

    const saveSignature = async () => {
        if (sigCanvasRef.current) {
            // Get the signature as a data URL
            const dataURL = sigCanvasRef.current.toDataURL("image/png");

            // Convert data URL to Blob
            const response = await fetch(dataURL);
            const blob = await response.blob();
            const file = new File([blob], "signature.png", { type: "image/png" });

            // Prepare form data for upload
            const formData = new FormData();
            formData.append("signature", file);
            formData.append("employeeId", employeeInfo?._id); // Replace with actual employee ID or fetch it from your state/context

            try {
                // Make POST request to your backend
                const result = await axios.post(
                    `${baseURL}/signature/upload-signature`, // Adjust the endpoint if your baseURL includes it or if it's different
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                // Handle success
                console.log("Signature uploaded successfully:", result.data);
                setImageURL(dataURL); // Optionally update state to show the signature
                alert("Signature uploaded successfully!");
            } catch (error) {
                // Handle error
                console.error("Error uploading signature:", error.response?.data || error.message);
                alert("Failed to upload signature. Please try again.");
            }
        } else {
            alert("No signature canvas found or signature is empty!");
        }
    };

    useEffect(() => {
        const session = Cookies.get("session");
        if (!session) {
            return router("/auth/log-in");
        }
        setClientSession(session);

        getEmployeeInfo(session);
    }, []);

    return (
        <>
            <Layout>
                <div className="w-full h-full">
                    <Navbar />
                    <div className="w-full h-full">
                        <SignatureCanvas
                            ref={sigCanvasRef}
                            penColor="black"
                            canvasProps={{
                                width: 500,
                                height: 200,
                                className: "sigCanvas",
                                style: { backgroundColor: "white" },
                            }}
                        />

                        <button
                            onClick={saveSignature}
                            className="px-4 py-2 bg-blue-500 text-white rounded mt-4"
                        >
                            Save Signature
                        </button>

                        {imageURL && (
                            <div className="mt-4">
                                <h3>Preview:</h3>
                                <img src={imageURL} alt="Signature Preview" style={{ maxWidth: "500px" }} />
                            </div>
                        )}
                    </div>
                </div>
            </Layout>
        </>
    );
};
