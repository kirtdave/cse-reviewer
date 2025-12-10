import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StudyScheduleModal, AIStudyTipsModal, StudyGuideModal } from "./RecommendationModals";

export function SmartRecommendations({ theme = "light", data }) {
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // ✅ Changed to false - don't load on mount
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    if (data) {
      // ✅ CRITICAL FIX: Show default recommendations immediately, DON'T call AI automatically
      setRecommendations(getDefaultRecommendations());
      // User can click "Refresh" button to get AI recommendations if they want
    }
  }, [data]);

  const getWeakTopics = () => {
    if (!data?.sections) return [];
    
    const sections = [
      { name: "Verbal Ability", score: data.sections.verbal || 0 },
      { name: "Numerical Ability", score: data.sections.numerical || 0 },
      { name: "Analytical Ability", score: data.sections.analytical || 0 },
      { name: "General Knowledge", score: data.sections.generalInfo || 0 },
      { name: "Clerical Ability", score: data.sections.clerical || 0 },
      { name: "Philippine Constitution", score: data.sections.constitution || 0 },
    ];

    return sections
      .filter(s => s.score > 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 2)
      .map(s => s.name);
  };

  const getStrongTopics = () => {
    if (!data?.sections) return [];
    
    const sections = [
      { name: "Verbal Ability", score: data.sections.verbal || 0 },
      { name: "Numerical Ability", score: data.sections.numerical || 0 },
      { name: "Analytical Ability", score: data.sections.analytical || 0 },
      { name: "General Knowledge", score: data.sections.generalInfo || 0 },
      { name: "Clerical Ability", score: data.sections.clerical || 0 },
      { name: "Philippine Constitution", score: data.sections.constitution || 0 },
    ];

    return sections
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(s => s.name);
  };

  const getRecentScores = () => {
    if (!data?.trend || data.trend.length === 0) return [0];
    return data.trend.slice(-5).map(attempt => attempt.score || 0);
  };

  const handleAction = (action, recData) => {
    switch(action) {
      case "Start Practice":
        navigate('/test');
        break;
      case "Schedule Tests":
        setShowScheduleModal(true);
        break;
      case "Study Guide":
        setShowGuideModal(true);
        break;
      case "View Tips":
        setShowTipsModal(true);
        break;
      default:
        console.log('Action:', action);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const weakTopics = getWeakTopics();
      const strongTopics = getStrongTopics();
      const recentScores = getRecentScores();

      if (weakTopics.length === 0 || recentScores.length === 0) {
        setRecommendations(getDefaultRecommendations());
        setIsLoading(false);
        return;
      }

      console.log('🤖 Fetching AI recommendations...');

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const response = await fetch(`${API_URL}/ai/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          weakTopics,
          strongTopics,
          recentScores
        })
      });

      const responseData = await response.json();

      if (responseData.success) {
        const formattedRecs = [
          {
            icon: "🎯",
            title: "Focus Area",
            description: `${responseData.recommendations.priorities[0]} - needs attention`,
            action: "Start Practice",
            color: "from-blue-500 to-purple-500",
            confidence: "High Priority"
          },
          {
            icon: "⏰",
            title: "Practice Schedule",
            description: (() => {
              const schedule = responseData.recommendations.schedule;
              if (schedule && typeof schedule === 'object') {
                const entries = Object.entries(schedule);
                if (entries.length > 0) {
                  const [timeOfDay, activity] = entries[0];
                  if (typeof activity === 'object') {
                    return `${timeOfDay}: ${Object.values(activity).join(', ')}`;
                  }
                  return `${timeOfDay}: ${activity}`;
                }
              }
              return "Daily practice recommended";
            })(),
            action: "Schedule Tests",
            color: "from-green-500 to-emerald-500",
            confidence: "Optimal Frequency"
          },
          {
            icon: "📚",
            title: "Study Method",
            description: responseData.recommendations.methods[0] || "Review systematically",
            action: "View Guide",
            color: "from-orange-500 to-red-500",
            confidence: "AI Suggested"
          },
          {
            icon: "📈",
            title: "Motivation",
            description: responseData.recommendations.tips[0] || "Stay consistent!",
            action: "View Tips",
            color: "from-purple-500 to-pink-500",
            confidence: "Keep Going"
          },
        ];
        setRecommendations(formattedRecs);
        console.log('✅ AI recommendations loaded successfully');
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      
      // ✅ Show user-friendly error for quota exceeded
      if (error.message?.includes('AI_OVERLOAD') || error.message?.includes('quota')) {
        alert('⚠️ AI quota exceeded. Please wait a minute and try again, or use the default recommendations below.');
      }
      
      setRecommendations(getDefaultRecommendations());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultRecommendations = () => {
    const weakTopics = getWeakTopics();
    const totalExams = data?.totalExams || 0;
    const avgScore = data?.avgScore || 0;

    const weakestTopic = weakTopics[0] || "your weak areas";
    const hasData = totalExams > 0;

    return [
      {
        icon: "🎯",
        title: "Focus Area",
        description: hasData 
          ? `${weakestTopic} – needs more practice based on your recent tests`
          : "Complete your first test to get personalized recommendations",
        action: "Start Practice",
        color: "from-blue-500 to-purple-500",
        confidence: hasData ? "High Priority" : "Get Started"
      },
      {
        icon: "⏰",
        title: "Practice Goal",
        description: hasData
          ? `${totalExams < 5 ? 'Take more tests' : 'Maintain'} 3 mock exams per week for consistent improvement`
          : "Start with 2-3 practice tests per week",
        action: "Schedule Tests",
        color: "from-green-500 to-emerald-500",
        confidence: "Optimal Frequency"
      },
      {
        icon: "📚",
        title: "Study Tip",
        description: hasData
          ? `Review your mistakes in ${weakestTopic} to strengthen fundamentals`
          : "Focus on understanding concepts before taking timed tests",
        action: "Study Guide",
        color: "from-orange-500 to-red-500",
        confidence: hasData ? `${totalExams} Tests` : "Begin Learning"
      },
      {
        icon: "📈",
        title: "Motivation",
        description: hasData
          ? `Current average: ${avgScore}% – Keep consistent practice to improve by 5-10%`
          : "Track your progress with regular practice tests",
        action: "View Tips",
        color: "from-purple-500 to-pink-500",
        confidence: hasData ? "Keep Going" : "Get Started"
      },
    ];
  };

  if (isLoading) {
    return (
      <div className={`${isDark ? "bg-gradient-to-br from-purple-900/40 to-blue-900/40" : "bg-gradient-to-br from-purple-50 to-blue-50"} backdrop-blur-xl p-3 sm:p-4 lg:p-6 rounded-xl lg:rounded-2xl border ${isDark ? "border-purple-500/30" : "border-purple-200"} shadow-lg lg:shadow-xl`}>
        <div className="flex items-center justify-center py-8 sm:py-10 lg:py-12">
          <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-500 animate-spin" />
          <span className={`ml-2 sm:ml-3 text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            AI is analyzing your performance data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${isDark ? "bg-gradient-to-br from-purple-900/40 to-blue-900/40" : "bg-gradient-to-br from-purple-50 to-blue-50"} backdrop-blur-xl p-3 sm:p-4 lg:p-6 rounded-xl lg:rounded-2xl border ${isDark ? "border-purple-500/30" : "border-purple-200"} shadow-lg lg:shadow-xl`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
          <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0"
            >
              <Brain className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-white" />
            </motion.div>
            <div className="min-w-0">
              <h3 className={`text-sm sm:text-base lg:text-lg font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>
                AI Recommendations
              </h3>
              <p className={`text-[10px] sm:text-xs ${isDark ? "text-gray-400" : "text-gray-600"} truncate`}>
                Personalized insights
              </p>
            </div>
          </div>
          <button
            onClick={fetchRecommendations}
            className={`px-2 py-1 sm:px-2.5 sm:py-1.5 lg:px-3 lg:py-1.5 rounded-md lg:rounded-lg text-[10px] sm:text-xs font-medium ${isDark ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30" : "bg-purple-100 text-purple-700 hover:bg-purple-200"} transition-colors flex-shrink-0`}
          >
            🤖 AI
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
          {recommendations?.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`relative overflow-hidden p-3 sm:p-3.5 lg:p-4 rounded-lg lg:rounded-xl ${isDark ? "bg-gray-800/50" : "bg-white/50"} border ${isDark ? "border-gray-700" : "border-gray-200"} cursor-pointer group`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${rec.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2 sm:mb-2.5 lg:mb-3">
                  <span className="text-xl sm:text-2xl">{rec.icon}</span>
                  <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium ${isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
                    {rec.confidence}
                  </span>
                </div>
                
                <h4 className={`font-semibold text-xs sm:text-sm lg:text-base mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {rec.title}
                </h4>
                <p className={`text-[11px] sm:text-xs lg:text-sm mb-2 sm:mb-2.5 lg:mb-3 ${isDark ? "text-gray-400" : "text-gray-600"} leading-relaxed line-clamp-2 sm:line-clamp-none`}>
                  {rec.description}
                </p>
                
                <button 
                  onClick={() => handleAction(rec.action, rec)}
                  className={`w-full py-1.5 sm:py-2 px-3 sm:px-4 rounded-md lg:rounded-lg text-xs sm:text-sm font-medium bg-gradient-to-r ${rec.color} text-white shadow-lg hover:shadow-xl transition-all`}
                >
                  {rec.action} →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <StudyScheduleModal 
        isOpen={showScheduleModal} 
        onClose={() => setShowScheduleModal(false)} 
        theme={theme}
        weakTopic={getWeakTopics()[0]}
      />
      <AIStudyTipsModal 
        isOpen={showTipsModal} 
        onClose={() => setShowTipsModal(false)} 
        theme={theme}
        analyticsData={data}
      />
      <StudyGuideModal 
        isOpen={showGuideModal} 
        onClose={() => setShowGuideModal(false)} 
        theme={theme}
        category={getWeakTopics()[0] || "Verbal Ability"}
      />
    </>
  );
}