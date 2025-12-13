import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Trash2, Eye, Sparkles } from "lucide-react";
import { AICoachWidget } from "../dashboard/AICoachWidget";
import QuestionDetailsModal from "./QuestionDetailsModal";

const BookmarkCard = React.forwardRef(({
  bookmark,
  isDark,
  index,
  onRemove,
  onSaveNote,
  onViewTest,
  theme
}, ref) => {
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(bookmark.note || "");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const handleSaveNote = () => {
    onSaveNote(bookmark.attemptId, bookmark.questionIndex, noteText.trim());
    setEditingNote(false);
  };

  const handleCancelEdit = () => {
    setEditingNote(false);
    setNoteText(bookmark.note || "");
  };

  const handleDeleteNote = () => {
    onSaveNote(bookmark.attemptId, bookmark.questionIndex, "");
    setNoteText("");
    setEditingNote(false);
  };

  const questionData = {
    questionText: bookmark.questionText,
    category: bookmark.category,
    isCorrect: bookmark.isCorrect,
    attemptId: bookmark.attemptId,
    questionIndex: bookmark.questionIndex
  };

  return (
    <>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.05 }}
        className={`p-3 sm:p-4 lg:p-6 rounded-xl ${
          isDark ? "bg-gray-900/60" : "bg-white"
        } backdrop-blur-xl border ${
          isDark ? "border-gray-800" : "border-gray-200"
        } shadow-lg hover:shadow-xl transition-all`}
      >
        <div className="flex items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold ${
                bookmark.isCorrect
                  ? "bg-green-500/20 text-green-500"
                  : "bg-red-500/20 text-red-500"
              }`}>
                {bookmark.isCorrect ? "✓ Correct" : "✗ Wrong"}
              </span>
              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold ${
                isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"
              }`}>
                {bookmark.category}
              </span>
              <span className={`text-[10px] sm:text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                <Calendar size={10} className="inline mr-1 sm:w-3 sm:h-3" />
                {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
              </span>
            </div>
            <p className={`font-medium text-sm sm:text-base mb-2 ${isDark ? "text-white" : "text-gray-900"} line-clamp-2`}>
              {bookmark.questionText}
            </p>
            <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} truncate`}>
              From: <span className="font-semibold">{bookmark.attemptName}</span>
            </p>
          </div>
        </div>

        {/* Note Section */}
        {editingNote ? (
          <div className="mb-3 sm:mb-4">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add your personal note... (Leave empty to delete)"
              className={`w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg border resize-none ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-pink-500`}
              rows={3}
              autoFocus
            />
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
              <button
                onClick={handleSaveNote}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold hover:shadow-lg transition-all"
              >
                Save
              </button>
              {bookmark.note && (
                <button
                  onClick={handleDeleteNote}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg bg-red-500/20 text-red-500 font-medium hover:bg-red-500/30 border border-red-500/30 transition-all"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleCancelEdit}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-medium ${
                  isDark
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : bookmark.note ? (
          <div className={`p-2 sm:p-3 rounded-lg mb-3 sm:mb-4 ${
            isDark ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-yellow-50 border border-yellow-200"
          }`}>
            <div className="flex items-start gap-2">
              <i className="fa-solid fa-note-sticky text-yellow-500 mt-0.5 text-xs sm:text-sm"></i>
              <div className="flex-1 min-w-0">
                <p className={`text-xs sm:text-sm break-words ${isDark ? "text-yellow-200" : "text-yellow-800"}`}>
                  {bookmark.note}
                </p>
                <button
                  onClick={() => setEditingNote(true)}
                  className="text-[10px] sm:text-xs text-yellow-500 hover:text-yellow-400 mt-1"
                >
                  Edit note
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => setShowDetailsModal(true)}
            className={`flex-1 min-w-[120px] px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-medium transition-all ${
              isDark
                ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
            }`}
          >
            <Eye size={14} className="inline mr-1 sm:w-[18px] sm:h-[18px] sm:mr-2" />
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">Details</span>
          </button>
          
          {!editingNote && !bookmark.note && (
            <button
              onClick={() => setEditingNote(true)}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-medium transition-all ${
                isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <i className="fa-solid fa-note-sticky text-xs sm:text-sm sm:mr-2"></i>
              <span className="hidden sm:inline">Add Note</span>
            </button>
          )}
          <button
            onClick={() => onRemove(bookmark.attemptId, bookmark.questionIndex)}
            className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30 transition-all"
          >
            <Trash2 size={14} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </motion.div>

      {showDetailsModal && (
        <QuestionDetailsModal
          bookmark={bookmark}
          isDark={isDark}
          onClose={() => setShowDetailsModal(false)}
          onViewFullTest={() => {
            setShowDetailsModal(false);
            onViewTest(bookmark.attemptId);
          }}
          onAskAI={() => {
            setShowDetailsModal(false);
            setShowAI(true);
          }}
        />
      )}

      {showAI && (
        <AICoachWidget
          theme={theme}
          initialQuestion={questionData}
          onClose={() => setShowAI(false)}
        />
      )}
    </>
  );
});

export default BookmarkCard;