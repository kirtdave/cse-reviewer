// QuestionReportsPage.jsx
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

  // Calculate stats from reports
  const totalReports = pagination.total;
  const pendingCount = reports.filter(r => r.status === 'Pending').length;
  const reviewingCount = reports.filter(r => r.status === 'In Review').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            className="p-6 rounded-2xl"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <i className={`fas ${stat.icon} text-xl`} style={{ color: stat.color }}></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: textColor }}>{stat.value}</h3>
            <p className="text-sm" style={{ color: secondaryText }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="p-6 rounded-2xl"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full px-4 py-2.5 rounded-xl border outline-none"
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
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Filter by Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full px-4 py-2.5 rounded-xl border outline-none"
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
          <i className="fas fa-spinner fa-spin text-3xl" style={{ color: primaryGradientFrom }}></i>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl"
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${getStatusColor(report.status)}20`,
                          color: getStatusColor(report.status),
                        }}
                      >
                        {report.status}
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${getPriorityColor(report.priority)}20`,
                          color: getPriorityColor(report.priority),
                        }}
                      >
                        {report.priority} Priority
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${primaryGradientFrom}20`,
                          color: primaryGradientFrom,
                        }}
                      >
                        {report.reportType}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold" style={{ color: secondaryText }}>Question ID:</span>
                        <span className="font-bold" style={{ color: primaryGradientFrom }}>{report.questionId}</span>
                        <span className="text-sm" style={{ color: secondaryText }}>•</span>
                        <span className="text-sm" style={{ color: secondaryText }}>{report.category}</span>
                      </div>
                      <p className="font-semibold mb-2" style={{ color: textColor }}>"{report.questionText}"</p>
                      <p className="text-sm mb-2" style={{ color: secondaryText }}>
                        <strong>Issue:</strong> {report.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm" style={{ color: secondaryText }}>
                      <span><i className="fas fa-user mr-1"></i>Reported by: {report.reportedBy}</span>
                      <span><i className="fas fa-clock mr-1"></i>{report.submittedDate}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
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
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
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
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                style={{
                  backgroundColor: `${primaryGradientFrom}20`,
                  color: primaryGradientFrom
                }}
              >
                Previous
              </button>
              <span style={{ color: textColor }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
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

      {/* Report Details Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
              style={{ backgroundColor: cardBg }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold" style={{ color: textColor }}>Report Details</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                >
                  <i className="fas fa-times" style={{ color: textColor }}></i>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${getStatusColor(selectedReport.status)}20`,
                        color: getStatusColor(selectedReport.status),
                      }}
                    >
                      {selectedReport.status}
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${getPriorityColor(selectedReport.priority)}20`,
                        color: getPriorityColor(selectedReport.priority),
                      }}
                    >
                      {selectedReport.priority} Priority
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                    >
                      <p className="text-sm mb-1" style={{ color: secondaryText }}>Question ID</p>
                      <p className="font-bold" style={{ color: primaryGradientFrom }}>{selectedReport.questionId}</p>
                    </div>
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                    >
                      <p className="text-sm mb-1" style={{ color: secondaryText }}>Category</p>
                      <p className="font-semibold" style={{ color: textColor }}>{selectedReport.category}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Question Text</label>
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                    >
                      <p style={{ color: textColor }}>{selectedReport.questionText}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Report Type</label>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: `${primaryGradientFrom}20`,
                        color: primaryGradientFrom,
                      }}
                    >
                      {selectedReport.reportType}
                    </span>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Issue Description</label>
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                    >
                      <p style={{ color: textColor }}>{selectedReport.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                    >
                      <p className="text-sm mb-1" style={{ color: secondaryText }}>Reported By</p>
                      <p className="font-semibold" style={{ color: textColor }}>{selectedReport.reportedBy}</p>
                    </div>
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                    >
                      <p className="text-sm mb-1" style={{ color: secondaryText }}>Submitted</p>
                      <p className="font-semibold" style={{ color: textColor }}>{selectedReport.submittedDate}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Update Status</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedReport.id, "Pending")}
                      className="flex-1 py-2 rounded-xl font-semibold text-sm"
                      style={{
                        backgroundColor: `${errorColor}20`,
                        color: errorColor,
                      }}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedReport.id, "In Review")}
                      className="flex-1 py-2 rounded-xl font-semibold text-sm"
                      style={{
                        backgroundColor: `${warningColor}20`,
                        color: warningColor,
                      }}
                    >
                      In Review
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedReport.id, "Resolved")}
                      className="flex-1 py-2 rounded-xl font-semibold text-sm"
                      style={{
                        backgroundColor: `${successColor}20`,
                        color: successColor,
                      }}
                    >
                      Resolved
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="flex-1 py-3 rounded-xl font-semibold"
                    style={{
                      background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                      color: "#fff",
                    }}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDeleteReport(selectedReport.id)}
                    className="px-6 py-3 rounded-xl font-semibold"
                    style={{
                      backgroundColor: `${errorColor}20`,
                      color: errorColor,
                    }}
                  >
                    <i className="fas fa-trash mr-2"></i>
                    Delete
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