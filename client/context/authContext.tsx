"use client";
import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToastContext } from "./toastContext";
import axiosInstance from "@/utils/axiosInstance";

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
  const { toastAlert } = useToastContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      checkAuthUser(storedToken);
      setToken(storedToken);
    } else {
      router.push("/auth");
    }
  }, []);

  const updateToken = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const clearAuthData = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const checkAuthUser = useCallback(
    async (token: string) => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!data?.email || data?.statusCode === 500) {
          return logout();
        }

      } catch (error) {
        console.error("Error fetching user data");
      }finally{
        setLoading(false);
      }
    },
    [router]
  );

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const {status,data} = await axiosInstance.post("/auth/login", credentials);
      if (status !== 201) {
      toastAlert(false, data?.message);
      return;
      }
      
      updateToken(data?.accessToken);
      toastAlert(true, `Welcome to WGS`);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error logging in", error);
      toastAlert(false, "Something went wrong");
      setError("Error logging in");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const result = await axiosInstance.post("/auth/signup", credentials);
      if (result.data) {
        updateToken(result.data.accessToken);
        toastAlert(true, `Welcome to WGS`);
        router.push("/dashboard");
      } else {
        toastAlert(false, "Something went wrong");
        setError("Error signing up");
      }
    } catch (error) {
      console.error("Error signing up", error);
      toastAlert(false, "Something went wrong");
      setError("Error signing up");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    clearAuthData();
    router.push("/auth");
    setLoading(false);
  };

  return <AuthContext.Provider value={{ token, login, logout, signup, loading, error }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
