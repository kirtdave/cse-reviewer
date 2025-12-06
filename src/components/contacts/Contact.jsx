import React from "react";
import { motion } from "framer-motion";
import ContactHeader from "./ContactHeader";
import ContactForm from "./ContactForm";
import ContactSocial from "./ContactSocial";
import ContactInfo from "./ContactInfo";

export default function Contact({ theme = "dark" }) {
  const isDark = theme === "dark";

  return (
    <main className={`min-h-screen ${isDark ? "text-gray-100" : "text-gray-900"} font-sans relative transition-colors duration-500`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(63,167,214,0.08)_1px,_transparent_1px)] bg-[size:40px_40px]"
        />
      </div>

        <ContactHeader theme={theme} />

      <div className="relative z-10 px-3 pb-3 sm:px-4 sm:pb-4 lg:px-10 lg:pb-10">
        <div className="max-w-[1600px] mx-auto space-y-3 sm:space-y-4 lg:space-y-8">
          {/* Main Content - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            {/* Left Column: Form + Social Links */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <ContactForm theme={theme} />
              <ContactSocial theme={theme} />
            </div>

            {/* Right Column: Address, Metrics, Team */}
            <ContactInfo theme={theme} />
          </div>
        </div>
      </div>
    </main>
  );
}