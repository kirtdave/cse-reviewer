import React from 'react';
import { Link } from 'react-router-dom';
import NavigationItem from './NavigationItem';

const Navigation = ({ navItems, location, isDark, isCollapsed, onNavigate, isMobile }) => (
  <nav className="flex-1 px-3 lg:px-4 py-4 lg:py-6 space-y-1.5 lg:space-y-2 overflow-y-auto">
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