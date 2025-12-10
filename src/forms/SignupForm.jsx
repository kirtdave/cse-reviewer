import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { signup } from '../services/authService';

export default function SignupForm({ theme, onSignup }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isDark = theme === "dark";

  const passwordRequirements = [
    { test: (p) => p.length >= 8, text: "At least 8 characters" },
    { test: (p) => /[A-Z]/.test(p), text: "One uppercase letter" },
    { test: (p) => /[0-9]/.test(p), text: "One number" },
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!name) {
      newErrors.name = "Name is required";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!agreeTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const data = await signup(name, email, password);
      onSignup(data.user);
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
      {/* Name Field */}
      <div>
        <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          Full Name
        </label>
        <div className="relative">
          <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2">
            <User className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
          </div>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors({ ...errors, name: "" });
            }}
            className={`w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border outline-none transition-all ${
              errors.name
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : isDark
                ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
          />
        </div>
        {errors.name && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 mt-1.5 text-red-500 text-xs sm:text-sm"
          >
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{errors.name}</span>
          </motion.div>
        )}
      </div>

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
            placeholder="Create a password"
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
        
        {/* Password Requirements - Compact on Mobile */}
        {password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2"
          >
            {passwordRequirements.map((req, i) => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircle2
                  className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                    req.test(password) ? "text-green-500" : isDark ? "text-gray-600" : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-xs ${
                    req.test(password)
                      ? "text-green-500"
                      : isDark
                      ? "text-gray-500"
                      : "text-gray-600"
                  }`}
                >
                  {req.text}
                </span>
              </div>
            ))}
          </motion.div>
        )}
        
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

      {/* Confirm Password Field */}
      <div>
        <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2">
            <Lock className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors({ ...errors, confirmPassword: "" });
            }}
            className={`w-full pl-9 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border outline-none transition-all ${
              errors.confirmPassword
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : isDark
                ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform active:scale-95 p-1"
          >
            {showConfirmPassword ? (
              <EyeOff className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
            ) : (
              <Eye className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 mt-1.5 text-red-500 text-xs sm:text-sm"
          >
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{errors.confirmPassword}</span>
          </motion.div>
        )}
      </div>

      {/* Terms & Conditions - Compact on Mobile */}
      <div>
        <label className="flex items-start gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => {
              setAgreeTerms(e.target.checked);
              setErrors({ ...errors, terms: "" });
            }}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
          />
          <span className={`text-xs sm:text-sm leading-tight ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            I agree to the{" "}
            <button type="button" className="text-blue-500 hover:text-blue-600 active:text-blue-700 font-medium">
              Terms & Conditions
            </button>{" "}
            and{" "}
            <button type="button" className="text-blue-500 hover:text-blue-600 active:text-blue-700 font-medium">
              Privacy Policy
            </button>
          </span>
        </label>
        {errors.terms && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 mt-1.5 text-red-500 text-xs sm:text-sm"
          >
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{errors.terms}</span>
          </motion.div>
        )}
      </div>

      {/* Submit Button */}
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
            <span>Creating account...</span>
          </>
        ) : (
          <>
            <span>Create Account</span>
            <i className="fa-solid fa-arrow-right text-sm"></i>
          </>
        )}
      </motion.button>

      {/* Social Signup Divider - COMMENTED OUT */}
      {/* 
      <div className="relative my-1 sm:my-2">
        <div className={`absolute inset-0 flex items-center`}>
          <div className={`w-full border-t ${isDark ? "border-gray-700" : "border-gray-300"}`}></div>
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className={`px-3 sm:px-4 ${isDark ? "bg-gray-900 text-gray-500" : "bg-white text-gray-600"}`}>
            Or sign up with
          </span>
        </div>
      </div>
      */}

      {/* Social Signup Buttons - COMMENTED OUT (Feature not yet implemented) */}
      {/* 
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
      */}
    </motion.form>
  );
}