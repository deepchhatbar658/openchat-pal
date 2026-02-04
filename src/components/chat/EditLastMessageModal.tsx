import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface EditLastMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue: string;
  onSave: (value: string) => void;
  isSaving?: boolean;
}

export function EditLastMessageModal({
  isOpen,
  onClose,
  initialValue,
  onSave,
  isSaving = false,
}: EditLastMessageModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [initialValue, isOpen]);

  const trimmed = value.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] glass border-border/30 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Edit last message
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Update your last prompt and regenerate the response.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Update your message..."
          className="min-h-[160px] resize-none text-sm glass-input border-border/30 focus:ring-2 focus:ring-primary/20 rounded-xl placeholder:text-muted-foreground/40"
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="hover:bg-muted/50 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave(trimmed)}
            disabled={!trimmed || isSaving}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground rounded-xl shadow-glow-subtle"
          >
            Save & Regenerate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
