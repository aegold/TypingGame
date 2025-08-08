import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await axios.get("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.username) {
        setIsLoggedIn(true);
        setUsername(response.data.username);
      } else {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }
    } catch (error) {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token, user) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
    setUsername(user.username);
  };

  const logout = (redirectTo = "/login") => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUsername("");
    if (redirectTo) {
      navigate(redirectTo);
    }
  };

  const value = {
    isLoggedIn,
    username,
    isLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
