// src/components/Bookmarks/BookmarkCard.jsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Trash2, Eye, Sparkles } from "lucide-react";
import { AICoachWidget } from "../Dashboard/AICoachWidget";
import QuestionDetailsModal from "./QuestionDetailsModal";

export default function BookmarkCard({
  bookmark,
  isDark,
  index,
  onRemove,
  onSaveNote,
  onViewTest,
  theme
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(bookmark.note || "");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const handleSaveNote = () => {
    // Allow saving empty notes (deletion)
    onSaveNote(bookmark.attemptId, bookmark.questionIndex, noteText.trim());
    setEditingNote(false);
  };

  const handleCancelEdit = () => {
    setEditingNote(false);
    setNoteText(bookmark.note || "");
  };

  const handleDeleteNote = () => {
    // Delete note by saving empty string
    onSaveNote(bookmark.attemptId, bookmark.questionIndex, "");
    setNoteText("");
    setEditingNote(false);
  };

  // Prepare question data for AI
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.05 }}
        className={`p-6 rounded-xl ${
          isDark ? "bg-gray-900/60" : "bg-white"
        } backdrop-blur-xl border ${
          isDark ? "border-gray-800" : "border-gray-200"
        } shadow-lg hover:shadow-xl transition-all`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                bookmark.isCorrect
                  ? "bg-green-500/20 text-green-500"
                  : "bg-red-500/20 text-red-500"
              }`}>
                {bookmark.isCorrect ? "✓ Correct" : "✗ Wrong"}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"
              }`}>
                {bookmark.category}
              </span>
              <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                <Calendar size={12} className="inline mr-1" />
                {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
              </span>
            </div>
            <p className={`font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              {bookmark.questionText}
            </p>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              From: <span className="font-semibold">{bookmark.attemptName}</span>
            </p>
          </div>
        </div>

        {/* Note Section */}
        {editingNote ? (
          <div className="mb-4">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add your personal note... (Leave empty to delete)"
              className={`w-full p-3 rounded-lg border resize-none ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-pink-500`}
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold hover:shadow-lg transition-all"
              >
                Save Note
              </button>
              {bookmark.note && (
                <button
                  onClick={handleDeleteNote}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-500 font-medium hover:bg-red-500/30 border border-red-500/30 transition-all"
                >
                  Delete Note
                </button>
              )}
              <button
                onClick={handleCancelEdit}
                className={`px-4 py-2 rounded-lg font-medium ${
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
          <div className={`p-3 rounded-lg mb-4 ${
            isDark ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-yellow-50 border border-yellow-200"
          }`}>
            <div className="flex items-start gap-2">
              <i className="fa-solid fa-note-sticky text-yellow-500 mt-0.5"></i>
              <div className="flex-1">
                <p className={`text-sm ${isDark ? "text-yellow-200" : "text-yellow-800"}`}>
                  {bookmark.note}
                </p>
                <button
                  onClick={() => setEditingNote(true)}
                  className="text-xs text-yellow-500 hover:text-yellow-400 mt-1"
                >
                  Edit note
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowDetailsModal(true)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              isDark
                ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
            }`}
          >
            <Eye size={18} className="inline mr-2" />
            View Details
          </button>
          

          {!editingNote && !bookmark.note && (
            <button
              onClick={() => setEditingNote(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <i className="fa-solid fa-note-sticky mr-2"></i>
              Add Note
            </button>
          )}
          <button
            onClick={() => onRemove(bookmark.attemptId, bookmark.questionIndex)}
            className="px-4 py-2 rounded-lg font-medium bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30 transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </motion.div>

      {/* Question Details Modal */}
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

      {/* AI Chat Modal */}
      {showAI && (
        <AICoachWidget
          theme={theme}
          initialQuestion={questionData}
          onClose={() => setShowAI(false)}
        />
      )}
    </>
  );
}