import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { CopilotKitLayer } from "./components/CopilotKitLayer";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CopilotKitLayer>
      <App />
    </CopilotKitLayer>
  </StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + "sw.js").catch(() => undefined);
  });
}
