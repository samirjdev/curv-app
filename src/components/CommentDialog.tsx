import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";
import { GeminiIcon } from "@/components/icons/GeminiIcon";

interface Comment {
  username: string;
  text: string;
  createdAt: string;
}

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  headline: string;
}

export default function CommentDialog({ isOpen, onClose, articleId, headline }: CommentDialogProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          articleId,
          text: newComment.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to post comment');

      const { comment } = await response.json();
      setComments(prev => [...prev, comment]);
      setNewComment("");
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch comments when dialog opens
  useEffect(() => {
    const fetchComments = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`/api/comments?articleId=${articleId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch comments');

        const { comments } = await response.json();
        setComments(comments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, articleId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] h-[80vh] flex flex-col">
        <DialogHeader className="pb-2 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments
          </DialogTitle>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {headline}
          </p>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-2 pr-4">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div
                    key={index}
                    className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg"
                  >
                    <div className="text-sm font-medium text-neutral-900 dark:text-white">
                      {comment.username}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {comment.text}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-neutral-500 dark:text-neutral-400">
                  No comments yet
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="flex gap-2 mt-2 flex-shrink-0">
          <Textarea
            value={newComment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 min-h-[100px]"
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !newComment.trim()}
              className="h-[50px]"
            >
              Post
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // We'll implement this later
                console.log('Gemini clicked');
              }}
              className="h-[50px]"
            >
              <GeminiIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 