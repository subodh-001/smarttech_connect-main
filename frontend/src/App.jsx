import React from "react";
import { AuthProvider } from "./contexts/NewAuthContext";
import Routes from "./Routes";

function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App;