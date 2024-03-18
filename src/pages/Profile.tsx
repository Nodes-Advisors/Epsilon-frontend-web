import styles from '../styles/profile.module.less'
import ActionButton from '../components/action-button'
import LocationIcon from '../assets/svgs/location.svg?react'
import DotCircleIcon from '../assets/svgs/dot-circle.svg?react'
import YCLogo from '../assets/images/yc_logo.png'
import VectorLogo from '../assets/svgs/vector.svg?react'
import React, { useState, useEffect, useRef, useContext } from 'react'
import { AsyncImage } from 'loadable-image'
import Skeleton from 'react-loading-skeleton'
import { useFundsStore, useSavedFundsStore, useTokenStore, useUserStore } from '../store/store'
import CancelButtonIcon from '../assets/svgs/cancel-button.svg?react'
import { STATUS_COLOR_LIST } from '../lib/constants'
import FundStatusLarger from '../components/status-larger'
import BookIcon from '../assets/images/book.png'
import toast from 'react-hot-toast'
import axios from 'axios'
import BackIcon from '../assets/images/back.png'
import { useNavigate } from 'react-router-dom'
import WebSocketContext from '../websocket/WebsocketContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTags,
  faBook,
  faMagnifyingGlassDollar,
  faDownLeftAndUpRightToCenter,
  faUpRightAndDownLeftFromCenter
} from '@fortawesome/free-solid-svg-icons'
import {handleFullTextFilter} from "../lib/utils";


