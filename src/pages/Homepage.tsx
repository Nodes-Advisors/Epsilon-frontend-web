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
import { useEffect, useState } from 'react'
import { useUserStore } from '../store/store'
import TodayNews from '../components/today-news'
import LiveUpdateIcon from '../assets/svgs/live-update.svg?react'
import LiveUpdate from '../components/live-update'
import Table from '../components/Table'
import axios from 'axios'

export default function Home() {
  
  const { isAuthenticated, user: auth0User, 
    logout, loginWithRedirect } = useAuth0()
  const setUser = useUserStore(state => state.setUser)
  const user = useUserStore(state => state.user)

  const [query, setQuery] = useState<string>('')
  const [data, setData] = useState<IDataItem[]>([])
  const [filteredData, setFilteredData] = useState<IDataItem[]>([])
  const [senders, setSenders] = useState<string[]>([])
  const [investorEmails, setInvestorEmails] = useState<string[]>([])
  const [deals, setDeals] = useState<string[]>([])

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

  const filterBySender = (sender: string) => {
    const filteredSender = data.filter(
      (item: IDataItem) => item.sender === sender,
    )
    setFilteredData(filteredSender)
  }

  const filterByInvestorEmail = (investors: string) => {
    const filteredInvestor = data.filter(
      (item: IDataItem) => item.isInvestorEmail.toString() === investors,
    )
    setFilteredData(filteredInvestor)
  }

  const filterByDeal = (deals: string) => {
    const filteredDeal = data.filter(
      (item: IDataItem) => item.project === deals,
    )
    setFilteredData(filteredDeal)
  }

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
    <section>
      <aside>
        <div>
          <EpsilonMiniLogo className={styles['epsilon-mini-logo']}/>
        </div>
        <HeadImgWrapper headImg={user?.picture ? user.picture : UserAvatar} status={user && user?.status ? user.status : 'not-login'} />

        <Divider height='0.1625rem' width='5.25rem' color='rgba(255, 255, 255, 0.6)'/>
        <nav>
          <NavWidget Svg={KPIDashIcon} width='3.125rem' height='2.44794rem' to='/kpidash' text= 'KPI Dash'/>
          <NavWidget Svg={FundCardIcon} width='3rem' height='3.22225rem' to='/fund-cards' text='Fund Card' />
          <NavWidget Svg={IntelligenceIcon} width='' height='3.125rem' to='/intelligence' text='Intelligence' />
        </nav>
        <GroupButtonIcon id={styles['group-button']} />
      </aside>
      <div className={styles['middle-panel']}>
        <p id={styles['welcome']}>Welcome Back to Nodes Epsilon, <span id={styles['name']}>{user ? user?.name || user?.nickname || user?.given_name || 'Guest': 'Guest'}</span>!</p>

        <SearchBar />

        <h2 className={styles['news-title']}>Today&apos;s Top News</h2>
        <TodayNews />
        <div className={styles['news-grid']}>
          {/* <div className={styles['news-grid-item']}>ACCOUNT MANAGER</div>
          <div>Eliott Harfouche, Tyler Aroner</div>
          <div className={styles['news-grid-item']}>SWEET SPOT</div>
          <div>$140M  |  (1592 Total Deals)</div> */}
        </div>
        <h2 className={styles['news-title']}>Today&apos;s Feed</h2>
        <TodayNews />
        <div className={styles['live-update-layout']}>
          <h2 className={styles['news-title']}>Live update</h2>
          <LiveUpdateIcon className={styles['live-update-icon']} />
        </div>
        <LiveUpdate />


        <div className="app">
          {/* Side bar buttons for selecting senders */}
          {/* <div className="sidebar">
            {senders.map(sender => (
              <button key={sender} onClick={() => filterBySender(sender)}>
                {sender}
              </button>
            ))}
          </div> */}

          {/* Side bar buttons for selecting investor emails (true / false)  */}
          <div className="sidebar">
            {investorEmails.map((investors) => (
              <button
                key={investors}
                onClick={() => filterByInvestorEmail(investors)}
              >
                {investors}
              </button>
            ))}
          </div>

          {/* Side bar buttons for selecting deals */}
          <div className="sidebar">
            {deals != null &&
              deals.map((deal) => (
                <button key={deal} onClick={() => filterByDeal(deal)}>
                  {deal}
                </button>
              ))
            }
            
          </div> 

          {/* Search bar and display info table */}
          <div className="main-content">
            <input
              className="search"
              placeholder="Search..."
              onChange={(e) => setQuery(e.target.value.toLowerCase())}
            />
            <Table data={filteredData} />
          </div>
        </div>

        <div style={{ position: 'absolute', right: 0, top: 0 }}>
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
        </div>
      </div>
      
      

    </section>
  )
}