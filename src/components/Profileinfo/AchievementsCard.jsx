import React from "react";
import { motion } from "framer-motion";

function AchievementItem({ icon, title, description, delay, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`flex items-center gap-2 p-2 sm:p-2.5 lg:p-3 rounded-lg ${
        isDark 
          ? "bg-white/5 border border-white/6" 
          : "bg-white/20 border border-white/10"
      } backdrop-blur-sm`}
    >
      <div className={`w-8 h-8 flex items-center justify-center rounded-md text-xl flex-shrink-0 ${
        isDark ? "bg-white/6 text-white" : "bg-white text-purple-600"
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white truncate">{title}</p>
        <p className={`text-xs ${isDark ? "text-white/80" : "text-slate-200"} truncate`}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function AchievementsCard({ user, isDark }) {
  const avgScore = user.stats.avgScore || 0;

  const achievements = [
    {
      icon: '🔥',
      title: `${user.stats.currentStreak}-Day Streak`,
      description: 'Keep it going!',
      delay: 0.3
    },
    {
      icon: '🎓',
      title: `${user.stats.questionsMastered || 0} Mastered`,
      description: 'Answered correctly 3+ times',
      delay: 0.4
    },
    {
      icon: user.stats.totalTests >= 10 ? '💎' : user.stats.totalTests >= 5 ? '🏆' : user.stats.totalTests >= 3 ? '⭐' : '🎯',
      title: user.stats.totalTests >= 10 ? '10+ Tests' : 
             user.stats.totalTests >= 5 ? '5 Tests' : 
             user.stats.totalTests >= 3 ? '3 Tests' : 
             user.stats.totalTests >= 1 ? 'First Test' : 'No Tests Yet',
      description: `${user.stats.totalTests} ${user.stats.totalTests === 1 ? 'test' : 'tests'} completed`,
      delay: 0.5
    },
    {
      icon: avgScore >= 90 ? '💯' : avgScore >= 80 ? '🌟' : avgScore >= 70 ? '⭐' : avgScore > 0 ? '📊' : '🎯',
      title: avgScore >= 90 ? 'Elite Performer' : 
             avgScore >= 80 ? 'High Achiever' : 
             avgScore >= 70 ? 'Good Progress' : 
             avgScore > 0 ? 'Keep Practicing' : 'Start Journey',
      description: avgScore > 0 ? `${avgScore}% average` : 'Complete a test',
      delay: 0.6
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className={`${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white"
          : "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
      } backdrop-blur-xl rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border ${isDark ? "border-white/6" : "border-gray-200"}`}
    >
      <h2 className="text-sm sm:text-base lg:text-lg font-bold mb-2 sm:mb-3 lg:mb-4 text-white">Achievements</h2>
      <div className="space-y-2 sm:space-y-2 lg:space-y-3">
        {achievements.map((achievement, idx) => (
          <AchievementItem key={idx} {...achievement} isDark={isDark} />
        ))}
      </div>
    </motion.div>
  );
}