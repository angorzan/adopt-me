import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import DogCatalogView from './DogCatalogView';

const DogCatalogContainer = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <DogCatalogView />
    </QueryClientProvider>
  );
};

export default DogCatalogContainer;

