// QuestionReportsPage.jsx - Mobile Responsive Version
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getReports, updateReportStatus, deleteReport } from "../../services/adminApi";

export default function QuestionReportsPage({ palette }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, successColor, errorColor, warningColor } = palette;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [selectedReport, setSelectedReport] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  useEffect(() => {
    fetchReports();
  }, [pagination.page, filterStatus, filterPriority]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports({
        page: pagination.page,
        limit: pagination.limit,
        status: filterStatus,
        priority: filterPriority
      });
      
      setReports(data.reports);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return errorColor;
      case "In Review": return warningColor;
      case "Resolved": return successColor;
      default: return secondaryText;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return errorColor;
      case "Medium": return warningColor;
      case "Low": return successColor;
      default: return secondaryText;
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      fetchReports();
      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      alert('Failed to update report status');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteReport(reportId);
        setSelectedReport(null);
        fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Failed to delete report');
      }
    }
  };

  const totalReports = pagination.total;
  const pendingCount = reports.filter(r => r.status === 'Pending').length;
  const reviewingCount = reports.filter(r => r.status === 'In Review').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Reports", value: totalReports.toString(), icon: "fa-flag", color: primaryGradientFrom },
          { label: "Pending", value: pendingCount.toString(), icon: "fa-clock", color: errorColor },
          { label: "In Review", value: reviewingCount.toString(), icon: "fa-eye", color: warningColor },
          { label: "Resolved", value: resolvedCount.toString(), icon: "fa-check-circle", color: successColor },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 sm:p-6 rounded-2xl"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <i className={`fas ${stat.icon} text-lg sm:text-xl`} style={{ color: stat.color }}></i>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: textColor }}>{stat.value}</h3>
            <p className="text-xs sm:text-sm truncate" style={{ color: secondaryText }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="p-4 sm:p-6 rounded-2xl"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm font-semibold mb-2 block" style={{ color: textColor }}>Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border outline-none text-sm"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                borderColor,
                color: textColor,
              }}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="text-xs sm:text-sm font-semibold mb-2 block" style={{ color: textColor }}>Filter by Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border outline-none text-sm"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                borderColor,
                color: textColor,
              }}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl sm:text-3xl" style={{ color: primaryGradientFrom }}></i>
        </div>
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-6 rounded-2xl"
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                }}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span
                        className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${getStatusColor(report.status)}20`,
                          color: getStatusColor(report.status),
                        }}
                      >
                        {report.status}
                      </span>
                      <span
                        className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${getPriorityColor(report.priority)}20`,
                          color: getPriorityColor(report.priority),
                        }}
                      >
                        {report.priority} Priority
                      </span>
                      <span
                        className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${primaryGradientFrom}20`,
                          color: primaryGradientFrom,
                        }}
                      >
                        {report.reportType}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs sm:text-sm font-semibold" style={{ color: secondaryText }}>Question ID:</span>
                        <span className="font-bold text-sm sm:text-base" style={{ color: primaryGradientFrom }}>{report.questionId}</span>
                        <span className="text-xs sm:text-sm" style={{ color: secondaryText }}>•</span>
                        <span className="text-xs sm:text-sm" style={{ color: secondaryText }}>{report.category}</span>
                      </div>
                      <p className="font-semibold mb-2 text-sm sm:text-base break-words" style={{ color: textColor }}>"{report.questionText}"</p>
                      <p className="text-xs sm:text-sm mb-2 break-words" style={{ color: secondaryText }}>
                        <strong>Issue:</strong> {report.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm" style={{ color: secondaryText }}>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-user"></i>
                        <span className="truncate">{report.reportedBy}</span>
                      </span>
                      <span><i className="fas fa-clock mr-1"></i>{report.submittedDate}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="flex-1 sm:flex-none w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                      style={{
                        backgroundColor: `${primaryGradientFrom}20`,
                        color: primaryGradientFrom,
                      }}
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="flex-1 sm:flex-none w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                      style={{
                        backgroundColor: `${errorColor}20`,
                        color: errorColor,
                      }}
                      title="Delete Report"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
                style={{
                  backgroundColor: `${primaryGradientFrom}20`,
                  color: primaryGradientFrom
                }}
              >
                Previous
              </button>
              <span className="text-xs sm:text-sm" style={{ color: textColor }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
                style={{
                  backgroundColor: `${primaryGradientFrom}20`,
                  color: primaryGradientFrom
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* COMPACT Modal - NO SCROLLING */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              className="w-full max-w-lg rounded-2xl p-4"
              style={{ backgroundColor: cardBg }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-bold" style={{ color: textColor }}>Report Details</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                >
                  <i className="fas fa-times" style={{ color: textColor }}></i>
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${getStatusColor(selectedReport.status)}20`, color: getStatusColor(selectedReport.status) }}>
                    {selectedReport.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${getPriorityColor(selectedReport.priority)}20`, color: getPriorityColor(selectedReport.priority) }}>
                    {selectedReport.priority} Priority
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${primaryGradientFrom}20`, color: primaryGradientFrom }}>
                    {selectedReport.reportType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
                    <p className="text-xs mb-0.5" style={{ color: secondaryText }}>Question ID</p>
                    <p className="font-bold text-sm" style={{ color: primaryGradientFrom }}>{selectedReport.questionId}</p>
                  </div>
                  <div className="p-2.5 rounded-lg" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
                    <p className="text-xs mb-0.5" style={{ color: secondaryText }}>Category</p>
                    <p className="font-semibold text-sm truncate" style={{ color: textColor }}>{selectedReport.category}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: textColor }}>Question</p>
                  <p className="text-xs p-2.5 rounded-lg break-words" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", color: textColor }}>
                    {selectedReport.questionText}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: textColor }}>Issue</p>
                  <p className="text-xs p-2.5 rounded-lg break-words" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", color: textColor }}>
                    {selectedReport.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
                    <p className="text-xs mb-0.5" style={{ color: secondaryText }}>Reported By</p>
                    <p className="font-semibold text-xs truncate" style={{ color: textColor }}>{selectedReport.reportedBy}</p>
                  </div>
                  <div className="p-2.5 rounded-lg" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
                    <p className="text-xs mb-0.5" style={{ color: secondaryText }}>Submitted</p>
                    <p className="font-semibold text-xs" style={{ color: textColor }}>{selectedReport.submittedDate}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: textColor }}>Update Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleStatusChange(selectedReport.id, "Pending")} className="py-1.5 rounded-lg font-semibold text-xs" style={{ backgroundColor: `${errorColor}20`, color: errorColor }}>
                      Pending
                    </button>
                    <button onClick={() => handleStatusChange(selectedReport.id, "In Review")} className="py-1.5 rounded-lg font-semibold text-xs" style={{ backgroundColor: `${warningColor}20`, color: warningColor }}>
                      Review
                    </button>
                    <button onClick={() => handleStatusChange(selectedReport.id, "Resolved")} className="py-1.5 rounded-lg font-semibold text-xs" style={{ backgroundColor: `${successColor}20`, color: successColor }}>
                      Resolved
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button onClick={() => setSelectedReport(null)} className="py-2 rounded-lg font-semibold text-sm" style={{ background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`, color: "#fff" }}>
                    Close
                  </button>
                  <button onClick={() => handleDeleteReport(selectedReport.id)} className="py-2 rounded-lg font-semibold text-sm" style={{ backgroundColor: `${errorColor}20`, color: errorColor }}>
                    <i className="fas fa-trash mr-1"></i> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}