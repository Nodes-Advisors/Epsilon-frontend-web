import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

const Home = lazy(() => import('../pages/Home'))
const About = lazy(() => import('../pages/About'))
const NotFound = lazy(() => import('../pages/NotFound'))
const Profile = lazy(() => import('../pages/Profile'))
const DetailMessage = lazy(() => import('../pages/DetailMessage'))
const Login = lazy(() => import('../pages/Login'))

const router =  createBrowserRouter([
  { index: true, element: <Navigate to='/login' /> },
  { path: '/', element: <Navigate to='/login' /> },
  { path: 'home', element: <Home /> },
  { path: 'about', element: <About /> },
  { path: 'profile', element: <Profile /> },
  { path: '*', element: <NotFound /> },
  { path: 'detailmessage', element: <DetailMessage /> },
  { path: 'login', element: <Login /> },
])

export default router