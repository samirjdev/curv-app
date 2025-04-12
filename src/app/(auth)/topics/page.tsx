"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundPattern } from "@/components/ui/background-pattern";
import { useRouter } from "next/navigation";

const topics = [
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'health', label: 'Health', emoji: '🏥' },
  { id: 'politics', label: 'Politics', emoji: '🏛️' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
];

export default function TopicsPage() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
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
      <Card className="w-[350px] border-none shadow-2xl bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-rajdhani text-2xl font-semibold text-neutral-900 dark:text-white">
            Choose Your Topics
          </CardTitle>
          <CardDescription className="font-rajdhani text-neutral-600 dark:text-neutral-300">
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
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700"
                }`}
                onClick={() => handleTopicToggle(topic.id)}
              >
                <span className="text-4xl">{topic.emoji}</span>
                {topic.label}
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 mt-4">
          <Button 
            className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100" 
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