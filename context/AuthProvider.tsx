import { account } from "@/libs/appwrite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { ID, Models } from "react-native-appwrite";

interface AuthContextType {
  loading: boolean;
  user: Models.User<AppPrefs> | null;
  isFirstTimeUser: "yes" | "no" | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setUser: (user: Models.User<AppPrefs> | null) => void;
  setIsFirstTimeUser: (isFirstTimeUser: "yes" | "no" | null) => void;
}

interface AppPrefs extends Models.Preferences {
  onboardingComplete?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(true);
  const [user, setUser] = useState<Models.User<AppPrefs> | null>(null);
  // const [error, setError] = useState(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<"yes" | "no" | null>(
    null,
  );

  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      try {
        await account.createEmailPasswordSession({
          email,
          password,
        });

        setUser((await account.get()) as Models.User<AppPrefs>);
        setIsFirstTimeUser("no");
        await AsyncStorage.setItem("isFirstTimeUser", "no");
        // setError(null);
      } catch (error: any) {
        if (error.type !== "user_session_already_exists") {
          console.error("Error logging in:", error);
          throw error; // Rethrow to handle in UI
        }
      }
      const currentUser = (await account.get()) as Models.User<AppPrefs>;
      setUser(currentUser);
      setIsFirstTimeUser("no");
      await AsyncStorage.setItem("isFirstTimeUser", "no");
    } catch (error) {
      console.error("Error logging in:", error);
      setLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      await account.create({
        userId: ID.unique(),
        email: email,
        password: password,
        name: name,
      });
      await account.createEmailPasswordSession({ email, password });
      setUser((await account.get()) as Models.User<AppPrefs>);
      setIsFirstTimeUser("no");
      await AsyncStorage.setItem("isFirstTimeUser", "no");
      // setError(null);
    } catch (error) {
      console.error("Error registering user:", error);
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await account.deleteSessions();
      setUser(null);
      setIsFirstTimeUser("no");
      // setError(null);
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
        setUser(response as Models.User<AppPrefs>);
        // setError(null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
        setAppLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (appLoading || isFirstTimeUser === null) return;

    const timeout = setTimeout(() => {
      if (!user) {
        if (isFirstTimeUser === "yes") {
          router.replace("/(auth)/welcome");
        } else {
          router.replace("/(auth)/sign-in");
        }
      } else {
        // ✅ Check if onboarding is complete
        const onboardingComplete = user.prefs?.onboardingComplete === true;

        if (!onboardingComplete) {
          router.replace("/(onboarding)/Quiz");
        } else {
          router.replace("/");
        }
      }
    }, 10);

    return () => clearTimeout(timeout);
  }, [user, appLoading, isFirstTimeUser]);

  return (
    <AuthContext.Provider
      value={{
        loading,
        user,
        isFirstTimeUser,
        login,
        register,
        logout,
        setLoading,
        setUser,
        setIsFirstTimeUser,
      }}
    >
      {appLoading || isFirstTimeUser === null ? (
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
