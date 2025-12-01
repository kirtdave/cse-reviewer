// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDashboardStats } from '../../services/adminApi';

const Dashboard = ({ palette }) => {
  const { isDark, cardBg, textColor, secondaryText, borderColor, successColor, warningColor, primaryGradientFrom, primaryGradientTo } = palette;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalQuestions: 0,
    aiRequests: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      
      setStats(data.stats);
      setRecentActivity(data.recentActivity);
      setDailyActivity(data.dailyActivity || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl mb-4" style={{ color: primaryGradientFrom }}></i>
          <p style={{ color: secondaryText }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-3 text-red-500">
          <i className="fas fa-exclamation-circle text-2xl"></i>
          <div>
            <p className="font-semibold">Error Loading Dashboard</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const statsCards = [
    { label: "Total Users", value: stats.totalUsers.toString(), change: "+12%", icon: "fa-users", color: primaryGradientFrom },
    { label: "Active Today", value: stats.activeUsers.toString(), change: "+8%", icon: "fa-user-check", color: successColor },
    { label: "Total Questions", value: stats.totalQuestions.toString(), change: "+24", icon: "fa-clipboard-list", color: primaryGradientTo },
    { label: "AI Requests", value: stats.aiRequests.toLocaleString(), change: "+156", icon: "fa-brain", color: successColor },
  ];

  const getChartHeights = () => {
    if (dailyActivity.length === 0) {
      return [65, 78, 82, 70, 88, 95, 90];
    }
    
    const counts = dailyActivity.slice(-7).map(d => d.count);
    const max = Math.max(...counts, 1);
    return counts.map(count => Math.max(30, (count / max) * 100));
  };

  const chartHeights = getChartHeights();
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                <i className={`fas ${stat.icon} text-xl`} style={{ color: stat.color }}></i>
              </div>
              <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: `${successColor}20`, color: successColor }}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold mb-1" style={{ color: textColor }}>{stat.value}</h3>
            <p className="text-sm" style={{ color: secondaryText }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <div className="p-6 rounded-2xl" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)" }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: textColor }}>User Activity (7 Days)</h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {chartHeights.map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg transition-all hover:opacity-80" style={{ height: `${height}%`, background: `linear-gradient(to top, ${primaryGradientFrom}, ${primaryGradientTo})` }} />
                <span className="text-xs" style={{ color: secondaryText }}>{dayLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-6 rounded-2xl" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)" }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: textColor }}>Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-center py-8" style={{ color: secondaryText }}>No recent activity</p>
            ) : (
              recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${activity.color}20` }}>
                    <i className={`fas ${activity.icon} text-sm`} style={{ color: activity.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: textColor }}>{activity.user}</p>
                    <p className="text-xs truncate" style={{ color: secondaryText }}>{activity.action}</p>
                  </div>
                  <span className="text-xs whitespace-nowrap" style={{ color: secondaryText }}>{activity.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI API Performance */}
      <div className="p-6 rounded-2xl" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})` }}>
            <i className="fas fa-brain text-white"></i>
          </div>
          <h3 className="text-lg font-bold" style={{ color: textColor }}>AI API Performance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
            <div className="text-2xl font-bold mb-1" style={{ color: successColor }}>{stats.aiRequests.toLocaleString()}</div>
            <div className="text-sm" style={{ color: secondaryText }}>Total API Requests</div>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
            <div className="text-2xl font-bold mb-1" style={{ color: primaryGradientFrom }}>{stats.totalQuestions.toLocaleString()}</div>
            <div className="text-sm" style={{ color: secondaryText }}>Questions Generated</div>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
            <div className="text-2xl font-bold mb-1" style={{ color: primaryGradientTo }}>98.5%</div>
            <div className="text-sm" style={{ color: secondaryText }}>Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;