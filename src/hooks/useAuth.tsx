
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  country: string;
}

interface SignupParams {
  name: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: Date;
  country: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (params: SignupParams) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('review-rover-user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        
        // Convert string date back to Date object
        if (userData.dateOfBirth) {
          userData.dateOfBirth = new Date(userData.dateOfBirth);
        }
        
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Simulate API call with 1 second delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user authentication
    const storedUsers = localStorage.getItem('review-rover-users');
    if (storedUsers) {
      const users = JSON.parse(storedUsers);
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        // Remove password before setting user
        const { password, ...userWithoutPassword } = foundUser;
        
        // Convert string date back to Date object
        if (userWithoutPassword.dateOfBirth) {
          userWithoutPassword.dateOfBirth = new Date(userWithoutPassword.dateOfBirth);
        }
        
        setUser(userWithoutPassword);
        setIsAuthenticated(true);
        localStorage.setItem('review-rover-user', JSON.stringify(userWithoutPassword));
        return;
      }
    }
    
    throw new Error('Invalid email or password');
  };

  const signup = async (params: SignupParams): Promise<void> => {
    // Simulate API call with 1 second delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create new user with unique ID
    const newUser = {
      ...params,
      id: crypto.randomUUID(),
    };
    
    // Store in localStorage for demo purposes
    const storedUsers = localStorage.getItem('review-rover-users');
    let users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // Check if email already exists
    if (users.some((u: any) => u.email === params.email)) {
      throw new Error('Email already exists');
    }
    
    users.push(newUser);
    localStorage.setItem('review-rover-users', JSON.stringify(users));
    
    // Auto login after signup
    const { password, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem('review-rover-user', JSON.stringify(userWithoutPassword));
  };

  const logout = (): void => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('review-rover-user');
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
