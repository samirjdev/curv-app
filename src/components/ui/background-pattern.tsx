import Image from 'next/image';

export function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-slate-50">
      <Image
        src="/curvebglight.svg"
        alt="Background Pattern"
        fill
        className="object-cover opacity-40 animate-float"
        priority
      />
    </div>
  );
} 