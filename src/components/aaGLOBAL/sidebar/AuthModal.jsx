import React from 'react';
import { motion } from 'framer-motion';
import LoginForm from '../../../forms/LoginForm';
import SignupForm from '../../../forms/SignupForm';

const AuthModal = ({ title, onClose, theme, type, onSubmit }) => {
  const isDark = theme === "dark";
  
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50 px-3 lg:px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`rounded-2xl shadow-2xl p-5 lg:p-8 w-full max-w-sm lg:max-w-md ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-4 lg:mb-6">
          <h2 className="font-bold text-lg lg:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <i className="fa-solid fa-xmark text-base lg:text-lg"></i>
          </button>
        </div>
        {type === 'login' ? (
          <LoginForm theme={theme} onLogin={onSubmit} />
        ) : (
          <SignupForm theme={theme} onSignup={onSubmit} />
        )}
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;