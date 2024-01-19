import styles from '../styles/left-nav-bar.module.less'
import HeadImgWrapper from './headimg-wrapper'
import Divider from './divider'
import NavWidget from './nav-widget'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { useUserStore } from '../store/store'

import EpsilonLogo from '../assets/images/epsilon.png'
import KPIDashImg from  '../assets/images/kpi.png'
import FundCardImg from '../assets/images/fund-card.png'
import IntelligenceImg from '../assets/images/intelligence.png'
import UserAvatar from '../assets/images/user-avatar.png'
import KPIDashIcon from '../assets/svgs/kpi-dashboard.svg?react'
import FundCardIcon from '../assets/svgs/fund-card.svg?react'
import IntelligenceIcon from '../assets/svgs/intelligence.svg?react'
import { useNavigate } from 'react-router-dom'
import DatabaseImg from '../assets/images/database.png'

export default function LeftNavBar({style, show}: {style?: React.CSSProperties, show: boolean}) {

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
      
  const navigate = useNavigate()
  
  return (
    <aside className={show ? `${styles['left-nav-bar']} ${styles['show']}`: `${styles['left-nav-bar']} ${styles['hide']}`} style={{...style}}>
      <div>
        {/* <EpsilonMiniLogo className={styles['epsilon-mini-logo']}/> */}
        <img 
          onMouseOver={(e) => {(e.target as HTMLImageElement).style.cursor = 'pointer'}}
          onClick={() => {navigate('/home')}}
          src={EpsilonLogo} alt="epsilon-logo" style={{ width: '2rem', height: '2rem' }} />
      </div>
      <HeadImgWrapper headImg={user?.picture ? user.picture : UserAvatar} status={user && user?.status ? user.status : 'not-login'} />

      <Divider style={{ marginTop: '0.7rem', marginBottom: '0.7rem' }} height='0.1625rem' width='5.25rem' color='rgba(255, 255, 255, 0.6)'/>
      <nav>
        <NavWidget src={KPIDashImg} Svg={KPIDashIcon} width='4.125rem' height='4.44794rem' to='/kpi-dash' text= 'KPI Dash'/>
        <NavWidget src={FundCardImg} Svg={FundCardIcon} width='4rem' height='4.22225rem' to='/fund-cards' text='Fund Cards' />
        <NavWidget src={IntelligenceImg} Svg={IntelligenceIcon} width='4rem' height='4.125rem' to='/intelligence' text='Intelligence' />
        <NavWidget src={DatabaseImg} Svg={IntelligenceIcon} width='4rem' height='4.125rem' to='/database' text='Database Interaction' />
      </nav>
      {/* <GroupButtonIcon id={styles['group-button']} /> */}
    </aside>
  )
}