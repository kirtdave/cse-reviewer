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
    <div className="overflow-x-auto">
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
                            <div className={`p-6 ${isDark ? "bg-gray-800/30" : "bg-gray-50/50"}`}>
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* Section Scores */}
                                <div className={`p-5 rounded-xl ${isDark ? "bg-gray-900/50" : "bg-white/50"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                      <i className="fa-solid fa-chart-pie text-white"></i>
                                    </div>
                                    <h4 className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                                      Section Scores
                                    </h4>
                                  </div>
                                  <div className="space-y-3">
                                    {/* ✅ ALL 7 CATEGORIES */}
                                    {(() => {
                                      const allSections = [
                                        { label: "Verbal Ability", value: exam.details.verbal || 0, gradient: "from-green-500 to-emerald-500", key: "verbal" },
                                        { label: "Numerical Ability", value: exam.details.numerical || 0, gradient: "from-blue-500 to-cyan-500", key: "numerical" },
                                        { label: "Analytical Ability", value: exam.details.analytical || 0, gradient: "from-purple-500 to-pink-500", key: "analytical" },
                                        { label: "General Knowledge", value: exam.details.generalKnowledge || 0, gradient: "from-orange-500 to-red-500", key: "general" },
                                        { label: "Clerical Ability", value: exam.details.clerical || 0, gradient: "from-cyan-500 to-blue-500", key: "clerical" },
                                        { label: "Philippine Constitution", value: exam.details.constitution || 0, gradient: "from-yellow-500 to-orange-500", key: "constitution" },
                                      ];

                                      // Check if this is a Mock Exam
                                      const isMockExam = exam.name.toLowerCase().includes('mock') || exam.isMockExam;

                                      let sectionsToShow = allSections;

                                      // For Practice Tests (non-mock), filter by categories
                                      if (!isMockExam && exam.categories && exam.categories.length > 0) {
                                        sectionsToShow = allSections.filter(section => {
                                          return exam.categories.some(cat => {
                                            const catLower = cat.toLowerCase();
                                            const sectionLabelLower = section.label.toLowerCase();
                                            return catLower.includes(section.key) || sectionLabelLower.includes(catLower) || catLower.includes(sectionLabelLower);
                                          });
                                        });
                                      }

                                      // If no sections to show, display message
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
                                          <div className={`h-2 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"} overflow-hidden`}>
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ width: `${section.value}%` }}
                                              transition={{ duration: 1 }}
                                              className={`h-2 rounded-full bg-gradient-to-r ${section.gradient}`}
                                            />
                                          </div>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                </div>

                                {/* Exam Details */}
                                <div className={`p-5 rounded-xl ${isDark ? "bg-gray-900/50" : "bg-white/50"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                      <i className="fa-solid fa-info-circle text-white"></i>
                                    </div>
                                    <h4 className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                                      Exam Details
                                    </h4>
                                  </div>
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <i className="fa-solid fa-check text-green-400"></i>
                                      </div>
                                      <div>
                                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                          Correct Questions
                                        </p>
                                        <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                          {exam.details.correctQuestions}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                                        <i className="fa-solid fa-xmark text-red-400"></i>
                                      </div>
                                      <div>
                                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                          Incorrect Questions
                                        </p>
                                        <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                          {exam.details.incorrectQuestions}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <i className="fa-solid fa-clock text-blue-400"></i>
                                      </div>
                                      <div>
                                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                          Time Spent
                                        </p>
                                        <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                          {exam.details.timeSpent}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className={`mt-4 p-3 rounded-lg ${isDark ? "bg-blue-500/10" : "bg-blue-50"} border ${isDark ? "border-blue-500/20" : "border-blue-200"}`}>
                                    <div className="flex items-start gap-2">
                                      <i className="fa-solid fa-lightbulb text-blue-500 mt-0.5"></i>
                                      <p className={`text-xs ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                                        <span className="font-semibold">Tip:</span> Click "Review" to see detailed question analysis and explanations.
                                      </p>
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
  );
}