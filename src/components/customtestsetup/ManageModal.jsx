import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createCustomTest } from '../../services/customTestService';

const getPalette = (theme = "dark") => {
  const isDark = theme === "dark";
  return {
    isDark,
    cardBg: isDark ? "#16213e" : "#ffffff",
    textColor: isDark ? "#e4e4e7" : "#1f2937",
    secondaryText: isDark ? "#9ca3af" : "#6b7280",
    primaryGradientFrom: "#5b7ff5",
    primaryGradientTo: "#a855f7",
    borderColor: isDark ? "#2d3748" : "#e5e7eb",
    hoverBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
    accentBg: isDark ? "rgba(91,127,245,0.1)" : "rgba(91,127,245,0.05)",
  };
};

const ManageModal = ({
  sets = [],
  questions = {},
  testTitle = "",
  savedTests = [],
  currentTestId = null,
  theme = "dark",
  onClose = () => {},
  onRenameSet = () => {},
  onDeleteSet = () => {},
  onAddSet = () => {},
  onLoadTest = () => {},
  onDeleteTest = () => {},
  setQuestions = () => {},
  setSelectedSet = () => {},
  setSavedTests = () => {}
}) => {
  const [activeTab, setActiveTab] = useState('tests');
  const [editingSetId, setEditingSetId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [creatingTest, setCreatingTest] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [expandedSetId, setExpandedSetId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const palette = getPalette(theme);
  const { isDark, cardBg, textColor, secondaryText, primaryGradientFrom, primaryGradientTo, borderColor, hoverBg, accentBg } = palette;

  const startEditingSet = (set) => {
    setEditingSetId(set.id);
    setEditTitle(set.title);
  };

  const saveSetEdit = () => {
    if (editTitle.trim()) {
      onRenameSet(editingSetId, editTitle.trim());
    }
    setEditingSetId(null);
    setEditTitle('');
  };

  const deleteQuestion = (setId, questionIndex) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    
    setQuestions((prev) => {
      const newQuestions = { ...prev };
      newQuestions[setId] = newQuestions[setId].filter((_, i) => i !== questionIndex);
      return newQuestions;
    });
  };

  const getOptionText = (option) => {
    return option.replace(/^[A-D]\)\s*/, '');
  };

  // ✅ FIXED: Properly create test and get real ID from backend
  const handleCreateTest = async () => {
    if (!newTestName.trim()) {
      alert("Please enter a test name");
      return;
    }

    try {
      setCreatingTest(true);
      
      // Create test data with proper structure
      const newTestData = {
        title: newTestName.trim(),
        description: "",
        sets: [
          { 
            id: 1, 
            title: "Set 1", 
            questions: [] 
          }
        ],
        category: "Custom",
        difficulty: "Mixed",
        timeLimit: null,
        isPublic: false,
        tags: []
      };
      
      console.log('📤 Creating test:', newTestData);
      
      // Call backend API to create test and get REAL ID
      const createdTest = await createCustomTest(newTestData);
      
      console.log('✅ Test created with ID:', createdTest.id);
      
      // Ensure the test object is properly structured
      const testToLoad = {
        ...createdTest,
        sets: Array.isArray(createdTest.sets) ? createdTest.sets : [{ id: 1, title: "Set 1", questions: [] }]
      };
      
      // Update saved tests list with the real test from backend
      setSavedTests([...savedTests, testToLoad]);
      
      // Load the newly created test (with real ID from backend)
      onLoadTest(testToLoad);
      
      // Clear form and close modal
      setNewTestName('');
      onClose();
      
    } catch (error) {
      console.error('❌ Failed to create test:', error);
      alert(error.message || "Failed to create test. Please try again.");
    } finally {
      setCreatingTest(false);
    }
  };

  const filteredTests = savedTests.filter(test => 
    test.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSetExpansion = (setId) => {
    setExpandedSetId(expandedSetId === setId ? null : setId);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
      >
        {/* Modern Header */}
        <div className="relative p-6 pb-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-1" style={{ color: textColor }}>
                Test Manager
              </h2>
              <p className="text-sm" style={{ color: secondaryText }}>
                Create, organize, and manage your custom tests
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:rotate-90 hover:scale-110"
              style={{ 
                backgroundColor: hoverBg,
                color: textColor 
              }}
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          {/* Enhanced Tabs */}
          <div className="flex gap-3 border-b" style={{ borderColor }}>
            <TabButton
              active={activeTab === 'tests'}
              onClick={() => setActiveTab('tests')}
              icon="fas fa-layer-group"
              label="All Tests"
              count={savedTests.length}
              palette={palette}
            />
            <TabButton
              active={activeTab === 'sets'}
              onClick={() => setActiveTab('sets')}
              icon="fas fa-folder-open"
              label="Sets & Questions"
              count={sets.length}
              palette={palette}
              disabled={!currentTestId}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'tests' ? (
              <motion.div
                key="tests"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Create New Test Card */}
                <div className="p-6 rounded-2xl" style={{
                  background: `linear-gradient(135deg, ${primaryGradientFrom}15, ${primaryGradientTo}15)`,
                  border: `2px dashed ${primaryGradientFrom}40`
                }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                      background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`
                    }}>
                      <i className="fas fa-plus text-white text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: textColor }}>
                        Create New Test
                      </h3>
                      <p className="text-sm" style={{ color: secondaryText }}>
                        Start building your custom test
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newTestName}
                      onChange={(e) => setNewTestName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateTest()}
                      placeholder="Enter test name (e.g., Math Quiz 2024)"
                      className="flex-1 px-4 py-3 rounded-xl border-2 bg-transparent focus:outline-none focus:border-opacity-100 transition-all"
                      style={{ borderColor: `${borderColor}80`, color: textColor }}
                    />
                    <button
                      onClick={handleCreateTest}
                      disabled={creatingTest || !newTestName.trim()}
                      className="px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                        color: '#fff'
                      }}
                    >
                      {creatingTest ? (
                        <><i className="fas fa-spinner fa-spin mr-2"></i>Creating...</>
                      ) : (
                        <><i className="fas fa-rocket mr-2"></i>Create</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                {savedTests.length > 0 && (
                  <div className="relative">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2" style={{ color: secondaryText }}></i>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tests..."
                      className="w-full pl-12 pr-4 py-3 rounded-xl border bg-transparent focus:outline-none"
                      style={{ borderColor, color: textColor }}
                    />
                  </div>
                )}

                {/* Tests List */}
                {filteredTests.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{
                      backgroundColor: accentBg
                    }}>
                      <i className="fas fa-inbox text-4xl" style={{ color: secondaryText }}></i>
                    </div>
                    <p className="text-lg font-semibold mb-2" style={{ color: textColor }}>
                      {searchQuery ? 'No tests found' : 'No tests yet'}
                    </p>
                    <p className="text-sm" style={{ color: secondaryText }}>
                      {searchQuery ? 'Try a different search term' : 'Create your first test to get started'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredTests.map((test) => {
                      const setsArray = Array.isArray(test.sets) ? test.sets : [];
                      const totalQuestions = setsArray.reduce((acc, s) => {
                        return acc + (Array.isArray(s?.questions) ? s.questions.length : 0);
                      }, 0);
                      const isActive = currentTestId === test.id;

                      return (
                        <motion.div
                          key={test.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="p-5 rounded-xl cursor-pointer transition-all relative overflow-hidden group"
                          style={{
                            backgroundColor: isActive ? accentBg : hoverBg,
                            border: `2px solid ${isActive ? primaryGradientFrom : borderColor}`
                          }}
                          onClick={() => {
                            onLoadTest(test);
                            onClose();
                          }}
                        >
                          {isActive && (
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{
                              background: `radial-gradient(circle, ${primaryGradientFrom}, transparent)`
                            }}></div>
                          )}
                          
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                                background: isActive 
                                  ? `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`
                                  : hoverBg
                              }}>
                                <i className={`fas fa-${isActive ? 'check-circle' : 'file-alt'} text-2xl`} style={{
                                  color: isActive ? '#fff' : textColor
                                }}></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-lg truncate" style={{ color: textColor }}>
                                    {test.title}
                                  </h4>
                                  {isActive && (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r text-white" style={{
                                      background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`
                                    }}>
                                      Active
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm" style={{ color: secondaryText }}>
                                  <span><i className="fas fa-folder mr-1"></i> {setsArray.length} sets</span>
                                  <span><i className="fas fa-question-circle mr-1"></i> {totalQuestions} questions</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete "${test.title}"? This action cannot be undone.`)) {
                                  onDeleteTest(test.id);
                                }
                              }}
                              className="w-10 h-10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                              style={{ color: '#ef4444' }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="sets"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {!currentTestId ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{
                      backgroundColor: accentBg
                    }}>
                      <i className="fas fa-folder-open text-4xl" style={{ color: secondaryText }}></i>
                    </div>
                    <p className="text-lg font-semibold mb-2" style={{ color: textColor }}>
                      No Test Selected
                    </p>
                    <p className="text-sm mb-6" style={{ color: secondaryText }}>
                      Please select or create a test first
                    </p>
                    <button
                      onClick={() => setActiveTab('tests')}
                      className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                        color: '#fff'
                      }}
                    >
                      <i className="fas fa-arrow-left mr-2"></i>Go to Tests
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Add Set Button */}
                    <button
                      onClick={() => {
                        onAddSet();
                        onClose();
                      }}
                      className="w-full p-4 rounded-xl font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-3 group"
                      style={{
                        background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                        color: '#fff'
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                        <i className="fas fa-plus"></i>
                      </div>
                      <span>Add New Set</span>
                    </button>

                    {/* Sets List */}
                    <div className="space-y-4">
                      {sets.map((set) => {
                        const setQuestions = questions[set.id] || [];
                        const isExpanded = expandedSetId === set.id;
                        
                        return (
                          <motion.div
                            key={set.id}
                            layout
                            className="rounded-2xl overflow-hidden"
                            style={{
                              backgroundColor: hoverBg,
                              border: `1px solid ${borderColor}`
                            }}
                          >
                            {/* Set Header */}
                            <div className="p-5" style={{
                              backgroundColor: isExpanded ? accentBg : 'transparent'
                            }}>
                              {editingSetId === set.id ? (
                                <div className="flex items-center gap-3">
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveSetEdit();
                                      if (e.key === 'Escape') setEditingSetId(null);
                                    }}
                                    className="flex-1 px-4 py-2 rounded-xl border bg-transparent"
                                    style={{ borderColor, color: textColor }}
                                    autoFocus
                                  />
                                  <button
                                    onClick={saveSetEdit}
                                    className="w-10 h-10 rounded-xl bg-green-500 text-white hover:bg-green-600 flex items-center justify-center"
                                  >
                                    <i className="fas fa-check"></i>
                                  </button>
                                  <button
                                    onClick={() => setEditingSetId(null)}
                                    className="w-10 h-10 rounded-xl bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 flex-1">
                                    <button
                                      onClick={() => toggleSetExpansion(set.id)}
                                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                      style={{ backgroundColor: hoverBg }}
                                    >
                                      <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} transition-transform`} style={{ color: textColor }}></i>
                                    </button>
                                    <div>
                                      <h3 className="text-xl font-bold" style={{ color: textColor }}>
                                        {set.title}
                                      </h3>
                                      <p className="text-sm" style={{ color: secondaryText }}>
                                        <i className="fas fa-question-circle mr-1"></i>
                                        {setQuestions.length} question{setQuestions.length !== 1 ? 's' : ''}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedSet(set.id);
                                        onClose();
                                      }}
                                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                      style={{ 
                                        backgroundColor: hoverBg,
                                        color: primaryGradientFrom 
                                      }}
                                      title="Edit questions"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                      onClick={() => startEditingSet(set)}
                                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                      style={{ 
                                        backgroundColor: hoverBg,
                                        color: '#eab308' 
                                      }}
                                      title="Rename set"
                                    >
                                      <i className="fas fa-signature"></i>
                                    </button>
                                    {sets.length > 1 && (
                                      <button
                                        onClick={() => {
                                          if (window.confirm(`Delete ${set.title}? All questions will be removed.`)) {
                                            onDeleteSet(set.id);
                                          }
                                        }}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                        style={{ 
                                          backgroundColor: hoverBg,
                                          color: '#ef4444' 
                                        }}
                                        title="Delete set"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Questions List - Collapsible */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t"
                                  style={{ borderColor }}
                                >
                                  <div className="p-5">
                                    {setQuestions.length === 0 ? (
                                      <div className="text-center py-8" style={{ color: secondaryText }}>
                                        <i className="fas fa-inbox text-3xl mb-2"></i>
                                        <p>No questions in this set yet</p>
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        {setQuestions.map((q, idx) => (
                                          <div
                                            key={idx}
                                            className="p-4 rounded-xl border group hover:shadow-md transition-all"
                                            style={{
                                              borderColor,
                                              backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'
                                            }}
                                          >
                                            <div className="flex justify-between items-start mb-3">
                                              <div className="flex items-start gap-3 flex-1">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold" style={{
                                                  backgroundColor: accentBg,
                                                  color: primaryGradientFrom
                                                }}>
                                                  {idx + 1}
                                                </div>
                                                <p className="font-semibold flex-1" style={{ color: textColor }}>
                                                  {q.question}
                                                </p>
                                              </div>
                                              <button
                                                onClick={() => deleteQuestion(set.id, idx)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white ml-3"
                                                style={{ color: '#ef4444' }}
                                              >
                                                <i className="fas fa-trash text-sm"></i>
                                              </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-11">
                                              {q.options && q.options.map((opt, i) => {
                                                const isCorrect = q.correctAnswer === String.fromCharCode(65 + i);
                                                return (
                                                  <div 
                                                    key={i} 
                                                    className={`px-3 py-2 rounded-lg text-sm ${isCorrect ? 'font-semibold' : ''}`}
                                                    style={{
                                                      backgroundColor: isCorrect ? 'rgba(34, 197, 94, 0.1)' : hoverBg,
                                                      color: isCorrect ? '#22c55e' : secondaryText,
                                                      border: `1px solid ${isCorrect ? '#22c55e40' : borderColor}`
                                                    }}
                                                  >
                                                    <span className="font-bold mr-2">{String.fromCharCode(65 + i)})</span>
                                                    {getOptionText(opt)}
                                                    {isCorrect && <i className="fas fa-check-circle ml-2"></i>}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                            {q.explanation && (
                                              <div className="mt-3 ml-11 p-3 rounded-lg text-sm italic" style={{
                                                backgroundColor: accentBg,
                                                color: secondaryText
                                              }}>
                                                <i className="fas fa-lightbulb mr-2" style={{ color: primaryGradientFrom }}></i>
                                                {q.explanation}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon, label, count, palette, disabled = false }) => {
  const { primaryGradientFrom, primaryGradientTo, textColor, hoverBg } = palette;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 font-semibold transition-all relative disabled:opacity-40 disabled:cursor-not-allowed ${
        active ? '' : 'hover:scale-105'
      }`}
      style={{
        background: active 
          ? `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`
          : 'transparent',
        color: active ? '#fff' : textColor
      }}
    >
      <div className="flex items-center gap-2">
        <i className={icon}></i>
        <span>{label}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white/20' : ''}`} style={{
          backgroundColor: active ? 'rgba(255,255,255,0.2)' : hoverBg
        }}>
          {count}
        </span>
      </div>
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
          style={{ backgroundColor: '#fff' }}
        />
      )}
    </button>
  );
};

export default ManageModal;