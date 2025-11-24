// import React, { useEffect, useRef, useState } from "react";
// import { Layout } from "../../Components/Common/layout/Layout";
// import Navbar from "../../Components/Common/Navbar/Navbar";
// import Cookies from "js-cookie";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";

// export const EmployeeChat = () => {
//     const baseURL = import.meta.env.VITE__BASEURL;
//     const navigate = useNavigate();
//     const [employeeInfo, setEmployeeInfo] = useState(null);
//     const [clientSession, setClientSession] = useState("");
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState("");
//     const socketRef = useRef(null);

//     // Fetch Employee Info
//     const getEmployeeInfo = async (token) => {
//         try {
//             const res = await axios.get(`${baseURL}/employee/get-employee-info`, {
//                 headers: { Authorization: token },
//             });
//             setEmployeeInfo(res.data.employeeInfo);
//         } catch (error) {
//             console.error("Error fetching employee info:", error);
//         }
//     };

//     useEffect(() => {
//         const session = Cookies.get("session");
//         if (!session) {
//             navigate("/auth/log-in");
//             return;
//         }
//         setClientSession(session);
//         getEmployeeInfo(session);
//     }, []);

//     const userId = employeeInfo?._id;
//     const receiverId = "67da67a7353fa4d0b6d28517";

//     useEffect(() => {
//         if (!userId) return;

//         // Fetch initial chat history
//         axios
//             .get(`${baseURL}/chat/${userId}/${receiverId}`)
//             .then((res) => setMessages(res.data))
//             .catch((err) => console.error("Error fetching messages:", err));

//         // WebSocket connection
//         if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
//             const ws = new WebSocket("ws://localhost:5000");

//             ws.onopen = () => {
//                 console.log("WebSocket connected");
//                 ws.send(JSON.stringify({ event: "login", userId }));
//             };

//             ws.onmessage = (event) => {
//                 const message = JSON.parse(event.data);
//                 // Only add if the message is related to this chat (senderId or receiverId matches)
//                 if (message.sender === userId || message.receiver === userId || message.receiver === receiverId) {
//                     setMessages((prev) => {
//                         // Avoid duplicates by checking if message already exists
//                         if (!prev.some((msg) => msg._id === message._id)) {
//                             return [...prev, message];
//                         }
//                         return prev;
//                     });
//                 }
//             };

//             ws.onerror = (error) => {
//                 console.error("WebSocket Error:", error);
//             };

//             ws.onclose = () => {
//                 console.log("WebSocket Disconnected");
//             };

//             socketRef.current = ws;
//         }

//         return () => {
//             if (socketRef.current) {
//                 socketRef.current.close();
//             }
//         };
//     }, [userId, receiverId]);

//     const sendMessage = () => {
//         if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && newMessage.trim()) {
//             const messageData = {
//                 event: "message",
//                 senderId: userId,
//                 receiverId,
//                 content: newMessage,
//             };
    
//             socketRef.current.send(JSON.stringify(messageData));
//             setNewMessage(""); // Clear input field
//         } else {
//             console.error("WebSocket is not open or user ID is missing");
//         }
//     };

//     return (
//         <Layout>
//             <div className="w-full h-full">
//                 <Navbar />
//                 <div className="p-4">
//                     <h2>Chat with {receiverId}</h2>
//                     <div className="border p-4 h-80 overflow-y-auto bg-gray-100 rounded">
//                         {messages.map((msg, index) => (
//                             <p key={index} className="mb-2">
//                                 <strong>{msg.sender === userId ? "You" : "HR"}:</strong> {msg.content}
//                             </p>
//                         ))}
//                     </div>
//                     <div className="mt-4 flex gap-2">
//                         <input
//                             className="border p-2 w-full rounded"
//                             value={newMessage}
//                             onChange={(e) => setNewMessage(e.target.value)}
//                             placeholder="Type a message..."
//                         />
//                         <button
//                             className="bg-blue-500 text-white px-4 py-2 rounded"
//                             onClick={sendMessage}
//                         >
//                             Send
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </Layout>
//     );
// };