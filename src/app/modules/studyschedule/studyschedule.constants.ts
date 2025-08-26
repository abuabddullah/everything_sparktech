// Filterable fields for Studyschedule
export const studyscheduleFilterables = ['title', 'description'];

// Searchable fields for Studyschedule
export const studyscheduleSearchableFields = ['title', 'description'];

// Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};