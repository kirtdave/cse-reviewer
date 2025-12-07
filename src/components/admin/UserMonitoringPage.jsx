// UserMonitoringPage.jsx - Mobile Responsive Version
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getUsers, getUserById } from "../../services/adminApi";

export default function UserMonitoringPage({ palette }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, successColor, errorColor, warningColor } = palette;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filterStatus, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: filterStatus
      });
      
      setUsers(data.users);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (user) => {
    try {
      const { user: fullUser } = await getUserById(user.id);
      setSelectedUser({ ...user, ...fullUser });
    } catch (error) {
      console.error('Error fetching user details:', error);
      setSelectedUser(user);
    }
  };

  const getStatusColor = (status) => {
    return status === "Active" ? successColor : secondaryText;
  };

  const getScoreColor = (score) => {
    if (score >= 85) return successColor;
    if (score >= 70) return warningColor;
    return errorColor;
  };

  const getApiRateColor = (rate) => {
    if (rate >= 98) return successColor;
    if (rate >= 95) return warningColor;
    return errorColor;
  };

  const formatLastActive = (lastActive, status) => {
    if (status === 'Active') {
      if (lastActive.includes('minute') || lastActive.includes('Just now') || lastActive.includes('second')) {
        return { text: 'Online', color: successColor, dot: true };
      }
    }
    return { text: lastActive, color: secondaryText, dot: false };
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const totalAiRequests = users.reduce((sum, u) => sum + (u.aiRequests || 0), 0);
  const avgSuccessRate = users.length > 0 
    ? (users.reduce((sum, u) => sum + (u.apiSuccessRate || 0), 0) / users.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Users", value: pagination.total.toString(), icon: "fa-users", color: primaryGradientFrom },
          { label: "Active Users", value: activeUsers.toString(), icon: "fa-user-check", color: successColor },
          { label: "Total AI Requests", value: totalAiRequests.toLocaleString(), icon: "fa-brain", color: primaryGradientTo },
          { label: "Avg API Success", value: `${avgSuccessRate}%`, icon: "fa-check-circle", color: successColor },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 sm:p-6 rounded-2xl"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <i className={`fas ${stat.icon} text-lg sm:text-xl`} style={{ color: stat.color }}></i>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: textColor }}>{stat.value}</h3>
            <p className="text-xs sm:text-sm truncate" style={{ color: secondaryText }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="p-4 sm:p-6 rounded-2xl"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="text-xs sm:text-sm font-semibold mb-2 block" style={{ color: textColor }}>Search Users</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border outline-none text-sm"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                borderColor,
                color: textColor,
              }}
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-semibold mb-2 block" style={{ color: textColor }}>Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border outline-none text-sm"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                borderColor,
                color: textColor,
              }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table - Mobile Cards / Desktop Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <i className="fas fa-spinner fa-spin text-2xl sm:text-3xl" style={{ color: primaryGradientFrom }}></i>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {users.map((user) => {
              const lastActiveInfo = formatLastActive(user.lastActive, user.status);
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl"
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                      <img 
                        src={user.avatar || 'https://i.pravatar.cc/200?img=1'} 
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/20"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://i.pravatar.cc/200?img=1';
                        }}
                      />
                      {lastActiveInfo.dot && (
                        <span 
                          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                          style={{ 
                            backgroundColor: successColor,
                            borderColor: cardBg
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: textColor }}>{user.name}</p>
                      <p className="text-xs truncate" style={{ color: secondaryText }}>{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: `${getStatusColor(user.status)}20`,
                            color: getStatusColor(user.status),
                          }}
                        >
                          {user.status}
                        </span>
                        {lastActiveInfo.dot && (
                          <span className="text-xs font-bold" style={{ color: successColor }}>● Online</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs mb-1" style={{ color: secondaryText }}>AI Requests</p>
                      <p className="font-bold text-sm" style={{ color: textColor }}>{user.aiRequests || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: secondaryText }}>Success Rate</p>
                      <p className="font-bold text-sm" style={{ color: getApiRateColor(user.apiSuccessRate || 0) }}>
                        {user.apiSuccessRate || 0}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: lastActiveInfo.color }}>
                      {lastActiveInfo.text}
                    </p>
                    <button
                      onClick={() => handleViewUser(user)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{
                        backgroundColor: `${primaryGradientFrom}20`,
                        color: primaryGradientFrom,
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div
            className="hidden lg:block rounded-2xl overflow-hidden"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: textColor }}>User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: textColor }}>Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: textColor }}>AI Requests</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: textColor }}>Success Rate</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: textColor }}>Last Active</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: textColor }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const lastActiveInfo = formatLastActive(user.lastActive, user.status);
                    return (
                      <tr key={user.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img 
                                src={user.avatar || 'https://i.pravatar.cc/200?img=1'} 
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/20"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://i.pravatar.cc/200?img=1';
                                }}
                              />
                              {lastActiveInfo.dot && (
                                <span 
                                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                                  style={{ 
                                    backgroundColor: successColor,
                                    borderColor: cardBg
                                  }}
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold" style={{ color: textColor }}>{user.name}</p>
                              <p className="text-sm" style={{ color: secondaryText }}>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: `${getStatusColor(user.status)}20`,
                              color: getStatusColor(user.status),
                            }}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <i className="fas fa-brain text-sm" style={{ color: primaryGradientFrom }}></i>
                            <span className="font-semibold" style={{ color: textColor }}>{user.aiRequests || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="font-bold"
                            style={{ color: getApiRateColor(user.apiSuccessRate || 0) }}
                          >
                            {user.apiSuccessRate || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {lastActiveInfo.dot && (
                              <span 
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: successColor }}
                              />
                            )}
                            <p className="text-sm font-medium" style={{ color: lastActiveInfo.color }}>
                              {lastActiveInfo.text}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{
                              backgroundColor: `${primaryGradientFrom}20`,
                              color: primaryGradientFrom,
                            }}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                  style={{
                    backgroundColor: `${primaryGradientFrom}20`,
                    color: primaryGradientFrom
                  }}
                >
                  Previous
                </button>
                <span style={{ color: textColor }}>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                  style={{
                    backgroundColor: `${primaryGradientFrom}20`,
                    color: primaryGradientFrom
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Mobile Pagination */}
          {pagination.pages > 1 && (
            <div className="lg:hidden flex items-center justify-between gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-3 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
                style={{
                  backgroundColor: `${primaryGradientFrom}20`,
                  color: primaryGradientFrom
                }}
              >
                Previous
              </button>
              <span className="text-xs" style={{ color: textColor }}>
                {pagination.page}/{pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
                style={{
                  backgroundColor: `${primaryGradientFrom}20`,
                  color: primaryGradientFrom
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedUser(null)}
        >
          <motion.div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6"
            style={{ backgroundColor: cardBg }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-2xl font-bold" style={{ color: textColor }}>User Details & API Usage</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
              >
                <i className="fas fa-times" style={{ color: textColor }}></i>
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <img 
                    src={selectedUser.avatar || 'https://i.pravatar.cc/200?img=1'} 
                    alt={selectedUser.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-blue-500/20"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://i.pravatar.cc/200?img=1';
                    }}
                  />
                  {formatLastActive(selectedUser.lastActive, selectedUser.status).dot && (
                    <span 
                      className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-4 animate-pulse"
                      style={{ 
                        backgroundColor: successColor,
                        borderColor: cardBg
                      }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg sm:text-xl font-bold truncate" style={{ color: textColor }}>{selectedUser.name}</h4>
                  <p className="text-sm truncate" style={{ color: secondaryText }}>{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${getStatusColor(selectedUser.status)}20`,
                        color: getStatusColor(selectedUser.status),
                      }}
                    >
                      {selectedUser.status}
                    </span>
                    {formatLastActive(selectedUser.lastActive, selectedUser.status).dot && (
                      <span className="text-xs font-bold" style={{ color: successColor }}>● Online</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2" style={{ color: textColor }}>
                  <i className="fas fa-brain" style={{ color: primaryGradientFrom }}></i>
                  AI API Usage Statistics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div
                    className="p-3 sm:p-4 rounded-xl"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                  >
                    <p className="text-xs mb-1" style={{ color: secondaryText }}>Total AI Requests</p>
                    <p className="text-lg sm:text-2xl font-bold" style={{ color: primaryGradientFrom }}>{selectedUser.aiRequests || 0}</p>
                  </div>
                  <div
                    className="p-3 sm:p-4 rounded-xl"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                  >
                    <p className="text-xs mb-1" style={{ color: secondaryText }}>Questions Generated</p>
                    <p className="text-lg sm:text-2xl font-bold" style={{ color: primaryGradientTo }}>{selectedUser.questionsGenerated || 0}</p>
                  </div>
                  <div
                    className="p-3 sm:p-4 rounded-xl"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                  >
                    <p className="text-xs mb-1" style={{ color: secondaryText }}>Success Rate</p>
                    <p className="text-lg sm:text-2xl font-bold" style={{ color: getApiRateColor(selectedUser.apiSuccessRate || 0) }}>
                      {selectedUser.apiSuccessRate || 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2" style={{ color: textColor }}>
                  <i className="fas fa-chart-line" style={{ color: successColor }}></i>
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div
                    className="p-3 sm:p-4 rounded-xl"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                  >
                    <p className="text-xs mb-1" style={{ color: secondaryText }}>Tests Completed</p>
                    <p className="text-lg sm:text-2xl font-bold" style={{ color: textColor }}>{selectedUser.testsCompleted || 0}</p>
                  </div>
                  <div
                    className="p-3 sm:p-4 rounded-xl"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                  >
                    <p className="text-xs mb-1" style={{ color: secondaryText }}>Average Score</p>
                    <p className="text-lg sm:text-2xl font-bold" style={{ color: getScoreColor(selectedUser.avgScore || 0) }}>
                      {selectedUser.avgScore || 0}%
                    </p>
                  </div>
                  <div
                    className="p-3 sm:p-4 rounded-xl"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                  >
                    <p className="text-xs mb-1" style={{ color: secondaryText }}>Member Since</p>
                    <p className="font-semibold text-sm" style={{ color: textColor }}>{selectedUser.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}