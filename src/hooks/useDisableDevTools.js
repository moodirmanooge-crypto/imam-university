// src/hooks/useDisableDevTools.js
import { useEffect } from "react";

// Hook-kan wuxuu xanibaa dhammaan hababka caadiga ah ee DevTools lagu furo
export default function useDisableDevTools() {
  useEffect(() => {
    // 1. Xannib right-click (context menu)
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // 2. Xannib fure-shortcuts-ka DevTools-ka
    const handleKeyDown = (e) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
      }

      // Ctrl+Shift+I / Ctrl+Shift+J (Inspect / Console)
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j")) {
        e.preventDefault();
      }

      // Ctrl+Shift+C (Element inspector)
      if (e.ctrlKey && e.shiftKey && (e.key === "C" || e.key === "c")) {
        e.preventDefault();
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
      }

      // Cmd+Option+I / Cmd+Option+J (Mac)
      if (e.metaKey && e.altKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j")) {
        e.preventDefault();
      }
    };

    // 3. (Ikhtiyaari) Isku day inuu ogaado marka DevTools la furay — waxay ku shaqaysaa qaar browser ah oo kaliya
    const detectDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > threshold || heightDiff > threshold) {
        // Halkan waxaad geli kartaa wax kale, tusaale: redirect ama warning
        console.clear();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    const interval = setInterval(detectDevTools, 1000);

    // Nadiifi event listeners marka component-ka la baabi'iyo
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, []);
}