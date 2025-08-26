// 🔹 Filterable fields for Lesson
export const lessonFilterables = ['title', 'category', 'lessonType']

// 🔹 Searchable fields for Lesson
export const lessonSearchableFields = ['title']

// 🔹 Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false
  for (const item of setA) {
    if (!setB.has(item)) return false
  }
  return true
}

// 🔹 Optional: helper to check if a filterable field is valid
export const isValidLessonFilter = (field: string): boolean => {
  return lessonFilterables.includes(field)
}

export const defaultStats = {
  avgHighestScore: 0,
  lessonUpdated: undefined,
  lastUpdated: undefined,
}
