import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDeletedAttempts, restoreTestAttempt } from "../../services/testAttemptService";

export default function DeletedTestsModal({ theme = "dark", isOpen, onClose, onRestore }) {
  const isDark = theme === "dark";
  const [deletedTests, setDeletedTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchDeletedTests();
    }
  }, [isOpen]);

  const fetchDeletedTests = async () => {
    setLoading(true);
    try {
      const deleted = await getDeletedAttempts();
      // Transform the data to match the format we need
      const transformedDeleted = deleted.map(test => ({
        id: test.id,
        name: test.name.replace(/\s*-\s*\w{3}\s+\d{1,2},\s+\d{4}.*$/i, ''),
        score: test.score,
        result: test.result,
        completedAt: test.completedAt,
        deletedAt: test.deletedAt
      }));
      setDeletedTests(transformedDeleted);
    } catch (error) {
      console.error('Error fetching deleted tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (testId) => {
    setRestoringId(testId);
    try {
      await restoreTestAttempt(testId);
      setDeletedTests(deletedTests.filter(test => test.id !== testId));
      if (onRestore) onRestore();
    } catch (error) {
      console.error('Error restoring test:', error);
      alert('Failed to restore test. Please try again.');
    } finally {
      setRestoringId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-4xl max-h-[90vh] ${isDark ? "bg-gray-900" : "bg-white"} rounded-2xl shadow-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} overflow-hidden flex flex-col`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <i className="fa-solid fa-trash-arrow-up text-white text-xl"></i>
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Deleted Tests
                  </h2>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Restore tests you've previously removed from history
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`w-10 h-10 rounded-lg ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"} flex items-center justify-center transition-all`}
              >
                <i className={`fa-solid fa-xmark ${isDark ? "text-gray-400" : "text-gray-600"}`}></i>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Loading deleted tests...
                  </p>
                </div>
              </div>
            ) : deletedTests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6">
                  <i className="fa-solid fa-check text-white text-3xl"></i>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  No Deleted Tests
                </h3>
                <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Your test history is clean!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Info Banner */}
                <div className={`p-4 rounded-xl ${isDark ? "bg-blue-500/10" : "bg-blue-50"} border ${isDark ? "border-blue-500/20" : "border-blue-200"} mb-4`}>
                  <div className="flex items-start gap-3">
                    <i className="fa-solid fa-info-circle text-blue-500 text-lg mt-0.5"></i>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDark ? "text-blue-300" : "text-blue-700"} mb-1`}>
                        Why can't I permanently delete tests?
                      </p>
                      <p className={`text-xs ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                        To maintain accurate analytics and prevent score manipulation, deleted tests are kept in the system. 
                        They don't appear in your history but still count toward your statistics. You can restore them anytime!
                      </p>
                    </div>
                  </div>
                </div>

                {deletedTests.map((test, index) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl border ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-lg mb-1 truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                          {test.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <span className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            <i className="fa-solid fa-calendar-days mr-1 text-blue-500"></i>
                            Completed: {new Date(test.completedAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                          <span className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            <i className="fa-solid fa-trash mr-1 text-red-500"></i>
                            Deleted: {new Date(test.deletedAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            test.score >= 70 ? "text-green-400" : "text-red-400"
                          }`}>
                            {test.score}%
                          </div>
                          <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {test.result}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRestore(test.id)}
                          disabled={restoringId === test.id}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {restoringId === test.id ? (
                            <>
                              <i className="fa-solid fa-spinner fa-spin"></i>
                              Restoring...
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-arrow-rotate-left"></i>
                              Restore
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <button
              onClick={onClose}
              className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                isDark 
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}