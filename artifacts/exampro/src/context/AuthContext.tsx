import React, { createContext, useContext, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  useGetCurrentUser, 
  useLogin, 
  useRegister, 
  useLogout, 
  getGetCurrentUserQueryKey,
  type LoginRequest,
  type RegisterRequest,
  type UserProfile
} from "@workspace/api-client-react";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading } = useGetCurrentUser({
    query: {
      retry: false,
    }
  });

  const { mutateAsync: loginMutation } = useLogin();
  const { mutateAsync: registerMutation } = useRegister();
  const { mutateAsync: logoutMutation } = useLogout();

  const login = async (data: LoginRequest) => {
    try {
      await loginMutation({ data });
      await queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ 
        title: "Login failed", 
        description: err.response?.data?.message || err.message || "Invalid credentials", 
        variant: "destructive" 
      });
      throw err;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      await registerMutation({ data });
      toast({ title: "Account created!", description: "Please log in to continue." });
      setLocation("/login");
    } catch (err: any) {
      toast({ 
        title: "Registration failed", 
        description: err.response?.data?.message || err.message || "Something went wrong", 
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
      setLocation("/");
    } catch (err: any) {
      toast({ title: "Logout failed", description: "An error occurred during logout.", variant: "destructive" });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
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
