'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { Toggle } from '@/components/ui/Toggle';
import { BentoCard } from '@/components/ui/BentoCard';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: 'Sarah K.',
    email: 'sarah.k@caregiver.com',
    phone: '+1 (555) 123-4567',
    hipaaConsent: true,
    clinicalAlerts: true,
    systemUpdates: false,
    weeklyReports: true,
  });
  

  const handleToggle = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };

  return (
    <div className="relative min-h-screen bg-background font-body text-on-surface">
      <Header />
      
      <main className="relative pt-32 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto">
        {/* Precision Grid is fixed in background via layout.tsx */}
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start"
        >
          {/* Left Column (60%) */}
          <div className="lg:col-span-6 space-y-12">
            <header>
              <h1 className="font-headline text-5xl md:text-6xl text-primary font-bold italic tracking-tight leading-tight mb-4">
                Profile Sanctuary
              </h1>
              <p className="text-on-surface-variant max-w-lg text-lg leading-relaxed opacity-80">
                Manage your identity and clinical preferences. Your data is encrypted and HIPAA-protected.
              </p>
            </header>

            <section className="space-y-10">
              {/* User Profile */}
              <div>
                <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-outline mb-8">User Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                  <FloatingInput 
                    label="Full Name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <FloatingInput 
                    label="Email Address" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <FloatingInput 
                    label="Primary Phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              {/* HIPAA / Legal */}
              <div className="pt-6">
                <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-outline mb-6">Clinical Integrity</h3>
                <div className="p-8 rounded-[1.5rem] bg-surface-container-highest/10 border border-outline-variant/20 hover:bg-surface-container-highest/20 transition-all">
                  <Toggle 
                    label="HIPAA Digital Consent" 
                    description="Allow secure clinical data synchronization across providers."
                    checked={formData.hipaaConsent}
                    onChange={() => handleToggle('hipaaConsent')}
                  />
                </div>
              </div>

              {/* Notifications */}
              <div className="pt-6">
                <h3 className="font-label text-[10px] uppercase tracking-[0.2em] text-outline mb-6">Communication Pulse</h3>
                <div className="space-y-4">
                  <Toggle 
                    label="Clinical Alerts" 
                    description="Urgent updates regarding student focus metrics."
                    checked={formData.clinicalAlerts}
                    onChange={() => handleToggle('clinicalAlerts')}
                  />
                  <div className="h-px bg-outline-variant/10 w-full" />
                  <Toggle 
                    label="System Updates" 
                    description="New feature announcements and portal maintenance."
                    checked={formData.systemUpdates}
                    onChange={() => handleToggle('systemUpdates')}
                  />
                  <div className="h-px bg-outline-variant/10 w-full" />
                  <Toggle 
                    label="Weekly Insights" 
                    description="Detailed performance reports delivered to your inbox."
                    checked={formData.weeklyReports}
                    onChange={() => handleToggle('weeklyReports')}
                  />
                </div>
              </div>

              <div className="pt-10">
                <button className="bg-primary text-on-primary px-10 py-4 rounded-xl font-bold flex items-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-lg">
                  Save Changes
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                </button>
              </div>
            </section>
          </div>

          {/* Right Column (40%) */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
            <BentoCard variant="low" className="p-1.5 rounded-[2.5rem]">
              <div className="bg-surface-container-lowest rounded-[2rem] p-10 shadow-sm border border-outline-variant/10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container ring-8 ring-primary-container/10">
                    <span className="material-symbols-outlined text-3xl">psychology_alt</span>
                  </div>
                  <div>
                    <h4 className="font-headline text-2xl text-primary font-bold italic">Clinical Status</h4>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-tertiary font-bold px-2 py-0.5 bg-tertiary-fixed-dim/30 rounded-full">Active Protection</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-label text-[10px] uppercase tracking-widest text-outline">Last Sync</span>
                      <span className="font-mono text-[11px] font-bold">Today, 02:45 AM</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-label text-[10px] uppercase tracking-widest text-outline">Encrypted Node</span>
                      <span className="font-mono text-[11px] font-bold">#NF-88219-X</span>
                    </div>
                  </div>

                  <div className="p-6 bg-surface-container rounded-2xl italic text-on-surface-variant text-sm leading-relaxed relative">
                    <span className="material-symbols-outlined absolute -top-3 -right-3 text-4xl text-primary/5 select-none">format_quote</span>
                    <p className="font-headline font-medium">
                      &quot;Treatment is not a destination, but a sequence of small, precision adjustments in the architecture of the mind.&quot;
                    </p>
                  </div>

                  <div className="pt-4 space-y-4">
                    <h5 className="font-label text-[10px] uppercase tracking-widest text-outline">Active Providers</h5>
                    <div className="flex -space-x-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="relative w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                          <Image src={`https://i.pravatar.cc/100?u=${i+10}`} alt="Doc" fill className="object-cover" />
                        </div>
                      ))}
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-container flex items-center justify-center text-[10px] font-bold text-white shadow-sm">+2</div>
                    </div>
                  </div>
                </div>
              </div>
            </BentoCard>
            
            <div className="mt-8 px-6">
              <div className="flex items-center gap-3 text-error group cursor-pointer hover:underline underline-offset-4 transition-all">
                <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                <span className="font-label text-[11px] uppercase tracking-widest font-bold">Request Account Deletion</span>
              </div>
              <p className="text-[10px] text-outline-variant mt-4 leading-relaxed uppercase tracking-tighter">
                NeuroFocus handles data erasure in compliance with international health privacy standards. This process takes 72 hours.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
