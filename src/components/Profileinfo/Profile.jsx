import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export default function Profile({ theme = "light" }) {
  const isDark = theme === "dark";

  // All state declarations
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = React.useRef(null);

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
  try {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    
    const response = await axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { profile } = response.data;
    setUser(profile);
    setEditForm(profile);

    // Format stats for display
    const formattedStats = [
      { label: "Total Tests", value: profile.stats.totalTests, icon: "fa-clipboard-list", gradient: "from-blue-500 to-cyan-500" },
      { label: "Study Hours", value: profile.stats.studyHours, icon: "fa-clock", gradient: "from-green-500 to-emerald-500" },
      { label: "Questions Solved", value: profile.stats.questionsSolved.toLocaleString(), icon: "fa-check-circle", gradient: "from-purple-500 to-pink-500" },
      { label: "Current Streak", value: profile.stats.currentStreak, icon: "fa-fire", gradient: "from-orange-500 to-red-500" },
    ];
    setStats(formattedStats);
    // ❌ REMOVED: setAchievements(profile.achievements);

  } catch (err) {
    console.error("Error fetching profile:", err);
    setError("Failed to load profile");
  } finally {
    setIsLoading(false);
  }
};

  const handleSave = async () => {
    try {
      setError("");
      setSuccessMessage("");
      const token = localStorage.getItem("token");

      console.log("=== SAVING PROFILE ===");
      console.log("Edit form data:", {
        ...editForm,
        avatar: editForm.avatar ? `${editForm.avatar.substring(0, 50)}... (${editForm.avatar.length} chars)` : 'none'
      });

      const response = await axios.put(`${API_URL}/profile`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("✅ Profile saved successfully:", response.data);

      // ✅ Get the updated profile from response
      const updatedProfile = response.data.profile;

      // ✅ Update localStorage with new user data
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...storedUser,
        name: updatedProfile.name,
        email: updatedProfile.email,
        avatar: updatedProfile.avatar,
        phone: updatedProfile.phone,
        location: updatedProfile.location,
        bio: updatedProfile.bio,
        studyGoal: updatedProfile.studyGoal,
        targetDate: updatedProfile.targetDate
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("✅ localStorage updated with new user data");

      // ✅ Dispatch custom event to notify other components (SidebarLayout)
      window.dispatchEvent(new Event('userUpdated'));
      console.log("✅ 'userUpdated' event dispatched");

      setSuccessMessage("Profile updated successfully!");
      
      // Refresh profile data to get updated achievements
      await fetchProfile();
      
      setIsEditing(false);
      setImagePreview(null);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditForm({ ...user });
    setIsEditing(false);
    setError("");
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("=== IMAGE SELECTED ===");
      console.log("File name:", file.name);
      console.log("File size:", (file.size / 1024 / 1024).toFixed(2), "MB");
      console.log("File type:", file.type);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("✅ Image converted to base64");
        console.log("Base64 length:", reader.result.length, "characters");
        setImagePreview(reader.result);
        setEditForm({ ...editForm, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "text-gray-100" : "text-gray-900"}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "text-gray-100" : "text-gray-900"}`}>
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "text-gray-100" : "text-gray-900"} relative transition-colors duration-500`}>
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(63,167,214,0.08)_1px,_transparent_1px)] bg-[size:40px_40px]"
        />
      </div>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-user text-white text-2xl"></i>
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  My Profile
                </h1>
                <p className="text-sm bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-medium">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </motion.header>

      {/* Content */}
      <div className="relative z-10 p-6 lg:p-10">
        <div className="max-w-[1400px] mx-auto space-y-6">

          {/* Success/Error Messages */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-xl"
            >
              {successMessage}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-xl"
            >
              {error}
            </motion.div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
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
                        onClick={handleSave}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:shadow-lg transition-all"
                      >
                        <i className="fa-solid fa-check mr-2"></i>
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Avatar */}
                  <div className="md:col-span-2 flex items-center gap-6">
                    <div className="relative">
                      <img
                        src={imagePreview || user.avatar}
                        alt="Profile"
                        className={`w-24 h-24 rounded-full object-cover border-4 border-blue-500/20 ${isEditing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                        onClick={handleImageClick}
                      />
                      {isEditing && (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <button 
                            type="button"
                            onClick={handleImageClick}
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

                  {/* Form Fields */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    ) : (
                      <p className={`px-4 py-3 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-gray-50"} ${isDark ? "text-white" : "text-gray-900"}`}>
                        {user.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    ) : (
                      <p className={`px-4 py-3 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-gray-50"} ${isDark ? "text-white" : "text-gray-900"}`}>
                        {user.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    ) : (
                      <p className={`px-4 py-3 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-gray-50"} ${isDark ? "text-white" : "text-gray-900"}`}>
                        {user.phone || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location || ''}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    ) : (
                      <p className={`px-4 py-3 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-gray-50"} ${isDark ? "text-white" : "text-gray-900"}`}>
                        {user.location || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.bio || ''}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        rows={3}
                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                      />
                    ) : (
                      <p className={`px-4 py-3 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-gray-50"} ${isDark ? "text-white" : "text-gray-900"}`}>
                        {user.bio || 'No bio yet'}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Study Goals */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
              >
                <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Study Goals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Primary Goal
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.studyGoal || ''}
                        onChange={(e) => setEditForm({ ...editForm, studyGoal: e.target.value })}
                        placeholder="e.g., Pass CSE Professional Level"
                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    ) : (
                      <p className={`px-4 py-3 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-gray-50"} text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {user.studyGoal}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Target Date
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.targetDate || ''}
                        onChange={(e) => setEditForm({ ...editForm, targetDate: e.target.value })}
                        placeholder="MM/DD/YYYY (e.g., 12/31/2025)"
                        className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    ) : (
                      <p className={`px-4 py-3 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-gray-50"} text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {user.targetDate || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Stats & Achievements */}
            <div className="space-y-6">
{/* Achievements - Changed to show 4 current stat achievements */}
<motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.2 }}
  className={`${isDark
    ? "bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white"
    : "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
  } backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-white/6" : "border-gray-200"}`}
>
  <h2 className="text-xl font-bold mb-4 text-white">
    Your Achievements
  </h2>

  <div className="space-y-3">
    {/* 1. Current Streak */}
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className={`flex items-center rounded-lg gap-3 p-3 ${isDark ? "bg-white/5 border border-white/6" : "bg-white/20 border border-white/10"} backdrop-blur-sm`}
    >
      <div className={`w-10 h-10 flex items-center justify-center rounded-md text-2xl ${isDark ? "bg-white/6 text-white" : "bg-white text-purple-600"}`}>
        🔥
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">
          {user.stats.currentStreak}-Day Streak
        </p>
        <p className={`text-xs ${isDark ? "text-white/80" : "text-slate-200"}`}>
          Keep it going!
        </p>
      </div>
    </motion.div>

    {/* 2. Questions Mastered */}
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className={`flex items-center rounded-lg gap-3 p-3 ${isDark ? "bg-white/5 border border-white/6" : "bg-white/20 border border-white/10"} backdrop-blur-sm`}
    >
      <div className={`w-10 h-10 flex items-center justify-center rounded-md text-2xl ${isDark ? "bg-white/6 text-white" : "bg-white text-purple-600"}`}>
        🎓
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">
          {user.stats.questionsMastered || 0} Questions Mastered
        </p>
        <p className={`text-xs ${isDark ? "text-white/80" : "text-slate-200"}`}>
          Answered correctly 3+ times
        </p>
      </div>
    </motion.div>

    {/* 3. Test Milestone (Highest reached) */}
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className={`flex items-center rounded-lg gap-3 p-3 ${isDark ? "bg-white/5 border border-white/6" : "bg-white/20 border border-white/10"} backdrop-blur-sm`}
    >
      <div className={`w-10 h-10 flex items-center justify-center rounded-md text-2xl ${isDark ? "bg-white/6 text-white" : "bg-white text-purple-600"}`}>
        {user.stats.totalTests >= 10 ? '💎' : user.stats.totalTests >= 5 ? '🏆' : user.stats.totalTests >= 3 ? '⭐' : '🎯'}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">
          {user.stats.totalTests >= 10 ? '10+ Tests Master' : 
           user.stats.totalTests >= 5 ? '5 Tests Milestone' : 
           user.stats.totalTests >= 3 ? '3 Tests Milestone' : 
           user.stats.totalTests >= 1 ? 'First Test Completed' : 'No Tests Yet'}
        </p>
        <p className={`text-xs ${isDark ? "text-white/80" : "text-slate-200"}`}>
          {user.stats.totalTests} {user.stats.totalTests === 1 ? 'test' : 'tests'} completed
        </p>
      </div>
    </motion.div>

    {/* 4. Highest Score */}
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className={`flex items-center rounded-lg gap-3 p-3 ${isDark ? "bg-white/5 border border-white/6" : "bg-white/20 border border-white/10"} backdrop-blur-sm`}
    >
      <div className={`w-10 h-10 flex items-center justify-center rounded-md text-2xl ${isDark ? "bg-white/6 text-white" : "bg-white text-purple-600"}`}>
        {user.stats.avgScore >= 90 ? '💯' : user.stats.avgScore >= 80 ? '🌟' : user.stats.avgScore >= 70 ? '⭐' : '📊'}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">
          {user.stats.avgScore >= 90 ? 'Elite Performer' : 
           user.stats.avgScore >= 80 ? 'High Achiever' : 
           user.stats.avgScore >= 70 ? 'Good Progress' : 
           user.stats.avgScore > 0 ? 'Keep Practicing' : 'Start Your Journey'}
        </p>
        <p className={`text-xs ${isDark ? "text-white/80" : "text-slate-200"}`}>
          {user.stats.avgScore > 0 ? `${user.stats.avgScore}% average score` : 'Complete a test to see your score'}
        </p>
      </div>
    </motion.div>
  </div>
</motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
              >
                <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Your Stats
                </h2>
                <div className="space-y-4">
                  {stats.map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-gray-50"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                          <i className={`fa-solid ${stat.icon} text-white`}></i>
                        </div>
                        <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          {stat.label}
                        </span>
                      </div>
                      <span className={`text-lg font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                        {stat.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}