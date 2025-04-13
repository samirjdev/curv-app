"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Pin } from "lucide-react";
import { BackgroundPattern } from "@/components/ui/background-pattern";

interface Article {
  id: string;
  headline: string;
  text: string;
  sources: string[];
  topic: string;
  date: string;
  emoji?: string;
  pinnedAt: string;
}

export default function PinsPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [pinnedArticles, setPinnedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        setUsername(userData.user.username || '');

        // Fetch pinned articles
        const pinsResponse = await fetch('/api/pins', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!pinsResponse.ok) {
          throw new Error('Failed to fetch pinned articles');
        }

        const { articles } = await pinsResponse.json();
        setPinnedArticles(articles);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const unpin = async (articleId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/pins?articleId=${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to unpin article');

      setPinnedArticles(prev => prev.filter(article => article.id !== articleId));
    } catch (error) {
      console.error('Error unpinning article:', error);
      // You might want to show an error toast here
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

  return (
    <div className="min-h-screen font-manrope">
      <BackgroundPattern />
      
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm shadow-md flex items-center px-4 z-50">
        <div className="w-32 flex justify-start">
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-neutral-300 dark:border-neutral-600"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <Image
            src="/curv_text.png"
            alt="Curv"
            width={100}
            height={40}
            className="invert dark:invert-0"
            priority
          />
        </div>
        <div className="w-32" /> {/* Empty div for spacing */}
      </div>

      {/* Greeting */}
      <div className="pt-24 pb-4 px-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Hello, {username}
        </h1>
      </div>

      {/* Content */}
      <div className="pb-32 px-4 max-w-2xl mx-auto space-y-3">
        {pinnedArticles.length > 0 ? (
          pinnedArticles.map((article, index) => (
            <Card
              key={index}
              className="border-none shadow-2xl bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm relative"
            >
              <CardHeader className="py-4 px-4">
                <h3 className="text-sm font-manrope font-medium text-neutral-900 dark:text-white">
                  {article.headline}
                </h3>
              </CardHeader>
              <CardContent className="px-4 pt-0 pb-12 space-y-3">
                <p className="text-sm font-manrope text-neutral-600 dark:text-neutral-300">
                  {article.text}
                </p>
                <div className="text-xs font-manrope text-neutral-500 dark:text-neutral-400">
                  Sources: {article.sources.join(', ')}
                </div>
                <div className="text-xs font-manrope text-neutral-500 dark:text-neutral-400">
                  Topic: {article.topic.charAt(0).toUpperCase() + article.topic.slice(1)}
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={() => unpin(article.id)}
                    className="h-7 w-7 rounded-full bg-blue-500 text-white flex items-center justify-center transition-colors hover:bg-blue-600"
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-neutral-500 dark:text-neutral-400 mt-8">
            No pinned articles yet
          </div>
        )}
      </div>
    </div>
  );
} 