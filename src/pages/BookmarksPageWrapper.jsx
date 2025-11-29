import React from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../components/aaGLOBAL/SidebarLayout";
import BookmarksPage from "../components/bookmarks/BookmarksPage";

export default function BookmarksPageWrapper({
  theme,
  toggleTheme,
  isCollapsed,
  setIsCollapsed,
}) {
  const navigate = useNavigate();

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
        <BookmarksPage theme={theme} navigate={navigate} />
      </main>
    </SidebarLayout>
  );
}