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
  theme
}) {
  if (filteredBookmarks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 sm:py-16"
      >
        <Bookmark className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 ${isDark ? "text-gray-700" : "text-gray-300"}`} />
        <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          {bookmarks.length === 0 ? "No bookmarks yet" : "No bookmarks match"}
        </h3>
        <p className={`text-sm sm:text-base px-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {bookmarks.length === 0 
            ? "Bookmark questions while reviewing tests!"
            : "Try adjusting your filters"}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
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
            theme={theme}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}