import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Target, TrendingUp, Bot, Lightbulb, Activity, Clock, Zap } from "lucide-react";

// Smart Adaptive Engine - MOBILE RESPONSIVE ONLY
const AdaptiveEngine = ({ theme, data }) => {
  const isDark = theme === "dark";

  const getDifficultyLevel = () => {
    if (!data?.avgScore) return "Level 1 (Beginner)";
    if (data.avgScore >= 85) return "Level 4 (Advanced)";
    if (data.avgScore >= 75) return "Level 3 (Intermediate+)";
    if (data.avgScore >= 65) return "Level 2 (Intermediate)";
    return "Level 1 (Beginner)";
  };

  const weakestSection = data?.strengthsWeaknesses?.reduce((min, section) => 
    section.value < min.value ? section : min
  , { label: "Balanced", value: 100 });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${isDark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-xl p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl`}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center"
        >
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </motion.div>
        <div>
          <h3 className={`text-sm sm:text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Smart Adaptive Engine
          </h3>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Next exam customization
          </p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDark ? "bg-blue-500/10" : "bg-blue-50"} border ${isDark ? "border-blue-500/20" : "border-blue-200"}`}>
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          <div className="flex-1">
            <p className={`text-xs sm:text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Difficulty Level Adjusted
            </p>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {getDifficultyLevel()} - Based on {data?.totalExams || 0} completed exams
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDark ? "bg-purple-500/10" : "bg-purple-50"} border ${isDark ? "border-purple-500/20" : "border-purple-200"}`}>
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
          <div className="flex-1">
            <p className={`text-xs sm:text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Focus Distribution
            </p>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {weakestSection.value < 75 
                ? `25% ${weakestSection.label} • 75% Other sections`
                : "Balanced across all sections"}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDark ? "bg-green-500/10" : "bg-green-50"} border ${isDark ? "border-green-500/20" : "border-green-200"}`}>
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
          <div className="flex-1">
            <p className={`text-xs sm:text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Time Target Optimized
            </p>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Target: {data?.timeMetrics?.avgTimePerQuestion || 30} sec/question
              {data?.timeMetrics?.avgTimePerQuestion > 45 ? " - Speed training recommended" : ""}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Exam Readiness Forecast - KEEP DESKTOP LAYOUT EXACTLY THE SAME
