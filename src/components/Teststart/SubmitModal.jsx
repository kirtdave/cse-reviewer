// SubmitModal.jsx - MOBILE-FIRST (Backend logic untouched)
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { saveTestAttempt } from "../../services/testAttemptService";
import { updateUserProgress } from "../../services/questionBankService";
import { prepareTestAttemptData } from "../../utils/testResultHelper";

export default function SubmitModal({
  isOpen,
  isDark,
  correctCount,
  total,
  timeLimit,
  timeLeft,
  questions,
  answers,
  results,
  categories,
  testStartTime,
  onClose,
  isMockExam
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (isOpen && !saved && !saving) {
      handleSaveResult();
    }
  }, [isOpen]);

  const handleSaveResult = async () => {
    console.log('🔍 ========== DEBUG: SUBMIT MODAL ==========');
    console.log('Total questions:', questions.length);
    console.log('Questions with _id:', questions.filter(q => q._id).length);
    console.log('Questions without _id:', questions.filter(q => !q._id).length);
    console.log('Sample question structure:', questions[0]);
    console.table(questions.slice(0, 5).map((q, i) => ({
      index: i,
      hasId: !!q._id,
      id: q._id || 'MISSING',
      category: q.category
    })));
    console.log('🔍 ==========================================');

    setSaving(true);
    setSaveError(null);

    try {
      const testData = prepareTestAttemptData(
        questions,
        answers,
        results,
        categories,
        timeLimit,
        timeLeft,
        testStartTime,
        isMockExam
      );

      console.log('💾 Saving test result with question details:', {
        questions: testData.questionResponses.length,
        score: testData.score,
        result: testData.result,
        isMockExam: testData.isMockExam
      });

      await saveTestAttempt(testData);

      const questionResults = questions
        .map((q, index) => {
          const questionId = q._id || q.id;
          
          if (!questionId) {
            console.warn(`⚠️ Question at index ${index} has no ID:`, q);
            return null;
          }

          return {
            questionId: questionId.toString(),
            isCorrect: results[index] === 'correct'
          };
        })
        .filter(q => q !== null);

      console.log(`📊 Updating progress for ${questionResults.length} questions with IDs`);

      if (questionResults.length > 0) {
        try {
          const progressResponse = await updateUserProgress(questionResults);
          console.log(`✅ Updated progress successfully:`, progressResponse);
        } catch (progressError) {
          console.error('❌ Failed to update question progress:', progressError);
        }
      } else {
        console.warn('⚠️ No valid question IDs found. Progress tracking skipped.');
        console.log('Sample question structure:', questions[0]);
      }

      setSaved(true);
      console.log('✅ Test result saved successfully!');
    } catch (error) {
      console.error('❌ Error saving test result:', error);
      setSaveError(error.message || 'Failed to save test result');
    } finally {
      setSaving(false);
    }
  };

  const accuracy = total > 0 ? ((correctCount / total) * 100).toFixed(0) : 0;
  const timeUsed = Math.max(0, timeLimit - Math.floor(timeLeft / 60));
  const isPassed = accuracy >= 70;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${isDark ? "bg-gray-900" : "bg-white"} rounded-xl sm:rounded-2xl p-4 sm:p-8 max-w-md w-full shadow-2xl max-h-[95vh] overflow-y-auto`}
          >
            <div className="text-center">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${
                  isPassed
                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                    : "bg-gradient-to-r from-orange-500 to-red-600"
                } flex items-center justify-center mx-auto mb-4 sm:mb-6`}
              >
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              {/* Title */}
              <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                Test Completed!
              </h2>
              
              {/* Result Badge */}
              <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4 text-sm sm:text-base ${
                isPassed
                  ? "bg-green-500/20 text-green-500"
                  : "bg-orange-500/20 text-orange-500"
              }`}>
                <i className={`fa-solid ${isPassed ? "fa-circle-check" : "fa-circle-xmark"} text-sm sm:text-base`}></i>
                <span className="font-semibold">{isPassed ? "Passed" : "Failed"}</span>
              </div>
              
              {/* Score */}
              <p className={`text-base sm:text-lg mb-4 sm:mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Your Score: <span className={`font-bold ${isPassed ? "text-green-500" : "text-orange-500"}`}>
                  {correctCount}
                </span> / {total}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                  <p className={`text-xs sm:text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Accuracy
                  </p>
                  <p className={`text-xl sm:text-2xl font-bold ${isPassed ? "text-green-500" : "text-orange-500"}`}>
                    {accuracy}%
                  </p>
                </div>
                <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                  <p className={`text-xs sm:text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Time Used
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-500">
                    {timeUsed}m
                  </p>
                </div>
              </div>

              {/* Save Status */}
              <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all text-sm sm:text-base ${
                saving 
                  ? isDark ? "bg-blue-500/20 border border-blue-500/30" : "bg-blue-100 border border-blue-200"
                  : saved
                  ? isDark ? "bg-green-500/20 border border-green-500/30" : "bg-green-100 border border-green-200"
                  : saveError
                  ? isDark ? "bg-red-500/20 border border-red-500/30" : "bg-red-100 border border-red-200"
                  : "border border-transparent"
              }`}>
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-500" />
                    <span className={`text-xs sm:text-sm font-medium ${isDark ? "text-blue-400" : "text-blue-700"}`}>
                      Saving...
                    </span>
                  </div>
                ) : saved ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    <span className={`text-xs sm:text-sm font-medium ${isDark ? "text-green-400" : "text-green-700"}`}>
                      Saved!
                    </span>
                  </div>
                ) : saveError ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      <span className={`text-xs sm:text-sm font-medium ${isDark ? "text-red-400" : "text-red-700"}`}>
                        Failed to save
                      </span>
                    </div>
                    <button
                      onClick={handleSaveResult}
                      className={`text-xs font-medium underline transition-colors ${
                        isDark 
                          ? "text-blue-400 hover:text-blue-300" 
                          : "text-blue-600 hover:text-blue-700"
                      }`}
                    >
                      <i className="fa-solid fa-rotate-right mr-1"></i>
                      Retry
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Info Box */}
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 sm:mb-6 p-2.5 sm:p-3 rounded-lg ${
                    isDark ? "bg-purple-500/10 border border-purple-500/20" : "bg-purple-50 border border-purple-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <i className="fa-solid fa-lightbulb text-purple-500 mt-0.5 text-sm sm:text-base"></i>
                    <p className={`text-xs sm:text-sm text-left ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                      <span className="font-semibold">Tip:</span> View history for detailed explanations!
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/history'}
                  className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 font-semibold transition-all text-sm sm:text-base ${
                    isDark
                      ? "border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
                  }`}
                >
                  <i className="fa-solid fa-clock-rotate-left mr-2"></i>
                  History
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-xl transition-all text-sm sm:text-base"
                >
                  <i className="fa-solid fa-repeat mr-2"></i>
                  New Test
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}