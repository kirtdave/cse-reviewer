import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function QuestionSetManager({ sets, setSets, activeSetId, setActiveSetId, palette }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, errorColor } = palette;

  const addSet = () => {
    const newSet = {
      id: Date.now(),
      title: `Set ${sets.length + 1}`,
      questions: []
    };
    setSets([...sets, newSet]);
    setActiveSetId(newSet.id);
  };

  const deleteSet = (setId) => {
    if (sets.length === 1) {
      alert('Cannot delete the last set. At least one set is required.');
      return;
    }

    if (window.confirm('Delete this set and all its questions?')) {
      const newSets = sets.filter(s => s.id !== setId);
      setSets(newSets);
      if (activeSetId === setId) {
        setActiveSetId(newSets[0].id);
      }
    }
  };

  const renameSet = (setId) => {
    const set = sets.find(s => s.id === setId);
    const newTitle = prompt('Enter new set title:', set.title);
    
    if (newTitle && newTitle.trim()) {
      setSets(sets.map(s => s.id === setId ? { ...s, title: newTitle.trim() } : s));
    }
  };

  return (
    <div className="p-4 md:p-6 rounded-2xl" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-bold flex items-center gap-2" style={{ color: textColor }}>
          <i className="fas fa-folder text-sm md:text-base"></i>
          <span className="text-sm md:text-base">Question Sets</span>
        </h3>
        <button
          onClick={addSet}
          className="px-3 py-2 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition-all hover:scale-105 flex items-center gap-1 md:gap-2"
          style={{
            backgroundColor: `${primaryGradientFrom}20`,
            color: primaryGradientFrom
          }}
        >
          <Plus className="w-3 h-3 md:w-4 md:h-4" />
          <span className="hidden sm:inline">Add Set</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {sets.map((set) => (
          <motion.div
            key={set.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveSetId(set.id)}
            className={`flex-shrink-0 p-3 md:p-4 rounded-xl cursor-pointer transition-all min-w-[150px] md:min-w-[200px] ${
              activeSetId === set.id ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: activeSetId === set.id 
                ? `${primaryGradientFrom}20` 
                : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${borderColor}`,
              ringColor: primaryGradientFrom
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-xs md:text-sm truncate pr-2" style={{ color: textColor }}>
                {set.title}
              </h4>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    renameSet(set.id);
                  }}
                  className="w-6 h-6 md:w-7 md:h-7 rounded flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                >
                  <Edit2 className="w-3 h-3" style={{ color: textColor }} />
                </button>
                {sets.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSet(set.id);
                    }}
                    className="w-6 h-6 md:w-7 md:h-7 rounded flex items-center justify-center transition-all hover:scale-110"
                    style={{ backgroundColor: `${errorColor}20` }}
                  >
                    <Trash2 className="w-3 h-3" style={{ color: errorColor }} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs" style={{ color: secondaryText }}>
              {set.questions.length} {set.questions.length === 1 ? 'question' : 'questions'}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}