export default function Profile(): JSX.Element {
  // const { user, isLoading } = useAuth0()
  const [isLoading, setLoading] = useState(true)
  const [record, setRecord] = useState<object | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [isPopoverOpen, setPopoverOpen] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [requestName, setRequestName] = useState<string | null>(null)
  const [approvers, setApprovers] = useState<string | null>(null)
  const [details, setDetails] = useState<string | null>(null)
  const [hislogs, setHisLogs] = useState<any[]>([])
  const savedFunds = useSavedFundsStore(state => state.savedFunds)
  const deleteSavedFund = useSavedFundsStore(state => state.deleteSavedFund)
  const addSavedFund = useSavedFundsStore(state => state.addSavedFund)
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
  const [nodesTeam, setNodesTeam] = useState<any[]>([])
  const token = useTokenStore(state => state.token)
  const { sendMessage, lastMessage, connectionStatus } = useContext(WebSocketContext)
  const [switchTab,setSwitchTab]= useState<'Historical Log' | 'Active Funds' >('Historical Log')
  const [rowStates, setRowStates] = useState({});

  function formatDate(timestamp) {
    const date = new Date(timestamp)
  
    let day = date.getDate()
    day = day < 10 ? '0' + day : day 
  
    let month = date.getMonth() + 1 
    month = month < 10 ? '0' + month : month 
  
    const year = date.getFullYear().toString().substr(-2)
  
    return `${day}/${month}/${year}`
  }

  const toggleRow = (index) => {
    setRowStates(prevState => {
      const newState = { ...prevState };
      newState[index] = !newState[index]; // Toggle the state or set to true if not present
      return newState;
    });
  };
  
  const funds = useFundsStore(state => state.funds)
  const id = window.location.pathname.split('/')[2]
  localStorage.setItem('fund-id', id)
  if (!id) {
    throw new Error('fund id not found')
  }
  
  useEffect(() => {
    const record = funds.filter((record) => record._id === id)[0]
    // console.log(record)
    setSelectedFundName(record.Funds)
    async function fetchHistoricalLog() {
      try {
        const record = funds.filter((record) => record._id === id)[0]
        const res = await axios.get(`http://localhost:5001/gethislog/${record.Funds}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
            'email': user?.email,
          },
        })
        const data = res.data
        console.log(data)
        setHisLogs(data)
      } catch (error) {
        console.error(error)
      }
    }
    if (token) {
      fetchHistoricalLog()
      
    }
    setLocation(['HQ Country' ].reduce((acc, cur, curIndex, array) =>
      acc += record[cur] ? curIndex !== array.length - 1 ? record[cur] + ', ' : record[cur] : '', ''))
    setRecord(record)
    setTimeout(() => setLoading(false), 1000)
  }, [id, token])
  
  const generateColorList = (length, contact, status) => {
    // console.log(length)
    if (status.toUpperCase() === 'AVAILABLE') return ['#009900']
    // else if (status === 'Busy') return ['#009900']
    // else if (status === 'New Fund') return ['blue']
    else if (status === 'Unresponsive') return ['orange']
    else if (status === 'New Fund') return ['blue']

    if (length !== status.split(',').length) {
      return ['#990000', '#009900']
    } else return ['#990000']
  }

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
          'Authorization': token,
          'email': user?.email,
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
          'Authorization': token,
          'email': user?.email,
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
      const randomId = Math.random().toString(36).substring(7)
      const currentTime = new Date()
      await axios.post('http://localhost:5001/sendRequest', {
        requestName,
        approvers,
        deal,
        contactPerson,
        priority,
        details,
        selectedFundName,
        email: user?.email,
        requestId: randomId,
        time: currentTime,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'email': user?.email,
        },
      })
      toast.success('Request sent successfully!')

      const messageObject = {
        type: 'approval request',
        sendEmail: user?.email,
        receiveName: approvers,
        fundName: selectedFundName,
        priority: priority,
        details: details,
        contactPerson: contactPerson,
        deal: deal,
        requestName: requestName,
        requestId: randomId,
        time: currentTime,
      }
      sendMessage(JSON.stringify(messageObject))
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
          'Authorization': token,
          'email': user?.email,
        },
      }).then((res) => {
        setSavedCollections(res.data)
      }).catch((error) => {
        toast.error(error?.response?.data)
      })
    }
    if (token) fetchSavedCollections()
  }, [token])

  useEffect(() => {
    const fetchNodesTeam = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`http://localhost:5001/getNodesProfileImage`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
            'email': user?.email,
          },
        })
        if (res.status === 200) {
          setLoading(false)
          setNodesTeam(res.data)
          // console.log(res.data)
        }
      } catch (error) {
        setLoading(false)
        console.error(error)
      }
    }
    if (token) fetchNodesTeam()
    
  }, [token])

  // Function to handle sector click
  const handleSectorClick = (sector: string) => {
    // Retrieve existing filter from localStorage
    const redirectionUrl = `/fund-cards`;
    const existingFilter = localStorage.getItem('filter');
    let updatedFilter;

    if (existingFilter) {
      // Parse existing filter from localStorage
      updatedFilter = JSON.parse(existingFilter);
      // Update 'Sector' filter
      updatedFilter['Sector'] = [sector];
    } else {
      // If no existing filter, initialize with empty values for other filters
      updatedFilter = {
        '': [],
        'Account Manager': [],
        'Deals': [],
        'Investors': [],
        'Location': [],
        'Status': [],
        'Type': [],
        'Contact': [],
        'Suitability Score': [],
        'Co-Investors': [],
        'Sector': [sector], // Update 'Sector' filter
        'Clear Filters': [],
        'Responsiveness Rate': [],
      };
    }
    // Store updated filter in localStorage
    localStorage.setItem('filter', JSON.stringify(updatedFilter));
    navigate(redirectionUrl);
  };


  const getImage = (name: string | undefined | null) => {
    if (name) {
      // console.log(name)
      // console.log(nodesTeam)
      const found = nodesTeam.find(item => item.name && item.name.includes(name))
      // console.log(found)
      if (found) {
        // console.log(found.profile_image)
        return found.profile_image
      } else {
        return ''
      }
    }
    return ''
  }

  return (
    <div 
      style={{ overflow: 'hidden', position: 'relative', gap: '3vh', display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', height: '90vh' }}>
      <div 
        onClick={() => navigate('/fund-cards')}
        style={{ display: 'flex', gap: '1rem', alignItems: 'center', alignSelf: 'self-start', paddingTop: '3vh', marginLeft: '8vw' }}>
        <img
          
          className={styles['back-icon']} src={BackIcon} alt="" />
      </div>
      <div style={{position:"absolute",left:'10rem',top:'8rem'}}>
        <div style={{ display: 'flex'}}>
          <div className={styles['left-panel']}>
            {
              isLoading 
                ? 
                <Skeleton className={styles['venture-logo']}  />
                : 
                <div style={{ position: 'relative' }}>
                  <AsyncImage src={record.Logo ? record.Logo : ''} alt=''
                    style={{  width: ' 15rem', height: '15rem', objectFit: 'contain', backgroundColor: '#999',
                      border: '1px solid transparent', borderRadius: '0.5px',
                    }}

                    draggable='false' onContextMenu={e => e.preventDefault()} />
                  <FundStatusLarger colorList={generateColorList(record['Contact'] ? (record['Contact'].split(',')).length : 0, record.Contact, record.Status)} />
                </div>
            }
            <div className={styles['action-buttons']}>
              <ActionButton 
                onClick={() => alert('startup match')} 
                buttonClass={styles['action-button']} 
                textClass={styles['action-button-text']} 
                text='STARTUP MATCH' />
              <ActionButton
                onClick={addRequest}
                buttonClass={styles['action-button']} 
                textClass={styles['action-button-text']} 
                text='ADD A REQUEST' />
              <ActionButton
                onClick={() => setShowSavedCollections(true)}
                buttonClass={styles['action-button']} 
                textClass={styles['action-button-text']} 
                text= {'ADD TO LIST'} />
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
                            className={styles['relationship-list']}
                            style={{ listStyleType: 'none', color: '#9b93af', fontSize: '1.25rem',
                              height: '20vh', overflowY: 'auto', overflowX: 'hidden',
                              paddingRight: '4rem', margin: '0', display: 'flex', flexDirection: 'column', gap: '4rem' }}
                          >
                            {
                              hislogs
                                .filter((log, index, self) =>
                                  index === self.findIndex((l) => l.Nodes === log.Nodes && l.Contact === log.Contact),
                                )
                                .map((log, i) => (
                                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', position: 'relative' }}>
                                      <AsyncImage src={getImage(log.Nodes)} alt="" className={styles['headImg']} />
                                      <span style={{ position: 'absolute', top: '4rem', textWrap: 'wrap', width: '10rem' }}>{log.Nodes ? log.Nodes : 'Someone@Nodes'}</span>
                                    </div>
                                  
                                    <div style={{ width: '5rem', height: '0.1px', backgroundColor: '#fff' }}></div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', position: 'relative' }}>
                                      <AsyncImage src={getImage(log.Contact)} alt="" className={styles['headImg']} />
                                      <span style={{ position: 'absolute', top: '4rem', textWrap: 'wrap', width: '10rem' }}>{log.Contact ? log.Contact : 'Someone@This Fund'}</span>
                                    </div>
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
                  {isLoading ? <Skeleton width={'20rem'} height={'3.5rem'} /> : record ? record['Funds'] as string : 'no name'}
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
                    <span className={styles['description']}>{record['Type']}</span>
                    : 'no description'
              }
            
              <span >|</span>
              <a className={styles['official-website']} href={record ? record['Website Link'] as string : 'www.google.com'} target='_blank' rel="noreferrer">
                {isLoading ? 'loading...' : record ? record['Website Link'] as string : 'no official website, please google it'}
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
                <span className={styles['detail-category-text']}>INDUSTRY CODE</span>
                {
                  isLoading 
                    ?
                    <Skeleton className={styles['detail-category-text-2']} width={'30rem'} />
                    :
                    <span className={styles['detail-category-text-2']}>
                      {
                        record['Sector'] ? (record['Sector'] as string)
                          : 'no industry code'
                      }
                    </span>
                }
              </p>
              <div className={styles['detail-divider']}></div>
              <p className={styles['detail-category']}>
                <span className={styles['detail-category-text']}>CURRENT FUND SIZE</span>
                {
                  isLoading 
                    ?
                    <Skeleton className={styles['detail-category-text-2']} width={'10rem'} />
                    :
                    <span className={styles['detail-category-text-2']} style={{ color: '#fff4' }}>currently unavailable</span>
                }
              </p>
              <div className={styles['detail-divider']}></div>
              <p className={styles['detail-category']}>
                <span className={styles['detail-category-text']}>DEALS</span>
                {
                  isLoading
                    ?
                    <Skeleton className={styles['detail-category-text-2']} width={'20rem'} />
                    : 
                    record['Past Deals'] 
                      ?          
                      <span className={styles['detail-category-text-2']}>
                        {record['Past Deals'] as string}
                      </span>
                      : 
                      <span className={styles['detail-category-text-2']}>
                      No Deals Found
                      </span>
                }
              </p>
              <div className={styles['detail-divider']}></div>
              <p className={styles['detail-category']}>
                <span className={styles['detail-category-text']}>CONTACT</span>
                {
                  isLoading
                    ?
                    <Skeleton className={styles['detail-category-text-2']} width={'15rem'} />
                    :
                    record['Contact'] 
                      ?          
                      <span className={styles['detail-category-text-2']}>
                        {record['Contact'] as string}
                      </span>
                      :
                      <span className={styles['detail-category-text-2']}>
                      Np Contact Found
                      </span>
                }
              </p>
              <div className={styles['detail-divider']}></div>
              <p className={styles['detail-category']}>
                <span className={styles['detail-category-text']}>SWEET SPOT</span>
                {
                  isLoading
                    ?
                    <Skeleton className={styles['detail-category-text-2']} width={'15rem'} />
                    :
                    <span className={styles['detail-category-text-2']}  style={{ color: '#fff4' }}>currently unavailable</span>
                }
              </p>
            </div>
            <div className={styles['model-layout']}>
              <div style={{display:'flex', height:'2rem'}}>
                <div onClick={() => setSwitchTab('Historical Log')} style={{display:'flex',alignItems:'center',background: switchTab === 'Historical Log' ? '#3A3A65' : '#1E2351',padding:'1.2rem',border:'grey',borderTopLeftRadius:'0.6rem',borderTopRightRadius:'0.6rem'}}>
                  <span><FontAwesomeIcon icon={faBook} className={styles.tagdescription} style={{ color: switchTab === 'Approval Request' ? '#FFF' : '#DDD'}}/></span>
                  <span className={styles.tagdescription}
                        style={{ marginLeft:'0.4rem', color: switchTab === 'Historical Log' ? '#FFF' : '#DDD', cursor: 'pointer', fontWeight:  switchTab === 'Historical Log' ? 700 : 400 }}>Historical Log</span>
                </div>
                <div onClick={() => setSwitchTab('Active Funds')} style={{display:'flex',alignItems:'center',background: switchTab === 'Active Funds' ? '#3A3A65' : '#1E2351',padding:'1.2rem',border:'grey',borderTopLeftRadius:'0.6rem',borderTopRightRadius:'0.6rem'}}>
                  <span><FontAwesomeIcon icon={faMagnifyingGlassDollar} className={styles.tagdescription} style={{ color: switchTab === 'Active Funds' ? '#FFF' : '#DDD'}}/></span>
                  <span className={styles.tagdescription}
                        style={{ marginLeft:'0.4rem', color: switchTab === 'Active Funds' ? '#FFF' : '#DDD', cursor: 'pointer', fontWeight:  switchTab === 'Active Funds' ? 700 : 400 }}>Active Deals</span>
                </div>
              </div>
              <div className={styles['historical-log-scrollbar-layout']} style={{ maxHeight: '30vh', overflow: 'auto',width:'100%' }}>
                <table style={{ textAlign: 'left', tableLayout: 'fixed', overflowX: "hidden", width: '100%' }}>
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
                        </tr>
                        :
                      
                        hislogs.length > 0
                          ?
                          <tr>
                            <th>Date</th>
                            <th>Company</th>
                            <th>Account Manager</th>
                            <th>VC Contact</th>
                            <th>Status</th>
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
                          </tr>
                        ))
                        :
                        hislogs.map((log, i) => (
                          <React.Fragment key={i}>
                            <tr>
                              <td className={log.Coments ? styles['logContentWithComment'] : ''}>{formatDate(log.Date)}</td>
                              <td className={log.Coments ? styles['logContentWithComment'] : ''}>{log.Client ? log.Client : 'No client record'}</td>
                              <td className={log.Coments ? styles['logContentWithComment'] : ''}>{log.Nodes ? log.Nodes : 'No account manager record'}</td>
                              <td className={log.Coments ? styles['logContentWithComment'] : ''}>{log.Contact ? log.Contact : 'No contact record'}</td>
                              <td className={log.Coments ? styles['logContentWithComment'] : ''}>{log.fundraising_pipeline_status ? log.fundraising_pipeline_status : 'No status record'}</td>
                            </tr>
                            { !rowStates[i] && log.Coments && (
                              <tr >
                                <td className={styles['logrow']} colSpan="5" >
                                  <div style={{ position: 'relative' }}>
                                    <div className={styles['logContent']}>
                                    <span >{log.Coments}</span>
                                    </div>
                                    <FontAwesomeIcon
                                      className={styles['fonticon-button']}
                                      style={{ position: 'absolute', right: '0rem', top: '50%', transform: 'translateY(-50%)', marginRight: '1rem' }}
                                      onClick={() => toggleRow(i)} // Use index variable i for toggleRow
                                      icon={faUpRightAndDownLeftFromCenter} // faUpRightAndDownLeftFromCenter Use index variable i for accessing rowStates
                                    />
                                  </div>
                                </td>
                              </tr>
                            )}
                            { rowStates[i] && log.Coments && (
                              <tr >
                                <td className={styles['logrow']} colSpan="5" >
                                  <div style={{ position: 'relative' }}>
                                    <div className={styles['logFullContent']}>
                                      <span >{log.Coments}</span>
                                    </div>
                                    <FontAwesomeIcon
                                      style={{ position: 'absolute', right: '0rem', top: '50%', transform: 'translateY(-50%)', marginRight: '1rem' }}
                                      onClick={() => toggleRow(i)} // Use index variable i for toggleRow
                                      icon={faDownLeftAndUpRightToCenter} // faUpRightAndDownLeftFromCenter Use index variable i for accessing rowStates
                                    />
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                    }
                  </tbody>
                </table>
              </div>

            </div>
          </div>
          <div style={{width:'20%'}} className={styles['right-panel']}>
        
            <div className={styles['investor-title-layout']}>
              <DotCircleIcon className={styles['dot-circle-investor-icon']} />
              <span className={styles['investor-title-text']}>TOP Co-Investors</span>
            </div>
            {
              isLoading 
                ? 
                (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className={styles['investor-layout']}>
      
              
                      <Skeleton className={styles['investor-logo']} />
                      <div className={styles['investor-text']}>
                        <Skeleton className={styles['investor-name']} width={'7rem'} height={'1rem'} />

                        <Skeleton className={styles['stage-info']} width={'5rem'} height={'1rem'} />
                      </div>
                    </div>
                  ))
                )

                :

                record['Co-Investors'] && (record['Co-Investors'] as string).length > 0
                  ? (
                record['Co-Investors'] as string).split(',').map((investor: string) => {
                    investor = investor.trim();
                    const investorRegex = new RegExp(investor, 'i');
                    const relatedFund = funds.filter((fund) => investorRegex.test(fund['Funds']));
                    console.log(investor)
                    let redirectedId = undefined
                    if (relatedFund.length > 0) {
                      redirectedId = relatedFund[0]['_id']
                    }
                    return (
                      <div key={investor} className={styles['investor-layout']}>

                        <div
          
                          className={styles['investor-text']}>
                          <span 
                            onClick={() => {
                              if (redirectedId) {
                                localStorage.setItem('fund-id', redirectedId)
                                navigate(`/fund-card/${redirectedId}`)
                              }
                      
                            }}
                            className={redirectedId ? styles['investor-name-click'] : styles['investor-name']}>{investor}</span>
                          {/* <br />
                    <span className={styles['stage-info']}>{record['']}</span> */}
                        </div>

                      </div>
                    )}
                   
                    ,
                  )
                  : 'no co-investors'
            }
            <div className={styles['investor-title-layout']}>
              <FontAwesomeIcon style={{fontSize:'1.4rem'}} icon={faTags} />
              <span className={styles['investor-title-text']}>Sectors</span>
            </div>
            {record && record['Sector'] && (
              <div style={{ marginTop:'-1rem',marginBottom: '10px',width:'95%' }}> {/* Add margin bottom */}
                {record['Sector'].split(',').map((sector, index) => (
                  <div className={styles['sector-button-redirect']} key={index} onClick={() => handleSectorClick(sector.trim())}>
                    {sector.trim()} {/* trim() removes any leading or trailing spaces */}
                  </div>
                ))}
                {record['Sector'].split(',').length > 3 && <div style={{ display: 'inline-block', marginRight: '5px' }}>...</div>} {/* Display ellipsis if there are more than three tags */}
              </div>
            )}





          </div>


        </div>
        <div className={styles['popover-background']} style={{ visibility: isPopoverOpen ? 'visible' : 'hidden' }}>
          <div className={styles['popover-form']}>
            <form 
              onSubmit={sendRequest}
              style={{ margin: '2.5rem 2.5rem 0 2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem'  }}>
              <div className={styles['popover-form-title']}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', position: 'relative' }}>

                  <div>
                    <span style={{ textAlign: 'start', display: 'block' }}>Regarding <span style={{ fontWeight: '700', fontSize: '1.3rem' }}>{record ? record['Funds'] as string : 'no name'}</span></span>
                    <span style={{ textAlign: 'start', display: 'block' }}>Create a new request</span>
                  </div>
                </div>
                <CancelButtonIcon className={styles['cancelbutton']} onClick={() => setPopoverOpen(false)} />
              </div>
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Type of Request</span>
                <select
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem', marginTop: '1rem' }} name="Type of Request" id="">
                  <option value={''} disabled selected>Please select</option>
                  <option value="bypass approval">Bypass the approval</option>
                  <option value="assign the fund request to">Assign the fund request to</option>
                </select>
              </div>
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Assignees</span>
                <select
                  value={approvers}
                  onChange={(e) => setApprovers(e.target.value)}
                  style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem 0.5rem', marginTop: '1rem' }} name="Assignees" id="">
                  <option value={''} disabled selected>Please select</option>
                  <option value="Tyler Aroner">Tyler Aroner</option>
                  <option value="Eliott Harfouche">Eliott Harfouche</option>
                  <option value="Iman Ghavami">Iman Ghavami</option>

                </select>
              </div>
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Type of Deal</span>
                <select
                  value={deal}
                  onChange={(e) => setDeal(e.target.value)}
                  style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem 0.5rem', marginTop: '1rem' }} name="Type of Deal" id="">
                  <option value={''} disabled selected>Please select</option>
                  {
                    localStorage.getItem('deals') && localStorage.getItem('deals') !== ''
                      ? JSON.parse(localStorage.getItem('deals')).map((deal) => (
                        <option key={deal} value={deal}>{deal}</option>
                      ))
                      :
                      record && record['Past Deals'] 
                        ? 
                        record['Past Deals'].split(',').map((deal) => (
                          <option key={deal} value={deal}>{deal}</option>
                        ))
                        :
                        <option value="No Deals Found">No Deals Found</option>
                  }
                </select>
              </div>
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Contact Person</span>
                <select
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem 0.5rem', marginTop: '1rem' }} name="Contact" id="">
                  <option value={''} disabled selected>Please select</option>
                  {
                    record && record['Contact'] 
                      ?
                      record['Contact'].split(',').map((contact) => (
                        <option key={contact} value={contact}>{contact}</option>
                      ))
                      :
                      null
                  }
                  <option value="Not Referring Anyone">Not Referring Anyone</option>
                </select>
              </div>
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Priority</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem 0.5rem', marginTop: '1rem' }} name="Priority" id="">
                  <option value={''} disabled selected>Please select</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Additional details</span>
                <textarea style={{ marginTop: '1rem', color: '#000', padding: '0.5rem 0 0.5rem 0.5rem', fontSize: '1.25rem', background: '#eee', border: 'none', outline: 'none', minWidth: '100%', maxWidth: '100%', height: '5rem',
                  borderBottom: details && details !== '' ? 'blue 1px solid' : 'transparent 1px solid' }}
                onChange={(e) => setDetails(e.target.value)}
                placeholder='If needed, add some extra info that will help recipients learn more about the request' />

              </div>
              <button>send</button>
            </form>
          </div>
        </div>
        <div className={styles['popover-background']} style={{ visibility: showSavedCollections ? 'visible' : 'hidden' }}>
          <div className={styles['popover-form']} style={{ width: '20rem', height: '30rem' }}>
            <div
          
            >
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-around',   
                alignItems: 'center', padding: '1rem' }}>
                        
                <span style={{ display: 'block', fontWeight: '700', fontSize: '1.5rem' }}>Save the fund to</span>
                <CancelButtonIcon className={styles['cancelbutton']} onClick={() => setShowSavedCollections(false)} />
              </div>
            
              <ul style={{ listStyleType: 'none', margin: 0, display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                {
                  savedCollections.map((collection) => (
                    <li key={collection} style={{  display: 'flex', gap: '0.2rem' }}>
                      <span 
                        onClick={() => { setHoveredCollection(collection) }}
                        className={styles['collection-li-item']}
                        style={{ alignItems: 'center', padding: '0.5rem', background: collection === hoveredCollection ? 'orange' : 'lightblue',
                          fontWeight: '700', fontSize: '1.2rem', width: '60%', borderRadius: '0.5rem' }}>
                        <span>{collection}</span>
                      </span>
                      {
                        collection === hoveredCollection &&
                      <button 
                        onClick={handleAddToCollection}
                        style={{ padding: '0.3rem', backgroundColor: 'black', color: '#fff', border: 'none', borderRadius: '0.5rem' }}>Confirm</button>
                      }
                    </li>
                  ))
                }
                <li style={{ fontWeight: '700', fontSize: '1.2rem' }}>
                  {
                    !changeToInput
                      ?
                      <button 
                        onClick={() => setChangeToInput(true)}
                        style={{ padding: '0.5rem', backgroundColor: 'black', color: '#fff', border: 'none', borderRadius: '0.5rem' }}>Add a new list</button>
                      :
                      <div>
                        <input type="text" 
                          style={{ borderRadius: '0.5rem', padding: '0.5rem', fontSize: '1.2rem', width: '60%' }}
                          onBlur={() => {
                            if (!newCollectionRef.current?.value || newCollectionRef.current?.value === '') {
                              setChangeToInput(false)
                            }
                          }} autoFocus ref={newCollectionRef} />
                        <div style={{ marginTop: '1rem' }}>
                          <button
                            style={{ padding: '0.5rem', borderRadius: '0.5rem', marginRight: '0.5rem'}}
                            onClick={handleCreateNewCollection}
                          >Confirm
                          </button>
                          <button
                            style={{ padding: '0.5rem', borderRadius: '0.5rem' }}
                            onClick={() => setChangeToInput(false)}
                          >Cancel
                          </button>
                        </div>
                      </div>
                  }
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}