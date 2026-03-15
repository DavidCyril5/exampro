import React, { createContext, useContext, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  useGetCurrentUser,
  useLogin,
  useLogout,
  getGetCurrentUserQueryKey,
  type LoginRequest,
  type UserProfile
} from "@workspace/api-client-react";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading } = useGetCurrentUser({
    query: { retry: false }
  });

  const { mutateAsync: loginMutation } = useLogin();
  const { mutateAsync: logoutMutation } = useLogout();

  const login = async (data: LoginRequest) => {
    try {
      await loginMutation({ data });
      await queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      toast({ title: "Welcome, Admin!", description: "Logged in successfully." });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.response?.data?.message || "Invalid credentials",
        variant: "destructive"
      });
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation();
      await queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
      toast({ title: "Logged out", description: "You have been successfully logged out." });
      setLocation("/login");
    } catch {
      toast({ title: "Logout failed", description: "An error occurred.", variant: "destructive" });
    }
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
