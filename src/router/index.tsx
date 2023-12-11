import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

const Home = lazy(() => import('../pages/Homepage'))
const About = lazy(() => import('../pages/About'))
const NotFound = lazy(() => import('../pages/NotFound'))
const Profile = lazy(() => import('../pages/Profile'))
const DetailMessage = lazy(() => import('../pages/DetailMessage'))
// const Login = lazy(() => import('../pages/Login'))
const KPIDash = lazy(() => import('../pages/KPIDash'))

const router =  createBrowserRouter([
  { index: true, element: <Navigate to='/home' /> },
  { path: '/', element: <Navigate to='/home' /> },
  { path: 'home', element: <Home /> },
  { path: 'about', element: <About /> },
  { path: 'fund-card', element: <Profile /> },
  { path: '*', element: <NotFound /> },
  { path: 'detailmessage', element: <DetailMessage /> },
  // { path: 'login', element: <Login /> },
  { path: 'kpidash', element: <KPIDash /> },
])

export default router