import React, { useEffect, useState } from 'react';
import { useStore } from '../services/store';

const Watermark: React.FC = () => {
  const { currentUser } = useStore();
  const [position, setPosition] = useState({ top: '50%', left: '50%' });
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    // Update time
    const interval = setInterval(() => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('ar-EG') + ' ' + now.toLocaleDateString('ar-EG'));
    }, 1000);

    // Move watermark randomly every 5 seconds
    const moveInterval = setInterval(() => {
      const top = Math.floor(Math.random() * 80) + 10; // 10% to 90%
      const left = Math.floor(Math.random() * 80) + 10;
      setPosition({ top: `${top}%`, left: `${left}%` });
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(moveInterval);
    };
  }, []);

  if (!currentUser) return null;

  return (
    <div 
      className="absolute pointer-events-none z-50 select-none opacity-20 flex flex-col items-center justify-center text-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
      style={{ top: position.top, left: position.left }}
    >
      <div className="text-2xl font-bold text-slate-500 whitespace-nowrap">{currentUser.name}</div>
      <div className="text-sm font-mono text-slate-600">{currentUser.phone}</div>
      <div className="text-xs text-slate-400 mt-1">{timeString}</div>
    </div>
  );
};

export default Watermark;