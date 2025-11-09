import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DogFiltersViewModel } from "@/lib/viewModels";

interface DogFiltersProps {
  filters: DogFiltersViewModel;
  onFiltersChange: (newFilters: Partial<DogFiltersViewModel>) => void;
  isLoading: boolean;
}

export const DogFilters = ({ filters, onFiltersChange, isLoading }: DogFiltersProps) => {
  const [cities, setCities] = useState<string[]>([]);
  const [shelters, setShelters] = useState<{ id: string; name: string }[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [sheltersLoading, setSheltersLoading] = useState(true);

  useEffect(() => {
    // Fetch available cities
    fetch("/api/v1/cities")
      .then((res) => res.json())
      .then((data) => {
        setCities(data);
        setCitiesLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load cities:", err);
        setCitiesLoading(false);
      });

    // Fetch available shelters
    fetch("/api/v1/shelters")
      .then((res) => res.json())
      .then((data) => {
        setShelters(data);
        setSheltersLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load shelters:", err);
        setSheltersLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8" data-test-id="dog-filters">
      <Input
        type="search"
        placeholder="Szukaj po nazwie psa..."
        className="md:flex-1"
        value={filters.q}
        onChange={(e) => onFiltersChange({ q: e.target.value })}
        disabled={isLoading}
        data-test-id="dog-filters-search"
      />
      <Select
        value={filters.city}
        onValueChange={(value) => onFiltersChange({ city: value })}
        disabled={isLoading || citiesLoading}
      >
        <SelectTrigger className="w-full md:w-[180px]" data-test-id="dog-filters-city">
          <SelectValue placeholder="Miasto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie miasta</SelectItem>
          {cities.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.size}
        onValueChange={(value) => onFiltersChange({ size: value as DogFiltersViewModel["size"] })}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full md:w-[180px]" data-test-id="dog-filters-size">
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
        onValueChange={(value) => onFiltersChange({ age_category: value as DogFiltersViewModel["age_category"] })}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full md:w-[180px]" data-test-id="dog-filters-age">
          <SelectValue placeholder="Wiek" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Każdy wiek</SelectItem>
          <SelectItem value="puppy">Szczeniak</SelectItem>
          <SelectItem value="adult">Dorosły</SelectItem>
          <SelectItem value="senior">Senior</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.shelter}
        onValueChange={(value) => onFiltersChange({ shelter: value })}
        disabled={isLoading || sheltersLoading}
      >
        <SelectTrigger className="w-full md:w-[180px]" data-test-id="dog-filters-shelter">
          <SelectValue placeholder="Schronisko" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie schroniska</SelectItem>
          {shelters.map((shelter) => (
            <SelectItem key={shelter.id} value={shelter.name}>
              {shelter.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
