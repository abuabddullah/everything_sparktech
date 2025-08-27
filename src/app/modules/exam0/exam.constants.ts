// 🔹 Filterable fields for Exam
export const examFilterables = ['title', 'category', 'examType']

// 🔹 Searchable fields for Exam
export const examSearchableFields = ['title']

// 🔹 Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false
  for (const item of setA) {
    if (!setB.has(item)) return false
  }
  return true
}

// 🔹 Optional: helper to check if a filterable field is valid
export const isValidExamFilter = (field: string): boolean => {
  return examFilterables.includes(field)
}

export const defaultStats = {
  questionCount: 0,
  attempts: 0,
  avgHighestScore: 0,
  avgScore: 0,
  avgTime: 0,
  lastAttemptAt: undefined,
}
