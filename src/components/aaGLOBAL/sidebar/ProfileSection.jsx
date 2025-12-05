import React from 'react';
import UserAvatar from './UserAvatar';
import { NotificationBell } from '../notifification/NotificationBell';

const ProfileSection = ({ 
  isLoggedIn, 
  user, 
  isDark, 
  goToProfile, 
  isCollapsed, 
  isMobile,
  notificationCount = 5,
  onNotificationClick 
}) => (
  <div className={`py-3 sm:py-4 lg:py-5 border-b ${isDark ? "border-gray-800" : "border-gray-200"} ${isCollapsed ? "px-3 lg:px-4" : "px-4 sm:px-6"}`}>
    {isCollapsed ? (
      <div className="flex justify-center items-center">
        <button
          onClick={goToProfile}
          className="relative group flex-shrink-0 hover:scale-105 transition-transform"
          title={isLoggedIn ? user.name : "Guest User"}
        >
          <UserAvatar isLoggedIn={isLoggedIn} user={user} size="md" />
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-3 lg:gap-4">
        <UserAvatar isLoggedIn={isLoggedIn} user={user} size={isMobile ? "lg" : "md"} />
        
        <button
          onClick={goToProfile}
          className="flex flex-col flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
        >
          {isLoggedIn ? (
            <>
              <span className={`font-semibold ${isMobile ? "text-sm" : "text-xs lg:text-sm"} truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                {user.name}
              </span>
              <span className={`${isMobile ? "text-xs" : "text-[10px] lg:text-xs"} truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {user.email}
              </span>
            </>
          ) : (
            <>
              <span className={`font-semibold ${isMobile ? "text-sm" : "text-xs lg:text-sm"} ${isDark ? "text-white" : "text-gray-900"}`}>
                Guest User
              </span>
              <span className={`${isMobile ? "text-xs" : "text-[10px] lg:text-xs"} ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Login for full access
              </span>
            </>
          )}
        </button>

        <NotificationBell
          count={notificationCount}
          onClick={onNotificationClick}
          isDark={isDark}
        />
      </div>
    )}
  </div>
);

export default ProfileSection;