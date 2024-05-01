import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./App.tsx";
import App from "./kanban-dashboard/dashboard.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
