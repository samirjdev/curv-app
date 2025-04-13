"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Edit, ArrowLeft, ArrowRight, Settings, MessageCircle, Pin } from "lucide-react";
import { format, subDays, addDays } from "date-fns";
import { BackgroundPattern } from "@/components/ui/background-pattern";
import ThemeToggle from "@/components/ThemeToggle";
import CountdownTimer from "@/components/CountdownTimer";
import TopicRatingBar from "@/components/TopicRatingBar";
import CommentDialog from "@/components/CommentDialog";

const TOPICS_DATA: Record<string, { emoji: string }> = {
  sports: { emoji: '⚽' },
  technology: { emoji: '💻' },
  business: { emoji: '💼' },
  entertainment: { emoji: '🎬' },
  science: { emoji: '🔬' },
  politics: { emoji: '🏛️' }
};

interface Article {
  _id: string;
  headline: string;
  text: string;
  sources: string[];
  emoji?: string;
  comments: Array<{
    user: {
      _id: string;
    };
    text: string;
    createdAt: string;
    _id: string;
  }>;
}

interface TopicData {
  emoji: string;
  headlines: Article[];
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
  const [pinnedArticles, setPinnedArticles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<{ id: string; headline: string } | null>(null);

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
              _id: article._id,
              headline: article.headline,
              text: article.text,
              sources: article.sources,
              comments: article.comments || []
            }))
          }
        };

        console.log('Transformed Data:', transformedData); // Add this for debugging

        setDailyData(transformedData);

        // Fetch pinned status for these articles
        const pinsResponse = await fetch('/api/pins', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (pinsResponse.ok) {
          const { articles: pinnedArticles } = await pinsResponse.json();
          const pinnedIds: Set<string> = new Set(pinnedArticles.map((article: { id: string }) => article.id));
          setPinnedArticles(pinnedIds);
        }
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

  const handleCardClick = (e: React.MouseEvent, headlineId: string) => {
    // Don't toggle expansion if clicking the action buttons
    if (!(e.target as HTMLElement).closest('.article-actions')) {
      toggleHeadline(headlineId);
    }
  };

  const togglePin = async (e: React.MouseEvent, headlineId: string) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token || !dailyData) return;

    const [topic, index] = headlineId.split('-');
    const article = dailyData[topic].headlines[parseInt(index)];
    if (!article) return;
    
    try {
      if (pinnedArticles.has(headlineId)) {
        // Unpin the article
        const response = await fetch(`/api/pins?articleId=${article._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to unpin article');
        
        setPinnedArticles(prev => {
          const next = new Set(prev);
          next.delete(headlineId);
          return next;
        });
      } else {
        // Pin the article
        const response = await fetch('/api/pins', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ articleId: article._id })
        });

        if (!response.ok) throw new Error('Failed to pin article');

        setPinnedArticles(prev => {
          const next = new Set(prev);
          next.add(headlineId);
          return next;
        });
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      // You might want to show an error toast here
    }
  };

  const openComments = (e: React.MouseEvent, headlineId: string) => {
    e.stopPropagation();
    if (!dailyData) return;

    const [topic, index] = headlineId.split('-');
    const article = dailyData[topic].headlines[parseInt(index)];
    if (!article) return;

    setSelectedArticle({
      id: article._id,
      headline: article.headline
    });
    setCommentDialogOpen(true);
  };

  const handleCommentAdded = async () => {
    // Refetch the current day's articles to update comment counts
    const fetchData = async () => {
      try {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/articles?date=${dateStr}&topic=${currentTopic}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch articles');

        const { articles } = await response.json();
        
        // Update only the headlines array in the current topic
        setDailyData(prev => ({
          ...prev,
          [currentTopic]: {
            emoji: articles[0]?.emoji || TOPICS_DATA[currentTopic]?.emoji || '📰',
            headlines: articles.map((article: any) => ({
              _id: article._id,
              headline: article.headline,
              text: article.text,
              sources: article.sources,
              comments: article.comments || []
            }))
          }
        }));
      } catch (error) {
        console.error('Error refreshing articles:', error);
      }
    };

    await fetchData();
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
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm shadow-md flex items-center px-4 z-50">
        <div className="w-32 flex justify-start">
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-neutral-300 dark:border-neutral-600"
            onClick={() => router.push('/pins')}
          >
            <Pin className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <Image
            src="/curv_text.png"
            alt="Curv"
            width={125}
            height={50}
            className="invert dark:invert-0"
            priority
          />
        </div>
        <div className="w-32 flex justify-end gap-2">
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
          {format(currentDate, 'MMMM')} {format(currentDate, 'd')}{getOrdinalSuffix(currentDate.getDate())} ⠀⠀{currentTopic.charAt(0).toUpperCase() + currentTopic.slice(1)}
        </div>
      </div>

      {/* Content */}
      <div className="pt-32 pb-32 px-4 max-w-2xl mx-auto space-y-3">
        {topicData && topicData.headlines && topicData.headlines.length > 0 ? (
          <>
            {topicData.headlines.map((headline, index) => {
              const headlineId = `${currentTopic}-${index}`;
              const isExpanded = expandedHeadlines.has(headlineId);

              return (
                <Card
                  key={headlineId}
                  className="border-none shadow-2xl bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-all duration-300 relative"
                  onClick={(e) => handleCardClick(e, headlineId)}
                >
                  <CardHeader className="py-0.1 px-4">
                    <div className="flex items-center justify-between -my-1">
                      <h3 className="text-sm font-manrope font-medium text-neutral-900 dark:text-white">
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
                    <>
                      <CardContent className="px-4 pt-0 pb-3 space-y-3">
                        <p className="text-sm font-manrope text-neutral-600 dark:text-neutral-300">
                          {headline.text}
                        </p>
                        <div className="text-xs font-manrope text-neutral-500 dark:text-neutral-400">
                          Sources: {headline.sources.join(', ')}
                        </div>
                      </CardContent>
                      <div className="absolute bottom-8 right-4 flex gap-2 article-actions">
                        <button
                          onClick={(e) => openComments(e, headlineId)}
                          className="h-7 flex items-center gap-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-2.5"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
                          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                            {headline.comments?.length || 0}
                          </span>
                        </button>
                        <button
                          onClick={(e) => togglePin(e, headlineId)}
                          className={`h-7 w-7 rounded-full ${
                            pinnedArticles.has(headlineId)
                              ? 'bg-blue-500 text-white'
                              : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                          } flex items-center justify-center transition-colors`}
                        >
                          <Pin className={`h-3.5 w-3.5 ${
                            pinnedArticles.has(headlineId)
                              ? 'text-white'
                              : 'text-neutral-600 dark:text-neutral-400'
                          }`} />
                        </button>
                      </div>
                    </>
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
          <div className="flex flex-col items-center justify-center min-h-[250px] pt-10">
            <div className="text-lg text-neutral-500 dark:text-neutral-400">
              No topics could be found :(
            </div>
            <div className="text-lg text-neutral-500 dark:text-neutral-400 mt-2">
              Find some new headlines?
            </div>
            <Button
              variant="outline"
              className="mt-6 px-8 py-2 text-neutral-500 dark:text-neutral-400 border-neutral-300 dark:border-neutral-600"
            >
              Generate
            </Button>
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

      {selectedArticle && (
        <CommentDialog
          isOpen={commentDialogOpen}
          onClose={() => {
            setCommentDialogOpen(false);
            setSelectedArticle(null);
          }}
          articleId={selectedArticle.id}
          headline={selectedArticle.headline}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
}

const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}; 