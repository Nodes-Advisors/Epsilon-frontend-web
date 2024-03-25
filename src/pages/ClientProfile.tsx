import styles from '../styles/profile.module.less'
import ActionButton from '../components/action-button'
import LocationIcon from '../assets/svgs/location.svg?react'
import DotCircleIcon from '../assets/svgs/dot-circle.svg?react'
import YCLogo from '../assets/images/yc_logo.png'
import VectorLogo from '../assets/svgs/vector.svg?react'
import React, { useState, useEffect, useRef } from 'react'
import { AsyncImage } from 'loadable-image'
import Skeleton from 'react-loading-skeleton'
import { useClientsStore, useFundsStore, useSavedFundsStore, useTokenStore, useUserStore } from '../store/store'
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
  const [activePipeline, setActivePipeline] = useState<any[]>([])
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

  useEffect(() => {
    const fetchCompanyData = async() => {
      const res = await axios.get(`http://localhost:5001/fundrisingpipeline`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'email': user?.email,
        },
      })
      if (res.status === 200) {
        setLoading(false)
        //setPipeline(res.data)
        localStorage.setItem('pipelineData', JSON.stringify(res.data));
      }
    }

    const filterPipelineByConditions = (record) => {
      const storedPipelineData = JSON.parse(localStorage.getItem('pipelineData')) || [];

      const filteredPipeline = storedPipelineData.filter(item => {
        const acronymMatch = record && record.acronym ? item.company_acronym?.toLowerCase() === record.acronym.toLowerCase() : false;
        const statusConditions = [
          item.pass_contacted === 0,
          item.pass_deck === 0,
          item.pass_meeting === 0,
          item.current_status !== "pass",
          item.pass_dd === 0,
          item.deck_request === 1 || item.meeting_request === 1 || item.dd === 1
        ];

        return acronymMatch && statusConditions.some(condition => condition);
      }).sort((a, b) => {
        return new Date(b.last_updated_status_date).getTime() - new Date(a.last_updated_status_date).getTime();
      });

      setActivePipeline(filteredPipeline); // Set the filtered pipeline objects in the state
    };

    fetchCompanyData();
    const record = clients.filter((record) => record._id === id)[0];
    filterPipelineByConditions(record);
  }, [])

  const emailToNameMap = new Map([
    ['aroner@nodesadvisors.com', 'Tyler Aroner'],
    ['ghavami@nodesadvisors.com', 'Iman Ghavami'],
    ['harfouche@nodesadvisors.com', 'Eliott Harfouche']
  ]);

  const token = useTokenStore(state => state.token)
  // const user = useUserStore(state => state.user)
  const clients = useClientsStore(state => state.clients)
  const id = window.location.pathname.split('/')[2]
  localStorage.setItem('client-id', id)
  if (!id) {
    throw new Error('fund id not found')
  }

  const toggleRow = (index) => {
    setRowStates(prevState => {
      const newState = { ...prevState };
      newState[index] = !newState[index]; // Toggle the state or set to true if not present
      return newState;
    });
  };
  
  useEffect(() => {
    const record = clients.filter((record) => record._id === id)[0]
    // console.log(record)
    async function fetchHistoricalLog() {
      try {
        const res = await axios.get(`http://localhost:5001/getclienthislog/${record.acronym}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token,
              'email': user?.email,
            },
          }
        )
        const data = await res.data
        // console.log(data)
        setHisLogs(data)
      } catch (error) {
        console.log(error)
      }
    }
    if (token) fetchHistoricalLog()
    setLocation(['hq location' ].reduce((acc, cur, curIndex, array) =>
      acc += record[cur] ? curIndex !== array.length - 1 ? record[cur] + ', ' : record[cur] : '', ''))
    setRecord(record)
    setTimeout(() => setLoading(false), 1000)
  }, [id, token])
  

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

  const getFirstSentence = (info) => {
    // Split the info into words
    const words = info.split(' ');
    // Take the first 10 words
    const firstTenWords = words.slice(0, 30);
    // Join the first 10 words back into a string
    const firstTenWordsString = firstTenWords.join(' ');
    return firstTenWordsString;
  };


  return (
    <div 
      style={{ overflow: 'hidden', position: 'relative', gap: '3vh', display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', height: '90vh' }}>
      <div 
        onClick={() => navigate('/client-cards')}
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
                  <AsyncImage src={record.logo ? record.logo : ''} alt=''
                    style={{  width: ' 15rem', height: '15rem', objectFit: 'contain', backgroundColor: '#999',
                      border: '1px solid transparent', borderRadius: '0.5px',
                    }}

                    draggable='false' onContextMenu={e => e.preventDefault()} />
                  {/* <FundStatusLarger colorList={generateColorList(record['Contact'] ? (record['Contact'].split(',')).length : 0, record.Contact, record.Status)} /> */}
                </div>
            }
    
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
                                      <AsyncImage 
                                        onClick={() => {
                                          if (log.Nodes) {
                                            navigate(`/user-profile/${log.Nodes.split(' ').join('-')}`)
                                        
                                          }
                                        }}
                                        src={getImage(log.Nodes)} alt="" className={styles['headImg']} />

                                      <span style={{  cursor: 'pointer', position: 'absolute', top: '4rem', textWrap: 'wrap', width: '10rem' }}>{log.Nodes ? log.Nodes : 'Someone@Nodes'}</span>
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
                            <div className={styles['book-text-2']} style={{left:"0",width:"40rem"}}>
                              {getFirstSentence(record['short_info'] )}
                            </div>
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
              <div style={{display:'flex', height:'2rem'}}>
                <div onClick={() => setSwitchTab('Historical Log')} style={{display:'flex',alignItems:'center',background: switchTab === 'Historical Log' ? '#3A3A65' : '#1E2351',padding:'1.2rem',border:'grey',borderTopLeftRadius:'0.6rem',borderTopRightRadius:'0.6rem'}}>
                  <span><FontAwesomeIcon icon={faBook} className={styles.tagdescription} style={{ color: switchTab === 'Approval Request' ? '#FFF' : '#DDD'}}/></span>
                  <span className={styles.tagdescription}
                        style={{ marginLeft:'0.4rem', color: switchTab === 'Historical Log' ? '#FFF' : '#DDD', cursor: 'pointer', fontWeight:  switchTab === 'Historical Log' ? 700 : 400 }}>Historical Log</span>
                </div>
                <div onClick={() => setSwitchTab('Active Funds')} style={{display:'flex',alignItems:'center',background: switchTab === 'Active Funds' ? '#3A3A65' : '#1E2351',padding:'1.2rem',border:'grey',borderTopLeftRadius:'0.6rem',borderTopRightRadius:'0.6rem'}}>
                  <span><FontAwesomeIcon icon={faMagnifyingGlassDollar} className={styles.tagdescription} style={{ color: switchTab === 'Active Funds' ? '#FFF' : '#DDD'}}/></span>
                  <span className={styles.tagdescription}
                        style={{ marginLeft:'0.4rem', color: switchTab === 'Active Funds' ? '#FFF' : '#DDD', cursor: 'pointer', fontWeight:  switchTab === 'Active Funds' ? 700 : 400 }}>Active Funds</span>
                </div>
              </div>
              {switchTab === 'Historical Log' && (
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
                            <th>Account Manager</th>
                            <th>VC</th>
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
                            <td className={log.Coments ? styles['logContentWithComment'] : ''}>{log.Nodes ? log.Nodes : 'No account manager record'}</td>
                            <td className={log.Coments ? styles['logContentWithComment'] : ''}>{log.VC ? log.VC : 'No VC record'}</td>
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
              </div> )}
              {switchTab === 'Active Funds' && (
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

                        activePipeline.length > 0
                          ?
                          <tr>
                            <th>Date</th>
                            <th>Account Manager</th>
                            <th>VC</th>
                            <th>VC Contact</th>
                            <th>Status</th>
                          </tr>
                          :
                          <h3>No active funds</h3>
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
                        activePipeline.map((log, i) => (

                          <React.Fragment key={i}>
                            <tr>
                              <td className={log.Coments ? styles['logContentWithComment'] : ''}>{formatDate(log.last_updated_status_date)}</td>
                              <td className={log.Coments ? styles['logContentWithComment'] : ''}>{log.account_holder ? log.account_holder : 'No account manager record'}</td>
                              <td className={log.Coments ? styles['logContentWithComment'] : ''}>{log.LP_pitched ? log.LP_pitched : 'No VC record'}</td>
                              <td className={log.Coments ? styles['logContentWithComment'] : ''}>{log.LP_contact_pitched ? log.LP_contact_pitched : 'No contact record'}</td>
                              <td className={log.Coments ? styles['logContentWithComment'] : ''}>{log.current_status ? log.current_status : 'No status record'}</td>
                            </tr>
                            { !rowStates[i] && log.reason_of_passing && (
                              <tr >
                                <td className={styles['logrow']} colSpan="5" >
                                  <div style={{ position: 'relative' }}>
                                    <div className={styles['logContent']}>
                                      <span >{log.reason_of_passing}</span>
                                    </div>
                                    <FontAwesomeIcon
                                      style={{ position: 'absolute', right: '0rem', top: '50%', transform: 'translateY(-50%)', marginRight: '1rem' }}
                                      onClick={() => toggleRow(i)} // Use index variable i for toggleRow
                                      icon={faUpRightAndDownLeftFromCenter} // faUpRightAndDownLeftFromCenter Use index variable i for accessing rowStates
                                    />
                                  </div>
                                </td>
                              </tr>
                            )}
                            { rowStates[i] && log.reason_of_passing && (
                              <tr >
                                <td className={styles['logrow']} colSpan="5" >
                                  <div style={{ position: 'relative' }}>
                                    <div className={styles['logFullContent']}>
                                      <span >{log.reason_of_passing}</span>
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
              )}

            </div>
          </div>
          <div style={{width:'20%'}} className={styles['right-panel']}>
        
            <div className={styles['investor-title-layout']}>
              <DotCircleIcon className={styles['dot-circle-investor-icon']} />
              <span className={styles['investor-title-text']}>COMMON PASSES</span>
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
                    const relatedFund = funds.filter((fund) => fund['Funds'] === investor)
                    let imgUrl = undefined
                    let redirectedId = undefined
                    if (relatedFund.length > 0) {
                      imgUrl = relatedFund[0]['logo']
                      redirectedId = relatedFund[0]['_id']
                    }
                    return (
                      <div key={investor} className={styles['investor-layout']}>

                        <img src={imgUrl ? imgUrl : YCLogo} alt='' className={styles['investor-logo']} />
                        <div 
          
                          className={styles['investor-text']}>
                          <span className={redirectedId ? styles['investor-name-click'] : styles['investor-name']}>
                            {investor}
                          </span>
                        </div>

                      </div>
                    )}
                   
                    ,
                  )
                  : 'no common passes'
            }

            <div className={styles['investor-title-layout']}>
              <FontAwesomeIcon style={{fontSize:'1.4rem'}} icon={faTags} />
              <span className={styles['investor-title-text']}>Sectors</span>
            </div>
            {record && record['Sector'] && (
              <div style={{ marginTop:'-1rem',marginBottom: '10px',width:'95%' }}> {/* Add margin bottom */}
                {record['Sector'].split(',').map((sector, index) => (
                  <div key={index} style={{ display: 'inline-block', marginRight: '2px', marginBottom: '2px', padding: '1px 5px', borderRadius: '5px', backgroundColor: '#754DCA', fontSize: '16px' }}>
                    {sector.trim()} {/* trim() removes any leading or trailing spaces */}
                  </div>
                ))}
                {record['Sector'].split(',').length > 3 && <div style={{ display: 'inline-block', marginRight: '5px' }}>...</div>} {/* Display ellipsis if there are more than three tags */}
              </div>
            )}



          </div>

        </div>
      </div>
    </div>
  )
}