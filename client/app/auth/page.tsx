"use client";
import { useState } from "react";
import LoginCard from "@/components/auth/LoginCard";
import SignupCard from "@/components/auth/SignupCard";
import { useAuth } from "@/context/authContext";

export default function Auth() {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const { login, signup, loading } = useAuth();

  const toggleMode = () => setIsSignupMode(!isSignupMode);

  const cardProps = {
    loading,
    changeSignupCard: toggleMode,
  };

  return (
    <div className="max-w-md py-12 md:py-24 mx-auto">{isSignupMode ? <SignupCard {...cardProps} handleSignup={signup} /> : <LoginCard {...cardProps} handleLogin={login} />}</div>
  );
}
