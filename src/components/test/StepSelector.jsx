import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const StepSelector = ({ theme, selectedType, setSelectedType }) => {
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const cards = [
    {
      key: "AI-Generated",
      title: "AI-Generated Questions",
      desc: "Manually choose categories and difficulty for a custom test.",
      icon: "fa-robot",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      key: "Custom",
      title: "Custom Questionnaire",
      desc: "Manually craft a personalized test for focused review.",
      icon: "fa-user-pen",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      key: "Admin",
      title: "Admin Questionnaire",
      desc: "Uses verified sets from the system administrator.",
      icon: "fa-building-columns",
      gradient: "from-cyan-500 to-blue-500",
    },
  ];

  return (
    <section>
      <h2 className="text-base lg:text-lg font-bold mb-3 lg:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        STEP 1: Choose Question Source
      </h2>

      {/* MOBILE - Vertical Stack */}
      <div className="flex flex-col gap-3 lg:hidden">
        {cards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            onClick={() => setSelectedType(card.key)}
            className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 ${
              selectedType === card.key
                ? `bg-gradient-to-br ${card.gradient} shadow-lg`
                : `${isDark ? "bg-gray-900/60 active:bg-gray-800/80" : "bg-white/60 active:bg-white/80"} backdrop-blur-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedType === card.key ? "bg-white/20" : `bg-gradient-to-br ${card.gradient}`}`}>
                <i className={`fa-solid ${card.icon} text-lg text-white`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm mb-1 ${selectedType === card.key ? "text-white" : isDark ? "text-white" : "text-gray-900"}`}>
                  {card.title}
                </h3>
                <p className={`text-xs leading-relaxed ${selectedType === card.key ? "text-white/80" : isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {card.desc}
                </p>
              </div>
            </div>

            {/* ✅ Show Edit button only when Custom is SELECTED */}
            {card.key === "Custom" && selectedType === "Custom" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/custom-setup", { state: { theme } });
                }}
                className="mt-3 w-full px-3 py-2 rounded-lg text-xs font-medium bg-white/10 backdrop-blur-sm text-white active:bg-white/20 transition-all flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-pen-to-square"></i>
                Edit Custom Tests
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* DESKTOP - 3 Column Grid */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            onClick={() => setSelectedType(card.key)}
            className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 h-full flex flex-col ${
              selectedType === card.key
                ? `bg-gradient-to-br ${card.gradient} shadow-2xl scale-105`
                : `${isDark ? "bg-gray-900/60 hover:bg-gray-800/80" : "bg-white/60 hover:bg-white/80"} backdrop-blur-xl border ${isDark ? "border-gray-800 hover:border-gray-700" : "border-gray-200 hover:border-gray-300"}`
            }`}
          >
            <div className="flex items-start gap-4 mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedType === card.key ? "bg-white/20" : `bg-gradient-to-br ${card.gradient}`}`}>
                <i className={`fa-solid ${card.icon} text-xl text-white`}></i>
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${selectedType === card.key ? "text-white" : isDark ? "text-white" : "text-gray-900"}`}>
                  {card.title}
                </h3>
                <p className={`text-sm ${selectedType === card.key ? "text-white/80" : isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {card.desc}
                </p>
              </div>
            </div>

            {/* ✅ Show Edit button only when Custom is SELECTED */}
            {card.key === "Custom" && selectedType === "Custom" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/custom-setup", { state: { theme } });
                }}
                className="mt-auto px-4 py-2 rounded-lg text-sm font-medium bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-pen-to-square"></i>
                Edit Custom Tests
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StepSelector;