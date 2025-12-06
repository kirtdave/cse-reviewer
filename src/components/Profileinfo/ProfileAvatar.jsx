import React from "react";

export function ProfileAvatar({ 
  user, 
  imagePreview, 
  isEditing, 
  fileInputRef, 
  onImageClick, 
  onImageChange,
  isDark 
}) {
  return (
    <div className="col-span-full flex items-center gap-3 pb-4 border-b border-gray-200/10">
      <div className="relative">
        <img
          src={imagePreview || user.avatar}
          alt="Profile"
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-blue-500/30 ${isEditing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          onClick={onImageClick}
        />
        {isEditing && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
            <button 
              type="button"
              onClick={onImageClick}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs hover:scale-110 transition-all shadow-lg"
            >
              <i className="fa-solid fa-camera"></i>
            </button>
          </>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-base sm:text-lg font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>
          {user.name}
        </h3>
        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Member since {user.joinDate}
        </p>
        {isEditing && (
          <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            Tap image to change
          </p>
        )}
      </div>
    </div>
  );
}