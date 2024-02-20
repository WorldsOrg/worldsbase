"use client";
import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../utils/supabaseClient";
import { useToastContext } from "./toastContext";

interface AuthContextProps {
  token: string | null;
  login: (credentials: LoginCredentials) => void;
  signup: (credentials: LoginCredentials) => void;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextProps>({
  token: null,
  login: () => {},
  logout: () => {},
  signup: () => {},
  loading: false,
  error: null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { toastAlert } = useToastContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const checkAuthUser = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.getSession();

    if (data) {
      const { session } = data;

      if (session && session.access_token) {
        setToken(session?.access_token as string);
        const path = pathname ?? "/dashboard";

        router.push(path);
      } else {
        const path = "/auth";

        router.push(path);
      }
    } else {
      const path = "/auth";

      router.push(path);
    }
    setLoading(false);
  }, [pathname, router]);

  useEffect(() => {
    checkAuthUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) {
        toastAlert(false, error.message);
        setError(error.message);
        return;
      }

      if (data && data.session && data.session.access_token) setToken(data.session?.access_token as string);

      toastAlert(true, `Welcome to WGS`);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp(credentials);

      if (error) {
        toastAlert(false, "Something went wrong");
        setError(error.message);
        return;
      }

      if (data && data.session && data.session.access_token) setToken(data.session?.access_token as string);

      toastAlert(true, `Welcome to WGS`);
      if (!error) router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setToken(null);
    router.push("/auth");
    setLoading(false);
  };

  return <AuthContext.Provider value={{ token, login, logout, signup, loading, error }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
