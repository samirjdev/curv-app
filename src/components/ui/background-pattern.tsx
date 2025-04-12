import Image from 'next/image';
import { useEffect, useState } from 'react';

export function BackgroundPattern() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage first for user preference
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setIsDark(storedTheme === 'dark');
    } else {
      // Fallback to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }
    
    // Listen for theme changes from ThemeToggle
    const handleThemeChange = (e: CustomEvent) => {
      setIsDark(e.detail.isDark);
    };
    
    // Add event listener for theme changes
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-slate-50 dark:bg-neutral-950">
      <div className="absolute inset-0">
        <Image
          src={isDark ? "/animated_dark.svg" : "/animated_light.svg"}
          alt="Background Pattern"
          fill
          className="object-cover opacity-80 animate-float"
          priority
          quality={100}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
    </div>
  );
} 