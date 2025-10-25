import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export interface User {
  username: string;
  role: UserRole;
  first_login: boolean;
  message: string;
  isProfileComplete: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load stored user on app start
    const storedUser = localStorage.getItem('medvault_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('medvault_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('medvault_user');
    }
  };

  const logout = () => {
    updateUser(null);
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{
      user,
      setUser: updateUser,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
