import { account } from "@/libs/appwrite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Models } from "react-native-appwrite";

interface AuthContextType {
  loading: boolean;
  user: Models.User<Models.Preferences> | null;
  isFirstTimeUser: "yes" | "no" | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setUser: (user: Models.User<Models.Preferences> | null) => void;
  setIsFirstTimeUser: (isFirstTimeUser: "yes" | "no" | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [error, setError] = useState(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<"yes" | "no" | null>(
    null,
  );

  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      await account.createEmailPasswordSession({
        email,
        password,
      });

      setUser(await account.get());
      setIsFirstTimeUser("no");
      setError(null);
    } catch (error) {
      console.error("Error logging in:", error);
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await account.deleteSessions();
      setUser(null);
      setIsFirstTimeUser("no");
      setError(null);
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const value = await AsyncStorage.getItem("isFirstTimeUser");
        if (value === null) {
          setIsFirstTimeUser("yes");
        } else {
          setIsFirstTimeUser("no");
        }

        const response = await account.get();
        setUser(response);
        setError(null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (loading || isFirstTimeUser === null) return;

    const timeout = setTimeout(() => {
      if (!user) {
        if (isFirstTimeUser === "yes") {
          router.replace("/(auth)/welcome");
        } else {
          router.replace("/(auth)/sign-in");
        }
      } else {
        router.replace("/");
      }
    }, 10);

    return () => clearTimeout(timeout);
  }, [user, loading, isFirstTimeUser]);

  return (
    <AuthContext.Provider
      value={{
        loading,
        user,
        isFirstTimeUser,
        login,
        logout,
        setLoading,
        setUser,
        setIsFirstTimeUser,
      }}
    >
      {loading || isFirstTimeUser === null ? (
        <ActivityIndicator
          size="large"
          color="#2D6A4F"
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        />
      ) : (
        children
      )}
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
