import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';

import { AppShell } from '@/components/lab/appShell';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Flights SQL Lab',
  description: 'PostgreSQL query and API performance playground backed by NestJS REST.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn('font-sans', inter.variable)}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
