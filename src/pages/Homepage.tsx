import styles from '../styles/home.module.less'
import { useEffect, useState } from 'react'
import { useUserStore, useTokenStore } from '../store/store'
import TodayNews from '../components/today-news'
import LiveUpdate from '../components/live-update'
import axios from 'axios'
import useWebSocket, { ReadyState } from 'react-use-websocket'

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
  const [socketUrl, setSocketUrl] = useState('ws://localhost:5001/homepage-websocket')
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl)

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState]
  
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



  return (
    // <div style={{ width: '100%', minHeight: '90vh' }} >
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', marginLeft: '10.25rem' }} >
      {/* <p id={styles['welcome']}>{'Welcome to Nodes EpsilonAI, '}<span id={styles['name']}>{user ? userInfo?.name || userInfo?.username || user?.email || 'Unknown User': 'Guest'}</span>!</p> */}
      <h2 className={styles['news-title']}>Today&apos;s Top News</h2>
      <div style={{ width: '100%', textAlign: 'left', display: 'grid', gridTemplateColumns: '3fr 1fr' }}>
        <div style={{ gridRow: '1', gridColumn: '1' }}>
          
          <div style={{ width: '97.5%', backgroundColor: '#aaa1', boxShadow: '0px 0px 2px 0px rgba(255, 255, 255, 0.90)', borderRadius: '1rem' }}>
            <h3  className={styles['news-sub-title']}>Pinned</h3>
            <TodayNews />
          </div>
          
          <div style={{ width: '97.5%', backgroundColor: '#aaa1', boxShadow: '0px 0px 2px 0px rgba(255, 255, 255, 0.90)', borderRadius: '1rem' }}>
            <h3  className={styles['news-sub-title']}>Milestones</h3>
            {/* <TodayNews /> */}
            <ul className={styles['news-ul']}>
          
              <li>Congratulations, <span>Eliott Harfouche</span>. You've hited 3 deck requests this week.</li>
              <li>Avivo has recieved 16 meetings request this month!</li>
              <li>Eliott Harfouche has 3 requests pending, please check your requests</li>
            </ul>
          </div>
        </div>
  
        <div style={{  gridRow: '1 / span 2', gridColumn: '2' }}>
          <div style={{ width: '97.5%', backgroundColor: '#aaa1', boxShadow: '0px 0px 2px 0px rgba(255, 255, 255, 0.90)', borderRadius: '1rem' }}>
            <h2 style={{ marginTop: '2.5rem' }} className={styles['news-title']}>Follow Ups</h2>
            <ul style={{maxHeight: '100rem'}} className={styles['news-ul']}>
              <li>Congratulations, <span>Eliott Harfouche</span>.  <span>Avivo</span> Deck this week - 2 whom you sourced this week.</li>
              <li><span>6</span> Funds are currently reviewing <span>Avivo</span> Deck this week - 2 whom you sourced this week.</li>
              <li><span>6</span> Funds are currently reviewing <span>Avivo</span> Deck this week - 2 whom you sourced this week.</li>
              <li>Congratulations, <span>Eliott Harfouche</span>.  <span>Avivo</span> Deck this week - 2 whom you sourced this week.</li>
              <li><span>6</span> Funds are currently reviewing <span>Avivo</span> Deck this week - 2 whom you sourced this week.</li>
              <li><span>6</span> Funds are currently reviewing <span>Avivo</span> Deck this week - 2 whom you sourced this week.</li>
              <li>Congratulations, <span>Eliott Harfouche</span>.  <span>Avivo</span> Deck this week - 2 whom you sourced this week.</li>
              <li><span>6</span> Funds are currently reviewing <span>Avivo</span> Deck this week - 2 whom you sourced this week.</li>
              <li><span>6</span> Funds are currently reviewing <span>Avivo</span> Deck this week - 2 whom you sourced this week.</li>
             
            </ul>
          </div>
          {/* <TodayNews /> */}

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