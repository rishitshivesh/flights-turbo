export type Coordinates = {
  longitude: number;
  latitude: number;
};

export type Duration = {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

export type Airplane = {
  airplaneCode: string;
  model: string;
  range: number;
  speed: number;
};

export type Airport = {
  airportCode: string;
  airportName: string;
  city: string;
  country: string;
  coordinates: Coordinates;
  timezone: string;
};

export type Booking = {
  bookRef: string;
  bookDate: string;
  totalAmount: string;
};

export type Flight = {
  flightId: number;
  routeNo: string;
  status:
    | "Scheduled"
    | "On Time"
    | "Delayed"
    | "Boarding"
    | "Departed"
    | "Arrived"
    | "Cancelled";
  scheduledDeparture: string;
  scheduledArrival: string;
  actualDeparture: string | null;
  actualArrival: string | null;
};

export type Route = {
  routeNo: string;
  airplaneCode: string;
  daysOfWeek: number[];
  scheduledTime: string;
  duration: Duration;
  departureCoordinates: Coordinates;
  arrivalCoordinates: Coordinates;
  departureAirport: Airport;
  arrivalAirport: Airport;
};

export type Seat = {
  airplaneCode: string;
  seatNo: string;
  fareConditions: "Economy" | "Comfort" | "Business";
};

export type Ticket = {
  ticketNo: string;
  bookRef: string;
  passengerId: string;
  passengerName: string;
  outbound: boolean;
};

export type Segment = {
  ticketNo: string;
  flightId: number;
  fareConditions: "Economy" | "Comfort" | "Business";
  price: string;
};

export type BoardingPass = {
  ticketNo: string;
  flightId: number;
  seatNo: string;
  boardingNo: number | null;
  boardingTime: string | null;
};

export type TimetableRow = {
  flightId: number;
  routeNo: string;
  departureAirport: string;
  arrivalAirport: string;
  status: Flight["status"];
  airplaneCode: string;
  scheduledDeparture: string;
  scheduledDepartureLocal: string;
  actualDeparture: string | null;
  actualDepartureLocal: string | null;
  scheduledArrival: string;
  scheduledArrivalLocal: string;
  actualArrival: string | null;
  actualArrivalLocal: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  size: number;
  hasMore: boolean;
};

export type Option = {
  value: string;
  label: string;
};
