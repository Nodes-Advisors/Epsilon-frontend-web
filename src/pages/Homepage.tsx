import styles from '../styles/home.module.less'
import EpsilonMiniLogo from '../assets/svgs/epsilon-mini-logo.svg?react'
import HeadImgWrapper from '../components/headimg-wrapper'
import UserAvatar from '../assets/images/user-avatar.png'
import Divider from '../components/divider'
import NavWidget from '../components/nav-widget'
import KPIDashIcon from '../assets/svgs/kpi-dashboard.svg?react'
import FundCardIcon from '../assets/svgs/fund-card.svg?react'
import IntelligenceIcon from '../assets/svgs/intelligence.svg?react'
import GroupButtonIcon from '../assets/svgs/group-button.svg?react'
import SearchBar from '../components/searchbar'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { useUserStore } from '../store/store'
import TodayNews from '../components/today-news'
import LiveUpdateIcon from '../assets/svgs/live-update.svg?react'
import LiveUpdate from '../components/live-update'
import EpsilonLogo from '../assets/images/epsilon.png'
import KPIDashImg from  '../assets/images/kpi.png'
import FundCardImg from '../assets/images/fund-card.png'
import IntelligenceImg from '../assets/images/intelligence.png'
import LeftNavBar from '../components/left-nav-bar'

export default function Home() {
  
  const { isAuthenticated, user: auth0User, 
    logout, loginWithRedirect } = useAuth0()
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

  const logoutauth0 = async() => {
    const lastSlashIndex = window.location.href.lastIndexOf('/')
    const returnString = window.location.origin.substring(0, lastSlashIndex) + '/home'
    localStorage.setItem('logout', 'true')
    await logout({ logoutParams: { returnTo: returnString }})
    
  }


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