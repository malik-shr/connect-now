"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  installerId?: string;
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
    
    let firstName = "Max";
    let lastName = "Mustermann";
    let installerId: string | undefined = undefined;

    const emailLower = email.toLowerCase().trim();

    if (emailLower === "user1@connect-now.io") {
      firstName = "Kunde";
      lastName = "Eins";
      role = "member";
    } else if (emailLower === "user2@connect-now.io") {
      firstName = "Kunde";
      lastName = "Zwei";
      role = "member";
    } else if (emailLower === "install@connect-now.io" || emailLower === "installer1@connect-now.io") {
      firstName = "Max";
      lastName = "Weber";
      role = "installer";
      installerId = "inst-1";
    } else if (emailLower === "installer2@connect-now.io") {
      firstName = "Alex";
      lastName = "Wagner";
      role = "installer";
      installerId = "inst-3";
    } else if (emailLower === "admin@connect-now.io" || emailLower.includes("vnb")) {
      firstName = "Dr. Andrea";
      lastName = "Kraft";
      role = "admin";
    }

    const newUser: User = {
      firstName,
      lastName,
      email,
      role,
      installerId,
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
