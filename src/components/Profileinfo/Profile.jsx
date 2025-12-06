import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { ProfileHeader } from "../Profileinfo/ProfileHeader";
import { PersonalInfoCard } from "../Profileinfo/PersonalInfoCard";
import { StudyGoalsCard } from "../Profileinfo/StudyGoalsCard";
import { AchievementsCard } from "../Profileinfo/AchievementsCard";
import { StatsCard } from "../Profileinfo/StatsCard";
import { AlertMessage } from "../Profileinfo/AlertMessage";

const API_URL = "http://localhost:5000/api";

export default function Profile({ theme = "light" }) {
  const isDark = theme === "dark";

  // State
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

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
      
      console.log('📊 Profile avgScore received:', profile.stats.avgScore);
      
      setUser(profile);
      setEditForm(profile);

      const formattedStats = [
        { label: "Total Tests", value: profile.stats.totalTests, icon: "fa-clipboard-list", gradient: "from-blue-500 to-cyan-500" },
        { label: "Study Hours", value: profile.stats.studyHours, icon: "fa-clock", gradient: "from-green-500 to-emerald-500" },
        { label: "Questions Solved", value: profile.stats.questionsSolved.toLocaleString(), icon: "fa-check-circle", gradient: "from-purple-500 to-pink-500" },
        { label: "Current Streak", value: profile.stats.currentStreak, icon: "fa-fire", gradient: "from-orange-500 to-red-500" },
      ];
      setStats(formattedStats);
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

      const response = await axios.put(`${API_URL}/profile`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedProfile = response.data.profile;

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
      window.dispatchEvent(new Event('userUpdated'));

      setSuccessMessage("Profile updated successfully!");
      await fetchProfile();
      setIsEditing(false);
      setImagePreview(null);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
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
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
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
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "text-gray-100" : "text-gray-900"} px-4`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "text-gray-100" : "text-gray-900"} px-4`}>
        <p className="text-sm">Profile not found</p>
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

        <ProfileHeader isDark={isDark} />

      
      <div className="relative z-10 px-3 pb-3 sm:px-6 sm:pb-6 lg:px-10 lg:pb-10">
        <div className="max-w-[1400px] mx-auto space-y-2 sm:space-y-3 lg:space-y-6">
          {/* Messages */}
          {successMessage && <AlertMessage message={successMessage} type="success" />}
          {error && <AlertMessage message={error} type="error" />}

          {/* Main Grid - Mobile: Stack, Desktop: Side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-2 sm:space-y-3 lg:space-y-6">
              <PersonalInfoCard
                user={user}
                editForm={editForm}
                setEditForm={setEditForm}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                onSave={handleSave}
                onCancel={handleCancel}
                imagePreview={imagePreview}
                fileInputRef={fileInputRef}
                onImageClick={handleImageClick}
                onImageChange={handleImageChange}
                isDark={isDark}
              />

              <StudyGoalsCard
                user={user}
                editForm={editForm}
                setEditForm={setEditForm}
                isEditing={isEditing}
                isDark={isDark}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-2 sm:space-y-3 lg:space-y-6">
              <StatsCard stats={stats} isDark={isDark} />
              <AchievementsCard user={user} isDark={isDark} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}