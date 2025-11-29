// UserMonitoringPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function UserMonitoringPage({ palette }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, successColor, errorColor, warningColor } = palette;

  const [users] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "User",
      status: "Active",
      testsCompleted: 12,
      avgScore: 85,
      lastActive: "2 hours ago",
      joinDate: "Jan 15, 2024",
      aiRequests: 342,
      questionsGenerated: 127,
      apiSuccessRate: 98.5,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "User",
      status: "Active",
      testsCompleted: 8,
      avgScore: 92,
      lastActive: "1 day ago",
      joinDate: "Feb 3, 2024",
      aiRequests: 256,
      questionsGenerated: 89,
      apiSuccessRate: 99.2,
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "User",
      status: "Inactive",
      testsCompleted: 3,
      avgScore: 68,
      lastActive: "1 week ago",
      joinDate: "Mar 10, 2024",
      aiRequests: 78,
      questionsGenerated: 24,
      apiSuccessRate: 95.8,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: "2,847", icon: "fa-users", color: primaryGradientFrom },
          { label: "Active Users", value: "2,438", icon: "fa-user-check", color: successColor },
          { label: "Total AI Requests", value: "15.2K", icon: "fa-brain", color: primaryGradientTo },
          { label: "Avg API Success", value: "98.2%", icon: "fa-check-circle", color: successColor },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <i className={`fas ${stat.icon} text-xl`} style={{ color: stat.color }}></i>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: textColor }}>{stat.value}</h3>
            <p className="text-sm" style={{ color: secondaryText }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="p-6 rounded-2xl"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Search Users</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border outline-none"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                borderColor,
                color: textColor,
              }}
            />
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border outline-none"
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

      {/* Users Table */}
      <div
        className="rounded-2xl overflow-hidden"
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
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
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
                      <span className="font-semibold" style={{ color: textColor }}>{user.aiRequests}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="font-bold"
                      style={{ color: getApiRateColor(user.apiSuccessRate) }}
                    >
                      {user.apiSuccessRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm" style={{ color: secondaryText }}>{user.lastActive}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedUser(user)}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedUser(null)}
        >
          <motion.div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{ backgroundColor: cardBg }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold" style={{ color: textColor }}>User Details & API Usage</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
              >
                <i className="fas fa-times" style={{ color: textColor }}></i>
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold" style={{ color: textColor }}>{selectedUser.name}</h4>
                  <p style={{ color: secondaryText }}>{selectedUser.email}</p>
                  <span
                    className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${getStatusColor(selectedUser.status)}20`,
                      color: getStatusColor(selectedUser.status),
                    }}
                  >
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold mb-3" style={{ color: textColor }}>
                  <i className="fas fa-brain mr-2" style={{ color: primaryGradientFrom }}></i>
                  AI API Usage Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                  >
                    <p className="text-sm mb-1" style={{ color: secondaryText }}>Total AI Requests</p>
                    <p className="text-2xl font-bold" style={{ color: primaryGradientFrom }}>{selectedUser.aiRequests}</p>
                  </div>
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                  >
                    <p className="text-sm mb-1" style={{ color: secondaryText }}>Questions Generated</p>
                    <p className="text-2xl font-bold" style={{ color: primaryGradientTo }}>{selectedUser.questionsGenerated}</p>
                  </div>
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                  >
                    <p className="text-sm mb-1" style={{ color: secondaryText }}>Success Rate</p>
                    <p className="text-2xl font-bold" style={{ color: getApiRateColor(selectedUser.apiSuccessRate) }}>
                      {selectedUser.apiSuccessRate}%
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold mb-3" style={{ color: textColor }}>
                  <i className="fas fa-chart-line mr-2" style={{ color: successColor }}></i>
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                  >
                    <p className="text-sm mb-1" style={{ color: secondaryText }}>Tests Completed</p>
                    <p className="text-2xl font-bold" style={{ color: textColor }}>{selectedUser.testsCompleted}</p>
                  </div>
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                  >
                    <p className="text-sm mb-1" style={{ color: secondaryText }}>Average Score</p>
                    <p className="text-2xl font-bold" style={{ color: getScoreColor(selectedUser.avgScore) }}>
                      {selectedUser.avgScore}%
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                  >
                    <p className="text-sm mb-1" style={{ color: secondaryText }}>Member Since</p>
                    <p className="font-semibold" style={{ color: textColor }}>{selectedUser.joinDate}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 py-3 rounded-xl font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                    color: "#fff",
                  }}
                >
                  <i className="fas fa-envelope mr-2"></i>
                  Send Message
                </button>
                <button
                  className="px-6 py-3 rounded-xl font-semibold"
                  style={{
                    backgroundColor: `${errorColor}20`,
                    color: errorColor,
                  }}
                >
                  <i className="fas fa-ban mr-2"></i>
                  Suspend
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}