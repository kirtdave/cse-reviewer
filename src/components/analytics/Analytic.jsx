import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnalyticsHeader from "./AnalyticsHeader";
import AnalyticsKPI from "./AnalyticsKPI";
import AnalyticsCharts from "./AnalyticsCharts";
import AnalyticsRecommendations from "./AnalyticsRecommendations";
import AIEnhancedFeatures from "./Aiprocess";
import { 
  getAnalyticsData, 
  calculateStrengthsWeaknesses,
  generateRecommendations,
  calculateReadiness 
} from "../../services/analyticsService";

export default function Analytics({ theme = "light" }) {
  const isDark = theme === "dark";
  
  // State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fetch analytics data on mount
  useEffect(() => {
    checkAuthAndFetchAnalytics();
  }, []);

  const checkAuthAndFetchAnalytics = async () => {
    setLoading(true);

    // Check if user is logged in
    const token = localStorage.getItem('token');
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn && !!token);

    if (loggedIn && token) {
      // Logged-in user: Try to fetch real data
      try {
        console.log('📊 Fetching analytics data...');
        const data = await getAnalyticsData();
        
        console.log('✅ Raw analytics data received:', data);
        console.log('📊 Time Metrics from API:', data.timeMetrics);
        
        // ✅ FIX: DON'T recalculate timeMetrics - use what came from getAnalyticsData()
        // The timeMetrics from getAnalyticsData() already includes deleted tests!
        const strengthsWeaknesses = calculateStrengthsWeaknesses(data.sections);
        const recommendations = generateRecommendations(data);
        const readiness = calculateReadiness(data);

        const enrichedData = {
          ...data,
          // timeMetrics is already in data from getAnalyticsData() ✅
          strengthsWeaknesses,
          recommendations,
          readiness
        };

        console.log('✅ Enriched analytics data:', enrichedData);
        console.log('✅ Final Time Metrics:', enrichedData.timeMetrics);
        setAnalyticsData(enrichedData);

      } catch (err) {
        console.error('❌ Error loading analytics:', err);
        // If error (like 401), show empty data instead of error
        setAnalyticsData(getEmptyAnalyticsData());
      }
    } else {
      // Guest user: Show empty analytics
      console.log('👤 Guest user - showing empty analytics');
      setAnalyticsData(getEmptyAnalyticsData());
    }

    setLoading(false);
  };

  // Generate empty analytics data structure
  const getEmptyAnalyticsData = () => ({
    totalExams: 0,
    avgScore: 0,
    accuracy: 0,
    sections: {
      verbal: 0,
      numerical: 0,
      analytical: 0,
      generalInfo: 0,
      clerical: 0,
      numericalReasoning: 0,
      constitution: 0
    },
    trend: [],
    recentAttempts: [],
    timeMetrics: {
      avgTimePerQuestion: 0,
      speedScore: 0,
      consistency: 0
    },
    strengthsWeaknesses: [
      { label: "Verbal Ability", value: 0, type: "neutral", gradient: "from-gray-500 to-gray-600" },
      { label: "Numerical Ability", value: 0, type: "neutral", gradient: "from-gray-500 to-gray-600" },
      { label: "Analytical Ability", value: 0, type: "neutral", gradient: "from-gray-500 to-gray-600" },
      { label: "General Knowledge", value: 0, type: "neutral", gradient: "from-gray-500 to-gray-600" },
      { label: "Clerical Ability", value: 0, type: "neutral", gradient: "from-gray-500 to-gray-600" },
      { label: "Philippine Constitution", value: 0, type: "neutral", gradient: "from-gray-500 to-gray-600" },
    ],
    recommendations: [
      { 
        icon: "fa-info-circle", 
        text: isLoggedIn 
          ? "Complete your first test to unlock personalized AI recommendations." 
          : "Login and complete tests to unlock personalized AI recommendations.", 
        color: "from-blue-500 to-purple-500", 
        insight: "No data available yet" 
      }
    ],
    readiness: 0
  });

  // Loading State
  if (loading) {
    return (
      <main className={`min-h-screen ${isDark ? "text-gray-100 bg-[#000F08]" : "text-gray-900 bg-[#FBFFFE]"}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Loading analytics...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen ${isDark ? "text-gray-100" : "text-gray-900"} font-sans relative transition-colors duration-500`}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(63,167,214,0.08)_1px,_transparent_1px)] bg-[size:40px_40px]"
        />
      </div>

      {/* Content with staggered mount animations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <AnalyticsHeader theme={theme} analyticsData={analyticsData} />
      </motion.div>
      
      <div className="relative z-10 p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <AnalyticsKPI theme={theme} data={analyticsData} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AIEnhancedFeatures theme={theme} data={analyticsData} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AnalyticsRecommendations theme={theme} data={analyticsData} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <AnalyticsCharts theme={theme} data={analyticsData} />
          </motion.div>
        </div>
      </div>
    </main>
  );
}