import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Lightbulb, CheckCircle, BookOpen, Target, Clock } from "lucide-react";

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
export function StudyTipsModal({ isOpen, onClose, theme = "light" }) {
  const isDark = theme === "dark";

  const tips = [
    { icon: "📚", title: "Review Within 24 Hours", description: "Review mistakes while they're fresh in your memory. This improves retention by 80%." },
    { icon: "⏰", title: "Consistent Timing", description: "Study at the same time each day. Your brain learns to focus better during these hours." },
    { icon: "🎯", title: "60/40 Rule", description: "Spend 60% of time on weak areas, 40% on maintaining strengths. This balanced approach accelerates improvement." },
    { icon: "💪", title: "Progressive Difficulty", description: "Start with easy questions, gradually increase difficulty as confidence builds." },
    { icon: "🧘", title: "Strategic Breaks", description: "Take 5-minute breaks every 25 minutes. Your brain consolidates information during rest." },
    { icon: "📊", title: "Weekly Progress Check", description: "Review your analytics every Sunday. Celebrate improvements, adjust weak areas." },
    { icon: "🤝", title: "Peer Learning", description: "Explain concepts to others. Teaching is the best way to solidify understanding." },
    { icon: "✍️", title: "Error Journal", description: "Write down why you got questions wrong. Patterns emerge that guide your study focus." },
    { icon: "🎓", title: "Understand, Don't Memorize", description: "Focus on WHY answers are correct. Understanding lasts, memorization fades." },
    { icon: "🏆", title: "Celebrate Small Wins", description: "Every improvement deserves recognition. Positive reinforcement builds momentum." },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${isDark ? "bg-gray-900" : "bg-white"} rounded-2xl p-6 max-w-3xl w-full shadow-2xl max-h-[80vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    AI Study Tips
                  </h3>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Proven strategies for exam success
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}
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

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:shadow-xl transition-all"
            >
              Apply These Tips
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}