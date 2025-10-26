import { useEffect, useState } from 'react';
import { useDogs } from '@/lib/hooks/useDogs';
import type { DogFiltersViewModel } from '@/lib/viewModels';
import { DogFilters } from './DogFilters';
import { DogGrid } from './DogGrid';

const DogCatalogView = () => {
  const [filters, setFilters] = useState<DogFiltersViewModel>({
    q: '',
    size: 'all',
    age_category: 'all',
  });

  const [debouncedQuery, setDebouncedQuery] = useState(filters.q);

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, q: debouncedQuery }));
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedQuery]);

  const { data: dogs, isLoading, isError } = useDogs(filters);

  const handleFiltersChange = (newFilters: Partial<DogFiltersViewModel>) => {
    if (typeof newFilters.q === 'string') {
      setDebouncedQuery(newFilters.q);
    } else {
      setFilters((prev) => ({ ...prev, ...newFilters, q: debouncedQuery }));
    }
  };

  const displayFilters: DogFiltersViewModel = { ...filters, q: debouncedQuery };


  if (isError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-destructive">Wystąpił błąd</h2>
        <p className="text-muted-foreground">Nie udało się pobrać danych o psach. Spróbuj odświeżyć stronę.</p>
      </div>
    );
  }

  return (
    <div>
      <DogFilters filters={displayFilters} onFiltersChange={handleFiltersChange} isLoading={isLoading} />
      <DogGrid dogs={dogs ?? []} isLoading={isLoading} />
    </div>
  );
};

export default DogCatalogView;
