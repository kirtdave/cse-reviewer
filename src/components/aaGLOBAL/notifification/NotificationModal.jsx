import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationItem from './NotificationItem';

const NotificationModal = ({ 
  isOpen, 
  onClose, 
  isDark, 
  notifications = [], 
  loading = false,
  onRefresh 
}) => {
  const [markingRead, setMarkingRead] = useState(false);
  const [viewingNotification, setViewingNotification] = useState(null);

  const handleMarkAllRead = async () => {
    setMarkingRead(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/read-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setTimeout(() => setMarkingRead(false), 600);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleViewNotification = (notification) => {
    setViewingNotification(notification);
  };

  const handleCloseView = () => {
    setViewingNotification(null);
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/${notificationId}/dismiss`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Enhanced Backdrop */}
          <motion.div
            className="absolute inset-0 backdrop-blur-md"
            style={{
              background: isDark 
                ? 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1), rgba(0, 0, 0, 0.8))' 
                : 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05), rgba(0, 0, 0, 0.4))'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container - Narrower width */}
          <motion.div
            className={`relative rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden ${
              isDark 
                ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-700/50" 
                : "bg-white/95 backdrop-blur-xl border border-gray-200"
            }`}
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: isDark 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.1)' 
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Animated gradient top border */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ backgroundSize: '200% 100%' }}
            />

            {/* Header */}
            <div className={`px-6 py-4 border-b ${isDark ? "border-gray-800/50" : "border-gray-200"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isDark 
                        ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20" 
                        : "bg-gradient-to-br from-blue-50 to-purple-50"
                    }`}
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(59, 130, 246, 0)',
                        '0 0 0 8px rgba(59, 130, 246, 0)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <i className={`fa-solid fa-bell text-lg ${
                      isDark ? "text-blue-400" : "text-blue-600"
                    }`}></i>
                  </motion.div>
                  
                  <div>
                    <h2 className={`font-bold text-xl ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      Notifications
                    </h2>
                    {notifications.filter(n => n.unread).length > 0 && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                          isDark 
                            ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30" 
                            : "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600 border border-blue-200"
                        }`}
                      >
                        <motion.span
                          className="w-1.5 h-1.5 rounded-full bg-blue-500"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [1, 0.5, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        {notifications.filter(n => n.unread).length} unread
                      </motion.span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <motion.button
                      onClick={handleMarkAllRead}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        isDark 
                          ? "text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700/50" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={markingRead}
                    >
                      {markingRead ? (
                        <motion.i
                          className="fa-solid fa-check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        />
                      ) : (
                        "Mark all read"
                      )}
                    </motion.button>
                  )}
                  <motion.button
                    onClick={onClose}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      isDark 
                        ? "hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-gray-700/50 hover:border-red-500/30" 
                        : "hover:bg-red-50 text-gray-600 hover:text-red-500 border border-gray-200 hover:border-red-200"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <i className="fa-solid fa-xmark text-lg"></i>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {loading ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <i className={`fa-solid fa-spinner fa-spin text-3xl mb-3 ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}></i>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Loading notifications...
                  </p>
                </motion.div>
              ) : notifications.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-20"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${
                      isDark 
                        ? "bg-gradient-to-br from-gray-800 to-gray-700/50" 
                        : "bg-gradient-to-br from-gray-100 to-gray-50"
                    }`}
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <i className={`fa-solid fa-bell-slash text-3xl ${
                      isDark ? "text-gray-600" : "text-gray-400"
                    }`}></i>
                  </motion.div>
                  <p className={`font-semibold text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    All Clear!
                  </p>
                  <p className={`text-sm mt-2 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                    No new notifications at the moment
                  </p>
                </motion.div>
              ) : (
                notifications.map((notif, index) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NotificationItem 
                      notification={notif} 
                      isDark={isDark}
                      onRead={handleMarkAsRead}
                      onView={handleViewNotification}
                      onDelete={handleDeleteNotification}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* View Notification Detail Modal */}
          <AnimatePresence>
            {viewingNotification && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center z-10 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={handleCloseView}
                />
                
                <motion.div
                  className={`relative rounded-2xl shadow-2xl w-full max-w-md p-6 ${
                    isDark 
                      ? "bg-gray-900 border border-gray-700/50" 
                      : "bg-white border border-gray-200"
                  }`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={handleCloseView}
                    className={`absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isDark 
                        ? "hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-gray-700/50 hover:border-red-500/30" 
                        : "hover:bg-red-50 text-gray-600 hover:text-red-500 border border-gray-200 hover:border-red-200"
                    }`}
                  >
                    <i className="fa-solid fa-xmark text-lg"></i>
                  </button>

                  {/* Notification Type Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      isDark 
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                        : "bg-blue-100 text-blue-600 border border-blue-200"
                    }`}>
                      <i className="fa-solid fa-bell"></i>
                      {viewingNotification.type}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-bold mb-3 pr-8 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    {viewingNotification.title}
                  </h3>

                  {/* Message */}
                  <p className={`text-sm leading-relaxed mb-4 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}>
                    {viewingNotification.message}
                  </p>

                  {/* Timestamp */}
                  <div className={`flex items-center gap-2 text-xs pt-4 border-t ${
                    isDark ? "text-gray-500 border-gray-800" : "text-gray-500 border-gray-200"
                  }`}>
                    <i className="fa-solid fa-clock"></i>
                    <span>{viewingNotification.time}</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationModal;