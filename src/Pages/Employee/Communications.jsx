import React, { useEffect, useRef, useState } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { DocumentIcon, ImageIcon, PinIcon } from "../../assets/Svgs/AllSvgs";
import {
  ArrowDownUp,
  Ellipsis,
  Phone,
  Search,
  Send,
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Check,
  CheckCheck,
} from "lucide-react";
import DPImg1 from "../../assets/DPImg1.png";
export const Communications = () => {
  const baseURL = import.meta.env.VITE__BASEURL;
  const navigate = useNavigate();
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [clientSession, setClientSession] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [callStatus, setCallStatus] = useState("");
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const iceCandidateQueue = useRef([]); // Queue for ICE candidates
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleEmployeeClick = (employeeId) => {
    setReceiverId(employeeId);
    setCallStatus("");
    setShowMobileChat(true);
  };

  const selectedEmployee = employeeList.find(
    (employee) => employee._id === receiverId
  );

  const getAllEmployeeList = async (token) => {
    try {
      const getEmployee = await axios.get(
        `${baseURL}/employee/get-all-employee`,
        {
          headers: { Authorization: token },
        }
      );
      if (getEmployee.status === 200) {
        const filteredEmployees = getEmployee.data.employessList.filter(
          (employee) => employee.userRole === "hr"
        );
        setEmployeeList(filteredEmployees);
      }
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to fetch employees.");
    }
  };

  const getEmployeeInfo = async (token) => {
    try {
      const res = await axios.get(`${baseURL}/employee/get-employee-info`, {
        headers: { Authorization: token },
      });
      setEmployeeInfo(res.data.employeeInfo);
    } catch (error) {
      console.error("Error fetching employee info:", error);
    }
  };

  useEffect(() => {
    const session = Cookies.get("session");
    if (!session) {
      navigate("/auth/log-in");
      return;
    }
    setClientSession(session);
    getEmployeeInfo(session);
    getAllEmployeeList(session);
  }, []);

  const userId = employeeInfo?._id;

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
      alert("Please select an HR user to call.");
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
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
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
    iceCandidateQueue.current = []; // Clear queue
    setCallStatus("ended");
    setTimeout(() => setCallStatus(""), 1000);
  };

  useEffect(() => {
    if (!userId) {
      console.log("Waiting for userId to initialize WebSocket");
      return;
    }
    console.log(
      "Employee userId:",
      userId,
      "receiverId:",
      receiverId || "Not set"
    );

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("Reusing existing WebSocket connection");
      return;
    }

    // Construct WebSocket URL from base URL
    const wsProtocol = baseURL.startsWith("https") ? "wss://" : "ws://";
    const wsURL = baseURL.replace(/^https?:\/\//, wsProtocol);
    console.log("Connecting to WebSocket:", wsURL);

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
      const data = JSON.parse(event.data);
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
          localStreamRef.current = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
          localStreamRef.current.getTracks().forEach((track) => {
            peerConnectionRef.current.addTrack(track, localStreamRef.current);
          });
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          );
          // Process queued ICE candidates
          for (const candidate of iceCandidateQueue.current) {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          }
          iceCandidateQueue.current = []; // Clear queue
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
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        // Process queued ICE candidates
        for (const candidate of iceCandidateQueue.current) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
        iceCandidateQueue.current = []; // Clear queue
        setCallStatus("in-call");
      } else if (data.event === "ice-candidate") {
        if (
          peerConnectionRef.current &&
          peerConnectionRef.current.remoteDescription
        ) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        } else {
          console.log("Queuing ICE candidate:", data.candidate);
          iceCandidateQueue.current.push(data.candidate);
        }
      } else if (data.event === "end-call") {
        endCall();
      } else if (data.event === "login-error") {
        console.error("Call error:", data.message);
        alert(data.message);
        setCallStatus("");
      } else if (
        receiverId &&
        ((data.sender === userId && data.receiver === receiverId) ||
          (data.sender === receiverId && data.receiver === userId))
      ) {
        setMessages((prev) => {
          if (!prev.some((msg) => msg._id === data._id)) {
            return [...prev, data].sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
          }
          return prev;
        });
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected, attempting to reconnect...");
      setTimeout(() => {
        if (
          !socketRef.current ||
          socketRef.current.readyState === WebSocket.CLOSED
        ) {
          const wsProtocol = baseURL.startsWith("https") ? "wss://" : "ws://";
          const wsURL = baseURL.replace(/^https?:\/\//, wsProtocol);
          socketRef.current = new WebSocket(wsURL);
          socketRef.current.onopen = ws.onopen;
          socketRef.current.onmessage = ws.onmessage;
          socketRef.current.onerror = ws.onerror;
          socketRef.current.onclose = ws.onclose;
        }
      }, 1000);
    };

    socketRef.current = ws;

    if (receiverId) {
      axios
        .get(`${baseURL}/chat/${userId}/${receiverId}`)
        .then((res) => setMessages(res.data))
        .catch((err) => console.error("Error fetching messages:", err));
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      endCall();
    };
  }, [userId, receiverId]);

  const sendMessage = () => {
    if (!socketRef.current) {
      console.error("Socket not initialized");
      alert("Connection not ready. Please wait...");
      return;
    }

    if (socketRef.current.readyState !== WebSocket.OPEN) {
      console.error(
        "WebSocket is not open. Current state:",
        socketRef.current.readyState
      );
      alert("Connection lost. Attempting to reconnect...");
      return;
    }

    if (!newMessage.trim()) {
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

    try {
      socketRef.current.send(JSON.stringify(messageData));
      setNewMessage("");
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };
  const filteredEmployees = employeeList.filter(
    (employee) =>
      employee.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const getLastMessage = (employeeId) => {
    const employeeMessages = messages.filter(
      (msg) =>
        (msg.sender === userId && msg.receiver === employeeId) ||
        (msg.sender === employeeId && msg.receiver === userId)
    );
    return employeeMessages[employeeMessages.length - 1];
  };
  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  const isLastMessageInGroup = (index, messages) => {
    if (index === messages.length - 1) return true;
    const currentMessage = messages[index];
    const nextMessage = messages[index + 1];
    return currentMessage.sender !== nextMessage.sender;
  };
  const messagesEndRef = useRef(null);
  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  return (
    <Layout>
      <div className="w-full h-full bg-gray-50">
        <Navbar />
        <div className="flex h-[calc(100vh-80px)]">
          {/* Sidebar - Employee List */}
          <div
            className={`${
              showMobileChat ? "hidden md:flex" : "flex"
            } w-full md:w-[30%] lg:w-[25%] flex-col bg-white border-r border-gray-200`}
          >
            {/* Header */}
            <div className="bg-[#1F3A93] text-white p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Communications</h2>
                <div className="flex gap-4">
                  <button className="hover:opacity-80 transition-opacity">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
              {/* Search Bar */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search or start new chat"
                  className="w-full bg-white text-gray-900 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Employee List */}
            <div className="flex-1 overflow-y-auto">
              {filteredEmployees.map((employee) => {
                const lastMsg = getLastMessage(employee._id);
                const isSelected = receiverId === employee._id;

                return (
                  <div
                    key={employee._id}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleEmployeeClick(employee._id)}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          employee.profileImage
                            ? `${baseURL}/${employee.profileImage}`
                            : DPImg1
                        }
                        alt={employee.userName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900 truncate">
                          {employee.userName}
                        </h3>
                        {lastMsg && (
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTime(lastMsg.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {lastMsg ? lastMsg.content : employee.email}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={`${
              showMobileChat ? "flex" : "hidden md:flex"
            } flex-1 flex-col bg-[#F0F4F8]`}
          >
            {selectedEmployee ? (
              <>
                {/* Chat Header */}
                <div className="bg-[#1F3A93] text-white px-4 py-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <button
                      className="md:hidden"
                      onClick={() => setShowMobileChat(false)}
                    >
                      <ArrowLeft size={24} />
                    </button>
                    <img
                      src={
                        selectedEmployee.profileImage
                          ? `${baseURL}/${selectedEmployee.profileImage}`
                          : DPImg1
                      }
                      alt={selectedEmployee.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium">
                        {selectedEmployee.userName}
                      </h3>
                      <p className="text-xs opacity-80">
                        {selectedEmployee.jobDesignation}
                      </p>
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

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="max-w-3xl mx-auto">
                    {messages.map((message, index) => {
                      const isSender = message.sender === userId;
                      const showProfileImage =
                        !isSender && isLastMessageInGroup(index, messages);
                      const nextMessageSameSender =
                        index < messages.length - 1 &&
                        messages[index + 1].sender === message.sender;

                      return (
                        <div
                          key={index}
                          className={`flex mb-2 ${
                            isSender ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!isSender && (
                            <div className="w-8 mr-2 flex items-end">
                              {showProfileImage && (
                                <img
                                  src={
                                    selectedEmployee.profileImage
                                      ? `${baseURL}/${selectedEmployee.profileImage}`
                                      : DPImg1
                                  }
                                  alt={selectedEmployee.userName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                            </div>
                          )}
                          <div
                            className={`relative max-w-[70%] px-3 py-2 rounded-lg shadow-sm ${
                              isSender
                                ? "bg-[#1F3A93] text-white rounded-br-none"
                                : "bg-white rounded-bl-none"
                            } ${!nextMessageSameSender ? "mb-3" : ""}`}
                          >
                            <p className="text-sm break-words">
                              {message.content}
                            </p>
                            <div className="flex items-center gap-1 mt-1 justify-end">
                              <span
                                className={`text-xs ${
                                  isSender ? "text-blue-100" : "text-gray-500"
                                }`}
                              >
                                {formatTime(message.createdAt)}
                              </span>
                              {isSender && (
                                <CheckCheck
                                  size={16}
                                  className="text-blue-200"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input Area */}
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
                      newMessage.trim()
                        ? "bg-[#1F3A93] hover:bg-[#16307E]"
                        : "bg-gray-400"
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
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    Select a chat to start messaging
                  </h3>
                  <p className="text-gray-500">
                    Choose from your contacts to begin a conversation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
