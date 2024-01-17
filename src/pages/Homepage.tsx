import styles from '../styles/home.module.less'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { useUserStore } from '../store/store'
import TodayNews from '../components/today-news'
import LiveUpdateIcon from '../assets/svgs/live-update.svg?react'
import LiveUpdate from '../components/live-update'

export default function Home() {
  
  const { isAuthenticated, user: auth0User } = useAuth0()
  const setUser = useUserStore(state => state.setUser)
  const user = useUserStore(state => state.user)

  useEffect(() => {
    if (localStorage.getItem('logout') && localStorage.getItem('logout') === 'true') {
      setUser(undefined)
      localStorage.removeItem('logout')
    }

    if (isAuthenticated) {
      const user = {...auth0User, status: 'online' as const } 
      setUser(user)
    } 
  }, [isAuthenticated])



  return (
    <section style={{ zIndex: 10, width: '100%', minHeight: '90vh' }} >
      <div style={{ zIndex: 10 }} className={styles['middle-panel']}>
        <p id={styles['welcome']}>Welcome Back to Nodes Epsilon, <span id={styles['name']}>{user ? user?.name || user?.nickname || user?.given_name || 'Guest': 'Guest'}</span>!</p>

        {/* <SearchBar /> */}

        <h2 className={styles['news-title']}>Today&apos;s Top News</h2>
        <TodayNews />
        
        <div className={styles['live-update-layout']}>
          <h2 className={styles['news-title']}>Live update</h2>
          <LiveUpdateIcon className={styles['live-update-icon']} />
        </div>
        <LiveUpdate />
        {/* <div style={{ position: 'absolute', right: 0, top: 0 }}>
          {
            user 
              ?
              <button onClick={logoutauth0}>
                Log Out
              </button>
              : 
              <div>
                <button onClick={() => loginWithRedirect()}>Login</button>
              </div>
          }
        </div> */}
      </div>
      
      

    </section>
  )
}