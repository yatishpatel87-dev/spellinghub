import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface FloatingItem {
  id: string | number;
  text: string;
}

interface FloatingScoreBadgeProps {
  triggerKey: number | string | null;
  text?: string;
  colorHex?: string;
  className?: string;
}

export const FloatingScoreBadge: React.FC<FloatingScoreBadgeProps> = ({
  triggerKey,
  text = '+1',
  colorHex = '#f59e0b',
  className = '',
}) => {
  const [activeItems, setActiveItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    if (!triggerKey) return;

    const newItem: FloatingItem = {
      id: `${triggerKey}-${Math.random()}`,
      text,
    };

    setActiveItems((prev) => [...prev, newItem]);

    const timer = setTimeout(() => {
      setActiveItems((prev) => prev.filter((item) => item.id !== newItem.id));
    }, 1800);

    return () => clearTimeout(timer);
  }, [triggerKey, text]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-50 ${className}`}
    >
      <AnimatePresence>
        {activeItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.3, y: 6 }}
            animate={{
              opacity: [0, 1, 1, 0.9, 0],
              scale: [0.3, 1.3, 1.15, 1, 0.9],
              y: [6, -8, -26, -42, -56],
              rotate: [0, -4, 4, 0],
            }}
            exit={{ opacity: 0, scale: 0.8, y: -60 }}
            transition={{
              duration: 1.65,
              times: [0, 0.15, 0.45, 0.75, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute flex items-center justify-center select-none"
          >
            {/* Glowing Backdrop Pill */}
            <div
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/95 border shadow-2xl backdrop-blur-md"
              style={{
                borderColor: colorHex,
                boxShadow: `0 0 16px ${colorHex}66, 0 4px 12px rgba(0, 0, 0, 0.8)`,
              }}
            >
              <span
                className="font-display font-black text-sm sm:text-base tracking-tight leading-none"
                style={{
                  color: colorHex,
                  textShadow: `0 0 10px ${colorHex}99`,
                }}
              >
                {item.text}
              </span>
              <Sparkles
                className="w-3.5 h-3.5 fill-amber-300 text-amber-300 animate-pulse ml-0.5"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
