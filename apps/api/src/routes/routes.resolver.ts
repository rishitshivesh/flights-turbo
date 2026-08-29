import {Args, Query, Resolver} from '@nestjs/graphql';
import {RoutesService} from './routes.service.js';

@Resolver()
export class RoutesResolver {
    constructor(private readonly routesService: RoutesService) {
    }

    @Query('routes')
    routes(
        @Args('page') page?: number,
        @Args('size') size?: number,
        @Args('arrivalAirport') arrivalAirport?: string,
        @Args('departureAirport') departureAirport?: string,
    ) {
        return this.routesService.list({page, size, departureAirport, arrivalAirport});
    }
}
