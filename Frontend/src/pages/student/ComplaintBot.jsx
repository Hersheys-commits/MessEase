import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import api from "../../utils/axiosRequest";

import { Send, User, Bot, Trash2, MessageSquare, Check, X, CloudFog } from "lucide-react";
import { useParams } from "react-router-dom";

const ComplaintBot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { 
      role: "bot", 
      text: "Welcome to MessEase AI. I can help you log complaints or answer questions about the mess. What's on your mind?" 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentDraft, setCurrentDraft] = useState(null); 
  const scrollRef = useRef(null);
  const { code } = useParams();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const confirmComplaint = async () => {
    setIsTyping(true);
    setCurrentDraft(null); 

    try {
      const response = await axios.post("http://localhost:8000/chat/confirm", {
        user_id: code,
        message: "confirm", 
      });
      const formData = new FormData();
      formData.append("category", currentDraft.category);
      formData.append("description", currentDraft.description);
      

        try {
          const res = await api.post(
            "/api/complaint/createcomplaint",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log(res);
        } catch (error) {
          console.log("error response: ", error.response ? error.response.data : error.message);
        }
        // console.log("Complaint created with response:", res.data);
      
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: response.data.reply },
      ]);

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Failed to submit. Please check your connection." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const discardComplaint = async () => {
    setIsTyping(true);
    setCurrentDraft(null);

    try {
      const response = await axios.post("http://localhost:8000/chat/discard", {
        user_id: code,
        message: "discard", 
      });

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: response.data.reply }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Error discarding draft. Please try again." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const currentMessage = input;
    setMessages((prev) => [...prev, { role: "user", text: currentMessage }]);
    setInput(""); 
    setIsTyping(true);
    setCurrentDraft(null); 

    try {
      const response = await axios.post("http://localhost:8000/chat", {
        message: currentMessage,
        user_id: code,
      });

      
      console.log("draft data :",response.data.draft_data);
      console.log("first 100 characters of reply:", response.data.reply);
      if (response.data.is_draft) {
        setCurrentDraft(response.data.draft_data);
      }

      setMessages((prev) => [
        ...prev,
        { 
            role: "bot", 
            text: response.data.reply, 
            isDraft: response.data.is_draft 
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "I'm having trouble connecting to the server." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-200 font-sans flex flex-col items-center p-4">
      <div className="w-full max-w-4xl flex justify-between items-center py-6">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
            <MessageSquare className="text-cyan-400" size={24} />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            MessEase <span className="text-cyan-400">AI</span>
          </h1>
        </div>
        <button 
          onClick={() => { setMessages([messages[0]]); setCurrentDraft(null); }}
          className="p-2 text-gray-500 hover:text-red-400 transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="w-full max-w-4xl bg-[#1e293b]/50 border border-gray-800 rounded-2xl flex flex-col h-[75vh] shadow-2xl backdrop-blur-md overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in`}>
              <div className={`flex max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-3`}>
                <div className={`p-2 rounded-lg flex-shrink-0 ${m.role === "user" ? "bg-cyan-600" : "bg-gray-800 border border-gray-700"}`}>
                  {m.role === "user" ? <User size={16} /> : <Bot size={16} className="text-cyan-400" />}
                </div>

                <div className={`p-4 rounded-2xl shadow-sm ${m.role === "user" ? "bg-cyan-600 text-white rounded-tr-none" : "bg-[#0f172a] border border-gray-800 text-gray-200 rounded-tl-none"}`}>
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap font-medium">
                    {m.text}
                  </p>
                  
                  {m.isDraft && currentDraft && (
                    <div className="mt-4 p-5 border border-cyan-500/30 bg-cyan-500/10 rounded-xl space-y-4">
                        <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold border-b border-cyan-500/20 pb-2">
                            PROPOSED FORMAL COMPLAINT
                        </div>
                        <div className="text-sm">
                            <span className="text-cyan-500/70 font-bold">CATEGORY:</span> {currentDraft.category}
                        </div>
                        <div className="text-sm">
                            <span className="text-cyan-500/70 font-bold mb-2 block text-xs">EMAIL CONTENT:</span> 
                            <div className="bg-[#0f172a] p-3 rounded-lg border border-gray-800 whitespace-pre-wrap text-gray-300 leading-6 text-[13px] font-mono">
                                {currentDraft.description}
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={confirmComplaint}
                                className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-white"
                            >
                                <Check size={16} /> CONFIRM & SEND
                            </button>
                            <button 
                                onClick={discardComplaint}
                                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-gray-400"
                            >
                                <X size={16} /> DISCARD
                            </button>
                        </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start items-center gap-3">
               <div className="p-2 rounded-lg bg-gray-800 border border-gray-700">
                  <Bot size={16} className="text-cyan-400" />
                </div>
              <div className="bg-[#0f172a] border border-gray-800 p-4 rounded-2xl rounded-tl-none flex space-x-1">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="p-4 bg-[#0f172a]/80 border-t border-gray-800 flex gap-3 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your complaint..."
            className="flex-1 bg-[#1e293b] border border-gray-700 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 text-white p-3 rounded-xl transition-all"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintBot;