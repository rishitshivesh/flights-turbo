import type {TypedDocumentNode} from "@graphql-typed-document-node/core";
import {gql} from "@apollo/client";
import {AirportInfo} from "@/components/ui/flight-airports";

export type RoutesVariables = {
    page?: number;
    size?: number;
    airplaneCode?: string;
};

export type RoutesResult = {
    routes: {
        data: {
            flightNo: string;
            departureAirport: AirportInfo;
            arrivalAirport: AirportInfo;
            airplaneCode: string;
            duration: string;
            routeNo: string;
            departureCoordinates: {
                latitude: number;
                longitude: number;
            };
            arrivalCoordinates: {
                latitude: number;
                longitude: number;
            };
            daysOfWeek: number[];
        }[];
        page: number;
        size: number;
        hasMore: boolean;
    };
};

export const ROUTES_QUERY: TypedDocumentNode<
    RoutesResult,
    RoutesVariables
> = gql`
    query Routes($page: Int, $size: Int, $airplaneCode: String) {
        routes(
            page: $page
            size: $size
            airplaneCode: $airplaneCode
        ) {
            data {
                airplaneCode
                departureAirport {
                    code: airportCode
                    name: airportName
                    city
                    timezone
                    country
                }
                arrivalAirport {
                    code: airportCode
                    name: airportName
                    city
                    timezone
                    country
                }
                airplaneCode
                routeNo
                duration {
                    hours
                    minutes
                    months
                    days
                    seconds
                    years
                }
                daysOfWeek
                departureCoordinates {
                    latitude
                    longitude
                }
                arrivalCoordinates {
                    latitude
                    longitude
                }
            }
            page
            size
            hasMore
        }
    }
`;