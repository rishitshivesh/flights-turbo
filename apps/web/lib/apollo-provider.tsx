'use client';

import {
  HttpLink,
} from '@apollo/client';
import { ApolloNextAppProvider, ApolloClient, InMemoryCache } from '@apollo/client-integration-nextjs';
import type { ReactNode } from 'react';

function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri:
        process.env.NEXT_PUBLIC_GRAPHQL_URL ??
        'http://localhost:4001/graphql',
    }),
  });
}

export function ApolloProvider({ children }: { children: ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
