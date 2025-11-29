// SetSelector.jsx - Enhanced with rename and delete functionality
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const getPalette = (theme = "dark") => {
  const isDark = theme === "dark";
  return {
    isDark,
    bgColor: isDark ? "#1a1a2e" : "#f5f7fa",
    cardBg: isDark ? "#16213e" : "#ffffff",
    textColor: isDark ? "#e4e4e7" : "#1f2937",
    secondaryText: isDark ? "#9ca3af" : "#6b7280",
    accentColor: "#5b7ff5",
    primaryGradientFrom: "#5b7ff5",
    primaryGradientTo: "#a855f7",
    borderColor: isDark ? "#2d3748" : "#e5e7eb",
  };
};

const SetSelector = ({ 
  sets, 
  selectedSet, 
  setSelectedSet, 
  handleAddSet, 
  handleRenameSet,
  handleDeleteSet,
  questions = {},
  theme = "dark" 
}) => {
  const palette = getPalette(theme);
  const { isDark, textColor, borderColor, cardBg, secondaryText, primaryGradientFrom, primaryGradientTo } = palette;

  const [editingSetId, setEditingSetId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const startEditing = (set) => {
    setEditingSetId(set.id);
    setEditTitle(set.title);
  };

  const saveEdit = () => {
    if (editTitle.trim() && handleRenameSet) {
      handleRenameSet(editingSetId, editTitle.trim());
    }
    setEditingSetId(null);
    setEditTitle("");
  };

  const cancelEdit = () => {
    setEditingSetId(null);
    setEditTitle("");
  };

  const getSetQuestionCount = (setId) => {
    return questions[setId]?.length || 0;
  };

  return (
    <div 
      className="p-6 rounded-2xl transition-all"
      style={{ 
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold" style={{ color: textColor }}>
          Question Sets
        </h3>
        <button
          onClick={handleAddSet}
          className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
            color: "#fff",
            boxShadow: isDark ? "0 4px 12px rgba(91,127,245,0.3)" : "0 4px 12px rgba(91,127,245,0.2)",
          }}
        >
          <i className="fas fa-plus" /> New Set
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sets.map((set) => (
            <motion.div
              key={set.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`group relative rounded-xl transition-all ${
                selectedSet === set.id ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: selectedSet === set.id 
                  ? (isDark ? "rgba(91,127,245,0.1)" : "rgba(91,127,245,0.05)")
                  : (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"),
                border: `1px solid ${selectedSet === set.id ? primaryGradientFrom : borderColor}`,
                ringColor: primaryGradientFrom
              }}
            >
              {editingSetId === set.id ? (
                <div className="p-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor, color: textColor }}
                    autoFocus
                  />
                  <button
                    onClick={saveEdit}
                    className="px-3 py-2 rounded-lg text-green-500 hover:bg-green-500 hover:text-white transition-all"
                  >
                    <i className="fas fa-check"></i>
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-2 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => setSelectedSet(set.id)}
                  className="p-4 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-2" style={{ color: textColor }}>
                      {set.title}
                      {selectedSet === set.id && (
                        <i className="fas fa-check-circle text-blue-500 text-sm"></i>
                      )}
                    </div>
                    <div className="text-xs mt-1" style={{ color: secondaryText }}>
                      {getSetQuestionCount(set.id)} question{getSetQuestionCount(set.id) !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(set);
                      }}
                      className="px-2 py-1 rounded-lg transition-all hover:bg-blue-500 hover:text-white"
                      style={{ color: primaryGradientFrom }}
                    >
                      <i className="fas fa-edit text-sm"></i>
                    </button>
                    {sets.length > 1 && handleDeleteSet && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSet(set.id);
                        }}
                        className="px-2 py-1 rounded-lg transition-all hover:bg-red-500 hover:text-white"
                        style={{ color: "#ef4444" }}
                      >
                        <i className="fas fa-trash text-sm"></i>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 p-4 rounded-xl" style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        border: `1px solid ${borderColor}`
      }}>
        <div className="text-sm space-y-2" style={{ color: secondaryText }}>
          <p className="flex items-center gap-2">
            <i className="fas fa-info-circle text-blue-500"></i>
            Organize questions into multiple sets
          </p>
          <p className="flex items-center gap-2">
            <i className="fas fa-lightbulb text-yellow-500"></i>
            Each set can have different topics or difficulty levels
          </p>
          <p className="flex items-center gap-2">
            <i className="fas fa-mouse-pointer text-purple-500"></i>
            Click a set to select it, hover to edit or delete
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetSelector;