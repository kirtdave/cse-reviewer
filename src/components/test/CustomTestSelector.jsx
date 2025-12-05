import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Loader2, AlertCircle } from 'lucide-react';
import { getAllCustomTests } from '../../services/customTestService';

const CustomTestSelector = ({ theme, isOpen, onClose, onSelectTest }) => {
  const isDark = theme === 'dark';
  const [customTests, setCustomTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCustomTests();
    }
  }, [isOpen]);

  const loadCustomTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const tests = await getAllCustomTests();
      console.log('📋 Loaded custom tests:', tests);
      setCustomTests(tests || []);
    } catch (err) {
      console.error('Error loading custom tests:', err);
      setError('Failed to load custom tests');
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = customTests.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTest = (test) => {
    console.log('🎯 Selected custom test:', test);
    onSelectTest(test);
    onClose();
  };

  const getTotalQuestions = (test) => {
    if (!test.sets || !Array.isArray(test.sets)) return 0;
    return test.sets.reduce((sum, set) => {
      return sum + (set.questions?.length || 0);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 lg:p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-none lg:rounded-2xl w-full h-full lg:max-w-4xl lg:h-auto lg:max-h-[80vh] overflow-hidden flex flex-col shadow-2xl`}
        >
          {/* Header */}
          <div className={`p-4 lg:p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className="flex-1 min-w-0">
                <h2 className={`text-lg lg:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                  Select Custom Test
                </h2>
                <p className={`text-xs lg:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Choose from your saved tests
                </p>
              </div>
              <button
                onClick={onClose}
                className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                  isDark ? 'hover:bg-gray-800 active:bg-gray-800' : 'hover:bg-gray-100 active:bg-gray-100'
                }`}
              >
                <X className={`w-5 h-5 lg:w-6 lg:h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <i className={`fas fa-search absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tests..."
                className={`w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-2.5 lg:py-3 rounded-xl border text-sm lg:text-base ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 lg:py-20">
                <Loader2 className="w-10 h-10 lg:w-12 lg:h-12 animate-spin text-blue-500 mb-3 lg:mb-4" />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading custom tests...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 lg:py-20">
                <AlertCircle className="w-10 h-10 lg:w-12 lg:h-12 text-red-500 mb-3 lg:mb-4" />
                <p className="text-sm text-red-500 mb-3 lg:mb-4">{error}</p>
                <button
                  onClick={loadCustomTests}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-all"
                >
                  <i className="fas fa-rotate-right mr-2"></i>
                  Retry
                </button>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 lg:py-20">
                <FileText className={`w-14 h-14 lg:w-16 lg:h-16 mb-3 lg:mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className={`text-lg lg:text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {searchQuery ? 'No tests found' : 'No custom tests yet'}
                </h3>
                <p className={`text-xs lg:text-sm mb-4 lg:mb-6 text-center px-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {searchQuery 
                    ? 'Try a different search term' 
                    : 'Create your first custom test in the Custom Test Builder'}
                </p>
                {!searchQuery && (
                  <a
                    href="/custom-test"
                    className="px-5 lg:px-6 py-2.5 lg:py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg transition-all"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Create Custom Test
                  </a>
                )}
              </div>
            ) : (
              <div className="grid gap-3 lg:gap-4">
                {filteredTests.map((test) => {
                  const totalQuestions = getTotalQuestions(test);
                  const setsCount = test.sets?.length || 0;

                  return (
                    <motion.div
                      key={test.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectTest(test)}
                      className={`p-4 lg:p-6 rounded-xl cursor-pointer transition-all ${
                        isDark 
                          ? 'bg-gray-800 active:bg-gray-750 border border-gray-700' 
                          : 'bg-gray-50 active:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 lg:gap-4">
                        <div className="flex items-start gap-3 lg:gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-file-alt text-white text-lg lg:text-2xl"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-base lg:text-lg font-bold mb-1 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {test.title}
                            </h3>
                            {test.description && (
                              <p className={`text-xs lg:text-sm mb-2 lg:mb-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {test.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 lg:gap-4 text-xs lg:text-sm flex-wrap">
                              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <i className="fas fa-folder"></i>
                                {setsCount} {setsCount === 1 ? 'set' : 'sets'}
                              </span>
                              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <i className="fas fa-question-circle"></i>
                                {totalQuestions} questions
                              </span>
                              {test.category && (
                                <span className="px-2 lg:px-3 py-0.5 lg:py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                                  {test.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <i className="fas fa-arrow-right text-blue-500 text-sm"></i>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-4 lg:p-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <p className={`text-xs lg:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredTests.length} {filteredTests.length === 1 ? 'test' : 'tests'} available
              </p>
              <button
                onClick={onClose}
                className={`px-4 lg:px-6 py-2 rounded-xl font-semibold text-sm transition-all ${
                  isDark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-750' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomTestSelector;