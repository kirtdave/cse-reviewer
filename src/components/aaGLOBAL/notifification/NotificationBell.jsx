import React from 'react';
import { motion } from 'framer-motion';

export const NotificationBell = ({ count = 0, onClick, isDark }) => (
  <motion.button
    onClick={onClick}
    className={`relative w-9 h-9 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center transition-all ${
      isDark 
        ? "bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700/50" 
        : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200"
    }`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    title="Notifications"
  >
    <motion.i 
      className="fa-solid fa-bell text-sm lg:text-base"
      animate={count > 0 ? {
        rotate: [0, -15, 15, -15, 15, 0],
      } : {}}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 3,
      }}
    />
    {count > 0 && (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-gradient-to-br from-red-500 to-pink-600 text-white text-[9px] font-bold flex items-center justify-center shadow-lg shadow-red-500/30"
      >
        {count > 9 ? '9+' : count}
      </motion.span>
    )}
  </motion.button>
);

export default NotificationBell;