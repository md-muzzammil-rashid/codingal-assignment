import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import LessonContent from "../components/LessionContext"
import { useQuery } from "@tanstack/react-query"
import { getLessonDetail } from "../api/services"

export default function LessonPage() {
  const navigate = useNavigate()
  const params = useParams()
  const lessonId = params.id as string

  const {data, isLoading} = useQuery({
    queryKey: ['lessonDetail',lessonId],
    queryFn: ()=>getLessonDetail(lessonId)
  })



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    )
  }


  return <LessonContent lesson={data} /> 
}
