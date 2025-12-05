import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const CategoryAndSettings = ({
  theme,
  categories,
  setCategories,
  timeLimit,
  setTimeLimit,
  printExam,
  setPrintExam,
  file,
  setFile,
}) => {
  const isDark = theme === "dark";

  const toggleCategory = (key) =>
    setCategories((prev) => ({
      ...prev,
      [key]: { ...prev[key], checked: !prev[key].checked },
    }));

  const setDifficulty = (key, level) =>
    setCategories((prev) => ({
      ...prev,
      [key]: { ...prev[key], difficulty: level },
    }));

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Settings Section - Mobile First (shows first on mobile) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:hidden gap-4"
      >
        <section className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-xl p-4 border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl`}>
          <h3 className="text-base font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            STEP 3: Set Time Limit
          </h3>
          
          <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Time Limit (minutes)
          </label>
          <select
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
            className={`w-full px-3 py-2.5 rounded-xl border text-sm ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
          >
            <option value="60">60 minutes</option>
            <option value="120">120 minutes</option>
            <option value="180">180 minutes</option>
          </select>
          <p className={`text-xs mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {timeLimit} minutes simulates standard test duration.
          </p>

          <div className={`mt-4 pt-4 border-t ${isDark ? "border-gray-700/50" : "border-gray-300/50"}`}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-print text-white text-sm"></i>
              </div>
              <div className="flex-1">
                <div className={`text-xs font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                  Print exam questionnaire?
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPrintExam(true)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      printExam
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                        : `${isDark ? "bg-gray-800 text-gray-400 active:bg-gray-700" : "bg-gray-100 text-gray-600 active:bg-gray-200"}`
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setPrintExam(false)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      !printExam
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                        : `${isDark ? "bg-gray-800 text-gray-400 active:bg-gray-700" : "bg-gray-100 text-gray-600 active:bg-gray-200"}`
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {printExam && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl border-2 border-dashed ${isDark ? "border-gray-700" : "border-gray-300"} p-5 rounded-xl flex flex-col justify-center items-center text-center min-h-[140px]`}
            >
              {!file ? (
                <label className="cursor-pointer flex flex-col items-center gap-2.5 w-full">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <i className="fa-solid fa-file-arrow-up text-white text-lg"></i>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                      Upload exam PDF file
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Tap to browse
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              ) : (
                <div className="flex flex-col items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <i className="fa-solid fa-file-pdf text-white text-lg"></i>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"} truncate max-w-[200px]`}>
                      {file.name}
                    </p>
                    <button
                      onClick={() => setFile(null)}
                      className="text-xs text-red-500 hover:text-red-400 mt-2 underline"
                    >
                      Remove file
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Categories Section */}
      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-6 w-full lg:w-[70%] border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl max-h-[500px] overflow-y-auto`}
      >
        <h2 className="text-base lg:text-lg font-bold mb-4 lg:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          STEP 2: Choose Category
        </h2>

        {/* MOBILE - Simplified Cards */}
        <div className="lg:hidden space-y-3">
          {Object.keys(categories).map((cat, i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`p-3 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-gray-50/50"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}
            >
              <label className="flex items-center gap-2.5 cursor-pointer mb-3">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={categories[cat].checked}
                    onChange={() => toggleCategory(cat)}
                    className="w-5 h-5 rounded border-2 border-gray-600 appearance-none checked:bg-gradient-to-br checked:from-blue-500 checked:to-purple-600 cursor-pointer transition-all"
                  />
                  {categories[cat].checked && (
                    <i className="fa-solid fa-check absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs pointer-events-none"></i>
                  )}
                </div>
                <span className={`text-sm font-medium flex-1 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                  {cat}
                </span>
              </label>

              {/* Difficulty Pills */}
              <div className="flex gap-2">
                {["Easy", "Normal", "Hard"].map((lvl) => (
                  <label key={lvl} className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name={`diff-${cat}`}
                      checked={categories[cat].difficulty === lvl}
                      onChange={() => setDifficulty(cat, lvl)}
                      className="hidden"
                    />
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-medium text-center transition-all ${
                      categories[cat].difficulty === lvl
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                        : `${isDark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-600"}`
                    }`}>
                      {lvl}
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* DESKTOP - Table Layout */}
        <div className="hidden lg:block overflow-x-auto">
          <div className="min-w-[600px]">
            <div className={`grid grid-cols-5 gap-4 font-semibold text-sm mb-4 pb-3 border-b ${isDark ? "border-gray-700/50" : "border-gray-300/50"}`}>
              <div className="col-span-2">Main Category</div>
              <div className="text-center">Easy</div>
              <div className="text-center">Normal</div>
              <div className="text-center">Hard</div>
            </div>

            <div className="space-y-3">
              {Object.keys(categories).map((cat, i) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={`grid grid-cols-5 gap-4 items-center p-3 rounded-xl ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-100/50"} transition-colors`}
                >
                  <label className="flex items-center gap-3 col-span-2 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={categories[cat].checked}
                        onChange={() => toggleCategory(cat)}
                        className="w-5 h-5 rounded border-2 border-gray-600 appearance-none checked:bg-gradient-to-br checked:from-blue-500 checked:to-purple-600 cursor-pointer transition-all"
                      />
                      {categories[cat].checked && (
                        <i className="fa-solid fa-check absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs pointer-events-none"></i>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                      {cat}
                    </span>
                  </label>

                  {["Easy", "Normal", "Hard"].map((lvl) => (
                    <div key={lvl} className="flex justify-center">
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name={`diff-${cat}`}
                          checked={categories[cat].difficulty === lvl}
                          onChange={() => setDifficulty(cat, lvl)}
                          className="w-5 h-5 appearance-none rounded-full border-2 border-gray-600 checked:border-blue-500 checked:bg-gradient-to-br checked:from-blue-500 checked:to-purple-600 cursor-pointer transition-all"
                        />
                      </label>
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Settings Section - Desktop Only (RIGHT SIDE) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col w-full lg:w-[30%] gap-4"
      >
        <section className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-5 border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl`}>
          <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            STEP 3: Set Time Limit
          </h3>
          
          <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Time Limit (minutes)
          </label>
          <select
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
          >
            <option value="60">60 minutes</option>
            <option value="120">120 minutes</option>
            <option value="180">180 minutes</option>
          </select>
          <p className={`text-xs mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {timeLimit} minutes simulates standard test duration.
          </p>

          <div className={`mt-6 pt-6 border-t ${isDark ? "border-gray-700/50" : "border-gray-300/50"}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-print text-white"></i>
              </div>
              <div className="flex-1">
                <div className={`text-sm font-medium mb-3 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                  Print exam questionnaire?
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPrintExam(true)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      printExam
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : `${isDark ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setPrintExam(false)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !printExam
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : `${isDark ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {printExam && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl border-2 border-dashed ${isDark ? "border-gray-700" : "border-gray-300"} p-6 rounded-2xl flex flex-col justify-center items-center text-center min-h-[160px]`}
            >
              {!file ? (
                <label className="cursor-pointer flex flex-col items-center gap-3 w-full">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <i className="fa-solid fa-file-arrow-up text-white text-xl"></i>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                      Upload exam PDF file
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Click to browse
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <i className="fa-solid fa-file-pdf text-white text-xl"></i>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                      {file.name}
                    </p>
                    <button
                      onClick={() => setFile(null)}
                      className="text-xs text-red-500 hover:text-red-400 mt-2 underline"
                    >
                      Remove file
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CategoryAndSettings;