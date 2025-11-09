/* eslint-disable no-console */
import { supabaseClient } from "./supabase-client";
import dogsData from "../data/dogs.json";
import type { Database } from "../src/db/database.types";

type DogSize = Database["public"]["Enums"]["dog_size"];
type DogAgeCategory = Database["public"]["Enums"]["dog_age_category"];
type DogStatus = Database["public"]["Enums"]["dog_status"];

// Mapping functions
function mapSize(size: string): DogSize {
  const sizeMap: Record<string, DogSize> = {
    mała: "small",
    średnia: "medium",
    duża: "large",
  };
  return sizeMap[size] || "medium";
}

function mapAgeCategory(age: number): DogAgeCategory {
  if (age <= 1) return "puppy";
  if (age <= 7) return "adult";
  return "senior";
}

function mapStatus(status: string): DogStatus {
  const statusMap: Record<string, DogStatus> = {
    dostępna: "available",
    "w trakcie": "in_process",
    adoptowana: "adopted",
  };
  return statusMap[status] || "available";
}

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Step 1: Create shelters (unique by name)
    console.log("📍 Creating shelters...");
    const sheltersMap = new Map<string, string>(); // shelterName -> shelterId

    for (const dog of dogsData) {
      const shelterName = dog.shelter.name;

      if (!sheltersMap.has(shelterName)) {
        const { data: existingShelter, error: findError } = await supabaseClient
          .from("shelters")
          .select("id")
          .eq("name", shelterName)
          .single();

        if (existingShelter) {
          sheltersMap.set(shelterName, existingShelter.id);
          console.log(`  ✓ Shelter "${shelterName}" already exists`);
        } else {
          const { data: newShelter, error: createError } = await supabaseClient
            .from("shelters")
            .insert({
              name: shelterName,
              city: dog.shelter.city,
              contact_email: dog.shelter.contactEmail,
              contact_phone: null,
            })
            .select("id")
            .single();

          if (createError) {
            console.error(`  ✗ Failed to create shelter "${shelterName}":`, createError);
            throw createError;
          }

          if (newShelter) {
            sheltersMap.set(shelterName, newShelter.id);
            console.log(`  ✓ Created shelter "${shelterName}"`);
          }
        }
      }
    }

    console.log(`✅ Created/found ${sheltersMap.size} shelters`);

    // Step 2: Create dogs
    console.log("\n🐕 Creating dogs...");
    let createdCount = 0;
    let skippedCount = 0;

    for (const dog of dogsData) {
      const shelterId = sheltersMap.get(dog.shelter.name);

      if (!shelterId) {
        console.error(`  ✗ No shelter ID found for dog "${dog.name}"`);
        continue;
      }

      // Check if dog already exists
      const { data: existingDog } = await supabaseClient
        .from("dogs")
        .select("id")
        .eq("name", dog.name)
        .eq("shelter_id", shelterId)
        .single();

      if (existingDog) {
        console.log(`  ⊘ Dog "${dog.name}" already exists, skipping`);
        skippedCount++;
        continue;
      }

      // Transform temperament array to string
      const temperamentStr = Array.isArray(dog.temperament) ? dog.temperament.join(", ") : dog.temperament;

      const { error: createDogError } = await supabaseClient.from("dogs").insert({
        name: dog.name,
        age_years: dog.age,
        size: mapSize(dog.size),
        temperament: temperamentStr,
        health: dog.health,
        adoption_status: mapStatus(dog.adoptionStatus),
        shelter_id: shelterId,
      });

      if (createDogError) {
        console.error(`  ✗ Failed to create dog "${dog.name}":`, createDogError);
        throw createDogError;
      }

      console.log(`  ✓ Created dog "${dog.name}" (${dog.age}y, ${dog.size})`);
      createdCount++;
    }

    console.log(`\n✅ Database seeding completed successfully!`);
    console.log(`   - Created: ${createdCount} dogs`);
    console.log(`   - Skipped: ${skippedCount} dogs (already exist)`);
    console.log(`   - Shelters: ${sheltersMap.size}`);
  } catch (error) {
    console.error("\n❌ Database seeding failed:", error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
