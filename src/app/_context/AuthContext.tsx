"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, role?: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, role: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Read state on load
  useEffect(() => {
    try {
      const stored = localStorage.getItem("connectNowUser");
      if (stored) {
        setUser(JSON.parse(stored) as User);
      }
    } catch (e) {
      console.error("Failed to read auth state", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, role = "member") => {
    setLoading(true);
    // Simulating quick API latency
    await new Promise((r) => setTimeout(r, 600));
    
    // Pick name depending on email or default to Max Muster
    let firstName = "Max";
    let lastName = "Mustermann";
    if (email.includes("install")) {
      firstName = "Max";
      lastName = "Weber";
      role = "installer";
    }

    const newUser: User = {
      firstName,
      lastName,
      email,
      role,
    };

    localStorage.setItem("connectNowUser", JSON.stringify(newUser));
    setUser(newUser);
    setLoading(false);
    return true;
  };

  const register = async (firstName: string, lastName: string, email: string, role: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const newUser: User = {
      firstName,
      lastName,
      email,
      role,
    };

    localStorage.setItem("connectNowUser", JSON.stringify(newUser));
    setUser(newUser);
    setLoading(false);
    return true;
  };

  const logout = () => {
    localStorage.removeItem("connectNowUser");
    setUser(null);
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
