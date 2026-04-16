'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (form_data: FormData) => Promise<void>;
  register: (userData: Record<string, unknown>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('neurofocus_token');
      const savedRole = localStorage.getItem('neurofocus_role') as UserRole;

      if (token) {
        try {
          // Fetch the definitive user profile from the database
          const response = await apiClient.get('/users/me');
          const dbUser = response.data;
          
          setUser(dbUser);
          
          // Sync localStorage if the role was modified directly in the database
          if (dbUser.role && dbUser.role !== savedRole) {
            localStorage.setItem('neurofocus_role', dbUser.role);
            setRoleState(dbUser.role as UserRole);
          } else {
            setRoleState(savedRole);
          }
        } catch (error) {
          console.error("Session invalid or expired", error);
          localStorage.removeItem('neurofocus_token');
          localStorage.removeItem('neurofocus_role');
          setRoleState(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (form_data: FormData) => {
    try {
      const response = await apiClient.post('/auth/login', form_data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, role: userRole } = response.data;

      localStorage.setItem('neurofocus_token', access_token);
      localStorage.setItem('neurofocus_role', userRole);

      setRoleState(userRole);

      // Dynamic Redirection based on Role
      // Backend roles: enfant -> /dashboard/student, psychiatre -> /dashboard/psychiatre, etc.
      const routeMap: Record<string, string> = {
        'enfant': '/dashboard/student',
        'parent': '/dashboard/parent',
        'enseignant': '/dashboard/teacher',
      };

      const targetRoute = routeMap[userRole] || '/dashboard/student';
      router.push(targetRoute);
    } catch (error) {
      // We throw the error so the UI (page.tsx) can catch it and display it.
      // Removed the console.error here to prevent cluttering the console with expected 401s.
      throw error;
    }
  };

  const register = async (userData: Record<string, unknown>) => {
    try {
      // Backend expects: nom, email, role, password
      await apiClient.post('/auth/register', userData);

      // Auto-Login after successful registration
      const loginForm = new FormData();
      loginForm.append('username', userData.email as string);
      loginForm.append('password', userData.password as string);

      await login(loginForm);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setRoleState(null);
    setUser(null);
    localStorage.removeItem('neurofocus_token');
    localStorage.removeItem('neurofocus_role');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
