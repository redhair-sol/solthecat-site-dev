import React from "react";
import { Instagram } from "lucide-react";
// motion is referenced as <motion.a> in JSX below — eslint without
// eslint-plugin-react cannot track JSX-only identifiers as "used".
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

function InstagramFloatingButton() {
  return (
    <motion.a
      href="https://www.instagram.com/solthecat01/"
      target="_blank"
      rel="noopener noreferrer"
      className="block fixed bottom-24 lg:bottom-6 right-4 lg:right-[max(1rem,calc((100vw_-_1280px)/2_+_1rem))] z-[1100] bg-[#8b6b8e] text-[var(--sol-cream)] rounded-full p-3 shadow-lg opacity-50 lg:opacity-70 hover:opacity-100 transition-opacity"
      aria-label="Follow Sol on Instagram"
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      }}
    >
      <Instagram className="w-6 h-6" />
    </motion.a>
  );
}

export default InstagramFloatingButton;
