import { useNavigate } from "react-router-dom";
import ProgressBar from "./ProgressBar";
type Course = {
  id: string;
  name: string;
  progress: number;
  next_up?: string;
  last_activity?: string;
};

export default function CourseCard({ course }: { course: Course }) {
  const navigate = useNavigate();
  const options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true, 
};

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{course.name}</h3>
        {/* {course.next_up && (
          <span onClick={()=>navigate(`courses/${next_up}`)} className="text-xs rounded-full bg-indigo-50 px-2 py-1 text-indigo-700">
            Next: {course.next_up}
          </span>
        )} */}
      </div>
      <div className="mt-3">
        <ProgressBar value={course.progress} />
        <div className="mt-1 text-xs text-gray-600">
          Progress: {course.progress}%
        </div>
      </div>
      {course.last_activity && (
        <div className="mt-2 text-xs text-gray-500">
          {/* @ts-ignore */}
          Last activity: {new Date(course.last_activity).toLocaleDateString('en-US', options)}
        </div>
      )}
      {course.next_up && (
        <div className="mt-2 text-xs text-gray-500">
          Next Up: {course.next_up}
        </div>
      )}
      <button onClick={()=>navigate(`course/${course.id}`)} className="mt-4 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        View Details
      </button>
    </div>
  );
}
