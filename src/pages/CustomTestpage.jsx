import React from "react";
import { useLocation } from "react-router-dom";
import SidebarLayout from "../components/aaGLOBAL/SidebarLayout";
import Customtest from "../components/customtestsetup/Customtest";
export default function Customtestpage({ theme, toggleTheme, isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  const navState = location.state || {}; // e.g. { theme } if StepSelector sent it

  return (
    <SidebarLayout
      theme={theme}
      toggleTheme={toggleTheme}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    >
      <main>
        <Customtest theme={theme} {...navState} />
      </main>
    </SidebarLayout>
  );
}
