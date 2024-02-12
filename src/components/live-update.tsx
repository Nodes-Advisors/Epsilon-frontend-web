import { memo, useEffect, useRef, useState } from 'react'
import styles from '../styles/home.module.less'
import Skeleton from 'react-loading-skeleton'
import GPTdata from './GPTdata'
import axios from 'axios'
import { AsyncImage } from 'loadable-image'

function LiveUpdate({user}: {user: any}) {
  const [isLoading, setLoading] = useState(true)
  const [focused, setFocused] = useState<'all' | 'you'>('all')
  const [data, setData] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const [showPopupAM, setShowPopupAM] = useState(false)
  const [popupPosition, setShowPopupPosition] = useState({x: 0, y: 0})
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)
  const [hoveredName, setHoveredName] = useState('')
  const [page, setPage] = useState(1)
  const [hoveredData, setHoveredData] = useState([])
  // const [isAccoundHolder, setIsAccountHolder] = useState(false)
  const messagesEndRef = useRef(null)
  const [isScolled, setIsScrolled] = useState<boolean>(false)
  const loader = useRef(null)
  const [currentScrollHeight, setCurrentScrollHeight] = useState(0)
  useEffect(() => {
    if (!isScolled && messagesEndRef.current && messagesEndRef.current.scrollHeight && messagesEndRef.current.scrollHeight !== 0) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight
      setIsScrolled(true)
    }
  }, [data, focused])

  useEffect(() => {
    const fetchCompanyData = async() => {
      const res = await axios.get(`http://localhost:5001/fundrisingpipeline`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (res.status === 200) {
        setLoading(false)
        setHoveredData(res.data)
      }
    }
    fetchCompanyData()
  }, [])

  useEffect(() => {
    const fetchCompanyData = async() => {
      const res = await axios.get(`http://localhost:5001/fundrisingpipeline?page=${page}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (res.status === 200) {
        setLoading(false)
        setData(data => [...res.data.reverse(), ...data])
      }
    }
    fetchCompanyData()
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollTo({
          top: messagesEndRef.current.scrollHeight - currentScrollHeight,
          behavior: 'smooth',
        })
      }
    }, 1000)
  }, [page])


  const handleNextPage = () => {
    setCurrentScrollHeight(messagesEndRef.current.scrollHeight)
    setPage(page + 1)
  }


  const handleMouseOver = (e: React.MouseEvent<HTMLSpanElement>) => {
    setShowPopupAM(false)
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    // console.log(e.currentTarget.innerText)
    const name = e.currentTarget.innerText
    const rect = e.currentTarget.getBoundingClientRect()
    const width = e.currentTarget.offsetWidth
    const height = e.currentTarget.offsetHeight
    const timeout = setTimeout(() => {
      // console.log(rect.left, rect.top, width, height)
      setShowPopupPosition({x: rect.left + width / 2 - 120, y: rect.top + height / 2 + 120})
      setShowPopup(true)
      setHoveredName(name)
    }, 500)
    setHoverTimeout(timeout)
  }

  const handleMouseOverAM = (e: React.MouseEvent<HTMLSpanElement>) => {
    setShowPopup(false)
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    // console.log(e.currentTarget.innerText)
    const name = e.currentTarget.innerText
    const rect = e.currentTarget.getBoundingClientRect()
    const width = e.currentTarget.offsetWidth
    const height = e.currentTarget.offsetHeight
    const timeout = setTimeout(() => {
      setShowPopupPosition({x: rect.left + width / 2 - 120, y: rect.top + height / 2 + 90})
      setShowPopupAM(true)
      setHoveredName(name)
    }, 500)
    setHoverTimeout(timeout)
  }
  
  const handleMouseOut = () => {
    
    if (hoverTimeout) {
      // console.log('clear hover timeout')
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
      
    }
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
    
    // setShowPopup(false)
  }

  const formatDate = (utcTimestamp: number): string => {
    const date = new Date(utcTimestamp)
    const now = new Date()
  
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const monthsOfYear = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  
    const day = date.getDate()
    const dayOfWeek = daysOfWeek[date.getDay()]
    const month = monthsOfYear[date.getMonth()]
    const year = date.getFullYear()
    const hour = ('0' + date.getHours()).slice(-2) // Add leading zero if needed
    const min = ('0' + date.getMinutes()).slice(-2) // Add leading zero if needed
  
    if (now.getFullYear() === year) {
      if (now.getDate() === day && now.getMonth() === date.getMonth()) {
        return `Today ${hour}:${min}`
      } else if (now.getDate() - 1 === day && now.getMonth() === date.getMonth()) {
        return `Yesterday ${hour}:${min}`
      } else if (now.getDate() - day <= 7 && now.getMonth() === date.getMonth()) {
        return `${dayOfWeek} ${hour}:${min}`
      } else {
        return `${day}/${month} ${hour}:${min}`
      }
    } else {
      return `${day}/${month}/${year.toString().slice(-2)} ${hour}:${min}`
    }
  }

  const getFilter = (item: any) => {
    if (focused === 'all') {
      return true
    } else if (focused === 'you') {

      const accountHolderUpper = item.account_holder.toUpperCase()
      const values = [user?.name, user?.username, user?.email].map(v => v?.toUpperCase() || '')
      // console.log(accountHolderUpper)
      const includesCheck = values.some(value => 
        accountHolderUpper.includes(value) || value.includes(accountHolderUpper),
      )
      return includesCheck
    }
  }

  const getDateDiff = (inputDate: Date): string => {
    const today = new Date()
    const input = new Date(inputDate)
    const diffTime = Math.abs(today.getTime() - input.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 
  
    if (diffDays <= 1) {
      return 'today'
    } else if (diffDays <= 7) {
      return 'this week'
    } else if (diffDays <= 14) {
      return 'two weeks ago'
    } else if (diffDays <= 30) {
      return 'last month'
    } else if (diffDays <= 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''} ago`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} year${years > 1 ? 's' : ''} ago`
    }
  }

  return (
    <div style={{ width: '100%', padding: '1rem' }}>
      <div className={styles['live-update-button-layout']}>
        <button
          className={
            focused === 'all'
              ? styles['live-update-option-button-highlighted']
              : styles['live-update-option-button']
          }
          onClick={() => {
            setFocused('all')
            setLoading(false)
          }}
        >
          All
        </button>
        <button
          className={
            focused === 'you'
              ? styles['live-update-option-button-highlighted']
              : styles['live-update-option-button']
          }
          onClick={() => {
            setFocused('you')
            setLoading(false)
          }}
        >
          You
        </button>
      </div>
      {isLoading 
        ?
        (
          <div>
            <ul className={styles['new-ul-skeleton']}>
              {Array.from({ length: 3 }).map((_, index) => {
                return (
                  <li key={index}>
                    <Skeleton duration={2.0} />
                  </li>
                )
              })}
            </ul>
          </div>
        ) 
        :
        
        (
          <ul ref={messagesEndRef} className={styles['news-ul']}>
            <li style={{ alignSelf: 'center' }}>
              <button onClick={handleNextPage}>Load more...</button>
            </li>

            {
              data.filter(item => getFilter(item)).map((item: any) => {
                return (
                  <>
                  
                    <li key={item.id} style={{ display: 'flex', alignItems: 'center' }}>

                      <AsyncImage
                        src=''
                        style={{ width: '3rem', height: '3rem', borderRadius: '50%', marginRight: '1rem' }}
                      /> 
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}> 
                          <span style={{ fontSize: '1rem', color: '#aaa' }}>{item.account_holder}</span>
                          <span style={{ fontSize: '1rem', color: '#aaa' }}>{formatDate(item.last_updated_status_date)}</span>
                        </div>
                        <div style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', backgroundColor: '#9993' }}>
                          { item.contacted === 1 && item.pass_contacted === 0 && item.deck_request === 0
                        && <>
                          <span 
                            onMouseEnter={handleMouseOverAM}
                            onMouseLeave={handleMouseOut}
                            className={styles['account_holder']}>{item.account_holder}</span> 
                          <span>{' contacted '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'Someone'}</span> 
                          <span>{' at '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span>
                          <span>{' for '}</span>
                          <span 
                            onMouseEnter={handleMouseOver}
                            onMouseLeave={handleMouseOut}
                            className={styles['company-manager']}>{item.company_name}</span>
                        </>
                          }
                          { item.contacted === 1 && item.pass_contacted === 1 && item.deck_request === 0
                        && <>
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'Someone'}</span> 
                          <span>{' from '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span> 
                          <span>{' passed on '}</span>
                          {/* this should be deal name  */}
                          <span 
                            onMouseEnter={handleMouseOver}
                            onMouseLeave={handleMouseOut}
                            className={styles['company-manager']}>{item.company_name}</span>
                          <span>{' after initial pitch'}</span>
                          
                        </>
                          }
                          { item.contacted === 1 && item.pass_contacted === 0 && item.deck_request === 1
                        && item.pass_deck === 0 &&  item.meeting_request === 0 
                        && item.pass_meeting === 0 && item.dd === 0 && item.pass_dd === 0
                        &&
                        <>
                          {/* [person at a fund] from [Fund Name] requested the [company] deck  */}
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'Someone'}</span> 
                          <span>{' from '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span> 
                          <span>{' requested the '}</span>
                         
                          <span
                            onMouseEnter={handleMouseOver}
                            onMouseLeave={handleMouseOut}
                            className={styles['company-manager']}>{item.company_name}</span>
                          <span>{' deck'}</span>
                          
                        </>
                          } 
                          { item.contacted === 1 && item.pass_contacted === 0 && item.deck_request === 1
                        && item.pass_deck === 1 && 
                        <>
                          {/* [person at a fund] from [Fund Name] passed on [Company Name] after reviewing the deck */}
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'Someone'}</span> 
                          <span>{' from '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span> 
                          <span>{' passed on '}</span>
                     
                          <span 
                            onMouseEnter={handleMouseOver}
                            onMouseLeave={handleMouseOut}
                            className={styles['company-manager']}>{item.company_name}</span>
                          <span>{' after reviewing the deck'}</span>
                        </>
                          } 
                          { item.contacted === 1 && item.pass_contacted === 0 && item.deck_request === 1
                        && item.pass_deck === 0 && item.meeting_request === 1 && item.pass_meeting === 0
                        && item.dd === 0 && item.pass_dd === 0 &&
                        <>
                          {/* [person at a fund] from [Fund Name] requested a [company name] meeting  - (user) */}
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'Someone'}</span> 
                          <span>{' from '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span> 
                          <span>{' requested a '}</span>
             
                          <span
                            onMouseEnter={handleMouseOver}
                            onMouseLeave={handleMouseOut}
                            className={styles['company-manager']}>{item.company_name}</span>
                          <span>{' meeting - '}</span>
                          <span 
                            onMouseEnter={handleMouseOverAM}
                            onMouseLeave={handleMouseOut}
                            className={styles['account_holder']}>{item.account_holder}</span>
                        </>
                          } 
                          { item.contacted === 1 && item.pass_contacted === 0 && item.deck_request === 1
                        && item.pass_deck === 0 && item.meeting_request === 1 && item.pass_meeting === 1
                        && item.dd === 0 && item.pass_dd === 0 &&
                        <>
                          {/* [person at a fund] from [Fund Name] passed on [Company Name] after a meeting  */}
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'Someone'}</span> 
                          <span>{' from '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span> 
                          <span>{' passed on '}</span>
             
                          <span
                            onMouseEnter={handleMouseOver}
                            onMouseLeave={handleMouseOut}
                            className={styles['company-manager']}>{item.company_name}</span>
                          <span>{' after a meeting'}</span>
                        </>
                          } 
                          { item.contacted === 1 && item.pass_contacted === 0 && item.deck_request === 1
                        && item.pass_deck === 0 && item.meeting_request === 1 && item.pass_meeting === 0
                        && item.dd === 1 && item.pass_dd === 0 &&
                        <>
                          {/* [Fund Name] entered in dd phase on [Company Name] */}
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span> 
                          <span>{' entered in dd phase on '}</span>
                          <span 
                            onMouseEnter={handleMouseOver}
                            onMouseLeave={handleMouseOut}
                            className={styles['company-manager']}>{item.company_name}</span>

                        </>
                          } 
                        </div>
                      </div>
                    </li>
                  </>
                
                )
              })
            }
            {showPopupAM && 
            <div 
              onMouseLeave={() => {
                if (hoverTimeout) {
                  clearTimeout(hoverTimeout)
                  setHoverTimeout(null)
                }
              
                const timeout = setTimeout(() => {
                  setShowPopupAM(false)
                }, 200)
                setHideTimeout(timeout)
              }}
              style={{ 
                backdropFilter: 'blur(25px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                transition: 'all 0.5s ease',
                zIndex: 10, 
                position: 'absolute', 
                gap: '1rem',
                top: popupPosition.y, left: popupPosition.x, 
                width: '25rem', height: '15rem', 
                background: '#fff1', borderRadius: '0.5rem' }}>
              <div style={{ color: '#fff', marginLeft: '5%', width: '90%', display: 'flex', gap: '2rem', marginTop: '2rem', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 500, whiteSpace: 'wrap' }}>{hoveredName}</span>
              </div>
              <div style={{ width: '90%', height: '0.5px', backgroundColor: '#eee' }}></div>
              <div style={{ justifyItems: 'start', alignItems: 'center', width: '90%', marginLeft: '5%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem'}}>
                <span style={{   fontSize: '1.1rem', fontWeight: 500, whiteSpace: 'wrap' }}>Contacted</span>
                <span style={{ color: '#754DCA', fontSize: '1.5rem', fontWeight: 500, whiteSpace: 'wrap' }}>{hoveredData.filter(item => item?.company_name === hoveredName)
                  .reduce((sum, item) => sum + item?.contacted, 0)}</span>
                <span style={{  fontSize: '1.1rem', fontWeight: 500, whiteSpace: 'wrap' }}>Deck Requests</span>
                <span style={{ color: '#754DCA', fontSize: '1.5rem', fontWeight: 500, whiteSpace: 'wrap' }}>{hoveredData.filter(item => item?.company_name === hoveredName)
                  .reduce((sum, item) => sum + item?.deck_request, 0)}</span>
                <span style={{  fontSize: '1.1rem', fontWeight: 500, whiteSpace: 'wrap' }}>Meeting Requests</span>
                <span style={{ color: '#754DCA', fontSize: '1.5rem', fontWeight: 500, whiteSpace: 'wrap' }}>{hoveredData.filter(item => item?.company_name === hoveredName)
                  .reduce((sum, item) => sum + item?.meeting_request, 0)}</span>
                <span style={{  fontSize: '1.1rem', fontWeight: 500, whiteSpace: 'wrap' }}>DD</span>
                <span style={{ color: '#754DCA', fontSize: '1.5rem', fontWeight: 500, whiteSpace: 'wrap' }}>{hoveredData.filter(item => item?.company_name === hoveredName)
                  .reduce((sum, item) => sum + item?.dd, 0)}</span>
              </div>
            </div>
            }

            {showPopup && (
              <div 
                onMouseLeave={() => {
                  if (hoverTimeout) {
                    clearTimeout(hoverTimeout)
                    setHoverTimeout(null)
                  }
              
                  const timeout = setTimeout(() => {
                    setShowPopup(false)
                  }, 200)
                  setHideTimeout(timeout)
                }}
                style={{ 
                  backdropFilter: 'blur(25px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  transition: 'all 0.5s ease',
                  zIndex: 10, 
                  position: 'absolute', 
                  gap: '1rem',
                  top: popupPosition.y, left: popupPosition.x, 
                  width: '25rem', height: '30rem', 
                  background: '#fff1', borderRadius: '0.5rem' }}>
                <div style={{ color: '#fff', marginLeft: '5%', width: '90%', display: 'flex', gap: '2rem', marginTop: '2rem', alignItems: 'center', justifyContent: 'center' }}>
                  {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'pink', width: '4rem', height: '4rem', borderRadius: '50%' }}>
                  <h2 style={{ color: '#111', fontSize: '2rem' }}>{hoveredName ? hoveredName[0] : 'U'}</h2>
                </div> */}
                  <span style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 500, whiteSpace: 'wrap' }}>{hoveredName}</span>
                </div>
                <div style={{ width: '90%', height: '0.5px', backgroundColor: '#eee' }}></div>
                <div style={{ justifyItems: 'start', alignItems: 'center', width: '90%', marginLeft: '5%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem'}}>
                  <span style={{   fontSize: '1.1rem', fontWeight: 500, whiteSpace: 'wrap' }}>Contacted</span>
                  <span style={{ color: '#754DCA', fontSize: '1.5rem', fontWeight: 500, whiteSpace: 'wrap' }}>{hoveredData.filter(item => item?.company_name === hoveredName)
                    .reduce((sum, item) => sum + item?.contacted, 0)}</span>
                  <span style={{  fontSize: '1.1rem', fontWeight: 500, whiteSpace: 'wrap' }}>Deck Requests</span>
                  <span style={{ color: '#754DCA', fontSize: '1.5rem', fontWeight: 500, whiteSpace: 'wrap' }}>{hoveredData.filter(item => item?.company_name === hoveredName)
                    .reduce((sum, item) => sum + item?.deck_request, 0)}</span>
                  <span style={{  fontSize: '1.1rem', fontWeight: 500, whiteSpace: 'wrap' }}>Meeting Requests</span>
                  <span style={{ color: '#754DCA', fontSize: '1.5rem', fontWeight: 500, whiteSpace: 'wrap' }}>{hoveredData.filter(item => item?.company_name === hoveredName)
                    .reduce((sum, item) => sum + item?.meeting_request, 0)}</span>
                  <span style={{  fontSize: '1.1rem', fontWeight: 500, whiteSpace: 'wrap' }}>DD</span>
                  <span style={{ color: '#754DCA', fontSize: '1.5rem', fontWeight: 500, whiteSpace: 'wrap' }}>{hoveredData.filter(item => item?.company_name === hoveredName)
                    .reduce((sum, item) => sum + item?.dd, 0)}</span>
                </div>
                {
                  <>
                    <div style={{ width: '90%', height: '0.5px', backgroundColor: '#eee' }}></div>
                    <ul className={styles['contact-list-scroll']} style={{ textAlign: 'left', padding: '0 3% 3% 0', width: '80%', 
                      maxHeight: '40%', overflow: 'auto', color: '#111',
                    }}>
                      {
                        hoveredData.filter(item => item?.company_name === hoveredName).map(item => {
                          return (
                            <li key={item.id} style={{ padding: '0.5rem', color: '#eee' }}>
                            
                              <span style={{ color: 'violet' }}>{getDateDiff(item.last_updated_status_date)}</span>
                              {' - '}
                       
                              { item.contacted === 1 && item.pass_contacted === 0 && item.deck_request === 0
                        && <>
                          <span
                            // onMouseEnter={handleMouseOver}
                            // onMouseLeave={handleMouseOut}
                            className={styles['account_holder']}>{item.account_holder}</span> 
                          <span>{' contacted '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'Someone'}</span> 
                          <span>{' at '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span>
                          <span>{' for '}</span>
                          <span className={styles['company-manager']}>{item.company_name}</span>
                        </>
                              }
                              { item.contacted === 1 && item.pass_contacted === 1 && item.deck_request === 0
                        && <>
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'Someone'}</span> 
                          <span>{' from '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span> 
                          <span>{' passed on '}</span>
                          {/* this should be deal name  */}
                          <span className={styles['company-manager']}>{item.company_name}</span>
                          <span>{' after initial pitch'}</span>
                          
                        </>
                              }
                              { item.contacted === 1 && item.pass_contacted === 0 && item.deck_request === 1
                        && item.pass_deck === 0 &&  item.meeting_request === 0 
                        && item.pass_meeting === 0 && item.dd === 0 && item.pass_dd === 0
                        &&
                        <>
                          {/* [person at a fund] from [Fund Name] requested the [company] deck  */}
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'Someone'}</span> 
                          <span>{' from '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span> 
                          <span>{' requested the '}</span>
                         
                          <span className={styles['company-manager']}>{item.company_name}</span>
                          <span>{' deck'}</span>
                          
                        </>
                              } 
                              { item.contacted === 1 && item.pass_contacted === 0 && item.deck_request === 1
                        && item.pass_deck === 1 && 
                        <>
                          {/* [person at a fund] from [Fund Name] passed on [Company Name] after reviewing the deck */}
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'Someone'}</span> 
                          <span>{' from '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span> 
                          <span>{' passed on '}</span>
                     
                          <span className={styles['company-manager']}>{item.company_name}</span>
                          <span>{' after reviewing the deck'}</span>
                        </>
                              } 
                              { item.contacted === 1 && item.pass_contacted === 0 && item.deck_request === 1
                        && item.pass_deck === 0 && item.meeting_request === 1 && item.pass_meeting === 0
                        && item.dd === 0 && item.pass_dd === 0 &&
                        <>
                          {/* [person at a fund] from [Fund Name] requested a [company name] meeting  - (user) */}
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'Someone'}</span> 
                          <span>{' from '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span> 
                          <span>{' requested a '}</span>
             
                          <span className={styles['company-manager']}>{item.company_name}</span>
                          <span>{' meeting - '}</span>
                          <span 
                            // onMouseEnter={handleMouseOver}
                            // onMouseLeave={handleMouseOut}
                            className={styles['account_holder']}>{item.account_holder}</span>
                        </>
                              } 
                              { item.contacted === 1 && item.pass_contacted === 0 && item.deck_request === 1
                        && item.pass_deck === 0 && item.meeting_request === 1 && item.pass_meeting === 1
                        && item.dd === 0 && item.pass_dd === 0 &&
                        <>
                          {/* [person at a fund] from [Fund Name] passed on [Company Name] after a meeting  */}
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'Someone'}</span> 
                          <span>{' from '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span> 
                          <span>{' passed on '}</span>
             
                          <span className={styles['company-manager']}>{item.company_name}</span>
                          <span>{' after a meeting'}</span>
                        </>
                              } 
                              { item.contacted === 1 && item.pass_contacted === 0 && item.deck_request === 1
                        && item.pass_deck === 0 && item.meeting_request === 1 && item.pass_meeting === 0
                        && item.dd === 1 && item.pass_dd === 0 &&
                        <>
                          {/* [Fund Name] entered in dd phase on [Company Name] */}
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span> 
                          <span>{' entered in dd phase on '}</span>
                          <span className={styles['company-manager']}>{item.company_name}</span>

                        </>
                              } 
                            </li>
                          )})
                      }
                    </ul>
                  </>
                
                }
              </div>
            )}
          </ul>
        ) 
      }
    </div>
  )
}

const MemoizedLiveUpdate = memo(LiveUpdate)
export default MemoizedLiveUpdate
