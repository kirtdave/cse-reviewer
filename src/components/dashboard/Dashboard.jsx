import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import QuickStats from "./QuickStats";
import QuickActions from "./QuickActions";
import DashboardHeader from "./DashboardHeader";
import QuestionBankStats from "./QuestionBankStats";
import { SmartRecommendations } from "./AIRecommendations";
import { 
  getAnalyticsData, 
  calculateTimeMetrics, 
  calculateStrengthsWeaknesses,
  generateRecommendations,
  calculateReadiness 
} from "../../services/analyticsService";

export default function Dashboard({ theme = "light" }) {
  const isDark = theme === "dark";
  
  // State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Question bank stats
  const questionStats = [
    { name: "Mastered", value: 320 },
    { name: "Learning", value: 280 },
    { name: "Needs Review", value: 240 },
    { name: "Bookmarked", value: 160 },
  ];

  // Fetch analytics data on mount
  useEffect(() => {
    checkAuthAndFetchData();

    // ✅ Listen for login/logout/update events
    const handleUserChange = () => {
      console.log('🔄 User state changed, reloading dashboard...');
      checkAuthAndFetchData();
    };

    window.addEventListener('userLoggedIn', handleUserChange);
    window.addEventListener('userUpdated', handleUserChange);
    window.addEventListener('storage', handleUserChange);

    // Cleanup
    return () => {
      window.removeEventListener('userLoggedIn', handleUserChange);
      window.removeEventListener('userUpdated', handleUserChange);
      window.removeEventListener('storage', handleUserChange);
    };
  }, []);

  const checkAuthAndFetchData = async () => {
    setLoading(true);

    // Check if user is logged in
    const token = localStorage.getItem('token');
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn && !!token);

    if (loggedIn && token) {
      // Logged-in user: Try to fetch real data
      try {
        console.log('📊 Fetching dashboard data for logged-in user...');
        const data = await getAnalyticsData();
        
        // Calculate additional metrics
        const timeMetrics = calculateTimeMetrics(data.recentAttempts);
        const strengthsWeaknesses = calculateStrengthsWeaknesses(data.sections);
        const recommendations = generateRecommendations(data);
        const readiness = calculateReadiness(data);

        setAnalyticsData({
          ...data,
          timeMetrics,
          strengthsWeaknesses,
          recommendations,
          readiness
        });

        console.log('✅ Dashboard data loaded successfully');

      } catch (err) {
        console.error('❌ Error loading dashboard data:', err);
        // If error, show empty data
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
      general: 0
    },
    trend: [],
    recentAttempts: [],
    timeMetrics: {
      avgTimePerQuestion: 0,
      speedScore: 0,
      consistency: 0
    },
    strengthsWeaknesses: [],
    recommendations: [],
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
              Loading dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen ${isDark ? "text-gray-100" : "text-gray-900"} relative transition-colors duration-500`}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(63,167,214,0.08)_1px,_transparent_1px)] bg-[size:40px_40px]"
        />
      </div>

      {/* Header - Mount animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <DashboardHeader theme={theme} />
      </motion.div>
      
      <div className="relative z-10 p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          {/* QuickStats - Staggered animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <QuickStats data={analyticsData} theme={theme} />
          </motion.div>

          {/* Question Bank & Quick Actions - Staggered animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuestionBankStats questionStats={questionStats} theme={theme} />
              <QuickActions theme={theme} data={analyticsData} />
            </div>
          </motion.div>

          {/* Smart Recommendations - Staggered animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <SmartRecommendations theme={theme} data={analyticsData} />
          </motion.div>
        </div>
      </div>
    </main>
  );
}