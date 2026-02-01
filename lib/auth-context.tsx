import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { trpc } from "./trpc";

type UserRole = "user" | "musician" | "admin";
type UserStatus = "pending" | "approved" | "suspended";

interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  profilePhoto: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPending: boolean;
  isApproved: boolean;
  isSuspended: boolean;
  isAdmin: boolean;
  isMusician: boolean;
  isUser: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, refetch } = trpc.auth.me.useQuery();

  const value: AuthContextType = {
    user: user as User | null,
    isLoading,
    isAuthenticated: !!user,
    isPending: user?.status === "pending",
    isApproved: user?.status === "approved",
    isSuspended: user?.status === "suspended",
    isAdmin: user?.role === "admin",
    isMusician: user?.role === "musician",
    isUser: user?.role === "user",
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
