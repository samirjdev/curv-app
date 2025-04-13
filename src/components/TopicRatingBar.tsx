"use client";

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface TopicRatingBarProps {
  date: string;
  topic: string;
}

export default function TopicRatingBar({ date, topic }: TopicRatingBarProps) {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/ratings?date=${date}&topic=${topic}`);
      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes || 0);
        setDislikes(data.dislikes || 0);
      }
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [date, topic]);

  const handleVote = async (vote: 'like' | 'dislike') => {
    try {
      // Optimistically update the UI
      if (vote === 'like') {
        setLikes(prev => prev + 1);
      } else {
        setDislikes(prev => prev + 1);
      }

      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          topic,
          vote,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes);
        setDislikes(data.dislikes);
      }
    } catch (error) {
      console.error('Failed to submit vote:', error);
      // Revert optimistic update on error
      fetchRatings();
    }
  };

  const total = likes + dislikes;
  const likePercentage = total > 0 ? (likes / total) * 100 : 50;

  return (
    <div className="mt-8 mb-4">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => handleVote('like')}
          className="flex items-center gap-2 p-2 rounded-lg transition-colors text-neutral-500 hover:text-green-500"
        >
          <ThumbsUp className="h-5 w-5" />
          <span>{likes}</span>
        </button>

        <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden relative">
          <div
            className="absolute left-0 h-full bg-green-500 transition-all duration-300"
            style={{
              width: `${likePercentage}%`,
            }}
          />
          <div
            className="absolute right-0 h-full bg-red-500 transition-all duration-300"
            style={{
              width: `${100 - likePercentage}%`,
            }}
          />
        </div>

        <button
          onClick={() => handleVote('dislike')}
          className="flex items-center gap-2 p-2 rounded-lg transition-colors text-neutral-500 hover:text-red-500"
        >
          <ThumbsDown className="h-5 w-5" />
          <span>{dislikes}</span>
        </button>
      </div>
    </div>
  );
} 