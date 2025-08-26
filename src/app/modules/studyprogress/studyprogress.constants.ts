// Filterable fields for Studyprogress
export const studyprogressFilterables = []

// Searchable fields for Studyprogress
export const studyprogressSearchableFields = []

// Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false
  for (const item of setA) {
    if (!setB.has(item)) return false
  }
  return true
}

export const studyProgressFilterableFields = ['searchTerm', 'status']

export const studyProgressSearchableFields = ['status']
