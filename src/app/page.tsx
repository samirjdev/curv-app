"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BackgroundPattern } from "@/components/ui/background-pattern";
import { Apple, Smartphone } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen font-manrope">
      <BackgroundPattern />
      
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm shadow-md flex items-center px-4 z-50">
        <div className="flex-1">
          <Image
            src="/curv_text.png"
            alt="Curv"
            width={100}
            height={40}
            className="invert dark:invert-0"
            priority
          />
        </div>
        <div className="flex gap-4">
          <Link href="https://github.com/samirjdev/curv-app" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
              Docs
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
              About Us
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl font-bold text-neutral-900 dark:text-white"
            >
              Curv your social media addiction
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-wrap gap-3 items-center"
            >
              <Link href="/login">
                <Button size="lg" className="h-11 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100">
                  Open on Web
                </Button>
              </Link>
              <Link href="/login">
                <Button size="icon" className="h-11 w-11 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100">
                  <Smartphone className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side - Placeholder for Graphic */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="w-full h-96 flex items-center justify-center">
              <Image
                src="/landingpage_icon.png"
                alt="Curv Landing"
                width={400}
                height={400}
                className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] invert-0 dark:invert"
                priority
                quality={100}
              />
            </div>
          </motion.div>
        </div>

        {/* Feature Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="p-6 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm rounded-lg shadow-lg"
          >
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
              AI-Powered Content
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Experience customized news and content curated by Google Gemini. Our platform can generate current news and analyze current trends based on your selected topics, while maintaining interactivity, and deliver relevant, high-quality content without the noise of traditional social media.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="p-6 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm rounded-lg shadow-lg"
          >
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">
              Focus on What Matters
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Break free from the cycle of endless scrolling and information overload. Curv helps you focus on content that truly matters to you, with a clean, distraction-free interface designed for meaningful engagement. No data collection, no ads. All of the positives, with none of the negatives.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Directory */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="bg-neutral-900 dark:bg-neutral-950 py-8 w-full"
      >
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-white mb-4 text-center">
            Project Directory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            <Link href="https://github.com/samirjdev/curv-app" target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-white transition-colors">
              GitHub
            </Link>
            <Link href="https://github.com/samirjdev/curv-app" target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-white transition-colors">
              Documentation
            </Link>
            <Link href="/about" className="text-neutral-300 hover:text-white transition-colors">
              About Us
            </Link>
            <Link href="/login" className="text-neutral-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/signup" className="text-neutral-300 hover:text-white transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
