// src/components/Bookmarks/BookmarkList.jsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark } from "lucide-react";
import BookmarkCard from "./BookmarkCard";

export default function BookmarkList({
  isDark,
  bookmarks,
  filteredBookmarks,
  onRemoveBookmark,
  onSaveNote,
  onViewTest,
  theme  // ✅ ADD THIS
}) {
  if (filteredBookmarks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <Bookmark className={`w-20 h-20 mx-auto mb-4 ${isDark ? "text-gray-700" : "text-gray-300"}`} />
        <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          {bookmarks.length === 0 ? "No bookmarks yet" : "No bookmarks match your filters"}
        </h3>
        <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {bookmarks.length === 0 
            ? "Bookmark questions while reviewing tests to save them here!"
            : "Try adjusting your search or filters"}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {filteredBookmarks.map((bookmark, idx) => (
          <BookmarkCard
            key={`${bookmark.attemptId}-${bookmark.questionIndex}`}
            bookmark={bookmark}
            isDark={isDark}
            index={idx}
            onRemove={onRemoveBookmark}
            onSaveNote={onSaveNote}
            onViewTest={onViewTest}
            theme={theme}  // ✅ ADD THIS
          />
        ))}
      </AnimatePresence>
    </div>
  );
}