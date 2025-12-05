import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown } from "lucide-react";

const SummaryPanel = ({
  theme,
  selectedType,
  timeLimit,
  categories,
  file,
  printExam,
  handleStartExam,
  isGenerating,
}) => { 
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const onStart = () => {
    if (typeof handleStartExam === "function") {
      handleStartExam();
    }
  };

  const selectedCategories = Object.entries(categories || {}).filter(([, v]) => v.checked);

  return (
    <>
      {/* MOBILE - Expandable Summary + Fixed Bottom Action Bar */}
      <div className="lg:hidden">
        {/* Expandable Summary Card */}
        <AnimatePresence>
          {showMobileSummary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end"
              onClick={() => setShowMobileSummary(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full ${isDark ? "bg-gray-900" : "bg-white"} rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto`}
              >
                {/* Header */}
                <div className={`sticky top-0 ${isDark ? "bg-gray-900" : "bg-white"} border-b ${isDark ? "border-gray-800" : "border-gray-200"} p-4 flex items-center justify-between z-10`}>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Summary
                  </h3>
                  <button
                    onClick={() => setShowMobileSummary(false)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"}`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 pb-6 space-y-4">
                  <div className={`${isDark ? "bg-gray-800/50" : "bg-gray-50/50"} rounded-xl p-4 space-y-4`}>
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
                        Categories ({selectedCategories.length})
                      </p>
                      {selectedCategories.length > 0 ? (
                        <div className="space-y-2">
                          {selectedCategories.map(([k, v]) => (
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
                      ) : (
                        <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"} italic`}>
                          No categories selected
                        </p>
                      )}
                    </div>

                    {printExam && (
                      <div className={`pt-4 border-t ${isDark ? "border-gray-700/50" : "border-gray-300/50"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <i className="fa-solid fa-print text-purple-500"></i>
                          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Print Enabled
                          </p>
                        </div>
                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          Questionnaire will download after test generation
                        </p>
                      </div>
                    )}

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
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`${isDark ? "bg-gray-900/98" : "bg-white/98"} backdrop-blur-xl border-t ${isDark ? "border-gray-800" : "border-gray-200"} shadow-2xl p-3`}
          >
            {/* Summary Preview Bar */}
            <button
              onClick={() => setShowMobileSummary(true)}
              className={`w-full mb-3 p-3 rounded-xl ${isDark ? "bg-gray-800 hover:bg-gray-750" : "bg-gray-100 hover:bg-gray-200"} flex items-center justify-between transition-colors`}
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-list-check text-blue-500"></i>
                <span className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {selectedType} • {timeLimit}min • {selectedCategories.length} categories
                </span>
              </div>
              <ChevronUp className="w-4 h-4 text-gray-500" />
            </button>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate(-1)}
                className={`w-12 h-12 rounded-xl border-2 font-semibold transition-all flex items-center justify-center flex-shrink-0 ${
                  isDark
                    ? "border-gray-700 text-gray-300 active:bg-gray-800"
                    : "border-gray-300 text-gray-700 active:bg-gray-100"
                }`}
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              
              <button
                onClick={onStart}
                disabled={isGenerating} 
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg active:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            </div>
          </motion.div>
        </div>
      </div>

      {/* DESKTOP - Sticky Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`hidden lg:block ${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 mt-10 lg:w-[25%] border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl h-fit lg:sticky lg:top-6`}
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
              {selectedCategories.length > 0 ? (
                <div className="space-y-2">
                  {selectedCategories.map(([k, v]) => (
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
              ) : (
                <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"} italic`}>
                  No categories selected
                </p>
              )}
            </div>

            {printExam && (
              <div className={`pt-4 border-t ${isDark ? "border-gray-700/50" : "border-gray-300/50"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <i className="fa-solid fa-print text-purple-500"></i>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Print Enabled
                  </p>
                </div>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Questionnaire will download after test generation
                </p>
              </div>
            )}

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
    </>
  );
};

export default SummaryPanel;