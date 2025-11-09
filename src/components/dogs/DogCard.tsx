import type { DTO } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface DogCardProps {
  dog: DTO.DogResponse;
}

export const DogCard = ({ dog }: DogCardProps) => {
  return (
    <Card data-test-id="dog-card">
      <CardHeader>
        <CardTitle data-test-id="dog-card-name">{dog.name}</CardTitle>
        <CardDescription data-test-id="dog-card-metadata">
          {dog.age_years} lat · {dog.size} · {dog.shelter_id}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3" data-test-id="dog-card-temperament">{dog.temperament}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" data-test-id="dog-card-view-details-button">
          <a href={`/dogs/${dog.id}`}>Zobacz szczegóły</a>
        </Button>
      </CardFooter>
    </Card>
  );
};
