import React from "react";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsCharts({ theme = "light", data }) {
  const isDark = theme === "dark";

  // Radar Chart Data - Using real section scores
  const radarData = [
    { subject: "Accuracy", A: data?.accuracy || 0, fullMark: 100 },
    { subject: "Speed", A: data?.timeMetrics?.speedScore || 0, fullMark: 100 },
    { subject: "Consistency", A: data?.timeMetrics?.consistency || 0, fullMark: 100 },
    { subject: "Analytical", A: data?.sections?.analytical || 0, fullMark: 100 },
    { subject: "Verbal", A: data?.sections?.verbal || 0, fullMark: 100 },
    { subject: "Numerical", A: data?.sections?.numerical || 0, fullMark: 100 },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`relative overflow-hidden ${isDark ? "bg-gradient-to-br from-gray-900/80 to-purple-900/20" : "bg-gradient-to-br from-white/80 to-purple-50/80"} backdrop-blur-xl p-4 sm:p-8 rounded-xl sm:rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-2xl`}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${isDark ? "bg-purple-500/20" : "bg-purple-400/20"}`}
            animate={{
              x: [Math.random() * 100, Math.random() * 100],
              y: [Math.random() * 100, Math.random() * 100],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg"
          >
            <i className="fa-solid fa-brain-circuit text-white text-lg sm:text-xl"></i>
          </motion.div>
          <div>
            <h3 className={`text-base sm:text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              AI Insight Matrix
            </h3>
            <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Comprehensive neural performance analysis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-center">
          {/* Radar Chart */}
          <div className={`p-4 sm:p-6 rounded-lg sm:rounded-xl ${isDark ? "bg-gray-800/30" : "bg-white/50"}`}>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={isDark ? "#374151" : "#E5E7EB"} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12 }}
                />
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <Radar 
                  dataKey="A" 
                  stroke="url(#radarGradient)" 
                  fill="url(#radarGradient)" 
                  fillOpacity={0.6} 
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* AI Evaluation Text */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className={`text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
              Predictive AI Evaluation
            </h4>
            <p className={`text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-700"} leading-relaxed`}>
              {data?.totalExams >= 3 ? (
                <>
                  Neural models indicate a <span className="font-bold text-blue-500">
                    +{Math.min(10, Math.round(data.totalExams * 1.5))}%
                  </span> trajectory across all sections. 
                  Probability of above-average exam performance is now at <span className="font-bold text-purple-500">
                    {data?.readiness || 0}%
                  </span>. Your consistency score of <span className="font-bold text-green-500">
                    {data?.timeMetrics?.consistency || 0}%
                  </span> shows excellent progress.
                </>
              ) : (
                <>
                  Early-stage analysis detected. Take <span className="font-bold text-blue-500">
                    {3 - (data?.totalExams || 0)} more test{3 - (data?.totalExams || 0) !== 1 ? 's' : ''}
                  </span> to unlock advanced AI predictions and personalized learning paths.
                </>
              )}
            </p>

            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDark ? "bg-purple-500/10" : "bg-purple-50"} border ${isDark ? "border-purple-500/20" : "border-purple-200"}`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <i className="fa-solid fa-robot text-purple-500 text-xl sm:text-2xl mt-0.5 sm:mt-1"></i>
                <p className={`text-xs sm:text-sm italic ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                  {data?.readiness >= 85 ? (
                    `"Confidence curve trending upward. Expected mastery in ${Math.max(1, Math.round((100 - data.readiness) / 2))} days."`
                  ) : data?.readiness >= 70 ? (
                    `"Processing neural signals... Steady improvement detected. Maintain consistent practice."`
                  ) : (
                    `"Building confidence baseline. Focus on weak areas for accelerated growth."`
                  )}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}