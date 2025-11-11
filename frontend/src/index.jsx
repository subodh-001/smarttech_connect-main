import React from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";

const container = document.getElementById("root");
const root = createRoot(container);
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  // eslint-disable-next-line no-console
  console.warn("VITE_GOOGLE_CLIENT_ID is not set. Google sign-in will be disabled.");
}

const providerClientId = googleClientId || 'missing-google-client-id';

const appTree = (
  <GoogleOAuthProvider clientId={providerClientId}>
    <App />
  </GoogleOAuthProvider>
);

root.render(appTree);
