import React from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../components/aaGLOBAL/SidebarLayout";
import Testsetup from "../components/test/TestSetup";

export default function Testpage({
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
      <div className={`flex flex-col gap-6 min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-[#000F08] text-[#FBFFFE]" : "bg-[#FBFFFE] text-[#000F08]"}`}>
        <Testsetup theme={theme} navigate={navigate} />
      </div>
    </SidebarLayout>
  );
}