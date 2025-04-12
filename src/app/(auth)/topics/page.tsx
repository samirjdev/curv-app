"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundPattern } from "@/components/ui/background-pattern";
import { useRouter } from "next/navigation";

const topics = [
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'tech', label: 'Technology', emoji: '💻' },
  { id: 'politics', label: 'Politics', emoji: '🏛️' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'random', label: 'Random', emoji: '🎲' },
];

export default function TopicsPage() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (!savedUsername) {
      router.push('/setup');
      return;
    }
  }, [router]);

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSubmit = () => {
    if (selectedTopics.length === 0) {
      return;
    }
    localStorage.setItem('selectedTopics', JSON.stringify(selectedTopics));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackgroundPattern />
      <Card className="w-[350px] border-none shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-rajdhani text-2xl font-semibold text-gray-900 dark:text-white">
            Choose Your Topics
          </CardTitle>
          <CardDescription className="font-rajdhani text-gray-600 dark:text-gray-300">
            Select the topics you're interested in. You can choose as many as you want.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {topics.map((topic) => (
              <Button
                key={topic.id}
                variant={selectedTopics.includes(topic.id) ? "default" : "outline"}
                className={`h-24 flex flex-col items-center justify-center gap-2 text-lg font-rajdhani ${
                  selectedTopics.includes(topic.id)
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => handleTopicToggle(topic.id)}
              >
                <span className="text-2xl">{topic.emoji}</span>
                {topic.label}
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 mt-4">
          <Button 
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100" 
            onClick={handleSubmit}
            disabled={selectedTopics.length === 0}
          >
            Let's go
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 