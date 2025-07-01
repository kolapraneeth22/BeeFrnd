import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import React from "react";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import {Loader} from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore()
  const { theme, initializeTheme } = useThemeStore();


  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme); // 🔥 Applies theme on load
      console.log("Theme applied to HTML:", theme);
    }
  }, [theme]);



  
  console.log({ authUser, isCheckingAuth });
  
  if (isCheckingAuth)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin h-10 w-10" />
      </div>
    );
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </div>
  );
}
export default App;
