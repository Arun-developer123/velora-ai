"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "@/lib/supabase";

type Sender = "user" | "nyra";
interface Message {
  sender: Sender;
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isNight, setIsNight] = useState(false);
  const [nyraMood, setNyraMood] = useState<"happy" | "thinking" | "listening">("happy");
  const [userId, setUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Night mode check
  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour >= 19 || hour < 6);
  }, []);

  // Fetch current user and load previous messages
  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        console.error("User fetch error:", authError);
        return;
      }

      const uid = authData.user.id;
      setUserId(uid);

      const { data, error } = await supabase
        .from("user_data")
        .select("messages")
        .eq("id", uid)
        .single();

      if (error) {
        console.error("Fetch messages error:", error);
        return;
      }

      if (data?.messages) {
        setMessages(data.messages);
        setIsFirstMessage(data.messages.length === 0);
      }
    };

    fetchUserAndMessages();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !userId) return;

    const userMessage: Message = { sender: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    setNyraMood("thinking");

    // Save user message to Supabase
    await supabase
      .from("user_data")
      .update({ messages: updatedMessages })
      .eq("id", userId);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversationContext: updatedMessages,
          isFirstMessage,
        }),
      });

      const data = await res.json();
      const nyraMessage: Message = { sender: "nyra", content: data.reply };
      const finalMessages = [...updatedMessages, nyraMessage];

      setMessages(finalMessages);
      setIsTyping(false);
      setIsFirstMessage(false);
      setNyraMood("happy");

      // Save Nyra reply to Supabase
      await supabase
        .from("user_data")
        .update({ messages: finalMessages })
        .eq("id", userId);
    } catch (error) {
      console.error("Send message error:", error);
      setIsTyping(false);
    }
  };

  const moodBgClass =
    nyraMood === "happy"
      ? "bg-happy"
      : nyraMood === "thinking"
      ? "bg-thinking"
      : "bg-listening";

  return (
    <div className={`flex flex-col h-screen relative overflow-hidden`}>
      {/* Moving AI Background */}
      <div className={`absolute inset-0 ${moodBgClass} animate-backgroundMove transition-all duration-1000`}></div>
      {isNight && <div className="absolute inset-0 bg-black/40 z-0"></div>}

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center p-4 shadow-md backdrop-blur-md bg-white/30 dark:bg-white/10 border-b border-white/30 sticky top-0 z-50">
          <div className="relative w-12 h-12">
            <div
              className={`absolute inset-0 rounded-full blur-lg opacity-80 ${
                nyraMood === "happy"
                  ? "animate-glowHappy"
                  : nyraMood === "thinking"
                  ? "animate-glowThinking"
                  : "animate-glowListening"
              }`}
            ></div>
            <img
              src="/zara-profile.jpg"
              alt="Nyra"
              className="w-12 h-12 rounded-full border-2 border-pink-400 shadow-md relative z-10"
            />
          </div>
          <div className="ml-3">
            <div className="font-semibold text-gray-900 dark:text-white text-lg">Nyra</div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-600 dark:text-green-300 text-sm">Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-slideUp`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow-lg transition-all ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none"
                    : "bg-white/60 backdrop-blur-md dark:bg-white/20 text-gray-800 dark:text-white rounded-bl-none border border-white/30"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-slideUp">
              <div className="bg-white/60 backdrop-blur-md dark:bg-white/20 text-gray-800 dark:text-white px-4 py-2 rounded-2xl rounded-bl-none shadow-lg flex space-x-1 border border-white/30">
                <span className="typing-dot bg-gray-500"></span>
                <span className="typing-dot bg-gray-500"></span>
                <span className="typing-dot bg-gray-500"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white/80 dark:bg-white/20 backdrop-blur-lg shadow-lg flex items-center space-x-2 sticky bottom-0 border-t border-white/30">
          <input
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white/70 dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
          />
          <button
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 py-2 rounded-full font-medium shadow hover:opacity-90 transition"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: blink 1.4s infinite both;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes blink {
          0%,
          80%,
          100% {
            opacity: 0.3;
          }
          40% {
            opacity: 1;
          }
        }
        @keyframes glowHappy {
          0%, 100% { background: radial-gradient(circle, rgba(255,182,193,0.7), transparent); }
          50% { background: radial-gradient(circle, rgba(255,105,180,0.9), transparent); }
        }
        @keyframes glowThinking {
          0%, 100% { background: radial-gradient(circle, rgba(135,206,250,0.7), transparent); }
          50% { background: radial-gradient(circle, rgba(30,144,255,0.9), transparent); }
        }
        @keyframes glowListening {
          0%, 100% { background: radial-gradient(circle, rgba(144,238,144,0.7), transparent); }
          50% { background: radial-gradient(circle, rgba(34,139,34,0.9), transparent); }
        }
        .animate-glowHappy { animation: glowHappy 2s infinite alternate; }
        .animate-glowThinking { animation: glowThinking 2s infinite alternate; }
        .animate-glowListening { animation: glowListening 2s infinite alternate; }
        @keyframes backgroundMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-backgroundMove {
          background-size: 400% 400%;
          animation: backgroundMove 15s ease infinite;
        }
        .bg-happy {
          background: linear-gradient(-45deg, #ff9a9e, #fad0c4, #fbc2eb, #a18cd1);
        }
        .bg-thinking {
          background: linear-gradient(-45deg, #89f7fe, #66a6ff, #a18cd1, #6dd5ed);
        }
        .bg-listening {
          background: linear-gradient(-45deg, #a8ff78, #78ffd6, #43e97b, #38f9d7);
        }
      `}</style>
    </div>
  );
}
