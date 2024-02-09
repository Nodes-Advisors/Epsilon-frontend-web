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
      <p id={styles['welcome']}>{'Welcome to Nodes EpsilonAI, '}<span id={styles['name']}>{user ? userInfo?.name || userInfo?.username || user?.email || 'Unknown User': 'Guest'}</span>!</p>
      {/* <SearchBar /> */}

      <div style={{ gridRow: '1', gridColumn: '1', width: '100%', textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <h2 className={styles['news-title']}>Today&apos;s Top News</h2>
          <h3 className={styles['news-sub-title']}>Pinned</h3>
          <TodayNews />
          <h3 className={styles['news-sub-title']}>Milestones</h3>
          <TodayNews />
        </div>
  
        <div style={{  gridRow: '1 / span 2' }}>
          <h2 className={styles['news-title']}>Follow Ups</h2>
          <TodayNews />
          <TodayNews />
          <TodayNews />
          <TodayNews />
          <TodayNews />
          <TodayNews />
          <TodayNews />

        </div>

        <div style={{ gridRow: '2', gridColumn: '1' }}>
          <div className={styles['live-update-layout']}>
            <h2 className={styles['news-title']}>Live update</h2>
            <div className={styles['live-update-icon']} />
          </div>
          <LiveUpdate user={userInfo}/>
        </div>
      </div>
      

    </div> 
      

  // </div>
  )
}