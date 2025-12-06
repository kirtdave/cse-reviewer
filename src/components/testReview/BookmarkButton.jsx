// ============================================
// BookmarkButton.jsx - COMPACT MOBILE
// ============================================
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleBookmark } from '../../services/bookmarkService';

export default function BookmarkButton({ 
  attemptId, 
  questionIndex, 
  initialBookmarked = false,
  isDark = true 
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleToggleBookmark = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await toggleBookmark(attemptId, questionIndex, note);
      setBookmarked(response.bookmarked);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      if (!response.bookmarked) {
        setShowNoteInput(false);
        setNote('');
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      alert('Failed to save bookmark. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    await handleToggleBookmark();
    setShowNoteInput(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleBookmark}
          disabled={loading}
          className={`relative px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-all ${
            bookmarked
              ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
              : isDark
              ? 'bg-gray-800/50 text-gray-400 border border-gray-700 active:bg-gray-700'
              : 'bg-gray-100 text-gray-600 border border-gray-300 active:bg-gray-200'
          } disabled:opacity-50`}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            {loading ? (
              <i className="fa-solid fa-spinner fa-spin text-xs"></i>
            ) : (
              <motion.i
                key={bookmarked ? 'bookmarked' : 'not-bookmarked'}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`fa-${bookmarked ? 'solid' : 'regular'} fa-bookmark text-xs sm:text-sm`}
              ></motion.i>
            )}
            <span className="hidden sm:inline text-xs sm:text-sm">
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </span>
          </div>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <i className="fa-solid fa-check text-white text-[8px] sm:text-xs"></i>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {bookmarked && !showNoteInput && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowNoteInput(true)}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-all ${
              isDark
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 active:bg-blue-500/30'
                : 'bg-blue-100 text-blue-700 border border-blue-200 active:bg-blue-200'
            }`}
          >
            <i className="fa-solid fa-note-sticky text-xs sm:text-sm"></i>
            <span className="hidden sm:inline ml-2 text-xs sm:text-sm">Add Note</span>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showNoteInput && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-full left-0 right-0 mt-2 p-2.5 sm:p-4 rounded-lg sm:rounded-xl shadow-xl z-50 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            <label className={`block text-xs font-medium mb-1.5 sm:mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Add a note:
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., 'Always confuse this with...'"
              className={`w-full p-2 sm:p-3 text-xs sm:text-sm rounded-lg border-2 resize-none ${
                isDark
                  ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              rows={2}
              autoFocus
            />
            <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveNote}
                disabled={loading}
                className="flex-1 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-1 text-[10px]"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check mr-1 text-[10px]"></i>
                    Save
                  </>
                )}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowNoteInput(false);
                  setNote('');
                }}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-medium transition-all ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 active:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 active:bg-gray-300'
                }`}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {bookmarked && note && !showNoteInput && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 p-2 sm:p-3 rounded-lg ${
            isDark ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          <div className="flex items-start gap-1.5 sm:gap-2">
            <i className="fa-solid fa-note-sticky text-yellow-500 mt-0.5 text-xs"></i>
            <div className="flex-1 min-w-0">
              <p className={`text-xs break-words ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
                {note}
              </p>
              <button
                onClick={() => setShowNoteInput(true)}
                className="text-[10px] text-yellow-500 hover:text-yellow-400 mt-0.5"
              >
                Edit note
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}