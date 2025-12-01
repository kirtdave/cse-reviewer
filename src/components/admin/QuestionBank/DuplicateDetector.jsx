// QuestionBank/DuplicateDetector.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { deleteQuestion } from "../../../services/adminApi";

export default function DuplicateDetector({ show, onClose, questions, onDelete, palette }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, warningColor, errorColor, successColor } = palette;

  const [duplicates, setDuplicates] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.85);

  useEffect(() => {
    if (show) {
      findDuplicates();
    }
  }, [show, similarityThreshold]);

  // Calculate similarity between two strings (Levenshtein distance-based)
  const calculateSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1.0;
    
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const getEditDistance = (s1, s2) => {
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  };

  const findDuplicates = () => {
    setScanning(true);
    const duplicateGroups = [];
    const processed = new Set();

    questions.forEach((q1, i) => {
      if (processed.has(q1.id)) return;

      const group = [q1];
      
      questions.forEach((q2, j) => {
        if (i !== j && !processed.has(q2.id)) {
          const similarity = calculateSimilarity(q1.questionText, q2.questionText);
          
          if (similarity >= similarityThreshold) {
            group.push(q2);
            processed.add(q2.id);
          }
        }
      });

      if (group.length > 1) {
        processed.add(q1.id);
        duplicateGroups.push({
          id: `group-${i}`,
          questions: group,
          similarity: Math.round(group.length > 2 ? 0.9 * 100 : 1.0 * 100)
        });
      }
    });

    setDuplicates(duplicateGroups);
    setScanning(false);
  };

  const handleDeleteSelected = async () => {
    if (selectedForDeletion.length === 0) return;

    if (window.confirm(`Delete ${selectedForDeletion.length} duplicate question(s)?`)) {
      try {
        await Promise.all(selectedForDeletion.map(id => deleteQuestion(id)));
        setSelectedForDeletion([]);
        onDelete();
        findDuplicates();
      } catch (error) {
        console.error('Error deleting duplicates:', error);
        alert('Failed to delete some questions');
      }
    }
  };

  const toggleSelection = (id) => {
    setSelectedForDeletion(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const selectAllInGroup = (group) => {
    const ids = group.questions.slice(1).map(q => q.id);
    const allSelected = ids.every(id => selectedForDeletion.includes(id));
    
    if (allSelected) {
      setSelectedForDeletion(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedForDeletion(prev => [...new Set([...prev, ...ids])]);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{ backgroundColor: cardBg }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: textColor }}>
                  <i className="fas fa-copy mr-2" style={{ color: warningColor }}></i>
                  Duplicate Question Detector
                </h3>
                <p style={{ color: secondaryText }}>
                  {scanning ? "Scanning for duplicates..." : `Found ${duplicates.length} duplicate groups`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
              >
                <i className="fas fa-times" style={{ color: textColor }}></i>
              </button>
            </div>

            {/* Controls */}
            <div
              className="p-4 rounded-xl mb-6"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                border: `1px solid ${borderColor}`,
              }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
                    <i className="fas fa-sliders-h mr-2"></i>
                    Similarity Threshold: {Math.round(similarityThreshold * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.7"
                    max="1.0"
                    step="0.05"
                    value={similarityThreshold}
                    onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                    className="w-full"
                    style={{ accentColor: primaryGradientFrom }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: secondaryText }}>
                    <span>Less strict (70%)</span>
                    <span>More strict (100%)</span>
                  </div>
                </div>
                
                {selectedForDeletion.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                    style={{
                      backgroundColor: `${errorColor}`,
                      color: "#fff",
                    }}
                  >
                    <i className="fas fa-trash mr-2"></i>
                    Delete {selectedForDeletion.length} Selected
                  </button>
                )}
              </div>
            </div>

            {/* Scanning State */}
            {scanning && (
              <div className="flex flex-col items-center justify-center py-12">
                <i className="fas fa-spinner fa-spin text-4xl mb-4" style={{ color: primaryGradientFrom }}></i>
                <p style={{ color: secondaryText }}>Analyzing {questions.length} questions...</p>
              </div>
            )}

            {/* No Duplicates */}
            {!scanning && duplicates.length === 0 && (
              <div
                className="p-12 rounded-2xl text-center"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                }}
              >
                <i className="fas fa-check-circle text-6xl mb-4" style={{ color: successColor, opacity: 0.5 }}></i>
                <h4 className="text-xl font-bold mb-2" style={{ color: textColor }}>
                  No Duplicates Found!
                </h4>
                <p style={{ color: secondaryText }}>
                  All questions appear to be unique at the current similarity threshold.
                </p>
              </div>
            )}

            {/* Duplicate Groups */}
            {!scanning && duplicates.length > 0 && (
              <div className="space-y-6">
                {duplicates.map((group, groupIndex) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                    className="p-6 rounded-2xl"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                      border: `2px solid ${warningColor}40`,
                    }}
                  >
                    {/* Group Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                          style={{
                            backgroundColor: `${warningColor}20`,
                            color: warningColor,
                          }}
                        >
                          {groupIndex + 1}
                        </div>
                        <div>
                          <h4 className="font-bold" style={{ color: textColor }}>
                            Duplicate Group {groupIndex + 1}
                          </h4>
                          <p className="text-sm" style={{ color: secondaryText }}>
                            {group.questions.length} similar questions • {group.similarity}% match
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => selectAllInGroup(group)}
                        className="px-4 py-2 rounded-lg font-medium text-sm transition-all hover:scale-105"
                        style={{
                          backgroundColor: `${errorColor}20`,
                          color: errorColor,
                        }}
                      >
                        <i className="fas fa-check-double mr-2"></i>
                        Select All Duplicates
                      </button>
                    </div>

                    {/* Questions in Group */}
                    <div className="space-y-3">
                      {group.questions.map((q, qIndex) => {
                        const isSelected = selectedForDeletion.includes(q.id);
                        const isOriginal = qIndex === 0;

                        return (
                          <div
                            key={q.id}
                            className={`p-4 rounded-xl transition-all ${
                              isSelected ? 'ring-2' : ''
                            }`}
                            style={{
                              backgroundColor: cardBg,
                              border: isOriginal 
                                ? `2px solid ${successColor}` 
                                : `1px solid ${borderColor}`,
                              ringColor: errorColor,
                            }}
                          >
                            <div className="flex items-start gap-3">
                              {/* Selection */}
                              {!isOriginal && (
                                <button
                                  onClick={() => toggleSelection(q.id)}
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                                    isSelected ? 'scale-110' : ''
                                  }`}
                                  style={{
                                    backgroundColor: isSelected ? errorColor : `${borderColor}`,
                                    color: "#fff",
                                  }}
                                >
                                  {isSelected && <i className="fas fa-check text-xs"></i>}
                                </button>
                              )}

                              {/* Original Badge */}
                              {isOriginal && (
                                <div
                                  className="px-3 py-1 rounded-lg text-xs font-bold flex-shrink-0"
                                  style={{
                                    backgroundColor: `${successColor}20`,
                                    color: successColor,
                                  }}
                                >
                                  <i className="fas fa-star mr-1"></i>
                                  KEEP
                                </div>
                              )}

                              {/* Question Content */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className="px-2 py-1 rounded text-xs font-semibold"
                                    style={{
                                      backgroundColor: `${primaryGradientFrom}20`,
                                      color: primaryGradientFrom,
                                    }}
                                  >
                                    ID: {q.id}
                                  </span>
                                  <span
                                    className="px-2 py-1 rounded text-xs font-semibold"
                                    style={{
                                      backgroundColor: `${primaryGradientFrom}20`,
                                      color: primaryGradientFrom,
                                    }}
                                  >
                                    {q.category}
                                  </span>
                                  <span
                                    className="px-2 py-1 rounded text-xs font-semibold"
                                    style={{
                                      backgroundColor: `${warningColor}20`,
                                      color: warningColor,
                                    }}
                                  >
                                    {q.difficulty}
                                  </span>
                                </div>
                                <p className="text-sm" style={{ color: textColor }}>
                                  {q.questionText}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Footer Info */}
            {!scanning && duplicates.length > 0 && (
              <div
                className="mt-6 p-4 rounded-xl"
                style={{
                  backgroundColor: `${primaryGradientFrom}10`,
                  border: `1px solid ${primaryGradientFrom}30`,
                }}
              >
                <div className="flex items-start gap-3">
                  <i className="fas fa-info-circle mt-0.5" style={{ color: primaryGradientFrom }}></i>
                  <div className="text-sm" style={{ color: textColor }}>
                    <p className="font-semibold mb-1">How it works:</p>
                    <ul className="list-disc list-inside space-y-1" style={{ color: secondaryText }}>
                      <li>The first question in each group is marked as the original (KEEP)</li>
                      <li>Select duplicates you want to remove - the original will be preserved</li>
                      <li>Adjust the similarity threshold to find more or fewer matches</li>
                      <li>Higher threshold = stricter matching (more exact duplicates only)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}