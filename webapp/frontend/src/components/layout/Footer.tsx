import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 w-full bg-background border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center px-8 py-6 z-50">
      <span className="font-body text-[11px] uppercase tracking-wider font-medium text-foreground opacity-60">
        © 2024 NeuroFocus Clinical Editorial. HIPAA Compliant.
      </span>
      <div className="flex gap-6 mt-4 md:mt-0">
        <Link 
          href="#" 
          className="font-body text-[11px] uppercase tracking-wider font-medium text-foreground/40 hover:text-primary transition-colors"
        >
          Privacy Policy
        </Link>
        <Link 
          href="#" 
          className="font-body text-[11px] uppercase tracking-wider font-medium text-foreground/40 hover:text-primary transition-colors"
        >
          Terms of Service
        </Link>
        <Link 
          href="#" 
          className="font-body text-[11px] uppercase tracking-wider font-medium text-foreground/40 hover:text-primary transition-colors"
        >
          Security Standards
        </Link>
      </div>
    </footer>
  );
};
