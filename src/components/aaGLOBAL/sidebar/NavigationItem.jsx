// ============================================================================
// components/NavigationItem.jsx
// ============================================================================
import React from 'react';
import { Link } from 'react-router-dom';

const NavigationItem = ({ item, isActive, isDark, isCollapsed, onClick }) => (
  <Link
    to={item.path}
    onClick={onClick}
    className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
      ${isCollapsed ? "justify-center" : ""}
      ${
        isActive
          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
          : `${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`
      }
    `}
  >
    <i className={`fa-solid ${item.icon} text-lg ${isActive ? "" : "group-hover:scale-110 transition-transform"}`}></i>
    {!isCollapsed && <span className="font-medium">{item.name}</span>}
    {isCollapsed && (
      <span
        className={`absolute left-full ml-2 px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-medium
        ${isDark ? "bg-gray-800 text-white" : "bg-gray-900 text-white"}
        opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-lg
      `}
      >
        {item.name}
      </span>
    )}
  </Link>
);

export default NavigationItem;