import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '✨ Todayly - Book Beauty & Wellness Services',
  description: 'Connect with top professionals for beauty and wellness services. Book appointments, message professionals, and manage your bookings easily.',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
