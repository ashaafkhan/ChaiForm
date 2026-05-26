import type { Metadata } from 'next';
import { TRPCProvider } from '@/lib/trpc.tsx';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ChaiForms — Build Beautiful Forms',
    template: '%s | ChaiForms',
  },
  description:
    'Create stunning, dynamic forms with real-time analytics, 14+ field types, beautiful themes, and powerful integrations. The modern Typeform alternative.',
  keywords: ['form builder', 'survey', 'typeform alternative', 'analytics', 'forms'],
  openGraph: {
    title: 'ChaiForms — Build Beautiful Forms',
    description: 'Create stunning forms with real-time analytics and beautiful themes.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
