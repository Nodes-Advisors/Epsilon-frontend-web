import { Suspense, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './App.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { Auth0Provider } from '@auth0/auth0-react'
import 'react-loading-skeleton/dist/skeleton.css'
import { SkeletonTheme } from 'react-loading-skeleton'

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
      <Auth0Provider 
        domain={import.meta.env.VITE_AUTH0_DOMAIN_DEV as string}
        clientId={import.meta.env.VITE_AUTH0_CLIENTID_DEV as string}
        authorizationParams={{
          redirect_uri: window.location.origin + '/home',
        }}>
        <QueryClientProvider client={queryClient}>
          <SkeletonTheme baseColor='#888888' highlightColor='#dddddd'>
            <Suspense fallback={<div>Loading...</div>}>
              {/* <button onClick={handleClick}>{theme}</button> */}
              <RouterProvider router={router}></RouterProvider>
            </Suspense>
          </SkeletonTheme>
        </QueryClientProvider>
      </Auth0Provider>
    </ErrorBoundary>
  )
}

export default App
