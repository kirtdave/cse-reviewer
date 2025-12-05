import React from "react";
import { Search } from "lucide-react";

export default function BookmarkFilters({
  isDark,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  categories
}) {
  return (
    <div className={`mb-4 lg:mb-6 p-3 lg:p-4 rounded-xl ${isDark ? "bg-gray-900/60" : "bg-white"} backdrop-blur-xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-lg`}>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4">
        {/* Search */}
        <div className="flex-1 min-w-0 sm:min-w-[200px]">
          <div className="relative">
            <Search className={`absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`} size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base rounded-lg border ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-pink-500`}
            />
          </div>
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-300 text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-pink-500`}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-300 text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-pink-500`}
        >
          <option value="All">All Status</option>
          <option value="Correct">Correct</option>
          <option value="Wrong">Wrong</option>
        </select>
      </div>
    </div>
  );
}