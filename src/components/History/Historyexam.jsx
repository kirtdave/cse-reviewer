import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HistoryHeader from "./HistoryHeader";
import HistorySummary from "./HistorySummary";
import HistoryTable from "./HistoryTable";
import DeletedTestsModal from "./DeletedTestsModal";
import { getTestAttempts, getUserStats, deleteTestAttempt } from "../../services/testAttemptService";

export default function ExamHistoryPage({ theme = "dark" }) {
  const isDark = theme === "dark";

  // State
  const [examAttempts, setExamAttempts] = useState([]);
  const [stats, setStats] = useState({
    totalExams: 0,
    totalPassed: 0,
    totalFailed: 0,
    averageScore: 0
  });
  const [expandedExamId, setExpandedExamId] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [filterResult, setFilterResult] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Check auth and fetch data on mount
  useEffect(() => {
    checkAuthAndFetchData();
  }, [sortBy, filterResult, page]);

  const checkAuthAndFetchData = async () => {
    setLoading(true);

    // Check if user is logged in
    const token = localStorage.getItem('token');
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn && !!token);

    if (loggedIn && token) {
      // Logged-in user: Fetch real data
      await fetchData();
    } else {
      // Guest user: Show empty state
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch attempts with filters
      const sortField = sortBy === "date" ? "completedAt" : "score";
      const attemptsData = await getTestAttempts({
        page,
        limit: 10,
        sortBy: sortField,
        sortOrder: "desc",
        result: filterResult
      });

      // Fetch user stats
      const statsData = await getUserStats();

      // Transform backend data
      const transformedAttempts = attemptsData.attempts.map(attempt => {
        let examName = attempt.name;
        examName = examName.replace(/\s*-\s*\w{3}\s+\d{1,2},\s+\d{4}.*$/i, '');
        
        return {
          id: attempt.id,
          name: examName,
          date: new Date(attempt.completedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          score: attempt.score,
          result: attempt.result,
          categories: attempt.categories || [],
          isMockExam: attempt.isMockExam || false,
          details: {
            verbal: attempt.details.sectionScores.verbal || 
                    attempt.details.sectionScores['Verbal Ability'] || 0,
            numerical: attempt.details.sectionScores.numerical || 
                       attempt.details.sectionScores['Numerical Ability'] || 0,
            analytical: attempt.details.sectionScores.analytical || 
                        attempt.details.sectionScores['Analytical Ability'] || 0,
            generalKnowledge: attempt.details.sectionScores.generalInfo || 
                              attempt.details.sectionScores['General Knowledge'] || 0,
            clerical: attempt.details.sectionScores.clerical || 
                      attempt.details.sectionScores['Clerical Ability'] || 0,
            constitution: attempt.details.sectionScores.constitution || 
                          attempt.details.sectionScores['Philippine Constitution'] || 0,
            timeSpent: attempt.details.timeSpent,
            correctQuestions: attempt.details.correctQuestions,
            incorrectQuestions: attempt.details.incorrectQuestions
          }
        };
      });

      setExamAttempts(transformedAttempts);
      setPagination(attemptsData.pagination);
      setStats({
        totalExams: statsData.totalAttempts,
        totalPassed: statsData.totalPassed,
        totalFailed: statsData.totalFailed,
        averageScore: Math.round(statsData.averageScore)
      });

    } catch (err) {
      console.error('Error fetching history data:', err);
      if (err.message.includes('401') || err.message.includes('Authentication')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = (id) => setExpandedExamId(expandedExamId === id ? null : id);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  const handleFilterChange = (newFilter) => {
    setFilterResult(newFilter);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSortBy("date");
    setFilterResult("All");
    setPage(1);
  };

  const handleDelete = async (examId) => {
    try {
      console.log('🗑️ Deleting exam ID:', examId);
      await deleteTestAttempt(examId);
      
      const examName = examAttempts.find(e => e.id === examId)?.name;
      console.log(`✅ Successfully deleted: ${examName}`);
      
      await fetchData();
      
      if (expandedExamId === examId) {
        setExpandedExamId(null);
      }
    } catch (err) {
      console.error('Error deleting exam:', err);
      throw err;
    }
  };

  const handleViewDeleted = () => {
    setShowDeletedModal(true);
  };

  const handleRestoreComplete = async () => {
    await fetchData();
  };

  return (
    <main className={`relative min-h-screen transition-colors duration-500 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(63,167,214,0.08)_1px,_transparent_1px)] bg-[size:40px_40px]"
        />
      </div>

      {/* Content */}
      <HistoryHeader theme={theme} onViewDeleted={handleViewDeleted} />
      <div className="relative z-10 p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto space-y-6">  

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Loading exam history...
                </p>
              </div>
            </div>
          ) : !isLoggedIn ? (
            // Guest User Empty State
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl p-12 text-center`}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-lock text-white text-3xl"></i>
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                Login Required
              </h3>
              <p className={`text-lg mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Please login to view and track your exam history
              </p>
            </motion.div>
          ) : (
            <>
              {/* Summary Cards and Filters */}
              <HistorySummary
                theme={theme}
                totalExams={stats.totalExams}
                totalPassed={stats.totalPassed}
                totalFailed={stats.totalFailed}
                averageScore={stats.averageScore}
                sortBy={sortBy}
                setSortBy={handleSortChange}
                filterResult={filterResult}
                setFilterResult={handleFilterChange}
                onReset={handleResetFilters}
              />

              {/* Empty State - No exams */}
              {examAttempts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl p-12 text-center`}
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                    <i className="fa-solid fa-inbox text-white text-3xl"></i>
                  </div>
                  <h3 className={`text-2xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                    No Exam History Yet
                  </h3>
                  <p className={`text-lg mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Take your first exam to start tracking your progress!
                  </p>
                  <button
                    onClick={() => window.location.href = '/test'}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                  >
                    <i className="fa-solid fa-pencil mr-2"></i>
                    Take an Exam
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Exam Table */}
                  <HistoryTable
                    theme={theme}
                    filteredExams={examAttempts}
                    expandedExamId={expandedExamId}
                    toggleDetails={toggleDetails}
                    onDelete={handleDelete}
                  />

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl p-4`}
                    >
                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} results
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              page === 1
                                ? isDark ? "bg-gray-800 text-gray-600 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : isDark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            <i className="fa-solid fa-chevron-left mr-2"></i>
                            Previous
                          </button>
                          <span className={`px-4 py-2 font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            Page {page} of {pagination.pages}
                          </span>
                          <button
                            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                            disabled={page === pagination.pages}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              page === pagination.pages
                                ? isDark ? "bg-gray-800 text-gray-600 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : isDark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            Next
                            <i className="fa-solid fa-chevron-right ml-2"></i>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Deleted Tests Modal */}
      <DeletedTestsModal
        theme={theme}
        isOpen={showDeletedModal}
        onClose={() => setShowDeletedModal(false)}
        onRestore={handleRestoreComplete}
      />
    </main>
  );
}