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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 lg:p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-none lg:rounded-2xl w-full h-full lg:max-w-4xl lg:h-auto lg:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col`}
        >
          {/* Header */}
          <div className={`p-4 lg:p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} flex-shrink-0`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className={`text-lg lg:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Select Test Type
                </h2>
                <p className={`text-xs lg:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Choose between practice or mock exam
                </p>
              </div>
              <button
                onClick={onClose}
                className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all active:scale-95 lg:hover:scale-110 flex-shrink-0 ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <X className={`w-5 h-5 lg:w-6 lg:h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-2">
              {testTypes.map((testType) => {
                const Icon = testType.icon;
                return (
                  <motion.button
                    key={testType.type}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => {
                      onSelectType(testType.type);
                      onClose();
                    }}
                    className={`p-5 lg:p-6 rounded-xl lg:rounded-2xl text-left transition-all group ${
                      isDark 
                        ? 'bg-gray-800 active:bg-gray-750 border border-gray-700' 
                        : 'bg-gray-50 active:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br ${testType.gradient} flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                    </div>

                    {/* Title & Description */}
                    <h3 className={`text-lg lg:text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {testType.title}
                    </h3>
                    <p className={`text-xs lg:text-sm mb-3 lg:mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {testType.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-1.5 lg:space-y-2 mb-3 lg:mb-4">
                      {testType.features.map((feature, idx) => (
                        <li key={idx} className={`text-xs lg:text-sm flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${testType.gradient}`}></div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Arrow */}
                    <div className="flex items-center gap-2 text-xs lg:text-sm font-semibold">
                      <span className={`bg-gradient-to-r ${testType.gradient} bg-clip-text text-transparent`}>
                        Select {testType.type}
                      </span>
                      <i className={`fas fa-arrow-right text-xs bg-gradient-to-r ${testType.gradient} bg-clip-text text-transparent`}></i>
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