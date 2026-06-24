
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveApiKey, hasApiKey, clearApiKey } from "../utils/apiKeyManager";
import { toast } from "sonner";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  
  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    
    setIsSaving(true);
    try {
      saveApiKey(apiKey.trim());
      toast.success('API key saved successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to save API key');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleClear = () => {
    try {
      clearApiKey();
      setApiKey('');
      toast.success('API key removed');
    } catch (error) {
      toast.error('Failed to remove API key');
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-700">
            <span className="mr-2">🔑</span>API Key Settings
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Enter your API key to enable the Review Rover analysis capabilities.
            This key will be stored securely in your browser.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey" className="text-left font-medium">
              API Key
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="pr-20 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 text-xs text-purple-600 hover:text-purple-800"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? "Hide" : "Show"}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              {hasApiKey() 
                ? "An API key is currently saved. You can update it or clear it." 
                : "No API key is currently saved."}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex space-x-4 sm:justify-between">
          {hasApiKey() && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Clear Key
            </Button>
          )}
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !apiKey}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSaving ? "Saving..." : "Save Key"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
