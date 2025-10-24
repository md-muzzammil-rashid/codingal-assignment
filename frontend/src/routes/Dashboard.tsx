import CourseCard from '../components/CourseCard'
import { useQuery } from '@tanstack/react-query'
import { getStudentOverview, getStudentRecommendation } from '../api/services'
import { useNavigate } from 'react-router-dom'
export default function Dashboard(){
  const {data, isLoading} = useQuery({
    queryKey: ['studentOverview'],
    queryFn: getStudentOverview
  })

  const {data: recommendation , isLoading: isRecommedationLoading} = useQuery({
    queryKey: ['recommendation'],
    queryFn: ()=> getStudentRecommendation()
  })

  const navaigate = useNavigate()

  if(isLoading)return(<div>Loading...</div>)
  return(<div className='space-y-6'>
    <section><h2 className='mb-3 text-xl font-semibold'>My Courses</h2>
    {/* @ts-ignore */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>{data?.courses?.map(c=><CourseCard key={c.id} course={c}/>)}</div>
    </section>
    <section className='rounded-2xl border bg-white p-4 shadow-sm'>
    {isRecommedationLoading?
      <div>Loading...</div>
    :<div className="w-full  mx-auto p-6">
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 cursor-pointer" onClick={()=>navaigate(`/course/${recommendation?.recommendation?.id}`)} >
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Recommended Next Lesson
              </h2>
              <h3 className="text-xl font-bold text-card-foreground">{recommendation?.recommendation?.title}</h3>
            </div>
            <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-full w-16 h-16 flex-shrink-0">
              <span className="text-2xl font-bold">{Math.round(recommendation?.confidence * 100)}%</span>
              <span className="text-xs font-medium">Confidence</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-border">
          <h4 className="text-sm font-semibold text-card-foreground mb-4 uppercase tracking-wide">Why This Lesson</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground font-medium mb-1">Progress</div>
              <div className="text-2xl font-bold text-card-foreground">{recommendation?.reason_features?.progress_inverse}%</div>
              <div className="text-xs text-muted-foreground mt-1">Complete</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground font-medium mb-1">Last Viewed</div>
              <div className="text-2xl font-bold text-card-foreground">
                {Math.round(recommendation?.reason_features?.recency_gap_days)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Days Ago</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground font-medium mb-1">Topic Match</div>
              <div className="text-2xl font-bold text-card-foreground">
                {Math.round(recommendation?.reason_features?.tag_gap * 100)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Relevant</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground font-medium mb-1">Hints Used</div>
              <div className="text-2xl font-bold text-card-foreground">
                {Math.round(recommendation?.reason_features?.hint_rate * 100)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Rate</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h4 className="text-sm font-semibold text-card-foreground mb-4 uppercase tracking-wide">Other Options</h4>
          <div className="space-y-3">
            {/* @ts-ignore */}
            {recommendation?.alternatives?.map((alt, index) => (
              <div
                key={alt.id}
                onClick={()=>navaigate(`/course/${alt.id}`)}
                className="flex cursor-pointer items-center gap-4 p-4 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors  border border-border/50"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">{alt.title}</p>
                </div>
                <div className="text-muted-foreground text-sm flex-shrink-0">→</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>}
    </section>
  </div>)
}