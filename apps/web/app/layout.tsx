import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ApolloProvider } from '../lib/apollo-provider';
import './globals.css';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Flights API Playground',
  description: 'Postgres query playground backed by NestJS GraphQL',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body>
        <ApolloProvider>{children}</ApolloProvider>
      </body>
    </html>
  );
}
