import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

// CircularRing Component
const CircularRing = ({ pct, size = 60, stroke = 6, isDark }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className={isDark ? "text-gray-700/30" : "text-gray-300/50"}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#gradient)"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDasharray: `0 ${c}` }}
          animate={{ strokeDasharray: `${dash} ${c - dash}` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{pct}%</span>
      </div>
    </div>
  );
};

/* Reusable KPI Card Component */
export default function KPICard({ 
  kpi, 
  theme = "light", 
  index = 0,
  size = "normal", 
  showAIIndicator = true,
  showRing = true
}) {
  const isDark = theme === "dark";
  
  // Size variants
  const sizeClasses = {
    small: "p-4",
    normal: "p-6",
    large: "p-8"
  };

  const titleSizes = {
    small: "text-xs",
    normal: "text-sm",
    large: "text-base"
  };

  const valueSizes = {
    small: "text-xl",
    normal: "text-3xl",
    large: "text-4xl"
  };

  const iconSizes = {
    small: "w-8 h-8 text-base",
    normal: "w-10 h-10 text-lg",
    large: "w-12 h-12 text-xl"
  };

  const ringSizes = {
    small: 50,
    normal: 80,
    large: 100
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden ${isDark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-xl rounded-2xl ${sizeClasses[size]} border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl hover:shadow-2xl transition-all group`}
    >
      {/* Animated gradient overlay on hover */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />
      
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className={`${iconSizes[size]} rounded-lg bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg`}
            >
              <i className={`fa-solid ${kpi.icon} text-white`}></i>
            </motion.div>
            <h3 className={`font-semibold ${titleSizes[size]} ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              {kpi.title}
            </h3>
          </div>
          <p className={`${valueSizes[size]} font-bold mb-1 bg-gradient-to-r ${kpi.gradient} bg-clip-text text-transparent`}>
            {kpi.value}
          </p>
          <div className="flex items-center gap-1">
            <Sparkles className={`w-3 h-3 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {kpi.note}
            </p>
          </div>
        </div>
        
        {showRing && (
          <CircularRing 
            pct={kpi.percent} 
            size={ringSizes[size]}
            gradient={kpi.gradient} 
            isDark={isDark} 
          />
        )}
      </div>

      {/* AI processing indicator */}
      {showAIIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.2 }}
          className={`flex items-center gap-2 pt-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-green-500"
          />
          <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-600"}`}>
            AI tracking active
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}