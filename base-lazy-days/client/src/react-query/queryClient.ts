/* eslint-disable no-console */
import { createStandaloneToast } from '@chakra-ui/react';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { theme } from '../theme';

const toast = createStandaloneToast({ theme });

function queryErrorHandler(error: unknown): void {
  // error is type unknown because in js, anything can be an error (e.g. throw(5))
  const title =
    error instanceof Error ? error.message : 'error connecting to server';

  // prevent duplicate toasts
  //   toast.closeAll();
  toast({ title, status: 'error', variant: 'subtle', isClosable: true });
}

// to satisfy typescript until this file has uncommented contents
// Setting up a function to return the QueryClient so can use for production AND tests
export function generateQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: queryErrorHandler,
    }),
    mutationCache: new MutationCache({
      onError: queryErrorHandler,
    }),
    defaultOptions: {
      queries: {
        staleTime: 600000, // To SUPPRESS refetching: Adding 10 minutes staleTime so data only goes stale in 10 minutes
        cacheTime: 900000, // Adding 15 minutes cacheTime so there will be cached data available after the initial data goes stale
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error:
        process.env.NODE_ENV === 'test'
          ? () => {
              // swallow errors without printing them out using an empty function
            }
          : console.error,
    },
  });
}

export const queryClient = generateQueryClient();
