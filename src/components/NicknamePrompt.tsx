import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIdentity } from '@/context/IdentityContext';
import { User } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const NicknamePrompt = ({ open, onOpenChange, onComplete }: Props) => {
  const { setNickname } = useIdentity();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim() || 'Anonymous';
    setNickname(trimmed);
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Set Your Nickname
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a nickname to identify your reports. This builds your trust score over time.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="e.g. StreetWatcher42"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="bg-secondary border-border text-foreground"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border text-muted-foreground"
              onClick={() => { setNickname('Anonymous'); onComplete(); onOpenChange(false); }}
            >
              Stay Anonymous
            </Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NicknamePrompt;
