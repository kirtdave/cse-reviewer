// QuestionBank/QuestionStats.jsx
import React from "react";
import { motion } from "framer-motion";

export default function QuestionStats({ stats, palette }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, successColor, warningColor, errorColor } = palette;

  const categoryStats = Object.entries(stats.byCategory).slice(0, 4);
  const difficultyColors = {
    Easy: successColor,
    Normal: warningColor,
    Hard: errorColor
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${primaryGradientFrom}20` }}
          >
            <i className="fas fa-clipboard-list text-xl" style={{ color: primaryGradientFrom }}></i>
          </div>
        </div>
        <h3 className="text-3xl font-bold mb-1" style={{ color: textColor }}>
          {stats.total}
        </h3>
        <p className="text-sm" style={{ color: secondaryText }}>Total Questions</p>
      </motion.div>

      {/* By Difficulty */}
      {Object.entries(stats.byDifficulty).map(([difficulty, count], i) => (
        <motion.div
          key={difficulty}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (i + 1) * 0.1 }}
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${difficultyColors[difficulty]}20` }}
            >
              <i 
                className={`fas ${
                  difficulty === 'Easy' ? 'fa-smile' : 
                  difficulty === 'Normal' ? 'fa-meh' : 
                  'fa-frown'
                } text-xl`} 
                style={{ color: difficultyColors[difficulty] }}
              ></i>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1" style={{ color: textColor }}>
            {count}
          </h3>
          <p className="text-sm" style={{ color: secondaryText }}>{difficulty} Questions</p>
        </motion.div>
      ))}
    </div>
  );
}