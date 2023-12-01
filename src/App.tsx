import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './App.css'

function App() {

  return (
    <Suspense fallback={<div>loading...</div>}>
      <RouterProvider router={router}></RouterProvider>
    </Suspense>
  )
}

export default App
