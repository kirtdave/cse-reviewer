import React from "react";
import SidebarLayout from "../components/aaGLOBAL/SidebarLayout";
import Profile from "../components/Profileinfo/Profile";

export default function Profilepage({
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
      <Profile theme={theme} />
    </SidebarLayout>
  );
}