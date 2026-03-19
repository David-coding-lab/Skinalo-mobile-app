import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  loading: boolean;
  user: any;
  error: any;
  isFirstTimeUser: "yes" | "no" | null;
  setLoading: (loading: boolean) => void;
  setUser: (user: any) => void;
  setError: (error: any) => void;
  setIsFirstTimeUser: (isFirstTimeUser: "yes" | "no" | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<"yes" | "no" | null>(
    null,
  );

  const checkFirstTimeUser = async () => {
    try {
      const value = await AsyncStorage.getItem("isFirstTimeUser");
      if (value === null) {
        await AsyncStorage.setItem("isFirstTimeUser", "no");
        setIsFirstTimeUser("no");
        return true;
      }
    } catch (error) {
      console.error("Error checking first time user:", error);
      return true;
    }
  };

  useEffect(() => {
    checkFirstTimeUser();

    if (isFirstTimeUser === "yes") router.push("/welcome");
  }, [loading, user, isFirstTimeUser]);

  return (
    <AuthContext.Provider
      value={{
        loading,
        user,
        error,
        isFirstTimeUser,
        setLoading,
        setUser,
        setError,
        setIsFirstTimeUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
