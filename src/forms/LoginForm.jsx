import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { login } from '../services/authService';

export default function LoginForm({ theme, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isDark = theme === "dark";

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const data = await login(email, password);
      
      // Redirect based on role
      if (data.isAdmin) {
        window.location.href = '/admin';
      } else {
        onLogin(data.user);
      }
    } catch (error) {
      setErrors({ submit: error });
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:gap-5"
    >
      {/* Email Field */}
      <div>
        <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          Email Address
        </label>
        <div className="relative">
          <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2">
            <Mail className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
          </div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({ ...errors, email: "" });
            }}
            className={`w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border outline-none transition-all ${
              errors.email
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : isDark
                ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
          />
        </div>
        {errors.email && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 mt-1.5 text-red-500 text-xs sm:text-sm"
          >
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{errors.email}</span>
          </motion.div>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          Password
        </label>
        <div className="relative">
          <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2">
            <Lock className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: "" });
            }}
            className={`w-full pl-9 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border outline-none transition-all ${
              errors.password
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : isDark
                ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform active:scale-95 p-1"
          >
            {showPassword ? (
              <EyeOff className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
            ) : (
              <Eye className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
            )}
          </button>
        </div>
        {errors.password && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 mt-1.5 text-red-500 text-xs sm:text-sm"
          >
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{errors.password}</span>
          </motion.div>
        )}
      </div>

      {/* Admin Hint - Compact on Mobile */}
      <div className={`text-xs p-2 sm:p-3 rounded-lg ${isDark ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
        <i className="fas fa-info-circle mr-1.5 sm:mr-2"></i>
        <span className="break-all">
          Admin: <strong className="font-semibold">admin@gmail.com</strong> / <strong className="font-semibold">admin123</strong>
        </span>
      </div>

      {/* Remember Me & Forgot Password - Stacked on Mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <span className={`text-xs sm:text-sm ${isDark ? "text-gray-400 group-hover:text-gray-300" : "text-gray-600 group-hover:text-gray-900"} transition-colors`}>
            Remember me
          </span>
        </label>
        <button
          type="button"
          className={`text-xs sm:text-sm font-medium transition-colors text-left sm:text-right ${
            isDark ? "text-blue-400 hover:text-blue-300 active:text-blue-500" : "text-blue-600 hover:text-blue-700 active:text-blue-800"
          }`}
        >
          Forgot password?
        </button>
      </div>

      {/* Submit Button - More Touch-Friendly on Mobile */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:shadow-md"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            <span>Logging in...</span>
          </>
        ) : (
          <>
            <span>Login</span>
            <i className="fa-solid fa-arrow-right text-sm"></i>
          </>
        )}
      </motion.button>

      {/* Social Login Divider */}
      <div className="relative my-1 sm:my-2">
        <div className={`absolute inset-0 flex items-center`}>
          <div className={`w-full border-t ${isDark ? "border-gray-700" : "border-gray-300"}`}></div>
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className={`px-3 sm:px-4 ${isDark ? "bg-gray-900 text-gray-500" : "bg-white text-gray-600"}`}>
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login Buttons - More Touch-Friendly */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          type="button"
          className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base rounded-lg sm:rounded-xl border transition-all active:scale-95 ${
            isDark
              ? "border-gray-700 hover:bg-gray-800 active:bg-gray-750 text-gray-300"
              : "border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700"
          }`}
        >
          <i className="fa-brands fa-google text-base sm:text-lg"></i>
          <span className="font-medium">Google</span>
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base rounded-lg sm:rounded-xl border transition-all active:scale-95 ${
            isDark
              ? "border-gray-700 hover:bg-gray-800 active:bg-gray-750 text-gray-300"
              : "border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700"
          }`}
        >
          <i className="fa-brands fa-facebook text-base sm:text-lg"></i>
          <span className="font-medium">Facebook</span>
        </button>
      </div>
    </motion.form>
  );
}