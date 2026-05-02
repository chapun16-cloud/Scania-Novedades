import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type AuthUser = {
  displayName: string;
  role: "technician" | "supervisor";
  defaultShift: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("scania_auth_user")
      .then((stored) => {
        if (stored) setUser(JSON.parse(stored) as AuthUser);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (u: AuthUser) => {
    await AsyncStorage.setItem("scania_auth_user", JSON.stringify(u));
    setUser(u);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("scania_auth_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
