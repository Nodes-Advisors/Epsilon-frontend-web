import { Suspense, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './App.css'

function App() {

  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  const handleClick = () => {
    if (theme === 'light') {
      setTheme('dark')
      document.documentElement.classList.remove('light-theme')
    } else {
      setTheme('light')
      document.documentElement.classList.add('light-theme')
    }
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* <button onClick={handleClick}>{theme}</button> */}
      <RouterProvider router={router}></RouterProvider>
    </Suspense>
  )
}

export default App
