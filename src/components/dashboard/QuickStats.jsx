import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { generateKPIData } from "../../utils/kpiUtils";

const CircularRing = ({ pct, size = 80, stroke = 8, gradient, isDark }) => {
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
        <span className={`lg:text-xl text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{pct}%</span>
      </div>
    </div>
  );
};

// Mobile-specific compact card
const MobileStatCard = ({ k, index, isDark }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className={`relative overflow-hidden ${isDark ? "bg-gray-800/80" : "bg-white"} backdrop-blur-xl rounded-xl p-3 border ${isDark ? "border-gray-700" : "border-gray-200"} shadow-lg`}
  >
    {/* Icon and Title */}
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${k.gradient} flex items-center justify-center shadow-md`}>
        <i className={`fa-solid ${k.icon} text-white text-sm`}></i>
      </div>
      <h3 className={`font-semibold text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        {k.title}
      </h3>
    </div>

    {/* Value */}
    <p className={`text-2xl font-bold mb-1 bg-gradient-to-r ${k.gradient} bg-clip-text text-transparent`}>
      {k.value}
    </p>

    {/* Note */}
    <div className="flex items-center gap-1">
      <Sparkles className={`w-3 h-3 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
      <p className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        {k.note}
      </p>
    </div>

    {/* Small progress indicator */}
    <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${k.percent}%` }}
        transition={{ duration: 1, delay: index * 0.1 }}
        className={`h-full bg-gradient-to-r ${k.gradient}`}
      />
    </div>
  </motion.div>
);

// Desktop card (original design)
const DesktopStatCard = ({ k, index, isDark }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className={`relative overflow-hidden ${isDark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-xl rounded-2xl p-6 border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl hover:shadow-2xl transition-all group`}
  >
    <motion.div
      className={`absolute inset-0 bg-gradient-to-br ${k.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
    />
    
    <div className="relative z-10 flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${k.gradient} flex items-center justify-center shadow-lg`}
          >
            <i className={`fa-solid ${k.icon} text-white text-lg`}></i>
          </motion.div>
          <h3 className={`font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            {k.title}
          </h3>
        </div>
        <p className={`text-3xl font-bold mb-1 bg-gradient-to-r ${k.gradient} bg-clip-text text-transparent`}>
          {k.value}
        </p>
        <div className="flex items-center gap-1">
          <Sparkles className={`w-3 h-3 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {k.note}
          </p>
        </div>
      </div>
      <CircularRing pct={k.percent} gradient={k.gradient} isDark={isDark} />
    </div>

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
  </motion.div>
);

export default function QuickStats({ theme = "light", data }) {
  const isDark = theme === "dark";
  const kpis = generateKPIData(data);

  return (
    <>
      {/* Mobile Layout - 2x2 Compact Grid */}
      <section className="grid grid-cols-2 gap-3 lg:hidden">
        {kpis.map((k, index) => (
          <MobileStatCard key={index} k={k} index={index} isDark={isDark} />
        ))}
      </section>

      {/* Desktop Layout - Original 4-column Grid */}
      <section className="hidden lg:grid lg:grid-cols-4 gap-4">
        {kpis.map((k, index) => (
          <DesktopStatCard key={index} k={k} index={index} isDark={isDark} />
        ))}
      </section>
    </>
  );
}