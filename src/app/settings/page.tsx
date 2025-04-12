"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Settings, ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load user data from token
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
        setEmail(data.user.email || '');
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router]);

  // Debounced username validation
  useEffect(() => {
    if (!username || username === localStorage.getItem('username')) {
      setError(null);
      return;
    }

    const validateUsername = async () => {
      if (username.length < 3) return;
      
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

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Validate username if changed
      if (username !== localStorage.getItem('username')) {
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
      }

      // Update user profile
      const updateResponse = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          currentPassword: password,
          newPassword: newPassword || undefined,
        }),
      });

      const updateData = await updateResponse.json();
      if (!updateResponse.ok) {
        throw new Error(updateData.error || 'Failed to update profile');
      }

      // Update localStorage
      localStorage.setItem('username', username);
      
      setSuccessMessage('Profile updated successfully');
      setPassword('');
      setNewPassword('');
    } catch (error: any) {
      console.error('Settings update error:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTopics = () => {
    router.push("/topics");
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-rajdhani font-bold text-neutral-900 dark:text-white">
            Settings
          </h1>
        </div>

        {error && (
          <div className="mb-6 text-red-500 text-sm bg-red-50 dark:bg-red-900/10 p-3 rounded-md">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 text-green-500 text-sm bg-green-50 dark:bg-green-900/10 p-3 rounded-md">
            {successMessage}
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-rajdhani">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="font-rajdhani"
                disabled={isLoading}
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="font-rajdhani bg-neutral-50 dark:bg-neutral-950"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-rajdhani">Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-rajdhani"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="font-rajdhani"
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-rajdhani">Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleEditTopics}
              className="w-full font-rajdhani"
              disabled={isLoading}
            >
              Edit Topics
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-rajdhani text-red-600 dark:text-red-500">Logout</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                localStorage.clear(); // Clear all localStorage items
                router.push('/login');
              }}
              className="w-full font-rajdhani bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600"
              disabled={isLoading}
            >
              Logout
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="font-rajdhani"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="font-rajdhani"
            disabled={isLoading || isValidating || !!error}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
} 