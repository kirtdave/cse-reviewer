import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles } from "lucide-react";

export function AIStudyTipsModal({ isOpen, onClose, theme = "light", analyticsData }) {
  const isDark = theme === "dark";
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && analyticsData) {
      generatePersonalizedTips();
    }
  }, [isOpen, analyticsData]);

  const generatePersonalizedTips = async () => {
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
          message: "Generate 10 personalized study tips for me based on my performance data. Format each tip as: ICON|TITLE|DESCRIPTION (e.g., 📚|Review Mistakes|Focus on your 15 recent errors in Numerical Ability). Be specific and actionable.",
          conversationHistory: [],
          userData: {
            avgScore: analyticsData.avgScore,
            totalExams: analyticsData.totalExams,
            sections: analyticsData.sections,
            timeMetrics: analyticsData.timeMetrics,
            recentAttempts: analyticsData.recentAttempts?.slice(0, 3)
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const parsedTips = parseAIResponse(data.response);
        setTips(parsedTips);
      } else {
        setTips(getFallbackTips());
      }
    } catch (error) {
      console.error('Error generating tips:', error);
      setTips(getFallbackTips());
    } finally {
      setIsLoading(false);
    }
  };

  const parseAIResponse = (response) => {
    const lines = response.split('\n').filter(line => line.trim());
    const tips = [];
    
    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length >= 3) {
        tips.push({
          icon: parts[0].trim(),
          title: parts[1].trim(),
          description: parts[2].trim()
        });
      } else {
        const match = line.match(/([📚📊🎯💪⏰🧘✍️🏆🎓🤝💡🔥⚡📖🌟]+)\s*(.+?)[:.-]\s*(.+)/);
        if (match) {
          tips.push({
            icon: match[1],
            title: match[2].trim(),
            description: match[3].trim()
          });
        }
      }
    }
    
    return tips.length > 0 ? tips.slice(0, 10) : getFallbackTips();
  };

  const getFallbackTips = () => {
    const weak = Object.entries(analyticsData?.sections || {})
      .filter(([_, score]) => score > 0 && score < 65)
      .map(([name]) => name);
    
    const avgScore = analyticsData?.avgScore || 0;
    const totalExams = analyticsData?.totalExams || 0;
    
    return [
      { icon: "📚", title: "Focus on Weak Areas", description: weak.length > 0 ? `Spend 60% of your study time on ${weak[0]} where you scored ${analyticsData.sections[weak[0]]}%` : "Complete more tests to identify your weak areas" },
      { icon: "⏰", title: "Time Management", description: analyticsData?.timeMetrics?.avgTimePerQuestion > 60 ? `Work on speed - you're averaging ${analyticsData.timeMetrics.avgTimePerQuestion}s per question. Aim for under 60s` : "Your time management is good! Keep maintaining your pace" },
      { icon: "🎯", title: "Consistency", description: totalExams < 5 ? `Take more practice tests! You've only completed ${totalExams}. Aim for 3 tests per week` : "Great consistency! Keep taking regular practice tests" },
      { icon: "💪", title: "Progressive Difficulty", description: avgScore < 70 ? "Start with Easy questions to build confidence, then progress to Normal" : "Challenge yourself with Hard difficulty to push beyond your comfort zone" },
      { icon: "🧘", title: "Strategic Breaks", description: "Take 5-minute breaks every 25 minutes. Your brain consolidates information during rest" },
      { icon: "📊", title: "Weekly Reviews", description: "Check your analytics every Sunday to track improvement and adjust your study plan" },
      { icon: "✍️", title: "Error Journal", description: analyticsData?.recentAttempts?.length > 0 ? `Review your ${analyticsData.recentAttempts[0].details?.incorrectQuestions || 0} recent mistakes` : "Start maintaining an error journal to identify patterns" },
      { icon: "🎓", title: "Understand Concepts", description: "Focus on WHY answers are correct. Understanding lasts longer than memorization" },
      { icon: "🏆", title: "Celebrate Progress", description: avgScore > 0 ? `You've improved to ${avgScore}% average! Keep up the momentum` : "Complete your first test to start tracking your progress" },
      { icon: "🔥", title: "Build Momentum", description: "Study at the same time each day. Consistency builds habits and improves retention by 80%" }
    ];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${isDark ? "bg-gray-900" : "bg-white"} rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 max-w-3xl w-full shadow-2xl max-h-[85vh] overflow-hidden flex flex-col`}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
              <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 min-w-0">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0"
                >
                  <Sparkles className="w-5 h-5 sm:w-5.5 sm:h-5.5 lg:w-6 lg:h-6 text-white" />
                </motion.div>
                <div className="min-w-0">
                  <h3 className={`text-base sm:text-lg lg:text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>
                    AI-Powered Study Tips
                  </h3>
                  <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} truncate`}>
                    Personalized for your performance
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 sm:p-2 rounded-lg ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors flex-shrink-0`}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 sm:py-16 lg:py-20">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 text-purple-500 animate-spin mx-auto mb-3 sm:mb-4" />
                    <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} px-4`}>
                      AI is analyzing your performance to generate personalized tips...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4 mb-4 sm:mb-5 lg:mb-6">
                  {tips.map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-3 sm:p-3.5 lg:p-4 rounded-lg lg:rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"} border ${isDark ? "border-gray-700" : "border-gray-200"} hover:shadow-lg transition-all`}
                    >
                      <div className="flex items-start gap-2 sm:gap-2.5 lg:gap-3">
                        <span className="text-xl sm:text-2xl flex-shrink-0">{tip.icon}</span>
                        <div className="min-w-0">
                          <h4 className={`font-semibold text-xs sm:text-sm lg:text-base mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                            {tip.title}
                          </h4>
                          <p className={`text-[11px] sm:text-xs lg:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} leading-relaxed`}>
                            {tip.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className={`flex-1 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg lg:rounded-xl border-2 font-semibold transition-all ${
                  isDark
                    ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Close
              </button>
              <button
                onClick={generatePersonalizedTips}
                className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg lg:rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:shadow-xl transition-all"
              >
                Regenerate Tips
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}