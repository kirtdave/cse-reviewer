import React from "react";
import SidebarLayout from "../components/aaGLOBAL/SidebarLayout";
import Analytics from "../components/analytics/Analytic";

export default function Analyticspage({
  theme,
  toggleTheme,
  isCollapsed,
  setIsCollapsed,
}) {
  return (
    <SidebarLayout
      theme={theme}
      toggleTheme={toggleTheme}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    >
      <main
        className={`min-h-screen transition-colors duration-300 ${
          theme === "dark"
            ? "bg-[#000F08] text-[#FBFFFE]"
            : "bg-[#FBFFFE] text-[#000F08]"
        }`}
      >
        <Analytics theme={theme} />
      </main>
    </SidebarLayout>
  );
}
