import {Map} from "@/components/ui/map";
import {FlightRoute} from "@/components/ui/flight";
import {RoutesResult} from "@/queries/routes/list";

export default function RoutesDemo({routes}: { routes?: RoutesResult['routes'] }) {
    if (!routes || routes.data?.length === 0) {
        return <div>No routes available</div>;
    }


    return (
        <div className="h-screen w-screen">
            <Map className="h-full w-full" center={[121.5, 25]} zoom={3}>
                {routes.data?.map((route, index) => (
                    <FlightRoute
                        airportInfo={{
                            from: {
                                ...route.departureAirport,
                                latitude: route.departureCoordinates.latitude,
                                longitude: route.departureCoordinates.longitude
                            },
                            to: {
                                ...route.arrivalAirport,
                                latitude: route.arrivalCoordinates.latitude,
                                longitude: route.arrivalCoordinates.longitude
                            },
                        }}
                        key={route.routeNo + index}
                        from={[route.departureCoordinates.longitude, route.departureCoordinates.latitude]}
                        to={[route.arrivalCoordinates.longitude, route.arrivalCoordinates.latitude]}
                        showAirports
                        showLabel
                        //markerContent={<div>{route.arrivalAirport}</div>}
                    />
                ))}
            </Map>
        </div>
    );
}