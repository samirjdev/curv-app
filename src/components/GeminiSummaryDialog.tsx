import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GeminiIcon } from "@/components/icons/GeminiIcon";

interface GeminiSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  isLoading: boolean;
}

export default function GeminiSummaryDialog({ isOpen, onClose, summary, isLoading }: GeminiSummaryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <GeminiIcon className="h-5 w-5 text-blue-500" />
            AI Summary
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-neutral-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <span>Generating summary...</span>
            </div>
          ) : (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {summary}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 