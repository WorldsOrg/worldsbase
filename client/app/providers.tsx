// app/providers.tsx
"use client";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { ToastProvider } from "@/context/toastContext";
import { AuthProvider } from "@/context/authContext";
import { SnackbarProvider } from "notistack";
import { ThemeContextProvider } from "@/context/themeContext";
import ThemeProvider from "@/providers/ThemeProvider";

// composer providers
import { Provider } from "react-redux";
import { store } from "./dashboard/composer/bundled-composer/store";
import { CssBaseline, StyledEngineProvider } from "@mui/material";
import ConfirmContextProvider from "./dashboard/composer/bundled-composer/store/context/ConfirmContextProvider";
import { TableProvider } from "@/context/tableContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ConfirmContextProvider>
        <StyledEngineProvider injectFirst>
          <CssBaseline />
          <CacheProvider>
            <ChakraProvider>
              <ToastProvider>
                <ThemeContextProvider>
                  <ThemeProvider>
                    <AuthProvider>
                      <SnackbarProvider>
                        <TableProvider>{children}</TableProvider>
                      </SnackbarProvider>
                    </AuthProvider>
                  </ThemeProvider>
                </ThemeContextProvider>
              </ToastProvider>
            </ChakraProvider>
          </CacheProvider>
        </StyledEngineProvider>
      </ConfirmContextProvider>
    </Provider>
  );
}
