import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles, Clock } from "lucide-react";

export function AIStudyTipsModal({ isOpen, onClose, theme = "light", analyticsData }) {
  const isDark = theme === "dark";
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [lastGenerateTime, setLastGenerateTime] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    if (isOpen && analyticsData) {
      setTips(getFallbackTips());
    }
  }, [isOpen, analyticsData]);

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(cooldownRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  const generatePersonalizedTips = async () => {
    const now = Date.now();
    const timeSinceLastCall = now - lastGenerateTime;
    const cooldownMs = 30000;

    if (timeSinceLastCall < cooldownMs) {
      const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastCall) / 1000);
      setCooldownRemaining(remainingSeconds);
      return;
    }

    if (!analyticsData) {
      console.error('No analytics data available');
      return;
    }

    setIsLoading(true);
    setLastGenerateTime(now);

    try {
      const token = localStorage.getItem('token');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: `Generate 10 personalized study tips. Format each tip as: EMOJI|Title|Description

CRITICAL: Output ONLY the 10 tips in EMOJI|Title|Description format. NO greetings, NO extra text.

Example:
📚|Focus on Weak Areas|Spend 60% of study time on your lowest scoring section
⏰|Improve Speed|Practice timed drills to reduce time per question

Generate 10 tips now:`,
          conversationHistory: [],
          userData: {
            avgScore: analyticsData?.avgScore || 0,
            totalExams: analyticsData?.totalExams || 0,
            sections: analyticsData?.sections || {},
            timeMetrics: analyticsData?.timeMetrics || {},
            recentAttempts: analyticsData?.recentAttempts?.slice(0, 3) || []
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (data.success && data.response) {
        console.log('📥 AI Response:', data.response);
        const parsedTips = parseAIResponse(data.response);
        console.log('✅ Parsed Tips:', parsedTips);
        
        if (parsedTips.length > 0) {
          setTips(parsedTips);
        } else {
          console.warn('⚠️ No tips parsed, keeping fallback tips');
        }
      } else {
        throw new Error(data.message || 'Failed to generate tips');
      }
    } catch (error) {
      console.error('Error generating tips:', error);
      
      if (error.message?.includes('AI_OVERLOAD') || error.message?.includes('quota')) {
        alert('⏳ AI service is busy. Please wait 30 seconds and try again.');
        setCooldownRemaining(30);
      } else if (error.name === 'AbortError') {
        alert('⏱️ Request timed out. Please try again.');
      } else {
        alert('❌ Failed to generate tips. Using fallback recommendations.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const parseAIResponse = (response) => {
    console.log('🔍 Parsing AI response...');
    const tips = [];
    
    // Split by newlines and filter out empty lines
    const lines = response.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log('📝 Found lines:', lines.length);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Method 1: Try parsing ICON|TITLE|DESCRIPTION format
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 3) {
          const icon = parts[0].match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)?.[0] || '💡';
          tips.push({
            icon: icon,
            title: parts[1],
            description: parts.slice(2).join('|')
          });
          console.log(`✅ Parsed tip ${tips.length}:`, tips[tips.length - 1].title);
          continue;
        }
      }
      
      // Method 2: Try parsing numbered format (1. Title: Description)
      const numberedMatch = line.match(/^\d+[\.\)]\s*(.+?)[:]\s*(.+)$/);
      if (numberedMatch) {
        const icon = line.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)?.[0] || '💡';
        tips.push({
          icon: icon,
          title: numberedMatch[1].replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim(),
          description: numberedMatch[2].trim()
        });
        console.log(`✅ Parsed tip ${tips.length}:`, tips[tips.length - 1].title);
        continue;
      }
      
      // Method 3: Try parsing with emoji at start
      const emojiMatch = line.match(/^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])\s*(.+?)[:.-]\s*(.+)$/u);
      if (emojiMatch) {
        tips.push({
          icon: emojiMatch[1],
          title: emojiMatch[2].trim(),
          description: emojiMatch[3].trim()
        });
        console.log(`✅ Parsed tip ${tips.length}:`, tips[tips.length - 1].title);
        continue;
      }
      
      // Method 4: Try bold text format (**Title**: Description)
      const boldMatch = line.match(/\*\*(.+?)\*\*[:]\s*(.+)/);
      if (boldMatch) {
        const icon = line.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)?.[0] || '💡';
        tips.push({
          icon: icon,
          title: boldMatch[1].trim(),
          description: boldMatch[2].trim()
        });
        console.log(`✅ Parsed tip ${tips.length}:`, tips[tips.length - 1].title);
        continue;
      }
      
      // Method 5: Generic fallback - treat line as description if it's substantial
      if (line.length > 30 && tips.length < 10) {
        const icon = line.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)?.[0] || '💡';
        const cleanLine = line.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
        
        // Try to extract title from first sentence
        const firstSentence = cleanLine.split(/[.!?]/)[0];
        const title = firstSentence.length > 50 ? firstSentence.substring(0, 30) + '...' : firstSentence;
        
        tips.push({
          icon: icon,
          title: title || `Study Tip ${tips.length + 1}`,
          description: cleanLine
        });
        console.log(`✅ Parsed tip ${tips.length} (fallback):`, tips[tips.length - 1].title);
      }
    }
    
    console.log(`📊 Total tips parsed: ${tips.length}`);
    return tips.slice(0, 10);
  };

  const getFallbackTips = () => {
    const weak = Object.entries(analyticsData?.sections || {})
      .filter(([_, score]) => score > 0 && score < 65)
      .map(([name]) => name);
    
    const avgScore = analyticsData?.avgScore || 0;
    const totalExams = analyticsData?.totalExams || 0;
    
    return [
      { icon: "📚", title: "Focus on Weak Areas", description: weak.length > 0 ? `Spend 60% of your study time on ${weak[0]} where you scored ${analyticsData.sections[weak[0]]}%` : "Complete more tests to identify your weak areas" },
      { icon: "⏰", title: "Time Management", description: analyticsData?.timeMetrics?.avgTimePerQuestion > 60 ? `Work on speed - you're averaging ${analyticsData.timeMetrics.avgTimePerQuestion}s per question. Aim for under 60s` : "Your time management is good! Keep maintaining your pace" },
      { icon: "🎯", title: "Consistency", description: totalExams < 5 ? `Take more practice tests! You've only completed ${totalExams}. Aim for 3 tests per week` : "Great consistency! Keep taking regular practice tests" },
      { icon: "💪", title: "Progressive Difficulty", description: avgScore < 70 ? "Start with Easy questions to build confidence, then progress to Normal" : "Challenge yourself with Hard difficulty to push beyond your comfort zone" },
      { icon: "🧘", title: "Strategic Breaks", description: "Take 5-minute breaks every 25 minutes. Your brain consolidates information during rest" },
      { icon: "📊", title: "Weekly Reviews", description: "Check your analytics every Sunday to track improvement and adjust your study plan" },
      { icon: "✍️", title: "Error Journal", description: analyticsData?.recentAttempts?.length > 0 ? `Review your ${analyticsData.recentAttempts[0].details?.incorrectQuestions || 0} recent mistakes` : "Start maintaining an error journal to identify patterns" },
      { icon: "🎓", title: "Understand Concepts", description: "Focus on WHY answers are correct. Understanding lasts longer than memorization" },
      { icon: "🏆", title: "Celebrate Progress", description: avgScore > 0 ? `You've improved to ${avgScore}% average! Keep up the momentum` : "Complete your first test to start tracking your progress" },
      { icon: "🔥", title: "Build Momentum", description: "Study at the same time each day. Consistency builds habits and improves retention by 80%" }
    ];
  };

  const handleRegenerateTips = () => {
    if (cooldownRemaining > 0) {
      alert(`⏳ Please wait ${cooldownRemaining} seconds before generating tips again.`);
      return;
    }

    setUseAI(true);
    generatePersonalizedTips();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${isDark ? "bg-gray-900" : "bg-white"} rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 max-w-3xl w-full shadow-2xl max-h-[85vh] overflow-hidden flex flex-col`}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
              <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 min-w-0">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0"
                >
                  <Sparkles className="w-5 h-5 sm:w-5.5 sm:h-5.5 lg:w-6 lg:h-6 text-white" />
                </motion.div>
                <div className="min-w-0">
                  <h3 className={`text-base sm:text-lg lg:text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>
                    AI-Powered Study Tips
                  </h3>
                  <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} truncate`}>
                    {useAI ? "AI-generated recommendations" : "Smart tips based on your data"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 sm:p-2 rounded-lg ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors flex-shrink-0`}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading && (
                <div className="flex items-center justify-center py-4 mb-4">
                  <Loader2 className="w-6 h-6 text-purple-500 animate-spin mr-2" />
                  <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    AI is generating personalized tips...
                  </p>
                </div>
              )}
              
              {cooldownRemaining > 0 && !isLoading && (
                <div className={`p-3 rounded-lg mb-4 ${isDark ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-yellow-50 border border-yellow-200"}`}>
                  <p className={`text-xs sm:text-sm ${isDark ? "text-yellow-300" : "text-yellow-700"}`}>
                    ⏳ Please wait {cooldownRemaining} seconds before generating new tips to avoid rate limits.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4 mb-4 sm:mb-5 lg:mb-6">
                {tips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-3 sm:p-3.5 lg:p-4 rounded-lg lg:rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"} border ${isDark ? "border-gray-700" : "border-gray-200"} hover:shadow-lg transition-all`}
                  >
                    <div className="flex items-start gap-2 sm:gap-2.5 lg:gap-3">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{tip.icon}</span>
                      <div className="min-w-0">
                        <h4 className={`font-semibold text-xs sm:text-sm lg:text-base mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                          {tip.title}
                        </h4>
                        <p className={`text-[11px] sm:text-xs lg:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} leading-relaxed`}>
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className={`flex-1 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg lg:rounded-xl border-2 font-semibold transition-all ${
                  isDark
                    ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Close
              </button>
              <button
                onClick={handleRegenerateTips}
                disabled={isLoading || cooldownRemaining > 0}
                className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg lg:rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : cooldownRemaining > 0 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Wait {cooldownRemaining}s</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Tips</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}