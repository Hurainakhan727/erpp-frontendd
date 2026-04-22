import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  username: string;
  role: 'super_admin' | 'hr' | 'employee';
  employeeId?: string;
}

interface AuthContextType {
  user: User | null;
  activeRole: 'super_admin' | 'hr' | 'employee';
  login: (username: string, password: string) => boolean;
  logout: () => void;
  switchRole: (role: 'super_admin' | 'hr' | 'employee') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ACCOUNTS: Record<string, { password: string; role: 'super_admin' | 'hr' | 'employee'; employeeId?: string }> = {
  superadmin: { password: 'admin123', role: 'super_admin' },
  hr1: { password: 'hr123', role: 'hr' },
  emp001: { password: 'emp123', role: 'employee', employeeId: 'EMP001' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('ems_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [activeRole, setActiveRole] = useState<'super_admin' | 'hr' | 'employee'>(() => {
    const stored = localStorage.getItem('ems_user');
    return stored ? JSON.parse(stored).role : 'hr';
  });

  const login = (username: string, password: string): boolean => {
    const account = ACCOUNTS[username.toLowerCase()];
    if (account && account.password === password) {
      const u: User = { username, role: account.role, employeeId: account.employeeId };
      setUser(u);
      setActiveRole(u.role);
      localStorage.setItem('ems_user', JSON.stringify(u));
      localStorage.setItem('ems_token', 'dummy');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ems_user');
    localStorage.removeItem('ems_token');
  };

  const switchRole = (role: 'super_admin' | 'hr' | 'employee') => {
    setActiveRole(role);
  };

  return (
    <AuthContext.Provider value={{ user, activeRole, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}











