import { account, functions } from "@/libs/appwrite";
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
  sendEmailOTP: (email: string) => Promise<string>;
  verifyEmailOTP: (userId: string, otp: string) => Promise<void>;
  completePasswordReset: (password: string) => Promise<void>;
  savePendingRecovery: (data: PendingRecovery) => Promise<void>;
  getPendingRecovery: () => Promise<PendingRecovery | null>;
  clearPendingRecovery: () => Promise<void>;
  setRecoveryVerified: (data: VerifiedRecovery) => Promise<void>;
  recoveryVerified: VerifiedRecovery | null;
  clearRecoveryVerified: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setUser: (user: Models.User<AppPrefs> | null) => void;
  setIsFirstTimeUser: (isFirstTimeUser: "yes" | "no" | null) => void;
}

interface PendingRecovery {
  email: string;
  userId: string;
  resendAvailableAt: number;
  createdAt: number;
}

interface VerifiedRecovery {
  email: string;
  userId: string;
  secret: string;
  verifiedAt: number;
}

interface AppPrefs extends Models.Preferences {
  onboardingComplete?: boolean;
  skinTone?: string;
  skinFeel?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PENDING_RECOVERY_KEY = "pendingRecovery";
const VERIFIED_RECOVERY_KEY = "verifiedRecovery";
const VERIFIED_RECOVERY_TTL_MS = 15 * 60 * 1000;
const PASSWORD_RESET_FUNCTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_PASSWORD_RESET_FUNCTION_ID || "";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(true);
  const [user, setUser] = useState<Models.User<AppPrefs> | null>(null);
  const [recoveryVerified, setRecoveryVerifiedState] =
    useState<VerifiedRecovery | null>(null);
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

  const sendEmailOTP = async (email: string) => {
    setLoading(true);
    try {
      // Create a login token (6-digit OTP)
      // If the email exists, Appwrite ignores ID.unique() and returns the existing userId
      const token = await account.createEmailToken({
        userId: ID.unique(),
        email: email,
      });
      // console.log("Email OTP sent successfully:", token);
      return token.userId;
    } catch (error) {
      console.error("Error sending email OTP:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const savePendingRecovery = useCallback(async (data: PendingRecovery) => {
    await AsyncStorage.setItem(PENDING_RECOVERY_KEY, JSON.stringify(data));
  }, []);

  const getPendingRecovery = useCallback(async () => {
    const raw = await AsyncStorage.getItem(PENDING_RECOVERY_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as PendingRecovery;
      if (!parsed.email || !parsed.userId || !parsed.createdAt) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }, []);

  const clearPendingRecovery = useCallback(async () => {
    await AsyncStorage.removeItem(PENDING_RECOVERY_KEY);
  }, []);

  const setRecoveryVerified = useCallback(async (data: VerifiedRecovery) => {
    setRecoveryVerifiedState(data);
    await AsyncStorage.setItem(VERIFIED_RECOVERY_KEY, JSON.stringify(data));
  }, []);

  const clearRecoveryVerified = useCallback(async () => {
    setRecoveryVerifiedState(null);
    await AsyncStorage.removeItem(VERIFIED_RECOVERY_KEY);
  }, []);

  const verifyEmailOTP = async (userId: string, secret: string) => {
    setLoading(true);
    try {
      // Clear any existing session before attempting to create a new one
      try {
        await account.deleteSession({
          sessionId: "current",
        });
      } catch {
        // Ignored. Delete throws an error if no session exists, which is expected state.
      }

      // Create a session using the OTP (secret)
      await account.createSession({
        userId,
        secret: secret.trim(),
      });

      // Validate the just-created session before allowing password reset step.
      await account.get();
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      if (error?.type === "user_invalid_credentials") {
        throw new Error("The 6-digit code is incorrect or has expired.");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completePasswordReset = async (password: string) => {
    setLoading(true);
    try {
      const now = Date.now();
      const verified = recoveryVerified;

      if (!verified || now - verified.verifiedAt > VERIFIED_RECOVERY_TTL_MS) {
        throw new Error(
          "Your reset session is no longer valid. Please verify your code again.",
        );
      }

      if (!PASSWORD_RESET_FUNCTION_ID) {
        throw new Error(
          "Password reset function is not configured. Set Configurations.",
        );
      }

      const execution = await functions.createExecution({
        functionId: PASSWORD_RESET_FUNCTION_ID,
        async: false,
        body: JSON.stringify({
          password,
          userId: verified.userId,
        }),
      });

      if (
        execution.status !== "completed" ||
        execution.responseStatusCode >= 400
      ) {
        throw new Error("Password reset failed. Please try again.");
      }

      // Password updates can invalidate OTP/temporary sessions. Start a fresh
      // session using the new credentials to keep the user signed in.
      await account.createEmailPasswordSession({
        email: verified.email,
        password,
      });

      const currentUser = (await account.get()) as Models.User<AppPrefs>;
      setUser(currentUser);
      await clearPendingRecovery();
      await clearRecoveryVerified();
    } catch (error: any) {
      console.error("Error completing password reset:", error);
      // Map Appwrite error to a user-friendly message
      if (error?.type === "user_invalid_credentials") {
        throw new Error(
          "Your reset session is no longer valid. Please verify your code again.",
        );
      }
      if (error?.code === 401) {
        throw new Error(
          "Password changed, but session expired. Please sign in with your new password.",
        );
      }
      throw error;
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

        const verifiedRaw = await AsyncStorage.getItem(VERIFIED_RECOVERY_KEY);
        if (verifiedRaw) {
          try {
            const parsed = JSON.parse(verifiedRaw) as VerifiedRecovery;
            if (Date.now() - parsed.verifiedAt <= VERIFIED_RECOVERY_TTL_MS) {
              setRecoveryVerifiedState(parsed);
            } else {
              await AsyncStorage.removeItem(VERIFIED_RECOVERY_KEY);
            }
          } catch {
            await AsyncStorage.removeItem(VERIFIED_RECOVERY_KEY);
          }
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
      const isAuthPath = [
        "/welcome",
        "/sign-in",
        "/sign-up",
        "/forgot-password",
        "/verify-otp",
      ].some((path) => pathname.startsWith(path));
      const isNewPasswordPath = pathname.startsWith("/new-password");
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
          if (!isAuthPath && !isNewPasswordPath) {
            router.replace("/(auth)/welcome");
          }
          setLoading(false);
          break;

        case "GUEST_RETURNING":
          if (!isAuthPath && !isNewPasswordPath) {
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
        sendEmailOTP,
        verifyEmailOTP,
        completePasswordReset,
        savePendingRecovery,
        getPendingRecovery,
        clearPendingRecovery,
        setRecoveryVerified,
        recoveryVerified,
        clearRecoveryVerified,
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
