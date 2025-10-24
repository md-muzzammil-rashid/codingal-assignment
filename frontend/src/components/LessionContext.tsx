import  { useState } from "react"
import { useNavigate } from "react-router-dom"
import CodeEditor from "./CodeEditor"
import { CheckCircle, Zap, ZapIcon } from "lucide-react"

export default function LessonContent({  lesson }) {
  const navigate = useNavigate()
  const [code, setCode] = useState("")

  if (!lesson ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lesson not found</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(`/course/${lesson.course_id}`)}
            className="mb-4 flex items-center gap-2 text-gray-700 hover:text-black transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Course
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
              <p className="text-gray-600 mt-2">{lesson?.course_name}</p>
            </div>

            {lesson?.student_attempt?.best_attempt && (
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <CheckCircle color="green" />
                </div>
                {lesson?.student_attempt?.best_attempts}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="p-6 bg-white rounded-xl shadow sticky top-4 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lesson Overview</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Learn about <strong>{lesson.title}</strong> in this interactive lesson.
                  </p>

                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {lesson.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Your Progress</h3>

                  <div className="flex items-center gap-2 text-sm">
                    <ZapIcon color="blue" size={16}/>
                    Overall Score: {(lesson?.student_attempt?.code_quality || 0) *100}/100
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ZapIcon color="blue" size={16}/>
                    Last Attempt Score: {(lesson?.student_attempt?.correctness || 0) *100}/100
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ZapIcon color="blue" size={16}/>
                    Total Attempt: {lesson?.student_attempt?.total_attempts || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="p-6 bg-white rounded-xl shadow space-y-4">
              <CodeEditor  code={code} onChange={setCode} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
