import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./kanban-dashboard/dashboard";
// import App from "./simple-squares/squares"
// import App from "./complex-draggable-list/draggable-list";
import App from "./simple-draggable-list/draggable-list";

import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
