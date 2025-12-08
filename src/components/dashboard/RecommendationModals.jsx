import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Loader2, Sparkles, BookOpen, CheckCircle, Clock, Target } from "lucide-react";

// ========== STUDY SCHEDULE MODAL ==========
export function StudyScheduleModal({ isOpen, onClose, theme = "light", weakTopic }) {
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const schedule = [
    { day: "Monday", topic: weakTopic || "Verbal Ability", duration: 30, type: "Focus Practice", difficulty: "Normal" },
    { day: "Tuesday", topic: "Mixed Review", duration: 20, type: "Quick Review", difficulty: "Easy" },
    { day: "Wednesday", topic: "Numerical Ability", duration: 30, type: "Skills Building", difficulty: "Normal" },
    { day: "Thursday", topic: "Rest Day", duration: 0, type: "Light Reading", difficulty: "Easy" },
    { day: "Friday", topic: "Full Mock Exam", duration: 90, type: "Timed Test", difficulty: "Hard" },
    { day: "Saturday", topic: "Review Mistakes", duration: 45, type: "Error Analysis", difficulty: "Normal" },
    { day: "Sunday", topic: "Weak Areas", duration: 60, type: "Deep Practice", difficulty: "Hard" },
  ];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = schedule.find(s => s.day === today) || schedule[0];

  const handleStartPractice = (scheduleItem) => {
    if (scheduleItem.topic === "Rest Day") {
      alert("Today is a rest day! Take a break 😊");
      return;
    }
    
    if (scheduleItem.topic === "Full Mock Exam") {
      onClose();
      navigate('/test');
      return;
    }

    navigate('/actualtest', {
      state: {
        selectedType: "Scheduled Practice",
        timeLimit: scheduleItem.duration,
        categories: [
          scheduleItem.topic === "Mixed Review" ? "Verbal Ability" : 
          scheduleItem.topic === "Weak Areas" ? weakTopic || "Verbal Ability" : 
          scheduleItem.topic
        ],
        questions: [],
        theme,
        isScheduledPractice: true,
        scheduleType: scheduleItem.type,
        difficulty: scheduleItem.difficulty,
        continuousGeneration: true
      }
    });
    
    onClose();
  };

  const handleStartToday = () => {
    handleStartPractice(todaySchedule);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm pt-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${isDark ? "bg-gray-900" : "bg-white"} rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
              <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className={`text-sm sm:text-base lg:text-lg font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>
                    Your Personalized Study Schedule
                  </h3>
                  <p className={`text-[10px] sm:text-xs ${isDark ? "text-gray-400" : "text-gray-600"} truncate`}>
                    AI-optimized for maximum improvement
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

            <div className="space-y-2 sm:space-y-2.5 lg:space-y-3 mb-4 sm:mb-5 lg:mb-6">
              {schedule.map((item, i) => {
                const isToday = item.day === today;
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleStartPractice(item)}
                    className={`p-3 sm:p-3.5 lg:p-4 rounded-lg lg:rounded-xl cursor-pointer transition-all ${
                      isToday 
                        ? `${isDark ? "bg-green-500/20 border-green-500" : "bg-green-50 border-green-300"} border-2`
                        : `${isDark ? "bg-gray-800" : "bg-gray-50"} border ${isDark ? "border-gray-700" : "border-gray-200"}`
                    } hover:shadow-lg`}
                  >
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-xs sm:text-sm lg:text-base ${
                          isToday 
                            ? "text-green-500" 
                            : isDark ? "text-white" : "text-gray-900"
                        }`}>
                          {item.day}
                          {isToday && " (Today)"}
                        </span>
                      </div>
                      <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium ${
                        item.type === "Timed Test" 
                          ? "bg-purple-500/20 text-purple-400"
                          : item.type === "Focus Practice"
                          ? "bg-blue-500/20 text-blue-400"
                          : item.type === "Rest Day"
                          ? "bg-gray-500/20 text-gray-400"
                          : "bg-orange-500/20 text-orange-400"
                      }`}>
                        {item.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} truncate pr-2`}>
                        {item.topic}
                      </span>
                      <span className={`text-xs sm:text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} flex-shrink-0`}>
                        {item.duration > 0 ? `${item.duration} min` : "—"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className={`p-3 sm:p-3.5 lg:p-4 rounded-lg lg:rounded-xl ${isDark ? "bg-blue-500/10" : "bg-blue-50"} border ${isDark ? "border-blue-500/20" : "border-blue-200"} mb-3 sm:mb-4`}>
              <p className={`text-xs sm:text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                💡 <span className="font-semibold">Pro Tip:</span> Consistency beats intensity. 
                Stick to this schedule for 3 weeks and see your scores improve by 15-20%!
              </p>
            </div>

            <button
              onClick={handleStartToday}
              className="w-full py-2.5 sm:py-3 rounded-lg lg:rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm sm:text-base font-semibold hover:shadow-xl transition-all"
            >
              Start Today's Session: {todaySchedule.topic}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ========== AI STUDY TIPS MODAL - ✅ FIXED ABORT ERROR ==========
export function AIStudyTipsModal({ isOpen, onClose, theme = "light", analyticsData }) {
  const isDark = theme === "dark";
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);

  useEffect(() => {
    if (isOpen && analyticsData) {
      // ✅ Show fallback tips immediately, DON'T call AI automatically
      setTips(getFallbackTips());
    }
  }, [isOpen, analyticsData]);

  const generatePersonalizedTips = async () => {
    // ✅ Safety check: Don't call API if analyticsData is missing
    if (!analyticsData) {
      console.error('No analytics data available');
      return;
    }

    setIsLoading(true);
    
    // ✅ CRITICAL FIX: Declare controller and timeoutId in outer scope
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
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
            avgScore: analyticsData?.avgScore || 0,
            totalExams: analyticsData?.totalExams || 0,
            sections: analyticsData?.sections || {},
            timeMetrics: analyticsData?.timeMetrics || {},
            recentAttempts: analyticsData?.recentAttempts?.slice(0, 3) || []
          }
        }),
        signal: controller.signal
      });

      // ✅ CRITICAL FIX: Clear timeout immediately after successful response
      clearTimeout(timeoutId);

      const data = await response.json();
      
      if (data.success && data.response) {
        const parsedTips = parseAIResponse(data.response);
        if (parsedTips.length > 0) {
          setTips(parsedTips);
        }
      }
    } catch (error) {
      // ✅ CRITICAL FIX: Clear timeout in catch block too
      clearTimeout(timeoutId);
      
      console.error('Error generating tips:', error);
      
      // ✅ Show user-friendly error message
      if (error.message?.includes('AI_OVERLOAD') || error.message?.includes('quota')) {
        alert('⚠️ AI quota exceeded. Please wait a minute and try again.\n\nThe tips shown are already personalized based on your performance data!');
      }
      
      // Keep fallback tips if AI fails
    } finally {
      setIsLoading(false);
      setUseAI(false); // ✅ Reset AI flag
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
    
    return tips.length > 0 ? tips.slice(0, 10) : [];
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

  const handleRegenerateTips = async () => {
    setUseAI(true);
    await generatePersonalizedTips();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm pt-20">
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
              {isLoading && (
                <div className="flex items-center justify-center py-4 mb-4">
                  <Loader2 className="w-6 h-6 text-purple-500 animate-spin mr-2" />
                  <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    AI is generating personalized tips...
                  </p>
                </div>
              )}
              
              {!isLoading && !useAI && (
                <div className={`mb-4 p-3 rounded-lg ${isDark ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50 border border-blue-200"}`}>
                  <p className={`text-xs sm:text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                    💡 <span className="font-semibold">Smart Tips Ready!</span> These are personalized based on your test performance. Click "Generate AI Tips" below for even more specific recommendations.
                  </p>
                </div>
              )}
              
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
                onClick={handleRegenerateTips}
                disabled={isLoading}
                className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg lg:rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Tips</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ========== STUDY GUIDE MODAL ==========
export { StudyGuideModal } from './StudyGuideModal';