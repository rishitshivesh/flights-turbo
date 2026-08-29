export const mockAirports = [
  { airportCode: 'DME', airportName: 'Domodedovo International Airport', city: 'Moscow', country: 'Russia', timezone: 'Europe/Moscow', longitude: 37.9063, latitude: 55.4088, departures: 382, arrivals: 371 },
  { airportCode: 'LED', airportName: 'Pulkovo Airport', city: 'Saint Petersburg', country: 'Russia', timezone: 'Europe/Moscow', longitude: 30.2625, latitude: 59.8003, departures: 291, arrivals: 304 },
  { airportCode: 'KZN', airportName: 'Kazan International Airport', city: 'Kazan', country: 'Russia', timezone: 'Europe/Moscow', longitude: 49.2787, latitude: 55.6062, departures: 178, arrivals: 181 },
  { airportCode: 'OVB', airportName: 'Tolmachevo Airport', city: 'Novosibirsk', country: 'Russia', timezone: 'Asia/Novosibirsk', longitude: 82.6507, latitude: 55.0126, departures: 224, arrivals: 219 },
  { airportCode: 'SVX', airportName: 'Koltsovo Airport', city: 'Yekaterinburg', country: 'Russia', timezone: 'Asia/Yekaterinburg', longitude: 60.8027, latitude: 56.7431, departures: 193, arrivals: 188 },
];

export const mockFlights = [
  { flightId: 187322, routeNo: 'PG0142', from: 'DME', to: 'LED', status: 'Departed', scheduledDeparture: '2026-08-30T18:00:00+03:00', scheduledArrival: '2026-08-30T19:35:00+03:00', actualDeparture: '2026-08-30T18:11:00+03:00', actualArrival: null, airplaneCode: '773', model: 'Boeing 777-300', speed: 905, range: 11100, delayMinutes: 11, progress: 0.58, altitude: 34000 },
  { flightId: 187401, routeNo: 'PG0268', from: 'LED', to: 'KZN', status: 'Scheduled', scheduledDeparture: '2026-08-30T21:20:00+03:00', scheduledArrival: '2026-08-30T23:25:00+03:00', actualDeparture: null, actualArrival: null, airplaneCode: '321', model: 'Airbus A321', speed: 840, range: 5600, delayMinutes: 0, progress: 0, altitude: 0 },
  { flightId: 187510, routeNo: 'PG0381', from: 'KZN', to: 'OVB', status: 'Arrived', scheduledDeparture: '2026-08-30T12:10:00+03:00', scheduledArrival: '2026-08-30T16:05:00+07:00', actualDeparture: '2026-08-30T12:18:00+03:00', actualArrival: '2026-08-30T16:12:00+07:00', airplaneCode: '320', model: 'Airbus A320', speed: 830, range: 6100, delayMinutes: 8, progress: 1, altitude: 0 },
  { flightId: 187620, routeNo: 'PG0411', from: 'SVX', to: 'DME', status: 'Delayed', scheduledDeparture: '2026-08-30T19:05:00+05:00', scheduledArrival: '2026-08-30T19:35:00+03:00', actualDeparture: null, actualArrival: null, airplaneCode: '319', model: 'Airbus A319', speed: 820, range: 6700, delayMinutes: 47, progress: 0, altitude: 0 },
];

export const mockAircraft = [
  { airplaneCode: '773', model: 'Boeing 777-300', range: 11100, speed: 905, seats: 402, economy: 330, comfort: 48, business: 24, routes: 19 },
  { airplaneCode: '321', model: 'Airbus A321', range: 5600, speed: 840, seats: 220, economy: 188, comfort: 20, business: 12, routes: 34 },
  { airplaneCode: '320', model: 'Airbus A320', range: 6100, speed: 830, seats: 180, economy: 156, comfort: 12, business: 12, routes: 28 },
  { airplaneCode: '319', model: 'Airbus A319', range: 6700, speed: 820, seats: 144, economy: 120, comfort: 12, business: 12, routes: 21 },
];

export const mockBookings = [
  { bookRef: 'A1B2C3', bookDate: '2026-08-26T13:20:00Z', passengerId: '8149 604011', passengerName: 'Alex Petrov', outbound: true, totalAmount: 28450, segments: 2, seat: '12A', fareCondition: 'Business' },
  { bookRef: 'F7D9K2', bookDate: '2026-08-27T08:44:00Z', passengerId: '5487 221900', passengerName: 'Mira Volkova', outbound: true, totalAmount: 11980, segments: 1, seat: '24F', fareCondition: 'Economy' },
  { bookRef: 'Q4N8T1', bookDate: '2026-08-28T17:05:00Z', passengerId: '9912 414700', passengerName: 'Ivan Sokolov', outbound: false, totalAmount: 18330, segments: 3, seat: '18C', fareCondition: 'Comfort' },
];

export const mockNetworkRoutes = [
  { from: 'DME', to: 'LED', value: 144 },
  { from: 'DME', to: 'KZN', value: 91 },
  { from: 'DME', to: 'OVB', value: 72 },
  { from: 'LED', to: 'KZN', value: 64 },
  { from: 'KZN', to: 'SVX', value: 52 },
  { from: 'SVX', to: 'OVB', value: 38 },
  { from: 'OVB', to: 'DME', value: 81 },
];

export const mockDailyTraffic = [
  { bucket: '00:00', departures: 18, arrivals: 14 },
  { bucket: '04:00', departures: 11, arrivals: 9 },
  { bucket: '08:00', departures: 41, arrivals: 37 },
  { bucket: '12:00', departures: 55, arrivals: 49 },
  { bucket: '16:00', departures: 63, arrivals: 58 },
  { bucket: '20:00', departures: 47, arrivals: 52 },
];

export const mockDelayTrend = [
  { day: 'Mon', avg: 11, p95: 39 }, { day: 'Tue', avg: 8, p95: 31 }, { day: 'Wed', avg: 17, p95: 52 },
  { day: 'Thu', avg: 13, p95: 44 }, { day: 'Fri', avg: 21, p95: 71 }, { day: 'Sat', avg: 10, p95: 36 }, { day: 'Sun', avg: 14, p95: 48 },
];

export const mockRevenueTrend = [
  { day: '24 Aug', revenue: 4.8, economy: 3.2, comfort: 0.8, business: 0.8 },
  { day: '25 Aug', revenue: 5.4, economy: 3.6, comfort: 0.9, business: 0.9 },
  { day: '26 Aug', revenue: 5.1, economy: 3.3, comfort: 0.9, business: 0.9 },
  { day: '27 Aug', revenue: 6.3, economy: 4.1, comfort: 1.0, business: 1.2 },
  { day: '28 Aug', revenue: 6.8, economy: 4.3, comfort: 1.1, business: 1.4 },
  { day: '29 Aug', revenue: 6.1, economy: 3.9, comfort: 1.0, business: 1.2 },
  { day: '30 Aug', revenue: 7.2, economy: 4.5, comfort: 1.2, business: 1.5 },
];

export const mockRoutePerformance = [
  { route: 'DME → LED', flights: 144, passengers: 19840, revenue: 18.4, delay: 12.8, cancellations: 1.4 },
  { route: 'DME → KZN', flights: 91, passengers: 12120, revenue: 10.1, delay: 8.2, cancellations: 0.8 },
  { route: 'DME → OVB', flights: 72, passengers: 10430, revenue: 13.8, delay: 19.4, cancellations: 2.1 },
  { route: 'LED → KZN', flights: 64, passengers: 8310, revenue: 7.6, delay: 10.1, cancellations: 0.9 },
];

export const mockBenchmarks = [
  { variant: 'V1 naive OFFSET', p50: 84, p95: 312, p99: 506, rows: 50, rps: 124, buffers: 18214 },
  { variant: 'V2 keyset', p50: 16, p95: 39, p99: 64, rows: 50, rps: 711, buffers: 1204 },
  { variant: 'V3 covering index', p50: 9, p95: 21, p99: 34, rows: 50, rps: 1180, buffers: 422 },
];

export const mockPlanNodes = [
  { node: 'Limit', actual: '0.038 ms', rows: 50, estimate: 50, buffers: 4 },
  { node: 'Index Scan using flights_pkey', actual: '0.031 ms', rows: 50, estimate: 51, buffers: 4 },
  { node: 'Filter: status = Scheduled', actual: 'included above', rows: 50, estimate: 47, buffers: 0 },
];

export function buildSeatRows(rows = 14, letters = ['A', 'B', 'C', 'D', 'E', 'F']) {
  return Array.from({ length: rows }, (_, rowIndex) =>
    letters.map((letter, letterIndex) => ({
      seatNo: `${rowIndex + 1}${letter}`,
      row: rowIndex + 1,
      letter,
      fareCondition: rowIndex < 2 ? 'Business' : rowIndex < 4 ? 'Comfort' : 'Economy',
      occupied: (rowIndex * 7 + letterIndex * 3) % 5 !== 0,
      boarded: (rowIndex * 11 + letterIndex) % 4 !== 0,
    })),
  ).flat();
}
