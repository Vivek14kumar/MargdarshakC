import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ✅ Register Service Worker ONLY for student app
if ("serviceWorker" in navigator) {
  const isStudentApp = window.location.pathname.startsWith("/student");

  if (isStudentApp) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/student/service-worker.js", {
          scope: "/student/",
        })
        .then(() => console.log("Student PWA Service Worker registered"))
        .catch(err => console.error("SW registration failed", err));
    });
  }
}
