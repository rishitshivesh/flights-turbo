import RoutesDemo from '@/components/flights/routes';
import {ImplementationPlan} from '@/components/lab/workspace';
import {getRoutes} from '@/lib/api';

export default async function Page() {
    const routes = await getRoutes({page: 1, size: 50});
    return <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <header><p className="text-xs text-muted-foreground">Explore · live REST integration</p><h1
            className="mt-2 text-3xl font-semibold tracking-tight">Routes</h1><p
            className="mt-2 max-w-3xl text-sm text-muted-foreground">Your existing route endpoint remains wired. The map
            is the current API result; the implementation panel defines the filters and SQL work to add next.</p>
        </header>
        <div className="h-[620px] overflow-hidden rounded-2xl border"><RoutesDemo routes={routes}/></div>
        <ImplementationPlan id="routes"/></div>;
}
