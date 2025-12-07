// NotificationsPage.jsx - Mobile Responsive Version
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getNotifications, createNotification, updateNotification, deleteNotification, publishNotification } from "../../services/adminApi";

export default function NotificationsPage({ palette }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, successColor, errorColor, warningColor } = palette;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "Announcement",
    status: "Draft",
    recipients: "All Users",
  });

  const notificationTypes = ["Announcement", "New Content", "Maintenance", "Update", "Reminder"];

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getNotifications();
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCreateNotification = () => {
    setEditingNotification(null);
    setFormData({
      title: "",
      message: "",
      type: "Announcement",
      status: "Draft",
      recipients: "All Users",
    });
    setShowCreateModal(true);
  };

  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      status: notification.status,
      recipients: notification.recipients
    });
    setShowCreateModal(true);
  };

  const handleSaveNotification = async () => {
    try {
      if (editingNotification) {
        await updateNotification(editingNotification.id, formData);
      } else {
        await createNotification(formData);
      }
      setShowCreateModal(false);
      fetchNotifications();
    } catch (error) {
      console.error('Error saving notification:', error);
      alert('Failed to save notification');
    }
  };

  const handleDeleteNotification = async (id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteNotification(id);
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Failed to delete notification');
      }
    }
  };

  const handlePublishNotification = async (id) => {
    try {
      await publishNotification(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error publishing notification:', error);
      alert('Failed to publish notification');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "New Content": return successColor;
      case "Maintenance": return warningColor;
      case "Update": return primaryGradientFrom;
      case "Reminder": return primaryGradientTo;
      default: return primaryGradientFrom;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Published": return successColor;
      case "Scheduled": return warningColor;
      case "Draft": return secondaryText;
      default: return secondaryText;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "New Content": return "fa-file-alt";
      case "Maintenance": return "fa-tools";
      case "Update": return "fa-sync";
      case "Reminder": return "fa-clock";
      default: return "fa-bell";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not published";
    const d = new Date(date);
    return d.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const publishedCount = notifications.filter(n => n.status === "Published").length;
  const draftCount = notifications.filter(n => n.status === "Draft").length;
  const totalViews = notifications.reduce((sum, n) => sum + (n.views || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Notifications", value: notifications.length.toString(), icon: "fa-bell", color: primaryGradientFrom },
          { label: "Published", value: publishedCount.toString(), icon: "fa-check-circle", color: successColor },
          { label: "Total Views", value: totalViews.toString(), icon: "fa-eye", color: primaryGradientTo },
          { label: "Drafts", value: draftCount.toString(), icon: "fa-file", color: warningColor },
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

      {/* Create Button & Auto-refresh Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold mb-1" style={{ color: textColor }}>Manage Notifications</h2>
          <p className="text-xs sm:text-sm" style={{ color: secondaryText }}>Send announcements and reminders to all users</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              autoRefresh ? 'opacity-100' : 'opacity-50'
            }`}
            style={{
              backgroundColor: autoRefresh ? `${successColor}20` : `${secondaryText}20`,
              color: autoRefresh ? successColor : secondaryText,
              border: `1px solid ${autoRefresh ? successColor : borderColor}30`
            }}
          >
            <i className={`fas fa-${autoRefresh ? 'check-circle' : 'pause-circle'}`}></i>
            <span className="hidden sm:inline">Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</span>
            <span className="sm:hidden">{autoRefresh ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleCreateNotification}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all hover:scale-105 flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
              color: "#fff",
              boxShadow: isDark ? "0 4px 12px rgba(59,130,246,0.3)" : "0 4px 12px rgba(59,130,246,0.2)",
            }}
          >
            <i className="fas fa-plus"></i>
            Create
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl sm:text-3xl" style={{ color: primaryGradientFrom }}></i>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-6 rounded-2xl"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${getTypeColor(notification.type)}20` }}
                  >
                    <i
                      className={`fas ${getTypeIcon(notification.type)} text-lg sm:text-xl`}
                      style={{ color: getTypeColor(notification.type) }}
                    ></i>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${getStatusColor(notification.status)}20`,
                          color: getStatusColor(notification.status),
                        }}
                      >
                        {notification.status}
                      </span>
                      <span
                        className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${getTypeColor(notification.type)}20`,
                          color: getTypeColor(notification.type),
                        }}
                      >
                        {notification.type}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold mb-2 break-words" style={{ color: textColor }}>
                      {notification.title}
                    </h3>
                    <p className="text-xs sm:text-sm mb-3 break-words" style={{ color: secondaryText }}>
                      {notification.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm" style={{ color: secondaryText }}>
                      <span><i className="fas fa-users mr-1"></i>{notification.recipients}</span>
                      <span className="truncate"><i className="fas fa-clock mr-1"></i>{formatDate(notification.publishedDate)}</span>
                      {notification.status === "Published" && (
                        <span>
                          <i className="fas fa-eye mr-1"></i>
                          <span className="font-semibold">{notification.views || 0}</span> views
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  {notification.status === "Draft" && (
                    <button
                      onClick={() => handlePublishNotification(notification.id)}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all hover:scale-105"
                      style={{
                        backgroundColor: `${successColor}20`,
                        color: successColor,
                      }}
                    >
                      <i className="fas fa-paper-plane mr-1 sm:mr-2"></i>
                      <span className="hidden sm:inline">Publish</span>
                      <span className="sm:hidden">Send</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleEditNotification(notification)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      backgroundColor: `${primaryGradientFrom}20`,
                      color: primaryGradientFrom,
                    }}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      backgroundColor: `${errorColor}20`,
                      color: errorColor,
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6"
              style={{ backgroundColor: cardBg }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-2xl font-bold" style={{ color: textColor }}>
                  {editingNotification ? "Edit Notification" : "Create New Notification"}
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                >
                  <i className="fas fa-times" style={{ color: textColor }}></i>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-semibold mb-2 block" style={{ color: textColor }}>Notification Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border outline-none text-sm"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                      borderColor,
                      color: textColor,
                    }}
                    placeholder="e.g., New Mock Exam Available"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-semibold mb-2 block" style={{ color: textColor }}>Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows="4"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border outline-none resize-none text-sm"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                      borderColor,
                      color: textColor,
                    }}
                    placeholder="Enter your notification message..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-semibold mb-2 block" style={{ color: textColor }}>Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border outline-none text-sm"
                      style={{
                        backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                        borderColor,
                        color: textColor,
                      }}
                    >
                      {notificationTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-semibold mb-2 block" style={{ color: textColor }}>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border outline-none text-sm"
                      style={{
                        backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                        borderColor,
                        color: textColor,
                      }}
                    >
                      <option value="Draft">Save as Draft</option>
                      <option value="Published">Publish Immediately</option>
                      <option value="Scheduled">Schedule for Later</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-semibold mb-2 block" style={{ color: textColor }}>Recipients</label>
                  <select
                    value={formData.recipients}
                    onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border outline-none text-sm"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                      borderColor,
                      color: textColor,
                    }}
                  >
                    <option value="All Users">All Users</option>
                    <option value="Active Users">Active Users Only</option>
                    <option value="Inactive Users">Inactive Users Only</option>
                  </select>
                </div>

                <div
                  className="p-3 sm:p-4 rounded-xl"
                  style={{ backgroundColor: `${warningColor}10`, border: `1px solid ${warningColor}30` }}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <i className="fas fa-info-circle mt-0.5" style={{ color: warningColor }}></i>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold mb-1" style={{ color: textColor }}>
                        Note about Publishing
                      </p>
                      <p className="text-xs" style={{ color: secondaryText }}>
                        Publishing a notification will immediately send it to all selected recipients. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
                  <button
                    onClick={handleSaveNotification}
                    className="flex-1 py-2.5 sm:py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                      color: "#fff",
                    }}
                  >
                    {editingNotification ? "Update Notification" : "Create Notification"}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                      color: textColor,
                    }}
                  >
                    Cancel
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