import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Lightbulb, Loader2, Sparkles } from "lucide-react";

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

  // Navigate to ActualTest with scheduled practice mode
  navigate('/actualtest', {
    state: {
      selectedType: "Scheduled Practice",
      timeLimit: scheduleItem.duration, // Duration in minutes
      categories: [
        scheduleItem.topic === "Mixed Review" ? "Verbal Ability" : 
        scheduleItem.topic === "Weak Areas" ? weakTopic || "Verbal Ability" : 
        scheduleItem.topic
      ],
      questions: [], // Start empty, will be generated
      theme,
      isScheduledPractice: true, // NEW FLAG
      scheduleType: scheduleItem.type,
      difficulty: scheduleItem.difficulty,
      continuousGeneration: true // Enable continuous question loading
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-0 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${isDark ? "bg-gray-900" : "bg-white"} rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Your Personalized Study Schedule
                  </h3>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    AI-optimized for maximum improvement
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {schedule.map((item, i) => {
                const isToday = item.day === today;
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleStartPractice(item)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      isToday 
                        ? `${isDark ? "bg-green-500/20 border-green-500" : "bg-green-50 border-green-300"} border-2`
                        : `${isDark ? "bg-gray-800" : "bg-gray-50"} border ${isDark ? "border-gray-700" : "border-gray-200"}`
                    } hover:shadow-lg`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${
                          isToday 
                            ? "text-green-500" 
                            : isDark ? "text-white" : "text-gray-900"
                        }`}>
                          {item.day}
                          {isToday && " (Today)"}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                      <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {item.topic}
                      </span>
                      <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        {item.duration > 0 ? `${item.duration} min` : "—"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className={`p-4 rounded-xl ${isDark ? "bg-blue-500/10" : "bg-blue-50"} border ${isDark ? "border-blue-500/20" : "border-blue-200"} mb-4`}>
              <p className={`text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                💡 <span className="font-semibold">Pro Tip:</span> Consistency beats intensity. 
                Stick to this schedule for 3 weeks and see your scores improve by 15-20%!
              </p>
            </div>

            <button
              onClick={handleStartToday}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-xl transition-all"
            >
              Start Today's Session: {todaySchedule.topic}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Study Guide Modal - Comprehensive category guides
export { StudyGuideModal } from './StudyGuideModal';

// Study Tips Modal
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
      
      // Call AI to generate personalized tips based on user data
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
        // Parse AI response into tips array
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
    // Try to extract tips from AI response
    const lines = response.split('\n').filter(line => line.trim());
    const tips = [];
    
    for (const line of lines) {
      // Look for pattern: EMOJI|TITLE|DESCRIPTION or variations
      const parts = line.split('|');
      if (parts.length >= 3) {
        tips.push({
          icon: parts[0].trim(),
          title: parts[1].trim(),
          description: parts[2].trim()
        });
      } else {
        // Try to extract from natural language
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
      { 
        icon: "📚", 
        title: "Focus on Weak Areas", 
        description: weak.length > 0 
          ? `Spend 60% of your study time on ${weak[0]} where you scored ${analyticsData.sections[weak[0]]}%`
          : "Complete more tests to identify your weak areas"
      },
      { 
        icon: "⏰", 
        title: "Time Management", 
        description: analyticsData?.timeMetrics?.avgTimePerQuestion > 60 
          ? `Work on speed - you're averaging ${analyticsData.timeMetrics.avgTimePerQuestion}s per question. Aim for under 60s`
          : "Your time management is good! Keep maintaining your pace"
      },
      { 
        icon: "🎯", 
        title: "Consistency", 
        description: totalExams < 5 
          ? `Take more practice tests! You've only completed ${totalExams}. Aim for 3 tests per week`
          : "Great consistency! Keep taking regular practice tests"
      },
      { 
        icon: "💪", 
        title: "Progressive Difficulty", 
        description: avgScore < 70 
          ? "Start with Easy questions to build confidence, then progress to Normal"
          : "Challenge yourself with Hard difficulty to push beyond your comfort zone"
      },
      { 
        icon: "🧘", 
        title: "Strategic Breaks", 
        description: "Take 5-minute breaks every 25 minutes. Your brain consolidates information during rest"
      },
      { 
        icon: "📊", 
        title: "Weekly Reviews", 
        description: "Check your analytics every Sunday to track improvement and adjust your study plan"
      },
      { 
        icon: "✍️", 
        title: "Error Journal", 
        description: analyticsData?.recentAttempts?.length > 0
          ? `Review your ${analyticsData.recentAttempts[0].details?.incorrectQuestions || 0} recent mistakes`
          : "Start maintaining an error journal to identify patterns"
      },
      { 
        icon: "🎓", 
        title: "Understand Concepts", 
        description: "Focus on WHY answers are correct. Understanding lasts longer than memorization"
      },
      { 
        icon: "🏆", 
        title: "Celebrate Progress", 
        description: avgScore > 0 
          ? `You've improved to ${avgScore}% average! Keep up the momentum`
          : "Complete your first test to start tracking your progress"
      },
      { 
        icon: "🔥", 
        title: "Build Momentum", 
        description: "Study at the same time each day. Consistency builds habits and improves retention by 80%"
      }
    ];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${isDark ? "bg-gray-900" : "bg-white"} rounded-2xl p-6 max-w-3xl w-full shadow-2xl max-h-[85vh] overflow-hidden flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    AI-Powered Study Tips
                  </h3>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Personalized for your performance
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      AI is analyzing your performance to generate personalized tips...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {tips.map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-4 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"} border ${isDark ? "border-gray-700" : "border-gray-200"} hover:shadow-lg transition-all`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                        <div>
                          <h4 className={`font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                            {tip.title}
                          </h4>
                          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {tip.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={onClose}
                className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                  isDark
                    ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Close
              </button>
              <button
                onClick={generatePersonalizedTips}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:shadow-xl transition-all"
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