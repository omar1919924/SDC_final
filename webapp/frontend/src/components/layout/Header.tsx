
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HeaderProps {
  className?: string;
}
export const Header: React.FC<HeaderProps> = ({ className }) => {
  const { user, logout } = useAuth();

  return (
    <>
      <header className={cn(
        "fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/10 flex justify-between items-center px-8 py-4",
        className
      )}>
        <div className="flex items-center gap-6">
          <Link href="/" className="font-headline italic font-bold text-3xl text-primary tracking-tight">
            NeuroFocus
          </Link>
        </div>
        {user && (
          <button
            onClick={logout}
            className="rounded-full border border-outline-variant/30 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
          >
            Deconnexion
          </button>
        )}
      </header>
    </>
  );
};
