import { useNavigate } from 'react-router-dom'
import EpsilonLogo from '../assets/images/epsilon-logo.png'
import SearchBarIcon from '../assets/svgs/search-bar-icon.svg?react'
import styles from '../styles/nav-bar.module.less'
import { AsyncImage } from 'loadable-image'
import { useEffect, useRef, useState } from 'react'
import NotificationBellIcon from '../assets/svgs/notification-bell.svg?react'
import CancelButtonIcon from '../assets/svgs/cancel-button.svg?react'
import Switch from './switch-button'
import MenuIcon from '../assets/images/menu.png'
import LeftNavBar from './left-nav-bar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import AuthComponent from './auth-component'
import { useTokenStore, useUserStore } from '../store/store'
import UserProfileIcon from '../assets/images/github-mark-white.png'

export default function NavBar ({children}: {children: React.ReactNode}) {
  const token = useTokenStore(state => state.token)
  const setToken = useTokenStore(state => state.setToken)
  const navigate = useNavigate()
  const [openPanel, setOpenPanel] = useState(false)
  const [openAuthPanel, setOpenAuthPanel] = useState(false)
  // const { user: auth0User, 
  //   logout, loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const setUser = useUserStore(state => state.setUser)
  const user = useUserStore(state => state.user)
  const panelRef = useRef<HTMLDivElement>(null)
  const [openNotification, setOpenNotification] = useState<boolean>(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const [option, setOption] = useState<boolean>(false)
  const [numNewMsg, setNumNewMsg] = useState<number>(8)
  const [openLeftNavBar, setOpenLeftNavBar] = useState<boolean>(true)
  const logout = async() => {
    try {
      await axios.post('http://localhost:5001/logout', { email: user?.email  }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      toast.success('Successfully logged out')
    } catch (error) {
      toast.error(error?.response?.data)
    }
  
    localStorage.setItem('logout', 'true')

    setUser(undefined)
    setToken(undefined)
    navigate('/')
  }

  useEffect(() => {
    // toast.error('Please verify your email address to continue')
  }, [openAuthPanel])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpenPanel(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setOpenNotification(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setOpenLeftNavBar(!(window.location.href.includes('/my-saved-list') || window.location.href.includes('/fund-cards')))

  }, [window.location.href])
  

  return (
    <>
      <nav
        style={{ 
          width: '100%',
          height: '10vh',
          background: '#121834',
          display: 'flex',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          zIndex: 9999,
        }}
      >
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
        {
          openLeftNavBar && <LeftNavBar show={true} />
        }
        <img src={MenuIcon}
          style={{ width: '2rem', height: 'auto', marginLeft: '2rem', filter: 'invert(1)'  }}
          onMouseOver={e => (e.target as HTMLImageElement).style.cursor = 'pointer'}
          onClick={() => setOpenLeftNavBar(!openLeftNavBar) }
          alt="" />
        <img
          onMouseOver={e => (e.target as HTMLImageElement).style.cursor = 'pointer'}
          onClick={() => navigate('/home')}
          src={EpsilonLogo} style={{ width: '10rem', height: 'auto', marginLeft: '2rem' }} alt="" />
        <div style={{ position: 'relative', marginLeft: '2rem' }}>
          <SearchBarIcon style={{ width: '1.5rem', position: 'absolute', paddingLeft: '1rem' }} />
          <input 
            className= {styles['nav-search-bar']}
            type="text" placeholder='Search anything' />
        </div>
        <span 
          onClick={() => navigate('/my-saved-list')}
          className={styles['nav-saved-fund']}
          style={{ fontSize: '1.1rem', fontWeight: 550, marginLeft: '3rem'  }} >
            My Saved Funds
        </span>

        <div 
          className={styles['login']} >
          <div style={{ position: 'relative' }}>
            <NotificationBellIcon 
              onClick={() => { setOpenNotification(!openNotification); setNumNewMsg(0) }}
              className={styles['notification-icon']} />
            <div style={{ backgroundColor: 'red', color: 'white',
              top: '-0.5rem', right: '-0.5rem', 
              display: numNewMsg !== 0 ? '' : 'none',
              position: 'absolute', borderRadius: '50%', width: '1rem', height: '1rem', fontSize: '0.9rem' }}>7</div>
          </div>
          
          {
            openNotification &&
            <div ref={notificationRef} className={`${styles['notification-layout']} ${styles['scrollbar']}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 1rem 0.5rem 1rem', width: '90%' }}>
                <h2 style={{ color: '#000', fontSize: '1.2rem', margin: 0 }}>Recent Notification</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span>Only Show Aprrovals?</span>
                  <Switch width='2rem' height='1rem' option={option} setOption={setOption} />
                  {/* <span>Approvals</span> */}
                </div>
                <CancelButtonIcon 
                  className={styles['cancel-button']}
                  onClick={() => setOpenNotification(false)}
                />
              </div>
              {
                [1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
                  <div key={index} className={styles['notification-message']} >
                    <span>{option ? 'approval request' : 'message'} {item} from someone</span>
                  </div>
                ))
              }
            </div>
          }
          {
            token  
              ? 
              <div 
                ref={panelRef}
                style={{ position: 'relative' }}>
                <div className={styles['nav-profile-pic']}>
                  <AsyncImage 
                    onMouseLeave={() => {
                    // if ()
                    }}
                    onClick={() => setOpenPanel(!openPanel)}
                    src={UserProfileIcon}
                    style={{ width: '4rem', height: '4rem', borderRadius: '0.25rem'  }}
    
                  />
                </div>
                
                {
                  openPanel && 
                  <div style={{ textAlign: 'start', position: 'absolute', right: '-1rem', top: '5rem', zIndex: 1000 }}>
                    <a className={styles['toggle']} href='/user-profile' style={{ display: 'block', width: '8rem', zIndex: 1001 }}>Go To My Profile</a>
                    <a className={styles['toggle']} style={{ display: 'block', zIndex: 1001, position: 'relative' }}
                      onClick={logout}
                    >Sign Out</a>
                  </div>
                }
                
              </div>
              : 
       
              <span 
                className={styles['nav-profile-login']}
                onClick={() => setOpenAuthPanel(!openAuthPanel)}>LOGIN
              </span>

                
          

          }
          
        </div>
      </nav>
      {
        openAuthPanel && 
              <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 255, background: '#fff2', top: 0, left: 0 }}>
                
                <AuthComponent setOpenAuthPanel={setOpenAuthPanel}/>
              </div>
      }
      {children}
    </>
  )
}