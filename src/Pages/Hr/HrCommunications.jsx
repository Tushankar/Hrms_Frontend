import React, { useEffect, useRef, useState } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { DocumentIcon, ImageIcon, PinIcon } from "../../assets/Svgs/AllSvgs";
import { ArrowDownUp, Ellipsis, Phone, Search, Send, ArrowLeft, MoreVertical, Paperclip, Smile, Mic, Check, CheckCheck } from "lucide-react";
import DPImg1 from "../../assets/DPImg1.png";

export const HrCommunication = () => {
    const baseURL = import.meta.env.VITE__BASEURL;
    const navigate = useNavigate();
    const [employeeList, setEmployeeList] = useState([]);
    const [clientSession, setClientSession] = useState("");
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [receiverId, setReceiverId] = useState("");
    const [callStatus, setCallStatus] = useState("");
    const [showMobileChat, setShowMobileChat] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [unreadCounts, setUnreadCounts] = useState({});
    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const iceCandidateQueue = useRef([]);

    const handleEmployeeClick = async (employeeId) => {
        console.log("Opening chat with employee:", employeeId);
        setReceiverId(employeeId);
        setCallStatus("");
        setShowMobileChat(true);

        // Mark all messages as read when opening the chat
        try {
            console.log("Marking messages from employee as read:", employeeId);
            const response = await axios.post(
                `${baseURL}/chat/mark-read/${userId}/${employeeId}`,
                null,
                {
                    headers: { Authorization: `Bearer ${clientSession}` },
                }
            );
            console.log("Mark-read response:", response.data);

            // Update unread count in UI immediately
            setUnreadCounts((prev) => {
                const newCounts = { ...prev, [employeeId]: 0 };
                console.log("Updated unread counts after opening chat:", newCounts);
                return newCounts;
            });

            // Fetch updated chat history
            const res = await axios.get(`${baseURL}/chat/${userId}/${employeeId}`, {
                headers: { Authorization: `Bearer ${clientSession}` },
            });
            setMessages(res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        } catch (error) {
            console.error("Error marking messages as read:", error);
            console.error("Error details:", error.response || error.message);
        }
    };

    const selectedEmployee = employeeList.find((employee) => employee._id === receiverId);

    const getAllEmployeeList = async (token) => {
        try {
            const getEmployee = await axios.get(`${baseURL}/employee/get-all-employee`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (getEmployee.status === 200) {
                const filteredEmployees = getEmployee.data.employessList.filter(
                    (employee) => employee.userRole === "employee"
                );
                setEmployeeList(filteredEmployees);
            }
        } catch (error) {
            console.error(error);
            alert(error?.response?.data?.message || "Failed to fetch employees.");
        }
    };

    const fetchUnreadCounts = async () => {
        if (!userId || !clientSession) {
            console.log("Skipping unread counts fetch - missing userId or session");
            return;
        }

        try {
            console.log("Fetching unread counts for user:", userId);
            const response = await axios.get(`${baseURL}/chat/unread/${userId}`, {
                headers: { Authorization: `Bearer ${clientSession}` },
            });
            console.log("Unread counts API response:", response.data);

            if (Array.isArray(response.data)) {
                const counts = response.data.reduce((acc, item) => {
                    const senderId = item.senderId || item._id;
                    const count = item.unreadCount || item.count || 0;
                    return { ...acc, [senderId]: count };
                }, {});
                console.log("Processed unread counts:", counts);
                setUnreadCounts(counts);
            } else {
                console.error("Unexpected response format for unread counts:", response.data);
            }
        } catch (error) {
            console.error("Error fetching unread counts:", error);
            console.error("Error details:", error.response || error.message);
        }
    };

    useEffect(() => {
        const session = Cookies.get("session");
        if (!session) {
            console.error("No session found, redirecting to login...");
            navigate("/auth/log-in");
            return;
        }
        setClientSession(session);
        getAllEmployeeList(session);
    }, []);

    const decodedToken = clientSession ? jwtDecode(clientSession) : null;
    const userId = decodedToken?.user?._id;

    useEffect(() => {
        if (userId) {
            fetchUnreadCounts();
            const intervalId = setInterval(() => {
                console.log("Refreshing unread counts...");
                fetchUnreadCounts();
            }, 10000);
            return () => clearInterval(intervalId);
        }
    }, [userId, clientSession]);

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.send(
                    JSON.stringify({
                        event: "ice-candidate",
                        senderId: userId,
                        receiverId,
                        candidate: event.candidate,
                    })
                );
            }
        };
        pc.ontrack = (event) => {
            const remoteAudio = new Audio();
            remoteAudio.srcObject = event.streams[0];
            remoteAudio.play();
        };
        return pc;
    };

    const startCall = async () => {
        if (!receiverId) {
            alert("Please select an employee to call.");
            return;
        }
        if (!employeeList.some((emp) => emp._id === receiverId)) {
            alert("Invalid receiver selected.");
            return;
        }
        console.log("Initiating call to receiverId:", receiverId);
        setCallStatus("calling");
        peerConnectionRef.current = createPeerConnection();
        try {
            localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStreamRef.current.getTracks().forEach((track) => {
                peerConnectionRef.current.addTrack(track, localStreamRef.current);
            });
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            socketRef.current.send(
                JSON.stringify({
                    event: "call",
                    senderId: userId,
                    receiverId,
                    offer,
                })
            );
        } catch (error) {
            console.error("Error starting call:", error);
            setCallStatus("");
            alert("Failed to start call.");
        }
    };

    const endCall = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }
        if (socketRef.current) {
            socketRef.current.send(
                JSON.stringify({
                    event: "end-call",
                    senderId: userId,
                    receiverId,
                })
            );
        }
        iceCandidateQueue.current = [];
        setCallStatus("ended");
        setTimeout(() => setCallStatus(""), 1000);
    };

    useEffect(() => {
        if (!userId) {
            console.log("Waiting for userId to initialize WebSocket");
            return;
        }
        console.log("HR userId:", userId, "receiverId:", receiverId || "Not set");

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            console.log("Reusing existing WebSocket connection");
            return;
        }

        // Construct WebSocket URL from base URL
        const constructWebSocketURL = () => {
            try {
                const url = new URL(baseURL);
                const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
                const wsURL = `${wsProtocol}//${url.host}/ws`;
                console.log("Constructed WebSocket URL:", wsURL);
                return wsURL;
            } catch (error) {
                console.error("Error constructing WebSocket URL:", error);
                const wsProtocol = baseURL.startsWith("https") ? "wss://" : "ws://";
                const host = baseURL.replace(/^https?:\/\//, "").replace(/\/$/, "");
                const wsURL = `${wsProtocol}${host}/ws`;
                console.log("Fallback WebSocket URL:", wsURL);
                return wsURL;
            }
        };

        const wsURL = constructWebSocketURL();
        console.log("Creating new WebSocket connection to:", wsURL);
        const ws = new WebSocket(wsURL);

        ws.onopen = () => {
            if (!userId) {
                console.error("Cannot send login: userId is missing");
                ws.close();
                return;
            }
            console.log("WebSocket connected, sending login for senderId:", userId);
            ws.send(JSON.stringify({ event: "login", senderId: userId }));
        };

        ws.onmessage = async (event) => {
            console.log("WebSocket received data:", event.data);
            let data;
            try {
                data = JSON.parse(event.data);
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
                return;
            }

            if (data.event === "login-success") {
                console.log("Login successful for senderId:", data.senderId);
            } else if (data.event === "login-error") {
                console.error("Login error:", data.message);
                alert(data.message);
            } else if (data.event === "incoming-call") {
                console.log("Received incoming call from:", data.senderId);
                setCallStatus("calling");
                peerConnectionRef.current = createPeerConnection();
                try {
                    localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                    localStreamRef.current.getTracks().forEach((track) => {
                        peerConnectionRef.current.addTrack(track, localStreamRef.current);
                    });
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                    for (const candidate of iceCandidateQueue.current) {
                        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                    iceCandidateQueue.current = [];
                    const answer = await peerConnectionRef.current.createAnswer();
                    await peerConnectionRef.current.setLocalDescription(answer);
                    ws.send(
                        JSON.stringify({
                            event: "answer",
                            senderId: userId,
                            receiverId: data.senderId,
                            answer,
                        })
                    );
                    setCallStatus("in-call");
                } catch (error) {
                    console.error("Error answering call:", error);
                    setCallStatus("");
                    alert("Failed to answer call.");
                }
            } else if (data.event === "call-answer") {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                for (const candidate of iceCandidateQueue.current) {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
                iceCandidateQueue.current = [];
                setCallStatus("in-call");
            } else if (data.event === "ice-candidate") {
                if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } else {
                    console.log("Queuing ICE candidate:", data.candidate);
                    iceCandidateQueue.current.push(data.candidate);
                }
            } else if (data.event === "end-call") {
                endCall();
            } else if (data.event === "call-error") {
                console.error("Call error:", data.message);
                alert(data.message);
                setCallStatus("");
            } else if (data.event === "message") {
                console.log("Message event received:", data);

                // Ensure message IDs are strings for comparison
                const messageId = data._id ? String(data._id) : null;
                const senderId = String(data.sender);
                const receiverIdStr = String(data.receiver);
                
                // Log current conversation IDs for debugging
                console.log("Current conversation: userId=", userId, "receiverId=", receiverId);
                console.log("Message IDs: senderId=", senderId, "receiverId=", receiverIdStr);
                
                // Always keep track of all messages related to this user for last message display
                setMessages((prev) => {
                    // Check if this message already exists in our state
                    if (messageId && !prev.some((msg) => String(msg._id) === messageId)) {
                        console.log("Adding new message to state");
                        
                        // Add the message and sort
                        const newMessages = [...prev, data].sort(
                            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                        );
                        
                        // Explicitly log what was added
                        console.log("New message added:", data);
                        console.log("New messages array length:", newMessages.length);
                        
                        return newMessages;
                    }
                    
                    console.log("Message already exists in state or missing ID");
                    return prev;
                });

                // Handle unread count for incoming messages
                if (senderId !== userId && receiverIdStr === userId) {
                    console.log("Received message from:", senderId, "- Updating unread count");

                    if (senderId !== receiverId) {
                        console.log("Incrementing unread count because chat is not open");
                        setUnreadCounts((prev) => {
                            const newCounts = { ...prev, [senderId]: (prev[senderId] || 0) + 1 };
                            console.log("New unread counts:", newCounts);
                            return newCounts;
                        });
                    } else {
                        console.log("Not incrementing unread count because chat is open - marking as read");
                        try {
                            const response = await axios.post(
                                `${baseURL}/chat/mark-read/${userId}/${senderId}`,
                                null,
                                {
                                    headers: { Authorization: `Bearer ${clientSession}` },
                                }
                            );
                            console.log("Auto-marked message as read:", response.data);
                            setUnreadCounts((prev) => {
                                const newCounts = { ...prev, [senderId]: 0 };
                                console.log("Updated unread counts after auto-mark:", newCounts);
                                return newCounts;
                            });
                        } catch (error) {
                            console.error("Error marking messages as read:", error);
                        }
                    }
                }
            } else if (data.event === "messages-read") {
                console.log("messages-read event received:", data);

                setMessages((prev) =>
                    prev.map((msg) =>
                        data.messages.some((updatedMsg) => String(updatedMsg._id) === String(msg._id))
                            ? { ...msg, status: "read" }
                            : msg
                    )
                );

                if (data.messages && data.messages.length > 0) {
                    const senderId = String(data.messages[0]?.sender);
                    console.log("Clearing unread count for sender:", senderId);
                    setUnreadCounts((prev) => {
                        const newCounts = { ...prev, [senderId]: 0 };
                        console.log("Updated unread counts after read:", newCounts);
                        return newCounts;
                    });
                }
            } else if (data.event === "message-updated") {
                console.log("message-updated event received:", data);

                setMessages((prev) =>
                    prev.map((msg) =>
                        String(msg._id) === String(data._id) ? { ...msg, status: data.status } : msg
                    )
                );

                if (data.status === "read" && String(data.sender) === userId && String(data.receiver) === receiverId) {
                    console.log("My message was read by receiver:", data.receiver);
                    setUnreadCounts((prev) => {
                        const newCounts = { ...prev, [data.receiver]: 0 };
                        console.log("Updated unread counts after message read:", newCounts);
                        return newCounts;
                    });
                }
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        ws.onclose = (event) => {
            console.log("WebSocket Disconnected with code:", event.code, "reason:", event.reason);
            console.log("Attempting to reconnect...");
            
            // Clear socket reference immediately
            socketRef.current = null;
            
            // Set up reconnect with exponential backoff
            setTimeout(() => {
                if (!socketRef.current) {
                    console.log("Creating new WebSocket connection after disconnect");
                    const newWs = new WebSocket(wsURL);
                    
                    // Set up event handlers for the new connection
                    newWs.onopen = ws.onopen;
                    newWs.onmessage = ws.onmessage;
                    newWs.onerror = ws.onerror;
                    newWs.onclose = ws.onclose;
                    
                    // Update the reference
                    socketRef.current = newWs;
                    console.log("WebSocket reconnection attempt complete");
                }
            }, 1000);
        };

        socketRef.current = ws;

        if (receiverId) {
            axios
                .get(`${baseURL}/chat/${userId}/${receiverId}`, {
                    headers: { Authorization: `Bearer ${clientSession}` },
                })
                .then((res) => {
                    const sortedMessages = res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    console.log("Fetched chat history:", sortedMessages);
                    setMessages(sortedMessages);
                })
                .catch((err) => console.error("Error fetching messages:", err));
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
            endCall();
        };
    }, [userId, receiverId, clientSession]);

    const sendMessage = async () => {
        if (!newMessage.trim()) {
            console.log("Not sending empty message");
            return;
        }

        if (!userId || !receiverId) {
            console.error("User ID or Receiver ID missing", { userId, receiverId });
            alert("Error: User information missing");
            return;
        }

        const messageData = {
            event: "message",
            senderId: userId,
            receiverId,
            content: newMessage,
        };

        // Try WebSocket first if available and open
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            try {
                console.log("Sending message via WebSocket:", messageData);
                socketRef.current.send(JSON.stringify(messageData));
                
                // Optimistically add the message to the state
                const tempId = `temp-${Date.now()}`;
                const tempMessage = {
                    _id: tempId,
                    sender: userId,
                    receiver: receiverId,
                    content: newMessage,
                    createdAt: new Date().toISOString(),
                    status: "sent"
                };
                
                console.log("Adding optimistic message to state:", tempMessage);
                setMessages(prev => [...prev, tempMessage].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
                setNewMessage("");
                console.log("Message sent via WebSocket");
                return;
            } catch (error) {
                console.error("WebSocket send error, falling back to HTTP:", error);
            }
        }

        // Fallback to HTTP if WebSocket is not available or failed
        try {
            console.log("Sending message via HTTP fallback");
            const response = await axios.post(
                `${baseURL}/chat/send`,
                {
                    senderId: userId,
                    receiverId,
                    content: newMessage,
                },
                {
                    headers: {
                        Authorization: clientSession,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201) {
                // Add message to local state immediately
                setMessages((prev) => {
                    const newMsg = response.data.message;
                    if (!prev.some((msg) => String(msg._id) === String(newMsg._id))) {
                        return [...prev, newMsg].sort(
                            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                        );
                    }
                    return prev;
                });
                setNewMessage("");
                console.log("Message sent successfully via HTTP");
            }
        } catch (error) {
            console.error("Error sending message via HTTP:", error);
            alert(
                "Failed to send message. Please check your connection and try again."
            );
        }
    };

    const messagesEndRef = useRef(null);
    const prevMessagesLengthRef = useRef(0);

    useEffect(() => {
        if (messagesEndRef.current) {
            // Only scroll if messages count has increased (new message arrived)
            if (messages.length > prevMessagesLengthRef.current) {
                console.log("New message detected, scrolling to bottom");
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
            prevMessagesLengthRef.current = messages.length;
        }
    }, [messages]);
    
    // Debug effect to monitor messages state changes
    useEffect(() => {
        console.log("Messages state updated, new count:", messages.length);
    }, [messages]);

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    };

    const getLastMessage = (employeeId) => {
        // Ensure we compare strings
        const employeeIdStr = String(employeeId);
        const userIdStr = String(userId);
        
        const employeeMessages = messages.filter(
            (msg) => (String(msg.sender) === userIdStr && String(msg.receiver) === employeeIdStr) || 
                    (String(msg.sender) === employeeIdStr && String(msg.receiver) === userIdStr)
        );
        
        // Debug last message for this employee
        if (employeeMessages.length > 0) {
            const lastMsg = employeeMessages[employeeMessages.length - 1];
            console.log(`Last message for employee ${employeeIdStr}:`, lastMsg.content);
        }
        
        return employeeMessages.length > 0 ? employeeMessages[employeeMessages.length - 1] : null;
    };

    const filteredEmployees = employeeList.filter(
        (employee) =>
            employee.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isLastMessageInGroup = (index, messages) => {
        if (index === messages.length - 1) return true;
        const currentMessage = messages[index];
        const nextMessage = messages[index + 1];
        return currentMessage.sender !== nextMessage.sender;
    };

    return (
        <Layout>
            <div className="w-full h-full bg-gray-50">
                <Navbar />
                <div className="flex h-[calc(100vh-80px)]">
                    {/* Sidebar - Employee List */}
                    <div className={`${showMobileChat ? "hidden md:flex" : "flex"} w-full md:w-[30%] lg:w-[35%] flex-col bg-white border-r border-gray-200`}>
                        <div className="bg-[#1F3A93] text-white p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Communications</h2>
                                <div className="flex gap-4">
                                    <button className="hover:opacity-80 transition-opacity">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search or start new chat"
                                    className="w-full bg-white text-gray-900 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {filteredEmployees.map((employee) => {
                                const lastMsg = getLastMessage(employee._id);
                                const isSelected = receiverId === employee._id;
                                const unreadCount = unreadCounts[employee._id] || 0;

                                return (
                                    <div
                                        key={employee._id}
                                        className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${isSelected ? "bg-blue-50" : ""}`}
                                        onClick={() => handleEmployeeClick(employee._id)}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={employee.profileImage ? `${baseURL}/${employee.profileImage}` : DPImg1}
                                                alt={employee.userName}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-medium text-gray-900 truncate">{employee.userName}</h3>
                                                <div className="flex items-center gap-2">
                                                    {lastMsg && (
                                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                                            {formatTime(lastMsg.createdAt)}
                                                        </span>
                                                    )}
                                                    {unreadCount > 0 && (
                                                        <span className="bg-[#1F3A93] text-white text-xs font-semibold rounded-full px-2 py-1">
                                                            {unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{lastMsg ? lastMsg.content : employee.email}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className={`${showMobileChat ? "flex" : "hidden md:flex"} flex-1 flex-col bg-[#F0F4F8]`}>
                        {selectedEmployee ? (
                            <>
                                <div className="bg-[#1F3A93] text-white px-4 py-3 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <button className="md:hidden" onClick={() => setShowMobileChat(false)}>
                                            <ArrowLeft size={24} />
                                        </button>
                                        <img
                                            src={selectedEmployee.profileImage ? `${baseURL}/${selectedEmployee.profileImage}` : DPImg1}
                                            alt={selectedEmployee.userName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <h3 className="font-medium">{selectedEmployee.userName}</h3>
                                            <p className="text-xs opacity-80">{selectedEmployee.jobDesignation}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {callStatus === "in-call" ? (
                                            <button
                                                onClick={endCall}
                                                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                <Phone size={18} />
                                                <span className="hidden sm:inline">End Call</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={startCall}
                                                disabled={callStatus === "calling"}
                                                className="hover:bg-white/10 p-2 rounded-full transition-colors"
                                            >
                                                <Phone size={20} />
                                            </button>
                                        )}
                                        <button className="hover:bg-white/10 p-2 rounded-full transition-colors">
                                            <MoreVertical size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4">
                                    <div className="max-w-5xl mx-auto">
                                        {messages
                                            .filter(message => 
                                                (String(message.sender) === userId && String(message.receiver) === receiverId) || 
                                                (String(message.sender) === receiverId && String(message.receiver) === userId)
                                            )
                                            .map((message, index, filteredMessages) => {
                                            const isSender = String(message.sender) === userId;
                                            const showProfileImage = !isSender && isLastMessageInGroup(index, filteredMessages);
                                            const nextMessageSameSender = index < filteredMessages.length - 1 && filteredMessages[index + 1].sender === message.sender;

                                            return (
                                                <div key={index} className={`flex mb-2 ${isSender ? "justify-end" : "justify-start"}`}>
                                                    {!isSender && (
                                                        <div className="w-8 mr-2 flex items-end">
                                                            {showProfileImage && (
                                                                <img
                                                                    src={selectedEmployee.profileImage ? `${baseURL}/${selectedEmployee.profileImage}` : DPImg1}
                                                                    alt={selectedEmployee.userName}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`relative max-w-[70%] px-3 py-2 rounded-lg shadow-sm ${
                                                            isSender ? "bg-[#1F3A93] text-white rounded-br-none" : "bg-white rounded-bl-none"
                                                        } ${!nextMessageSameSender ? "mb-3" : ""}`}
                                                    >
                                                        <p className="text-sm break-words">{message.content}</p>
                                                        <div className="flex items-center gap-1 mt-1 justify-end">
                                                            <span className={`text-xs ${isSender ? "text-blue-100" : "text-gray-500"}`}>
                                                                {formatTime(message.createdAt)}
                                                            </span>
                                                            {isSender && (
                                                                <span>
                                                                    {message.status === "read" ? (
                                                                        <CheckCheck size={16} className="text-blue-200" />
                                                                    ) : message.status === "delivered" ? (
                                                                        <CheckCheck size={16} className="text-gray-300" />
                                                                    ) : (
                                                                        <Check size={16} className="text-gray-300" />
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>
                                <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
                                    <button className="text-gray-600 hover:text-[#1F3A93] transition-colors">
                                        <Smile size={24} />
                                    </button>
                                    <button className="text-gray-600 hover:text-[#1F3A93] transition-colors">
                                        <Paperclip size={24} />
                                    </button>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            placeholder="Type a message"
                                            className="w-full bg-gray-100 rounded-full px-4 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:ring-opacity-50"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                                        />
                                    </div>
                                    <button
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim()}
                                        className={`${
                                            newMessage.trim() ? "bg-[#1F3A93] hover:bg-[#16307E]" : "bg-gray-400"
                                        } text-white p-2 rounded-full transition-colors`}
                                    >
                                        {newMessage.trim() ? <Send size={20} /> : <Mic size={20} />}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <Phone size={48} className="text-[#1F3A93]" />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-700 mb-2">Select a chat to start messaging</h3>
                                    <p className="text-gray-500">Choose from your contacts to begin a conversation</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};