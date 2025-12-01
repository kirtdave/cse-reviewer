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
    <div className="md:col-span-2 flex items-center gap-6">
      <div className="relative">
        <img
          src={imagePreview || user.avatar}
          alt="Profile"
          className={`w-24 h-24 rounded-full object-cover border-4 border-blue-500/20 ${isEditing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
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
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm hover:scale-110 transition-all"
            >
              <i className="fa-solid fa-camera"></i>
            </button>
          </>
        )}
      </div>
      <div>
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          {user.name}
        </h3>
        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Member since {user.joinDate}
        </p>
        {isEditing && (
          <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            Click image or camera icon to change
          </p>
        )}
      </div>
    </div>
  );
}