// src/components/Teststart/SubmitModal.jsx
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

  // Auto-save when modal opens
  useEffect(() => {
    if (isOpen && !saved && !saving) {
      handleSaveResult();
    }
  }, [isOpen]);

  const handleSaveResult = async () => {
    // 🔍 DEBUG: Check questions structure
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
      // Prepare test data
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

      // Save to backend
      await saveTestAttempt(testData);

      // ✅ FIX: Better question ID extraction with validation
      const questionResults = questions
        .map((q, index) => {
          // Support both _id and id fields
          const questionId = q._id || q.id;
          
          if (!questionId) {
            console.warn(`⚠️ Question at index ${index} has no ID:`, q);
            return null;
          }

          return {
            questionId: questionId.toString(), // Ensure string format
            isCorrect: results[index] === 'correct'
          };
        })
        .filter(q => q !== null); // Remove invalid entries

      console.log(`📊 Updating progress for ${questionResults.length} questions with IDs`);

      if (questionResults.length > 0) {
        try {
          const progressResponse = await updateUserProgress(questionResults);
          console.log(`✅ Updated progress successfully:`, progressResponse);
        } catch (progressError) {
          console.error('❌ Failed to update question progress:', progressError);
          // Don't fail the entire save if progress update fails
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

  // Calculate display values
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${isDark ? "bg-gray-900" : "bg-white"} rounded-2xl p-8 max-w-md w-full shadow-2xl`}
          >
            <div className="text-center">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className={`w-20 h-20 rounded-full ${
                  isPassed
                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                    : "bg-gradient-to-r from-orange-500 to-red-600"
                } flex items-center justify-center mx-auto mb-6`}
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                Test Completed!
              </h2>
              
              {/* Result Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                isPassed
                  ? "bg-green-500/20 text-green-500"
                  : "bg-orange-500/20 text-orange-500"
              }`}>
                <i className={`fa-solid ${isPassed ? "fa-circle-check" : "fa-circle-xmark"}`}></i>
                <span className="font-semibold">{isPassed ? "Passed" : "Failed"}</span>
              </div>
              
              {/* Score */}
              <p className={`text-lg mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Your Score: <span className={`font-bold ${isPassed ? "text-green-500" : "text-orange-500"}`}>
                  {correctCount}
                </span> / {total}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                  <p className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Accuracy
                  </p>
                  <p className={`text-2xl font-bold ${isPassed ? "text-green-500" : "text-orange-500"}`}>
                    {accuracy}%
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                  <p className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Time Used
                  </p>
                  <p className="text-2xl font-bold text-purple-500">
                    {timeUsed}m
                  </p>
                </div>
              </div>

              {/* Save Status */}
              <div className={`mb-6 p-4 rounded-xl transition-all ${
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
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    <span className={`text-sm font-medium ${isDark ? "text-blue-400" : "text-blue-700"}`}>
                      Saving your results...
                    </span>
                  </div>
                ) : saved ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className={`text-sm font-medium ${isDark ? "text-green-400" : "text-green-700"}`}>
                      Results saved successfully!
                    </span>
                  </div>
                ) : saveError ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className={`text-sm font-medium ${isDark ? "text-red-400" : "text-red-700"}`}>
                        Failed to save results
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
                      Retry Save
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Info Box */}
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-3 rounded-lg ${
                    isDark ? "bg-purple-500/10 border border-purple-500/20" : "bg-purple-50 border border-purple-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <i className="fa-solid fa-lightbulb text-purple-500 mt-0.5"></i>
                    <p className={`text-xs text-left ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                      <span className="font-semibold">Tip:</span> View your test history to review questions and see detailed explanations!
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/history'}
                  className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all ${
                    isDark
                      ? "border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
                  }`}
                >
                  <i className="fa-solid fa-clock-rotate-left mr-2"></i>
                  View History
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-xl transition-all"
                >
                  <i className="fa-solid fa-repeat mr-2"></i>
                  Take Another Test
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}