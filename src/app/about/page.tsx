"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BackgroundPattern } from "@/components/ui/background-pattern";

export default function AboutPage() {
  return (
    <div className="min-h-screen font-manrope">
      <BackgroundPattern />
      
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm shadow-md flex items-center px-4 z-50">
        <div className="flex-1">
          <Link href="/">
            <Image
              src="/curv_text.png"
              alt="Curv"
              width={100}
              height={40}
              className="invert dark:invert-0"
              priority
            />
          </Link>
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
      <div className="pt-32 pb-16 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            About Curv
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            A modern approach to social media, built by students for students
          </p>
        </motion.div>

        {/* Team Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center"
          >
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
              <p className="text-neutral-400 dark:text-neutral-600">Profile Picture</p>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              Samir J.
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Frontend Developer
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-center"
          >
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
              <p className="text-neutral-400 dark:text-neutral-600">Profile Picture</p>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              Amrit G.
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Backend Developer
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center"
          >
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
              <p className="text-neutral-400 dark:text-neutral-600">Profile Picture</p>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              Maxim R.
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Design & Assets
            </p>
          </motion.div>
        </div>

        {/* Project Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm rounded-lg shadow-lg p-8"
        >
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">
            Our Project
          </h2>
          <div className="space-y-4 text-neutral-600 dark:text-neutral-400">
            <p>
              Curv is an innovative social media platform that leverages Google's Gemini AI to deliver personalized content while combating social media addiction. Our team worked together to create a modern, user-friendly experience that puts content quality over quantity.
            </p>
            <p>
              Samir led the frontend development, creating an intuitive and responsive user interface using Next.js and shadcn/ui. Amrit handled the backend architecture and API integration, implementing secure authentication and efficient data management. Maxim contributed to the project's visual identity, creating assets and ensuring a cohesive design language throughout the application.
            </p>
            <p>
              Together, we've built a platform that challenges traditional social media norms while providing a more meaningful and focused user experience.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 