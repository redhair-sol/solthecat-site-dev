// src/components/MobileMenu.jsx

import React from "react";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
// motion is referenced as <motion.img> below — eslint without
// eslint-plugin-react cannot track JSX-only identifiers as "used".
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function MobileMenu({ isOpen, onClose }) {
  const linkClasses = ({ isActive }) =>
    `text-2xl transition-colors ${
      isActive
        ? "text-[#1a1614] border-b-2 border-[#d4a5a5]"
        : "text-[#4a3f37] hover:text-[#1a1614]"
    }`;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sliding menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#ede4d3] z-50 transform
                    transition-transform duration-300 ${
                      isOpen ? "translate-x-0" : "-translate-x-full"
                    } shadow-lg flex flex-col`}
      >
        {/* Close button only */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 shadow-md hover:scale-110 transition-transform z-50"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        {/* Navigation */}
        <nav
          className="flex flex-col p-8 gap-6 mt-12 text-2xl"
          style={{ fontFamily: '"Dancing Script", cursive' }}
        >
          <NavLink to="/" onClick={onClose} className={linkClasses} end>
            Home
          </NavLink>

          <NavLink to="/episodes" onClick={onClose} className={linkClasses}>
            Episodes
          </NavLink>

          <NavLink to="/map" onClick={onClose} className={linkClasses}>
            Map
          </NavLink>

          <NavLink to="/gallery" onClick={onClose} className={linkClasses}>
            Gallery
          </NavLink>

          <NavLink to="/games" onClick={onClose} className={linkClasses}>
            Games
          </NavLink>

          <NavLink to="/solcam" onClick={onClose} className={linkClasses}>
            SolCam
          </NavLink>

          <NavLink to="/whoissol" onClick={onClose} className={linkClasses}>
            About
          </NavLink>

          <NavLink to="/shop" onClick={onClose} className={linkClasses}>
            Shop
          </NavLink>

          <NavLink to="/contact" onClick={onClose} className={linkClasses}>
            Contact
          </NavLink>
        </nav>

        {/* Draggable cat at the bottom */}
        <div className="mt-auto p-4">
          <motion.img
            src="/images/SOL.webp"
            alt="Sol the Cat"
            className="w-full max-h-52 object-contain mx-auto rounded-xl cursor-grab active:cursor-grabbing"
            drag
            dragConstraints={{ top: -50, bottom: 50, left: -50, right: 50 }}
            animate={{ x: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        </div>
      </div>
    </>
  );
}
