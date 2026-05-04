import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import routes from "./routes/routes.jsx";
import { AuthProvider } from './context/AuthContext.jsx';
import { VideoProvider } from './context/VideoContext';
import { ConfirmDialogHost } from './components/ConfirmDialog.jsx';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
  <AuthProvider>
  <VideoProvider>
    <RouterProvider router={routes} />
    {/* EN: Global confirm popup — used by confirmDialog() helper everywhere.
        BN: Global confirm popup — সব জায়গা থেকে confirmDialog() দিয়ে ব্যবহার হয়। */}
    <ConfirmDialogHost />
    </VideoProvider>
    </AuthProvider>
  </React.StrictMode>
);
