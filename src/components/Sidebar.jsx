import { useState } from "react";
import { Menu } from "lucide-react";
import MobileMenu from "./MobileMenu";

export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="md:hidden">
        {!menuOpen && (
          <button
            className="fixed top-4 left-4 z-50 p-2 bg-[#d4a5a5] text-black rounded shadow-md hover:scale-105 transition-transform"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      )}
    </>
  );
}
