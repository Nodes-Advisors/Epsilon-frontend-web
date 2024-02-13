import styles from '../styles/profile.module.less'
import ActionButton from '../components/action-button'
import LocationIcon from '../assets/svgs/location.svg?react'
import DotCircleIcon from '../assets/svgs/dot-circle.svg?react'
import YCLogo from '../assets/images/yc_logo.png'
import VectorLogo from '../assets/svgs/vector.svg?react'
import { useState, useEffect, useRef } from 'react'
import { AsyncImage } from 'loadable-image'
import Skeleton from 'react-loading-skeleton'
import { useFundsStore, useSavedFundsStore, useUserStore } from '../store/store'
import CancelButtonIcon from '../assets/svgs/cancel-button.svg?react'
import { STATUS_COLOR_LIST } from '../lib/constants'
import FundStatusLarger from '../components/status-larger'
import BookIcon from '../assets/images/book.png'
import toast from 'react-hot-toast'
import axios from 'axios'
import BackIcon from '../assets/images/back.png'
import { useNavigate } from 'react-router-dom'

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

  function formatDate(timestamp) {
    const date = new Date(timestamp)
  
    let day = date.getDate()
    day = day < 10 ? '0' + day : day 
  
    let month = date.getMonth() + 1 
    month = month < 10 ? '0' + month : month 
  
    const year = date.getFullYear().toString().substr(-2)
  
    return `${day}/${month}/${year}`
  }
  
  const funds = useFundsStore(state => state.funds)
  const id = localStorage.getItem('fund-id')
  if (!id) {
    throw new Error('fund id not found')
  }
  
  useEffect(() => {
    const record = funds.filter((record) => record._id === id)[0]
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
    setLocation(['HQ Country' ].reduce((acc, cur, curIndex, array) =>
      acc += record[cur] ? curIndex !== array.length - 1 ? record[cur] + ', ' : record[cur] : '', ''))
    setRecord(record)
    setTimeout(() => setLoading(false), 1000)
  }, [])

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

  return (
    <div 
      style={{ overflow: 'hidden', position: 'relative', gap: '3vh', display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', height: '90vh' }}>
      <div 
      onClick={() => navigate(-1)}
      style={{ display: 'flex', gap: '1rem', alignItems: 'center', alignSelf: 'self-start', paddingTop: '3vh', marginLeft: '8vw' }}>
        <img
          
          className={styles['back-icon']} src={BackIcon} alt="" />
        <h3 className={styles['back-text']}>Return to Fund Card Page</h3>
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
              onClick={() => savedFunds.find((fund) => fund._id === record?._id) ? deleteSavedFund(record) : addSavedFund(record)}
              buttonClass={styles['action-button']} 
              textClass={styles['action-button-text']} 
              text= {savedFunds.find((fund) => fund._id === record?._id) ? 'REMOVE FROM LIST' : 'ADD TO LIST'} />
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
                        {/* <th><Skeleton width={'5rem'} /></th> */}
                        <th><Skeleton width={'5rem'} /></th>
                        <th><Skeleton width={'5rem'} /></th>
                        <th><Skeleton width={'5rem'} /></th>
                        <th><Skeleton width={'3rem'} /></th>
                      </tr>
                      :
                      
                        hislogs.length > 0
                        ?
                        <tr>
                          <th>Company</th>
                          <th>Stage</th>
                          <th>Date</th>
                          <th>Round Size</th>
                          {/* <th>Toal Raised</th> */}
                          <th>Account Manager</th>
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
                          {/* <td><Skeleton width={'5rem'} /></td> */}
                          <td><Skeleton width={'5rem'} /></td>
                          <td><Skeleton width={'5rem'} /></td>
                          <td><Skeleton width={'5rem'} /></td>
                          <td><Skeleton width={'3rem'} /></td>
                        </tr>
                      ))
                      :
                      hislogs.map((log, i) => (
                        <tr key={i}>
                          <td>{log.Client ? log.Client : 'No client record'}</td>
                          <td>{log.current_stage ? log.current_stage : 'No stage record'}</td>
                          <td>{formatDate(log.Date)}</td>
                          <td>{log.round_size ? log.round_size : 'No round size record'}</td>
                          {/* <td>{log.TotalRaised ? log.TotalRaised : 'No total raised record'}</td> */}
                          <td>{log.Nodes ? log.Nodes : 'No account manager record'}</td>
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
                record['Co-Investors'] as string).split(',').map((investor: string) => (
                  <div key={investor} className={styles['investor-layout']}>

                    <img src={YCLogo} alt='' className={styles['investor-logo']} />
                    <div className={styles['investor-text']}>
                      <span className={styles['investor-name']}>{investor}</span>
                      <br />
                      <span className={styles['stage-info']}>May not know</span>
                    </div>

                  </div>
                ),
                )
                : 'no co-investors'
          }
          

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
                  record && record['Past Deals'] ? record['Past Deals'].split(',').map((deal) => (
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
      </div>
    </div>
  )
}