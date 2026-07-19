import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { apiFetch } from "../utils/api";
import Button from "./Button";

const ChatBox = ({ propertyId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        const data = await apiFetch({
          endpoint: `/messages/property/${propertyId}`,
          credentials: "include",
        });
        setConversation(data.conversation);
        setMessages(data.messages);

        const token = localStorage.getItem("token");
        // socketRef.current = io("http://localhost:5000", {
        socketRef.current = io("https://evencen.onrender.com", {
          auth: { token },
        });

        socketRef.current.emit("joinConversation", data.conversation._id);

        socketRef.current.on("message", (message) => {
          setMessages((prev) => [...prev, message]);
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [propertyId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    socketRef.current.emit("sendMessage", {
      conversationId: conversation._id,
      text,
    });
    setText("");
  };

  if (loading) return <div className="p-4 text-center">Loading chat...</div>;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 sm:h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50">
      <div className="bg-primary text-white p-3 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img
            src={conversation.host.profileImage}
            alt={conversation.host.name}
            className="w-8 h-8 rounded-full"
          />
          <span className="font-semibold">{conversation.host.name}</span>
        </div>
        <button aria-label="Close" onClick={onClose} className="text-white hover:opacity-80">
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender._id === localStorage.getItem("userId")
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.sender._id === localStorage.getItem("userId")
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-primary"
        />
        <Button onClick={sendMessage} className="bg-primary text-white px-4">
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatBox;
