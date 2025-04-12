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
    const savedUsername = localStorage.getItem('username');
    if (!savedUsername) {
      router.push('/setup');
      return;
    }
    setUsername(savedUsername);
  }, [router]);

  const handleNext = () => {
    router.push('/topics');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackgroundPattern />
      <Card className="w-[350px] border-none shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-rajdhani text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome to Curv, {username}!
          </CardTitle>
          <CardDescription className="font-rajdhani text-gray-600 dark:text-gray-300 mt-4 space-y-4">
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
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100" 
            onClick={handleNext}
          >
            Choose your topics
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 