import CourseContent from "../components/CourseContent"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getCourseDetail } from "../api/services"

export default function CoursePage() {
  const params = useParams()
  const courseId = params.id as string

  const {data, isLoading} = useQuery({
    queryKey: ['courseDetail',courseId],
    queryFn: ()=>getCourseDetail(courseId)
  })


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    )
  }


  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-foreground text-xl">Course not found</div>
      </div>
    )
  }

  return  <CourseContent  course={data} /> 
}
