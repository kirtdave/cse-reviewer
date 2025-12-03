
// ============================================
// FILE 1: NotificationItem.jsx
// ============================================
import React from 'react';
import { motion } from 'framer-motion';

const NotificationItem = ({ notification, isDark }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return { 
          icon: 'fa-circle-check', 
          color: 'text-emerald-400', 
          bg: isDark ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/10' : 'bg-gradient-to-br from-emerald-50 to-green-50',
          glow: 'shadow-emerald-500/20'
        };
      case 'warning':
        return { 
          icon: 'fa-triangle-exclamation', 
          color: 'text-amber-400', 
          bg: isDark ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10' : 'bg-gradient-to-br from-amber-50 to-orange-50',
          glow: 'shadow-amber-500/20'
        };
      case 'error':
        return { 
          icon: 'fa-circle-xmark', 
          color: 'text-rose-400', 
          bg: isDark ? 'bg-gradient-to-br from-rose-500/20 to-red-500/10' : 'bg-gradient-to-br from-rose-50 to-red-50',
          glow: 'shadow-rose-500/20'
        };
      case 'info':
      default:
        return { 
          icon: 'fa-circle-info', 
          color: 'text-blue-400', 
          bg: isDark ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10' : 'bg-gradient-to-br from-blue-50 to-cyan-50',
          glow: 'shadow-blue-500/20'
        };
    }
  };

  const { icon, color, bg, glow } = getIcon(notification.type);

  return (
    <motion.div
      className={`relative group rounded-xl transition-all cursor-pointer overflow-hidden ${
        isDark
          ? "bg-gray-800/60 hover:bg-gray-800/80 border border-gray-700/50"
          : "bg-white hover:bg-gray-50 border border-gray-200"
      } ${notification.unread ? 'border-l-4 border-l-blue-500' : ''}`}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.99 }}
      style={{
        boxShadow: notification.unread 
          ? isDark 
            ? '0 2px 8px rgba(59, 130, 246, 0.15)' 
            : '0 2px 8px rgba(59, 130, 246, 0.08)'
          : isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.2)'
            : '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="p-4">
        <div className="flex gap-3">
          {/* Icon - Simpler design */}
          <div 
            className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}
          >
            <i className={`fa-solid ${icon} ${color} text-sm`}></i>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h4 className={`font-semibold text-sm leading-snug ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                {notification.title}
              </h4>
              <span className={`text-xs whitespace-nowrap flex-shrink-0 ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}>
                {notification.time}
              </span>
            </div>
            <p className={`text-sm mt-1 leading-relaxed ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}>
              {notification.message}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;