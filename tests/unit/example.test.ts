import { describe, it, expect, vi } from 'vitest';

/**
 * Example utility function to test
 */
function formatDogName(name: string): string {
  if (!name || name.trim().length === 0) {
    throw new Error('Dog name cannot be empty');
  }
  return name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
}

/**
 * Example async function to test
 */
async function fetchDogAge(dogId: string): Promise<number> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(3);
    }, 100);
  });
}

describe('formatDogName', () => {
  it('should format dog name with first letter uppercase', () => {
    const result = formatDogName('buddy');
    expect(result).toBe('Buddy');
  });

  it('should handle names with mixed case', () => {
    const result = formatDogName('bUdDy');
    expect(result).toBe('Buddy');
  });

  it('should trim whitespace', () => {
    const result = formatDogName('  buddy  ');
    expect(result).toBe('Buddy');
  });

  it('should throw error for empty string', () => {
    expect(() => formatDogName('')).toThrow('Dog name cannot be empty');
  });

  it('should throw error for whitespace only', () => {
    expect(() => formatDogName('   ')).toThrow('Dog name cannot be empty');
  });
});

describe('fetchDogAge', () => {
  it('should return dog age', async () => {
    const age = await fetchDogAge('123');
    expect(age).toBe(3);
  });

  it('should be callable with vi.fn()', async () => {
    const mockFetchDogAge = vi.fn().mockResolvedValue(5);
    const age = await mockFetchDogAge('123');

    expect(mockFetchDogAge).toHaveBeenCalledWith('123');
    expect(age).toBe(5);
  });
});

describe('Array operations', () => {
  it('should filter adult dogs', () => {
    const dogs = [
      { name: 'Buddy', age: 2 },
      { name: 'Max', age: 5 },
      { name: 'Charlie', age: 1 },
    ];

    const adultDogs = dogs.filter(dog => dog.age >= 2);

    expect(adultDogs).toHaveLength(2);
    expect(adultDogs[0].name).toBe('Buddy');
    expect(adultDogs[1].name).toBe('Max');
  });

  it('should use inline snapshot for dog list', () => {
    const dogs = ['Buddy', 'Max', 'Charlie'];
    expect(dogs).toMatchInlineSnapshot(`
      [
        "Buddy",
        "Max",
        "Charlie",
      ]
    `);
  });
});

