// QuestionBank/QuestionFilters.jsx
import React from "react";

export default function QuestionFilters({ 
  filters, 
  onFilterChange, 
  viewMode, 
  onViewModeChange,
  selectedCount,
  onDeleteSelected,
  onSelectAll,
  totalQuestions,
  palette 
}) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, errorColor } = palette;

  const categories = [
    "All", 
    "Verbal Ability", 
    "Numerical Ability", 
    "Analytical Ability", 
    "General Knowledge", 
    "Clerical Ability", 
    "Numerical Reasoning", 
    "Philippine Constitution"
  ];

  const difficulties = ["All", "Easy", "Normal", "Hard"];
  
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "category", label: "By Category" },
    { value: "difficulty", label: "By Difficulty" },
  ];

  return (
    <div
      className="p-4 sm:p-6 rounded-2xl space-y-3 sm:space-y-4"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* Search and Quick Actions */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <div className="relative">
            <i 
              className="fas fa-search absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-sm" 
              style={{ color: secondaryText }}
            ></i>
            <input
              type="text"
              placeholder="Search questions..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl border outline-none transition-all text-sm"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                borderColor,
                color: textColor,
              }}
            />
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewModeChange('list')}
            className={`flex-1 md:flex-none px-4 py-2.5 sm:py-3 rounded-xl transition-all ${
              viewMode === 'list' ? 'scale-105' : 'opacity-50'
            }`}
            style={{
              backgroundColor: viewMode === 'list' 
                ? `${primaryGradientFrom}20` 
                : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
              color: viewMode === 'list' ? primaryGradientFrom : textColor,
            }}
          >
            <i className="fas fa-list"></i>
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`flex-1 md:flex-none px-4 py-2.5 sm:py-3 rounded-xl transition-all ${
              viewMode === 'grid' ? 'scale-105' : 'opacity-50'
            }`}
            style={{
              backgroundColor: viewMode === 'grid' 
                ? `${primaryGradientFrom}20` 
                : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
              color: viewMode === 'grid' ? primaryGradientFrom : textColor,
            }}
          >
            <i className="fas fa-th"></i>
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Category Filter */}
        <div>
          <label className="text-xs sm:text-sm font-semibold mb-2 block" style={{ color: textColor }}>
            <i className="fas fa-folder mr-2"></i>
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border outline-none transition-all text-sm"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
              borderColor,
              color: textColor,
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="text-xs sm:text-sm font-semibold mb-2 block" style={{ color: textColor }}>
            <i className="fas fa-signal mr-2"></i>
            Difficulty
          </label>
          <select
            value={filters.difficulty}
            onChange={(e) => onFilterChange({ difficulty: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border outline-none transition-all text-sm"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
              borderColor,
              color: textColor,
            }}
          >
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-xs sm:text-sm font-semibold mb-2 block" style={{ color: textColor }}>
            <i className="fas fa-sort mr-2"></i>
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border outline-none transition-all text-sm"
            style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
              borderColor,
              color: textColor,
            }}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Bulk Actions */}
        <div>
          <label className="text-xs sm:text-sm font-semibold mb-2 block" style={{ color: textColor }}>
            <i className="fas fa-tasks mr-2"></i>
            Bulk Actions
          </label>
          <div className="flex gap-2">
            <button
              onClick={onSelectAll}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all hover:scale-105"
              style={{
                backgroundColor: `${primaryGradientFrom}20`,
                color: primaryGradientFrom,
              }}
            >
              <span className="hidden sm:inline">
                {selectedCount === totalQuestions ? 'Deselect All' : 'Select All'}
              </span>
              <span className="sm:hidden">
                {selectedCount === totalQuestions ? 'Deselect' : 'Select'}
              </span>
            </button>
            {selectedCount > 0 && (
              <button
                onClick={onDeleteSelected}
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: `${errorColor}20`,
                  color: errorColor,
                }}
                title={`Delete ${selectedCount} selected`}
              >
                <i className="fas fa-trash"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.category !== "All" || filters.difficulty !== "All" || filters.search) && (
        <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor }}>
          <span className="text-xs sm:text-sm font-semibold" style={{ color: secondaryText }}>
            Active Filters:
          </span>
          {filters.search && (
            <span
              className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold flex items-center gap-2"
              style={{
                backgroundColor: `${primaryGradientFrom}20`,
                color: primaryGradientFrom,
              }}
            >
              <span className="truncate max-w-[100px] sm:max-w-none">Search: "{filters.search}"</span>
              <button onClick={() => onFilterChange({ search: "" })}>
                <i className="fas fa-times"></i>
              </button>
            </span>
          )}
          {filters.category !== "All" && (
            <span
              className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold flex items-center gap-2"
              style={{
                backgroundColor: `${primaryGradientFrom}20`,
                color: primaryGradientFrom,
              }}
            >
              {filters.category}
              <button onClick={() => onFilterChange({ category: "All" })}>
                <i className="fas fa-times"></i>
              </button>
            </span>
          )}
          {filters.difficulty !== "All" && (
            <span
              className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold flex items-center gap-2"
              style={{
                backgroundColor: `${primaryGradientFrom}20`,
                color: primaryGradientFrom,
              }}
            >
              {filters.difficulty}
              <button onClick={() => onFilterChange({ difficulty: "All" })}>
                <i className="fas fa-times"></i>
              </button>
            </span>
          )}
          <button
            onClick={() => onFilterChange({ search: "", category: "All", difficulty: "All" })}
            className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${errorColor}20`,
              color: errorColor,
            }}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}