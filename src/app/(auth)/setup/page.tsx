"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackgroundPattern } from "@/components/ui/background-pattern";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if username already exists in localStorage
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!username.trim()) {
      setError("Username is required");
      setIsLoading(false);
      return;
    }

    try {
      // Store username in localStorage
      localStorage.setItem('username', username.trim());
      
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      router.push('/welcome');
    } catch (error: any) {
      console.error('Setup error:', error);
      setError('An error occurred while saving your username');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackgroundPattern />
      <Card className="w-[350px] border-none shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-rajdhani text-2xl font-semibold text-gray-900 dark:text-white">Welcome!</CardTitle>
          <CardDescription className="font-rajdhani text-gray-600 dark:text-gray-300">Choose a display name to get started</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
                  {error}
                </div>
              )}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">Display Name</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a display name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-4">
            <Button 
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Setting up...' : 'Continue'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 