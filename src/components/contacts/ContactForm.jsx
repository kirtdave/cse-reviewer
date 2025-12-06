import React, { useState } from "react";
import { motion } from "framer-motion";
import { submitContactMessage } from "../../services/contactService";

export default function ContactForm({ theme = "dark" }) {
  const isDark = theme === "dark";
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage("Please fill in all fields");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await submitContactMessage({
        name: formData.name,
        email: formData.email,
        message: formData.message
      });

      setSuccessMessage("✅ Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      setErrorMessage(`❌ ${error}`);
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl p-3 sm:p-4 lg:p-8 rounded-xl lg:rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-lg lg:shadow-xl`}
    >
      <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 mb-3 sm:mb-4 lg:mb-6">
        <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <i className="fa-solid fa-paper-plane text-white text-sm sm:text-base"></i>
        </div>
        <h3 className={`text-sm sm:text-base lg:text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Send Us a Message
        </h3>
      </div>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 sm:mb-4 p-2.5 sm:p-3 lg:p-4 rounded-lg lg:rounded-xl bg-green-500/10 border border-green-500 text-green-500 text-xs sm:text-sm"
        >
          {successMessage}
        </motion.div>
      )}

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 sm:mb-4 p-2.5 sm:p-3 lg:p-4 rounded-lg lg:rounded-xl bg-red-500/10 border border-red-500 text-red-500 text-xs sm:text-sm"
        >
          {errorMessage}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5 lg:space-y-4">
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Your Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 sm:px-3.5 sm:py-2.5 lg:px-4 lg:py-3 text-sm rounded-lg lg:rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            required
          />
        </div>

        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Your Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 sm:px-3.5 sm:py-2.5 lg:px-4 lg:py-3 text-sm rounded-lg lg:rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            required
          />
        </div>

        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Your Message
          </label>
          <textarea
            name="message"
            placeholder="How can we help you?"
            value={formData.message}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={4}
            className={`w-full px-3 py-2 sm:px-3.5 sm:py-2.5 lg:px-4 lg:py-3 text-sm rounded-lg lg:rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed`}
            required
          />
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className="w-full py-2.5 sm:py-3 lg:py-3.5 rounded-lg lg:rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Sending...
            </>
          ) : (
            <>
              <i className="fa-solid fa-paper-plane"></i>
              Send Message
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}