const ExamReadinessForecast = ({ theme, data }) => {
  const isDark = theme === "dark";
  const readiness = data?.readiness || 0;
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (readiness / 100) * circumference;

  const passProbability = data?.avgScore >= 70 
    ? Math.min(95, 70 + (data.avgScore - 70) * 0.8)
    : Math.max(40, data?.avgScore * 0.8);

  const daysToMastery = data?.totalExams >= 3 
    ? Math.max(1, Math.round((100 - readiness) / 3))
    : 14;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${isDark ? "bg-gradient-to-br from-purple-900/40 to-pink-900/40" : "bg-gradient-to-br from-purple-50 to-pink-50"} backdrop-blur-xl p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${isDark ? "border-purple-500/30" : "border-purple-200"} shadow-xl`}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <h3 className={`text-sm sm:text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Exam Readiness Forecast
          </h3>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            AI-powered probability analysis
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative">
          <svg width="180" height="180" className="transform -rotate-90">
            <circle
              cx="90"
              cy="90"
              r="70"
              stroke={isDark ? "#374151" : "#E5E7EB"}
              strokeWidth="12"
              fill="none"
            />
            <motion.circle
              cx="90"
              cy="90"
              r="70"
              stroke="url(#readinessGradient)"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="none"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent`}>
              {readiness}%
            </span>
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Ready</span>
          </div>
        </div>

        <div className="flex-1 ml-6 space-y-3">
          <div className={`p-3 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-white/50"}`}>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} mb-1`}>
              Pass Probability
            </p>
            <p className={`text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent`}>
              {passProbability.toFixed(1)}%
            </p>
          </div>
          
          <div className={`p-3 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-white/50"}`}>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} mb-1`}>
              Projected Mastery
            </p>
            <p className={`text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent`}>
              {daysToMastery} days
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// AI Learning Curve - KEEP DESKTOP LAYOUT EXACTLY THE SAME
const AILearningCurve = ({ theme, data }) => {
  const isDark = theme === "dark";
  
  const learningData = data?.trend?.length > 0 
    ? [
        ...[...data.trend].reverse().map((item, index) => ({
          exam: `Mock ${index + 1}`,
          confidence: item.score,
          mastery: Math.max(0, item.score - 5)
        })),
        ...(data.trend.length >= 3 ? [{
          exam: "Projected",
          confidence: Math.min(100, data.trend[0].score + 5),
          mastery: Math.min(100, data.trend[0].score + 3)
        }] : [])
      ]
    : [
        { exam: "Start", confidence: 0, mastery: 0 },
        { exam: "Projected", confidence: 75, mastery: 70 }
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-xl p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl h-full flex flex-col`}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <h3 className={`text-sm sm:text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            AI Learning Curve
          </h3>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Performance progression over time
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={learningData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#E5E7EB"} />
            <XAxis 
              dataKey="exam" 
              tick={{ fill: isDark ? "#9CA3AF" : "#6B7280", fontSize: 11 }}
              axisLine={{ stroke: isDark ? "#374151" : "#E5E7EB" }}
            />
            <YAxis 
              tick={{ fill: isDark ? "#9CA3AF" : "#6B7280", fontSize: 11 }}
              axisLine={{ stroke: isDark ? "#374151" : "#E5E7EB" }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                borderRadius: "12px",
              }}
            />
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="masteryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            <Line 
              type="monotone" 
              dataKey="confidence" 
              stroke="url(#confidenceGradient)" 
              strokeWidth={3}
              dot={{ fill: "#3B82F6", r: 4 }}
              name="Your Score"
            />
            <Line 
              type="monotone" 
              dataKey="mastery" 
              stroke="url(#masteryGradient)" 
              strokeWidth={3}
              dot={{ fill: "#10B981", r: 4 }}
              name="AI Prediction"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// Strengths & Weaknesses - KEEP DESKTOP EXACTLY THE SAME
const StrengthsWeaknesses = ({ theme, data }) => {
  const isDark = theme === "dark";

  const strengthsData = data?.strengthsWeaknesses || [
    { label: "Verbal Ability", value: 0, type: "neutral", gradient: "from-gray-500 to-gray-600" },
    { label: "Numerical Ability", value: 0, type: "neutral", gradient: "from-gray-500 to-gray-600" },
    { label: "Analytical Ability", value: 0, type: "neutral", gradient: "from-gray-500 to-gray-600" },
    { label: "General Knowledge", value: 0, type: "neutral", gradient: "from-gray-500 to-gray-600" },
    { label: "Clerical Ability", value: 0, type: "neutral", gradient: "from-gray-500 to-gray-600" },
    { label: "Philippine Constitution", value: 0, type: "neutral", gradient: "from-gray-500 to-gray-600" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`${isDark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-xl p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl`}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-chart-simple text-white text-sm sm:text-base"></i>
          </div>
          <div>
            <h3 className={`text-sm sm:text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Strengths & Weaknesses
            </h3>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              AI-detected performance patterns
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <Activity className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-green-500" : "text-green-600"}`} />
        </motion.div>
      </div>

      <div className="max-h-[240px] overflow-y-auto pr-2 space-y-4 sm:space-y-5 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {strengthsData.map((sw, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {sw.label}
                </span>
                <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium flex items-center gap-1 ${
                  sw.type === "strength" 
                    ? "bg-green-500/20 text-green-400" 
                    : sw.type === "weakness"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}>
                  {sw.type === "strength" ? "✓ Strong" : sw.type === "weakness" ? "⚠ Weak" : "— Neutral"}
                </span>
              </div>
              <span className={`text-xs sm:text-sm font-bold bg-gradient-to-r ${sw.gradient} bg-clip-text text-transparent`}>
                {sw.value}%
              </span>
            </div>
            <div className={`h-2 sm:h-3 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"} overflow-hidden`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sw.value}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className={`h-2 sm:h-3 rounded-full bg-gradient-to-r ${sw.gradient} relative overflow-hidden`}
              >
                <motion.div
                  className="absolute inset-0 bg-white/30"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ width: "20%" }}
                />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {strengthsData.length > 4 && (
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`mt-4 text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          <i className="fa-solid fa-chevron-down text-xs"></i>
        </motion.div>
      )}
    </motion.div>
  );
};

// AI Persona Assistant - KEEP DESKTOP EXACTLY THE SAME
const AIPersonaAssistant = ({ theme, data }) => {
  const isDark = theme === "dark";
  const [message, setMessage] = useState(0);

  const getPersonalizedMessages = () => {
    const msgs = [];
    const sections = data?.strengthsWeaknesses || [];
    const strongSections = sections.filter(s => s.type === 'strength');
    const weakSections = sections.filter(s => s.type === 'weakness');

    if (strongSections.length > 0 && weakSections.length > 0) {
      msgs.push(`Hi! Your ${strongSections[0].label} is improving nicely! I'll help you focus on ${weakSections[0].label} next. 🎯`);
    }

    if (data?.timeMetrics?.avgTimePerQuestion > 45) {
      msgs.push("I've noticed you're taking extra time on questions. Let's work on pacing—accuracy over speed! 📊");
    }

    if (data?.timeMetrics?.consistency > 80) {
      msgs.push(`Great progress! Your consistency score is ${data.timeMetrics.consistency}%. Keep up the momentum! 🚀`);
    }

    if (data?.totalExams >= 5) {
      msgs.push(`Impressive dedication! You've completed ${data.totalExams} tests. You're on track for mastery! 💪`);
    }

    if (msgs.length === 0) {
      msgs.push("Welcome! Complete a few more tests so I can provide personalized insights. 🎯");
      msgs.push("I'm analyzing your performance patterns. Keep practicing! 📊");
      msgs.push("Your learning journey is just beginning. Exciting progress ahead! 🚀");
    }

    return msgs;
  };

  const messages = getPersonalizedMessages();

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage((prev) => (prev + 1) % messages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "bg-gradient-to-br from-gray-900/80 to-blue-900/20" : "bg-gradient-to-br from-white/80 to-blue-50/80"} backdrop-blur-xl p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${isDark ? "border-blue-500/30" : "border-blue-200"} shadow-xl`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0"
        >
          <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className={`text-xs sm:text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              AIDA - AI Diagnostic Assistant
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/20 text-green-400">
              Active
            </span>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-700"} leading-relaxed`}
            >
              {messages[message]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
        <p className={`text-[10px] sm:text-xs ${isDark ? "text-gray-500" : "text-gray-600"} flex items-center gap-1 sm:gap-2`}>
          <Lightbulb className="w-3 h-3" />
          Powered by Adaptive Neural Scoring Engine v2.3
        </p>
      </div>
    </motion.div>
  );
};

export default function AIEnhancedFeatures({ theme = "dark", data }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AdaptiveEngine theme={theme} data={data} />
        <ExamReadinessForecast theme={theme} data={data} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AILearningCurve theme={theme} data={data} />
        <StrengthsWeaknesses theme={theme} data={data} />
      </div>

      <AIPersonaAssistant theme={theme} data={data} />
    </div>
  );
}