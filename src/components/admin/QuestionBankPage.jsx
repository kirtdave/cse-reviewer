// QuestionBankPage.jsx - Main Component
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getQuestions, deleteQuestion } from "../../services/adminApi";
import QuestionFilters from "./QuestionBank/QuestionFilters";
import QuestionStats from "./QuestionBank/QuestionStats";
import QuestionList from "./QuestionBank/QuestionList";
import QuestionModal from "./QuestionBank/QuestionModal";
import DuplicateDetector from "./QuestionBank/DuplicateDetector";

export default function QuestionBankPage({ palette }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, successColor, errorColor, warningColor } = palette;

  // States
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  
  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    difficulty: "All",
    sortBy: "newest", // newest, oldest, category, difficulty
  });
  
  const [pagination, setPagination] = useState({ 
    page: 1, 
    limit: 20, 
    total: 0, 
    pages: 0 
  });

  // Fetch questions
  useEffect(() => {
    fetchQuestions();
  }, [pagination.page, filters]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await getQuestions({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        category: filters.category !== "All" ? filters.category : undefined,
        difficulty: filters.difficulty !== "All" ? filters.difficulty : undefined,
        sortBy: filters.sortBy
      });
      
      setQuestions(data.questions);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowModal(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleDeleteSelected = async () => {
    if (selectedQuestions.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedQuestions.length} question(s)?`)) {
      try {
        await Promise.all(selectedQuestions.map(id => deleteQuestion(id)));
        setSelectedQuestions([]);
        fetchQuestions();
      } catch (error) {
        console.error('Error deleting questions:', error);
        alert('Failed to delete some questions');
      }
    }
  };

  const toggleSelectQuestion = (id) => {
    setSelectedQuestions(prev => 
      prev.includes(id) 
        ? prev.filter(qId => qId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map(q => q.id));
    }
  };

  // Calculate stats
  const stats = {
    total: pagination.total,
    byCategory: questions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {}),
    byDifficulty: questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {})
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: textColor }}>
            Question Bank Management
          </h2>
          <p style={{ color: secondaryText }}>
            {pagination.total} total questions • {selectedQuestions.length} selected
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowDuplicates(true)}
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
            style={{
              backgroundColor: `${warningColor}20`,
              color: warningColor,
            }}
          >
            <i className="fas fa-copy"></i>
            Find Duplicates
          </button>
          <button
            onClick={handleAddQuestion}
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
              color: "#fff",
              boxShadow: isDark ? "0 4px 12px rgba(59,130,246,0.3)" : "0 4px 12px rgba(59,130,246,0.2)",
            }}
          >
            <i className="fas fa-plus"></i>
            Add Question
          </button>
        </div>
      </div>

      {/* Stats */}
      <QuestionStats 
        stats={stats} 
        palette={palette} 
      />

      {/* Filters & Actions */}
      <QuestionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selectedQuestions.length}
        onDeleteSelected={handleDeleteSelected}
        onSelectAll={selectAll}
        totalQuestions={questions.length}
        palette={palette}
      />

      {/* Question List */}
      <QuestionList
        questions={questions}
        loading={loading}
        viewMode={viewMode}
        selectedQuestions={selectedQuestions}
        onToggleSelect={toggleSelectQuestion}
        onEdit={handleEditQuestion}
        onDelete={(id) => {
          if (window.confirm("Delete this question?")) {
            deleteQuestion(id).then(fetchQuestions);
          }
        }}
        palette={palette}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition-all"
            style={{
              backgroundColor: `${primaryGradientFrom}20`,
              color: primaryGradientFrom
            }}
          >
            <i className="fas fa-chevron-left mr-2"></i>
            Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNum;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                  className="w-10 h-10 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: pagination.page === pageNum 
                      ? primaryGradientFrom 
                      : `${primaryGradientFrom}20`,
                    color: pagination.page === pageNum ? "#fff" : primaryGradientFrom
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition-all"
            style={{
              backgroundColor: `${primaryGradientFrom}20`,
              color: primaryGradientFrom
            }}
          >
            Next
            <i className="fas fa-chevron-right ml-2"></i>
          </button>
        </div>
      )}

      {/* Modals */}
      <QuestionModal
        show={showModal}
        onClose={() => setShowModal(false)}
        editingQuestion={editingQuestion}
        onSave={fetchQuestions}
        palette={palette}
      />

      <DuplicateDetector
        show={showDuplicates}
        onClose={() => setShowDuplicates(false)}
        questions={questions}
        onDelete={fetchQuestions}
        palette={palette}
      />
    </div>
  );
}