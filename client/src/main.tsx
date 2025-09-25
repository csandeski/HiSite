import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initFacebookPixel } from "./services/fbPixel";

// Initialize Facebook Pixel to capture fbclid from URL
initFacebookPixel();

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ PWA Service Worker registered:', registration);
      })
      .catch(error => {
        console.error('❌ PWA Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
