"use client";

import RoutesDemo from "@/components/flights/routes";
import {ROUTES_QUERY} from "@/queries/routes/list";

import {useQuery} from "@apollo/client/react";

export default function Home() {
    const {data, loading, error} = useQuery(ROUTES_QUERY, {
        variables: {
            page: 1,
            size: 50
        },
    });

    console.log(data);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;
    return (
        <main>
            <RoutesDemo routes={data?.routes}/>
        </main>
    );
}
