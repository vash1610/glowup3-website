'use client';

import React from 'react';
import Image from 'next/image';

interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeConfig = {
  sm: { container: 'w-8 h-8', text: 'text-xs', image: 32 },
  md: { container: 'w-10 h-10', text: 'text-sm', image: 40 },
  lg: { container: 'w-12 h-12', text: 'text-base', image: 48 },
  xl: { container: 'w-16 h-16', text: 'text-lg', image: 64 },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    'from-violet-500 to-purple-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-500',
    'from-teal-500 to-green-500',
    'from-red-500 to-pink-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export default function UserAvatar({ src, name, size = 'md', className = '' }: UserAvatarProps) {
  const config = sizeConfig[size];

  if (src) {
    return (
      <div className={`relative rounded-full overflow-hidden ${config.container} ${className}`}>
        <Image
          src={src}
          alt={name}
          width={config.image}
          height={config.image}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div 
      className={`
        ${config.container}
        flex items-center justify-center
        bg-gradient-to-br ${getColorFromName(name)}
        rounded-full
        ${className}
      `}
    >
      <span className={`${config.text} font-semibold text-white`}>
        {getInitials(name)}
      </span>
    </div>
  );
}
