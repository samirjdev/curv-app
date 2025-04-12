import Image from 'next/image';
import { useEffect, useState } from 'react';

export function BackgroundPattern() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if user has a theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    // Listen for theme changes from ThemeToggle
    const handleThemeChange = (e: CustomEvent) => setIsDark(e.detail.isDark);
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-slate-50 dark:bg-gray-900">
      <Image
        src={isDark ? "/curvebgdark.svg" : "/curvebglight.svg"}
        alt="Background Pattern"
        fill
        className="object-cover opacity-40 animate-float"
        priority
      />
    </div>
  );
} 