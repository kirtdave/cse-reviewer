// UserAvatar.jsx
import React from 'react';

const UserAvatar = ({ isLoggedIn, user, size = "md" }) => {
  const sizeClasses = {
    md: "w-12 h-12",
    lg: "w-14 h-14"
  };

  const textSizeClasses = {
    md: "text-lg",
    lg: "text-xl"
  };

  return (
    <div className="relative flex-shrink-0">
      {isLoggedIn && user?.avatar ? (
        <img 
          src={user.avatar} 
          alt={user.name}
          className={`${sizeClasses[size]} rounded-full object-cover shadow-lg border-2 border-blue-500`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold ${textSizeClasses[size]} shadow-lg`}>
          {isLoggedIn ? user?.name?.charAt(0)?.toUpperCase() : "G"}
        </div>
      )}
      {isLoggedIn && (
        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white dark:border-gray-900 shadow-lg"></span>
      )}
    </div>
  );
};

export default UserAvatar;