'use client';

import React from 'react';

export type IconName =
  | 'sparkle' | 'apple' | 'android' | 'heart'
  | 'hair' | 'massage' | 'makeup' | 'nails' | 'fitness' | 'spa' | 'barber' | 'lash'
  | 'lightning' | 'gift' | 'chat' | 'wallet' | 'team' | 'shield' | 'star'
  | 'search' | 'play' | 'phone' | 'location' | 'clock' | 'check' | 'arrow'
  | 'code' | 'design' | 'growth' | 'handshake' | 'analytics' | 'globe' | 'book' | 'food' | 'transit'
  | 'email' | 'calendar' | 'money' | 'profile' | 'lock'
  | 'rocket' | 'bulb' | 'spotlight' | 'flower' | 'vacation' | 'store'
  | 'facebook' | 'instagram' | 'twitter' | 'youtube'
  | 'plus' | 'minus';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
}

export default function Icon({ name, size = 24, color = 'currentColor', className }: IconProps) {
  const svgProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };

  const icons: Record<IconName, React.ReactNode> = {
    // Brand
    sparkle: (
      <svg {...svgProps}>
        <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z" />
        <path d="M18 14l.7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7z" />
      </svg>
    ),
    apple: (
      <svg {...svgProps}>
        <path d="M17.05 11.88a4.49 4.49 0 0 0-2.1-3.76 4.52 4.52 0 0 0-4.46-.18 4.5 4.5 0 0 0-2.1 3.76c0 .87.25 1.72.71 2.45a4.48 4.48 0 0 0 3.4 2.15 4.5 4.5 0 0 0 3.4-2.15c.46-.73.71-1.58.71-2.45z" />
        <path d="M14.5 2.5A2.5 2.5 0 0 1 12 5a2.5 2.5 0 0 1-2.5-2.5A2.5 2.5 0 0 1 12 0a2.5 2.5 0 0 1 2.5 2.5z" />
      </svg>
    ),
    android: (
      <svg {...svgProps}>
        <path d="M6 8v8M18 8v8" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
        <rect x="4" y="8" width="16" height="13" rx="2" />
      </svg>
    ),
    heart: (
      <svg {...svgProps}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),

    // Services
    hair: (
      <svg {...svgProps}>
        <path d="M3 3l7 7" />
        <path d="M5 5l4 4" />
        <path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9c0 2.01.66 3.86 1.77 5.36" />
        <path d="M8 18l1-3 3-1-3-1-1-3-1 3-3 1 3 1z" />
      </svg>
    ),
    massage: (
      <svg {...svgProps}>
        <path d="M14 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        <path d="M4 21v-1a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v1" />
        <path d="M11 14l-4 5M9 12l-6 7" />
      </svg>
    ),
    makeup: (
      <svg {...svgProps}>
        <rect x="5" y="2" width="14" height="8" rx="2" />
        <path d="M12 6v2" />
        <path d="M8 10v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-8" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    nails: (
      <svg {...svgProps}>
        <path d="M5 12l3-3 4 4" />
        <path d="M12 13l4-4 3 3" />
        <path d="M14 4v3a2 2 0 0 1-2 2h-2" />
        <path d="M3 21h18" />
        <path d="M5 21V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v13" />
      </svg>
    ),
    fitness: (
      <svg {...svgProps}>
        <path d="M6.5 6.5l11 11" />
        <path d="M17.5 6.5l-11 11" />
        <rect x="2" y="8" width="4" height="8" rx="1" />
        <rect x="18" y="8" width="4" height="8" rx="1" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <rect x="8" y="18" width="8" height="4" rx="1" />
      </svg>
    ),
    spa: (
      <svg {...svgProps}>
        <path d="M12 22c-4-3-8-6-8-11a8 8 0 0 1 16 0c0 5-4 8-8 11z" />
        <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        <path d="M9 15l3-1 3 1-1 3-2-1-2 1z" />
      </svg>
    ),
    barber: (
      <svg {...svgProps}>
        <circle cx="12" cy="8" r="4" />
        <path d="M3 21v-4a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v4" />
        <path d="M8 14l-4 7M16 14l4 7" />
        <path d="M10 14l2 3 2-3" />
      </svg>
    ),
    lash: (
      <svg {...svgProps}>
        <path d="M2 12h4M8 12h4M14 12h4M20 12h2" />
        <path d="M4 8l-1 4 1 4" />
        <path d="M10 8l-1 4 1 4" />
        <path d="M16 8l-1 4 1 4" />
        <path d="M22 8l-1 4 1 4" />
      </svg>
    ),

    // Features
    lightning: (
      <svg {...svgProps}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    gift: (
      <svg {...svgProps}>
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13" />
        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
      </svg>
    ),
    chat: (
      <svg {...svgProps}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="8" y1="9" x2="16" y2="9" />
        <line x1="8" y1="13" x2="14" y2="13" />
      </svg>
    ),
    wallet: (
      <svg {...svgProps}>
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <path d="M1 10h22" />
        <circle cx="18" cy="14" r="2" />
        <path d="M16 4l2 6M6 4l-2 6" />
      </svg>
    ),
    team: (
      <svg {...svgProps}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    shield: (
      <svg {...svgProps}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    star: (
      <svg {...svgProps}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),

    // UI
    search: (
      <svg {...svgProps}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    play: (
      <svg {...svgProps}>
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    phone: (
      <svg {...svgProps}>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    location: (
      <svg {...svgProps}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    clock: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    check: (
      <svg {...svgProps}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    arrow: (
      <svg {...svgProps}>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),

    // Business
    code: (
      <svg {...svgProps}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    design: (
      <svg {...svgProps}>
        <circle cx="5.5" cy="5.5" r="3.5" />
        <circle cx="18.5" cy="5.5" r="3.5" />
        <circle cx="12" cy="18" r="3" />
        <line x1="8.5" y1="8" x2="10.5" y2="16" />
        <line x1="15.5" y1="8" x2="14.5" y2="15" />
      </svg>
    ),
    growth: (
      <svg {...svgProps}>
        <line x1="4" y1="20" x2="20" y2="20" />
        <polyline points="4 14 8 10 12 14 20 6" />
        <polyline points="16 6 20 6 20 10" />
      </svg>
    ),
    handshake: (
      <svg {...svgProps}>
        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
        <path d="M8 10l3 3 5-5" />
      </svg>
    ),
    analytics: (
      <svg {...svgProps}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    globe: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    book: (
      <svg {...svgProps}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="8" y1="7" x2="16" y2="7" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
    food: (
      <svg {...svgProps}>
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    transit: (
      <svg {...svgProps}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 3v18" />
        <circle cx="7.5" cy="7.5" r="1.5" />
        <circle cx="16.5" cy="7.5" r="1.5" />
      </svg>
    ),

    // Communication
    email: (
      <svg {...svgProps}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polyline points="2 4 12 13 22 4" />
      </svg>
    ),
    calendar: (
      <svg {...svgProps}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="14" x2="10" y2="14" />
        <line x1="14" y1="14" x2="16" y2="14" />
        <line x1="8" y1="18" x2="10" y2="18" />
        <line x1="14" y1="18" x2="16" y2="18" />
      </svg>
    ),
    money: (
      <svg {...svgProps}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    profile: (
      <svg {...svgProps}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    lock: (
      <svg {...svgProps}>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),

    // Misc
    rocket: (
      <svg {...svgProps}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
    bulb: (
      <svg {...svgProps}>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
      </svg>
    ),
    spotlight: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
    flower: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2a4 4 0 0 1 4 4c0 2-2 4-4 4-2 0-4-2-4-4a4 4 0 0 1 4-4z" />
        <path d="M12 14c2 0 4 2 4 4a4 4 0 0 1-8 0c0-2 2-4 4-4z" />
        <path d="M5 17a4 4 0 0 1 0-8c2 0 4 2 4 4-2 0-4 2-4 4z" />
        <path d="M19 17a4 4 0 0 1 0-8c-2 0-4 2-4 4 2 0 4 2 4 4z" />
      </svg>
    ),
    vacation: (
      <svg {...svgProps}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <path d="M3 10h18" />
        <path d="M8 14h.01" />
        <path d="M12 14h.01" />
        <path d="M16 14h.01" />
        <path d="M8 18h.01" />
        <path d="M12 18h.01" />
        <path d="M16 18h.01" />
      </svg>
    ),
    store: (
      <svg {...svgProps}>
        <path d="M3 9l2-7h14l2 7" />
        <path d="M9 9c0 1.66 1.34 3 3 3s3-1.34 3-3" />
        <path d="M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9" />
      </svg>
    ),

    // Social
    facebook: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8h-2a3 3 0 0 0-3 3v12" />
        <line x1="8" y1="13" x2="15" y2="13" />
      </svg>
    ),
    instagram: (
      <svg {...svgProps}>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" />
      </svg>
    ),
    twitter: (
      <svg {...svgProps}>
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
      </svg>
    ),
    youtube: (
      <svg {...svgProps}>
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <polygon points="10 9 16 12 10 15 10 9" />
      </svg>
    ),

    // Misc UI
    plus: (
      <svg {...svgProps}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    minus: (
      <svg {...svgProps}>
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  };

  return <>{icons[name] || null}</>;
}