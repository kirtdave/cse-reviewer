import React from "react";
import { motion } from "framer-motion";

export function AlertMessage({ message, type = "success" }) {
  const isSuccess = type === "success";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        isSuccess 
          ? "bg-green-500/10 border-green-500 text-green-500" 
          : "bg-red-500/10 border-red-500 text-red-500"
      } border px-3 py-2 rounded-lg text-sm`}
    >
      {message}
    </motion.div>
  );
}