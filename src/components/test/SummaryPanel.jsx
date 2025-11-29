import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SummaryPanel = ({
  theme,
  selectedType,
  timeLimit,
  categories,
  file,
  handleStartExam,
  isGenerating, 
}) => {
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const onStart = () => {
    if (typeof handleStartExam === "function") {
      handleStartExam();
    }
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 mt-10 lg:w-[25%] border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl h-fit lg:sticky lg:top-6`}
    >
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex justify-center">
            Summary
          </h3>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"} flex justify-center`}>
            Your Selected Test Settings
          </p>
        </div>

        <div className={`${isDark ? "bg-gray-800/50" : "bg-gray-50/50"} rounded-xl p-5 space-y-4`}>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Type
            </p>
            <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
              {selectedType}
            </p>
          </div>

          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Time Limit
            </p>
            <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
              {timeLimit} minutes
            </p>
          </div>

          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Categories
            </p>
            <div className="space-y-2">
              {Object.entries(categories || {})
                .filter(([, v]) => v.checked)
                .map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      {k}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      v.difficulty === "Easy" 
                        ? "bg-green-500/20 text-green-400"
                        : v.difficulty === "Normal"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {v.difficulty}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {file && (
            <div className={`pt-4 border-t ${isDark ? "border-gray-700/50" : "border-gray-300/50"}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Attached File
              </p>
              <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                {file.name}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={onStart}
            disabled={isGenerating} 
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-play"></i>
                <span>Start Exam</span>
              </>
            )}
          </button>
          <button
            onClick={() => navigate(-1)}
            className={`w-full py-3.5 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 ${
              isDark
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <i className="fa-solid fa-backward"></i>
            Cancel / Back
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default SummaryPanel;