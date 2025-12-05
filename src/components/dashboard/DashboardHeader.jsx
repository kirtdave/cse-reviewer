import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageCircle, Send, X, Sparkles, Zap } from "lucide-react";

const DashboardHeader = ({ 
  theme = "light", 
  title = "Welcome back, Guest!", 
  subtitle = "Here's your learning progress overview.",
  analyticsData = null
}) => {
  const isDark = theme === "dark";
  const [showAICoach, setShowAICoach] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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
        userData: analyticsData ? {
          avgScore: analyticsData.avgScore,
          totalExams: analyticsData.totalExams,
          sections: analyticsData.sections,
          timeMetrics: analyticsData.timeMetrics,
          recentAttempts: analyticsData.recentAttempts?.slice(0, 3)
        } : null
      };

      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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

  const handleSuggestionClick = (suggestionText) => {
    setUserInput(suggestionText);
    if (suggestionText === "Analyze my progress") {
      setTimeout(() => {
        const input = suggestionText;
        setUserInput("");
        
        const newMessage = { role: "user", content: input };
        setChatMessages([newMessage]);
        setIsLoading(true);

        const token = localStorage.getItem('token');
        
        fetch('http://localhost:5000/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            message: input,
            conversationHistory: [],
            userData: analyticsData ? {
              avgScore: analyticsData.avgScore,
              totalExams: analyticsData.totalExams,
              sections: analyticsData.sections,
              timeMetrics: analyticsData.timeMetrics,
              recentAttempts: analyticsData.recentAttempts?.slice(0, 3)
            } : null
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setChatMessages(prev => [...prev, { role: "assistant", content: data.response }]);
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('AI Chat error:', error);
          setChatMessages(prev => [...prev, { 
            role: "assistant", 
            content: "Sorry, I'm having trouble connecting right now." 
          }]);
          setIsLoading(false);
        });
      }, 100);
    }
  };

  return (
    <>
      {/* MOBILE HEADER - Compact */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`lg:hidden ${isDark ? "bg-gray-800/60" : "bg-white/60"} backdrop-blur-xl rounded-xl p-4 shadow-lg border ${isDark ? "border-gray-700" : "border-gray-200"}`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Title Section - Compact */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
              <i className="fa-solid fa-house text-white text-lg"></i>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>
                {title.split(',')[0]}
              </h1>
              <p className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium truncate">
                Your progress
              </p>
            </div>
          </div>

          {/* AI Coach Button - Mobile */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAICoach(true)}
            className="relative flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-400" />
            </motion.div>
          </motion.button>
        </div>
      </motion.header>

      {/* DESKTOP HEADER - Original */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`hidden lg:block ${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <i className="fa-solid fa-house text-white text-2xl"></i>
            </div>
            <div className="min-w-0">
              <h1 className={`text-xl md:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>
                {title}
              </h1>
              <p className="text-xs md:text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium truncate">
                {subtitle}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAICoach(true)}
            className="relative group flex-shrink-0"
          >
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              isDark 
                ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30" 
                : "bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200"
            }`}>
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-0.5 -right-0.5"
                >
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                </motion.div>
              </motion.div>
              <div className="hidden md:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-xs ${isDark ? "text-white" : "text-gray-900"}`}>
                    AI Coach
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-green-500/20 text-green-500 animate-pulse">
                    LIVE
                  </span>
                </div>
                <p className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Ask me anything
                </p>
              </div>
              <MessageCircle className={`w-4 h-4 md:hidden ${isDark ? "text-blue-400" : "text-blue-600"}`} />
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </motion.button>
        </div>
      </motion.header>

      {/* AI Coach Modal - Responsive */}
      <AnimatePresence>
        {showAICoach && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAICoach(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl ${isDark ? "bg-gray-900" : "bg-white"} rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 lg:p-5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-10 lg:w-12 h-10 lg:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <Bot className="w-5 lg:w-7 h-5 lg:h-7 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-white font-bold text-base lg:text-lg">AI Study Coach</h3>
                    <p className="text-white/80 text-xs lg:text-sm">Your 24/7 learning companion</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAICoach(false)}
                  className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 lg:w-6 h-5 lg:h-6" />
                </button>
              </div>

              {/* Messages - Scrollable */}
              <div className={`flex-1 overflow-y-auto p-4 lg:p-5 space-y-3 lg:space-y-4 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                {chatMessages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="mb-4"
                    >
                      <div className="w-16 lg:w-20 h-16 lg:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                        <Bot className="w-8 lg:w-10 h-8 lg:h-10 text-white" />
                      </div>
                    </motion.div>
                    <h4 className={`text-base lg:text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                      Hi! I'm your AI Study Coach
                    </h4>
                    <p className={`text-xs lg:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} max-w-md px-4`}>
                      Ask me about study strategies, exam tips, or let me analyze your performance!
                    </p>
                    
                    {/* Quick Suggestions - Mobile Optimized */}
                    <div className="grid grid-cols-2 gap-2 mt-6 w-full max-w-lg px-4">
                      {[
                        { icon: "📊", text: "Analyze my progress" },
                        { icon: "💡", text: "Study tips" },
                        { icon: "📝", text: "Create practice quiz" },
                        { icon: "🎯", text: "Set study goals" }
                      ].map((suggestion, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSuggestionClick(suggestion.text)}
                          className={`p-2.5 lg:p-3 rounded-xl text-left transition-all ${
                            isDark 
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                              : "bg-white hover:bg-gray-50 text-gray-900 shadow-sm"
                          }`}
                        >
                          <span className="text-base lg:text-lg mr-2">{suggestion.icon}</span>
                          <span className="text-xs font-medium">{suggestion.text}</span>
                        </motion.button>
                      ))}
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
                      className={`max-w-[85%] p-3 lg:p-4 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                          : isDark
                          ? "bg-gray-700 text-gray-200 shadow-lg"
                          : "bg-white text-gray-900 shadow-md border border-gray-200"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                          <span className={`text-xs font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                            AI Coach
                          </span>
                        </div>
                      )}
                      <p className="text-xs lg:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className={`p-3 lg:p-4 rounded-2xl ${isDark ? "bg-gray-700 shadow-lg" : "bg-white shadow-md border border-gray-200"}`}>
                      <div className="flex items-center gap-2">
                        <Bot className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                              className="w-2 h-2 bg-blue-500 rounded-full"
                            />
                          ))}
                        </div>
                        <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input - Fixed at bottom */}
              <div className={`${isDark ? "bg-gray-900 border-t border-gray-800" : "bg-white border-t border-gray-200"} p-3 lg:p-4 flex-shrink-0`}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAskAI()}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className={`flex-1 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl border outline-none transition-all text-sm ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"
                    } disabled:opacity-50`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAskAI}
                    disabled={isLoading || !userInput.trim()}
                    className="px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 lg:w-5 h-4 lg:h-5" />
                  </motion.button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Zap className={`w-3 h-3 ${isDark ? "text-yellow-500" : "text-yellow-600"}`} />
                  <p className={`text-[10px] lg:text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    Press Enter to send • Powered by AI
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardHeader;