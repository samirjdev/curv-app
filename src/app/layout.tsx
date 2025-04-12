import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Rajdhani } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });
const rajdhani = Rajdhani({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-rajdhani',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: "Curv",
  description: "Your personalized news and trends app",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Curv",
    startupImage: [
      {
        url: "/splash.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  manifest: "/manifest.json",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} ${rajdhani.variable} bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200`}>
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
