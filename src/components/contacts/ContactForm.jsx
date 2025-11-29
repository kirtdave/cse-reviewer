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
    
    // Validation
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
      
      // Clear success message after 5 seconds
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
      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl p-8 rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <i className="fa-solid fa-paper-plane text-white"></i>
        </div>
        <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Send Us a Message
        </h3>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500 text-green-500 text-sm"
        >
          {successMessage}
        </motion.div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500 text-red-500 text-sm"
        >
          {errorMessage}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Your Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Your Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Your Message
          </label>
          <textarea
            name="message"
            placeholder="How can we help you?"
            value={formData.message}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={6}
            className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed`}
            required
          />
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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