import React from "react";
import { useLocation } from "react-router-dom";
import SidebarLayout from "../components/aaGLOBAL/SidebarLayout";
import ActualTest from "../components/Teststart/actualtest";

export default function ActualTestpage({ theme, toggleTheme, isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  const navState = location.state || {}; 

  return (
    <SidebarLayout
      theme={theme}
      toggleTheme={toggleTheme}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    >
      <main>
        {/* ✅ REMOVED theme prop - ActualTest now uses ThemeContext */}
        <ActualTest {...navState} />
      </main>
    </SidebarLayout>
  );
}