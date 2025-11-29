import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import UserMonitoringPage from "./UserMonitoringPage";
import QuestionBankPage from "./QuestionBankPage";
import QuestionReportsPage from "./QuestionReportsPage";
import MessagesPage from "./MessagesPage";
import NotificationsPage from "./NotificationsPage";
import ThemeToggleSwitch from "../aaGLOBAL/ThemeToggleSwitch"; // Import your actual component

const getPalette = (theme = "dark") => {
  const isDark = theme === "dark";
  return {
    isDark,
    bgColor: isDark ? "from-gray-900 via-gray-900 to-gray-900" : "from-blue-50 via-purple-50 to-pink-50",
    cardBg: isDark ? "#1e293b" : "#ffffff",
    sidebarBg: isDark ? "bg-gray-900/95" : "bg-white/95",
    textColor: isDark ? "#f1f5f9" : "#0f172a",
    secondaryText: isDark ? "#94a3b8" : "#64748b",
    accentColor: "#3b82f6",
    primaryGradientFrom: "#3b82f6",
    primaryGradientTo: "#8b5cf6",
    borderColor: isDark ? "#1f2937" : "#e5e7eb",
    successColor: "#10b981",
    warningColor: "#f59e0b",
    errorColor: "#ef4444",
    hoverBg: isDark ? "#1f2937" : "#f3f4f6",
  };
};

