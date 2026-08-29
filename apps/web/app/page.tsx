import Link from 'next/link';

import { Airports } from '../components/airports';

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 p-8">
      <header>
        <p className="text-sm text-muted-foreground">Postgres Pro query playground</p>
        <h1 className="text-3xl font-semibold tracking-tight">Flights SQL Lab</h1>
        <div className="mt-4 flex gap-4 text-sm underline underline-offset-4">
          <Link href="/routes">Route map</Link>
          <Link href="/monitor">API monitor</Link>
        </div>
      </header>
      <Airports />
    </main>
  );
}
