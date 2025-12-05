import React from 'react';

const UserAvatar = ({ isLoggedIn, user, size = "md" }) => {
  const sizeClasses = {
    md: "w-10 h-10 sm:w-12 sm:h-12",
    lg: "w-12 h-12 sm:w-14 sm:h-14"
  };

  const textSizeClasses = {
    md: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl"
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
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white dark:border-gray-900 shadow-lg"></span>
      )}
    </div>
  );
};

export default UserAvatar;