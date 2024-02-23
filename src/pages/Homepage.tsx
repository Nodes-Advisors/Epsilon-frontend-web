import styles from '../styles/home.module.less'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useUserStore, useTokenStore } from '../store/store'
import TodayNews from '../components/today-news'
import LiveUpdate from '../components/live-update'
import axios from 'axios'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import WebSocketContext from '../websocket/WebsocketContext'
import CancelImgIcon from '../assets/images/cancel.png'
import FlipPage from 'react-flip-page'
import { SERVER_ADDRESS } from '../lib/utils'

export default function Home() {
  
  const setUser = useUserStore(state => state.setUser)
  const user = useUserStore(state => state.user)
  const token = useTokenStore(state => state.token)
  const [query, setQuery] = useState<string>('')
  const [data, setData] = useState<IDataItem[]>([])
  const [filteredData, setFilteredData] = useState<IDataItem[]>([])
  const [senders, setSenders] = useState<string[]>([])
  const [investorEmails, setInvestorEmails] = useState<string[]>([])
  const [deals, setDeals] = useState<string[]>([])
  const [userInfo, setUserInfo] = useState<any>({})
  const { sendMessage, lastMessage, readyState } = useContext(WebSocketContext)
  const [tooltipData, setTooltipData] = useState([])
  const [pinnedMessages, setPinnedMessages] = useState([])
  const [switchTab, setSwitchTab] = useState<'Pinned' | 'Milestone' | 'Approval Request'>('Pinned')
  const [prevTab, setPrevTab] = useState(null)
  const [animationClass, setAnimationClass] = useState('')
  const ulRef = useRef(null)
  const [approveRequests, setApproveRequests] = useState<any[]>([])
  useEffect(() => {
    if (prevTab !== null) {
      setAnimationClass(switchTab !== prevTab ? 'tab-enter' : 'tab-exit')
    }
    setPrevTab(switchTab)
  }, [switchTab, prevTab])

  useEffect(() => {
    const ul = ulRef.current
    const handleAnimationEnd = () => {
      setAnimationClass('')
    }

    ul.addEventListener('animationend', handleAnimationEnd)
    return () => {
      ul.removeEventListener('animationend', handleAnimationEnd)
    }
  }, [])

  const [followupMessages, setFollowupMessages] = useState([
    {
      message: 'Tyler Aroner should catch up with Schenkein at GV for ANTION after contacted on 08-10-2021',
    },
    {
      message: 'Tyler Aroner should catch up with Philippakisa at GV for REGEN after contacted on 27-01-2022',
    },
    {
      message: 'Tyler Aroner should catch up with Philippakisa at GV for STA after contacted on 27-01-2022',
    },
    {
      message: 'Tyler Aroner should catch up with Sullivan at GV for STA after contacted on 03-02-2022',
    },
    {
      message: 'Tyler Aroner should catch up with Robbins at GV for STA after contacted on 03-02-2022',
    },
  ])

  useEffect(() => {
    setPrevTab(switchTab)
  }, [switchTab])

  useEffect(() => {
    axios.get(`http://${SERVER_ADDRESS}:5001/getAllGPTPrompt`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'email': user?.email,
        },
      })
      .then(res => res.data)
      .then(data => {
        setTooltipData(data)
      })
      .catch(error => {
        console.error('Error:', error)
      })
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`http://${SERVER_ADDRESS}:5001?q=${query}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'email': user?.email,
        },
      })
      setData(res.data)
      setFilteredData(res.data)

      // Extract unique senders
      const uniqueSenders = Array.from(
        new Set(res.data.map((item: IDataItem) => item.sender)),
      )
      setSenders(uniqueSenders as string[])

      // Extract investor emails
      const investorEmails = Array.from(
        new Set(
          res.data.map((item: IDataItem) => item.isInvestorEmail.toString()),
        ),
      )
      setInvestorEmails(investorEmails as string[])

      // Extract unique deals
      const uniqueDeals = Array.from(
        new Set(res.data.map((item: IDataItem) => item.project)),
      )
      setDeals(uniqueDeals as string[])
    }
    if (query.length === 0 || query.length > 2) fetchData()
  }, [query])

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`http://${SERVER_ADDRESS}:5001/getUser`, {
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
    if (token) fetchUser()
  }, [token])

  const formatedTime = (time: string) => {
    const date = new Date(time)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    const second = date.getSeconds().toString().padStart(2, '0')
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`
  }

  useEffect(() => {
    if (lastMessage) {
      const messageData = JSON.parse(lastMessage.data)
      const date = new Date(messageData.time)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      const second = date.getSeconds().toString().padStart(2, '0');
      const formatTime = `${day}/${month}/${year} ${hour}:${minute}:${second}`
      messageData.formatTime = formatTime
      
      if (messageData.type === 'approval request') {
        // get current time and set it to the message, I need format like 2021-09-01 12:00:00
        // console.log('messageData', messageData)
        if (localStorage.getItem('approvalRequests')) {
          const prevRequests = JSON.parse(localStorage.getItem('approvalRequests'))
          setApproveRequests( [...prevRequests])
          
        } else {
          localStorage.setItem('approvalRequests', JSON.stringify([messageData]))
          setApproveRequests(prevRequests => [...prevRequests, messageData])
        }

        // setAllNotifications(prevNotifications => [...prevNotifications, messageData])
      } else if (messageData.type === 'approval response') {
        console.log('Approval response')
        if (localStorage.getItem('approvalRequests')) {
          setApproveRequests(prevRequests => prevRequests.filter(req => req.requestId !== messageData.requestId))
          
        } else {
          

          setApproveRequests(prevRequests => prevRequests.filter(req => req.requestId !== messageData.requestId))
        }
      }
      
    }
  }, [lastMessage])

  const isPinned = (message) => {
    // console.log('message', message)

    if (message.type) {
      return pinnedMessages.some(m => m.content === message.content)
    } else {
      return pinnedMessages.some(m => m.message === message.message)
    
    }
  }
  const togglePin = (e, message) => {
    e.stopPropagation()
    if (isPinned(message)) {
      if (message.type) {
        setPinnedMessages(prev => prev.filter(m => m.content !== message.content))
      } else {
        setPinnedMessages(prev => prev.filter(m => m.message !== message.message))
      }
    } else {
      setPinnedMessages(prev => [...prev, message])
    }
  }

  const CustomContextMenu = ({ children, tooltip}: {children: React.ReactNode, tooltip?: any}) => {
    const [visible, setVisible] = useState(false)
    const [coords, setCoords] = useState({ x: 0, y: 0 })
    const [tooltipVisible, setTooltipVisible] = useState(false)
    const [highlighted, setHighlighted] = useState(false)
    const [followUpVisible, setFollowUpVisible] = useState(false)

    const followUp = () => {
      setFollowUpVisible(true)
    }
  
    const closeFollowUp = () => {
      setFollowUpVisible(false)
    }

    const showMenu = (e) => {
      e.preventDefault()
      setVisible(true)
      setCoords({ x: e.clientX, y: e.clientY })
      setHighlighted(true)
    }
  
    const closeMenu = () => {
      setVisible(false)
      setHighlighted(false)
    }
  
    const showTooltip = () => {
      setTooltipVisible(true)
    }
  
    const hideTooltip = () => {
      setTooltipVisible(false)
    }
  
    useEffect(() => {
      document.addEventListener('click', closeMenu)
      return () => {
        document.removeEventListener('click', closeMenu)
      }
    }, [])

    const submit = async(e) => {
      e.preventDefault()
      
      closeFollowUp()
    }
  
    return (
      
      <div 
        style={{ backgroundColor: highlighted ? '#7774' : 'transparent' }} // Add this line
        onContextMenu={showMenu} onClick={closeMenu} onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
        {children}
  
        {
          tooltip.type && !highlighted && tooltip &&
          <Tooltip show={tooltipVisible}>
            <div><span style={{ fontWeight: 700 }}>Sender:</span> {tooltip.sender_name}</div>
            <div><span style={{ fontWeight: 700 }}>Email:</span> {tooltip.sender_email}</div>
            <div><span style={{ fontWeight: 700 }}>Content:</span> {tooltip.content}</div>
          </Tooltip>
        }
        {visible && (
          <div
            style={{
              position: 'absolute',
              top: `${coords.y}px`,
              left: `${coords.x}px`,
              backgroundColor: 'white',
              boxShadow: '0px 0px 2px 0px rgba(255, 255, 255, 0.90)',
              borderRadius: '0.5rem',
              zIndex: 1000,
            }}
          >
            <ul style={{ color: '#333', listStyleType: 'none', margin: 0, padding: 0 }}>
              <li style={{ padding: '0.5rem 1rem', margin: 0 }} onClick={e => togglePin(e, tooltip)}>
                {isPinned(tooltip) ? 'Unpin this' : 'Pin this'}
              </li>
              {!tooltip.type && <li 
                onClick={followUp}
                style={{ padding: '0.5rem 1rem', margin: 0 }}>Follow up</li>}
              {/* <li style={{ padding: '1rem', margin: 0 }}>Option 3</li> */}
            </ul>
          </div>
        )}

        {followUpVisible && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            // justifyContent: 'center',
            alignItems: 'start',
            borderRadius: '0.5rem',
            boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.1)',
            width: '25rem',
            height: '20rem',
            zIndex: 1000,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '90%' }}>
              <h2 style={{ color: '#000' }}>Status Update</h2>
              <img 
                onClick={closeFollowUp}
                src={CancelImgIcon} style={{ width: '0.8rem', height: '0.8rem', cursor: 'pointer'}} alt="" />
            </div>
            <form
              style={{ display: 'grid', width: '80%', gap: '1rem', padding: '1rem', color: '#000', gridTemplateColumns: '1fr 1fr' }}
              onSubmit={submit}>
              {/* <div style={{ color: '#000' }}> */}
              <label htmlFor="accountManager" style={{ color: '#000' }}>Account Manager</label>
              <span>Tyler</span>
              {/* </div> */}
              {/* <div> */}
              <label htmlFor="client" style={{ color: '#000' }}>Client</label>
              <span>Avivo</span>
              {/* </div> */}
              {/* <div style={{ color: '#000' }}> */}
              <label htmlFor="vc" >VC</label>
              <span>VC</span>
              {/* </div> */}
              {/* <div> */}
              <label htmlFor="contact" style={{ color: '#000' }}>Contact</label>
              <span>Sullivan</span>
              {/* </div> */}
              {/* <div> */}
              <label htmlFor="status" style={{ color: '#000' }}>Status</label>
              <select name="status" id="status">
                <option value="">Select a Status</option>
                <option value="manager1">Status 1</option>
                <option value="manager2">Status 2</option>
                <option value="manager3">Status 3</option>
              </select>
              {/* </div> */}
              <button type='submit'>Confirm</button>
              <button type='button' onClick={closeFollowUp}>Cancel</button>
            </form>
            {/* <button onClick={closeFollowUp}>Close</button> */}
            {/* Add your follow up content here */}
          </div>
        )}
      </div>
    )
  }

  const Tooltip = ({ show, children }) => {
    if (!show) {
      return null
    }
  
    return (
      <div style={{
        position: 'absolute',
        backdropFilter: 'blur(10px)',
        backgroundColor: '#fff9',
        color: '#333',
        padding: '1rem',
        borderRadius: '0.5rem',
        boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        width: '25rem',
        right: '40rem',
        bottom: '20rem',
      }}>
        {children}
      </div>
    )
  }

  return (
    // <div style={{ width: '100%', minHeight: '90vh' }} >
    <div style={{ overflowX: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'start', marginLeft: '10.25rem' }} >
      <h2 className={styles['news-title']}>{`${userInfo.name} Dashboard`}</h2>
      <div style={{ paddingLeft: '0.5%', width: '97.5%', textAlign: 'left', display: 'grid', gridTemplateColumns: '3fr 1fr', height: '80vh' }}>
        <div style={{ gridRow: '1', gridColumn: '1', position: 'relative' }}>
          <div style={{ display: 'flex', position: 'absolute', top: 0, right: '40px', color: '#DDD', gap: '0.5rem' }}>
            <span onClick={() => setSwitchTab('Pinned')}
              style={{ color: switchTab === 'Pinned' ? '#FFF' : '#DDD', cursor: 'pointer', fontWeight: switchTab === 'Pinned' ? 700 : 400 }}>Pinned</span>
            <span>|</span>
            <span onClick={() => setSwitchTab('Milestone')}
              style={{ color: switchTab === 'Milestone' ? '#FFF' : '#DDD', cursor: 'pointer', fontWeight:  switchTab === 'Milestone' ? 700 : 400 }}>Milestone</span>
            <span>|</span>
            <span onClick={() => setSwitchTab('Approval Request')}
              style={{ color: switchTab === 'Approval Request' ? '#FFF' : '#DDD', cursor: 'pointer', fontWeight:  switchTab === 'Approval Request' ? 700 : 400 }}>Approval Request</span>
          </div>
          <div 
            ref={ulRef}
            className={`${styles['tab-content']} ${styles[animationClass]}`} 
            style={{ height: '35vh', width: '97.5%', backgroundColor: '#aaa1', boxShadow: '0px 0px 2px 0px rgba(255, 255, 255, 0.90)', borderRadius: '1rem' }}>
            <h2 style={{ marginTop: '2.5rem' }} className={styles['news-title']}>{switchTab}</h2>
            <div className={styles['animation-container']}> 
              <ul style={{ maxHeight: '75%', overflow: 'auto' }} className={styles['news-ul']}>
                {
                  switchTab === 'Milestone' && 
                  <>
                    <li>Congratulations, <span>Eliott Harfouche</span>. You've hited 3 deck requests this week.</li>
                    <li>Avivo has recieved 16 meetings request this month!</li>
                    <li>Eliott Harfouche has 3 requests pending, please check your requests</li>
                  </>
                }
                {
                  switchTab === 'Pinned' && pinnedMessages.map((message, index) => 
                  {
                    return (
                      <CustomContextMenu tooltip={message} key={index}>
                        <li>{message.message}</li>
                      </CustomContextMenu>
                    )
                    // }
                  },
                  )
                }
                {
                  switchTab === 'Approval Request' && 
                  <>
                    {
                      approveRequests.length > 0 &&
                      approveRequests.map((message, index) => (        
                        <li key={message.time}>{message.sendEmail} sent you a request to {message.contactPerson} at {message.fundName} - {formatedTime(message.time)}</li>               
                      ),
                      )
                    }
                  </>
                }
              </ul>
            </div> 
          </div>
        </div>


  
        <div style={{  gridRow: '1', gridColumn: '2' }}>
          <div style={{ height: '35vh', width: '97.5%', backgroundColor: '#aaa1', boxShadow: '0px 0px 2px 0px rgba(255, 255, 255, 0.90)', borderRadius: '1rem' }}>
            <h2 style={{ marginTop: '2.5rem' }} className={styles['news-title']}>Follow Ups</h2>
            
            <ul style={{ maxHeight: '80%', overflow: 'auto' }} className={styles['news-ul']}>
              {
                followupMessages.length > 0 &&
                followupMessages.map((message, index) => (
                  <CustomContextMenu tooltip={message} key={index}>
                    <li>{message.message}</li>
                    {/* <li>{message.message}</li> */}
                  </CustomContextMenu>
                ),
                
                )
              }
            </ul>

          </div>
        </div>
        <div style={{  gridRow: '2', gridColumn: '2', height: '50%' }}>
          <div style={{ height: '35vh', width: '97.5%', backgroundColor: '#aaa1', boxShadow: '0px 0px 2px 0px rgba(255, 255, 255, 0.90)', borderRadius: '1rem' }}>
            <h2 style={{ marginTop: '2rem' }} className={styles['news-title']}>GPT prompt</h2>
            
            <ul style={{ maxHeight: '80%', overflow: 'auto' }} className={styles['news-ul']}>
              {
                tooltipData.length > 0 &&
                tooltipData.map((message, index) => (
                  <CustomContextMenu tooltip={message} key={index}>
                    <li>{message.message}</li>
                  </CustomContextMenu>
                ),
                )
              }
             

            </ul>

          </div>
        </div>

     
        <div style={{ height: '35vh', gridRow: '2', gridColumn: '1', backgroundColor: '#aaa1', 
          boxShadow: '0px 0px 2px 0px rgba(255, 255, 255, 0.90)',
          borderRadius: '1rem', marginTop: '2rem', width: '97.5%' }}>
          <div className={styles['live-update-layout']}>
            <h2 style={{ margin: 'auto 0' }} className={styles['news-title']}>Live update</h2>
            <div className={styles['live-update-icon']} />
          </div>
          <LiveUpdate user={userInfo}/>
        </div>
      </div>
      

    </div> 
      

  // </div>
  )
}