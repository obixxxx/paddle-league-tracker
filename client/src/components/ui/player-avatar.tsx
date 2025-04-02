import React from 'react';

interface PlayerAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'blue' | 'emerald' | 'purple' | 'yellow' | 'pink';
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ 
  name, 
  size = 'md',
  colorScheme = 'blue'
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  };
  
  // Color scheme classes
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    purple: 'bg-purple-100 text-purple-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    pink: 'bg-pink-100 text-pink-800'
  };
  
  // Get initials
  const getInitials = (name: string) => {
    return name?.charAt(0) || '?';
  };
  
  return (
    <div className={`flex-shrink-0 ${sizeClasses[size]} ${colorClasses[colorScheme]} rounded-full flex items-center justify-center`}>
      <span className="font-medium">{getInitials(name)}</span>
    </div>
  );
};

export default PlayerAvatar;
