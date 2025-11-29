import React from "react";
import { motion } from "framer-motion";
import { Brain, Loader2 } from "lucide-react";

const Testgreet = ({ theme, onStartMockExam, isGenerating }) => {
  const isDark = theme === "dark";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* header content */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-bullseye text-white text-2xl"></i>
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Test Setup
            </h1>
            <p className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-medium">
              Customize your test or let AI create one for you.
            </p>
          </div>
        </div>

        {/* Exam Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartMockExam}
          disabled={isGenerating}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              <span>Start AI Mock Exam</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
};

export default Testgreet;