import { Map } from '@/components/ui/map';
import { FlightRoute } from '@/components/ui/flight';
import type { PaginatedResponse, Route } from '@/lib/api-types';

export default function RoutesDemo({
  routes,
}: {
  routes?: PaginatedResponse<Route>;
}) {
  if (!routes || routes.data.length === 0) {
    return (
      <div className="grid h-[calc(100dvh-56px)] place-items-center text-sm text-muted-foreground">
        No routes available
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-56px)] w-full overflow-hidden">
      <Map className="h-full w-full" center={[121.5, 25]} zoom={3}>
        {routes.data.map((route, index) => (
          <FlightRoute
            airportInfo={{
              from: {
                ...route.departureAirport,
                latitude: route.departureCoordinates.latitude,
                longitude: route.departureCoordinates.longitude,
              },
              to: {
                ...route.arrivalAirport,
                latitude: route.arrivalCoordinates.latitude,
                longitude: route.arrivalCoordinates.longitude,
              },
            }}
            key={route.routeNo + index}
            from={[
              route.departureCoordinates.longitude,
              route.departureCoordinates.latitude,
            ]}
            to={[
              route.arrivalCoordinates.longitude,
              route.arrivalCoordinates.latitude,
            ]}
            showAirports
            showLabel
          />
        ))}
      </Map>
    </div>
  );
}
