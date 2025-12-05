import React from 'react';
import { motion } from 'framer-motion';

const NotificationItem = ({ notification, isDark, onRead, onView, onDelete }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return { icon: 'fa-circle-check', color: 'text-green-500', bg: isDark ? 'bg-green-500/10' : 'bg-green-50' };
      case 'warning':
        return { icon: 'fa-triangle-exclamation', color: 'text-orange-500', bg: isDark ? 'bg-orange-500/10' : 'bg-orange-50' };
      case 'error':
        return { icon: 'fa-circle-xmark', color: 'text-red-500', bg: isDark ? 'bg-red-500/10' : 'bg-red-50' };
      case 'info':
      default:
        return { icon: 'fa-circle-info', color: 'text-blue-500', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50' };
    }
  };

  const mapNotificationType = (type) => {
    const typeMap = {
      'Announcement': 'info',
      'New Content': 'success',
      'Maintenance': 'warning',
      'Update': 'info',
      'Reminder': 'warning'
    };
    return typeMap[type] || 'info';
  };

  const { icon, color, bg } = getIcon(mapNotificationType(notification.type));

  const handleClick = async () => {
    if (notification.unread && onRead) {
      await onRead(notification.id);
    }
    if (onView) {
      onView(notification);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (onDelete) {
      await onDelete(notification.id);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className={`relative group rounded-xl transition-all cursor-pointer overflow-hidden ${
        isDark
          ? "bg-gray-800/60 hover:bg-gray-800/80 border border-gray-700/50"
          : "bg-white hover:bg-gray-50 border border-gray-200"
      } ${notification.unread ? 'border-l-4 border-l-blue-500' : ''}`}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      style={{
        boxShadow: notification.unread 
          ? isDark ? '0 2px 8px rgba(59, 130, 246, 0.15)' : '0 2px 8px rgba(59, 130, 246, 0.08)'
          : isDark ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="p-3 lg:p-4">
        <div className="flex gap-2 lg:gap-3">
          <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
            <i className={`fa-solid ${icon} ${color} text-xs lg:text-sm`}></i>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 lg:gap-3 mb-1">
              <h4 className={`font-semibold text-xs lg:text-sm leading-snug truncate ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                {notification.title}
              </h4>
              <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                <span className={`text-[10px] lg:text-xs whitespace-nowrap ${
                  isDark ? "text-gray-500" : "text-gray-500"
                }`}>
                  {notification.time}
                </span>
                <motion.button
                  onClick={handleDelete}
                  className={`opacity-0 group-hover:opacity-100 w-5 h-5 lg:w-6 lg:h-6 rounded flex items-center justify-center transition-all ${
                    isDark
                      ? "hover:bg-red-500/20 text-gray-500 hover:text-red-400"
                      : "hover:bg-red-50 text-gray-400 hover:text-red-500"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Dismiss"
                >
                  <i className="fa-solid fa-trash text-[10px] lg:text-xs"></i>
                </motion.button>
              </div>
            </div>
            
            <p className={`text-xs lg:text-sm leading-relaxed line-clamp-2 break-words ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}>
              {notification.message}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center justify-end gap-1 lg:gap-1.5 mt-2 lg:mt-3 pt-2 lg:pt-3 border-t transition-all ${
          isDark ? "border-gray-700/50 group-hover:border-blue-500/30" : "border-gray-200 group-hover:border-blue-200"
        }`}>
          <span className={`text-[10px] lg:text-xs font-medium transition-all ${
            isDark ? "text-gray-500 group-hover:text-blue-400" : "text-gray-500 group-hover:text-blue-600"
          }`}>
            Tap to view
          </span>
          <motion.i 
            className={`fa-solid fa-arrow-right text-[10px] lg:text-xs transition-all ${
              isDark ? "text-gray-500 group-hover:text-blue-400" : "text-gray-500 group-hover:text-blue-600"
            }`}
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;