import React from "react";
import { motion } from "framer-motion";

export default function ContactSocial({ theme = "dark" }) {
  const isDark = theme === "dark";

  const socialLinks = [
    { 
      title: "Email", 
      icon: "fa-envelope", 
      link: "mailto:OnlinecseReviewer@gmail.com", 
      data: "OnlinecseReviewer@gmail.com",
      gradient: "from-red-500 to-pink-500"
    },
    { 
      title: "Phone", 
      icon: "fa-phone", 
      link: "tel:+639123456789", 
      data: "+63 912 345 6789",
      gradient: "from-green-500 to-emerald-500"
    },
    { 
      title: "Facebook", 
      icon: "fa-facebook", 
      link: "https://www.facebook.com/kirtdave.galgo.7", 
      data: "@OnlineCSEReviewer",
      gradient: "from-blue-600 to-blue-500"
    },
    { 
      title: "Instagram", 
      icon: "fa-instagram", 
      link: "https://www.instagram.com/OnlineCSEReviewer", 
      data: "@OnlineCSEReviewer",
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      title: "Messenger", 
      icon: "fa-facebook-messenger", 
      link: "https://www.messenger.com/e2ee/t/9190576804351874", 
      data: "OnlineCSEReviewer",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      title: "WhatsApp", 
      icon: "fa-whatsapp", 
      link: "https://wa.me/639123456789", 
      data: "+63 912 345 6789",
      gradient: "from-green-600 to-green-500"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl p-6 rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <i className="fa-solid fa-share-nodes text-white"></i>
        </div>
        <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Connect With Us
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {socialLinks.map((social, index) => (
          <motion.a
            key={social.title}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
            className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? "bg-gray-800/50 hover:bg-gray-800" : "bg-gray-50/50 hover:bg-gray-100"} border ${isDark ? "border-gray-700/50" : "border-gray-200/50"} transition-all`}
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${social.gradient} flex items-center justify-center flex-shrink-0`}>
              <i className={`fa-brands ${social.icon} text-white text-lg`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                {social.title}
              </div>
              <div className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {social.data}
              </div>
            </div>
            <i className={`fa-solid fa-arrow-up-right-from-square text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}></i>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}