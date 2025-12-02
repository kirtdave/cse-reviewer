// ============================================================================
// components/DesktopSidebar.jsx
// ============================================================================
import React from 'react';
import SidebarHeader from './SidebarHeader';
import ProfileSection from './ProfileSection';
import Navigation from './Navigation';
import BottomActions from './BottomActions';

const DesktopSidebar = ({
  isCollapsed,
  setIsCollapsed,
  navItems,
  location,
  isLoggedIn,
  user,
  isDark,
  toggleTheme,
  openLogin,
  openSignup,
  handleLogout,
  goToProfile
}) => (
  <aside
    className={`hidden lg:flex flex-col transition-all duration-300
      ${isCollapsed ? "w-20" : "w-72"}
      ${isDark ? "bg-gray-900/95" : "bg-white/95"}
      backdrop-blur-xl border-r ${isDark ? "border-gray-800" : "border-gray-200"}
      shadow-xl
    `}
  >
    <SidebarHeader
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      isDark={isDark}
    />

    <ProfileSection
      isLoggedIn={isLoggedIn}
      user={user}
      isDark={isDark}
      goToProfile={goToProfile}
      isCollapsed={isCollapsed}
    />

    <Navigation
      navItems={navItems}
      location={location}
      isDark={isDark}
      isCollapsed={isCollapsed}
    />

    <BottomActions
      isLoggedIn={isLoggedIn}
      isDark={isDark}
      toggleTheme={toggleTheme}
      openLogin={openLogin}
      openSignup={openSignup}
      handleLogout={handleLogout}
      isCollapsed={isCollapsed}
    />
  </aside>
);

export default DesktopSidebar;