import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);

// ✅ Always register service worker
if ("serviceWorker" in navigator) {
  if (window.location.pathname.startsWith("/app")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/app/service-worker.js", {
        scope: "/app/"
      });
    });
  }
}
