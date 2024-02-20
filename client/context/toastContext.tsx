"use client";
import { createContext, useContext, ReactNode } from "react";
import { UseToastOptions, useToast } from "@chakra-ui/react";

interface ToastContextProps {
  toastAlert: (success: boolean, title: string) => void;
}

export const ToastContext = createContext<ToastContextProps>({
  toastAlert: (success: boolean, title: string) => {},
});

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const toast = useToast();

  const toastAlert = (success: boolean, title: string = "") => {
    const toastConfig: UseToastOptions = success
      ? { title: title, status: "success" }
      : { title: title || "Something went wrong!", status: "error" };

    toast({
      ...toastConfig,
      position: "top",
      duration: 2500,
      isClosable: true,
    });
  };

  return (
    <ToastContext.Provider
      value={{
        toastAlert,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  return useContext(ToastContext);
};
