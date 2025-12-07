import './utils/axiosConfig';
import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Dashboardpage from "./pages/Dashboardpage";
import Testpage from "./pages/Testpage";
import Analyticspage from "./pages/Analyticspage";
import Historypage from "./pages/Historypage";
import Contactpage from "./pages/Contactpage";
import Profilepage from "./pages/Profilepage";
import ActualTestpage from "./pages/Actualtestpage";
import Customtestpage from "./pages/CustomTestpage";
import Adminpage from "./pages/Adminpage";
import ProtectedRoute from "./components/aaGLOBAL/ProtectedRoute";
import TestReviewpage from "./pages/TestReviewpage";
import BookmarksPageWrapper from "./pages/BookmarksPageWrapper";

import { ThemeContext } from "./components/aaGLOBAL/ThemeContext";

// ✅ Create a wrapper component that has access to useNavigate
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTheme = useMemo(() => localStorage.getItem("theme") || "light", []);
  const initialSidebar = useMemo(
    () => JSON.parse(localStorage.getItem("sidebar-collapsed") || "false"),
    []
  );

  const [theme, setTheme] = useState(initialTheme);
  const [isCollapsed, setIsCollapsed] = useState(initialSidebar);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // ✅ NEW: Check authentication and redirect on app load
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const currentPath = location.pathname;

    // If user is on admin route
    if (currentPath === '/admin') {
      if (!isLoggedIn) {
        console.log('🚫 Not logged in, redirecting to home');
        navigate('/', { replace: true });
      } else if (!isAdmin) {
        console.log('🚫 Not admin, redirecting to user dashboard');
        navigate('/', { replace: true });
      }
    }
    // If admin tries to access regular routes, redirect to admin
    else if (isLoggedIn && isAdmin && currentPath === '/') {
      console.log('✅ Admin detected, redirecting to admin panel');
      navigate('/admin', { replace: true });
    }
  }, [location.pathname, navigate]);

  // ✅ Cross-tab logout synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      // When isLoggedIn is removed or set to false in another tab
      if (e.key === 'isLoggedIn' && e.newValue !== 'true') {
        console.log('🔄 Logout detected in another tab, logging out this tab...');
        // Clear local storage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminUser');
        // Navigate to home
        navigate('/', { replace: true });
        // Reload to reset state
        window.location.reload();
      }

      // ✅ NEW: Listen for admin status changes
      if (e.key === 'isAdmin') {
        const isAdmin = e.newValue === 'true';
        const currentPath = window.location.pathname;
        
        if (isAdmin && currentPath !== '/admin') {
          console.log('✅ Admin status detected, redirecting to admin panel');
          navigate('/admin', { replace: true });
        } else if (!isAdmin && currentPath === '/admin') {
          console.log('🚫 Admin status removed, redirecting to dashboard');
          navigate('/', { replace: true });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  // ✅ Heartbeat system - Update last active timestamp
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) return;

    const updateLastActive = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/profile/heartbeat`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.error('Heartbeat error:', error);
      }
    };

    // Update immediately when app loads
    updateLastActive();

    // Update every 2 minutes automatically
    const interval = setInterval(updateLastActive, 120000); // 2 minutes

    // Also update on user activity (throttled)
    let activityTimeout;
    const handleActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(updateLastActive, 5000); // Wait 5s after last activity
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      clearInterval(interval);
      clearTimeout(activityTimeout);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="transition-colors duration-500 ease-in-out">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboardpage
                theme={theme}
                toggleTheme={toggleTheme}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <Profilepage
                theme={theme}
                toggleTheme={toggleTheme}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
            }
          />
          <Route
            path="/test"
            element={
              <Testpage
                theme={theme}
                toggleTheme={toggleTheme}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
            }
          />
          <Route
            path="/analytics"
            element={
              <Analyticspage
                theme={theme}
                toggleTheme={toggleTheme}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
            }
          />
          <Route
            path="/history"
            element={
              <Historypage
                theme={theme}
                toggleTheme={toggleTheme}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
            }
          />
          
          {/* ⭐ Review Route */}
          <Route
            path="/review/:attemptId"
            element={
              <TestReviewpage
                theme={theme}
                toggleTheme={toggleTheme}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
            }
          />

          <Route
            path="/contact"
            element={
              <Contactpage
                theme={theme}
                toggleTheme={toggleTheme}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
            }
          />
          <Route
            path="/actualtest"
            element={
              <ActualTestpage
                theme={theme}
                toggleTheme={toggleTheme}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
            }
          />
          <Route
            path="/custom-setup"
            element={
              <Customtestpage
                theme={theme}
                toggleTheme={toggleTheme}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
            }
          />

          {/* Admin Route - Protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Adminpage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookmarks"
            element={
              <BookmarksPageWrapper
                theme={theme}
                toggleTheme={toggleTheme}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
              />
            }
          />
        </Routes>
      </div>
    </ThemeContext.Provider>
  );
}

// ✅ Wrap with Router to enable useNavigate
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}