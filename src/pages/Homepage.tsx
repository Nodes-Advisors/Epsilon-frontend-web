import styles from '../styles/home.module.less'
import React, { useContext, useEffect, useState } from 'react'
import { useUserStore, useTokenStore } from '../store/store'
import TodayNews from '../components/today-news'
import LiveUpdate from '../components/live-update'
import axios from 'axios'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import WebSocketContext from '../websocket/WebsocketContext'

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
    fetch('http://localhost:5001/getAllGPTPrompt')
      .then(res => res.json())
      .then(data => {
        setTooltipData(data)
      })
      .catch(error => {
        console.error('Error:', error)
      })
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`http://localhost:5001?q=${query}`)
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
      const res = await axios.get('http://localhost:5001/getUser', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
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
    fetchUser()
  }, [])


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
              {!tooltip.type && <li style={{ padding: '0.5rem 1rem', margin: 0 }}>Follow up</li>}
              {/* <li style={{ padding: '1rem', margin: 0 }}>Option 3</li> */}
            </ul>
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', marginLeft: '10.25rem' }} >
      {/* <p id={styles['welcome']}>{'Welcome to Nodes EpsilonAI, '}<span id={styles['name']}>{user ? userInfo?.name || userInfo?.username || user?.email || 'Unknown User': 'Guest'}</span>!</p> */}
      <h2 className={styles['news-title']}>Today&apos;s Top News</h2>
      <div style={{ width: '100%', textAlign: 'left', display: 'grid', gridTemplateColumns: '3fr 1fr' }}>
        <div style={{ gridRow: '1', gridColumn: '1' }}>
          
          <div style={{ width: '97.5%',  backgroundColor: '#aaa1', boxShadow: '0px 0px 2px 0px rgba(255, 255, 255, 0.90)', borderRadius: '1rem' }}>
            <h3  className={styles['news-sub-title']}>Pinned</h3>
            {/* <TodayNews /> */}
            <ul style={{ height: '9rem' }} className={styles['news-ul']}>
              {
                pinnedMessages.map((message, index) => 
                {
                  // if (message.type) {
                  return (
                    <CustomContextMenu tooltip={message} key={index}>
                      <li>{message.message}</li>
                    </CustomContextMenu>
                  )
                  // }
                },
                )
              }
            </ul>
          </div>
          
          <div style={{ width: '97.5%', backgroundColor: '#aaa1', boxShadow: '0px 0px 2px 0px rgba(255, 255, 255, 0.90)', borderRadius: '1rem' }}>
            <h3  className={styles['news-sub-title']}>Milestones</h3>
            {/* <TodayNews /> */}
            <ul style={{ height: '9rem' }} className={styles['news-ul']}>
              <li>Congratulations, <span>Eliott Harfouche</span>. You've hited 3 deck requests this week.</li>
              <li>Avivo has recieved 16 meetings request this month!</li>
              <li>Eliott Harfouche has 3 requests pending, please check your requests</li>

             
            </ul>
          </div>
        </div>
  
        <div style={{  gridRow: '1', gridColumn: '2' }}>
          <div style={{ width: '97.5%', backgroundColor: '#aaa1', boxShadow: '0px 0px 2px 0px rgba(255, 255, 255, 0.90)', borderRadius: '1rem' }}>
            <h2 style={{ marginTop: '2.5rem' }} className={styles['news-title']}>Follow Ups</h2>
            
            <ul style={{ maxHeight: '30rem' }} className={styles['news-ul']}>
              {
                followupMessages.length > 0 &&
                followupMessages.map((message, index) => (
                  <CustomContextMenu tooltip={message} key={index}>
                    <li>{message.message}</li>
                  </CustomContextMenu>
                ),
                )
              }
            </ul>

          </div>
        </div>
        <div style={{  gridRow: '2', gridColumn: '2' }}>
          <div style={{ width: '97.5%', backgroundColor: '#aaa1', boxShadow: '0px 0px 2px 0px rgba(255, 255, 255, 0.90)', borderRadius: '1rem' }}>
            <h2 style={{ marginTop: '2.5rem' }} className={styles['news-title']}>GPT prompt</h2>
            
            <ul style={{ maxHeight: '50rem' }} className={styles['news-ul']}>
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

     
        <div style={{ gridRow: '2', gridColumn: '1', backgroundColor: '#aaa1', 
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