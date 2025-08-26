// Filterable fields for Mnemonic
export const mnemonicFilterables = ['title', 'description', 'category'];

// Searchable fields for Mnemonic
export const mnemonicSearchableFields = ['title', 'description', 'category'];

// Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};