// Dashboard Component
const Dashboard = ({ palette }) => {
  const { isDark, cardBg, textColor, secondaryText, borderColor, successColor, warningColor, primaryGradientFrom, primaryGradientTo } = palette;

  const stats = [
    { label: "Total Users", value: "2,847", change: "+12%", icon: "fa-users", color: primaryGradientFrom },
    { label: "Active Today", value: "438", change: "+8%", icon: "fa-user-check", color: successColor },
    { label: "Total Questions", value: "1,247", change: "+24", icon: "fa-clipboard-list", color: primaryGradientTo },
    { label: "AI Requests", value: "15.2K", change: "+156", icon: "fa-brain", color: successColor },
  ];

  const recentActivity = [
    { user: "John Doe", action: "Completed Mock Exam #12", time: "5 min ago", icon: "fa-check-circle", color: successColor },
    { user: "Jane Smith", action: "Reported question error", time: "12 min ago", icon: "fa-exclamation-circle", color: warningColor },
    { user: "Admin", action: "Added 50 new questions", time: "1 hour ago", icon: "fa-plus-circle", color: primaryGradientTo },
    { user: "Mike Johnson", action: "Sent message to admin", time: "2 hours ago", icon: "fa-envelope", color: primaryGradientFrom },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
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
        <div className="p-6 rounded-2xl" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)" }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: textColor }}>User Activity (7 Days)</h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {[65, 78, 82, 70, 88, 95, 90].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg transition-all hover:opacity-80" style={{ height: `${height}%`, background: `linear-gradient(to top, ${primaryGradientFrom}, ${primaryGradientTo})` }} />
                <span className="text-xs" style={{ color: secondaryText }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)" }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: textColor }}>Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
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
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})` }}>
            <i className="fas fa-brain text-white"></i>
          </div>
          <h3 className="text-lg font-bold" style={{ color: textColor }}>AI API Performance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
            <div className="text-2xl font-bold mb-1" style={{ color: successColor }}>15,247</div>
            <div className="text-sm" style={{ color: secondaryText }}>Total API Requests</div>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
            <div className="text-2xl font-bold mb-1" style={{ color: primaryGradientFrom }}>1,247</div>
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

const AdminPanel = ({ theme: initialTheme = "dark" }) => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  
  // Get collapse state from localStorage or use default
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("adminSidebarCollapsed") === "true";
  });
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get theme from localStorage or use default
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("adminTheme") || initialTheme;
  });
  
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("adminTheme", newTheme); // Save to localStorage
  };

  const toggleSidebar = () => {
    const newCollapsed = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsed);
    localStorage.setItem("adminSidebarCollapsed", newCollapsed.toString()); // Save to localStorage
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Clear admin session
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      
      // Close mobile menu if open
      setIsMobileMenuOpen(false);
      
      // Navigate to home page
      navigate("/", { replace: true });
      
      // Reload to clear all state
      window.location.reload();
    }
  };

  const palette = getPalette(theme);
  const { isDark, bgColor, cardBg, sidebarBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, hoverBg, errorColor } = palette;

  const navItems = [
    { id: "dashboard", name: "Dashboard", icon: "fa-home", badge: null },
    { id: "users", name: "User Monitoring", icon: "fa-users", badge: "2.8K" },
    { id: "questions", name: "Question Bank", icon: "fa-clipboard-list", badge: "1.2K" },
    { id: "reports", name: "Question Reports", icon: "fa-flag", badge: "12" },
    { id: "messages", name: "Messages", icon: "fa-envelope", badge: "5" },
    { id: "notifications", name: "Notifications", icon: "fa-bell", badge: null },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard": return <Dashboard palette={palette} />;
      case "users": return <UserMonitoringPage palette={palette} />;
      case "questions": return <QuestionBankPage palette={palette} />;
      case "reports": return <QuestionReportsPage palette={palette} />;
      case "messages": return <MessagesPage palette={palette} />;
      case "notifications": return <NotificationsPage palette={palette} />;
      default: return <Dashboard palette={palette} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden bg-gradient-to-br ${bgColor}`}>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "w-20" : "w-72"} ${sidebarBg} backdrop-blur-xl border-r ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <i className="fas fa-shield-alt text-white"></i>
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Panel</h1>
                <p className="text-xs" style={{ color: secondaryText }}>CSE Reviewer</p>
              </div>
            </div>
          )}
          <button 
            onClick={toggleSidebar} 
            className={`${isSidebarCollapsed ? "mx-auto" : ""} w-8 h-8 rounded-lg ${isDark ? "bg-gray-800 text-gray-400 hover:text-blue-400" : "bg-gray-100 text-gray-600 hover:text-blue-600"} flex items-center justify-center transition-all hover:scale-110`}
          >
            <i className={`fas ${isSidebarCollapsed ? "fa-angles-right" : "fa-angles-left"}`}></i>
          </button>
        </div>

        {/* Admin Profile */}
        <div className={`px-6 py-5 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <div className={`flex items-center gap-4 ${isSidebarCollapsed ? "justify-center" : ""}`}>
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                A
              </div>
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white dark:border-gray-900 shadow-lg"></span>
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: textColor }}>Admin User</p>
                <p className="text-xs truncate" style={{ color: secondaryText }}>admin@cse.com</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`group relative w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                  ${isSidebarCollapsed ? "justify-center" : ""}
                  ${active 
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                    : `${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`
                  }
                `}
              >
                <i className={`fas ${item.icon} text-lg ${active ? "" : "group-hover:scale-110 transition-transform"}`}></i>
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" 
                        style={{ 
                          backgroundColor: active ? "rgba(255,255,255,0.2)" : `${errorColor}20`, 
                          color: active ? "#fff" : errorColor 
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {isSidebarCollapsed && (
                  <span className={`absolute left-full ml-2 px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-medium ${isDark ? "bg-gray-800 text-white" : "bg-gray-900 text-white"} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-lg`}>
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions - Theme Toggle & Logout */}
        <div className={`px-4 pb-6 space-y-2 border-t pt-4 ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          {/* Theme Toggle - Using your actual component */}
          <ThemeToggleSwitch isDark={isDark} toggleTheme={toggleTheme} isCollapsed={isSidebarCollapsed} />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isSidebarCollapsed ? "justify-center" : ""} ${isDark ? "bg-red-900/20 text-red-400 hover:bg-red-900/30" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
          >
            <i className="fas fa-right-from-bracket text-lg"></i>
            {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-xl ${isDark ? "bg-gray-900/80" : "bg-white/80"} border-b ${isDark ? "border-gray-700" : "border-gray-200"} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <i className="fas fa-shield-alt text-white text-lg"></i>
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ADMIN PANEL
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all"
        >
          <i className={`fas ${isMobileMenuOpen ? "fa-xmark" : "fa-bars"} text-lg`}></i>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            <motion.aside 
              className={`lg:hidden fixed top-0 right-0 h-full w-80 z-50 overflow-y-auto ${isDark ? "bg-gray-900" : "bg-white"} shadow-2xl`}
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {/* Mobile Menu Content */}
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className={`px-6 py-5 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <i className="fas fa-shield-alt text-white text-lg"></i>
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ADMIN PANEL
                    </span>
                  </div>
                </div>

                {/* Mobile Profile */}
                <div className={`px-6 py-5 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        A
                      </div>
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white dark:border-gray-900 shadow-lg"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`font-semibold truncate block ${isDark ? "text-white" : "text-gray-900"}`}>Admin User</span>
                      <span className={`text-sm truncate block ${isDark ? "text-gray-400" : "text-gray-500"}`}>admin@cse.com</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                  {navItems.map((item) => {
                    const active = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { 
                          setCurrentPage(item.id); 
                          setIsMobileMenuOpen(false); 
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200
                          ${active 
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
                            : `${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`
                          }
                        `}
                      >
                        <i className={`fas ${item.icon} text-lg`}></i>
                        <span className="flex-1 text-left font-medium">{item.name}</span>
                        {item.badge && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" 
                            style={{ 
                              backgroundColor: active ? "rgba(255,255,255,0.2)" : `${errorColor}20`, 
                              color: active ? "#fff" : errorColor 
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Mobile Bottom Actions */}
                <div className={`px-4 pb-6 space-y-3 border-t pt-4 ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                  {/* Theme Toggle - Using your actual component */}
                  <ThemeToggleSwitch isDark={isDark} toggleTheme={toggleTheme} />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isDark ? "bg-red-900/20 text-red-400 hover:bg-red-900/30" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                  >
                    <i className="fas fa-right-from-bracket text-lg"></i>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 lg:mt-0 mt-16">
        <header className={`p-6 flex items-center justify-between backdrop-blur-xl ${isDark ? "bg-gray-900/95" : "bg-white/95"} border-b ${isDark ? "border-gray-800" : "border-gray-200"} shadow-sm`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <i className="fas fa-bars"></i>
            </button>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {navItems.find((item) => item.id === currentPage)?.name || "Dashboard"}
              </h2>
              <p className="text-sm" style={{ color: secondaryText }}>Manage your Civil Service Reviewer system</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${isDark ? "bg-gray-800 text-gray-400 hover:text-blue-400" : "bg-gray-100 text-gray-600 hover:text-blue-600"}`}>
              <i className="fas fa-bell"></i>
            </button>
            <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${isDark ? "bg-gray-800 text-gray-400 hover:text-blue-400" : "bg-gray-100 text-gray-600 hover:text-blue-600"}`}>
              <i className="fas fa-search"></i>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
      </div>
    </div>
  );
};

export default AdminPanel;