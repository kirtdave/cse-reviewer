// ============================================================================
// components/Navigation.jsx
// ============================================================================
import React from 'react';
import { Link } from 'react-router-dom';
import NavigationItem from './NavigationItem';

const Navigation = ({ navItems, location, isDark, isCollapsed, onNavigate, isMobile }) => (
  <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
    {navItems.map((item, i) => (
      <NavigationItem
        key={i}
        item={item}
        isActive={location.pathname === item.path}
        isDark={isDark}
        isCollapsed={isCollapsed}
        onClick={onNavigate}
      />
    ))}
  </nav>
);

export default Navigation;