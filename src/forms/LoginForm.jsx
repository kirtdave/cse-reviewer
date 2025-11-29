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
      className="flex flex-col gap-5"
    >
      {/* Email Field */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          Email Address
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Mail className={`w-5 h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
          </div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({ ...errors, email: "" });
            }}
            className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none transition-all ${
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
            className="flex items-center gap-1 mt-2 text-red-500 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{errors.email}</span>
          </motion.div>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          Password
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Lock className={`w-5 h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: "" });
            }}
            className={`w-full pl-11 pr-12 py-3 rounded-xl border outline-none transition-all ${
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
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
          >
            {showPassword ? (
              <EyeOff className={`w-5 h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
            ) : (
              <Eye className={`w-5 h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
            )}
          </button>
        </div>
        {errors.password && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 mt-2 text-red-500 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{errors.password}</span>
          </motion.div>
        )}
      </div>

      {/* Admin Hint */}
      <div className={`text-xs p-3 rounded-lg ${isDark ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
        <i className="fas fa-info-circle mr-2"></i>
        <span>Admin login: <strong>admin@gmail.com</strong> / <strong>admin123</strong></span>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <span className={`text-sm ${isDark ? "text-gray-400 group-hover:text-gray-300" : "text-gray-600 group-hover:text-gray-900"} transition-colors`}>
            Remember me
          </span>
        </label>
        <button
          type="button"
          className={`text-sm font-medium transition-colors ${
            isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
          }`}
        >
          Forgot password?
        </button>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Logging in...</span>
          </>
        ) : (
          <>
            <span>Login</span>
            <i className="fa-solid fa-arrow-right"></i>
          </>
        )}
      </motion.button>

      {/* Social Login Divider */}
      <div className="relative my-2">
        <div className={`absolute inset-0 flex items-center`}>
          <div className={`w-full border-t ${isDark ? "border-gray-700" : "border-gray-300"}`}></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className={`px-4 ${isDark ? "bg-gray-900 text-gray-500" : "bg-white text-gray-600"}`}>
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
            isDark
              ? "border-gray-700 hover:bg-gray-800 text-gray-300"
              : "border-gray-300 hover:bg-gray-50 text-gray-700"
          }`}
        >
          <i className="fa-brands fa-google text-lg"></i>
          <span className="font-medium">Google</span>
        </button>
        <button
          type="button"
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
            isDark
              ? "border-gray-700 hover:bg-gray-800 text-gray-300"
              : "border-gray-300 hover:bg-gray-50 text-gray-700"
          }`}
        >
          <i className="fa-brands fa-facebook text-lg"></i>
          <span className="font-medium">Facebook</span>
        </button>
      </div>
    </motion.form>
  );
}