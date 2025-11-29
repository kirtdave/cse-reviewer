import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

export default function App() {
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

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="transition-colors duration-500 ease-in-out">
        <Router>
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
            
            {/* ⭐ NEW: Review Route */}
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
        </Router>
      </div>
    </ThemeContext.Provider>
  );
}