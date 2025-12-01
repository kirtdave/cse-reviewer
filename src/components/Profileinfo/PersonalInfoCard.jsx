import React from "react";
import { motion } from "framer-motion";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileFormField } from "./ProfileFormField";

export function PersonalInfoCard({ 
  user, 
  editForm, 
  setEditForm, 
  isEditing, 
  setIsEditing, 
  onSave, 
  onCancel,
  imagePreview,
  fileInputRef,
  onImageClick,
  onImageChange,
  isDark 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
    >
      <div className="flex items-start justify-between mb-6">
        <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Personal Information
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
          >
            <i className="fa-solid fa-pen mr-2"></i>
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:shadow-lg transition-all"
            >
              <i className="fa-solid fa-check mr-2"></i>
              Save
            </button>
            <button
              onClick={onCancel}
              className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileAvatar
          user={user}
          imagePreview={imagePreview}
          isEditing={isEditing}
          fileInputRef={fileInputRef}
          onImageClick={onImageClick}
          onImageChange={onImageChange}
          isDark={isDark}
        />

        <ProfileFormField
          label="Full Name"
          value={editForm.name}
          isEditing={isEditing}
          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          isDark={isDark}
        />

        <ProfileFormField
          label="Email"
          value={editForm.email}
          isEditing={isEditing}
          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          type="email"
          isDark={isDark}
        />

        <ProfileFormField
          label="Phone"
          value={editForm.phone}
          isEditing={isEditing}
          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          type="tel"
          placeholder="Not set"
          isDark={isDark}
        />

        <ProfileFormField
          label="Location"
          value={editForm.location}
          isEditing={isEditing}
          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
          placeholder="Not set"
          isDark={isDark}
        />

        <div className="md:col-span-2">
          <ProfileFormField
            label="Bio"
            value={editForm.bio}
            isEditing={isEditing}
            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
            placeholder="No bio yet"
            isDark={isDark}
            multiline={true}
            rows={3}
          />
        </div>
      </div>
    </motion.div>
  );
}