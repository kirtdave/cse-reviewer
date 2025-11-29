// src/components/Bookmarks/BookmarksPage.jsx

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { getAllBookmarks, toggleBookmark, updateBookmarkNote } from "../../services/bookmarkService";
import BookmarkStats from "./BookmarkStats";
import BookmarkFilters from "./BookmarkFilters";
import BookmarkList from "./BookmarkList";

export default function BookmarksPage({ theme = "dark", navigate }) {
  const isDark = theme === "dark";
  
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadBookmarks();
  }, []);

  useEffect(() => {
    filterBookmarks();
  }, [searchQuery, categoryFilter, statusFilter, bookmarks]);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await getAllBookmarks();
      setBookmarks(data);
      setFilteredBookmarks(data);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookmarks = () => {
    let filtered = [...bookmarks];

    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.questionText.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "All") {
      filtered = filtered.filter(b => b.category === categoryFilter);
    }

    if (statusFilter === "Correct") {
      filtered = filtered.filter(b => b.isCorrect);
    } else if (statusFilter === "Wrong") {
      filtered = filtered.filter(b => !b.isCorrect);
    }

    setFilteredBookmarks(filtered);
  };

  const handleRemoveBookmark = async (attemptId, questionIndex) => {
    try {
      await toggleBookmark(attemptId, questionIndex);
      loadBookmarks();
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  };

  const handleSaveNote = async (attemptId, questionIndex, noteText) => {
    try {
      await updateBookmarkNote(attemptId, questionIndex, noteText);
      loadBookmarks();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleViewTest = (attemptId) => {
    navigate(`/review/${attemptId}`);
  };

  const categories = ["All", ...new Set(bookmarks.map(b => b.category))];
  const correctCount = bookmarks.filter(b => b.isCorrect).length;
  const wrongCount = bookmarks.filter(b => !b.isCorrect).length;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-gray-50"} transition-colors duration-300`}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(236,72,153,0.08)_1px,_transparent_1px)] bg-[size:40px_40px]"
        />
      </div>

              {/* Header - Mount animation */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`mb-8 ${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg">
              <Bookmark className="text-white" size={24} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                My Bookmarks
              </h1>
              <p className="text-sm bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent font-medium">
                Questions you've saved for later review
              </p>
            </div>
          </div>
        </motion.header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Stats - Staggered animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <BookmarkStats 
            isDark={isDark}
            totalCount={bookmarks.length}
            correctCount={correctCount}
            wrongCount={wrongCount}
          />
        </motion.div>

        {/* Filters - Staggered animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <BookmarkFilters
            isDark={isDark}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categories={categories}
          />
        </motion.div>

        {/* Bookmark List - Staggered animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <BookmarkList
            isDark={isDark}
            bookmarks={bookmarks}
            filteredBookmarks={filteredBookmarks}
            onRemoveBookmark={handleRemoveBookmark}
            onSaveNote={handleSaveNote}
            onViewTest={handleViewTest}
            theme={theme}
          />
        </motion.div>
      </div>
    </div>
  );
}