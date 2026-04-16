'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await login(formData);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Portal Authorization Failed. Please verify credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-surface font-body text-on-surface">
      <Header />
      
      <main className="relative min-h-screen flex items-center justify-center pt-20 pb-24">
        {/* Precision Grid Background Overlay */}
        <div className="absolute inset-0 precision-grid pointer-events-none"></div>
        
        <section className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <h1 className="font-headline text-5xl md:text-6xl text-primary font-bold italic tracking-tight mb-4 text-primary">
              Welcome to NeuroFocus
            </h1>
            <p className="font-body text-on-surface-variant max-w-lg mx-auto text-lg leading-relaxed">
              Access your personalized clinical environment. Precision data meets human-centric neurological care.
            </p>
          </div>

          {/* Central Elevated Login Card */}
          <div className="w-full bg-surface-container-low rounded-xl p-1 md:p-2 transition-all duration-500">
            <div className="bg-surface-container-lowest rounded-lg shadow-[0_40px_80px_-20px_rgba(26,28,29,0.06)] overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12">
                
                {/* Side Identity Column */}
                <div className="hidden md:flex md:col-span-4 bg-primary p-10 flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                  <div className="relative z-10">
                    <p className="font-label text-primary-fixed uppercase tracking-[0.2em] text-[10px] mb-6">Portal Authorization</p>
                    <h2 className="font-headline text-3xl text-white leading-tight">Securing the narrative of recovery.</h2>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 text-primary-fixed-dim mb-2">
                      <span className="material-symbols-outlined text-sm">verified_user</span>
                      <span className="font-label text-[11px] uppercase tracking-wider">AES-256 Encrypted</span>
                    </div>
                    <div className="flex items-center gap-3 text-primary-fixed-dim">
                      <span className="material-symbols-outlined text-sm">medical_information</span>
                      <span className="font-label text-[11px] uppercase tracking-wider">HIPAA Compliant</span>
                    </div>
                  </div>
                </div>

                {/* Main Form Area */}
                <div className="md:col-span-8 p-8 md:p-12">
                  <div className="mb-10">
                    <h2 className="font-headline text-2xl font-bold text-primary mb-2 italic">Clinical Login</h2>
                    <p className="text-on-surface-variant text-sm">Enter your credentials to access the secure node.</p>
                  </div>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                      <div className="p-3 bg-error-container text-on-error-container text-xs rounded-md border border-error/20 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {error}
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="font-label text-[11px] font-bold text-on-surface flex justify-between" htmlFor="username">
                        Username or Email
                        <span className="font-normal text-outline-variant">Required</span>
                      </label>
                      <div className="relative group">
                        <input 
                          className="w-full bg-surface-container-low border-0 border-b border-outline-variant/40 focus:ring-0 focus:border-primary px-2 py-3 text-sm transition-all placeholder:text-outline-variant/60 outline-none" 
                          id="username" 
                          name="username" // Important for OAuth2PasswordRequestForm
                          placeholder="e.g. alex.care@neurofocus.edu" 
                          type="text"
                          required
                          autoComplete="username"
                        />
                        <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="font-label text-[11px] font-bold text-on-surface flex justify-between" htmlFor="password">
                        Password
                        <a className="font-normal text-primary hover:underline" href="#">Forgot?</a>
                      </label>
                      <div className="relative group">
                        <input 
                          className="w-full bg-surface-container-low border-0 border-b border-outline-variant/40 focus:ring-0 focus:border-primary px-2 py-3 text-sm transition-all placeholder:text-outline-variant/60 outline-none" 
                          id="password" 
                          name="password" // Important for OAuth2PasswordRequestForm
                          placeholder="••••••••••••" 
                          type="password"
                          required
                          autoComplete="current-password"
                        />
                        <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col md:flex-row md:items-center gap-6">
                      <button 
                        className={`flex-1 bg-primary text-on-primary py-4 px-8 rounded-md font-body font-semibold hover:opacity-90 transition-all active:scale-[0.98] transform flex justify-center items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`} 
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                             Authorizing...
                          </span>
                        ) : (
                          <>
                            Start Mission
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    
                  </form>
                  
                  <div className="mt-8 pt-8 border-t border-outline-variant/10">
                    <p className="text-[11px] text-on-surface-variant/60 text-center font-label">
                      Accessing this portal constitutes agreement to our Clinical Ethics Guidelines.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Supporting Imagery */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-3xl opacity-80 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="space-y-4">
              <p className="font-headline italic text-lg text-primary-container">&quot;The data helps us see what the heart already knows.&quot;</p>
            </div>
            <div className="flex flex-col justify-end">
              <p className="font-label text-[10px] uppercase tracking-widest text-outline mb-4">Latest Insights</p>
              <h3 className="font-headline text-xl text-on-surface mb-2 font-bold italic">Advancing Pediatric Neuro-Rehabilitation</h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                Our latest clinical trial results show a 40% increase in patient engagement through gamified baseline assessments.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
