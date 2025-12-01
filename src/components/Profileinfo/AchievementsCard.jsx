import React from "react";
import { motion } from "framer-motion";

export function AchievementItem({ icon, title, description, delay, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`flex items-center rounded-lg gap-3 p-3 ${
        isDark 
          ? "bg-white/5 border border-white/6" 
          : "bg-white/20 border border-white/10"
      } backdrop-blur-sm`}
    >
      <div className={`w-10 h-10 flex items-center justify-center rounded-md text-2xl ${
        isDark ? "bg-white/6 text-white" : "bg-white text-purple-600"
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className={`text-xs ${isDark ? "text-white/80" : "text-slate-200"}`}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function AchievementsCard({ user, isDark }) {
  // ✅ FIX: Use actual avgScore from user.stats
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
      title: `${user.stats.questionsMastered || 0} Questions Mastered`,
      description: 'Answered correctly 3+ times',
      delay: 0.4
    },
    {
      icon: user.stats.totalTests >= 10 ? '💎' : user.stats.totalTests >= 5 ? '🏆' : user.stats.totalTests >= 3 ? '⭐' : '🎯',
      title: user.stats.totalTests >= 10 ? '10+ Tests Master' : 
             user.stats.totalTests >= 5 ? '5 Tests Milestone' : 
             user.stats.totalTests >= 3 ? '3 Tests Milestone' : 
             user.stats.totalTests >= 1 ? 'First Test Completed' : 'No Tests Yet',
      description: `${user.stats.totalTests} ${user.stats.totalTests === 1 ? 'test' : 'tests'} completed`,
      delay: 0.5
    },
    {
      icon: avgScore >= 90 ? '💯' : avgScore >= 80 ? '🌟' : avgScore >= 70 ? '⭐' : avgScore > 0 ? '📊' : '🎯',
      title: avgScore >= 90 ? 'Elite Performer' : 
             avgScore >= 80 ? 'High Achiever' : 
             avgScore >= 70 ? 'Good Progress' : 
             avgScore > 0 ? 'Keep Practicing' : 'Start Your Journey',
      description: avgScore > 0 ? `${avgScore}% average score` : 'Complete a test to see your score',
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
      } backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-white/6" : "border-gray-200"}`}
    >
      <h2 className="text-xl font-bold mb-4 text-white">Your Achievements</h2>
      <div className="space-y-3">
        {achievements.map((achievement, idx) => (
          <AchievementItem key={idx} {...achievement} isDark={isDark} />
        ))}
      </div>
    </motion.div>
  );
}