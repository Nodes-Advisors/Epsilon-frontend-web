import { Suspense, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './App.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ErrorBoundary } from 'react-error-boundary'
import 'react-loading-skeleton/dist/skeleton.css'
import { SkeletonTheme } from 'react-loading-skeleton'
import WebSocketProvider from './websocket/WebSocketProvider'

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
      <WebSocketProvider>
        <QueryClientProvider client={queryClient}>
          <SkeletonTheme baseColor='#888888' highlightColor='#dddddd'>
            <Suspense fallback={<div>Loading...</div>}>
              {/* <button onClick={handleClick}>{theme}</button> */}
              <RouterProvider router={router}></RouterProvider>
            </Suspense>
          </SkeletonTheme>
        </QueryClientProvider>
      </WebSocketProvider>
    </ErrorBoundary>
  )
}

export default App
