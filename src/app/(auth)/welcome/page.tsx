"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundPattern } from "@/components/ui/background-pattern";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackgroundPattern />
      <Card className="w-[350px] border-none shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-rajdhani text-2xl font-semibold text-gray-900 dark:text-white text-center">Welcome to Curv</CardTitle>
          <CardDescription className="font-rajdhani text-gray-600 dark:text-gray-300 text-center">
            Your personalized news and trends app
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-4 mt-4">
          <Button 
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100" 
            onClick={() => router.push("/")}
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 