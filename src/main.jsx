import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
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
