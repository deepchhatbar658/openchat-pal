import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Key, Shield } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  onClose?: () => void;
  isChanging?: boolean;
}

export function ApiKeyModal({ isOpen, onSave, onClose, isChanging = false }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      setApiKey('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && isChanging && onClose?.()}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground font-mono">
            <Key className="h-5 w-5 text-primary" />
            {isChanging ? 'Change API Key' : 'Enter API Key'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isChanging 
              ? 'Enter your new OpenRouter API key to continue.'
              : 'Enter your OpenRouter API key to start chatting. Your key is stored locally and never sent to our servers.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="relative">
            <Input
              type="password"
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground font-mono text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3 text-primary" />
            <span>Stored securely in your browser's localStorage</span>
          </div>
          
          <div className="flex gap-2 justify-end">
            {isChanging && onClose && (
              <Button
                variant="outline"
                onClick={onClose}
                className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono"
            >
              Save API Key
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
