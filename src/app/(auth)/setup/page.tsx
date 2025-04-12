"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackgroundPattern } from "@/components/ui/background-pattern";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SetupPage() {
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setError("Please upload a JPG, JPEG, or PNG file");
      return;
    }

    // Check image dimensions and resize if needed
    const img = new window.Image();
    img.onload = () => {
      if (img.width > 256 || img.height > 256) {
        setError("Image must not be larger than 256x256 pixels");
        return;
      }
      setError(null);

      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Calculate scaling to fill the canvas while maintaining aspect ratio
        const scale = Math.max(256 / img.width, 256 / img.height);
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;
        
        // Calculate position to center the scaled image
        const x = (256 - newWidth) / 2;
        const y = (256 - newHeight) / 2;
        
        // Draw image scaled and centered on canvas
        ctx.drawImage(img, x, y, newWidth, newHeight);
        
        // Convert canvas to data URL
        const resizedImage = canvas.toDataURL(file.type);
        setProfilePicture(resizedImage);
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !profilePicture) {
      setError("Please fill in all fields");
      return;
    }
    // TODO: Save username and profile picture
    router.push("/welcome");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackgroundPattern />
      <Card className="w-[350px] border-none shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-rajdhani text-2xl font-semibold text-gray-900 dark:text-white">Complete your profile</CardTitle>
          <CardDescription className="font-rajdhani text-gray-600 dark:text-gray-300">Choose a username and add a profile picture</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label className="text-gray-700 dark:text-gray-300">Profile Picture</Label>
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                    {profilePicture ? (
                      <Image
                        src={profilePicture}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Image
                  </Button>
                  {error && (
                    <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-4">
            <Button 
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100" 
              type="submit"
            >
              Next
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 