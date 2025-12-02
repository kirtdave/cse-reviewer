// ProfileSection.jsx
import React from 'react';
import UserAvatar from './UserAvatar';

const ProfileSection = ({ isLoggedIn, user, isDark, goToProfile, isCollapsed, isMobile }) => (
  <div className={`py-5 border-b ${isDark ? "border-gray-800" : "border-gray-200"} ${isCollapsed ? "px-4" : "px-6"}`}>
    {isCollapsed ? (
      // Collapsed state - just show centered avatar
      <div className="flex justify-center items-center">
        <button
          onClick={goToProfile}
          className="relative group flex-shrink-0"
          title={isLoggedIn ? user.name : "Guest User"}
        >
          <UserAvatar isLoggedIn={isLoggedIn} user={user} size="md" />
        </button>
      </div>
    ) : (
      // Expanded state - show full profile section
      <div className="flex items-center gap-4">
        <UserAvatar isLoggedIn={isLoggedIn} user={user} size={isMobile ? "lg" : "md"} />
        
        <div className="flex flex-1 items-center justify-between min-w-0">
          <div className="flex flex-col flex-1 min-w-0">
            {isLoggedIn ? (
              <>
                <span className={`font-semibold ${isMobile ? "" : "text-sm"} truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                  {user.name}
                </span>
                <span className={`${isMobile ? "text-sm" : "text-xs"} truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {user.email}
                </span>
              </>
            ) : (
              <>
                <span className={`font-semibold ${isMobile ? "" : "text-sm"} ${isDark ? "text-white" : "text-gray-900"}`}>
                  Guest User
                </span>
                <span className={`${isMobile ? "text-sm" : "text-xs"} ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Login for full access
                </span>
              </>
            )}
          </div>
          <button
            onClick={goToProfile}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${isDark ? "bg-gray-800 text-gray-400 hover:text-blue-400" : "bg-gray-100 text-gray-600 hover:text-blue-600"}`}
            title="View Profile"
          >
            <i className="fa-solid fa-circle-info"></i>
          </button>
        </div>
      </div>
    )}
  </div>
);

export default ProfileSection;