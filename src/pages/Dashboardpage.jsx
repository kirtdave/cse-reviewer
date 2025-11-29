import React from "react";
import SidebarLayout from "../components/aaGLOBAL/SidebarLayout";
import Dashboard from "../components/dashboard/Dashboard";

export default function Homepage({ theme, toggleTheme, isCollapsed, setIsCollapsed }) {
  return (
    <SidebarLayout
      theme={theme}
      toggleTheme={toggleTheme}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    >
      <main className="">
        <Dashboard theme={theme} />
      </main>
    </SidebarLayout>
  );
}
