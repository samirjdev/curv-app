"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Edit, ArrowLeft, ArrowRight } from "lucide-react";
import { format, subDays, addDays } from "date-fns";
import { BackgroundPattern } from "@/components/ui/background-pattern";
import ThemeToggle from "@/components/ThemeToggle";

interface Headline {
  headline: string;
  text: string;
  sources: string[];
}

interface TopicData {
  emoji: string;
  headlines: Headline[];
}

interface DailyData {
  [key: string]: TopicData;
}

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [expandedHeadlines, setExpandedHeadlines] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    const savedTopics = localStorage.getItem('selectedTopics');
    
    if (!savedUsername || !savedTopics) {
      router.push('/setup');
      return;
    }

    const topics = JSON.parse(savedTopics);
    setUsername(savedUsername);
    setSelectedTopics(topics);
    setCurrentTopic(topics[0]); // Set first topic as default
  }, [router]);

  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const response = await fetch(`/data/${dateStr}.json`);
        const data = await response.json();
        setDailyData(data);
      } catch (error) {
        console.error('Error fetching daily data:', error);
      }
    };

    fetchDailyData();
  }, [currentDate]);

  const toggleHeadline = (id: string) => {
    setExpandedHeadlines(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1)
    );
  };

  if (!dailyData || !currentTopic) return null;

  const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isSevenDaysAgo = format(currentDate, 'yyyy-MM-dd') === format(subDays(new Date(), 7), 'yyyy-MM-dd');
  const topicData = dailyData[currentTopic];

  return (
    <div className="min-h-screen">
      <BackgroundPattern />
      
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-17 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md flex items-center justify-between px-4 z-50">
        <div className="text-lg font-rajdhani text-gray-900 dark:text-white w-32 whitespace-nowrap">
          Hi, {username}
        </div>
        <div className="text-lg font-rajdhani text-gray-900 dark:text-white text-center flex-1">
          {format(currentDate, 'M/d')} - {currentTopic.charAt(0).toUpperCase() + currentTopic.slice(1)}
        </div>
        <div className="flex gap-2 w-32 justify-end">
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-gray-300 dark:border-gray-600"
            onClick={() => navigateDay('prev')}
            disabled={isSevenDaysAgo}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-gray-300 dark:border-gray-600"
            onClick={() => navigateDay('next')}
            disabled={isToday}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-20 px-4 max-w-3xl mx-auto space-y-3">
        {topicData.headlines.map((headline, index) => {
          const headlineId = `${currentTopic}-${index}`;
          const isExpanded = expandedHeadlines.has(headlineId);

          return (
            <Card
              key={headlineId}
              className="border-none shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => toggleHeadline(headlineId)}
            >
              <CardHeader className="py-0.1 px-4">
                <div className="flex items-center justify-between -my-1">
                  <h3 className="text-sm font-rajdhani font-medium text-gray-900 dark:text-white">
                    {headline.headline}
                  </h3>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="px-4 pt-0 pb-3 space-y-3">
                  <p className="text-sm font-rajdhani text-gray-600 dark:text-gray-300">
                    {headline.text}
                  </p>
                  <div className="text-xs font-rajdhani text-gray-500 dark:text-gray-400">
                    Sources: {headline.sources.join(', ')}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-17 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md flex items-center px-4 z-50">
        <div className="w-10">
          <Button
            variant="outline"
            className="w-10 h-13 p-0 border-gray-300 dark:border-gray-600"
            onClick={() => router.push('/topics')}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex justify-center gap-2">
          {selectedTopics.map(topic => (
            <Button
              key={topic}
              variant={currentTopic === topic ? "default" : "outline"}
              className={`w-10 h-13 p-0 ${
                currentTopic === topic
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              onClick={() => setCurrentTopic(topic)}
            >
              <span className="text-xl">{dailyData[topic].emoji}</span>
            </Button>
          ))}
        </div>
        <div className="w-10">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
} 