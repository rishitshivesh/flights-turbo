"use client";

import { useQuery } from "@tanstack/react-query";

export function useFlights() {
  return useQuery({
    queryKey: ["flights"],
    queryFn: async () => {
      const res = await fetch('/api/flights');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
    staleTime: 1000 * 30,
  });
}
