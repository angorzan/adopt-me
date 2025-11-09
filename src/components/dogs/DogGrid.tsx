import type { DTO } from "@/types";
import { DogCard } from "./DogCard";
import { DogCardSkeleton } from "./DogCardSkeleton";

interface DogGridProps {
  dogs: DTO.DogResponse[];
  isLoading: boolean;
}

export const DogGrid = ({ dogs, isLoading }: DogGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <DogCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (dogs.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Nie znaleziono psów</h2>
        <p className="text-muted-foreground">Spróbuj zmienić kryteria wyszukiwania.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dogs.map((dog) => (
        <DogCard key={dog.id} dog={dog} />
      ))}
    </div>
  );
};
