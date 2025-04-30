
import React, { useState } from "react";
import AuthSignInForm from "./AuthSignInForm";
import AuthSignUpForm from "./AuthSignUpForm";
import AuthManageForm from "./AuthManageForm";
import { useAuth } from "@/contexts/authHooks";
import Logo from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";
import DemoAccountButton from "./DemoAccountButton";

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState("signin");
  const { user } = useAuth();

  if (user) {
    return <AuthManageForm />;
  }

  return (
    <div className="auth-container">
      <div className="auth-tabs">
        <button 
          className={`auth-tab ${activeTab === "signin" ? "active" : ""}`}
          onClick={() => setActiveTab("signin")}
        >
          登录
        </button>
        <button 
          className={`auth-tab ${activeTab === "signup" ? "active" : ""}`}
          onClick={() => setActiveTab("signup")}
        >
          注册
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "signin" ? (
            <>
              <AuthSignInForm onSwitch={() => setActiveTab("signup")} />
              <DemoAccountButton />
            </>
          ) : (
            <>
              <AuthSignUpForm onSwitch={() => setActiveTab("signin")} />
              <DemoAccountButton />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthForm;
