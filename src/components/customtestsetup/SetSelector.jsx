// SetSelector.jsx - TRULY Mobile-First
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
      className="p-3 sm:p-6 rounded-lg sm:rounded-2xl"
      style={{ 
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
      }}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h3 className="text-sm sm:text-xl font-bold" style={{ color: textColor }}>
          Sets
        </h3>
        <button
          onClick={handleAddSet}
          className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-semibold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base"
          style={{
            background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
            color: "#fff",
          }}
        >
          <i className="fas fa-plus text-xs" /> 
          <span className="hidden sm:inline">New Set</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sets.map((set) => (
            <motion.div
              key={set.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`group relative rounded-lg transition-all ${
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
                <div className="p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="flex-1 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded border bg-transparent outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    style={{ borderColor, color: textColor }}
                    autoFocus
                  />
                  <button
                    onClick={saveEdit}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded text-green-500 hover:bg-green-500 hover:text-white flex items-center justify-center"
                  >
                    <i className="fas fa-check text-xs"></i>
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => setSelectedSet(set.id)}
                  className="p-2.5 sm:p-3 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold flex items-center gap-1.5 text-xs sm:text-sm" style={{ color: textColor }}>
                      <span className="truncate">{set.title}</span>
                      {selectedSet === set.id && (
                        <i className="fas fa-check-circle text-blue-500 text-xs flex-shrink-0"></i>
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: secondaryText }}>
                      {getSetQuestionCount(set.id)} Q
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(set);
                      }}
                      className="w-7 h-7 rounded flex items-center justify-center hover:bg-blue-500 hover:text-white"
                      style={{ color: primaryGradientFrom }}
                    >
                      <i className="fas fa-edit text-xs"></i>
                    </button>
                    {sets.length > 1 && handleDeleteSet && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSet(set.id);
                        }}
                        className="w-7 h-7 rounded flex items-center justify-center hover:bg-red-500 hover:text-white"
                        style={{ color: "#ef4444" }}
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-3 sm:mt-6 p-2.5 sm:p-4 rounded-lg" style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        border: `1px solid ${borderColor}`
      }}>
        <div className="text-xs space-y-1.5 sm:space-y-2" style={{ color: secondaryText }}>
          <p className="flex items-start gap-1.5">
            <i className="fas fa-info-circle text-blue-500 mt-0.5 flex-shrink-0 text-xs"></i>
            <span>Organize questions into sets</span>
          </p>
          <p className="flex items-start gap-1.5">
            <i className="fas fa-lightbulb text-yellow-500 mt-0.5 flex-shrink-0 text-xs"></i>
            <span>Different topics per set</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetSelector;