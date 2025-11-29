import React from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

const QuickActions = ({ theme = "light", data }) => {
  const isDark = theme === "dark";

  // ✅ FIXED: Reverse trend data to show oldest → newest (correct progression)
  const getTrendData = () => {
    if (!data?.trend || data.trend.length === 0) {
      return [];
    }

    const reversed = [...data.trend].reverse();
    
    return reversed.slice(-7).map((item, index) => ({
      ...item,
      exam: `Mock ${index + 1}`
    }));
  };

  const trendData = getTrendData();
  
  const latestScore = trendData.length > 0 ? trendData[trendData.length - 1]?.score || 0 : 0;
  const previousScore = trendData.length > 1 ? trendData[trendData.length - 2]?.score || 0 : 0;
  const scoreDiff = latestScore - previousScore;
  const isImproving = scoreDiff > 0;

  // ✅ FIXED: Calculate consecutive days streak using MOCK EXAM attempts
  const calculateStudyStreak = () => {
    if (!data?.recentAttempts || data.recentAttempts.length === 0) {
      console.log('⚠️ No recent attempts found');
      return 0;
    }

    console.log('🔍 Calculating streak from attempts:', data.recentAttempts);

    // Get unique dates (in YYYY-MM-DD format) from attempts
    const attemptDates = data.recentAttempts
      .map(attempt => {
        const dateStr = attempt.date;
        const parsedDate = new Date(dateStr);
        
        // Format as YYYY-MM-DD for comparison
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      })
      .filter((date, index, self) => self.indexOf(date) === index) // Remove duplicates
      .sort((a, b) => new Date(b) - new Date(a)); // Sort newest first

    console.log('📅 Unique attempt dates:', attemptDates);

    if (attemptDates.length === 0) return 0;

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    console.log('📅 Today is:', todayStr);

    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    console.log('📅 Yesterday was:', yesterdayStr);

    // ✅ FIX: Streak should start from today OR yesterday
    let streak = 0;
    let checkDate = new Date(today);
    
    // Start checking from today, going backwards
    for (let i = 0; i < attemptDates.length + 1; i++) {
      const checkDateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      
      if (attemptDates.includes(checkDateStr)) {
        // Found a test on this date
        streak++;
        console.log(`✅ Found test on ${checkDateStr}, streak now: ${streak}`);
      } else if (streak > 0) {
        // Gap found after we started counting, break the streak
        console.log(`❌ No test on ${checkDateStr}, breaking streak`);
        break;
      } else if (i === 1) {
        // If we didn't find a test today OR yesterday, streak is 0
        console.log('❌ No test today or yesterday, streak = 0');
        break;
      }
      
      // Move to previous day
      checkDate.setDate(checkDate.getDate() - 1);
    }

    console.log('🔥 Calculated streak:', streak, 'days');
    return streak;
  };

  const studyStreak = calculateStudyStreak();

  // ✅ Dynamic color based on streak length with THEME SUPPORT
  const getStreakColor = () => {
    if (isDark) {
      // Dark mode - darker, muted gradients
      if (studyStreak === 0) return "from-gray-700 via-gray-800 to-gray-900";
      if (studyStreak < 3) return "from-blue-700 via-cyan-700 to-teal-700";
      if (studyStreak < 7) return "from-green-700 via-emerald-700 to-teal-700";
      if (studyStreak < 14) return "from-orange-700 via-amber-700 to-yellow-700";
      if (studyStreak < 30) return "from-orange-700 via-red-700 to-pink-700";
      return "from-purple-700 via-pink-700 to-red-700";
    } else {
      // Light mode - bright, vibrant gradients
      if (studyStreak === 0) return "from-gray-400 via-gray-500 to-gray-600";
      if (studyStreak < 3) return "from-blue-400 via-cyan-500 to-teal-500";
      if (studyStreak < 7) return "from-green-400 via-emerald-500 to-teal-600";
      if (studyStreak < 14) return "from-orange-400 via-amber-500 to-yellow-500";
      if (studyStreak < 30) return "from-orange-500 via-red-500 to-pink-500";
      return "from-purple-500 via-pink-500 to-red-500";
    }
  };

  const getStreakMessage = () => {
    if (studyStreak === 0) return "Start your first test today! 🚀";
    if (studyStreak === 1) return "Great start! Come back tomorrow! 💪";
    if (studyStreak < 3) return "Building momentum! Keep it up! 🌟";
    if (studyStreak < 7) return "You're on fire! Don't break the streak! 🔥";
    if (studyStreak < 14) return "Incredible dedication! You're unstoppable! ⚡";
    if (studyStreak < 30) return "Master level! You're crushing it! 🏆";
    return "LEGENDARY STREAK! You're a champion! 👑🔥";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-3 rounded-lg shadow-lg border`}>
          <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            {payload[0].payload.date}
          </p>
          <p className="text-sm text-blue-500 font-bold">
            Score: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Study Streak Card - Gamified Design with THEME SUPPORT */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-br ${getStreakColor()} rounded-2xl shadow-2xl p-5 py-2 ${
          isDark ? 'text-gray-100' : 'text-white'
        } relative overflow-hidden border-2 ${isDark ? 'border-gray-700/50' : 'border-white/20'}`}
      >
        {/* Animated Background Pattern */}
        <div className={`absolute inset-0 ${isDark ? 'opacity-5' : 'opacity-10'}`}>
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle, ${isDark ? 'white' : 'white'} 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        {/* Floating Particles */}
        {studyStreak > 0 && (
          <>
            <motion.div
              className={`absolute top-3 right-6 text-xl ${isDark ? 'opacity-40' : 'opacity-60'}`}
              animate={{ 
                y: [-15, -30, -15],
                opacity: isDark ? [0.4, 0.2, 0.4] : [0.6, 0.3, 0.6],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 0 }}
            >✨</motion.div>
            <motion.div
              className={`absolute top-10 right-16 text-lg ${isDark ? 'opacity-40' : 'opacity-60'}`}
              animate={{ 
                y: [-12, -28, -12],
                opacity: isDark ? [0.3, 0.15, 0.3] : [0.5, 0.2, 0.5],
                scale: [1, 1.3, 1]
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            >⭐</motion.div>
            <motion.div
              className={`absolute top-16 right-8 text-xl ${isDark ? 'opacity-40' : 'opacity-60'}`}
              animate={{ 
                y: [-8, -24, -8],
                opacity: isDark ? [0.4, 0.2, 0.4] : [0.6, 0.3, 0.6],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2.8, repeat: Infinity, delay: 1 }}
            >💫</motion.div>
          </>
        )}

        {/* Large Flame Icon with Glow */}
        <motion.div 
          className={`absolute -top-2 -right-2 text-8xl ${isDark ? 'opacity-15' : 'opacity-20'}`}
          animate={{ 
            scale: studyStreak >= 7 ? [1, 1.1, 1] : 1,
            rotate: studyStreak >= 14 ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <i className="fa-solid fa-fire drop-shadow-2xl"></i>
        </motion.div>
        
        <div className="relative z-10 flex flex-col">
          {/* Header with Animated Icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                className="relative"
                animate={{ 
                  scale: studyStreak >= 7 ? [1, 1.15, 1] : 1,
                  rotate: studyStreak >= 14 ? [0, 12, -12, 0] : 0
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <i className="fa-solid fa-fire text-2xl drop-shadow-lg"></i>
                {studyStreak >= 7 && (
                  <motion.div
                    className={`absolute -inset-2 ${
                      isDark ? 'bg-orange-400/20' : 'bg-white/30'
                    } rounded-full blur-xl`}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  ></motion.div>
                )}
              </motion.div>
              <div>
                <h3 className="text-lg font-bold drop-shadow-md">Study Streak</h3>
                {studyStreak >= 7 && (
                  <p className="text-[10px] font-semibold opacity-90">🔥 ON FIRE!</p>
                )}
              </div>
            </div>
            
            {/* Level Badge */}
            {studyStreak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, rotate: { duration: 2, repeat: Infinity } }}
                className={`${
                  isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-white/30 border-white/40'
                } backdrop-blur-sm px-3 py-1 rounded-full border-2 shadow-lg`}
              >
                <span className="text-xs font-bold">
                  {studyStreak < 3 ? "🌱 Beginner" :
                   studyStreak < 7 ? "🌟 Rising" :
                   studyStreak < 14 ? "🔥 Hot" :
                   studyStreak < 30 ? "⚡ Elite" :
                   "👑 Legend"}
                </span>
              </motion.div>
            )}
          </div>

          {/* Main Counter with 3D Effect */}
          <motion.div 
            className="flex items-baseline gap-2 mb-1"
            animate={studyStreak >= 14 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="relative">
              <p className="text-5xl font-black drop-shadow-2xl" style={{
                textShadow: isDark 
                  ? '3px 3px 0px rgba(0,0,0,0.4), 2px 2px 0px rgba(0,0,0,0.3)'
                  : '3px 3px 0px rgba(0,0,0,0.2), 2px 2px 0px rgba(0,0,0,0.1)'
              }}>
                {studyStreak}
              </p>
              {studyStreak >= 30 && (
                <motion.div
                  className={`absolute -inset-3 ${
                    isDark ? 'bg-yellow-500/20' : 'bg-yellow-300/30'
                  } rounded-full blur-2xl`}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                ></motion.div>
              )}
            </div>
            <div>
              <p className="text-xl font-bold opacity-95 drop-shadow-md">
                {studyStreak === 1 ? 'Day' : 'Days'}
              </p>
              {studyStreak > 0 && (
                <motion.p 
                  className="text-[10px] font-semibold opacity-80"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Keep going! 💪
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Message */}
          <p className="text-xs font-medium opacity-90 drop-shadow-md">
            {getStreakMessage()}
          </p>

          {/* Progress Bar to Next Milestone */}
          {studyStreak > 0 && studyStreak < 30 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs opacity-90 mb-1">
                <span className="font-semibold">Next Milestone</span>
                <span className="font-bold">
                  {studyStreak < 3 ? `${3 - studyStreak} days to 🌟` :
                   studyStreak < 7 ? `${7 - studyStreak} days to 🔥` :
                   studyStreak < 14 ? `${14 - studyStreak} days to ⚡` :
                   `${30 - studyStreak} days to 🏆`}
                </span>
              </div>
              <div className={`h-2 ${
                isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-white/20 border-white/30'
              } rounded-full overflow-hidden backdrop-blur-sm border`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${
                      studyStreak < 3 ? (studyStreak / 3) * 100 :
                      studyStreak < 7 ? ((studyStreak - 3) / 4) * 100 :
                      studyStreak < 14 ? ((studyStreak - 7) / 7) * 100 :
                      ((studyStreak - 14) / 16) * 100
                    }%`
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full ${isDark ? 'bg-gray-300' : 'bg-white'} shadow-lg`}
                  style={{
                    boxShadow: isDark 
                      ? '0 0 10px rgba(200,200,200,0.5)'
                      : '0 0 10px rgba(255,255,255,0.8)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Legendary Status */}
          {studyStreak >= 30 && (
            <motion.div
              className={`mt-auto text-center py-2 ${
                isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-white/20 border-white/40'
              } backdrop-blur-sm rounded-lg border`}
              animate={{ 
                boxShadow: isDark ? [
                  '0 0 20px rgba(200,200,200,0.2)',
                  '0 0 40px rgba(200,200,200,0.4)',
                  '0 0 20px rgba(200,200,200,0.2)'
                ] : [
                  '0 0 20px rgba(255,255,255,0.3)',
                  '0 0 40px rgba(255,255,255,0.6)',
                  '0 0 20px rgba(255,255,255,0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-sm font-bold">👑 LEGENDARY STATUS ACHIEVED! 👑</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Performance Trend Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${isDark ? "bg-gray-900/60" : "bg-white"} backdrop-blur-xl rounded-2xl shadow-lg p-6 pt-2 pb-1 border ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-lg font-bold flex items-center ${isDark ? "text-white" : "text-gray-900"}`}>
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              Performance Trend
            </h2>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} mt-1`}>
              Last {trendData.length} mock exam scores
            </p>
          </div>
          
          {/* Score Change Indicator */}
          {trendData.length > 1 && (
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
              isImproving 
                ? "bg-green-500/20 text-green-500" 
                : scoreDiff === 0
                ? "bg-gray-500/20 text-gray-500"
                : "bg-red-500/20 text-red-500"
            }`}>
              <i className={`fa-solid ${isImproving ? "fa-arrow-up" : scoreDiff === 0 ? "fa-minus" : "fa-arrow-down"} text-xs`}></i>
              <span className="text-sm font-bold">{Math.abs(scoreDiff)}%</span>
            </div>
          )}
        </div>

        {/* Chart or Empty State */}
        {trendData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDark ? "#374151" : "#E5E7EB"} 
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: isDark ? "#374151" : "#E5E7EB" }}
                />
                <YAxis 
                  tick={{ fill: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: isDark ? "#374151" : "#E5E7EB" }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fill="url(#colorScore)"
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#3B82F6" }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Quick Stats Below Chart */}
            <div className="grid grid-cols-3 gap-3 mt-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center pb-1">
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Latest</p>
                <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {latestScore}%
                </p>
              </div>
              <div className="text-center">
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Average</p>
                <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {Math.round(trendData.reduce((sum, item) => sum + item.score, 0) / trendData.length)}%
                </p>
              </div>
              <div className="text-center">
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Peak</p>
                <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {Math.max(...trendData.map(item => item.score))}%
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-center">
            <i className={`fa-solid fa-chart-line text-5xl mb-4 ${isDark ? "text-gray-700" : "text-gray-300"}`}></i>
            <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              No performance data yet
            </p>
            <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"} mt-1`}>
              Take your first mock exam to see your progress!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default QuickActions;