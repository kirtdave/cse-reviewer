import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Eye, EyeOff, Trash2, Search } from 'lucide-react';
import { getAllAdminTests, deleteAdminTest } from '../../../services/adminTestService';

export default function AdminTestListPage({ palette, onCreateNew, onEdit }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, successColor, errorColor } = palette;

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const data = await getAllAdminTests();
      setTests(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (testId) => {
    if (window.confirm('Delete this test? This cannot be undone.')) {
      try {
        await deleteAdminTest(testId);
        fetchTests();
      } catch (error) {
        alert('Failed to delete test');
      }
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || test.testType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: textColor }}>Admin Tests</h2>
          <p style={{ color: secondaryText }}>{tests.length} tests created</p>
        </div>
        <button
          onClick={onCreateNew}
          className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
            color: '#fff'
          }}
        >
          <Plus className="w-5 h-5" />
          Create New Test
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: secondaryText }} />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border outline-none"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderColor,
              color: textColor
            }}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 rounded-xl border outline-none"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderColor,
            color: textColor
          }}
        >
          <option value="All">All Types</option>
          <option value="Practice">Practice</option>
          <option value="Mock">Mock</option>
        </select>
      </div>

      {/* Test List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4" style={{ color: secondaryText }}>Loading tests...</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg" style={{ color: secondaryText }}>No tests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTests.map((test) => {
            const totalQuestions = test.sets?.reduce((sum, set) => sum + (set.questions?.length || 0), 0) || 0;
            
            return (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl border"
                style={{ backgroundColor: cardBg, borderColor }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold" style={{ color: textColor }}>{test.title}</h3>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: test.testType === 'Mock' ? `${primaryGradientFrom}20` : `${successColor}20`,
                          color: test.testType === 'Mock' ? primaryGradientFrom : successColor
                        }}
                      >
                        {test.testType}
                      </span>
                      {test.isPublished ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${successColor}20`, color: successColor }}>
                          <Eye className="w-3 h-3 inline mr-1" />
                          Published
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${secondaryText}20`, color: secondaryText }}>
                          <EyeOff className="w-3 h-3 inline mr-1" />
                          Draft
                        </span>
                      )}
                    </div>
                    
                    {test.description && (
                      <p className="mb-3" style={{ color: secondaryText }}>{test.description}</p>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm">
                      <span style={{ color: secondaryText }}>
                        📝 {totalQuestions} questions
                      </span>
                      <span style={{ color: secondaryText }}>
                        📁 {test.sets?.length || 0} sets
                      </span>
                      <span style={{ color: secondaryText }}>
                        ⏱️ {test.timeLimit || 60} min
                      </span>
                      <span style={{ color: secondaryText }}>
                        📊 {test.difficulty}
                      </span>
                      <span style={{ color: secondaryText }}>
                        🎯 {test.attempts || 0} attempts
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(test)}
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor: `${primaryGradientFrom}20` }}
                    >
                      <Edit2 className="w-4 h-4" style={{ color: primaryGradientFrom }} />
                    </button>
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor: `${errorColor}20` }}
                    >
                      <Trash2 className="w-4 h-4" style={{ color: errorColor }} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}