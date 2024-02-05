import { memo, useEffect, useState } from 'react'
import styles from '../styles/home.module.less'
import Skeleton from 'react-loading-skeleton'
import GPTdata from './GPTdata'
import axios from 'axios'


function LiveUpdate() {
  const [isLoading, setLoading] = useState(true)
  const [focused, setFocused] = useState<'all' | 'you'>('all')
  const [data, setData] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const [popupPosition, setShowPopupPosition] = useState({x: 0, y: 0})
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)
  const [hoveredName, setHoveredName] = useState('')
  const [page, setPage] = useState(1)
  const [hoveredData, setHoveredData] = useState([])
  const [isAccoundHolder, setIsAccountHolder] = useState(false)

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
        setData(data => [...data, ...res.data])
      }
    }
    fetchCompanyData()
  }, [page])

  const handleNextPage = () => {
    setPage(page + 1)
  }

  const handleMouseOver = (e: React.MouseEvent<HTMLSpanElement>) => {
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
      setShowPopupPosition({x: rect.left + width / 2 - 120, y: rect.top + height / 2 - 200})
      setShowPopup(true)
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
    <div style={{ width: '100%', height: '100%' }}>
      <div className={styles['live-update-button-layout']}>
        <button
          className={
            focused === 'all'
              ? styles['live-update-option-button-highlighted']
              : styles['live-update-option-button']
          }
          onClick={() => {
            setFocused('all')
            setLoading(true)
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
            setLoading(true)
          }}
        >
          You
        </button>
      </div>
      {isLoading ? (
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
      ) : focused === 'all' ? (
        <ul style={{ width: '100%' }} className={styles['news-ul']}>
          {
            data.map((item: any) => {
              return (
                <>
                  <li key={item.id}>
                    <span style={{ color: 'violet' }}>{getDateDiff(item.last_updated_status_date)}</span>
                    {' - '}
                        
                    { item.contacted === 1 && item.pass_contacted === 0 && item.deck_request === 0
                        && <>
                          <span 
                            onMouseEnter={handleMouseOver}
                            onMouseLeave={handleMouseOut}
                            className={styles['account_holder']}>{item.account_holder}</span> 
                          <span>{' contacted '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'someone'}</span> 
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
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'someone'}</span> 
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
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'someone'}</span> 
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
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'someone'}</span> 
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
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'someone'}</span> 
                          <span>{' from '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span> 
                          <span>{' requested a '}</span>
             
                          <span
                            onMouseEnter={handleMouseOver}
                            onMouseLeave={handleMouseOut}
                            className={styles['company-manager']}>{item.company_name}</span>
                          <span>{' meeting - '}</span>
                          <span 
                            onMouseEnter={handleMouseOver}
                            onMouseLeave={handleMouseOut}
                            className={styles['account_holder']}>{item.account_holder}</span>
                        </>
                    } 
                    { item.contacted === 1 && item.pass_contacted === 0 && item.deck_request === 1
                        && item.pass_deck === 0 && item.meeting_request === 1 && item.pass_meeting === 1
                        && item.dd === 0 && item.pass_dd === 0 &&
                        <>
                          {/* [person at a fund] from [Fund Name] passed on [Company Name] after a meeting  */}
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'someone'}</span> 
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
                  </li>
                </>
                
              )
            })
          }
          <li style={{ alignSelf: 'center' }}>
            <button onClick={handleNextPage}>Load more...</button>
          </li>
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
                width: '25rem', height: isAccoundHolder ? '15rem' : '30rem', 
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
                !isAccoundHolder &&
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
                            onMouseEnter={handleMouseOver}
                            onMouseLeave={handleMouseOut}
                            className={styles['account_holder']}>{item.account_holder}</span> 
                          <span>{' contacted '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'someone'}</span> 
                          <span>{' at '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span>
                          <span>{' for '}</span>
                          <span className={styles['company-manager']}>{item.company_name}</span>
                        </>
                            }
                            { item.contacted === 1 && item.pass_contacted === 1 && item.deck_request === 0
                        && <>
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'someone'}</span> 
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
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'someone'}</span> 
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
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'someone'}</span> 
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
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'someone'}</span> 
                          <span>{' from '}</span>
                          <span style={{ color: '#fff' }}>{item.LP_pitched}</span> 
                          <span>{' requested a '}</span>
             
                          <span className={styles['company-manager']}>{item.company_name}</span>
                          <span>{' meeting - '}</span>
                          <span 
                            onMouseEnter={handleMouseOver}
                            onMouseLeave={handleMouseOut}
                            className={styles['account_holder']}>{item.account_holder}</span>
                        </>
                            } 
                            { item.contacted === 1 && item.pass_contacted === 0 && item.deck_request === 1
                        && item.pass_deck === 0 && item.meeting_request === 1 && item.pass_meeting === 1
                        && item.dd === 0 && item.pass_dd === 0 &&
                        <>
                          {/* [person at a fund] from [Fund Name] passed on [Company Name] after a meeting  */}
                          <span style={{ color: '#fff' }}>{item.LP_contact_pitched ? item.LP_contact_pitched : 'someone'}</span> 
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
      ) : (
        <ul className={styles['news-ul']}>
          <li>
            Digitalis Ventures passed on Avivo - Tyler. Here’s why :”Hi
            Tyler,Thank you for reaching out. While this is an interesting
            approach, it is not a good fit for us. There is a fair amount of
            biological risk delivering GLP1-R through gene therapy, and the
            effort is still early. We&apos;d love to hear more as they advance
            the program!”
          </li>
          <li>
            <span>6</span> Funds are currently reviewing <span>Avivo</span> Deck
            this week - 2 whom you sourced this week.
          </li>
        </ul>
      )}
    </div>
  )
}

const MemoizedLiveUpdate = memo(LiveUpdate)
export default MemoizedLiveUpdate
