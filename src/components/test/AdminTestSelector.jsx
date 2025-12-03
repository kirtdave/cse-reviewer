// components/TestSetup/AdminTestSelector.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Loader2, AlertCircle, Shield } from 'lucide-react';
import { getPublishedTestsByType } from '../../services/adminTestService';

const AdminTestSelector = ({ theme, isOpen, onClose, onSelectTest, testType }) => {
  const isDark = theme === 'dark';
  const [adminTests, setAdminTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && testType) {
      loadAdminTests();
    }
  }, [isOpen, testType]);

  const loadAdminTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const tests = await getPublishedTestsByType(testType);
      console.log('📋 Loaded admin tests:', tests);
      setAdminTests(tests || []);
    } catch (err) {
      console.error('Error loading admin tests:', err);
      setError('Failed to load admin tests');
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = adminTests.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectTest = (test) => {
    console.log('🎯 Selected admin test:', test);
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Admin {testType} Tests
                  </h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Official tests created by administrators
                  </p>
                </div>
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

            {/* Search */}
            <div className="relative">
              <i className={`fas fa-search absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tests..."
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Loading admin tests...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={loadAdminTests}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all"
                >
                  <i className="fas fa-rotate-right mr-2"></i>
                  Retry
                </button>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <FileText className={`w-16 h-16 mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {searchQuery ? 'No tests found' : `No ${testType} tests available`}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {searchQuery 
                    ? 'Try a different search term' 
                    : 'Admin tests will appear here once published'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTests.map((test) => {
                  const totalQuestions = getTotalQuestions(test);
                  const setsCount = test.sets?.length || 0;

                  return (
                    <motion.div
                      key={test.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      onClick={() => handleSelectTest(test)}
                      className={`p-6 rounded-xl cursor-pointer transition-all ${
                        isDark 
                          ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700' 
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <Shield className="text-white text-2xl" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {test.title}
                              </h3>
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                                {testType}
                              </span>
                            </div>
                            {test.description && (
                              <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {test.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <i className="fas fa-folder"></i>
                                {setsCount} {setsCount === 1 ? 'set' : 'sets'}
                              </span>
                              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <i className="fas fa-question-circle"></i>
                                {totalQuestions} questions
                              </span>
                              {test.timeLimit && (
                                <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <i className="fas fa-clock"></i>
                                  {test.timeLimit} min
                                </span>
                              )}
                              {test.category && test.category !== 'Admin' && (
                                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                                  {test.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fas fa-arrow-right text-blue-500"></i>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredTests.length} {filteredTests.length === 1 ? 'test' : 'tests'} available
              </p>
              <button
                onClick={onClose}
                className={`px-6 py-2 rounded-xl font-semibold transition-all ${
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

export default AdminTestSelector;