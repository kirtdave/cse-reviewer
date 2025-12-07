import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getContactStats } from "../../services/adminApi";

const CircularRing = ({ pct, size = 80, stroke = 8, color = "#8B5CF6" }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className="text-gray-700/20"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDasharray: `0 ${c}` }}
          animate={{ strokeDasharray: `${dash} ${c - dash}` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs sm:text-sm lg:text-xl font-bold">{pct}%</span>
      </div>
    </div>
  );
};

export default function ContactInfo({ theme = "dark" }) {
  const isDark = theme === "dark";
  const [stats, setStats] = useState({
    messagesReceivedPct: 100,
    activeInquiriesPct: 100,
    avgResponseTimePct: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getContactStats();
        if (result.success && result.stats) {
          setStats(result.stats);
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const contactMetrics = [
    { 
      title: "Messages Received", 
      pct: stats.messagesReceivedPct, 
      icon: "fa-envelope", 
      gradient: "from-blue-500 to-cyan-500",
      color: "#3B82F6" // Blue
    },
    { 
      title: "Active Inquiries", 
      pct: stats.activeInquiriesPct, 
      icon: "fa-ticket", 
      gradient: "from-orange-500 to-red-500",
      color: "#F97316" // Orange
    },
    { 
      title: "Avg Response Time", 
      pct: stats.avgResponseTimePct, 
      icon: "fa-clock", 
      gradient: "from-purple-500 to-pink-500",
      color: "#A855F7" // Purple
    },
  ];

  const teamMembers = [
    { name: "Rico Balcita", email: "Rico@Balcita", img: "https://i.pravatar.cc/150?img=1" },
    { name: "Januarene Fernandez", email: "Jan@Fernandez", img: "https://i.pravatar.cc/150?img=2" },
    { name: "Macky Caduyac", email: "Macky@Caduyac", img: "https://i.pravatar.cc/150?img=3" },
  ];

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Address & Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl p-3 sm:p-4 lg:p-6 rounded-xl lg:rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-lg lg:shadow-xl`}
      >
        <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 mb-2.5 sm:mb-3 lg:mb-4">
          <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-location-dot text-white text-sm sm:text-base"></i>
          </div>
          <h3 className={`text-sm sm:text-base lg:text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Our Address
          </h3>
        </div>
        <p className={`mb-2.5 sm:mb-3 lg:mb-4 text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          <i className="fa-solid fa-map-marker-alt text-blue-500 mr-2"></i>
          123 CSC St., Manila, Philippines
        </p>
        <div className="rounded-lg lg:rounded-xl overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.267707049173!2d121.030983!3d14.600332!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b7a1fa0d7d07%3A0x8e0c6e3a8c32e9b7!2sCivil%20Service%20Commission!5e0!3m2!1sen!2sph!4v1696232389745!5m2!1sen!2sph"
            width="100%"
            height="150"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Office Location"
            className="sm:h-[180px] lg:h-[200px]"
          />
        </div>
      </motion.div>

      {/* Contact Metrics */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {contactMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -5 }}
            className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl p-2 sm:p-3 lg:p-5 rounded-lg lg:rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-lg lg:shadow-xl flex flex-col items-center text-center relative`}
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20 rounded-lg lg:rounded-2xl backdrop-blur-sm">
                <i className="fa-solid fa-spinner fa-spin text-blue-500 text-xs sm:text-sm"></i>
              </div>
            )}
            <div className={`w-7 h-7 sm:w-9 sm:h-9 lg:w-12 lg:h-12 rounded-md lg:rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center mb-1.5 sm:mb-2 lg:mb-3`}>
              <i className={`fa-solid ${metric.icon} text-white text-xs sm:text-sm lg:text-xl`}></i>
            </div>
            <h4 className={`text-[10px] sm:text-xs lg:text-sm font-semibold mb-1.5 sm:mb-2 lg:mb-3 ${isDark ? "text-gray-300" : "text-gray-700"} leading-tight`}>
              {metric.title}
            </h4>
            
            {/* Mobile Ring */}
            <div className="block lg:hidden">
              <CircularRing pct={metric.pct} size={45} stroke={5} color={metric.color} />
            </div>
            
            {/* Desktop Ring */}
            <div className="hidden lg:block">
              <CircularRing pct={metric.pct} size={80} stroke={8} color={metric.color} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Support Team */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl p-3 sm:p-4 lg:p-6 rounded-xl lg:rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-lg lg:shadow-xl`}
      >
        <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 mb-3 sm:mb-4 lg:mb-6">
          <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-users text-white text-sm sm:text-base"></i>
          </div>
          <h3 className={`text-sm sm:text-base lg:text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Our Support Team
          </h3>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-6">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-1.5 sm:mb-2 lg:mb-3">
                <img 
                  src={member.img} 
                  alt={member.name} 
                  className="w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 rounded-full object-cover border-2 lg:border-4 border-blue-500/20"
                />
                <div className="absolute -bottom-0.5 -right-0.5 lg:-bottom-1 lg:-right-1 w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></div>
              </div>
              <h4 className={`font-semibold text-[10px] sm:text-xs lg:text-base ${isDark ? "text-white" : "text-gray-900"} text-center leading-tight`}>
                {member.name}
              </h4>
              <p className={`text-[9px] sm:text-xs lg:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} text-center`}>
                {member.email}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}