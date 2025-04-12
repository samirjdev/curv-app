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
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and has a username
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Check if user already has a username
    const checkUsername = async () => {
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
        if (data.user.username) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        router.push('/login');
      }
    };

    checkUsername();
  }, [router]);

  // Debounced username validation
  useEffect(() => {
    const validateUsername = async () => {
      if (!username || username.length < 3) return;
      
      setIsValidating(true);
      try {
        const response = await fetch('/api/auth/validate-username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.error);
        } else {
          setError(null);
        }
      } catch (error: any) {
        console.error('Username validation error:', error);
      } finally {
        setIsValidating(false);
      }
    };

    const timeoutId = setTimeout(validateUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate username one final time
      const validateResponse = await fetch('/api/auth/validate-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const validateData = await validateResponse.json();
      if (!validateResponse.ok) {
        setError(validateData.error);
        setIsLoading(false);
        return;
      }

      // Update user profile with username
      const token = localStorage.getItem('token');
      const updateResponse = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      const updateData = await updateResponse.json();
      if (!updateResponse.ok) {
        throw new Error(updateData.error || 'Failed to update username');
      }

      // Store username in localStorage
      localStorage.setItem('username', username.trim());
      
      router.push('/welcome');
    } catch (error: any) {
      console.error('Setup error:', error);
      setError(error.message || 'An error occurred while saving your username');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackgroundPattern />
      <Card className="w-[350px] border-2 border-neutral-200 dark:border-neutral-800 shadow-2xl bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-rajdhani text-2xl font-semibold text-neutral-900 dark:text-white">Welcome!</CardTitle>
          <CardDescription className="font-rajdhani text-neutral-600 dark:text-neutral-300">Choose a display name to get started</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              {error && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/10 p-2 rounded-md">
                  {error}
                </div>
              )}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username" className="text-neutral-700 dark:text-neutral-300">Display Name</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a display name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-600"
                  disabled={isLoading}
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  3-20 characters, letters, numbers, and underscores only
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-4">
            <Button 
              className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100" 
              type="submit"
              disabled={isLoading || isValidating || !!error}
            >
              {isLoading ? 'Setting up...' : 'Continue'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 