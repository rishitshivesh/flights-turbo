import { ImplementationPlan } from "@/components/lab/workspace";
import AirportsTable from "@/components/flights/airports";

export default async function Page() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header>
        <p className="text-xs text-muted-foreground">
          Explore · live REST integration
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Airports</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Your existing airport endpoint remains wired. The map is the current
          API result; the implementation panel defines the filters and SQL work
          to add next.
        </p>
      </header>

      <div className="min-h-[620px] rounded-2xl border">
        <AirportsTable />
      </div>
      <ImplementationPlan id="airports" />
    </div>
  );
}
