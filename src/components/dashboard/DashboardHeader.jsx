import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageCircle, Send, X, Sparkles, Zap } from "lucide-react";

const DashboardHeader = ({ 
  theme = "light", 
  title = "Welcome back, Guest!", 
  subtitle = "Here's your learning progress overview.",
  analyticsData = null // ✅ NEW: Accept analytics data as prop
}) => {
  const isDark = theme === "dark";
  const [showAICoach, setShowAICoach] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = React.useRef(null);

  // Auto-scroll to bottom when messages change
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
      
      // ✅ Include analytics data in the request
      const body = {
        message: userInput,
        conversationHistory: chatMessages,
        // Include user performance data if available
        userData: analyticsData ? {
          avgScore: analyticsData.avgScore,
          totalExams: analyticsData.totalExams,
          sections: analyticsData.sections,
          timeMetrics: analyticsData.timeMetrics,
          recentAttempts: analyticsData.recentAttempts?.slice(0, 3) // Last 3 attempts
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

  // ✅ Handle quick suggestion clicks with analytics context
  const handleSuggestionClick = (suggestionText) => {
    setUserInput(suggestionText);
    // Auto-send for "Analyze my progress"
    if (suggestionText === "Analyze my progress") {
      setTimeout(() => {
        // Trigger the send
        const input = suggestionText;
        setUserInput("");
        
        const newMessage = { role: "user", content: input };
        setChatMessages([newMessage]);
        setIsLoading(true);

        const token = localStorage.getItem('token');
        
        // ✅ DEBUG: Check if analyticsData exists
        console.log('📊 Analytics Data Available?', !!analyticsData);
        if (analyticsData) {
          console.log('✅ Analytics Data:', {
            avgScore: analyticsData.avgScore,
            totalExams: analyticsData.totalExams,
            sections: analyticsData.sections
          });
        } else {
          console.warn('⚠️ analyticsData is NULL or undefined!');
        }
        
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
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title Section */}
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

          {/* Right: Compact AI Coach Button */}
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
              {/* Animated Bot Icon */}
              <motion.div
                animate={{ 
                  y: [0, -2, 0],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                
                {/* Sparkle Effect */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity 
                  }}
                  className="absolute -top-0.5 -right-0.5"
                >
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                </motion.div>
              </motion.div>

              {/* Text - Hidden on mobile */}
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

              {/* Mobile: Just icon */}
              <MessageCircle className={`w-4 h-4 md:hidden ${isDark ? "text-blue-400" : "text-blue-600"}`} />
            </div>

            {/* Glow Effect on Hover */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </motion.button>
        </div>
      </motion.header>

      {/* AI Coach Modal */}
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
              className={`w-full max-w-2xl ${isDark ? "bg-gray-900" : "bg-white"} rounded-2xl shadow-2xl overflow-hidden`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <Bot className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-white font-bold text-lg">AI Study Coach</h3>
                    <p className="text-white/80 text-sm">Your 24/7 learning companion</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAICoach(false)}
                  className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Messages */}
              <div className={`h-96 overflow-y-auto p-5 space-y-4 ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                {chatMessages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="mb-4"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                        <Bot className="w-10 h-10 text-white" />
                      </div>
                    </motion.div>
                    <h4 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                      Hi! I'm your AI Study Coach
                    </h4>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"} max-w-md`}>
                      Ask me about study strategies, exam tips, or let me analyze your performance to create a personalized learning plan!
                    </p>
                    
                    {/* Quick Suggestions */}
                    <div className="grid grid-cols-2 gap-2 mt-6 w-full max-w-lg">
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
                          className={`p-3 rounded-xl text-left transition-all ${
                            isDark 
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                              : "bg-white hover:bg-gray-50 text-gray-900 shadow-sm"
                          }`}
                        >
                          <span className="text-lg mr-2">{suggestion.icon}</span>
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
                      className={`max-w-[80%] p-4 rounded-2xl ${
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
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className={`p-4 rounded-2xl ${isDark ? "bg-gray-700 shadow-lg" : "bg-white shadow-md border border-gray-200"}`}>
                      <div className="flex items-center gap-2">
                        <Bot className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ 
                                scale: [1, 1.3, 1],
                                opacity: [0.5, 1, 0.5] 
                              }}
                              transition={{ 
                                duration: 1, 
                                repeat: Infinity,
                                delay: i * 0.2
                              }}
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

              {/* Input */}
              <div className={`${isDark ? "bg-gray-900 border-t border-gray-800" : "bg-white border-t border-gray-200"} p-4`}>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAskAI()}
                    placeholder="Ask about study tips, exam strategies..."
                    disabled={isLoading}
                    className={`flex-1 px-4 py-3 rounded-xl border outline-none transition-all ${
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
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Zap className={`w-3 h-3 ${isDark ? "text-yellow-500" : "text-yellow-600"}`} />
                  <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
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