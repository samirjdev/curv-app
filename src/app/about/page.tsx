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
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                <Image
                  src="/profile_1_icon.png"
                  alt="Profile 1"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Samir J.
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Frontend Developer
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                <Image
                  src="/profile_2_icon.jpg"
                  alt="Profile 2"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Amrit G.
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Backend Developer
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                <Image
                  src="/profile_3_icon.png"
                  alt="Profile 3"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Maxim R.
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Design & Assets
              </p>
            </div>
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
              Curv is a revolutionary platform designed to combat social media addiction while preserving the positive aspects of online communities. By leveraging Google's Gemini AI, we deliver personalized, meaningful content without the harmful effects of traditional social media platforms.
            </p>
            <p>
              Samir led the frontend development and database architecture, creating an intuitive and responsive user interface using Next.js and shadcn/ui, while also implementing efficient data management and storage solutions. Amrit contributed to the backend development, working with various APIs and ensuring seamless integration with external services. Maxim focused on the visual aspects, creating assets and working on the overall presentation and design of the platform.
            </p>
            <p>
              Our platform maintains the benefits of social media - like community consensus and meaningful discussions - while eliminating the negative aspects such as doomscrolling, algorithmic manipulation, and content overload. We're challenging the status quo of big tech by putting user well-being first, creating a space where quality content and meaningful interactions take precedence over engagement metrics.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 