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
    <div className="p-6 rounded-2xl" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: textColor }}>
          <i className="fas fa-folder"></i>
          Question Sets
        </h3>
        <button
          onClick={addSet}
          className="px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
          style={{
            backgroundColor: `${primaryGradientFrom}20`,
            color: primaryGradientFrom
          }}
        >
          <Plus className="w-4 h-4" />
          Add Set
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {sets.map((set) => (
          <motion.div
            key={set.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveSetId(set.id)}
            className={`flex-shrink-0 p-4 rounded-xl cursor-pointer transition-all min-w-[200px] ${
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
              <h4 className="font-bold text-sm" style={{ color: textColor }}>
                {set.title}
              </h4>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    renameSet(set.id);
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center transition-all hover:scale-110"
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
                    className="w-6 h-6 rounded flex items-center justify-center transition-all hover:scale-110"
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