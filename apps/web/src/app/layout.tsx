import type { Metadata } from 'next';
import { QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '@/lib/trpc';
import { env } from '@/env';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChaiForms - Form Builder SaaS',
  description: 'Build beautiful, dynamic forms with real-time analytics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
