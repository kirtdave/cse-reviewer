import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Bot, MessageCircle, Send, X } from "lucide-react";

export function AICoachWidget({ theme = "light", initialQuestion = null, onClose = null }) {
  const isDark = theme === "dark";
  const [messageIndex, setMessageIndex] = useState(0);
  const [showQuestionHelp, setShowQuestionHelp] = useState(!!initialQuestion);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const messages = [
    {
      text: "Great job on your 7-day streak! Keep it up and you'll hit 90% accuracy soon. 🎯",
      tip: "Pro tip: Review your bookmarked questions today"
    },
    {
      text: "I noticed your Numerical score dipped. Let's focus there this week—I've queued 15 practice questions. 📊",
      tip: "AI Insight: Practice in the morning for +8% better retention"
    },
    {
      text: "You're 70% ready for the actual exam! With consistent practice, you'll reach 90% in 12 days. 🚀",
      tip: "Next milestone: Complete 3 more mock exams"
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (initialQuestion) {
      setShowQuestionHelp(true);
      loadQuestionContext(initialQuestion);
    }
  }, [initialQuestion]);

  const handleAskAI = async () => {
    if (!userInput.trim() || isLoading) return;

    const newMessage = { role: "user", content: userInput };
    setChatMessages(prev => [...prev, newMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const body = {
        message: userInput,
        conversationHistory: chatMessages,
        questionData: initialQuestion
      };

      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        setChatMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      } else {
        throw new Error(data.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I'm having trouble connecting right now. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestionContext = async (questionData) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: "Please help me understand this question.",
          conversationHistory: [],
          questionData: questionData
        })
      });

      const data = await response.json();

      if (data.success) {
        setChatMessages([
          { role: "assistant", content: data.response }
        ]);
      } else {
        throw new Error(data.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('AI Question Help error:', error);
      setChatMessages([{ 
        role: "assistant", 
        content: "I'm here to help with this question! What would you like to know?" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowQuestionHelp(false);
    if (onClose) onClose();
  };

  if (initialQuestion && onClose) {
    return (
      <AnimatePresence>
        {showQuestionHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 lg:p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col ${isDark ? "bg-gray-900" : "bg-white"} rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden`}
            >
              {/* Header - Mobile Optimized */}
              <div className={`${isDark ? "bg-gradient-to-r from-blue-600 to-purple-600" : "bg-gradient-to-r from-blue-500 to-purple-500"} p-3 sm:p-4 flex items-center justify-between flex-shrink-0`}>
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-sm sm:text-base truncate">Question Help</h3>
                    <p className="text-white/80 text-[10px] sm:text-xs truncate">Let me help you</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Question Context Banner - Mobile Optimized */}
              <div className={`p-3 sm:p-4 border-b ${isDark ? "bg-gray-800/50 border-gray-800" : "bg-gray-50 border-gray-200"} flex-shrink-0`}>
                <p className={`text-[10px] sm:text-xs font-semibold mb-1 uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Question:
                </p>
                <p className={`text-xs sm:text-sm line-clamp-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {initialQuestion.questionText}
                </p>
                <div className="flex gap-1.5 sm:gap-2 mt-2 flex-wrap">
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold ${
                    initialQuestion.isCorrect
                      ? "bg-green-500/20 text-green-500"
                      : "bg-red-500/20 text-red-500"
                  }`}>
                    {initialQuestion.isCorrect ? "✓" : "✗"} {initialQuestion.isCorrect ? "Correct" : "Wrong"}
                  </span>
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold truncate ${
                    isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"
                  }`}>
                    {initialQuestion.category}
                  </span>
                </div>
              </div>

              {/* Messages - Scrollable, Flexible Height */}
              <div className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 ${isDark ? "bg-gray-800" : "bg-gray-50"} min-h-0`}>
                {chatMessages.length === 0 && !isLoading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center px-4">
                      <Bot className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                      <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Ask me anything about this question!
                      </p>
                    </div>
                  </div>
                )}
                
                {chatMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                          : isDark
                          ? "bg-gray-700 text-gray-200"
                          : "bg-white text-gray-900 shadow-md"
                      }`}
                    >
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${isDark ? "bg-gray-700" : "bg-white shadow-md"}`}>
                      <div className="flex gap-1.5 sm:gap-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input - Fixed at bottom, Mobile Optimized */}
              <div className={`${isDark ? "bg-gray-900 border-t border-gray-800" : "bg-white border-t border-gray-200"} p-2.5 sm:p-4 flex-shrink-0`}>
                <div className="flex gap-1.5 sm:gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAskAI()}
                    placeholder="Ask about this question..."
                    disabled={isLoading}
                    className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-lg sm:rounded-xl border outline-none ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                    } disabled:opacity-50`}
                  />
                  <button
                    onClick={handleAskAI}
                    disabled={isLoading || !userInput.trim()}
                    className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <p className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  Press Enter to send
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return null;
}