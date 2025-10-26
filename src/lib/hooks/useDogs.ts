import { useQuery } from '@tanstack/react-query';
import type { DogFiltersViewModel } from '@/lib/viewModels';
import type { DTO } from '@/types';

async function fetchDogs(filters: DogFiltersViewModel): Promise<DTO.DogResponse[]> {
  const params = new URLSearchParams();
  if (filters.size && filters.size !== 'all') params.append('size', filters.size);
  if (filters.age_category && filters.age_category !== 'all') params.append('age_category', filters.age_category);
  if (filters.city && filters.city !== 'all') params.append('city', filters.city);
  if (filters.shelter && filters.shelter !== 'all') params.append('shelter', filters.shelter);
  if (filters.q) params.append('q', filters.q);

  const response = await fetch(`/api/v1/dogs?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch dogs');
  }
  return response.json();
}

export const useDogs = (filters: DogFiltersViewModel) => {
  return useQuery({
    queryKey: ['dogs', filters],
    queryFn: () => fetchDogs(filters),
  });
};
