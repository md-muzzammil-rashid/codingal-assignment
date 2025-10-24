export interface Student {
  id: string
  name: string
  email: string
  created_at: string
}

export interface Course {
  id: string
  name: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  tags: string[]
  order_index: number
}

export interface Attempt {
  id: string
  student_id: string
  lesson_id: string
  timestamp: string
  correctness: number 
  hints_used: number
  duration_sec: number
}

export interface RecommendationResult {
  recommendation: Lesson
  reason_features: string[]
  confidence: number
  alternatives: Array<{ lesson: Lesson; reason: string }>
}

export interface CodeIssue {
  rule: string
  line: number
  column: number
  message: string
  suggestion: string
  severity: string;
}
