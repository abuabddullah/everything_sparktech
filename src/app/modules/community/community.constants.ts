// Filterable fields for Community
export const communityFilterables = ['name', 'avatarUrl', 'question', 'details'];

// Searchable fields for Community
export const communitySearchableFields = ['name', 'avatarUrl', 'question', 'details'];

// Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};