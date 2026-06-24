
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '../../hooks/useAuth';

interface SignupFormProps {
  onSuccess: () => void;
  switchToLogin: () => void;
}

const countries = [
  { value: "us", label: "United States", code: "+1" },
  { value: "ca", label: "Canada", code: "+1" },
  { value: "uk", label: "United Kingdom", code: "+44" },
  { value: "au", label: "Australia", code: "+61" },
  { value: "in", label: "India", code: "+91" },
  { value: "jp", label: "Japan", code: "+81" },
  { value: "de", label: "Germany", code: "+49" },
  { value: "fr", label: "France", code: "+33" },
  { value: "br", label: "Brazil", code: "+55" },
  { value: "mx", label: "Mexico", code: "+52" },
  { value: "other", label: "Other", code: "" }
];

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, switchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  
  const nameSchema = z.string().min(2, "Full name must be at least 2 characters");
  const emailSchema = z.string().email("Please enter a valid email").toLowerCase();
  const passwordSchema = z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[0-9]/, "Password must contain at least one number");
  const phoneSchema = z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const validName = nameSchema.parse(fullName);
      const validEmail = emailSchema.parse(email);
      const validPassword = passwordSchema.parse(password);
      const validPhone = phoneSchema.parse(phone);
      
      if (!country) {
        throw new Error("Please select your country");
      }
      
      await signup({
        name: validName,
        email: validEmail,
        password: validPassword,
        phone: validPhone,
        dateOfBirth: new Date(), // Default value since we removed the field
        country
      });
      
      toast.success("Account created successfully!");
      onSuccess();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCountry = countries.find(c => c.value === country);
  const phonePrefix = selectedCountry?.code || '';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          className="w-full"
          required
        />
      </div>
      
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
        <Label htmlFor="password">Password (must include numbers)</Label>
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
      
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.label} ({country.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Mobile Number</Label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            {phonePrefix}
          </span>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="123456789"
            className="flex-1 rounded-l-none"
            required
          />
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium"
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
      
      <div className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={switchToLogin}
          className="text-purple-600 hover:underline font-medium"
        >
          Login
        </button>
      </div>
    </form>
  );
};

export default SignupForm;
