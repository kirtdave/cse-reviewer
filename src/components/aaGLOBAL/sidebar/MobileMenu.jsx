// ============================================================================
// components/MobileMenu.jsx
// ============================================================================
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileSection from './ProfileSection';
import Navigation from './Navigation';
import BottomActions from './BottomActions';

const MobileMenu = ({
  isOpen,
  onClose,
  navItems,
  location,
  isLoggedIn,
  user,
  isDark,
  toggleTheme,
  openLogin,
  openSignup,
  handleLogout,
  goToProfile
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.aside
          className={`lg:hidden fixed top-0 right-0 h-full w-80 z-50 ${isDark ? "bg-gray-900" : "bg-white"} shadow-2xl overflow-y-auto flex flex-col`}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          <div className={`px-6 py-5 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-book-open-reader text-white text-lg"></i>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CSE REVIEWER
              </span>
            </div>
          </div>

          <ProfileSection
            isLoggedIn={isLoggedIn}
            user={user}
            isDark={isDark}
            goToProfile={goToProfile}
            isMobile={true}
          />

          <Navigation
            navItems={navItems}
            location={location}
            isDark={isDark}
            onNavigate={onClose}
            isMobile={true}
          />

          <BottomActions
            isLoggedIn={isLoggedIn}
            isDark={isDark}
            toggleTheme={toggleTheme}
            openLogin={openLogin}
            openSignup={openSignup}
            handleLogout={handleLogout}
            isMobile={true}
          />
        </motion.aside>
      </>
    )}
  </AnimatePresence>
);

export default MobileMenu;