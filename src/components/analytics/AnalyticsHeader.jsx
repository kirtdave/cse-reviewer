import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTestAttempts } from "../../services/testAttemptService";
import { Download, GitCompare, X } from "lucide-react";

export default function AnalyticsHeader({ theme = "light", analyticsData }) {
  const isDark = theme === "dark";
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allExams, setAllExams] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);

  // Fetch all exams when compare modal opens
  useEffect(() => {
    if (showCompareModal) {
      fetchAllExams();
    }
  }, [showCompareModal]);

  const fetchAllExams = async () => {
    setIsLoadingExams(true);
    try {
      const response = await getTestAttempts({ 
        page: 1, 
        limit: 100, 
        sortBy: 'completedAt', 
        sortOrder: 'desc',
        isMockExam: true
      });
      
      let exams = [];
      if (response && response.attempts) {
        exams = response.attempts || [];
      } else if (response && response.success) {
        exams = response.attempts || [];
      } else if (Array.isArray(response)) {
        exams = response;
      } else if (response && response.data) {
        exams = Array.isArray(response.data) ? response.data : response.data.attempts || [];
      }
      
      setAllExams(exams);
      
    } catch (error) {
      console.error('❌ Error fetching exams:', error);
      setAllExams([]);
    } finally {
      setIsLoadingExams(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const report = generateTextReport(analyticsData);
      
      const blob = new Blob([report], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CSE-Analytics-Report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert('✅ AI Report generated and downloaded!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('❌ Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTextReport = (data) => {
    const date = new Date().toLocaleDateString();
    
    return `
═══════════════════════════════════════════════════════════
         CSE REVIEWER - AI PERFORMANCE REPORT
═══════════════════════════════════════════════════════════

Report Generated: ${date}

───────────────────────────────────────────────────────────
📊 OVERALL PERFORMANCE
───────────────────────────────────────────────────────────
Total Exams Taken:        ${data?.totalExams || 0}
Average Score:            ${data?.avgScore || 0}%
Accuracy Rate:            ${data?.accuracy || 0}%
Exam Readiness:           ${data?.readiness || 0}%

───────────────────────────────────────────────────────────
📈 SECTION BREAKDOWN
───────────────────────────────────────────────────────────
Verbal Ability:           ${data?.sections?.verbal || 0}%
Numerical Ability:        ${data?.sections?.numerical || 0}%
Analytical Ability:       ${data?.sections?.analytical || 0}%
General Knowledge:        ${data?.sections?.general || 0}%

───────────────────────────────────────────────────────────
💪 STRENGTHS
───────────────────────────────────────────────────────────
${data?.strengthsWeaknesses?.filter(s => s.value >= 75)
  .map(s => `✓ ${s.label}: ${s.value}%`)
  .join('\n') || 'Complete more tests to identify strengths'}

───────────────────────────────────────────────────────────
⚠️  AREAS FOR IMPROVEMENT
───────────────────────────────────────────────────────────
${data?.strengthsWeaknesses?.filter(s => s.value < 75)
  .map(s => `✗ ${s.label}: ${s.value}%`)
  .join('\n') || 'Keep up the great work!'}

───────────────────────────────────────────────────────────
🎯 AI RECOMMENDATIONS
───────────────────────────────────────────────────────────
${data?.recommendations?.map((rec, i) => `${i + 1}. ${rec.text || rec}`).join('\n') || 'Take more exams to get personalized recommendations'}

───────────────────────────────────────────────────────────
⏱️  TIME MANAGEMENT
───────────────────────────────────────────────────────────
Avg Time per Question:    ${data?.timeMetrics?.avgTimePerQuestion || 0}s
Speed Score:              ${data?.timeMetrics?.speedScore || 0}/100
Consistency:              ${data?.timeMetrics?.consistency || 0}%

═══════════════════════════════════════════════════════════
         Keep practicing! You're on the right track!
═══════════════════════════════════════════════════════════
    `.trim();
  };

  const handleCompareExams = () => {
    setShowCompareModal(true);
    setSelectedExams([]);
  };

  const toggleExamSelection = (examId) => {
    setSelectedExams(prev => {
      if (prev.includes(examId)) {
        return prev.filter(id => id !== examId);
      } else if (prev.length < 3) {
        return [...prev, examId];
      }
      return prev;
    });
  };

  const getSelectedExamData = () => {
    return allExams.filter(exam => selectedExams.includes(exam.id));
  };

  const calculateImprovement = (exams) => {
    if (exams.length < 2) return null;
    const first = exams[0].score;
    const last = exams[exams.length - 1].score;
    return ((last - first) / first * 100).toFixed(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
      >
        {/* MOBILE: Stack vertically, DESKTOP: Horizontal */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
          {/* Title Section - MOBILE: Compact */}
          <div className="flex items-center gap-3 lg:gap-4 w-full lg:w-auto">
            <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg lg:rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <i className="fa-solid fa-robot text-white text-xl lg:text-2xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className={`text-lg lg:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>
                AI Intelligence Center
              </h1>
              <p className="text-xs lg:text-sm bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent font-medium">
                Real-time AI analysis
              </p>
            </div>
          </div>

          {/* Buttons - MOBILE: Full width, DESKTOP: Auto width */}
          <div className="flex gap-2 lg:gap-3 w-full lg:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex-1 lg:flex-none px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg lg:rounded-xl bg-gradient-to-r from-green-500 to-teal-600 text-white text-xs lg:text-sm font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 lg:gap-2"
            >
              {isGenerating ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span className="hidden sm:inline">Generating...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Generate Report</span>
                  <span className="sm:hidden">Report</span>
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCompareExams}
              className={`flex-1 lg:flex-none px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg lg:rounded-xl border-2 text-xs lg:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 lg:gap-2 ${
                isDark
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">Compare Exams</span>
              <span className="sm:hidden">Compare</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Compare Exams Modal - MOBILE OPTIMIZED */}
      <AnimatePresence>
        {showCompareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50 backdrop-blur-sm p-0 lg:p-4"
            onClick={() => setShowCompareModal(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className={`${isDark ? "bg-gray-900" : "bg-white"} rounded-t-2xl lg:rounded-2xl p-4 lg:p-8 w-full lg:max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl`}
            >
              {/* Header - MOBILE: Compact */}
              <div className="flex justify-between items-start mb-4 lg:mb-6">
                <div className="flex-1 min-w-0 mr-2">
                  <h2 className={`text-lg lg:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>
                    Compare Exams
                  </h2>
                  <p className={`text-xs lg:text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Select 2-3 exams ({selectedExams.length})
                  </p>
                </div>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className={`w-9 h-9 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                    isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLoadingExams ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading exams...</p>
                </div>
              ) : allExams.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  <i className="fa-solid fa-clipboard-question text-6xl mb-4 text-gray-400"></i>
                  <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    No Exams Found
                  </h3>
                  <p className="text-sm">Take some exams first to use the comparison feature.</p>
                </div>
              ) : (
                <>
                  {/* Exam Selection Grid - MOBILE: 1 column, TABLET: 2, DESKTOP: 3 */}
                  <div className="mb-4 lg:mb-6">
                    <h3 className={`text-sm lg:text-lg font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                      Select Exams to Compare
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 max-h-60 overflow-y-auto">
                      {allExams.map((exam) => (
                        <motion.button
                          key={exam.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleExamSelection(exam.id)}
                          className={`p-3 lg:p-4 rounded-lg lg:rounded-xl border-2 transition-all text-left ${
                            selectedExams.includes(exam.id)
                              ? 'border-green-500 bg-green-500/10'
                              : isDark
                              ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`font-semibold text-xs lg:text-sm truncate flex-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                              {exam.isMockExam ? 'Mock Exam' : exam.testType || exam.name || 'Practice Test'}
                            </span>
                            {selectedExams.includes(exam.id) && (
                              <i className="fa-solid fa-check-circle text-green-500 text-sm lg:text-base flex-shrink-0 ml-2"></i>
                            )}
                          </div>
                          <div className={`text-xs lg:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            <p>Score: {exam.score}%</p>
                            <p className="text-[10px] lg:text-xs">{formatDate(exam.completedAt)}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Comparison Results - MOBILE: Stack, DESKTOP: Grid */}
                  {selectedExams.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-lg lg:rounded-xl border ${isDark ? "border-gray-800 bg-gray-800/50" : "border-gray-200 bg-gray-50"} p-4 lg:p-6`}
                    >
                      <h3 className={`text-sm lg:text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                        Comparison Results
                      </h3>
                      
                      {/* Comparison Grid - MOBILE: 1 column, DESKTOP: 3 columns */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                        {getSelectedExamData().map((exam, idx) => (
                          <div key={exam.id} className={`rounded-lg lg:rounded-xl border ${isDark ? "border-gray-700 bg-gray-900/50" : "border-gray-300 bg-white"} p-3 lg:p-4`}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br ${
                                idx === 0 ? 'from-blue-500 to-purple-500' : 
                                idx === 1 ? 'from-green-500 to-teal-500' : 
                                'from-orange-500 to-red-500'
                              } flex items-center justify-center text-white font-bold text-xs lg:text-sm flex-shrink-0`}>
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-semibold text-xs lg:text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                                  {exam.isMockExam ? 'Mock Exam' : exam.testType || exam.name || 'Practice Test'}
                                </h4>
                                <p className={`text-[10px] lg:text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                  {formatDate(exam.completedAt)}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2 lg:space-y-3">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Score</span>
                                  <span className={`font-bold text-base lg:text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {exam.score}%
                                  </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                  <div 
                                    className={`h-full bg-gradient-to-r ${
                                      exam.score >= 80 ? 'from-green-500 to-emerald-500' :
                                      exam.score >= 60 ? 'from-blue-500 to-cyan-500' :
                                      'from-orange-500 to-red-500'
                                    }`}
                                    style={{ width: `${exam.score}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div className={`pt-2 lg:pt-3 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Correct</span>
                                  <span className={`font-semibold ${isDark ? "text-green-400" : "text-green-600"}`}>
                                    {exam.correctAnswers}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Wrong</span>
                                  <span className={`font-semibold ${isDark ? "text-red-400" : "text-red-600"}`}>
                                    {exam.wrongAnswers}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Time</span>
                                  <span className={`font-semibold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                                    {Math.floor(exam.timeTaken / 60)}m {exam.timeTaken % 60}s
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Insights */}
                      {selectedExams.length >= 2 && (
                        <div className={`mt-4 lg:mt-6 p-3 lg:p-4 rounded-lg lg:rounded-xl ${isDark ? "bg-green-900/20 border border-green-500/30" : "bg-green-50 border border-green-200"}`}>
                          <h4 className={`font-semibold text-xs lg:text-sm mb-2 flex items-center gap-2 ${isDark ? "text-green-400" : "text-green-700"}`}>
                            <i className="fa-solid fa-lightbulb"></i>
                            AI Insights
                          </h4>
                          <ul className={`space-y-1 text-xs lg:text-sm ${isDark ? "text-green-300" : "text-green-800"}`}>
                            {(() => {
                              const exams = getSelectedExamData();
                              const improvement = calculateImprovement(exams);
                              const avgScore = exams.reduce((sum, e) => sum + e.score, 0) / exams.length;
                              const bestScore = Math.max(...exams.map(e => e.score));
                              const worstScore = Math.min(...exams.map(e => e.score));
                              
                              return (
                                <>
                                  {improvement && (
                                    <li>
                                      • Score {improvement > 0 ? 'improved' : 'decreased'} by {Math.abs(improvement)}%
                                    </li>
                                  )}
                                  <li>• Average: {avgScore.toFixed(1)}%</li>
                                  <li>• Range: {worstScore}% - {bestScore}% (±{(bestScore - worstScore).toFixed(1)}%)</li>
                                  {avgScore >= 75 ? (
                                    <li>• Great! You're exam-ready 🎉</li>
                                  ) : avgScore >= 60 ? (
                                    <li>• Good progress! Keep practicing</li>
                                  ) : (
                                    <li>• Focus on weak areas</li>
                                  )}
                                </>
                              );
                            })()}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </>
              )}

              {/* Close Button - MOBILE: Full width */}
              <div className="mt-4 lg:mt-6">
                <button
                  onClick={() => setShowCompareModal(false)}
                  className={`w-full px-6 py-3 rounded-lg lg:rounded-xl border-2 text-sm font-semibold transition-all ${
                    isDark
                      ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}