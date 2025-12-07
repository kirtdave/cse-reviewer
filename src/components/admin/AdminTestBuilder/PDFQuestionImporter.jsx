import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, FileText, AlertCircle } from 'lucide-react';
import { generateQuestionsFromPDF } from '../../../services/adminTestService';

export default function PDFQuestionImporter({ isOpen, onClose, onImported, palette }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, successColor, errorColor, warningColor } = palette;

  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('Verbal Ability');
  const [count, setCount] = useState(10);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const CSE_CATEGORIES = [
    'Verbal Ability',
    'Numerical Ability',
    'Analytical Ability',
    'General Knowledge',
    'Clerical Ability',
    'Philippine Constitution'
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      console.log('📤 Uploading PDF:', {
        fileName: file.name,
        fileSize: file.size,
        category,
        count
      });

      // ✅ Call service with correct parameters
      const result = await generateQuestionsFromPDF(
        file,        // file object
        category,    // type parameter
        count,       // count parameter
        ''           // command parameter (optional)
      );

      console.log('✅ PDF Generation Result:', result);

      if (!result.success || !result.questions) {
        throw new Error(result.error || 'Failed to extract questions from PDF');
      }

      // ✅ Format questions to ensure proper structure
      const formattedQuestions = result.questions.map((q, idx) => {
        // Handle options - ensure it's always an array with 4 items
        let options = [];
        
        if (Array.isArray(q.options) && q.options.length === 4) {
          options = q.options;
        } else if (q.options && typeof q.options === 'object') {
          // If options come as {A: "...", B: "...", C: "...", D: "..."}
          options = [
            q.options.A || q.options['A)'] || 'A) Option 1',
            q.options.B || q.options['B)'] || 'B) Option 2',
            q.options.C || q.options['C)'] || 'C) Option 3',
            q.options.D || q.options['D)'] || 'D) Option 4'
          ];
        } else {
          // Fallback options
          options = [
            'A) Option 1',
            'B) Option 2',
            'C) Option 3',
            'D) Option 4'
          ];
        }

        return {
          question: q.question || `Question ${idx + 1}`,
          options: options,
          correctAnswer: q.correctAnswer || 'A',
          explanation: q.explanation || 'No explanation provided',
          category: q.category || category,
          difficulty: q.difficulty || 'Normal'
        };
      });

      console.log('✅ Formatted questions:', formattedQuestions.length);
      console.log('📋 Sample question:', formattedQuestions[0]);

      // Pass formatted questions to parent
      onImported(formattedQuestions);
      
      // Close modal and reset
      setFile(null);
      onClose();

    } catch (err) {
      console.error('❌ PDF Import Error:', err);
      setError(err.message || 'Failed to process PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg rounded-2xl p-4 md:p-6 max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: cardBg }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})` }}
              >
                <Upload className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold" style={{ color: textColor }}>
                  Import from PDF
                </h3>
                <p className="text-xs md:text-sm" style={{ color: secondaryText }}>
                  Extract questions from PDF file
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            >
              <X className="w-5 h-5 md:w-6 md:h-6" style={{ color: textColor }} />
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg flex items-start gap-2 text-sm"
              style={{ backgroundColor: `${errorColor}20`, border: `1px solid ${errorColor}` }}
            >
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" style={{ color: errorColor }} />
              <p style={{ color: errorColor }}>{error}</p>
            </motion.div>
          )}

          {/* File Upload */}
          <div className="mb-4">
            <label className="text-xs md:text-sm font-semibold mb-2 block" style={{ color: textColor }}>
              Select PDF File
            </label>
            <div
              className="relative border-2 border-dashed rounded-xl p-6 md:p-8 text-center cursor-pointer transition-all hover:scale-[1.02]"
              style={{ borderColor }}
              onClick={() => document.getElementById('pdf-upload').click()}
            >
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
              
              {file ? (
                <div className="flex items-center justify-center gap-2 md:gap-3">
                  <FileText style={{ color: successColor }} className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-sm md:text-base truncate" style={{ color: textColor }}>{file.name}</p>
                    <p className="text-xs md:text-sm" style={{ color: secondaryText }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload style={{ color: secondaryText }} className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 opacity-50" />
                  <p className="font-semibold mb-1 text-sm md:text-base" style={{ color: textColor }}>
                    Click to upload PDF
                  </p>
                  <p className="text-xs md:text-sm" style={{ color: secondaryText }}>
                    Maximum file size: 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="text-xs md:text-sm font-semibold mb-2 block" style={{ color: textColor }}>
              Question Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={uploading}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border outline-none text-sm md:text-base"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderColor,
                color: textColor
              }}
            >
              {CSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat} style={{ backgroundColor: cardBg }}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Question Count */}
          <div className="mb-4 md:mb-6">
            <label className="text-xs md:text-sm font-semibold mb-2 block" style={{ color: textColor }}>
              Questions to Extract: {count}
            </label>
            <input
              type="range"
              min="5"
              max="30"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              disabled={uploading}
              className="w-full"
              style={{ accentColor: primaryGradientFrom }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: secondaryText }}>
              <span>5</span>
              <span>30</span>
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="w-full px-4 py-2.5 md:py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm md:text-base"
            style={{
              background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
              color: '#fff',
              opacity: uploading || !file ? 0.6 : 1,
              cursor: uploading || !file ? 'not-allowed' : 'pointer'
            }}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                <span>Processing PDF...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 md:w-5 md:h-5" />
                <span>Extract Questions</span>
              </>
            )}
          </button>

          {/* Warning */}
          <div
            className="mt-4 p-3 rounded-lg"
            style={{
              backgroundColor: `${warningColor}10`,
              border: `1px solid ${warningColor}30`
            }}
          >
            <p className="text-xs md:text-sm" style={{ color: secondaryText }}>
              <i className="fas fa-exclamation-triangle mr-2" style={{ color: warningColor }}></i>
              AI will extract and generate questions based on PDF content. Results may vary.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}