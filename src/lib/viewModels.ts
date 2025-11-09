import type { Enums } from "@/db/database.types";

export interface DogFiltersViewModel {
  size: Enums<"dog_size"> | "all";
  age_category: Enums<"dog_age_category"> | "all";
  city: string | "all";
  shelter: string | "all";
  q: string;
}
