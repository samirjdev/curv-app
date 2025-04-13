"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface TrendingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
}

interface TrendingItem {
  rank: number;
  title: string;
  description: string;
  source: string;
}

const GLOBAL_TOPICS = ['Sports', 'Technology', 'Entertainment', 'Business', 'Politics', 'Science'];

export default function TrendingOverlay({ isOpen, onClose, topic }: TrendingOverlayProps) {
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isCustomTopic = !GLOBAL_TOPICS.includes(topic);

  useEffect(() => {
    if (isOpen && !isCustomTopic) {
      fetchTrendingData();
    }
  }, [isOpen, topic, isCustomTopic]);

  const fetchTrendingData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/trending?topic=${encodeURIComponent(topic)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trending data');
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received');
      }
      setTrendingItems(data);
    } catch (error) {
      console.error('Error fetching trending data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load trending topics');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>🔥</span>
                  <span>Trending in {topic}</span>
                </h2>
                <button
                  onClick={onClose}
                  className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {isCustomTopic ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-xl text-neutral-600 dark:text-neutral-400">
                    Trending page is not available with custom topics (yet!)
                  </p>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-8">
                  {error}
                </div>
              ) : trendingItems.length === 0 ? (
                <div className="text-neutral-500 text-center py-8">
                  No trending topics found for {topic}
                </div>
              ) : (
                <div className="space-y-4">
                  {trendingItems.map((item) => (
                    <div
                      key={item.rank}
                      className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 flex items-start gap-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                        #{item.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
                          {item.title}
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-300 mt-1">
                          {item.description}
                        </p>
                        <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                          Source: {item.source}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 