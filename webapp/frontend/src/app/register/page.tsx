'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const ROLES = [
  { role: 'enfant', label: 'Enfant', description: 'Child Explorer', icon: 'child_care' },
  { role: 'parent', label: 'Parent', description: 'Caregiver', icon: 'family_restroom' },
  { role: 'enseignant', label: 'Enseignant', description: 'Educator', icon: 'school' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('enfant');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const userData = {
      nom: formData.get('nom'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: selectedRole,
    };
    
    try {
      await register(userData);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Registration failed. Please check your details.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-surface font-body text-on-surface">
      <Header />
      
      <main className="relative min-h-screen flex items-center justify-center pt-20 pb-24">
        <div className="absolute inset-0 precision-grid pointer-events-none"></div>
        
        <section className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center">
          <div className="text-center mb-10">
            <h1 className="font-headline text-5xl text-primary font-bold italic tracking-tight mb-4">
              Join the Sanctuary
            </h1>
            <p className="font-body text-on-surface-variant max-w-lg mx-auto text-lg leading-relaxed">
              Create your clinical authorization profile and start your neurological journey today.
            </p>
          </div>

          <div className="w-full bg-surface-container-low rounded-xl p-1 md:p-2 transition-all duration-500">
            <div className="bg-surface-container-lowest rounded-lg shadow-[0_40px_80px_-20px_rgba(26,28,29,0.06)] overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12">
                
                {/* Visual Identity Sidebar */}
                <div className="hidden md:flex md:col-span-4 bg-primary p-12 flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                  <div className="relative z-10">
                    <p className="font-label text-primary-fixed uppercase tracking-[0.2em] text-[10px] mb-6">New Authorization</p>
                    <h2 className="font-headline text-3xl text-white leading-tight font-bold italic">Building the future of care.</h2>
                  </div>
                  <div className="relative z-10 mt-20">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 text-primary-fixed-dim">
                        <span className="material-symbols-outlined mt-1">shield_with_heart</span>
                        <div>
                          <p className="font-bold text-white text-sm">Privacy First</p>
                          <p className="text-[11px] opacity-70 leading-relaxed text-balance">Your neurological data is encrypted and protected by clinical-grade protocols.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 text-primary-fixed-dim">
                        <span className="material-symbols-outlined mt-1">hub</span>
                        <div>
                          <p className="font-bold text-white text-sm">Unified Hub</p>
                          <p className="text-[11px] opacity-70 leading-relaxed text-balance">One account connects parents, clinicians, and explorers in a shared ecosystem.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Form Area */}
                <div className="md:col-span-8 p-8 md:p-12">
                  <form className="space-y-8" onSubmit={handleSubmit}>
                    {error && (
                      <div className="p-4 bg-error-container text-on-error-container text-xs rounded-lg border border-error/20 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {error}
                      </div>
                    )}

                    <div className="space-y-4">
                      <label className="font-label text-[10px] uppercase tracking-widest text-outline block">
                        Identity Designation
                      </label>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {ROLES.map((r) => (
                          <button
                            key={r.role}
                            type="button"
                            onClick={() => setSelectedRole(r.role)}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all group ${
                              selectedRole === r.role 
                                ? 'bg-primary-container border-primary shadow-sm' 
                                : 'bg-surface-container-low border-outline-variant/30 hover:border-primary/50'
                            }`}
                          >
                            <span className={`material-symbols-outlined text-xl ${selectedRole === r.role ? 'text-primary' : 'text-outline group-hover:text-primary'}`}>
                              {r.icon}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedRole === r.role ? 'text-primary' : 'text-outline-variant'}`}>
                              {r.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="font-label text-[11px] font-bold text-on-surface" htmlFor="nom">Full Name</label>
                        <div className="relative group">
                          <input 
                            className="w-full bg-surface-container-low border-0 border-b border-outline-variant/40 focus:ring-0 focus:border-primary px-2 py-3 text-sm transition-all placeholder:text-outline-variant/60 outline-none" 
                            id="nom" 
                            name="nom"
                            placeholder="Alex Care" 
                            type="text"
                            required
                          />
                          <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="font-label text-[11px] font-bold text-on-surface" htmlFor="email">Email Address</label>
                        <div className="relative group">
                          <input 
                            className="w-full bg-surface-container-low border-0 border-b border-outline-variant/40 focus:ring-0 focus:border-primary px-2 py-3 text-sm transition-all placeholder:text-outline-variant/60 outline-none" 
                            id="email" 
                            name="email"
                            placeholder="alex@neurofocus.edu" 
                            type="email"
                            required
                          />
                          <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="font-label text-[11px] font-bold text-on-surface" htmlFor="password">Security Password</label>
                      <div className="relative group">
                        <input 
                          className="w-full bg-surface-container-low border-0 border-b border-outline-variant/40 focus:ring-0 focus:border-primary px-2 py-3 text-sm transition-all placeholder:text-outline-variant/60 outline-none" 
                          id="password" 
                          name="password"
                          placeholder="••••••••••••" 
                          type="password"
                          required
                          minLength={6}
                        />
                        <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-6">
                      <button 
                        className={`w-full bg-primary text-on-primary py-4 px-8 rounded-lg font-body font-semibold hover:opacity-90 transition-all active:scale-[0.98] transform flex justify-center items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`} 
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                             Building Profile...
                          </span>
                        ) : (
                          <>
                            Create Clinical Account
                            <span className="material-symbols-outlined text-lg hover:translate-x-1 transition-transform">how_to_reg</span>
                          </>
                        )}
                      </button>
                      <div className="text-center">
                        <p className="text-xs text-on-surface-variant">
                          Already have an account?{' '}
                          <Link href="/" className="text-primary font-bold hover:underline">
                            Log In Here
                          </Link>
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
