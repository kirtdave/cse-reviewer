import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { downloadTestPaper, printTestPaper, copyTestPaperToClipboard } from "../../services/exportService";

export default function ReviewHeader({
  name,
  score,
  totalQuestions,
  accuracy,
  isDark,
  testData,
  studyMode,
  onStartStudyMode,
  onExitStudyMode,
  wrongCount,
}) {
  const navigate = useNavigate();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [buttonRect, setButtonRect] = useState(null);

  const handleExportButtonClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setButtonRect(rect);
    setShowExportMenu(!showExportMenu);
  };

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
    <div className="no-print mb-3 sm:mb-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
      >
        {/* Top Row - Title and Back */}
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <i className="fa-solid fa-clipboard-check text-white text-lg sm:text-2xl"></i>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className={`text-base sm:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>
                {name || "Test Review"}
              </h1>
              <p className="text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent font-medium truncate">
                {studyMode ? "📚 Study Mode" : "Question Review"}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/history")}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              isDark
                ? "hover:bg-gray-800 active:bg-gray-800 text-gray-300"
                : "hover:bg-gray-100 active:bg-gray-100 text-gray-700"
            }`}
          >
            <i className="fa-solid fa-arrow-left text-sm"></i>
          </button>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          {wrongCount > 0 && !studyMode && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onStartStudyMode}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:shadow-xl transition-all"
            >
              <i className="fa-solid fa-book-open-reader text-xs sm:text-sm"></i>
              Study Mode
            </motion.button>
          )}

          {studyMode && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onExitStudyMode}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-lg font-medium transition-all ${
                isDark
                  ? "bg-gray-800 text-gray-300 active:bg-gray-700"
                  : "bg-gray-200 text-gray-700 active:bg-gray-300"
              }`}
            >
              <i className="fa-solid fa-x text-xs"></i>
              Exit Study
            </motion.button>
          )}

          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleExportButtonClick}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-lg font-medium transition-all ${
                isDark
                  ? "bg-green-500/20 text-green-400 active:bg-green-500/30 border border-green-500/30"
                  : "bg-green-100 text-green-700 active:bg-green-200 border border-green-200"
              }`}
            >
              <i className="fa-solid fa-download text-xs sm:text-sm"></i>
              Export
              <i className="fa-solid fa-chevron-down text-[10px] sm:text-xs"></i>
            </motion.button>

            {showExportMenu && buttonRect && createPortal(
              <>
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setShowExportMenu(false)}
                />
                
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      position: 'fixed',
                      top: buttonRect.bottom + 8,
                      left: buttonRect.left,
                      minWidth: buttonRect.width,
                    }}
                    className={`w-56 rounded-xl shadow-2xl ${
                      isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                    } overflow-hidden z-[9999]`}
                  >
                    <button
                      onClick={() => handleExportTestPaper('download')}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                        isDark ? "hover:bg-gray-700 active:bg-gray-700 text-gray-300" : "hover:bg-gray-50 active:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <i className="fa-solid fa-file-arrow-down text-green-500"></i>
                      <div>
                        <p className="font-medium text-sm">Download Test Paper</p>
                        <p className="text-xs opacity-75">GATE-style format (.txt)</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleExportTestPaper('print')}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                        isDark ? "hover:bg-gray-700 active:bg-gray-700 text-gray-300" : "hover:bg-gray-50 active:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <i className="fa-solid fa-print text-blue-500"></i>
                      <div>
                        <p className="font-medium text-sm">Print Test Paper</p>
                        <p className="text-xs opacity-75">Formatted printout</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleExportTestPaper('copy')}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                        isDark ? "hover:bg-gray-700 active:bg-gray-700 text-gray-300" : "hover:bg-gray-50 active:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <i className="fa-solid fa-copy text-purple-500"></i>
                      <div>
                        <p className="font-medium text-sm">Copy to Clipboard</p>
                        <p className="text-xs opacity-75">Paste anywhere</p>
                      </div>
                    </button>
                  </motion.div>
                </AnimatePresence>
              </>,
              document.body
            )}
          </div>
        </div>

        {/* Score Display Row */}
        <div className="flex items-center gap-2">
          <div className={`flex-1 px-3 py-1.5 sm:py-2 rounded-lg ${isDark ? "bg-gray-800/80" : "bg-gray-100"}`}>
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Score:{" "}
            </span>
            <span className="font-bold text-sm sm:text-lg text-purple-500">
              {score}/{totalQuestions}
            </span>
          </div>
          <div className={`flex-1 px-3 py-1.5 sm:py-2 rounded-lg ${isDark ? "bg-gray-800/80" : "bg-gray-100"}`}>
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Accuracy:{" "}
            </span>
            <span className="font-bold text-sm sm:text-lg text-green-500">
              {accuracy}%
            </span>
          </div>
        </div>
      </motion.header>
    </div>
  );
}