"use client";

import { useState, useEffect, useRef } from "react";
import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID as string,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID as string,
};
const userPool = new CognitoUserPool(poolData);

// Types for Files
interface VaultFile {
  name: string;
  size?: string;
}

export default function Dashboard() {
  const [trustedEmail, setTrustedEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [customDays, setCustomDays] = useState(30);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Files State
  const [uploadedFiles, setUploadedFiles] = useState<VaultFile[]>([]);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null); // Custom Delete Modal State
  
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" }>({ show: false, message: "", type: "info" });
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 5000);
  };

  useEffect(() => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.getSession((err: any, session: any) => {
        if (session && session.isValid()) {
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) setUserEmail(cognitoUser.getUsername());
            else {
              const emailAttr = attributes?.find(attr => attr.getName() === 'email');
              setUserEmail(emailAttr ? emailAttr.getValue() : cognitoUser.getUsername());
            }
          });
        } else { window.location.href = '/auth'; }
      });
    } else { window.location.href = '/auth'; }
  }, []);

  // Fetch Vault Config & Files
  useEffect(() => {
    if (!userEmail || userEmail.includes('-')) return; 
    
    const fetchVaultData = async () => {
      try {
        const response = await fetch(`/api/vault?email=${userEmail}`);
        const result = await response.json();
        if (result.success && result.data) {
          if (result.data.timerDuration) setCustomDays(result.data.timerDuration);
          if (result.data.trustedEmail) setTrustedEmail(result.data.trustedEmail);
          if (result.data.whatsappNumber) setWhatsapp(result.data.whatsappNumber);

          const deadlineTime = new Date(result.data.deadlineTime).getTime();
          const currentTime = new Date().getTime();
          const diffInSeconds = Math.floor((deadlineTime - currentTime) / 1000);
          setTimeLeft(diffInSeconds > 0 ? diffInSeconds : 0);
        } else { setTimeLeft(30 * 86400); }
      } catch (error) { console.error("Fetch error", error); }
    };

    fetchVaultData();
    fetchUserFiles();
  }, [userEmail]);

  // Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}D : ${h}H : ${m}M : ${s}S`; 
  };

  const handleAwakeClick = async () => {
    setTimeLeft(customDays * 86400); 
    try {
      await fetch('/api/vault', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'AWAKE', customDays: customDays, email: userEmail }) 
      });
      showToast("Protocol reset confirmed. Timer updated.", "success");
    } catch { showToast("Connection to mainframe failed.", "error"); }
  };

  const fetchUserFiles = async () => {
    if (!userEmail) return;
    try {
      const response = await fetch(`/api/files?email=${userEmail}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) setUploadedFiles(result.files || []);
      }
    } catch (error) {
      console.error("Failed to load files", error);
    }
  };

  // Custom Delete Function
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    const fileName = fileToDelete;
    setFileToDelete(null); // Close Modal immediately

    try {
      const response = await fetch(`/api/files`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, fileName })
      });
      
      const data = await response.json();
      if (data.success) {
        showToast("File eradicated securely.", "success");
        fetchUserFiles();
      } else {
        showToast(`Failed to delete: ${data.message}`, "error");
      }
    } catch (error) {
      showToast("Error communicating with server.", "error");
    }
  };

  // View File Function
  const handleViewFile = (fileName: string) => {
    window.open(`/api/files/view?email=${userEmail}&fileName=${fileName}`, '_blank');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true); 
    setUploadFileName(file.name);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 10;
      });
    }, 300);

    const formData = new FormData(); 
    formData.append("file", file); 
    formData.append("email", userEmail);
    
    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        if (data.success) {
          showToast(`File Uploaded Successfully!`, "success");
          fetchUserFiles();
        } else {
          showToast(`Upload failed: ${data.message}`, "error");
        }
      }, 600); 
      
    } catch { 
      clearInterval(progressInterval);
      setIsUploading(false); 
      showToast("Upload aborted due to network error.", "error"); 
    }
    
    event.target.value = '';
  };

  const handleSaveContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, customDays, trustedEmail, whatsappNumber: whatsapp })
      });
      const data = await response.json();
      if(data.success) showToast("Configuration locked securely.", "success");
      else showToast(`Error: ${data.message}`, "error");
    } catch { showToast("Failed to save configuration.", "error"); }
  };

  const handleLogout = () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
      window.location.href = '/auth';
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white p-6 md:p-12 font-sans selection:bg-emerald-500 relative overflow-hidden">
      
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-900/20 blur-[120px] pointer-events-none z-0"></div>

      {/* --- CUSTOM DELETE MODAL --- */}
      {fileToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0a0a0a] border border-red-500/50 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <h3 className="text-red-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Confirm Eradication
            </h3>
            <p className="text-gray-400 text-xs mb-8 font-mono leading-relaxed">
              Are you sure you want to permanently delete <br/>
              <span className="text-white font-bold block mt-2 truncate text-emerald-400">[{fileToDelete}]</span> <br/>
              This action is irreversible.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setFileToDelete(null)} className="flex-1 py-3 bg-[#111] hover:bg-[#222] text-gray-300 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors border border-[#333]">Cancel</button>
              <button onClick={confirmDeleteFile} className="flex-1 py-3 bg-red-900/50 hover:bg-red-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]">Delete</button>
            </div>
          </div>
        </div>
      )}

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

      <header className="max-w-6xl mx-auto flex justify-between items-center mb-16 relative z-10 border-b border-[#222] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-black/50 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-0.5">
              MyAwake<span className="text-emerald-500">Vault</span>
            </h1>
            <p className="text-gray-500 text-[9px] md:text-[10px] tracking-[0.4em] uppercase">Secure Control Terminal</p>
          </div>
        </div>
        
        {userEmail && !userEmail.includes('-') && (
          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[11px] text-gray-400 font-mono tracking-widest mb-1">{userEmail}</span>
              <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> System Online
              </span>
            </div>
          
            <div suppressHydrationWarning onClick={() => setShowDropdown(!showDropdown)} className="w-12 h-12 rounded-full bg-gradient-to-br from-[#222] to-black border border-[#444] hover:border-emerald-500 flex items-center justify-center text-emerald-500 font-bold text-xl shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all cursor-pointer">
              {userEmail.charAt(0).toUpperCase()}
            </div>

            {showDropdown && (
              <div className="absolute top-16 right-0 w-48 bg-[#0a0a0a] border border-[#333] rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-slide-up z-50">
                <button suppressHydrationWarning onClick={handleLogout} className="w-full text-left px-5 py-4 text-xs font-bold text-red-400 hover:bg-red-900/20 hover:text-red-300 uppercase tracking-widest transition-colors flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  System Logout
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        <div className="lg:col-span-7 space-y-8">
          <div className="rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#222] p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.8)] opacity-50 animate-[slideUpFade_3s_ease-in-out_infinite_alternate]"></div>
            
            <h2 className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.5em] mb-10">Auto-Destruct Countdown</h2>
            
            <div className="text-4xl sm:text-6xl md:text-7xl font-mono font-black text-red-500 tracking-widest mb-12 drop-shadow-[0_0_25px_rgba(239,68,68,0.5)]">
              {formatTime(timeLeft)}
            </div>

            <button suppressHydrationWarning onClick={handleAwakeClick} className="w-full max-w-sm mx-auto bg-gradient-to-r from-emerald-900 to-[#0a0a0a] hover:from-emerald-800 hover:to-[#111] text-emerald-400 font-bold py-5 rounded-2xl uppercase tracking-[0.3em] text-sm border border-emerald-500/50 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 block">
              [ I AM AWAKE ]
            </button>
          </div>

          <div className="rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#222] p-10 shadow-2xl relative">
            <div className="absolute top-0 left-8 w-16 h-[2px] bg-emerald-500/50"></div>
            <h2 className="text-white text-sm font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              Secure File Upload
            </h2>
            
            {!isUploading ? (
              <label suppressHydrationWarning className="flex flex-col items-center justify-center w-full h-40 bg-[#050505] border border-dashed border-[#444] hover:border-emerald-500 rounded-2xl cursor-pointer transition-colors group">
                <input suppressHydrationWarning type="file" onChange={handleFileUpload} className="hidden" />
                <svg className="w-10 h-10 mx-auto text-[#555] group-hover:text-emerald-500 mb-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <p className="text-xs text-gray-500 font-mono tracking-widest group-hover:text-gray-300 transition-colors">Click to Select File</p>
              </label>
            ) : (
              <div className="flex flex-col justify-center w-full h-40 bg-[#050505] border border-[#222] rounded-2xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span className="text-[11px] text-gray-400 font-mono truncate max-w-[200px]">{uploadFileName}</span>
                  </div>
                  <span className="text-[11px] text-emerald-500 font-mono font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(16,185,129,0.8)]" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-[9px] text-emerald-500/70 font-mono mt-4 tracking-widest text-center uppercase animate-pulse">Encrypting Payload...</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#222] p-10 shadow-2xl relative">
            <h2 className="text-white text-sm font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              My Vault Files
            </h2>
            
            <div className="bg-[#050505] rounded-xl border border-[#222] max-h-60 overflow-y-auto custom-scrollbar">
              {uploadedFiles.length === 0 ? (
                <div className="p-8 text-center text-gray-600 text-xs font-mono uppercase tracking-widest">
                  No files secured yet.
                </div>
              ) : (
                <ul className="divide-y divide-[#222]">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="flex justify-between items-center p-4 hover:bg-[#111] transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        <span className="text-xs text-gray-300 font-mono truncate">{file.name}</span>
                      </div>
                      
                      {/* VIEW AND DELETE BUTTONS - Permanently Visible */}
                      <div className="flex gap-2 transition-all">
                        <button suppressHydrationWarning onClick={() => handleViewFile(file.name)} className="p-2 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg transition-all" title="View File">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </button>
                        <button suppressHydrationWarning onClick={() => setFileToDelete(file.name)} className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all" title="Delete File">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#222] p-10 sticky top-10 shadow-2xl">
            <h2 className="text-white text-sm font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Protocol Settings
            </h2>
            
            <form onSubmit={handleSaveContacts} className="space-y-7">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Trigger Interval (Countdown Limit)</label>
                <div className="relative">
                  <select suppressHydrationWarning value={customDays} onChange={(e) => setCustomDays(Number(e.target.value))} className="w-full bg-black border border-[#333] rounded-xl py-4 px-5 focus:outline-none focus:border-emerald-500 text-sm font-mono cursor-pointer appearance-none text-gray-300">
                    <option value={7}>7 Days Protocol</option>
                    <option value={30}>30 Days Protocol</option>
                    <option value={90}>90 Days Protocol</option>
                    <option value={365}>365 Days Protocol</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500">▼</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Successor Email (Emergency Contact)</label>
                <input suppressHydrationWarning type="email" required value={trustedEmail || ""} onChange={(e) => setTrustedEmail(e.target.value)} className="w-full bg-black text-white border border-[#333] rounded-xl py-4 px-5 focus:outline-none focus:border-emerald-500 text-sm font-mono placeholder-[#444] transition-all" placeholder="secure@network.com" />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Successor Phone (SMS Alerts)</label>
                <div className="flex rounded-xl overflow-hidden border border-[#333] focus-within:border-emerald-500 transition-all">
                  <span className="flex items-center px-5 bg-[#111] text-emerald-500 text-xs font-mono border-r border-[#333] font-bold">+91</span>
                  <input suppressHydrationWarning type="tel" required pattern="[0-9]{10}" value={whatsapp || ""} onChange={(e) => setWhatsapp(e.target.value)} className="w-full bg-black text-white py-4 px-5 focus:outline-none text-sm font-mono placeholder-[#444]" placeholder="9876543210" />
                </div>
              </div>

              <button suppressHydrationWarning type="submit" className="w-full mt-6 bg-[#111] hover:bg-emerald-900/30 text-emerald-400 font-bold py-5 rounded-xl uppercase tracking-[0.2em] text-[11px] border border-[#333] hover:border-emerald-500/50 transition-all shadow-lg">
                Update Configuration
              </button>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
}
