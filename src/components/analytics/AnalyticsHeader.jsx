import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTestAttempts } from "../../services/testAttemptService";

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
      console.log('🔍 Fetching all MOCK exams for comparison...');
      
      // ✅ FIXED: Fetch only MOCK EXAMS (not practice tests)
      const response = await getTestAttempts({ 
        page: 1, 
        limit: 100, 
        sortBy: 'completedAt', 
        sortOrder: 'desc',
        isMockExam: true  // ✅ Filter for mock exams only
      });
      
      console.log('📥 Full response object:', response);
      console.log('📥 Response type:', typeof response);
      console.log('📥 Response keys:', Object.keys(response || {}));
      
      // Handle the response structure from your API
      let exams = [];
      
      // ✅ FIXED: Your API returns { attempts: [...], pagination: {...} } without success property
      if (response && response.attempts) {
        exams = response.attempts || [];
        console.log('✅ Found MOCK exams in response.attempts:', exams.length);
        
        if (exams.length > 0) {
          console.log('📋 First exam structure:', exams[0]);
          console.log('📋 First exam keys:', Object.keys(exams[0]));
          console.log('📋 Exam IDs:', exams.map(e => e.id));
          console.log('📋 Exam types:', exams.map(e => e.testType || e.type || e.name || 'Unknown'));
          console.log('📋 Is Mock Exam?:', exams.map(e => e.isMockExam));
        }
      } else if (response && response.success) {
        // Fallback: if response has success property
        exams = response.attempts || [];
        console.log('✅ Found exams in response.attempts (with success):', exams.length);
      } else if (Array.isArray(response)) {
        // Fallback: response is directly an array
        exams = response;
        console.log('✅ Response is array:', exams.length);
      } else if (response && response.data) {
        // Fallback: response has data property
        exams = Array.isArray(response.data) ? response.data : response.data.attempts || [];
        console.log('✅ Found exams in response.data:', exams.length);
      } else {
        console.warn('⚠️ Could not find exams in response structure');
        console.log('Full response:', JSON.stringify(response, null, 2));
      }
      
      console.log('📋 Total exams to display:', exams.length);
      setAllExams(exams);
      
    } catch (error) {
      console.error('❌ Error fetching exams:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error response:', error.response?.data);
      setAllExams([]);
    } finally {
      setIsLoadingExams(false);
    }
  };

  // Generate AI Report
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

───────────────────────────────────────────────────────────
📝 STUDY TIPS
───────────────────────────────────────────────────────────
1. Focus on your weak areas identified above
2. Practice time management during tests
3. Review incorrect answers carefully
4. Take regular mock exams to track progress
5. Maintain consistency in your study schedule

═══════════════════════════════════════════════════════════
         Keep practicing! You're on the right track!
═══════════════════════════════════════════════════════════

Generated by CSE Reviewer AI Analytics System
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
        className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className="flex justify-between items-center flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-robot text-white text-2xl"></i>
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                AI Intelligence Center
              </h1>
              <p className="text-sm bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent font-medium">
                Real-time AI analysis, predictions, and adaptive learning
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-file-chart-line mr-2"></i>
                  Generate AI Report
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCompareExams}
              className={`px-4 py-2.5 rounded-xl border-2 font-semibold transition-all ${
                isDark
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <i className="fa-solid fa-code-compare mr-2"></i>
              Compare Exams
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Compare Exams Modal */}
      <AnimatePresence>
        {showCompareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowCompareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${isDark ? "bg-gray-900" : "bg-white"} rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Compare Exams
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Select 2-3 exams to compare (Selected: {selectedExams.length})
                  </p>
                </div>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
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
                  <p>Take some exams first to use the comparison feature.</p>
                </div>
              ) : (
                <>
                  {/* Exam Selection Grid */}
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                      Select Exams to Compare
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                      {allExams.map((exam) => (
                        <motion.button
                          key={exam.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleExamSelection(exam.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            selectedExams.includes(exam.id)
                              ? 'border-green-500 bg-green-500/10'
                              : isDark
                              ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                              {exam.isMockExam ? 'Mock Exam' : exam.testType || exam.name || 'Practice Test'}
                            </span>
                            {selectedExams.includes(exam.id) && (
                              <i className="fa-solid fa-check-circle text-green-500"></i>
                            )}
                          </div>
                          <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            <p>Score: {exam.score}%</p>
                            <p>{formatDate(exam.completedAt)}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Comparison View */}
                  {selectedExams.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl border ${isDark ? "border-gray-800 bg-gray-800/50" : "border-gray-200 bg-gray-50"} p-6`}
                    >
                      <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                        Comparison Results
                      </h3>
                      
                      {/* Comparison Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {getSelectedExamData().map((exam, idx) => (
                          <div key={exam.id} className={`rounded-xl border ${isDark ? "border-gray-700 bg-gray-900/50" : "border-gray-300 bg-white"} p-4`}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                                idx === 0 ? 'from-blue-500 to-purple-500' : 
                                idx === 1 ? 'from-green-500 to-teal-500' : 
                                'from-orange-500 to-red-500'
                              } flex items-center justify-center text-white font-bold text-sm`}>
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                                  {exam.isMockExam ? 'Mock Exam' : exam.testType || exam.name || 'Practice Test'}
                                </h4>
                                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                  {formatDate(exam.completedAt)}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Score</span>
                                  <span className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
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

                              <div className={`pt-3 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Correct</span>
                                  <span className={`font-semibold ${isDark ? "text-green-400" : "text-green-600"}`}>
                                    {exam.correctAnswers}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Wrong</span>
                                  <span className={`font-semibold ${isDark ? "text-red-400" : "text-red-600"}`}>
                                    {exam.wrongAnswers}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
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
                        <div className={`mt-6 p-4 rounded-xl ${isDark ? "bg-green-900/20 border border-green-500/30" : "bg-green-50 border border-green-200"}`}>
                          <h4 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-green-400" : "text-green-700"}`}>
                            <i className="fa-solid fa-lightbulb"></i>
                            AI Insights
                          </h4>
                          <ul className={`space-y-1 text-sm ${isDark ? "text-green-300" : "text-green-800"}`}>
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
                                      • Your score {improvement > 0 ? 'improved' : 'decreased'} by {Math.abs(improvement)}% between first and last exam
                                    </li>
                                  )}
                                  <li>• Average score across selected exams: {avgScore.toFixed(1)}%</li>
                                  <li>• Score range: {worstScore}% - {bestScore}% (±{(bestScore - worstScore).toFixed(1)}%)</li>
                                  {avgScore >= 75 ? (
                                    <li>• Great performance! You're exam-ready 🎉</li>
                                  ) : avgScore >= 60 ? (
                                    <li>• Good progress! Keep practicing to reach 75%+ consistently</li>
                                  ) : (
                                    <li>• Focus on weak areas and practice more to improve your score</li>
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

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCompareModal(false)}
                  className={`flex-1 px-6 py-3 rounded-xl border-2 font-semibold transition-all ${
                    isDark
                      ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Close
                </button>
                {selectedExams.length >= 2 && (
                  <button
                    onClick={() => {
                      // Future: Export comparison as PDF or image
                      alert('Export feature coming soon!');
                    }}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold hover:shadow-lg transition-all"
                  >
                    <i className="fa-solid fa-download mr-2"></i>
                    Export Comparison
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}