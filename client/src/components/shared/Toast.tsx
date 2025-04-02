import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-4 right-4 flex items-center px-4 py-3 bg-emerald-500 text-white rounded-lg shadow-lg z-50 transition-all duration-300">
      <CheckCircle className="h-5 w-5 mr-2" />
      <span>{message}</span>
    </div>
  );
};

export default Toast;
