import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';
// import { defaultQueryClientOptions } from '../react-query/queryClient';

// function to create a unique query client for each test
const generateQueryCLient = () => {
  return new QueryClient();
};

// If the client was provided we use it, but if NO client we provide it with a new one
export const renderWithQueryClient = (
  ui: ReactElement,
  client?: QueryClient,
): RenderResult => {
  const queryClient = client ?? generateQueryCLient();

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

// from https://tkdodo.eu/blog/testing-react-query#for-custom-hooks
// export const createQueryClientWrapper = (): React.FC => {
//   const queryClient = generateQueryClient();
//   return ({ children }) => (
//     <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
//   );
// };
