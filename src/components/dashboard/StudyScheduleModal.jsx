import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar } from "lucide-react";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
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