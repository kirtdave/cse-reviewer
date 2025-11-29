import React from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, Lightbulb } from "lucide-react";

export default function AnalyticsRecommendations({ theme = "light", data }) {
  const isDark = theme === "dark";

  // Use real exam attempts or fallback
  const examResults = data?.recentAttempts?.slice(0, 3).map((attempt, index) => ({
    title: attempt.title,
    score: attempt.score,
    accuracy: attempt.accuracy,
    time: attempt.time,
    status: attempt.result,
    gradient: attempt.result === "Passed" 
      ? index === 0 ? "from-green-500 to-emerald-500" : "from-blue-500 to-cyan-500"
      : "from-red-500 to-pink-500"
  })) || [];

  // Use real recommendations from analytics service
  const recommendations = data?.recommendations || [
    { 
      icon: "fa-info-circle", 
      text: "Complete more tests to unlock personalized AI recommendations.", 
      color: "from-blue-500 to-purple-500", 
      insight: "Data collection in progress" 
    }
  ];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Mock Exam Results */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className={`${isDark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-xl p-6 rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-clipboard-list text-white"></i>
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Recent Mock Exam Results
            </h3>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              AI-analyzed performance overview
            </p>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Brain className={`w-5 h-5 ${isDark ? "text-purple-500" : "text-purple-600"}`} />
          </motion.div>
        </div>

        {examResults.length > 0 ? (
          <div className="space-y-3">
            {examResults.map((exam, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`relative overflow-hidden p-4 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-gray-50/50"} border ${isDark ? "border-gray-700/50" : "border-gray-200/50"} transition-all group`}
              >
                {/* Hover gradient effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${exam.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {exam.title}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      exam.status === "Passed" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {exam.status === "Passed" ? "✓" : "✗"} {exam.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Score</p>
                      <p className={`text-lg font-bold bg-gradient-to-r ${exam.gradient} bg-clip-text text-transparent`}>
                        {exam.score}%
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Accuracy</p>
                      <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {exam.accuracy}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Time</p>
                      <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {exam.time}
                      </p>
                    </div>
                  </div>

                  <div className={`h-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"} overflow-hidden`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${exam.score}%` }}
                      transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                      className={`h-2 rounded-full bg-gradient-to-r ${exam.gradient}`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            <i className="fa-solid fa-inbox text-4xl mb-3"></i>
            <p>No recent exams found</p>
            <p className="text-sm mt-2">Take a test to see your results here</p>
          </div>
        )}
      </motion.div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className={`${isDark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-xl p-6 rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl flex flex-col`}
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg"
          >
            <i className="fa-solid fa-robot text-white"></i>
          </motion.div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              AI Recommendations
            </h3>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Personalized guidance for improvement
            </p>
          </div>
          <div className="flex items-center gap-1">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-green-500"
            />
            <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-600"}`}>Live</span>
          </div>
        </div>

        <div className="space-y-3 flex-1">
          {recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ x: 5 }}
              className={`relative overflow-hidden flex items-start gap-3 p-3 rounded-xl ${isDark ? "bg-gray-800/30" : "bg-gray-50/50"} hover:bg-gray-800/50 transition-all group cursor-pointer`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${rec.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${rec.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
              >
                <i className={`fa-solid ${rec.icon} text-white text-sm`}></i>
              </motion.div>
              
              <div className="flex-1">
                <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"} leading-relaxed mb-1`}>
                  {rec.text}
                </p>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-600"} italic`}>
                    {rec.insight}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`mt-4 p-4 rounded-xl ${isDark ? "bg-blue-500/10" : "bg-blue-50"} border ${isDark ? "border-blue-500/20" : "border-blue-200"}`}
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5" />
            <p className={`text-xs ${isDark ? "text-blue-300" : "text-blue-700"}`}>
              <span className="font-semibold">Pro Tip:</span> Combine these AI recommendations with your Strengths & Weaknesses analysis for maximum improvement.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}