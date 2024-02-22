import { useNavigate } from 'react-router-dom'
import EpsilonLogo from '../assets/svgs/epsilon-logo.svg?react'
import SearchBarIcon from '../assets/svgs/search-bar-icon.svg?react'
import styles from '../styles/nav-bar.module.less'
import { AsyncImage } from 'loadable-image'
import { useContext, useEffect, useRef, useState } from 'react'
import NotificationBellIcon from '../assets/svgs/notification-bell.svg?react'
import MenuIcon from '../assets/images/menu.png'
import LeftNavBar from './left-nav-bar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import AuthComponent from './auth-component'
import { useTokenStore, useUserStore } from '../store/store'
import UserProfileIcon from '../assets/images/github-mark-white.png'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import WebSocketContext from '../websocket/WebsocketContext'
import CancelIcon from '../assets/svgs/cancel-button.svg?react'

export default function NavBar ({children}: {children: React.ReactNode}) {
  const token = useTokenStore(state => state.token)
  const setToken = useTokenStore(state => state.setToken)
  const navigate = useNavigate()
  const [openPanel, setOpenPanel] = useState(false)
  const [openAuthPanel, setOpenAuthPanel] = useState(false)
  const [notificationCategory, setNotificationCategory] = useState<'all' | 'approval'>('all')
  // const { user: auth0User, 
  //   logout, loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const setUser = useUserStore(state => state.setUser)
  const user = useUserStore(state => state.user)
  // const setUser = useUserStore(state => state.setUser)
  const panelRef = useRef<HTMLDivElement>(null)
  const [openNotification, setOpenNotification] = useState<boolean>(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const [option, setOption] = useState<boolean>(false)
  const [numNewMsg, setNumNewMsg] = useState<number>(0)
  const [openLeftNavBar, setOpenLeftNavBar] = useState<boolean>(true)
  const [savedCollections, setSavedCollections] = useState<string[]>([])
  const [openCollectionList, setOpenCollectionList] = useState<boolean>(false)
  const [requests, setRequests] = useState<any[]>([])
  const [userInfo, setUserInfo] = useState<any>({})
  const [message, setMessage] = useState<any>({})
  const [openDetail, setOpenDetail] = useState<boolean>(false)

  const { sendMessage, lastMessage, readyState } = useContext(WebSocketContext)
  const [allNotifications, setAllNotifications] = useState<any[]>([])

  const logout = async() => {
    try {
      await axios.post('http://localhost:5001/logout', { email: user?.email  }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      setToken(undefined)
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
    if (token) {
      const intervalId = setInterval(async () => {
        try {
          const response = await axios.get('http://localhost:5001/verifyToken', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token,
              'email': user?.email,
            },
          })
          if (response.status === 200) {
            if (!user) {
              axios.get('http://localhost:5001/getUserByToken', {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': token,
                },
              }).then(res => setUser({
                email: res.data.email,
                status: 'online',
              }))
            }
          }
          else if (response.status !== 200) {
            // Handle invalid token here
            toast.error('Token is invalid')
          }
        } catch (error) {
          // Handle error here
          toast.error('Error verifying token, the system will log you out')
          setTimeout(async() => {
            await logout()
          }, 1000)
        }
      }, 5000) // Runs every 60,000 milliseconds (1 minute)
    
      // Clear interval on component unmount
      return () => {
        clearInterval(intervalId)
      }
    }
  }, [token])  

  useEffect(() => {
    if (lastMessage) {
      const messageData = JSON.parse(lastMessage.data)
      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = date.getHours()
      const minute = date.getMinutes()
      const second = date.getSeconds()
      const time = `${year}-${month}-${day} ${hour}:${minute}:${second}`
      messageData.time = time
      setNumNewMsg(prevNum => prevNum + 1)
      if (messageData.type === 'approval request') {
        // get current time and set it to the message, I need format like 2021-09-01 12:00:00
        
        setRequests(prevRequests => [...prevRequests, messageData])
        setAllNotifications(prevNotifications => [...prevNotifications, messageData])
      } else {
        setAllNotifications(prevNotifications => [...prevNotifications, messageData])
      }
      
    }
  }, [lastMessage])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpenPanel(false)
      }
      // if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
      //   setOpenNotification(false)
      // }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get('http://localhost:5001/getUser', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'email': user?.email,
        },
        params: {
          email: user?.email,
        },
      })
      // console.log(res)
      if (res.status === 200) {
        
        setUserInfo(res.data)
      }
    }
    if (token) {
      fetchUser()
    }
  }, [token])

  useEffect(() => {
    setOpenLeftNavBar(!(window.location.href.includes('/my-saved-list') || window.location.href.includes('/fund-cards') 
    || window.location.href.includes('/intelligence') || window.location.href.includes('/database') 
    || window.location.href.includes('/kpi-dash') || window.location.href.includes('-cards')))

  }, [window.location.href])
  
  useEffect(() => {
    const fetchSavedCollections = async () => {
      await axios.get('http://localhost:5001/savedcollections',  {
        params: {
          email: user?.email,
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'email': user?.email,
        },
      }).then((res) => {
        setSavedCollections(res.data)
      }).catch((error) => {
        toast.error(error?.response?.data)
      })
    }
    if (token) {
      fetchSavedCollections()
    }
  }, [token])

  const handleSavedSearchClick = () => {
    if (savedCollections.length === 0) {
      toast.error('You have not saved any collections, please save some funds first.')
      return
    }
    setOpenCollectionList(!openCollectionList)
    // navigate('/my-saved-list')
  }

  // set a function which can get access to the server to check if the token is valid or not every 1 mins


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
        <EpsilonLogo
          onMouseOver={e => (e.target as HTMLImageElement).style.cursor = 'pointer'}
          onClick={() => navigate('/home')}
          // src={EpsilonLogo} 
          style={{ width: '10rem', height: 'auto', marginLeft: '2rem' }} alt="" />
        <div style={{ position: 'relative', marginLeft: '2rem' }}>
          <SearchBarIcon style={{ width: '1.5rem', position: 'absolute', paddingLeft: '1rem' }} />
          <input 
            className= {styles['nav-search-bar']}
            type="text" placeholder='Search Everything' />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span 
            onClick={handleSavedSearchClick}
            className={styles['nav-saved-fund']}
            style={{ fontSize: '1.1rem', fontWeight: 550, marginLeft: '3rem'  }} >
            My Saved Search
          </span>
          <span style={{ marginLeft: '2rem', fontWeight: 600, maxWidth: '10vw', display: 'inline-block', textWrap: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {
              'Welcome, ' + (user ? (userInfo?.name || userInfo?.username || user?.email || 'Guest'): 'Guest')
            }
          </span>
          <ul style={{ position: 'absolute', top: '1rem', left: '0' }}>
            {
              openCollectionList && savedCollections.map((collection, index) => (
                <li key={index} className={styles['collection-li']} style={{ display: 'block', width: '100%', textAlign: 'start', padding: '0.5rem 1rem', fontSize: '1.2rem', fontWeight: '600', cursor: 'pointer' }}
                  onClick={() => {
                    setOpenCollectionList(false)
                    navigate(`/my-saved-list/${collection}`)
                  }}
                >{collection}</li>
              ))
            }
          </ul>
        </div>

        <div 
          className={styles['login']} >
          <div style={{ position: 'relative' }}>
            <NotificationBellIcon 
              onClick={() => { setOpenNotification(!openNotification) }}
              className={styles['notification-icon']} />
            <div style={{ backgroundColor: 'red', color: 'white',
              top: '-0.5rem', right: '-0.5rem', 
              display: numNewMsg !== 0 ? '' : 'none',
              position: 'absolute', borderRadius: '50%', width: '1rem', height: '1rem', fontSize: '0.9rem' }}>{numNewMsg}</div>
          </div>
          
          {
            openNotification &&
            <div ref={notificationRef} className={`${styles['notification-layout']} ${styles['scrollbar']}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 1rem 0.5rem 1rem' }}>
                <h2 style={{ color: '#000', fontSize: '1.75rem', margin: 0 }}>Notification Center</h2>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <button 
                    onClick={() => setNotificationCategory('all')}
                    style={{ borderRadius: '3rem', padding: '0.5rem 1rem', 
                      outline: 'none',
                      border: notificationCategory === 'all' ? '0.1px solid Highlight' : '0.1px solid #777',
                      backgroundColor: notificationCategory === 'all' ? 'Highlight' : '#fff',
                      color: notificationCategory === 'all' ? '#fff' : '#000' }}>All</button>
                  <button
                    onClick={() => setNotificationCategory('approval')}
                    style={{ borderRadius: '3rem', padding: '0.5rem 1rem', 
                      outline: 'none',  
                      border: notificationCategory === 'approval' ? '0.1px solid Highlight' : '0.1px solid #777',
                      backgroundColor: notificationCategory === 'approval' ? 'Highlight' : '#fff',
                      color: notificationCategory === 'approval' ? '#fff' : '#000' }}
                  >Approval </button>

                </div>
  
              </div>
              {
                openDetail
                  ?
                  <div style={{ position: 'absolute', top: '5rem', left: '0', width: '100%', zIndex: 1000, background: '#fff2' }}>
                    <div style={{ width: '90%', height: '50%', background: '#fff', padding: '1rem', borderRadius: '0.5rem', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '0', right: '0', cursor: 'pointer' }} onClick={() => setOpenDetail(false)}>
                        <CancelIcon style={{ width: '1.5rem', height: 'auto' }} />
                      </div>
                      <h2 style={{ margin: 0, textAlign: 'start', fontSize: '1.25rem' }}>{'Fund Name: '}{message.fundName}</h2>
                      <p style={{ margin: 0, textAlign: 'start', fontSize: '1rem' }}>{'Type of Request: '}{message.requestName}</p>
                      <p style={{ margin: 0, textAlign: 'start', fontSize: '1rem' }}>{'Priority: '}{message.priority}</p>
                     
                      <p style={{ margin: 0, textAlign: 'start', fontSize: '1rem' }}>{'Deal: '}{message.deal}</p>
                      <p style={{ margin: 0, textAlign: 'start', fontSize: '1rem' }}>{'Contact Person: '}{message.contactPerson}</p>

                      
                      <p style={{ margin: 0, textAlign: 'start', fontSize: '1rem' }}>{message.details}</p>
                      <p style={{ margin: 0, textAlign: 'start', fontSize: '1rem' }}>{'Sender Email: '}{message.sendEmail}</p>


                      <div style={{ display: 'flex', marginTop: '1rem', gap: '2rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => {
                            const newRequests = requests.filter(request => request.fundName !== message.fundName && request.time !== message.time)
                            setRequests(newRequests)
                            const allMessages = allNotifications.filter(notification => notification.fundName !== message.fundName && notification.time !== message.time)
                            setAllNotifications(allMessages)
                            setOpenDetail(false)
                            setNumNewMsg(prevNum => prevNum - 1)
                            toast.success('You have successfully taken this request')
                          }}
                        >Take it</button>
                        <button
                          onClick={() => {
                            // remove this request from the list
                            const newRequests = requests.filter(request => request.fundName !== message.fundName && request.time !== message.time)
                            setRequests(newRequests)
                            const allMessages = allNotifications.filter(notification => notification.fundName !== message.fundName && notification.time !== message.time)
                            setAllNotifications(allMessages)
                            setOpenDetail(false)
                            setNumNewMsg(prevNum => prevNum - 1)
                            toast.success('You have successfully rejected this request')
                          }}
                        >Cancel</button>
                      </div>
                    </div>
                    
                  </div>
                  :
                  requests.map((request, index) => (
                    <div style={{ position: 'relative', padding: '1rem 0' }} key={index} className={styles['notification-message']} >
                      <span onClick={() => { setOpenDetail(true); setMessage(request) }}>{ option ? 'null' : `${request.fundName}approval created by ${request.sendEmail}` }</span>
                      <span style={{ position: 'absolute', right: 0, bottom: 0, fontSize: '0.75rem' }}>{request.time}</span>
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
                    <a className={styles['toggle']} href='/user-profile/me' style={{ display: 'block', width: '8rem', zIndex: 1001 }}>Go To My Profile</a>
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