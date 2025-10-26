import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DogFiltersViewModel } from '@/lib/viewModels';

interface DogFiltersProps {
    filters: DogFiltersViewModel;
    onFiltersChange: (newFilters: Partial<DogFiltersViewModel>) => void;
    isLoading: boolean;
}

export const DogFilters = ({ filters, onFiltersChange, isLoading }: DogFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <Input
        type="search"
        placeholder="Szukaj po nazwie lub mieście..."
        className="md:flex-1"
        value={filters.q}
        onChange={(e) => onFiltersChange({ q: e.target.value })}
        disabled={isLoading}
      />
      <Select
        value={filters.size}
        onValueChange={(value) => onFiltersChange({ size: value as DogFiltersViewModel['size'] })}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Rozmiar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie rozmiary</SelectItem>
          <SelectItem value="small">Mały</SelectItem>
          <SelectItem value="medium">Średni</SelectItem>
          <SelectItem value="large">Duży</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.age_category}
        onValueChange={(value) => onFiltersChange({ age_category: value as DogFiltersViewModel['age_category'] })}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Wiek" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Każdy wiek</SelectItem>
          <SelectItem value="puppy">Szczeniak</SelectItem>
          <SelectItem value="adult">Dorosły</SelectItem>
          <SelectItem value="senior">Senior</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
