"use client";

import { useState, useEffect } from "react";
import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID as string,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID as string,
};
const userPool = new CognitoUserPool(poolData);

const backgroundImages = [
  "https://cdn.dribbble.com/userupload/22428385/file/original-cff827408c1c897b8eca6952813b29fb.png",
  "https://cdn.dribbble.com/userupload/21884859/file/original-d64d335d85b4435f23eb87e025ea51b3.jpg",
  "https://cdn.dribbble.com/userupload/21926163/file/original-c3efc86b3dda67078d9805d649c6a4c6.jpg"
];

export default function AuthPage() {
  const [bgIndex, setBgIndex] = useState(0);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Custom Alert System
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 5000);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setToast({ show: false, message: "", type: "error" });
    const attributeList = [new CognitoUserAttribute({ Name: "email", Value: email })];
    userPool.signUp(email, password, attributeList, [], (err) => {
      setLoading(false); 
      if (err) { showToast(err.message || JSON.stringify(err), "error"); return; }
      setIsConfirming(true);
      showToast("Verification code sent to your email.", "success");
    });
  };

  const handleConfirmSignUp = (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setToast({ show: false, message: "", type: "error" });
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    cognitoUser.confirmRegistration(confirmationCode, true, (err) => {
      if (err) { setLoading(false); showToast(err.message || JSON.stringify(err), "error"); return; }
      
      showToast("Verification successful! Accessing Vault...", "success");
      // Direct Auto-Login after OTP
      const authDetails = new AuthenticationDetails({ Username: email, Password: password });
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: () => { window.location.href = "/dashboard"; },
        onFailure: (err) => { setLoading(false); showToast(err.message || JSON.stringify(err), "error"); setIsConfirming(false); setIsSignUp(false); },
      });
    });
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setToast({ show: false, message: "", type: "error" });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: () => { window.location.href = "/dashboard"; },
      onFailure: (err) => { setLoading(false); showToast(err.message || JSON.stringify(err), "error"); },
    });
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setToast({ show: false, message: "", type: "error" });
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    
    cognitoUser.forgotPassword({
      onSuccess: () => {}, 
      onFailure: (err) => { setLoading(false); showToast(err.message || JSON.stringify(err), "error"); },
      inputVerificationCode: () => {
        setLoading(false);
        showToast("Recovery OTP sent to your email.", "success");
        setIsForgotPassword(false);
        setIsResetting(true);
      }
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setToast({ show: false, message: "", type: "error" });
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    
    cognitoUser.confirmPassword(confirmationCode, newPassword, {
      onSuccess: () => {
        showToast("Key Updated! Accessing Vault directly...", "success");
        // Direct Auto-Login after Password Reset
        const authDetails = new AuthenticationDetails({ Username: email, Password: newPassword });
        cognitoUser.authenticateUser(authDetails, {
          onSuccess: () => { window.location.href = "/dashboard"; },
          onFailure: (err) => { setLoading(false); showToast(err.message || JSON.stringify(err), "error"); setIsResetting(false); }
        });
      },
      onFailure: (err) => { setLoading(false); showToast(err.message || JSON.stringify(err), "error"); }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isResetting) return handleResetPassword(e);
    if (isForgotPassword) return handleForgotPassword(e);
    if (isConfirming) return handleConfirmSignUp(e);
    if (isSignUp) return handleSignUp(e);
    return handleSignIn(e);
  };

  let formSubtitle = "Secure Access Required";
  if (isResetting) formSubtitle = "Update Encryption Key";
  else if (isForgotPassword) formSubtitle = "Initiate Recovery Protocol";
  else if (isConfirming) formSubtitle = "Terminal Authentication";
  else if (isSignUp) formSubtitle = "Register Protocol";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans relative overflow-hidden bg-black">
      
      {/* Background Images */}
      {backgroundImages.map((img, index) => (
        <div key={img} className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out z-0 ${index === bgIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"}`} style={{ backgroundImage: `url('${img}')` }}></div>
      ))}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

      {/* In-App Toast Notification (Replaces Browser Alert) */}
      {toast.show && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className={`px-6 py-3 rounded-full border backdrop-blur-xl shadow-2xl flex items-center gap-3 text-sm font-mono tracking-wide
            ${toast.type === 'success' ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 
              'bg-red-900/30 border-red-500/50 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]'}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${toast.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            [ {toast.message} ]
          </div>
        </div>
      )}

      <div className="w-full max-w-md z-10 relative mt-4">
        <div className="flex flex-col items-center justify-center mb-10">
          {/* Landing Page Style Logo */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-black/50 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] backdrop-blur-md">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
              MyAwake<span className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">Vault</span>
            </h1>
          </div>
          <p className="text-emerald-300 text-[10px] font-bold tracking-[0.3em] uppercase bg-emerald-900/40 inline-block px-4 py-1.5 rounded-full border border-emerald-500/30">
            {formSubtitle}
          </p>
        </div>

        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isConfirming && !isResetting && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Agent ID (Email)</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 text-white border border-white/10 rounded-xl py-3.5 px-5 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all text-sm font-mono placeholder-gray-600" placeholder="agent@matrix.com" />
              </div>
            )}

            {!isConfirming && !isForgotPassword && !isResetting && (
              <div className="space-y-2">
                <div className="flex justify-between items-center pl-1 pr-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Encryption Key (Password)</label>
                  {!isSignUp && (
                    <button type="button" onClick={() => { setIsForgotPassword(true); setToast({ show: false, message: "", type: "error" }); }} className="text-emerald-500 hover:text-emerald-400 text-[9px] uppercase tracking-widest transition-colors font-bold">
                      Forgot?
                    </button>
                  )}
                </div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 text-white border border-white/10 rounded-xl py-3.5 px-5 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all text-sm font-mono placeholder-gray-600" placeholder="••••••••" />
              </div>
            )}

            {isResetting && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Recovery Code (Email)</label>
                  <input type="text" required value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} className="w-full bg-white/5 text-emerald-400 font-mono text-center tracking-[0.5em] text-xl border border-white/10 rounded-xl py-4 px-5 focus:outline-none focus:border-emerald-500 transition-all" placeholder="000000" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">New Encryption Key</label>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-white/5 text-white border border-white/10 rounded-xl py-3.5 px-5 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all text-sm font-mono placeholder-gray-600" placeholder="New Password" />
                </div>
              </>
            )}

            {isConfirming && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Authorization Code</label>
                <input type="text" required value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} className="w-full bg-white/5 text-emerald-400 font-mono text-center tracking-[0.5em] text-xl border border-white/10 rounded-xl py-4 px-5 focus:outline-none focus:border-emerald-500 transition-all" placeholder="000000" />
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-600 hover:to-emerald-400 text-white font-bold py-4 rounded-xl uppercase tracking-[0.2em] text-xs transition-all border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] disabled:opacity-50 mt-4">
              {loading ? "Processing..." : isResetting ? "Update & Login" : isForgotPassword ? "Send Recovery Code" : isConfirming ? "Verify & Login" : isSignUp ? "Initialize Vault" : "Access Vault"}
            </button>
          </form>
        </div>

        {!isConfirming && !isForgotPassword && !isResetting && (
          <div className="mt-8 text-center">
            <button onClick={() => { setIsSignUp(!isSignUp); setToast({ show: false, message: "", type: "error" }); }} className="text-gray-400 hover:text-white text-[11px] uppercase tracking-widest transition-colors font-bold group">
              {isSignUp ? "Already registered?" : "Need a secure vault?"} 
              <span className="text-emerald-500 ml-2 group-hover:underline">
                {isSignUp ? "Login Here" : "Create Account"}
              </span>
            </button>
          </div>
        )}

        {(isForgotPassword || isResetting) && (
          <div className="mt-8 text-center">
            <button onClick={() => { setIsForgotPassword(false); setIsResetting(false); setToast({ show: false, message: "", type: "error" }); }} className="text-gray-400 hover:text-white text-[11px] uppercase tracking-widest transition-colors font-bold">
              [ Return to Login ]
            </button>
          </div>
        )}
      </div>
    </div>
  );
}