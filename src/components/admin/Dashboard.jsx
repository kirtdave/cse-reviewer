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
      
      console.log('📥 Raw API Response:', data);
      
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

  const getChartData = () => {
    if (dailyActivity.length === 0) {
      return [
        { count: 45, date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
        { count: 52, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { count: 61, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { count: 48, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { count: 70, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { count: 65, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { count: 78, date: new Date() },
      ];
    }
    
    return dailyActivity.slice(-7).map(d => ({
      count: d.count,
      date: new Date(d.date)
    }));
  };

  const chartData = getChartData();
  const maxCount = Math.max(...chartData.map(d => d.count), 1);
  const totalActivity = chartData.reduce((sum, d) => sum + d.count, 0);

  // Format date properly
  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()]
    };
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards - Compact Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl relative overflow-hidden group cursor-pointer"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = isDark 
                ? "0 6px 24px rgba(0,0,0,0.4)" 
                : "0 6px 24px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = isDark 
                ? "0 4px 16px rgba(0,0,0,0.3)" 
                : "0 4px 16px rgba(0,0,0,0.08)";
            }}
          >
            {/* Background gradient effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at top right, ${stat.color}08, transparent 70%)`
              }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110" 
                  style={{ 
                    background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                    border: `1px solid ${stat.color}30`
                  }}
                >
                  <i className={`fas ${stat.icon} text-lg`} style={{ color: stat.color }}></i>
                </div>
                <span 
                  className="text-xs font-bold px-2 py-1 rounded-full" 
                  style={{ 
                    backgroundColor: `${successColor}15`, 
                    color: successColor,
                    border: `1px solid ${successColor}30`
                  }}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1" style={{ color: textColor }}>{stat.value}</h3>
              <p className="text-xs font-medium" style={{ color: secondaryText }}>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart - PROFESSIONAL DESIGN */}
        <div className="p-6 rounded-2xl" style={{ 
          backgroundColor: cardBg, 
          border: `1px solid ${borderColor}`, 
          boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.06)" 
        }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold mb-1" style={{ color: textColor }}>User Activity</h3>
              <p className="text-sm" style={{ color: secondaryText }}>Last 7 days overview</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: primaryGradientFrom }}>{totalActivity}</div>
              <div className="text-xs" style={{ color: secondaryText }}>Total Users</div>
            </div>
          </div>
          
          <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', position: 'relative', paddingTop: '20px' }}>
            {/* Modern grid lines */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, pointerEvents: 'none' }}>
              {[0, 25, 50, 75, 100].map((percent) => (
                <div key={percent} style={{ 
                  position: 'absolute', 
                  bottom: `${percent}%`, 
                  width: '100%', 
                  height: '1px', 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
                  borderTop: percent === 0 ? `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : 'none'
                }} />
              ))}
            </div>
            
            {chartData.map((item, i) => {
              const heightPercent = (item.count / maxCount) * 100;
              const barHeight = Math.max((heightPercent / 100) * 200, 10);
              const formatted = formatDate(item.date);
              const isToday = item.date.toDateString() === new Date().toDateString();
              
              return (
                <div key={i} style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '16px', 
                  position: 'relative',
                  zIndex: 1
                }}>
                  {/* Hover tooltip */}
                  <div className="group relative" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div 
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute -top-12 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap z-50"
                      style={{ 
                        backgroundColor: isDark ? 'rgba(20,20,20,0.98)' : 'rgba(255,255,255,0.98)',
                        color: textColor,
                        border: `1px solid ${borderColor}`,
                        boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.15)'
                      }}
                    >
                      <div style={{ color: primaryGradientFrom, fontSize: '16px', fontWeight: 'bold' }}>{item.count}</div>
                      <div style={{ color: secondaryText, fontSize: '10px' }}>active users</div>
                    </div>
                    
                    {/* Modern bar with gradient */}
                    <div 
                      style={{ 
                        width: '100%',
                        height: `${barHeight}px`,
                        borderRadius: '6px 6px 0 0',
                        background: isToday 
                          ? `linear-gradient(180deg, ${primaryGradientTo}, ${primaryGradientFrom})`
                          : `linear-gradient(180deg, ${isDark ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.4)'}, ${isDark ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.4)'})`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                      }} 
                      className="hover:opacity-90"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scaleY(1.05) translateY(-2px)';
                        e.currentTarget.style.filter = 'brightness(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scaleY(1) translateY(0)';
                        e.currentTarget.style.filter = 'brightness(1)';
                      }}
                    >
                      {/* Shimmer effect */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        animation: 'shimmer 2s infinite'
                      }} />
                    </div>
                  </div>
                  
                  {/* Professional date labels */}
                  <div className="text-center" style={{ minWidth: '60px' }}>
                    <div className="text-xs font-bold mb-0.5" style={{ 
                      color: isToday ? primaryGradientFrom : textColor,
                      fontSize: '11px'
                    }}>
                      {formatted.day}
                    </div>
                    <div className="text-xs" style={{ 
                      color: secondaryText,
                      fontSize: '10px'
                    }}>
                      {formatted.month} {formatted.date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity - Compact & Scrollable */}
        <div className="p-5 rounded-2xl flex flex-col" style={{ 
          backgroundColor: cardBg, 
          border: `1px solid ${borderColor}`, 
          boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.06)",
          height: '400px' // Fixed height to match chart
        }}>
          <h3 className="text-base font-bold mb-4" style={{ color: textColor }}>Recent Activity</h3>
          
          {/* Scrollable container */}
          <div 
            className="flex-1 overflow-y-auto space-y-2 pr-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: `${isDark ? '#374151' : '#e5e7eb'} transparent`
            }}
          >
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-inbox text-3xl mb-2" style={{ color: secondaryText, opacity: 0.3 }}></i>
                <p className="text-sm" style={{ color: secondaryText }}>No recent activity</p>
              </div>
            ) : (
              recentActivity.map((activity, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-opacity-50" 
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" 
                    style={{ backgroundColor: `${activity.color}20` }}
                  >
                    <i className={`fas ${activity.icon} text-xs`} style={{ color: activity.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: textColor }}>{activity.user}</p>
                    <p className="text-xs truncate" style={{ color: secondaryText, opacity: 0.8 }}>{activity.action}</p>
                  </div>
                  <span className="text-xs whitespace-nowrap" style={{ color: secondaryText }}>{activity.time}</span>
                </div>
              ))
            )}
          </div>
          
          {/* Custom scrollbar styles */}
          <style>{`
            .overflow-y-auto::-webkit-scrollbar {
              width: 6px;
            }
            .overflow-y-auto::-webkit-scrollbar-track {
              background: transparent;
            }
            .overflow-y-auto::-webkit-scrollbar-thumb {
              background: ${isDark ? '#374151' : '#e5e7eb'};
              border-radius: 3px;
            }
            .overflow-y-auto::-webkit-scrollbar-thumb:hover {
              background: ${isDark ? '#4b5563' : '#d1d5db'};
            }
          `}</style>
        </div>
      </div>

      {/* AI API Performance - Compact Design */}
      <div className="p-5 rounded-xl relative overflow-hidden" style={{ 
        backgroundColor: cardBg, 
        border: `1px solid ${borderColor}`, 
        boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)"
      }}>
        {/* Animated background gradient */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 20% 50%, ${primaryGradientFrom}15, transparent 50%), radial-gradient(circle at 80% 50%, ${primaryGradientTo}15, transparent 50%)`
          }}
        />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center relative overflow-hidden" 
              style={{ 
                background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                boxShadow: isDark 
                  ? `0 4px 12px ${primaryGradientFrom}40` 
                  : `0 4px 12px ${primaryGradientFrom}30`
              }}
            >
              <i className="fas fa-brain text-white text-sm"></i>
              {/* Pulse effect */}
              <div 
                className="absolute inset-0 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: textColor }}>AI API Performance</h3>
              <p className="text-xs" style={{ color: secondaryText }}>Real-time analytics</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: stats.aiRequests.toLocaleString(), label: "API Requests", color: successColor, icon: "fa-server", trend: "+12.5%" },
              { value: stats.totalQuestions.toLocaleString(), label: "Questions", color: primaryGradientFrom, icon: "fa-comments", trend: "+8.3%" },
              { value: "98.5%", label: "Success Rate", color: primaryGradientTo, icon: "fa-check-circle", trend: "+2.1%" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="text-center p-4 rounded-lg relative overflow-hidden group cursor-pointer" 
                style={{ 
                  backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
                  e.currentTarget.style.borderColor = `${item.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
                }}
              >
                {/* Gradient overlay on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, ${item.color}08, transparent 70%)`
                  }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${item.color}15`,
                        border: `1px solid ${item.color}30`
                      }}
                    >
                      <i className={`fas ${item.icon} text-xs`} style={{ color: item.color }}></i>
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs font-medium mb-1.5" style={{ color: secondaryText }}>{item.label}</div>
                  <div 
                    className="text-xs font-semibold inline-block px-2 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: `${successColor}15`,
                      color: successColor,
                      border: `1px solid ${successColor}30`
                    }}
                  >
                    {item.trend}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;