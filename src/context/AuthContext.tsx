import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { meRequest, registerRequest } from "../services/authService";
import type { AuthUser } from "../types/domain";

interface AuthContextValue {
  user: AuthUser | null;
  initializing: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (fullName: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function translateAuthError(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Credenciales incorrectas";
    case "auth/email-already-in-use":
      return "Ese correo ya está registrado";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 8 caracteres";
    case "auth/invalid-email":
      return "El correo no es válido";
    case "auth/user-disabled":
      return "La cuenta está desactivada";
    case "auth/too-many-requests":
      return "Demasiados intentos. Intenta más tarde";
    case "auth/network-request-failed":
      return "No se pudo conectar con el servidor";
    case "auth/operation-not-allowed":
      return "Inicio de sesión con correo no habilitado. Actívalo en la consola de Firebase";
    default:
      if (error instanceof Error && error.message) {
        return error.message;
      }
      return "No se pudo completar la operación";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setInitializing(false);
        return;
      }

      meRequest()
        .then(({ user: currentUser }) => {
          setUser(currentUser);
        })
        .catch(() => {
          setUser(null);
          signOut(auth).catch(() => undefined);
        })
        .finally(() => {
          setInitializing(false);
        });
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error(translateAuthError(error));
    }

    try {
      const { user: currentUser } = await meRequest();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      throw new Error(translateAuthError(error));
    }
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: fullName });
    } catch (error) {
      throw new Error(translateAuthError(error));
    }

    try {
      const response = await registerRequest(fullName);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw new Error(translateAuthError(error));
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    signOut(auth).catch(() => undefined);
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await meRequest();
    setUser(response.user);
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, initializing, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }
  return context;
}
