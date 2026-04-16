import Link from 'next/link';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavLinkProps {
  href: string;
  label: string;
  icon: string;
  isActive?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, icon, isActive }) => (
  <Link
    href={href}
    className={cn(
      "flex items-center gap-3 p-3 rounded-lg transition-transform duration-200 hover:translate-x-1",
      isActive 
        ? "bg-white dark:bg-slate-800 text-blue-900 shadow-sm font-bold" 
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900"
    )}
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="text-[10px] font-sans uppercase tracking-widest">{label}</span>
  </Link>
);

export const Sidebar: React.FC = () => {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 hidden md:flex flex-col bg-slate-100 border-r border-slate-200 z-40 p-4 gap-4">
      <div className="flex items-center gap-3 px-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container overflow-hidden p-2">
          <div className="relative w-full h-full">
            <Image 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWlQu3gwTRjn8-4aTQc2hnnNjpNiDSsA_nVH6ZX-Qih3nVWb3YyZb3RvpN3M-SP20jDbatqYoyqAwyBnJHEtq2J8l_HT7hnFWUM3hHNuf37VxzbmJqikfK2vJx1UFfD31EWVgemsqTs48xmK6qQpLSnuvj-M2SluWqm4lhqFpvwB36XWGYQKhdCwYItUlAp6_TJe8rqdqW7VAuP-JKnfPFTuQz8Xd8TIsTV0EwkrhlpGnrs0hbDab8HNHWn34yWitPSGiUXkOWh9MA" 
              alt="School Logo" 
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div>
          <h2 className="font-headline text-lg text-blue-900 leading-tight italic">St. Edwards Academy</h2>
          <p className="text-[10px] font-sans uppercase tracking-wider text-slate-500">Grade 10 - Neuroscience</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-grow">
        <NavLink href="#" label="Classroom Pulse" icon="pulse_alert" isActive />
        <NavLink href="#" label="Roster of Focus" icon="group" />
        <NavLink href="#" label="Activity Queue" icon="queue_play_next" />
        <NavLink href="#" label="Growth Insights" icon="trending_up" />
        <NavLink href="#" label="Archive" icon="inventory_2" />
      </nav>

      <button className="w-full bg-primary text-on-primary py-3 rounded-xl text-[10px] font-sans uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
        <span className="material-symbols-outlined text-sm">add</span>
        New Alert
      </button>

      <div className="mt-auto flex flex-col gap-1 border-t border-slate-200 pt-4">
        <Link href="#" className="text-slate-500 flex items-center gap-3 p-2 text-[10px] uppercase font-bold hover:text-blue-900 transition-colors">
          <span className="material-symbols-outlined text-sm">help_outline</span>
          Help Center
        </Link>
        <Link href="#" className="text-slate-500 flex items-center gap-3 p-2 text-[10px] uppercase font-bold hover:text-blue-900 transition-colors">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          Privacy Policy
        </Link>
      </div>
    </aside>
  );
};
