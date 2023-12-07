import { Suspense, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './App.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ErrorBoundary } from 'react-error-boundary'

function App() {

  const queryClient = new QueryClient()
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
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div>Loading...</div>}>
          {/* <button onClick={handleClick}>{theme}</button> */}
          <RouterProvider router={router}></RouterProvider>
        </Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
