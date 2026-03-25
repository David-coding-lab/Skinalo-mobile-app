import { account } from "@/libs/appwrite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, usePathname } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ActivityIndicator } from "react-native";
import { ID, Models } from "react-native-appwrite";

interface AuthContextType {
  loading: boolean;
  user: Models.User<AppPrefs> | null;
  isFirstTimeUser: "yes" | "no" | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setUser: (user: Models.User<AppPrefs> | null) => void;
  setIsFirstTimeUser: (isFirstTimeUser: "yes" | "no" | null) => void;
}

interface AppPrefs extends Models.Preferences {
  onboardingComplete?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
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

  const logout = useCallback(async () => {
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
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await account.get();
      setUser(response as Models.User<AppPrefs>);
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
    }
  }, []);

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
      // 1. Path Awareness
      const isAuthPath = ["/welcome", "/sign-in", "/sign-up"].some((path) =>
        pathname.startsWith(path),
      );
      const isOnboardingPath = pathname.includes("/Quiz");
      const isSuccessPage = pathname.includes("/success");

      // 2. Status Categorization
      type UserStatus =
        | "GUEST_FIRST_TIME"
        | "GUEST_RETURNING"
        | "AUTH_PENDING_ONBOARDING"
        | "AUTH_COMPLETED";

      let status: UserStatus;
      const onboardingComplete = !!user?.prefs?.onboardingComplete;

      console.log(onboardingComplete);

      if (!user) {
        status =
          isFirstTimeUser === "yes" ? "GUEST_FIRST_TIME" : "GUEST_RETURNING";
      } else {
        status = onboardingComplete
          ? "AUTH_COMPLETED"
          : "AUTH_PENDING_ONBOARDING";
      }
      setLoading(true);
      // 3. Navigation Decision Engine
      switch (status) {
        case "GUEST_FIRST_TIME":
          if (!isAuthPath) {
            router.replace("/(auth)/welcome");
          }
          setLoading(false);
          break;

        case "GUEST_RETURNING":
          if (!isAuthPath) {
            router.replace("/(auth)/sign-in");
          }
          setLoading(false);
          break;
        case "AUTH_PENDING_ONBOARDING":
          if (!isOnboardingPath && !isSuccessPage) {
            router.replace("/(onboarding)/Quiz");
          }
          setLoading(false);
          break;

        case "AUTH_COMPLETED":
          // Prevent access to Auth or Onboarding (except the success confirmation page)
          if (isAuthPath || (isOnboardingPath && !isSuccessPage)) {
            router.replace("/");
          }
          setLoading(false);
          break;
      }
    }, 10);

    return () => clearTimeout(timeout);
  }, [user, appLoading, isFirstTimeUser, pathname, refreshUser, logout]);

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
        refreshUser,
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
