// Filterable fields for Studymaterial
export const studymaterialFilterables = ['name', 'category', 'size', 'fileUrl'];

// Searchable fields for Studymaterial
export const studymaterialSearchableFields = ['name', 'category', 'size', 'fileUrl'];

// Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};