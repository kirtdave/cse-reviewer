// QuestionBankPage.jsx - COMPLETELY FIXED
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getQuestions, deleteQuestion, updateQuestion, createQuestion } from "../../services/adminApi";
import QuestionFilters from "./QuestionBank/QuestionFilters";
import QuestionStats from "./QuestionBank/QuestionStats";
import QuestionList from "./QuestionBank/QuestionList";
import DuplicateDetector from "./QuestionBank/DuplicateDetector";
import QuestionEditor from "./QuestionBank/QuestionEditor";

export default function QuestionBankPage({ palette, onNavigateToTestBuilder }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, successColor, errorColor, warningColor } = palette;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    difficulty: "All",
    sortBy: "newest",
  });
  
  const [pagination, setPagination] = useState({ 
    page: 1, 
    limit: 20, 
    total: 0, 
    pages: 0 
  });

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

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
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
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-1" style={{ color: textColor }}>
            Question Bank Management
          </h2>
          <p className="text-xs md:text-sm" style={{ color: secondaryText }}>
            {pagination.total} total • {selectedQuestions.length} selected
          </p>
        </div>
        <div className="flex gap-2 md:gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowDuplicates(true)}
            className="flex-1 md:flex-none px-3 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 text-xs md:text-sm"
            style={{
              backgroundColor: `${warningColor}20`,
              color: warningColor,
            }}
          >
            <i className="fas fa-copy"></i>
            <span className="hidden sm:inline">Find Duplicates</span>
            <span className="sm:hidden">Duplicates</span>
          </button>
        </div>
      </div>

      <QuestionStats stats={stats} palette={palette} />

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

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm disabled:opacity-50 transition-all"
            style={{
              backgroundColor: `${primaryGradientFrom}20`,
              color: primaryGradientFrom
            }}
          >
            <i className="fas fa-chevron-left md:mr-2"></i>
            <span className="hidden md:inline">Previous</span>
          </button>
          <div className="flex items-center gap-1 md:gap-2">
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
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg font-semibold text-xs md:text-sm transition-all"
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
            className="px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm disabled:opacity-50 transition-all"
            style={{
              backgroundColor: `${primaryGradientFrom}20`,
              color: primaryGradientFrom
            }}
          >
            <span className="hidden md:inline">Next</span>
            <i className="fas fa-chevron-right md:ml-2"></i>
          </button>
        </div>
      )}

      <DuplicateDetector
        show={showDuplicates}
        onClose={() => setShowDuplicates(false)}
        questions={questions}
        onDelete={fetchQuestions}
        palette={palette}
      />
    
      <QuestionEditor
        show={showModal}
        question={editingQuestion}
        onClose={() => {
          setShowModal(false);
          setEditingQuestion(null);
        }}
        onSave={async (questionData) => {
          try {
            console.log('🔄 Saving question...', questionData);

            if (editingQuestion) {
              await updateQuestion(editingQuestion.id, questionData);
              console.log('✅ Question updated');
            } else {
              await createQuestion(questionData);
              console.log('✅ Question created');
            }
            
            await fetchQuestions();
            setShowModal(false);
            setEditingQuestion(null);
          } catch (error) {
            console.error('❌ Save error:', error);
            throw error;
          }
        }}
        palette={palette}
      />
    </div>
  );
}