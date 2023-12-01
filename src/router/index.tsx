import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

const Home = lazy(() => import('../pages/Home'))
const About = lazy(() => import('../pages/About'))
const NotFound = lazy(() => import('../pages/NotFound'))
const Profile = lazy(() => import('../pages/Profile'))

const router =  createBrowserRouter([
  { index: true, element: <Navigate to='/home' /> },
  { path: '/', element: <Navigate to='/home' /> },
  { path: 'home', element: <Home /> },
  { path: 'about', element: <About /> },
  { path: 'profile', element: <Profile /> },
  { path: '*', element: <NotFound /> },
])

export default router