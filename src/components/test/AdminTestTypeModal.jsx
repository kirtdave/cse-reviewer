// components/TestSetup/AdminTestTypeModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Trophy } from 'lucide-react';

const AdminTestTypeModal = ({ theme, isOpen, onClose, onSelectType }) => {
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const testTypes = [
    {
      type: 'Practice',
      title: 'Practice Test',
      description: 'Focused practice on specific topics. Perfect for learning and improving skills.',
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        'Topic-specific questions',
        'Immediate feedback',
        'No time pressure',
        'Perfect for learning'
      ]
    },
    {
      type: 'Mock',
      title: 'Mock Exam',
      description: 'Full-length simulation of the actual Civil Service Exam. Test your readiness.',
      icon: Trophy,
      gradient: 'from-purple-500 to-pink-500',
      features: [
        'Complete exam simulation',
        'Timed conditions',
        'All topics covered',
        'Assess exam readiness'
      ]
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Select Test Type
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Choose between practice mode or full mock exam
                </p>
              </div>
              <button
                onClick={onClose}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <X className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testTypes.map((testType) => {
                const Icon = testType.icon;
                return (
                  <motion.button
                    key={testType.type}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelectType(testType.type);
                      onClose();
                    }}
                    className={`p-6 rounded-2xl text-left transition-all group ${
                      isDark 
                        ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${testType.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Title & Description */}
                    <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {testType.title}
                    </h3>
                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {testType.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2">
                      {testType.features.map((feature, idx) => (
                        <li key={idx} className={`text-sm flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${testType.gradient}`}></div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Arrow */}
                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                      <span className={`bg-gradient-to-r ${testType.gradient} bg-clip-text text-transparent`}>
                        Select {testType.type}
                      </span>
                      <i className={`fas fa-arrow-right text-sm bg-gradient-to-r ${testType.gradient} bg-clip-text text-transparent`}></i>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminTestTypeModal;