"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Background Images Array (Same as Auth page for consistency)
const backgroundImages = [
  "https://cdn.dribbble.com/userupload/22428385/file/original-cff827408c1c897b8eca6952813b29fb.png",
  "https://cdn.dribbble.com/userupload/21884859/file/original-d64d335d85b4435f23eb87e025ea51b3.jpg",
  "https://cdn.dribbble.com/userupload/21926163/file/original-c3efc86b3dda67078d9805d649c6a4c6.jpg"
];

export default function LandingPage() {
  const [bgIndex, setBgIndex] = useState(0);

  // Background Image Slider Logic (Changes every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col text-white font-sans bg-[#020202] selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      
      {/* Animated Background Images */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {backgroundImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000 ease-in-out ${
              index === bgIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"
            }`}
            style={{ backgroundImage: `url('${img}')` }}
          ></div>
        ))}
        {/* Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-[#020202] backdrop-blur-[2px]"></div>
      </div>

      {/* Modern Navbar - FULLY RESPONSIVE */}
      <header className="w-full border-b border-white/5 bg-black/20 backdrop-blur-lg fixed top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <span className="text-lg md:text-xl font-black tracking-tight text-white">
              MyAwake<span className="text-emerald-500">Vault</span>
            </span>
          </div>

          {/* Action Buttons Section */}
          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            <Link href="/auth" className="text-xs md:text-sm font-semibold text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/auth" className="px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-bold bg-white text-black hover:bg-gray-200 rounded-full transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              Get Started
            </Link>
          </div>

        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-4 md:px-6 relative z-10 pt-32 md:pt-40 pb-20 md:pb-24 max-w-5xl mx-auto">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111] border border-[#333] text-gray-300 text-xs font-semibold mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          The Ultimate Contingency Protocol
        </div>
        
        {/* Adjusted headings for mobile */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-6 md:mb-8 leading-tight drop-shadow-2xl">
          Secure your digital legacy. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Pass it on automatically.</span>
        </h1>
        
        <p className="text-gray-400 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed">
          We monitor your digital heartbeat. If your preset timer reaches zero, your heavily encrypted private files and final messages are automatically delivered to your trusted successors.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/auth" className="w-full sm:w-auto px-8 py-3.5 md:py-4 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1 text-center">
            Create Your Vault
          </Link>
          <a href="#features" className="w-full sm:w-auto px-8 py-3.5 md:py-4 text-sm font-bold bg-[#111] hover:bg-[#222] text-white rounded-full transition-all border border-[#333] hover:border-[#555] text-center">
            Explore Features
          </a>
        </div>
      </main>

      {/* Bento Grid Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 w-full">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Engineered for Absolute Reliability</h2>
          <p className="text-gray-500 text-sm">Everything you need to ensure your data outlives you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          
          {/* Feature 1 */}
          <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-[#222] p-6 md:p-8 rounded-3xl hover:border-emerald-500/30 transition-colors flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 bg-[#111] rounded-xl flex items-center justify-center mb-6 border border-[#222] group-hover:border-emerald-500/50 transition-colors">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">How It Works</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Configure a custom time limit (e.g., 30 days). Check in periodically by clicking the "I AM AWAKE" button. If the countdown expires, the system assumes an emergency and automatically triggers the data transfer.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-[#222] p-6 md:p-8 rounded-3xl hover:border-emerald-500/30 transition-colors flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 bg-[#111] rounded-xl flex items-center justify-center mb-6 border border-[#222] group-hover:border-emerald-500/50 transition-colors">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Military-Grade Security</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your data is stored in highly secure Amazon Web Services (AWS) S3 buckets utilizing AES-256 encryption at rest. Decryption links are generated securely and remain valid for only 48 hours post-trigger.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-[#222] p-6 md:p-8 rounded-3xl hover:border-emerald-500/30 transition-colors flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 bg-[#111] rounded-xl flex items-center justify-center mb-6 border border-[#222] group-hover:border-emerald-500/50 transition-colors">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Autonomous Reliability</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Powered by serverless AWS Lambda and EventBridge architecture. There is zero human intervention. Once your cron-job is initialized, it is guaranteed to execute flawlessly regardless of external conditions.
              </p>
            </div>
          </div>

          {/* Wide Feature */}
          <div className="bg-gradient-to-br from-[#0a0a0a]/90 to-[#111]/90 backdrop-blur-lg border border-[#222] p-8 md:p-10 rounded-3xl hover:border-emerald-500/30 transition-colors md:col-span-3">
            <h3 className="text-2xl font-bold text-white mb-4">Real-World Utility & Digital Wills</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-4xl">
              As our lives move entirely online, physical assets are being replaced by digital wealth. Secure your cryptocurrency seed phrases, hidden financial accounts, intellectual property, or simply leave a final video message for your family. This dead man's switch serves as an impenetrable digital will, ensuring your voice outlives your timeline and your closest allies receive what is rightfully theirs.
            </p>
          </div>
          
        </div>
      </section>
 <p className="text-gray-600 text-xs font-medium">
        MyAwakeVault. All rights reserved.
          <hr>Developed By Arjun Bathole</hr>
        </p>
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/50 backdrop-blur-md py-6 md:py-8 text-center mt-auto">
        <p className="text-gray-600 text-xs font-medium">
        MyAwakeVault. All rights reserved.
          <hr>Developed By Arjun Bathole</hr>
        </p>
      </footer>
      
    </div>
  );
}
