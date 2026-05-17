import React from "react";
import GlobalStyle from "./styles/GlobalStyle.js";
import ScrollToTop from "./components/ScrollToTop";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";
import BottomTabBar from "./components/BottomTabBar"; // mobile-only bottom nav (revertable — see component header)
import InstallPrompt from "./components/InstallPrompt"; // PWA install banner (Chromium-based browsers only)
import { Outlet } from "react-router-dom";
import "./index.css";

function App() {
  return (
    <>
      <GlobalStyle />
      <ScrollToTop />
      <Topbar />

      <div className="w-full min-h-screen bg-transparent flex flex-col items-center pt-20 xl:pt-24 pb-20 xl:pb-0">
        <div className="flex w-full max-w-screen-xl flex-grow bg-transparent">
          <main className="flex-grow px-4 py-2 md:py-6 w-full">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />

      {/* Bottom tab bar — mobile only.
          Instagram link now lives inside MoreMenu drawer, no longer a floating FAB. */}
      <BottomTabBar />

      {/* PWA install banner — appears when browser fires beforeinstallprompt */}
      <InstallPrompt />
    </>
  );
}

export default App;
