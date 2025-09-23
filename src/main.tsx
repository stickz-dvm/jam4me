import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
        <ToastContainer />
    </React.StrictMode>
);
