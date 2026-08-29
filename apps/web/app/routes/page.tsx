import RoutesDemo from '@/components/flights/routes';
import { getRoutes } from '@/lib/api';

export default async function RoutesPage() {
  const routes = await getRoutes({ page: 1, size: 50 });

  return (
    <main>
      <RoutesDemo routes={routes} />
    </main>
  );
}
