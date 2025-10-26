import type { DTO } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface DogCardProps {
  dog: DTO.DogResponse;
}

export const DogCard = ({ dog }: DogCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{dog.name}</CardTitle>
        <CardDescription>
          {dog.age_years} lat · {dog.size} · {dog.shelter_id}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3">{dog.temperament}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <a href={`/dogs/${dog.id}`}>Zobacz szczegóły</a>
        </Button>
      </CardFooter>
    </Card>
  );
};
