import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StudyScheduleModal, AIStudyTipsModal, StudyGuideModal } from "./RecommendationModals";

export function SmartRecommendations({ theme = "light", data }) {
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    if (data) {
      fetchRecommendations();
    }
  }, [data]);

  // ✅ FIXED: Now analyzes ALL 7 categories
  const getWeakTopics = () => {
    if (!data?.sections) return [];
    
    const sections = [
      { name: "Verbal Ability", score: data.sections.verbal || 0 },
      { name: "Numerical Ability", score: data.sections.numerical || 0 },
      { name: "Analytical Ability", score: data.sections.analytical || 0 },
      { name: "General Knowledge", score: data.sections.generalInfo || 0 },
      { name: "Clerical Ability", score: data.sections.clerical || 0 },
      { name: "Numerical Reasoning", score: data.sections.numericalReasoning || 0 },
      { name: "Philippine Constitution", score: data.sections.constitution || 0 },
    ];

    // Filter out categories with 0 score (not taken yet), then sort
    return sections
      .filter(s => s.score > 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 2)
      .map(s => s.name);
  };

  // ✅ FIXED: Now analyzes ALL 7 categories
  const getStrongTopics = () => {
    if (!data?.sections) return [];
    
    const sections = [
      { name: "Verbal Ability", score: data.sections.verbal || 0 },
      { name: "Numerical Ability", score: data.sections.numerical || 0 },
      { name: "Analytical Ability", score: data.sections.analytical || 0 },
      { name: "General Knowledge", score: data.sections.generalInfo || 0 },
      { name: "Clerical Ability", score: data.sections.clerical || 0 },
      { name: "Numerical Reasoning", score: data.sections.numericalReasoning || 0 },
      { name: "Philippine Constitution", score: data.sections.constitution || 0 },
    ];

    // Filter out categories with 0 score (not taken yet), then sort
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

      case "Take a Test":
        navigate('/test');
        break;

      case "Schedule Tests":
        setShowScheduleModal(true);
        break;

      case "Review Errors":
        navigate('/history');
        break;

      case "View Guide":
      case "Study Guide":
        setShowGuideModal(true);
        break;

      case "View Forecast":
        const forecastSection = document.querySelector('[data-section="forecast"]');
        if (forecastSection) {
          forecastSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;

      case "View All Tips":
        setShowTipsModal(true);
        break;

      case "Get Started":
        navigate('/test-setup');
        break;

      default:
        console.log('Action:', action);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const weakTopics = getWeakTopics();
      const strongTopics = getStrongTopics();
      const recentScores = getRecentScores();

      if (weakTopics.length === 0 || recentScores.length === 0) {
        setRecommendations(getDefaultRecommendations());
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/ai/recommendations', {
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
                  // Convert to string if it's an object
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
            action: "View All Tips",
            color: "from-purple-500 to-pink-500",
            confidence: "Keep Going"
          },
        ];
        setRecommendations(formattedRecs);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
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
        action: hasData ? "Start Practice" : "Take a Test",
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
        action: hasData ? "Review Errors" : "Study Guide",
        color: "from-orange-500 to-red-500",
        confidence: hasData ? `${totalExams} Tests` : "Begin Learning"
      },
      {
        icon: "📈",
        title: "Progress Insight",
        description: hasData
          ? `Current average: ${avgScore}% – AI predicts +5% improvement with consistent practice`
          : "Track your progress with regular practice tests",
        action: hasData ? "View Forecast" : "Get Started",
        color: "from-purple-500 to-pink-500",
        confidence: hasData ? "AI Prediction" : "Start Journey"
      },
    ];
  };

  if (isLoading) {
    return (
      <div className={`${isDark ? "bg-gradient-to-br from-purple-900/40 to-blue-900/40" : "bg-gradient-to-br from-purple-50 to-blue-50"} backdrop-blur-xl p-6 rounded-2xl border ${isDark ? "border-purple-500/30" : "border-purple-200"} shadow-xl`}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <span className={`ml-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            AI is analyzing your performance data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${isDark ? "bg-gradient-to-br from-purple-900/40 to-blue-900/40" : "bg-gradient-to-br from-purple-50 to-blue-50"} backdrop-blur-xl p-6 rounded-2xl border ${isDark ? "border-purple-500/30" : "border-purple-200"} shadow-xl`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg"
            >
              <Brain className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                AI Recommendations
              </h3>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Personalized insights based on your actual performance data
              </p>
            </div>
          </div>
          <button
            onClick={fetchRecommendations}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30" : "bg-purple-100 text-purple-700 hover:bg-purple-200"} transition-colors`}
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations?.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`relative overflow-hidden p-4 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-white/50"} border ${isDark ? "border-gray-700" : "border-gray-200"} cursor-pointer group`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${rec.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{rec.icon}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
                    {rec.confidence}
                  </span>
                </div>
                
                <h4 className={`font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {rec.title}
                </h4>
                <p className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-600"} leading-relaxed`}>
                  {rec.description}
                </p>
                
                <button 
                  onClick={() => handleAction(rec.action, rec)}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium bg-gradient-to-r ${rec.color} text-white shadow-lg hover:shadow-xl transition-all`}
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