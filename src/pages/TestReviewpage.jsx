import React from "react";
import SidebarLayout from "../components/aaGLOBAL/SidebarLayout";
import TestReview from "../components/testReview/TestReview";

export default function testReviewpage({
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
        <TestReview theme={theme} />
      </main>
    </SidebarLayout>
  );
}
