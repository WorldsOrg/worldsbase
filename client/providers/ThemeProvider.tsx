

import React, { useEffect, useState, FC } from "react";
import { useTheme } from "@/context/themeContext";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider = ({ children }:ThemeProviderProps) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (mounted) {
    return <div className={theme}>{children}</div>;
  } else {
    return null; 
  }
};

export default ThemeProvider;
