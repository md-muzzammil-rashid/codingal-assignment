import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './routes/Dashboard'
import CourseDetail from './routes/CourseDetail'
import LessonPage from './routes/Lession'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
export default function App(){

  const queryClient = new QueryClient()

  return (
  <QueryClientProvider client={queryClient}>
  <BrowserRouter>
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl p-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Codingal AI Course Coach</h1>
          <nav className="text-sm"><Link to="/" className="underline">Dashboard</Link></nav>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard/>}/>
          <Route path="/course/:id" element={<CourseDetail/>}/>
          <Route path="/lesson/:id" element={<LessonPage/>}/>
        </Routes>
      </div>
    </div>
  </BrowserRouter>
  </QueryClientProvider>)
}