import React from "react";
import SidebarLayout from "../components/aaGLOBAL/SidebarLayout";
import Contact from "../components/contacts/Contact";

export default function Contactpage({ theme, toggleTheme, isCollapsed, setIsCollapsed }) {
  return (
    <SidebarLayout
      theme={theme}
      toggleTheme={toggleTheme}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    >
      <main className="">
        <Contact theme={theme} />
      </main>
    </SidebarLayout>
  );
}
