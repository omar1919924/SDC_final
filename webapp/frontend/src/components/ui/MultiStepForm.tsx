'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


interface Step {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface MultiStepFormProps {
  steps: Step[];
  onComplete: (data: unknown) => void;
  onCancel: () => void;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData] = useState({});

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-12">
      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
            Step {String(currentStep + 1).padStart(2, '0')} <span className="opacity-40">/ {String(steps.length).padStart(2, '0')}</span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-outline font-bold">
            {steps[currentStep].label}
          </span>
        </div>
        <div className="h-1 w-full bg-outline-variant/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary"
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {steps[currentStep].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-8 border-t border-outline-variant/10">
        <button
          onClick={currentStep === 0 ? onCancel : prevStep}
          className="px-6 py-3 text-sm font-bold text-outline hover:text-primary transition-colors flex items-center gap-2 group"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          {currentStep === 0 ? 'Cancel Request' : 'Previous Step'}
        </button>

        <button
          onClick={nextStep}
          className="bg-primary text-on-primary px-10 py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center gap-3 group"
        >
          {currentStep === steps.length - 1 ? 'Finalize Action' : 'Continue Journey'}
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
            {currentStep === steps.length - 1 ? 'verified' : 'arrow_forward'}
          </span>
        </button>
      </div>
    </div>
  );
};
