"use client";

import { useEffect, useState } from 'react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Get current time in EST
      const now = new Date();
      const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      
      // Calculate next midnight in EST
      const tomorrow = new Date(est);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      // Calculate difference
      const diff = tomorrow.getTime() - est.getTime();
      
      // Convert to hours, minutes, seconds
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Update immediately
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-17 left-0 right-0 p-2 flex justify-center items-center bg-black/50 backdrop-blur-sm">
      <div className="text-lg font-manrope text-white">
        Next Update In | {timeLeft}
      </div>
    </div>
  );
} 