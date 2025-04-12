"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Edit, ArrowLeft, ArrowRight, Settings } from "lucide-react";
import { format, subDays, addDays } from "date-fns";
import { BackgroundPattern } from "@/components/ui/background-pattern";
import ThemeToggle from "@/components/ThemeToggle";
import CountdownTimer from "@/components/CountdownTimer";
import TopicRatingBar from "@/components/TopicRatingBar";

const TOPICS_DATA: Record<string, { emoji: string }> = {
  sports: { emoji: '⚽' },
  technology: { emoji: '💻' },
  business: { emoji: '💼' },
  entertainment: { emoji: '🎬' },
  science: { emoji: '🔬' },
  politics: { emoji: '🏛️' }
};

interface Article {
  headline: string;
  text: string;
  sources: string[];
  emoji?: string;
}

interface TopicData {
  emoji: string;
  headlines: {
    headline: string;
    text: string;
    sources: string[];
  }[];
}

interface DailyData {
  [key: string]: TopicData;
}

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2024, 3, 13)); // April 13, 2024
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [expandedHeadlines, setExpandedHeadlines] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedTopics = localStorage.getItem('selectedTopics');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (!savedTopics) {
      router.push('/setup');
      return;
    }

    // Fetch user data from server
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUsername(data.user.username || '');

        const topics = JSON.parse(savedTopics);
        // Ensure topics match the data file format
        const validTopics = topics.filter((topic: string) => 
          ['sports', 'technology', 'business', 'entertainment', 'science', 'politics'].includes(topic)
        );
        
        if (validTopics.length === 0) {
          // If no valid topics, redirect to setup
          router.push('/setup');
          return;
        }

        setSelectedTopics(validTopics);
        setCurrentTopic(validTopics[0]); // Set first valid topic as default
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/articles?date=${dateStr}&topic=${currentTopic}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            // No articles found, set empty state
            setDailyData({
              [currentTopic]: {
                emoji: TOPICS_DATA[currentTopic]?.emoji || '📰',
                headlines: []
              }
            });
            return;
          }
          throw new Error('Failed to fetch articles');
        }

        const { articles } = await response.json();
        
        // Transform the data to match the existing format
        const transformedData = {
          [currentTopic]: {
            emoji: articles[0]?.emoji || TOPICS_DATA[currentTopic]?.emoji || '📰',
            headlines: articles.map((article: any) => ({
              headline: article.headline,
              text: article.text,
              sources: article.sources
            }))
          }
        };

        setDailyData(transformedData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load articles. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentTopic) {
      fetchData();
    }
  }, [currentDate, currentTopic]);

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
    const newDate = direction === 'prev' 
      ? subDays(currentDate, 1)
      : addDays(currentDate, 1);
    
    // Only allow navigation between April 7-13, 2024
    const minDate = new Date(2024, 3, 7); // April 7, 2024
    const maxDate = new Date(2024, 3, 13); // April 13, 2024
    
    if (newDate >= minDate && newDate <= maxDate) {
      setCurrentDate(newDate);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <BackgroundPattern />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg text-neutral-900 dark:text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <BackgroundPattern />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg text-neutral-900 dark:text-white">{error}</div>
        </div>
      </div>
    );
  }

  if (!dailyData || !currentTopic) {
    return (
      <div className="min-h-screen">
        <BackgroundPattern />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg text-neutral-900 dark:text-white">No data available</div>
        </div>
      </div>
    );
  }

  const isToday = currentDate.getTime() >= new Date(2024, 3, 13).getTime();
  const isSevenDaysAgo = currentDate.getTime() <= new Date(2024, 3, 7).getTime();
  const topicData = dailyData[currentTopic];

  return (
    <div className="min-h-screen font-manrope">
      <BackgroundPattern />
      
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm shadow-md flex items-center justify-between px-4 z-50">
        <div className="text-lg text-neutral-900 dark:text-white w-32 whitespace-nowrap">
          Hello, {username}
        </div>
        <div className="text-2xl font-manrope text-neutral-900 dark:text-white text-center flex-1">
          Curv
        </div>
        <div className="flex gap-2 w-32 justify-end">
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-neutral-300 dark:border-neutral-600"
            onClick={() => navigateDay('prev')}
            disabled={isSevenDaysAgo}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-neutral-300 dark:border-neutral-600"
            onClick={() => navigateDay('next')}
            disabled={isToday}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Date-Topic Bar */}
      <div className="fixed top-16 left-0 right-0 h-12 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
        <div className="text-lg text-white">
          {format(currentDate, 'M/d')} ⠀⠀{currentTopic.charAt(0).toUpperCase() + currentTopic.slice(1)}
        </div>
      </div>

      {/* Content */}
      <div className="pt-32 pb-32 px-4 max-w-2xl mx-auto space-y-3">
        {topicData && topicData.headlines ? (
          <>
            {topicData.headlines.map((headline, index) => {
              const headlineId = `${currentTopic}-${index}`;
              const isExpanded = expandedHeadlines.has(headlineId);

              return (
                <Card
                  key={headlineId}
                  className="border-none shadow-2xl bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => toggleHeadline(headlineId)}
                >
                  <CardHeader className="py-0.1 px-4">
                    <div className="flex items-center justify-between -my-1">
                      <h3 className="text-sm font-rajdhani font-medium text-neutral-900 dark:text-white">
                        {headline.headline}
                      </h3>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-neutral-500 dark:text-neutral-400 ml-2 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-neutral-500 dark:text-neutral-400 ml-2 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="px-4 pt-0 pb-3 space-y-3">
                      <p className="text-sm font-rajdhani text-neutral-600 dark:text-neutral-300">
                        {headline.text}
                      </p>
                      <div className="text-xs font-rajdhani text-neutral-500 dark:text-neutral-400">
                        Sources: {headline.sources.join(', ')}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
            <TopicRatingBar 
              date={format(currentDate, 'yyyy-MM-dd')} 
              topic={currentTopic} 
            />
          </>
        ) : (
          <div className="text-center text-neutral-500 dark:text-neutral-400">
            No headlines available for this topic
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-17 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm shadow-md flex items-center px-4 z-50">
        <div className="w-10">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/settings")}
            className="h-12 w-12"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 flex justify-center gap-2">
          {selectedTopics.map((topic) => (
            <Button
              key={topic}
              variant={currentTopic === topic ? "default" : "outline"}
              size="icon"
              onClick={() => setCurrentTopic(topic)}
              className="h-12 w-12 text-2xl"
            >
              {TOPICS_DATA[topic]?.emoji || "📰"}
            </Button>
          ))}
        </div>
        <div className="w-10 flex justify-end">
          <ThemeToggle />
        </div>
      </div>

      {/* Countdown Timer */}
      <CountdownTimer />
    </div>
  );
} 