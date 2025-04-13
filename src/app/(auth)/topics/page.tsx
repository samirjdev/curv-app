"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundPattern } from "@/components/ui/background-pattern";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Smile, Plus, X } from "lucide-react";
import EmojiPicker from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const topics = [
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'technology', label: 'Tech', emoji: '💻' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'entertainment', label: 'Media', emoji: '🎬' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'politics', label: 'Politics', emoji: '🏛️' }
];

interface CustomTopic {
  id: string;
  label: string;
  emoji: string;
}

export default function TopicsPage() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopics, setCustomTopics] = useState<CustomTopic[]>([]);
  const [currentEmoji, setCurrentEmoji] = useState("😊");
  const [currentCustomTopic, setCurrentCustomTopic] = useState("");
  const router = useRouter();

  const hasGlobalTopic = selectedTopics.some(topicId => 
    topics.some(globalTopic => globalTopic.id === topicId)
  );

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

  const handleAddCustomTopic = () => {
    if (customTopics.length >= 3) return;
    if (!currentCustomTopic.trim()) return;
    
    const newTopic: CustomTopic = {
      id: `custom-${Date.now()}`,
      label: currentCustomTopic,
      emoji: currentEmoji
    };

    setCustomTopics(prev => [...prev, newTopic]);
    setSelectedTopics(prev => [...prev, newTopic.id]);
    setCurrentCustomTopic("");
    setCurrentEmoji("😊");
  };

  const handleRemoveCustomTopic = (topicId: string) => {
    setCustomTopics(prev => prev.filter(topic => topic.id !== topicId));
    setSelectedTopics(prev => prev.filter(id => id !== topicId));
  };

  const isEmojiUsed = (emoji: string) => {
    return topics.some(topic => topic.emoji === emoji) || 
           customTopics.some(topic => topic.emoji === emoji);
  };

  const handleSubmit = () => {
    if (!hasGlobalTopic) {
      return;
    }
    localStorage.setItem('selectedTopics', JSON.stringify(selectedTopics));
    localStorage.setItem('customTopics', JSON.stringify(customTopics));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackgroundPattern />
      <Card className="w-[350px] border-2 border-neutral-200 dark:border-neutral-800 shadow-2xl bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-rajdhani text-2xl font-semibold text-neutral-900 dark:text-white">
            Choose Your Topics
          </CardTitle>
          <CardDescription className="font-rajdhani text-neutral-600 dark:text-neutral-300">
            Select the global topics you're interested in. You must choose at least one global topic. More global topics will be coming soon, so stay tuned for updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {topics.map((topic) => (
              <Button
                key={topic.id}
                variant={selectedTopics.includes(topic.id) ? "default" : "outline"}
                className={`h-24 flex flex-col items-center justify-center gap-2 font-rajdhani ${
                  selectedTopics.includes(topic.id)
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700"
                }`}
                onClick={() => handleTopicToggle(topic.id)}
              >
                <span className="text-4xl">{topic.emoji}</span>
                <span className="text-sm">{topic.label}</span>
              </Button>
            ))}
          </div>
          
          <div className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400 font-rajdhani">
            You can also create a custom topic with daily content based on your interests.
          </div>

          {/* Custom Topics Section */}
          <div className="mt-4 space-y-3">
            {customTopics.map((topic) => (
              <div key={topic.id} className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center text-xl bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  {topic.emoji}
                </div>
                <div className="flex-1 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm">
                  {topic.label}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemoveCustomTopic(topic.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {customTopics.length < 3 && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <span className="text-xl">{currentEmoji}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        if (!isEmojiUsed(emojiData.emoji)) {
                          setCurrentEmoji(emojiData.emoji);
                        }
                      }}
                      width="100%"
                      height="350px"
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  className="flex-1 h-8 text-sm"
                  placeholder="Enter custom topic..."
                  value={currentCustomTopic}
                  onChange={(e) => setCurrentCustomTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomTopic();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleAddCustomTopic}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 mt-4">
          <Button 
            className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100" 
            onClick={handleSubmit}
            disabled={!hasGlobalTopic}
          >
            Let's go
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 