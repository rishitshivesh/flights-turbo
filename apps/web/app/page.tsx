import { Airports } from '../components/airports';
import RoutesDemo from "@/components/flights/routes";

export default function Home() {
  return (
    <main>
      <h1>Flights</h1>
      <p className="subtitle">Postgres Pro query playground</p>
      <Airports />
        <RoutesDemo />
    </main>
  );
}
