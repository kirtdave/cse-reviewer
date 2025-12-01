import React from "react";

export function ProfileFormField({ 
  label, 
  value, 
  isEditing, 
  onChange, 
  type = "text",
  placeholder = "",
  isDark,
  multiline = false,
  rows = 3
}) {
  const inputClasses = `w-full px-4 py-3 rounded-xl border ${
    isDark 
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" 
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  } focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const displayClasses = `px-4 py-3 rounded-xl ${
    isDark ? "bg-gray-800/50 text-white" : "bg-gray-50 text-gray-900"
  }`;

  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        {label}
      </label>
      {isEditing ? (
        multiline ? (
          <textarea
            value={value || ''}
            onChange={onChange}
            rows={rows}
            placeholder={placeholder}
            className={`${inputClasses} resize-none`}
          />
        ) : (
          <input
            type={type}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className={inputClasses}
          />
        )
      ) : (
        <p className={displayClasses}>
          {value || placeholder || 'Not set'}
        </p>
      )}
    </div>
  );
}