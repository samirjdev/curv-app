"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundPattern } from "@/components/ui/background-pattern";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

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
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router]);

  const handleNext = () => {
    router.push('/topics');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackgroundPattern />
      <Card className="w-[350px] border-none shadow-2xl bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-rajdhani text-2xl font-semibold text-neutral-900 dark:text-white">
            Welcome to Curv, {username}!
          </CardTitle>
          <CardDescription className="font-rajdhani text-neutral-600 dark:text-neutral-300 mt-4 space-y-4">
            <p>
              Curv is an anti-social media app, designed to take the good parts of social media without the bad. 
              We focus on content that matters to you, without the noise and distractions of traditional platforms.
            </p>
            <p>
              On the next screen, you'll select your favorite topics. Google Gemini will then generate daily headlines 
              based on your interests, and you can explore content from the past week.
            </p>
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-4 mt-4">
          <Button 
            className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100" 
            onClick={handleNext}
          >
            Choose your topics
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 