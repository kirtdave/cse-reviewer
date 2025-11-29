import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "@fortawesome/fontawesome-free/css/all.min.css";
import LoginForm from "../../forms/LoginForm";
import SignupForm from "../../forms/SignupForm";
import { ThemeContext } from "./ThemeContext";
import ThemeToggleSwitch from "./ThemeToggleSwitch";
import { logout } from '../../services/authService'; 

const SidebarLayout = ({ children, isCollapsed, setIsCollapsed }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loadUserData = () => {
    const storedUser = localStorage.getItem("user");
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (storedUser && loggedIn) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    loadUserData();
    setIsLoading(false);

    const handleUserUpdate = () => {
      console.log("👤 User data updated, refreshing sidebar...");
      loadUserData();
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/", icon: "fa-house", gradient: "from-blue-500 to-purple-500" },
    { name: "Test", path: "/test", icon: "fa-pen", gradient: "from-purple-500 to-pink-500" },
    { name: "Bookmarks", path: "/bookmarks", icon: "fa-bookmark", gradient: "from-pink-500 to-red-500" },
    { name: "History", path: "/history", icon: "fa-clock-rotate-left", gradient: "from-orange-500 to-red-500" },
    { name: "Analytics", path: "/analytics", icon: "fa-chart-line", gradient: "from-green-500 to-teal-500" },
    { name: "Contact", path: "/contact", icon: "fa-envelope", gradient: "from-cyan-500 to-blue-500" },
  ];

  const openLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const openSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  const handleLogin = (userData = { name: "John Doe", email: "john.doe@email.com" }) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isLoggedIn", "true");
    closeModals();
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    logout();
    setIsMobileMenuOpen(false);
    navigate("/", { replace: true });
    window.location.reload();
  };

  const goToProfile = () => {
    navigate("/profile");
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900" : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"}`}>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-book-open-reader text-white text-lg"></i>
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CSE REVIEWER
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all"
        >
          <i className={`fa-solid ${isMobileMenuOpen ? "fa-xmark" : "fa-bars"} text-lg`}></i>
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
              onClick={closeMobileMenu}
            />
            <motion.aside
              className={`lg:hidden fixed top-0 right-0 h-full w-80 z-50 ${isDark ? "bg-gray-900" : "bg-white"} shadow-2xl overflow-y-auto`}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <MobileMenuContent
                navItems={navItems}
                location={location}
                isLoggedIn={isLoggedIn}
                user={user}
                isDark={isDark}
                toggleTheme={toggleTheme}
                openLogin={openLogin}
                openSignup={openSignup}
                handleLogout={handleLogout}
                closeMobileMenu={closeMobileMenu}
                goToProfile={goToProfile}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col transition-all duration-300
          ${isCollapsed ? "w-20" : "w-72"}
          ${isDark ? "bg-gray-900/95" : "bg-white/95"}
          backdrop-blur-xl border-r ${isDark ? "border-gray-800" : "border-gray-200"}
          shadow-xl
        `}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-book-open-reader text-white text-lg"></i>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CSE REVIEWER
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`${isCollapsed ? "mx-auto" : ""} w-8 h-8 rounded-lg ${isDark ? "bg-gray-800 text-gray-400 hover:text-blue-400" : "bg-gray-100 text-gray-600 hover:text-blue-600"} flex items-center justify-center transition-all hover:scale-110`}
          >
            <i className={`fa-solid ${isCollapsed ? "fa-angles-right" : "fa-angles-left"}`}></i>
          </button>
        </div>

        {/* Profile */}
        <div className={`px-6 py-5 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <div className={`flex items-center gap-4 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="relative">
              {/* ✅ Show avatar image if logged in and has avatar */}
              {isLoggedIn && user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-blue-500"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {isLoggedIn ? user?.name?.charAt(0)?.toUpperCase() : "G"}
                </div>
              )}
              {isLoggedIn && (
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white dark:border-gray-900 shadow-lg"></span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-1 items-center justify-between min-w-0">
                <div className="flex flex-col flex-1 min-w-0">
                  {isLoggedIn ? (
                    <>
                      <span className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>{user.name}</span>
                      <span className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{user.email}</span>
                    </>
                  ) : (
                    <>
                      <span className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Guest User</span>
                      <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Login for full access</span>
                    </>
                  )}
                </div>
                <button
                  onClick={goToProfile}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${isDark ? "bg-gray-800 text-gray-400 hover:text-blue-400" : "bg-gray-100 text-gray-600 hover:text-blue-600"}`}
                  title="View Profile"
                >
                  <i className="fa-solid fa-circle-info"></i>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item, i) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={i}
                to={item.path}
                className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                  ${isCollapsed ? "justify-center" : ""}
                  ${
                    active
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                      : `${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`
                  }
                `}
              >
                <i className={`fa-solid ${item.icon} text-lg ${active ? "" : "group-hover:scale-110 transition-transform"}`}></i>
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
                {isCollapsed && (
                  <span
                    className={`absolute left-full ml-2 px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-medium
                    ${isDark ? "bg-gray-800 text-white" : "bg-gray-900 text-white"}
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-lg
                  `}
                  >
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-4 pb-6 space-y-2 border-t pt-4 border-gray-200 dark:border-gray-800">
          <ThemeToggleSwitch isDark={isDark} toggleTheme={toggleTheme} isCollapsed={isCollapsed} />

          {!isLoggedIn ? (
            <div className={`flex gap-2 ${isCollapsed ? "flex-col" : ""}`}>
              <button
                onClick={openLogin}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all ${isCollapsed ? "w-full" : ""}`}
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                {!isCollapsed && <span>Login</span>}
              </button>
              {!isCollapsed && (
                <button
                  onClick={openSignup}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-gray-800 transition-all"
                >
                  <i className="fa-solid fa-user-plus"></i>
                  <span>Sign Up</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                ${isCollapsed ? "justify-center" : ""}
                ${isDark ? "bg-red-900/20 text-red-400 hover:bg-red-900/30" : "bg-red-50 text-red-600 hover:bg-red-100"}
              `}
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              {!isCollapsed && <span className="font-medium">Logout</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 lg:mt-0 mt-16">
        {React.cloneElement(children, { theme })}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showLogin && (
          <Modal title="Login Account" onClose={closeModals} theme={theme}>
            <LoginForm theme={theme} onLogin={handleLogin} />
          </Modal>
        )}
        {showSignup && (
          <Modal title="Create Account" onClose={closeModals} theme={theme}>
            <SignupForm theme={theme} onSignup={handleLogin} />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mobile Menu Content Component
const MobileMenuContent = ({
  navItems,
  location,
  isLoggedIn,
  user,
  isDark,
  toggleTheme,
  openLogin,
  openSignup,
  handleLogout,
  closeMobileMenu,
  goToProfile,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className={`px-6 py-5 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-book-open-reader text-white text-lg"></i>
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CSE REVIEWER
          </span>
        </div>
      </div>

      <div className={`px-6 py-5 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* ✅ Show avatar image in mobile menu too */}
            {isLoggedIn && user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-14 h-14 rounded-full object-cover shadow-lg border-2 border-blue-500"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {isLoggedIn ? user?.name?.charAt(0)?.toUpperCase() : "G"}
              </div>
            )}
            {isLoggedIn && (
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white dark:border-gray-900 shadow-lg"></span>
            )}
          </div>
          <div className="flex flex-1 items-center justify-between min-w-0">
            <div className="flex flex-col flex-1 min-w-0">
              {isLoggedIn ? (
                <>
                  <span className={`font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>{user.name}</span>
                  <span className={`text-sm truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{user.email}</span>
                </>
              ) : (
                <>
                  <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Guest User</span>
                  <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Login for full access</span>
                </>
              )}
            </div>
            <button
              onClick={goToProfile}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${isDark ? "bg-gray-800 text-gray-400 hover:text-blue-400" : "bg-gray-100 text-gray-600 hover:text-blue-600"}`}
            >
              <i className="fa-solid fa-circle-info"></i>
            </button>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item, i) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={i}
              to={item.path}
              onClick={closeMobileMenu}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200
                ${
                  active
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                    : `${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`
                }
              `}
            >
              <i className={`fa-solid ${item.icon} text-lg`}></i>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-6 space-y-3 border-t pt-4 border-gray-200 dark:border-gray-800">
        <ThemeToggleSwitch isDark={isDark} toggleTheme={toggleTheme} />

        {!isLoggedIn ? (
          <>
            <button
              onClick={openLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <i className="fa-solid fa-right-to-bracket"></i>
              <span>Login</span>
            </button>
            <button
              onClick={openSignup}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-gray-800 transition-all"
            >
              <i className="fa-solid fa-user-plus"></i>
              <span>Sign Up</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all
              ${isDark ? "bg-red-900/20 text-red-400 hover:bg-red-900/30" : "bg-red-50 text-red-600 hover:bg-red-100"}
            `}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span className="font-medium">Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ children, title, onClose, theme }) => {
  const isDark = theme === "dark";
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`rounded-2xl shadow-2xl p-8 w-full max-w-md ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default SidebarLayout;