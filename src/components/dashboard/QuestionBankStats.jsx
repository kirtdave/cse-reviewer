import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Bookmark } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { getUserQuestionStats } from "../../services/questionBankService";
import { getAllBookmarks } from "../../services/bookmarkService";

export default function QuestionBankStats({ theme = "light" }) {
  const isDark = theme === "dark";
  const [stats, setStats] = useState(null);
  const [bookmarkedCount, setBookmarkedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // ✅ CHECK: Don't fetch if user is not logged in
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (!isLoggedIn) {
        console.log('👤 Guest user - skipping stats fetch');
        setStats({ mastered: 0, learning: 0, needsReview: 0, total: 0, totalAvailable: 0 });
        setBookmarkedCount(0);
        setLoading(false);
        return;
      }

      try {
        const [userStats, bookmarks] = await Promise.all([
          getUserQuestionStats(),
          getAllBookmarks()
        ]);
        
        setStats(userStats);
        setBookmarkedCount(bookmarks.length || 0);
      } catch (error) {
        console.error('Failed to load question bank stats:', error);
        setStats({ mastered: 0, learning: 0, needsReview: 0, total: 0, totalAvailable: 0 });
        setBookmarkedCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = stats ? [
    { name: "Mastered", value: stats.mastered || 0 },
    { name: "Learning", value: stats.learning || 0 },
    { name: "Needs Review", value: stats.needsReview || 0 },
    { name: "Bookmarked", value: bookmarkedCount || 0 },
  ] : [];

  const COLORS = [
    { gradient: "from-blue-500 to-cyan-400", solid: "#3b82f6", glow: "rgba(59, 130, 246, 0.6)" },
    { gradient: "from-green-500 to-emerald-400", solid: "#10b981", glow: "rgba(16, 185, 129, 0.6)" },
    { gradient: "from-orange-500 to-amber-400", solid: "#f59e0b", glow: "rgba(245, 158, 11, 0.6)" },
    { gradient: "from-pink-500 to-red-400", solid: "#ec4899", glow: "rgba(236, 72, 153, 0.6)" },
  ];

  const masteryPercentage = stats && stats.total > 0 
    ? Math.round((stats.mastered / stats.total) * 100) 
    : 0;

  const hasAnyData = chartData.some(item => item.value > 0);

  if (loading) {
    return (
      <div className={`${isDark ? "bg-gray-900/60" : "bg-white"} backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg border ${isDark ? "border-gray-800" : "border-gray-200"}`}>
        <div className="animate-pulse space-y-3 lg:space-y-4">
          <div className="h-6 lg:h-8 bg-gray-700 rounded w-1/2"></div>
          <div className="h-32 lg:h-48 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`${
        isDark ? "bg-gray-900/60" : "bg-white"
      } backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg border ${
        isDark ? "border-gray-800" : "border-gray-200"
      } transition-all duration-500`}
    >
      {/* Header */}
      <div className="mb-3 lg:mb-4">
        <div className="flex items-center gap-2 lg:gap-3 mb-2">
          <div
            className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${
              isDark ? "shadow-blue-500/40" : "shadow-blue-500/20"
            }`}
          >
            <BookOpen className="text-white" size={16} />
          </div>
          <h2 className={`text-base lg:text-xl font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>
            Question Bank
          </h2>
        </div>
        <p className={`ml-10 lg:ml-12 text-[10px] lg:text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Track your progress
        </p>
      </div>

      {/* MOBILE LAYOUT - Stacked */}
      <div className="lg:hidden space-y-3">
        {/* Chart */}
        <div
          className={`relative flex items-center justify-center p-3 rounded-xl ${
            isDark
              ? "bg-gray-800 border border-gray-700"
              : "bg-gray-50 border border-gray-200"
          } transition-all duration-500`}
        >
          {isDark && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
          )}
          
          {hasAnyData ? (
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <defs>
                  {COLORS.map((color, idx) => (
                    <linearGradient key={idx} id={`gradient-${idx}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={color.solid} stopOpacity={1} />
                      <stop offset="100%" stopColor={color.solid} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={chartData.filter(item => item.value > 0)}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  innerRadius={30}
                  paddingAngle={3}
                >
                  {chartData.filter(item => item.value > 0).map((entry, index) => {
                    const originalIndex = chartData.findIndex(item => item.name === entry.name);
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#gradient-${originalIndex})`}
                        stroke={isDark ? "#111827" : "#ffffff"}
                        strokeWidth={2}
                      />
                    );
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "rgba(31,41,55,0.95)" : "#ffffff",
                    border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                    borderRadius: "8px",
                    padding: "6px 10px",
                  }}
                  itemStyle={{
                    color: isDark ? "#f3f4f6" : "#111827",
                    fontSize: "11px",
                    fontWeight: 600
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-6">
              <BookOpen className={`w-10 h-10 mx-auto mb-2 ${isDark ? "text-gray-700" : "text-gray-300"}`} />
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-600"}`}>
                No questions yet
              </p>
            </div>
          )}
        </div>

        {/* Legend - Compact for Mobile */}
        <div className="grid grid-cols-2 gap-2">
          {chartData.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className={`flex items-center justify-between p-2 rounded-lg ${
                isDark
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {stat.name === "Bookmarked" ? (
                  <Bookmark 
                    className="w-3 h-3 text-pink-500 flex-shrink-0" 
                    fill="currentColor"
                  />
                ) : (
                  <div
                    className={`w-3 h-3 rounded-md bg-gradient-to-br ${COLORS[idx].gradient} flex-shrink-0`}
                  />
                )}
                <span
                  className={`text-[10px] font-semibold truncate ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {stat.name}
                </span>
              </div>
              <span
                className={`text-sm font-bold bg-gradient-to-r ${COLORS[idx].gradient} bg-clip-text text-transparent flex-shrink-0`}
              >
                {stat.value}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DESKTOP LAYOUT - Side by Side */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-5 items-center">
        {/* Chart */}
        <div
          className={`relative flex items-center justify-center p-4 rounded-xl ${
            isDark
              ? "bg-gray-800 border border-gray-700"
              : "bg-gray-50 border border-gray-200"
          } transition-all duration-500`}
        >
          {isDark && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
          )}
          
          {hasAnyData ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <defs>
                  {COLORS.map((color, idx) => (
                    <linearGradient key={idx} id={`gradient-${idx}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={color.solid} stopOpacity={1} />
                      <stop offset="100%" stopColor={color.solid} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={chartData.filter(item => item.value > 0)}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={40}
                  paddingAngle={3}
                >
                  {chartData.filter(item => item.value > 0).map((entry, index) => {
                    const originalIndex = chartData.findIndex(item => item.name === entry.name);
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#gradient-${originalIndex})`}
                        stroke={isDark ? "#111827" : "#ffffff"}
                        strokeWidth={2}
                        style={{
                          filter: isDark
                            ? `drop-shadow(0 0 6px ${COLORS[originalIndex].glow})`
                            : "none"
                        }}
                      />
                    );
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "rgba(31,41,55,0.95)" : "#ffffff",
                    border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                  itemStyle={{
                    color: isDark ? "#f3f4f6" : "#111827",
                    fontSize: "13px",
                    fontWeight: 600
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <BookOpen className={`w-12 h-12 mx-auto mb-2 ${isDark ? "text-gray-700" : "text-gray-300"}`} />
              <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"}`}>
                No questions attempted yet
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {chartData.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-lg ${
                isDark
                  ? "bg-gray-800 border border-gray-700 hover:border-gray-600 transition-colors"
                  : "bg-white border border-gray-200 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                {stat.name === "Bookmarked" ? (
                  <Bookmark 
                    className="w-4 h-4 text-pink-500" 
                    fill="currentColor"
                    style={{
                      filter: isDark ? "drop-shadow(0 0 4px rgba(236, 72, 153, 0.6))" : "none"
                    }}
                  />
                ) : (
                  <div
                    className={`w-4 h-4 rounded-md bg-gradient-to-br ${COLORS[idx].gradient}`}
                    style={{
                      boxShadow: isDark ? `0 0 8px ${COLORS[idx].glow}` : "none"
                    }}
                  />
                )}
                <span
                  className={`text-sm font-semibold ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {stat.name}
                </span>
              </div>
              <span
                className={`text-lg font-bold bg-gradient-to-r ${COLORS[idx].gradient} bg-clip-text text-transparent`}
              >
                {stat.value}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Total Available Questions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`mt-3 lg:mt-5 pt-3 lg:pt-4 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}
      >
        <div
          className={`flex items-center justify-between p-3 lg:p-4 lg:py-2 rounded-xl ${
            isDark
              ? "bg-gray-800 border border-gray-700"
              : "bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 border border-blue-200"
          }`}
        >
          <div>
            <span
              className={`text-[10px] lg:text-xs font-semibold uppercase tracking-wider ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Available Questions
            </span>
            <p className={`text-[10px] lg:text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
              In database
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              {stats?.totalAvailable || 0}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Total Attempted */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-2 lg:mt-3"
      >
        <div
          className={`flex items-center justify-between p-3 lg:p-4 lg:py-2 rounded-xl ${
            isDark
              ? "bg-gray-800 border border-gray-700"
              : "bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border border-purple-200"
          }`}
        >
          <div>
            <span
              className={`text-[10px] lg:text-xs font-semibold uppercase tracking-wider ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Questions Attempted
            </span>
            <p className={`text-[10px] lg:text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
              All categories
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {stats?.total || 0}
            </span>
            <div className="flex items-center gap-1 justify-end mt-1">
              <TrendingUp className="w-2 lg:w-3 h-2 lg:h-3 text-green-500" />
              <span className="text-[10px] lg:text-xs text-green-500 font-semibold">
                {masteryPercentage}% Mastered
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}