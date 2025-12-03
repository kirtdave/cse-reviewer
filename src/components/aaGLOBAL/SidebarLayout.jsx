import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ThemeContext } from "./ThemeContext";
import { logout } from '../../services/authService';
import MobileHeader from './sidebar/MobileHeader';
import MobileMenu from './sidebar/MobileMenu';
import DesktopSidebar from './sidebar/DesktopSidebar';
import AuthModal from './sidebar/AuthModal';
import LoadingScreen from './sidebar/LoadingScreen';
import NotificationModal from './notifification/NotificationModal';

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
  
  // 🔔 NEW: Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Test Completed!',
      message: 'You scored 95% on CSE Practice Test #5',
      time: '2 minutes ago',
      unread: true
    },
    {
      id: 2,
      type: 'info',
      title: 'New Study Material',
      message: 'Data Structures chapter has been updated',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'warning',
      title: 'Upcoming Test',
      message: 'Your scheduled test starts in 30 minutes',
      time: '2 hours ago',
      unread: false
    },
    {
      id: 4,
      type: 'success',
      title: 'Achievement Unlocked',
      message: 'Completed 10 tests in a row!',
      time: '1 day ago',
      unread: false
    },
    {
      id: 5,
      type: 'info',
      title: 'New Bookmark',
      message: 'Question #42 added to your bookmarks',
      time: '2 days ago',
      unread: true
    }
  ]);

  const navItems = [
    { name: "Dashboard", path: "/", icon: "fa-house", gradient: "from-blue-500 to-purple-500" },
    { name: "Test", path: "/test", icon: "fa-pen", gradient: "from-purple-500 to-pink-500" },
    { name: "Bookmarks", path: "/bookmarks", icon: "fa-bookmark", gradient: "from-pink-500 to-red-500" },
    { name: "History", path: "/history", icon: "fa-clock-rotate-left", gradient: "from-orange-500 to-red-500" },
    { name: "Analytics", path: "/analytics", icon: "fa-chart-line", gradient: "from-green-500 to-teal-500" },
    { name: "Contact", path: "/contact", icon: "fa-envelope", gradient: "from-cyan-500 to-blue-500" },
  ];

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
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, []);

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

  // 🔔 NEW: Notification handler
  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const isDark = theme === "dark";

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900" : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"}`}>
      <MobileHeader
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
        location={location}
        isLoggedIn={isLoggedIn}
        user={user}
        isDark={isDark}
        toggleTheme={toggleTheme}
        openLogin={openLogin}
        openSignup={openSignup}
        handleLogout={handleLogout}
        goToProfile={goToProfile}
        notificationCount={notifications.filter(n => n.unread).length}
        onNotificationClick={handleNotificationClick}
      />

      <DesktopSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        navItems={navItems}
        location={location}
        isLoggedIn={isLoggedIn}
        user={user}
        isDark={isDark}
        toggleTheme={toggleTheme}
        openLogin={openLogin}
        openSignup={openSignup}
        handleLogout={handleLogout}
        goToProfile={goToProfile}
        notificationCount={notifications.filter(n => n.unread).length}
        onNotificationClick={handleNotificationClick}
      />

      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 lg:mt-0 mt-16">
        {React.cloneElement(children, { theme })}
      </main>

      <AnimatePresence>
        {showLogin && (
          <AuthModal title="Login Account" onClose={closeModals} theme={theme} type="login" onSubmit={handleLogin} />
        )}
        {showSignup && (
          <AuthModal title="Create Account" onClose={closeModals} theme={theme} type="signup" onSubmit={handleLogin} />
        )}
      </AnimatePresence>

      {/* 🔔 NEW: Notification Modal */}
      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        isDark={isDark}
        notifications={notifications}
      />
    </div>
  );
};

export default SidebarLayout;