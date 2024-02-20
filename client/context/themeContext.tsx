import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

interface ThemeContextProps {
  theme: string;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export type Theme = "light" | "dark";

const getFromLocalStorage = (): Theme => {
  if (typeof window !== "undefined") {
    const value = localStorage.getItem("theme");
    return (value as Theme) ?? "light";
  }
  return "light";
};

const ThemeContextProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] =  useState<Theme>(() => {
    return getFromLocalStorage();
  });

  const toggle = () => {
    setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      const element=document.documentElement;

      if (element) {
        if (theme === "dark") {
          element.classList.add("dark");
        } else {
          element.classList.remove("dark");
        }
      }
    }
  }, [theme]);


  const contextValue: ThemeContextProps = {
    theme,
    toggle,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export { ThemeContextProvider, useTheme, ThemeContext };



