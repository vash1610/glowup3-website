import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GlowUp3 - Book Beauty & Wellness Services',
  description: 'Connect with top professionals for beauty and wellness services. Book appointments, message professionals, and manage your bookings easily.',
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
