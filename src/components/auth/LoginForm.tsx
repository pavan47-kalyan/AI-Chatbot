
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onSuccess: () => void;
  switchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const emailSchema = z.string().email("Please enter a valid email").toLowerCase();
  const passwordSchema = z.string().min(1, "Password is required");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate inputs
      const validEmail = emailSchema.parse(email);
      const validPassword = passwordSchema.parse(password);
      
      // Attempt login
      await login(validEmail, validPassword);
      
      toast.success("Login successful!");
      onSuccess();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="w-full"
          required
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <button 
            type="button"
            className="text-xs text-purple-600 hover:underline" 
            onClick={() => toast.info("Password reset functionality would be implemented here")}
          >
            Forgot password?
          </button>
        </div>
        <Input
          id="password" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full"
          required
        />
      </div>
      
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>
      
      <div className="text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={switchToSignup}
          className="text-purple-600 hover:underline font-medium"
        >
          Sign up
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
