import styles from '../styles/profile.module.less'
import ActionButton from '../components/action-button'
import LocationIcon from '../assets/svgs/location.svg?react'
import DotCircleIcon from '../assets/svgs/dot-circle.svg?react'
import YCLogo from '../assets/images/yc_logo.png'
import VectorLogo from '../assets/svgs/vector.svg?react'
import { useState, useEffect, useRef } from 'react'
import { AsyncImage } from 'loadable-image'
import Skeleton from 'react-loading-skeleton'
import { useClientsStore, useFundsStore, useSavedFundsStore, useUserStore } from '../store/store'
import CancelButtonIcon from '../assets/svgs/cancel-button.svg?react'
import { STATUS_COLOR_LIST } from '../lib/constants'
import FundStatusLarger from '../components/status-larger'
import BookIcon from '../assets/images/book.png'
import toast from 'react-hot-toast'
import axios from 'axios'
import BackIcon from '../assets/images/back.png'
import { useNavigate } from 'react-router-dom'

export default function ClientProfile(): JSX.Element {
  // const { user, isLoading } = useAuth0()
  const [isLoading, setLoading] = useState(true)
  const [record, setRecord] = useState<object | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [isPopoverOpen, setPopoverOpen] = useState<boolean>(false)
  const [requestName, setRequestName] = useState<string | null>(null)
  const [approvers, setApprovers] = useState<string | null>(null)
  const [details, setDetails] = useState<string | null>(null)
  const [hislogs, setHisLogs] = useState<any[]>([])
  const [priority, setPriority] = useState<string>('')
  const [deal, setDeal] = useState<string>('')
  const [contactPerson, setContactPerson] = useState<string>('')
  const [selectedFundName, setSelectedFundName] = useState<string>('')
  const user = useUserStore(state => state.user)
  const navigate = useNavigate()
  const [showSavedCollections, setShowSavedCollections] = useState<boolean>(false)
  const [savedCollections, setSavedCollections] = useState<string[]>([])
  const [hoveredCollection, setHoveredCollection] = useState<string>('')
  const [changeToInput, setChangeToInput] = useState<boolean>(false)
  const newCollectionRef = useRef<HTMLInputElement>(null)

  function formatDate(timestamp) {
    const date = new Date(timestamp)
  
    let day = date.getDate()
    day = day < 10 ? '0' + day : day 
  
    let month = date.getMonth() + 1 
    month = month < 10 ? '0' + month : month 
  
    const year = date.getFullYear().toString().substr(-2)
  
    return `${day}/${month}/${year}`
  }
  
  const clients = useClientsStore(state => state.clients)
  const id = window.location.pathname.split('/')[2]
  localStorage.setItem('client-id', id)
  if (!id) {
    throw new Error('fund id not found')
  }
  
  useEffect(() => {
    const record = clients.filter((record) => record._id === id)[0]
    console.log(record)
    setSelectedFundName(record.Funds)
    async function fetchHistoricalLog() {
      try {
        const res = await fetch(`http://localhost:5001/gethislog/${record.Funds}`)
        const data = await res.json()
        console.log(data)
        setHisLogs(data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchHistoricalLog()
    setLocation(['hq location' ].reduce((acc, cur, curIndex, array) =>
      acc += record[cur] ? curIndex !== array.length - 1 ? record[cur] + ', ' : record[cur] : '', ''))
    setRecord(record)
    setTimeout(() => setLoading(false), 1000)
  }, [id])
  
  

  const handleAddToCollection = async () => {
    try {
      console.log(selectedFundName)
      const res = await axios.post('http://localhost:5001/savedcollections/add', {
        email: user?.email,
        collection: hoveredCollection,
        fund: selectedFundName,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (res.status === 200) {
        toast.success('Fund added to collection successfully!')
        setShowSavedCollections(false)
      } else if (res.status === 409) {
        toast.error('Fund already exists in this collection')
      }
    } catch (error) {
      toast.error(error?.response?.data)
    }
  }

  const handleCreateNewCollection = async () => {
    try {
      const res  = await axios.post('http://localhost:5001/savedcollections', {
        email: user?.email,
        savedcollection: newCollectionRef.current?.value as string,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (res.status === 200) {
        toast.success('Collection created successfully!')
        setSavedCollections([...savedCollections, newCollectionRef.current?.value as string])
        setChangeToInput(false)
      }
      
      else if (res.status === 409) {
        toast.error('Collection already exists')
      } 
      
    } catch (error) {
      toast.error(error?.response?.data)
    }
  }

  const addRequest = () => {
    setPopoverOpen(true)
  }

  const sendRequest = async (e) => {
    e.preventDefault()
    
    // Check if all required fields have been filled
    if (!requestName || !approvers || !deal || !contactPerson || !priority || !selectedFundName) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // console.log('executed')
      await axios.post('http://localhost:5001/sendRequest', {
        requestName,
        approvers,
        deal,
        contactPerson,
        priority,
        details,
        selectedFundName,
        email: user?.email,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      toast.success('Request sent successfully!')
      setPopoverOpen(false)
  
    } catch (error) {
      toast.error(error?.response?.data)
    }
  }

  useEffect(() => {
    const fetchSavedCollections = async () => {
      await axios.get('http://localhost:5001/savedcollections',  {
        params: {
          email: user?.email,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        setSavedCollections(res.data)
      }).catch((error) => {
        toast.error(error?.response?.data)
      })
    }
    fetchSavedCollections()
  }, [])

  return (
    <div 
      style={{ overflow: 'hidden', position: 'relative', gap: '3vh', display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', height: '90vh' }}>
      <div 
        onClick={() => navigate('/client-cards')}
        style={{ display: 'flex', gap: '1rem', alignItems: 'center', alignSelf: 'self-start', paddingTop: '3vh', marginLeft: '8vw' }}>
        <img
          
          className={styles['back-icon']} src={BackIcon} alt="" />
        <h3 className={styles['back-text']}>Return to Client Card Page</h3>
      </div>
      <div>
        <div style={{ display: 'flex'}}>
          <div className={styles['left-panel']}>
            {
              isLoading 
                ? 
                <Skeleton className={styles['venture-logo']}  />
                : 
                <div style={{ position: 'relative' }}>
                  <AsyncImage src={record.Logo ? record.Logo : ''} alt='' 
                    style={{  width: ' 20.57144rem', height: '20.47456rem', objectFit: 'contain', backgroundColor: '#999', 
                      border: '1px solid transparent', borderRadius: '0.5px',
                    }}

                    draggable='false' onContextMenu={e => e.preventDefault()} />
                  {/* <FundStatusLarger colorList={generateColorList(record['Contact'] ? (record['Contact'].split(',')).length : 0, record.Contact, record.Status)} /> */}
                </div>
            }
            <div className={styles['action-buttons']}>
              <ActionButton 
                onClick={() => alert('startup match')} 
                buttonClass={styles['action-button']} 
                textClass={styles['action-button-text']} 
                text='STARTUP MATCH' />

            </div>
            <div>
              <div className={styles['horizontal-flex-layout']} >
                <VectorLogo className={styles['vector-logo']} />
                <h2 className={styles['relationship-text']}>Relationships</h2>
                <VectorLogo className={styles['vector-logo']} />
              </div>
              <div className={styles['horizontal-flex-layout']}>
                {
                  isLoading 
                    ?
                    <>
                      <Skeleton className={styles['headImg']} />
                      <div className={`${styles['vertical-flex-align-flex-start-layout']}` } >
                        <Skeleton className={styles['relationship-inner-text']} />
                        <Skeleton className={styles['relationship-inner-text-action']} />
                      </div>
                      <Skeleton className={styles['headImg']}/>
                    </>  
                    :
                    <>
                      {
                        hislogs.length > 0
                          ?
                          <ul
                            style={{ listStyleType: 'none', color: '#9b93af', fontSize: '1.25rem',
                              padding: '0', margin: '0', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                          >
                            {
                              hislogs.map((log, i) => (
                                <li key={i}>
                                  <span>{log.Nodes ? log.Nodes : 'Someone'}</span>
                                  <span>{log.Contact}</span>
                                </li>
                              ))
    
                            }
                          </ul>
                          :
                          null
                      }
                    </>
                }     
              </div>
            
            </div>
          </div>
          <div className={styles['middle-panel']}>
            <div className={styles['name-layout']}>
              <div className={styles.name}>
                <span className={styles['partial-name']}>
                  {isLoading ? <Skeleton width={'20rem'} height={'3.5rem'} /> : record ? record['acronym'] as string : 'no name'}
                </span>
              </div>
              {/* {
              isLoading 
                ?
                <Skeleton className={styles['status-icon']} />
                : 
                <StatusIcon className={styles['status-icon']} />
            } */}
            </div>
            <div className={styles['description-layout']}>
              {
                isLoading ?
                  <span className={styles.description}>
              loading...
                  </span>
                  : 
                  record ? 
                    <span className={styles['description']}>{record['name']}</span>
                    : 'no description'
              }
            
              <span >|</span>
              <a className={styles['official-website']} href={record ? record['website'] as string : 'www.google.com'} target='_blank' rel="noreferrer">
                {isLoading ? 'loading...' : record ? record['website'] as string : 'no official website, please google it'}
              </a>
            </div>
            <div className={styles['location-layout']}>
              <LocationIcon className={styles['location-icon']} />
              <span className={styles['description']}>
                {
                  isLoading
                    ? 
                    <Skeleton className={styles['description']} width={'10rem'} />
                    : 
                    record 
                      ? 
                    location as string
                      : 'no location'
                }
              </span>
            </div>
            <div className={styles['detail-layout']}>
              <div className={styles['detail-divider-top']}></div>
              <p className={styles['detail-category']}>
                <span className={styles['detail-category-text']}>SECTOR</span>
                {
                  isLoading 
                    ?
                    <Skeleton className={styles['detail-category-text-2']} width={'30rem'} />
                    :
                    <span className={styles['detail-category-text-2']}>
                      {
                        record['sector'] ? (record['sector'] as string)
                          : 'No Sector Record'
                      }
                    </span>
                }
              </p>
              <div className={styles['detail-divider']}></div>
              <p className={styles['detail-category']}>
                <span className={styles['detail-category-text']}>DEAL TYPE</span>
                {
                  isLoading 
                    ?
                    <Skeleton className={styles['detail-category-text-2']} width={'10rem'} />
                    :
                    <span className={styles['detail-category-text-2']}>
                      {
                        record['deal_type'] ? (record['deal_type'] as string)
                          : 'No Deal Type Record'
                      }
                    </span>
                }
              </p>
              <div className={styles['detail-divider']}></div>
              <p className={styles['detail-category']}>
                <span className={styles['detail-category-text']}>DEAL SIZE</span>
                {
                  isLoading
                    ?
                    <Skeleton className={styles['detail-category-text-2']} width={'20rem'} />
                    : 
                    record['deal_size'] 
                      ?          
                      <span className={styles['detail-category-text-2']}>
                        {record['deal_size'] as string}
                      </span>
                      : 
                      <span className={styles['detail-category-text-2']}>
                      No Deals Found
                      </span>
                }
              </p>
              <div className={styles['detail-divider']}></div>
              <p className={styles['detail-category']}>
                <span className={styles['detail-category-text']}>TRANSACTION TYPE</span>
                {
                  isLoading
                    ?
                    <Skeleton className={styles['detail-category-text-2']} width={'15rem'} />
                    :
                    record['transaction_type'] 
                      ?          
                      <span className={styles['detail-category-text-2']}>
                        {record['transaction_type'] as string}
                      </span>
                      :
                      <span className={styles['detail-category-text-2']}>
                      Np Transcation Type Found
                      </span>
                }
              </p>
              <div className={styles['detail-divider']}></div>
              <p className={styles['detail-category']}>
                <span className={styles['detail-category-text']}>SHORT INFO</span>
                {
                  isLoading
                    ?
                    <Skeleton className={styles['detail-category-text-2']} width={'15rem'} />
                    :
                    <span style={{position: 'absolute', left: '20rem' }}>
                      {
                        record['short_info'] 
                          ? 
                          <span className={styles['book-wrapper']}>
                            <img src={BookIcon} className={styles['book-client-card-icon']} alt="" />
                            <span className={styles['book-client-card-tooltip']}>{record['short_info']}</span>
                          </span>
                          : 
                          <span style={{ color: '#fff' }} className={styles['detail-category-text']}>No</span>
                      }
                    </span>
                }
              </p>
            </div>
            <div className={styles['model-layout']}>
              <h2 className={styles.description}>Historical Log</h2>
  
              <div className={styles['historical-log-scrollbar-layout']} style={{ maxHeight: '30vh', overflow: 'auto' }}>
                <table style={{ textAlign: 'left' }}>
                  <thead>
                    {
                      isLoading 
                        ? 
                        <tr>
                          <th><Skeleton width={'10rem'} /></th>
                          <th><Skeleton width={'5rem'} /></th>
                          <th><Skeleton width={'5rem'} /></th>
                          <th><Skeleton width={'5rem'} /></th>
                          <th><Skeleton width={'5rem'} /></th>
                          <th><Skeleton width={'5rem'} /></th>
                          <th><Skeleton width={'3rem'} /></th>
                        </tr>
                        :
                      
                        hislogs.length > 0
                          ?
                          <tr>
                            <th>Date</th>
                            <th>Company</th>
                            <th>Account Manager</th>
                            <th>VC</th>
                            <th>VC Contact</th>
                            <th>Status</th>
                            <th>Comments</th>
                          </tr>
                          :
                          <h3>No log record</h3>
                    }
                  </thead>
                  <tbody>
                    {
                      isLoading 
                        ?
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i}>
                            <td><Skeleton width={'10rem'} /></td>
                            <td><Skeleton width={'5rem'} /></td>
                            <td><Skeleton width={'5rem'} /></td>
                            <td><Skeleton width={'5rem'} /></td>
                            <td><Skeleton width={'5rem'} /></td>
                            <td><Skeleton width={'5rem'} /></td>
                            <td><Skeleton width={'3rem'} /></td>
                          </tr>
                        ))
                        :
                        hislogs.map((log, i) => (
                          <tr key={i}>
                            <td>{formatDate(log.Date)}</td>
                            <td>{log.Client ? log.Client : 'No client record'}</td>
                            {/* <td>{log.current_stage ? log.current_stage : 'No stage record'}</td> */}
                            
                            {/* <td>{log.round_size ? log.round_size : 'No round size record'}</td> */}
                            {/* <td>{log.TotalRaised ? log.TotalRaised : 'No total raised record'}</td> */}
                            <td>{log.Nodes ? log.Nodes : 'No account manager record'}</td>
                            <td>{log.VC ? log.VC : 'No VC record'}</td>
                            <td>{log.Contact ? log.Contact : 'No contact record'}</td>
                            <td>{log.fundraising_pipeline_status ? log.fundraising_pipeline_status : 'No status record'}</td>
                            <td>{log.Coments 
                              ? 
                              <div className={styles['book-wrapper']}>
                                <img className={styles['book-icon']} src={BookIcon} />
                                <span className={styles['book-tooltip']}>{log.Coments}</span>
                              
                              </div>
                              : 
                              'No'
                            }</td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>

            </div>
          </div>
          <div className={styles['right-panel']}>      

          </div>

        </div>
      </div>
    </div>
  )
}