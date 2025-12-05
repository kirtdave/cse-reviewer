// src/components/History/HistoryTable.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HistoryTable({
  theme = "dark",
  filteredExams,
  expandedExamId,
  toggleDetails,
  onDelete,
}) {
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleReview = (examId) => {
    navigate(`/review/${examId}`);
  };

  const handleDeleteClick = (examId) => {
    setShowDeleteConfirm(examId);
  };

  const handleDeleteConfirm = async (examId) => {
    setDeletingId(examId);
    try {
      await onDelete(examId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-3 lg:space-y-0">
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredExams.map((exam, index) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-lg overflow-hidden`}
          >
            {/* Card Header */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-base mb-1 truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                    {exam.name}
                  </h3>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    <i className="fa-solid fa-calendar-days mr-1 text-blue-500"></i>
                    {exam.date}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${
                  exam.result === "Passed"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  <i className={`fa-solid ${exam.result === "Passed" ? "fa-circle-check" : "fa-circle-xmark"}`}></i>
                  {exam.result}
                </span>
              </div>

              {/* Score Display */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Score
                  </span>
                  <span className={`text-2xl font-bold ${
                    exam.score >= 70 ? "text-green-400" : "text-red-400"
                  }`}>
                    {exam.score}%
                  </span>
                </div>
                <div className={`h-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"} overflow-hidden`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${exam.score}%` }}
                    transition={{ duration: 1, delay: index * 0.05 + 0.2 }}
                    className={`h-2 rounded-full ${
                      exam.score >= 70 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                        : "bg-gradient-to-r from-red-500 to-pink-500"
                    }`}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleReview(exam.id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium hover:shadow-lg transition-all"
                >
                  <i className="fa-solid fa-magnifying-glass-chart"></i>
                  Review Exam
                </motion.button>
                
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleDetails(exam.id)}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isDark 
                        ? "bg-gray-800 text-gray-300 active:bg-gray-700" 
                        : "bg-gray-100 text-gray-700 active:bg-gray-200"
                    }`}
                  >
                    <i className={`fa-solid ${expandedExamId === exam.id ? "fa-eye-slash" : "fa-eye"}`}></i>
                    {expandedExamId === exam.id ? "Hide" : "Details"}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeleteClick(exam.id)}
                    disabled={deletingId === exam.id}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all disabled:opacity-50"
                  >
                    {deletingId === exam.id ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span className="hidden sm:inline">Deleting...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-trash"></i>
                        Delete
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Delete Confirmation */}
            <AnimatePresence>
              {showDeleteConfirm === exam.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className={`p-4 ${isDark ? "bg-red-900/20" : "bg-red-50/50"} border-t ${isDark ? "border-red-800/50" : "border-red-200"}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-exclamation-triangle text-red-500"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-sm mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                          Delete Exam History?
                        </h4>
                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          This action cannot be undone. All data for "{exam.name}" will be permanently deleted.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDeleteCancel}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isDark 
                            ? "bg-gray-800 text-gray-300 active:bg-gray-700" 
                            : "bg-gray-100 text-gray-700 active:bg-gray-200"
                        }`}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDeleteConfirm(exam.id)}
                        className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all"
                      >
                        <i className="fa-solid fa-trash mr-1"></i>
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedExamId === exam.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className={`p-4 ${isDark ? "bg-gray-800/30" : "bg-gray-50/50"} border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                    {/* Section Scores */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <i className="fa-solid fa-chart-pie text-white text-sm"></i>
                        </div>
                        <h4 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                          Section Scores
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {(() => {
                          const allSections = [
                            { label: "Verbal Ability", value: exam.details.verbal || 0, gradient: "from-green-500 to-emerald-500", key: "verbal" },
                            { label: "Numerical Ability", value: exam.details.numerical || 0, gradient: "from-blue-500 to-cyan-500", key: "numerical" },
                            { label: "Analytical Ability", value: exam.details.analytical || 0, gradient: "from-purple-500 to-pink-500", key: "analytical" },
                            { label: "General Knowledge", value: exam.details.generalKnowledge || 0, gradient: "from-orange-500 to-red-500", key: "general" },
                            { label: "Clerical Ability", value: exam.details.clerical || 0, gradient: "from-cyan-500 to-blue-500", key: "clerical" },
                            { label: "Philippine Constitution", value: exam.details.constitution || 0, gradient: "from-yellow-500 to-orange-500", key: "constitution" },
                          ];

                          const isMockExam = exam.name.toLowerCase().includes('mock') || exam.isMockExam;
                          let sectionsToShow = allSections;

                          if (!isMockExam && exam.categories && exam.categories.length > 0) {
                            sectionsToShow = allSections.filter(section => {
                              return exam.categories.some(cat => {
                                const catLower = cat.toLowerCase();
                                const sectionLabelLower = section.label.toLowerCase();
                                return catLower.includes(section.key) || sectionLabelLower.includes(catLower) || catLower.includes(sectionLabelLower);
                              });
                            });
                          }

                          if (sectionsToShow.length === 0) {
                            return (
                              <p className={`text-xs text-center py-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                No section data available
                              </p>
                            );
                          }

                          return sectionsToShow.map((section) => (
                            <div key={section.label}>
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                  {section.label}
                                </span>
                                <span className={`text-xs font-bold bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent`}>
                                  {section.value}%
                                </span>
                              </div>
                              <div className={`h-1.5 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"} overflow-hidden`}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${section.value}%` }}
                                  transition={{ duration: 1 }}
                                  className={`h-1.5 rounded-full bg-gradient-to-r ${section.gradient}`}
                                />
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Exam Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className={`p-3 rounded-lg ${isDark ? "bg-gray-900/50" : "bg-white/50"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                        <div className="flex flex-col items-center text-center">
                          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mb-1">
                            <i className="fa-solid fa-check text-green-400 text-sm"></i>
                          </div>
                          <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {exam.details.correctQuestions}
                          </p>
                          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Correct
                          </p>
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg ${isDark ? "bg-gray-900/50" : "bg-white/50"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                        <div className="flex flex-col items-center text-center">
                          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center mb-1">
                            <i className="fa-solid fa-xmark text-red-400 text-sm"></i>
                          </div>
                          <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {exam.details.incorrectQuestions}
                          </p>
                          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Wrong
                          </p>
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg ${isDark ? "bg-gray-900/50" : "bg-white/50"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                        <div className="flex flex-col items-center text-center">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-1">
                            <i className="fa-solid fa-clock text-blue-400 text-sm"></i>
                          </div>
                          <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {exam.details.timeSpent}
                          </p>
                          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Time
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tip */}
                    <div className={`p-3 rounded-lg ${isDark ? "bg-blue-500/10" : "bg-blue-50"} border ${isDark ? "border-blue-500/20" : "border-blue-200"}`}>
                      <div className="flex items-start gap-2">
                        <i className="fa-solid fa-lightbulb text-blue-500 text-sm mt-0.5 flex-shrink-0"></i>
                        <p className={`text-xs ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                          <span className="font-semibold">Tip:</span> Click "Review Exam" to see detailed question analysis and explanations.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl overflow-hidden`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={`${isDark ? "bg-gray-800/50" : "bg-gray-100/50"}`}>
                <tr>
                  <th className={`py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Exam Name
                  </th>
                  <th className={`py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Date
                  </th>
                  <th className={`py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Score
                  </th>
                  <th className={`py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Result
                  </th>
                  <th className={`py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-gray-800" : "divide-gray-200"}`}>
                {filteredExams.map((exam, index) => (
                  <React.Fragment key={exam.id}>
                    <motion.tr
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className={`transition-colors ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50/50"}`}
                    >
                      <td className={`py-4 px-6 font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        {exam.name}
                      </td>
                      <td className={`py-4 px-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        <i className="fa-solid fa-calendar-days mr-2 text-blue-500"></i>
                        {exam.date}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${
                            exam.score >= 70 
                              ? "text-green-400" 
                              : "text-red-400"
                          }`}>
                            {exam.score}%
                          </span>
                          <div className={`h-2 w-24 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"} overflow-hidden`}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${exam.score}%` }}
                              transition={{ duration: 1, delay: index * 0.05 + 0.2 }}
                              className={`h-2 rounded-full ${
                                exam.score >= 70 
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                                  : "bg-gradient-to-r from-red-500 to-pink-500"
                              }`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          exam.result === "Passed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          <i className={`fa-solid ${exam.result === "Passed" ? "fa-circle-check" : "fa-circle-xmark"}`}></i>
                          {exam.result}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleReview(exam.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium hover:shadow-lg transition-all"
                          >
                            <i className="fa-solid fa-magnifying-glass-chart"></i>
                            Review
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleDetails(exam.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              isDark 
                                ? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            <i className={`fa-solid ${expandedExamId === exam.id ? "fa-eye-slash" : "fa-eye"}`}></i>
                            {expandedExamId === exam.id ? "Hide" : "Details"}
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteClick(exam.id)}
                            disabled={deletingId === exam.id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === exam.id ? (
                              <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-trash"></i>
                                Delete
                              </>
                            )}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Delete Confirmation Modal */}
                    <AnimatePresence>
                      {showDeleteConfirm === exam.id && (
                        <tr>
                          <td colSpan={5} className="p-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className={`p-6 ${isDark ? "bg-red-900/20" : "bg-red-50/50"} border-t border-b ${isDark ? "border-red-800/50" : "border-red-200"}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                      <i className="fa-solid fa-exclamation-triangle text-red-500"></i>
                                    </div>
                                    <div>
                                      <h4 className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                        Delete Exam History?
                                      </h4>
                                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                        This action cannot be undone. All data for "{exam.name}" will be permanently deleted.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={handleDeleteCancel}
                                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        isDark 
                                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
                                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                      }`}
                                    >
                                      Cancel
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleDeleteConfirm(exam.id)}
                                      className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
                                    >
                                      <i className="fa-solid fa-trash mr-2"></i>
                                      Delete Forever
                                    </motion.button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>

                    {/* Exam Details */}
                    <AnimatePresence>
                      {expandedExamId === exam.id && (
                        <tr>
                          <td colSpan={5} className="p-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className={`p-4 ${isDark ? "bg-gray-800/30" : "bg-gray-50/50"}`}>
                                <div className="grid md:grid-cols-2 gap-4">
                                  {/* Section Scores */}
                                  <div className={`p-4 rounded-xl ${isDark ? "bg-gray-900/50" : "bg-white/50"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <i className="fa-solid fa-chart-pie text-white text-sm"></i>
                                      </div>
                                      <h4 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                                        Section Scores
                                      </h4>
                                    </div>
                                    <div className="space-y-2.5">
                                      {(() => {
                                        const allSections = [
                                          { label: "Verbal Ability", value: exam.details.verbal || 0, gradient: "from-green-500 to-emerald-500", key: "verbal" },
                                          { label: "Numerical Ability", value: exam.details.numerical || 0, gradient: "from-blue-500 to-cyan-500", key: "numerical" },
                                          { label: "Analytical Ability", value: exam.details.analytical || 0, gradient: "from-purple-500 to-pink-500", key: "analytical" },
                                          { label: "General Knowledge", value: exam.details.generalKnowledge || 0, gradient: "from-orange-500 to-red-500", key: "general" },
                                          { label: "Clerical Ability", value: exam.details.clerical || 0, gradient: "from-cyan-500 to-blue-500", key: "clerical" },
                                          { label: "Philippine Constitution", value: exam.details.constitution || 0, gradient: "from-yellow-500 to-orange-500", key: "constitution" },
                                        ];

                                        const isMockExam = exam.name.toLowerCase().includes('mock') || exam.isMockExam;
                                        let sectionsToShow = allSections;

                                        if (!isMockExam && exam.categories && exam.categories.length > 0) {
                                          sectionsToShow = allSections.filter(section => {
                                            return exam.categories.some(cat => {
                                              const catLower = cat.toLowerCase();
                                              const sectionLabelLower = section.label.toLowerCase();
                                              return catLower.includes(section.key) || sectionLabelLower.includes(catLower) || catLower.includes(sectionLabelLower);
                                            });
                                          });
                                        }

                                        if (sectionsToShow.length === 0) {
                                          return (
                                            <p className={`text-sm text-center py-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                              No section data available
                                            </p>
                                          );
                                        }

                                        return sectionsToShow.map((section) => (
                                          <div key={section.label}>
                                            <div className="flex justify-between items-center mb-1">
                                              <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                                {section.label}
                                              </span>
                                              <span className={`text-sm font-bold bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent`}>
                                                {section.value}%
                                              </span>
                                            </div>
                                            <div className={`h-1.5 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"} overflow-hidden`}>
                                              <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${section.value}%` }}
                                                transition={{ duration: 1 }}
                                                className={`h-1.5 rounded-full bg-gradient-to-r ${section.gradient}`}
                                              />
                                            </div>
                                          </div>
                                        ));
                                      })()}
                                    </div>
                                  </div>

                                  {/* Exam Statistics */}
                                  <div className={`p-4 rounded-xl ${isDark ? "bg-gray-900/50" : "bg-white/50"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                                        <i className="fa-solid fa-chart-bar text-white text-sm"></i>
                                      </div>
                                      <h4 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                                        Exam Statistics
                                      </h4>
                                    </div>
                                    
                                    <div className="space-y-2.5">
                                      <div className={`p-3 rounded-lg ${isDark ? "bg-gray-800/50" : "bg-gray-50"}`}>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                              <i className="fa-solid fa-check text-green-400 text-sm"></i>
                                            </div>
                                            <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                              Correct Answers
                                            </span>
                                          </div>
                                          <span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                            {exam.details.correctQuestions}
                                          </span>
                                        </div>
                                      </div>

                                      <div className={`p-3 rounded-lg ${isDark ? "bg-gray-800/50" : "bg-gray-50"}`}>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                                              <i className="fa-solid fa-xmark text-red-400 text-sm"></i>
                                            </div>
                                            <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                              Wrong Answers
                                            </span>
                                          </div>
                                          <span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                            {exam.details.incorrectQuestions}
                                          </span>
                                        </div>
                                      </div>

                                      <div className={`p-3 rounded-lg ${isDark ? "bg-gray-800/50" : "bg-gray-50"}`}>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                              <i className="fa-solid fa-clock text-blue-400 text-sm"></i>
                                            </div>
                                            <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                              Time Spent
                                            </span>
                                          </div>
                                          <span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                            {exam.details.timeSpent}
                                          </span>
                                        </div>
                                      </div>

                                      <div className={`p-3 rounded-lg ${isDark ? "bg-blue-500/10" : "bg-blue-50"} border ${isDark ? "border-blue-500/20" : "border-blue-200"}`}>
                                        <div className="flex items-start gap-2">
                                          <i className="fa-solid fa-lightbulb text-blue-500 text-sm mt-0.5 flex-shrink-0"></i>
                                          <p className={`text-xs ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                                            <span className="font-semibold">Tip:</span> Review the exam to see detailed explanations for each question.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}