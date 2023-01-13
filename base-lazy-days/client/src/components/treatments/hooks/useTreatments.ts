import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';

// for when we need a query function for useQuery

async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get('/treatments');
  return data;
}

// Using an empty array as a fallback UNTIL ALL data is fetched from the server via the getTreatments function
export function useTreatments(): Treatment[] {
  const fallback = [];
  const { data = fallback } = useQuery([queryKeys.treatments], getTreatments);

  return data;
}
// not going to return anything, why we have void. Its purpose is to populate the cache
export function usePrefetchTreatments(): void {
  // prefetchQuery 1st arg: key. The key must MATCH the relevant useQuery key, for the data you want to cache. In this case the key from the useTreatments hook
  // prefetchQuery 2nd arg: function. We are using the same getTreatments function from useTreatments
  const queryClient = useQueryClient();
  queryClient.prefetchQuery([queryKeys.treatments], getTreatments);
}
