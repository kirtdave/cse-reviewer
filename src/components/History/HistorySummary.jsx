import React from "react";
import { motion } from "framer-motion";

export default function HistorySummary({
  theme = "dark",
  totalExams,
  totalPassed,
  totalFailed,
  averageScore,
  sortBy,
  setSortBy,
  filterResult,
  setFilterResult,
  onReset, // Add this prop
}) {
  const isDark = theme === "dark";

  const stats = [
    { 
      title: "Total Exams", 
      value: totalExams, 
      icon: "fa-list-check",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      title: "Passed", 
      value: totalPassed, 
      icon: "fa-circle-check",
      gradient: "from-green-500 to-emerald-500"
    },
    { 
      title: "Failed", 
      value: totalFailed, 
      icon: "fa-circle-xmark",
      gradient: "from-red-500 to-pink-500"
    },
    { 
      title: "Average Score", 
      value: `${averageScore}%`, 
      icon: "fa-chart-line",
      gradient: "from-purple-500 to-pink-500"
    },
  ];

  return (
    <>
      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl p-6 rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl hover:shadow-2xl transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {stat.title}
                </h3>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <i className={`fa-solid ${stat.icon} text-white text-xl`}></i>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl p-4 rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl mb-6`}
      >
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-filter text-blue-500"></i>
            <span className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Filters:
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Sort By:
            </label>
            <select
              className={`px-4 py-2 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Date (Latest)</option>
              <option value="score">Score (Highest)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Result:
            </label>
            <select
              className={`px-4 py-2 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onReset}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              <i className="fa-solid fa-rotate-right mr-2"></i>
              Reset
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}