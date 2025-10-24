import { ArrowLeft, BookOpen } from "lucide-react"
import { useNavigate } from "react-router-dom"

// @ts-ignore
export default function CourseContent({ course }) {
  const navigate = useNavigate()

const courseLevel = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
}

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/")}
            className="mb-4 flex items-center gap-2 text-gray-700 hover:text-black transition"
          >
            <ArrowLeft/>
            Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
          <p className="text-gray-600 mt-2">{course.description}</p>
          <div className="mt-4 inline-block px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-700">
            {/* @ts-ignore */}
            {courseLevel[course.difficulty]}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lessons</h2>

          <div className="space-y-3">
            {/* @ts-ignore */}
            {course?.lessons?.map((lesson, idx) => (
              <div
                key={lesson.id}
                className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-100 transition cursor-pointer"
                onClick={() => navigate(`/lesson/${lesson.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                        {idx + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">{lesson.title}</h3>
                    </div>

                    <div className="flex flex-wrap gap-2 ml-11">
                      {/* @ts-ignore */}
                      {lesson.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <BookOpen />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
