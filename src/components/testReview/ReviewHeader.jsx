import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { downloadTestPaper, printTestPaper, copyTestPaperToClipboard } from "../../services/exportService";

export default function ReviewHeader({
  name,
  score,
  totalQuestions,
  accuracy,
  isDark,
  isPrinting,
  handlePrint,
  testData,
  studyMode,
  onStartStudyMode,
  onExitStudyMode,
  wrongCount,
}) {
  const navigate = useNavigate();
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExportTestPaper = async (format) => {
    setShowExportMenu(false);
    
    try {
      switch(format) {
        case 'download':
          downloadTestPaper(testData);
          break;
        case 'print':
          printTestPaper(testData);
          break;
        case 'copy':
          const result = await copyTestPaperToClipboard(testData);
          alert(result.message);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="no-print mb-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className="flex flex-col gap-6">
          {/* Top Section - Title and Back Button */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-clipboard-check text-white text-2xl"></i>
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {name || "Test Review"}
                </h1>
                <p className="text-sm bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent font-medium">
                  {studyMode ? "📚 Study Mode - Wrong Answers" : "Detailed Question Review"}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDark
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span className="font-medium">Back</span>
            </button>
          </div>

          {/* Bottom Section - Actions and Stats */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Study Mode Button */}
              {wrongCount > 0 && !studyMode && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onStartStudyMode}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:shadow-xl transition-all"
                >
                  <i className="fa-solid fa-book-open-reader"></i>
                  <span className="hidden sm:inline">Study Mode</span>
                </motion.button>
              )}

              {/* Exit Study Mode */}
              {studyMode && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onExitStudyMode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isDark
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <i className="fa-solid fa-x"></i>
                  <span className="hidden sm:inline">Exit Study</span>
                </motion.button>
              )}

              {/* Print Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrint}
                disabled={isPrinting}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isDark
                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Print or Save as PDF"
              >
                <i
                  className={`fa-solid ${
                    isPrinting ? "fa-spinner fa-spin" : "fa-print"
                  }`}
                ></i>
                <span className="hidden sm:inline">
                  {isPrinting ? "Preparing..." : "Print"}
                </span>
              </motion.button>

              {/* Export Menu - ✅ FIXED z-index */}
              <div className="relative z-50">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isDark
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                      : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                  }`}
                >
                  <i className="fa-solid fa-download"></i>
                  <span className="hidden sm:inline">Export</span>
                  <i className="fa-solid fa-chevron-down text-xs"></i>
                </motion.button>

                <AnimatePresence>
                  {showExportMenu && (
                    <>
                      {/* Backdrop - ✅ FIXED z-index */}
                      <div
                        className="fixed inset-0 z-[60]"
                        onClick={() => setShowExportMenu(false)}
                      />
                      
                      {/* Menu - ✅ FIXED z-index */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl ${
                          isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                        } overflow-hidden z-[70]`}
                      >
                        <button
                          onClick={() => handleExportTestPaper('download')}
                          className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                            isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <i className="fa-solid fa-file-arrow-down text-green-500"></i>
                          <div>
                            <p className="font-medium">Download Test Paper</p>
                            <p className="text-xs opacity-75">GATE-style format (.txt)</p>
                          </div>
                        </button>
                        <button
                          onClick={() => handleExportTestPaper('print')}
                          className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                            isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <i className="fa-solid fa-print text-blue-500"></i>
                          <div>
                            <p className="font-medium">Print Test Paper</p>
                            <p className="text-xs opacity-75">Formatted printout</p>
                          </div>
                        </button>
                        <button
                          onClick={() => handleExportTestPaper('copy')}
                          className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                            isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <i className="fa-solid fa-copy text-purple-500"></i>
                          <div>
                            <p className="font-medium">Copy to Clipboard</p>
                            <p className="text-xs opacity-75">Paste anywhere</p>
                          </div>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Score Display */}
            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-2 rounded-lg ${
                  isDark ? "bg-gray-800/80" : "bg-gray-100"
                }`}
              >
                <span
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Score:{" "}
                </span>
                <span className="font-bold text-lg text-purple-500">
                  {score}/{totalQuestions}
                </span>
              </div>
              <div
                className={`px-4 py-2 rounded-lg ${
                  isDark ? "bg-gray-800/80" : "bg-gray-100"
                }`}
              >
                <span
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Accuracy:{" "}
                </span>
                <span className="font-bold text-lg text-green-500">
                  {accuracy}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>
    </div>
  );
}