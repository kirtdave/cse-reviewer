import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Eye, EyeOff, BookOpen, Trophy, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import TestMetadataForm from './TestMetadataForm';
import QuestionSetManager from './QuestionSetManager';
import QuestionList from './QuestionList';
import QuestionEditor from './QuestionEditor';
import AIQuestionGenerator from './AIQuestionGenerator';
import PDFQuestionImporter from './PDFQuestionImporter';
import { createAdminTest, updateAdminTest, togglePublishAdminTest } from '../../../services/adminTestService';

export default function AdminTestBuilderPage({ palette, onBack, editingTest = null }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, successColor, errorColor } = palette;

  // Test metadata
  const [testType, setTestType] = useState('Practice');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(60);
  const [difficulty, setDifficulty] = useState('Mixed');
  const [isPublished, setIsPublished] = useState(false);

  // Question sets
  const [sets, setSets] = useState([
    { id: Date.now(), title: 'Set 1', questions: [] }
  ]);
  const [activeSetId, setActiveSetId] = useState(Date.now());

  // UI states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showPDFImporter, setShowPDFImporter] = useState(false);

  // Load editing test
  useEffect(() => {
    if (editingTest) {
      setTestType(editingTest.testType || 'Practice');
      setTitle(editingTest.title || '');
      setDescription(editingTest.description || '');
      setTimeLimit(editingTest.timeLimit || 60);
      setDifficulty(editingTest.difficulty || 'Mixed');
      setIsPublished(editingTest.isPublished || false);
      
      if (editingTest.sets && editingTest.sets.length > 0) {
        setSets(editingTest.sets);
        setActiveSetId(editingTest.sets[0].id);
      }
    }
  }, [editingTest]);

  const getTotalQuestions = () => {
    return sets.reduce((sum, set) => sum + set.questions.length, 0);
  };

  const getActiveSet = () => {
    return sets.find(s => s.id === activeSetId) || sets[0];
  };

  const handleSave = async (publishImmediately = false) => {
    // Validation
    if (!title.trim()) {
      setError('Please enter a test title');
      return;
    }

    if (getTotalQuestions() === 0) {
      setError('Please add at least one question');
      return;
    }

    // Mock exam validation
    if (testType === 'Mock' && getTotalQuestions() !== 180) {
      setError('Mock exams must have exactly 180 questions (30 per category)');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const testData = {
        title,
        description,
        testType,
        sets,
        difficulty,
        timeLimit,
        isPublished: publishImmediately || isPublished
      };

      let result;
      if (editingTest) {
        result = await updateAdminTest(editingTest.id, testData);
        setSuccess('Test updated successfully!');
      } else {
        result = await createAdminTest(testData);
        setSuccess('Test created successfully!');
      }

      setTimeout(() => {
        onBack();
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to save test');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!editingTest) return;

    try {
      await togglePublishAdminTest(editingTest.id);
      setIsPublished(!isPublished);
      setSuccess(isPublished ? 'Test unpublished' : 'Test published!');
    } catch (err) {
      setError('Failed to toggle publish status');
    }
  };

  const handleAddQuestion = (questionData) => {
    const activeSet = getActiveSet();
    const updatedSets = sets.map(set => {
      if (set.id === activeSet.id) {
        return {
          ...set,
          questions: [...set.questions, { ...questionData, id: Date.now() }]
        };
      }
      return set;
    });
    setSets(updatedSets);
    setShowQuestionEditor(false);
  };

  const handleEditQuestion = (setId, questionIndex, questionData) => {
    const updatedSets = sets.map(set => {
      if (set.id === setId) {
        const updatedQuestions = [...set.questions];
        updatedQuestions[questionIndex] = { ...questionData, id: set.questions[questionIndex].id };
        return { ...set, questions: updatedQuestions };
      }
      return set;
    });
    setSets(updatedSets);
    setShowQuestionEditor(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (setId, questionIndex) => {
    if (window.confirm('Delete this question?')) {
      const updatedSets = sets.map(set => {
        if (set.id === setId) {
          return {
            ...set,
            questions: set.questions.filter((_, idx) => idx !== questionIndex)
          };
        }
        return set;
      });
      setSets(updatedSets);
    }
  };

  const handleAIGenerated = (questions) => {
    const activeSet = getActiveSet();
    const updatedSets = sets.map(set => {
      if (set.id === activeSet.id) {
        return {
          ...set,
          questions: [...set.questions, ...questions.map(q => ({ ...q, id: Date.now() + Math.random() }))]
        };
      }
      return set;
    });
    setSets(updatedSets);
    setShowAIGenerator(false);
    setSuccess(`Added ${questions.length} AI-generated questions!`);
  };

  const handlePDFImported = (questions) => {
    const activeSet = getActiveSet();
    const updatedSets = sets.map(set => {
      if (set.id === activeSet.id) {
        return {
          ...set,
          questions: [...set.questions, ...questions.map(q => ({ ...q, id: Date.now() + Math.random() }))]
        };
      }
      return set;
    });
    setSets(updatedSets);
    setShowPDFImporter(false);
    setSuccess(`Imported ${questions.length} questions from PDF!`);
  };

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onBack}
            className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" style={{ color: textColor }} />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: textColor }}>
              {editingTest ? 'Edit Admin Test' : 'Create Admin Test'}
            </h2>
            <p className="text-xs md:text-sm" style={{ color: secondaryText }}>
              {getTotalQuestions()} questions • {sets.length} {sets.length === 1 ? 'set' : 'sets'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {editingTest && (
            <button
              onClick={handleTogglePublish}
              className="px-3 py-2 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition-all hover:scale-105 flex items-center gap-1 md:gap-2"
              style={{
                backgroundColor: isPublished ? `${errorColor}20` : `${successColor}20`,
                color: isPublished ? errorColor : successColor
              }}
            >
              {isPublished ? <EyeOff className="w-3 h-3 md:w-4 md:h-4" /> : <Eye className="w-3 h-3 md:w-4 md:h-4" />}
              <span className="hidden sm:inline">{isPublished ? 'Unpublish' : 'Publish'}</span>
            </button>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 md:px-6 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition-all hover:scale-105 flex items-center gap-1 md:gap-2"
            style={{
              background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
              color: '#fff',
              opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <Save className="w-3 h-3 md:w-4 md:h-4" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 md:p-4 rounded-xl flex items-center gap-2 text-xs md:text-sm"
          style={{ backgroundColor: `${errorColor}20`, borderLeft: `4px solid ${errorColor}` }}
        >
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ color: errorColor }} />
          <span style={{ color: errorColor }}>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 md:p-4 rounded-xl flex items-center gap-2 text-xs md:text-sm"
          style={{ backgroundColor: `${successColor}20`, borderLeft: `4px solid ${successColor}` }}
        >
          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ color: successColor }} />
          <span style={{ color: successColor }}>{success}</span>
        </motion.div>
      )}

      {/* Test Type & Metadata */}
      <TestMetadataForm
        testType={testType}
        setTestType={setTestType}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        timeLimit={timeLimit}
        setTimeLimit={setTimeLimit}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        palette={palette}
      />

      {/* Question Set Manager */}
      <QuestionSetManager
        sets={sets}
        setSets={setSets}
        activeSetId={activeSetId}
        setActiveSetId={setActiveSetId}
        palette={palette}
      />

      {/* Question List */}
      <QuestionList
        activeSet={getActiveSet()}
        onAddQuestion={() => {
          setEditingQuestion(null);
          setShowQuestionEditor(true);
        }}
        onEditQuestion={(questionIndex) => {
          setEditingQuestion({ setId: activeSetId, questionIndex, data: getActiveSet().questions[questionIndex] });
          setShowQuestionEditor(true);
        }}
        onDeleteQuestion={handleDeleteQuestion}
        onShowAIGenerator={() => setShowAIGenerator(true)}
        onShowPDFImporter={() => setShowPDFImporter(true)}
        palette={palette}
      />

      {/* Question Editor Modal */}
      {showQuestionEditor && (
        <QuestionEditor
          isOpen={showQuestionEditor}
          onClose={() => {
            setShowQuestionEditor(false);
            setEditingQuestion(null);
          }}
          onSave={editingQuestion ? 
            (data) => handleEditQuestion(editingQuestion.setId, editingQuestion.questionIndex, data) : 
            handleAddQuestion
          }
          editingQuestion={editingQuestion?.data}
          palette={palette}
        />
      )}

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <AIQuestionGenerator
          isOpen={showAIGenerator}
          onClose={() => setShowAIGenerator(false)}
          onGenerated={handleAIGenerated}
          palette={palette}
        />
      )}

      {/* PDF Importer Modal */}
      {showPDFImporter && (
        <PDFQuestionImporter
          isOpen={showPDFImporter}
          onClose={() => setShowPDFImporter(false)}
          onImported={handlePDFImported}
          palette={palette}
        />
      )}
    </div>
  );
}