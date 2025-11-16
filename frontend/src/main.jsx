import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NextUIProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </NextUIProvider>
  </StrictMode>
);
