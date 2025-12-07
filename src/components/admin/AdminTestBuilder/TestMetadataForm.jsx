import React from 'react';
import { BookOpen, Trophy } from 'lucide-react';

export default function TestMetadataForm({ 
  testType, setTestType, 
  title, setTitle, 
  description, setDescription, 
  timeLimit, setTimeLimit,
  difficulty, setDifficulty,
  palette 
}) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom } = palette;

  return (
    <div className="p-4 md:p-6 rounded-2xl space-y-4 md:space-y-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
      <h3 className="text-base md:text-lg font-bold flex items-center gap-2" style={{ color: textColor }}>
        <i className="fas fa-info-circle text-sm md:text-base"></i>
        <span className="text-sm md:text-base">Test Information</span>
      </h3>

      {/* Test Type Selection */}
      <div>
        <label className="text-xs md:text-sm font-semibold mb-2 md:mb-3 block" style={{ color: textColor }}>
          Test Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <button
            onClick={() => setTestType('Practice')}
            className={`p-3 md:p-4 rounded-xl transition-all ${testType === 'Practice' ? 'ring-2' : ''}`}
            style={{
              backgroundColor: testType === 'Practice' ? `${primaryGradientFrom}20` : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${borderColor}`,
              ringColor: primaryGradientFrom
            }}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <BookOpen className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" style={{ color: primaryGradientFrom }} />
              <div className="text-left">
                <h4 className="font-bold text-sm md:text-base" style={{ color: textColor }}>Practice Test</h4>
                <p className="text-xs" style={{ color: secondaryText }}>Flexible topics & question count</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setTestType('Mock')}
            className={`p-3 md:p-4 rounded-xl transition-all ${testType === 'Mock' ? 'ring-2' : ''}`}
            style={{
              backgroundColor: testType === 'Mock' ? `${primaryGradientFrom}20` : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${borderColor}`,
              ringColor: primaryGradientFrom
            }}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" style={{ color: primaryGradientFrom }} />
              <div className="text-left">
                <h4 className="font-bold text-sm md:text-base" style={{ color: textColor }}>Mock Exam</h4>
                <p className="text-xs" style={{ color: secondaryText }}>Full CSE simulation (180 questions)</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="md:col-span-2">
          <label className="text-xs md:text-sm font-semibold mb-2 block" style={{ color: textColor }}>
            Test Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Verbal Ability Practice Test"
            className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border outline-none transition-all text-sm md:text-base"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderColor,
              color: textColor
            }}
          />
        </div>

        <div>
          <label className="text-xs md:text-sm font-semibold mb-2 block" style={{ color: textColor }}>
            Time Limit (min)
          </label>
          <input
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
            min="1"
            className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border outline-none transition-all text-sm md:text-base"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderColor,
              color: textColor
            }}
          />
        </div>

        <div>
          <label className="text-xs md:text-sm font-semibold mb-2 block" style={{ color: textColor }}>
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border outline-none transition-all text-sm md:text-base"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderColor,
              color: textColor
            }}
          >
            <option value="Easy">Easy</option>
            <option value="Normal">Normal</option>
            <option value="Hard">Hard</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs md:text-sm font-semibold mb-2 block" style={{ color: textColor }}>
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description for this test..."
          rows={3}
          className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border outline-none transition-all resize-none text-sm md:text-base"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderColor,
            color: textColor
          }}
        />
      </div>
    </div>
  );
}