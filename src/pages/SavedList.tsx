import { AsyncImage } from 'loadable-image'
import Skeleton from 'react-loading-skeleton'
import { useSavedFundsStore, useUserStore } from '../store/store'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import venture_logo from '../assets/images/venture-logo-example.png'
import styles from '../styles/profile.module.less'
import CancelButtonIcon from '../assets/svgs/cancel-button.svg?react'
import { convertedOutput } from '../lib/utils'
import CancelButton from '../assets/images/cancel.png'
import { STATUS_COLOR_LIST, 
  STATUS_LIST,
  type FILTER_NAME,
} from '../lib/constants'
import toast from 'react-hot-toast'
import axios from 'axios'
import FundStatus from '../components/status'

export default function SavedList() {
  const [filterName, setFilterName] = useState<FILTER_NAME>('')
  const filterNames: FILTER_NAME[] = ['Firm', 'Location', 'Status', 'Type', 'Contact', 'Suitability Score', 'Advanced Search', 'Clear Filters']
  const savedFunds = useSavedFundsStore(state => state.savedFunds)
  const deleteSavedFund = useSavedFundsStore(state => state.deleteSavedFund)
  const [isLoading, setLoading] = useState(true)
  const [openRequestPanel, setOpenRequestPanel] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [requestName, setRequestName] = useState<string>('')
  const [approvers, setApprovers] = useState<string>('')
  const [details, setDetails] = useState<string>('')
  const randomColor = () => STATUS_COLOR_LIST[Math.floor(Math.random() * STATUS_COLOR_LIST.length)]
  const [filteredData, setFilteredData] = useState<any[]>(savedFunds)
  const[filterWindowPosition, setFilterWindowPosition] = useState<{ left: number, top: number }>({ left: 0, top: 0 })
  const [showFilteredList, setShowFilteredList] = useState<boolean>(false)
  const [contactPerson, setContactPerson] = useState<string>('Person A')
  const [priority, setPriority] = useState<string>('High')
  const [requestStatus, setRequestStatus] = useState<string>('Pending')
  const user = useUserStore(state => state.user)
  const [deal, setDeal] = useState<string>('Deal I')
  const [pendingList, setPendingList] = useState<string[]>([])
  const [filteredList, setFilteredList] = useState<{
    '': string[],
    'Firm': string[],
    'Location': string[],
    'Status': string[],
    'Type': string[],
    'Contact': string[],
    'Suitability Score': string[],
    'Advanced Search': string[],
    'Clear Filters': string[],
  }>({
    '': [],
    'Firm': [],
    'Location': [],
    'Status': [],
    'Type': [],
    'Contact': [],
    'Suitability Score': [],
    'Advanced Search': [],
    'Clear Filters': [],
  })

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).nodeName === 'BUTTON') {
      const button = e.target as HTMLButtonElement
      const rect = button.getBoundingClientRect()
      // console.log(filterName)
      if (button.textContent === 'Clear Filters') {
        setFilterName('')
        setShowFilteredList(false)
        setFilteredList({
          '': [],
          'Firm': [],
          'Location': [],
          'Status': [],
          'Type': [],
          'Contact': [],
          'Advanced Search': [],
          'Clear Filters': [],
        })
        return
      }
      setFilterName(button.textContent as FILTER_NAME)
      setFilterWindowPosition({ left: rect.left, top: rect.top - button.clientHeight })
      // console.log(rect.left, button.clientWidth)
      // console.log(`${button.textContent} button - Left: ${rect.left - button.clientHeight}, Top: ${rect.top}`)
    }
  }

  const sendRequest = async (e) => {
    e.preventDefault()
    try {
      // console.log('executed')
      await axios.post('http://localhost:5001/sendRequest', {
        requestName,
        approvers,
        deal,
        contactPerson,
        priority,
        details,
        email: user?.email,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      toast.success('Request sent successfully!')
      setOpenRequestPanel(false)
      setPendingList([...pendingList, selectedFundName])
    } catch (error) {
      toast.error(error?.response?.data)
    }
  }

  useEffect(() => {
    async function fetchPendingList() {
      await axios.get('http://localhost:5001/getPendingRequests', {
        // params: {
        //   email: user?.email,
        // },
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        setPendingList(res.data.map((record) => record['Fund Name'] as string))
      }).catch((error) => {
        toast.error(error?.response?.data)
      })
    }
    fetchPendingList()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      // console.log(target)
      // console.log(filterName)
      if (target.nodeName === 'BUTTON') {
        const button = target as HTMLButtonElement
      
        if (filterNames.includes(button.textContent as FILTER_NAME)) {
          if (button.textContent === 'Clear Filters') {
            setFilterName('')
            setShowFilteredList(false)
            return
          }
          setFilterName(button.textContent as FILTER_NAME)
          setShowFilteredList(false)
          return
        }
      } else if (target.id.startsWith('v-')) {
        return
      } else if (target.parentElement?.id.startsWith('v-')) {
        return
      } else if (target.hasAttribute('data-label') && (target.getAttribute('data-label') as string).startsWith('v-')) {
        return
      } else {
        setFilterName('')

        setShowFilteredList(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 3000)
  }
  , [])

  useEffect(() => {
    if (filterName === '') {
      setFilteredData(savedFunds)
      return
    }
    
    setFilteredData(savedFunds.filter((record) => {
      return Object.keys(filteredList).every((filterName) => {
        // If no filter is set for this filterName, return true
        if (filteredList[filterName].length === 0) {
          return true
        }
  
        // Apply the filter based on the filterName
        switch (filterName) {
        case 'Firm':
          return filteredList[filterName].includes(record['Funds'] as string)
        case 'Location':
          return filteredList[filterName].includes(record['HQ Country'] as string)
        case 'Status':
          return STATUS_LIST
        case 'Type':
          return filteredList[filterName].includes(record['Type'] as string)
        case 'Contact':
          return filteredList[filterName].includes(record['Co-Investors'] as string)
        case 'Advanced Search':
          return filteredList[filterName].includes(record['Co-Investors'] as string)
        default:
          return true
        }
      })
    }))
  }, [filteredList])


  function removeDuplicatesAndNull(arr) {
    return arr.filter((item,
      index) => item && arr.indexOf(item) === index)
  }
  const getFilteredList = (filterName: FILTER_NAME) => {
    switch (filterName) {
    case 'Firm':
      return removeDuplicatesAndNull(savedFunds.map((record) => record['Funds'] as string))
    case 'Location':
      return removeDuplicatesAndNull(savedFunds.map((record) => record['HQ Country'] as string))
    case 'Status':
      return removeDuplicatesAndNull(STATUS_LIST)
    case 'Type':
      // console.log(data.map((record) => (record['Type'])))
      return removeDuplicatesAndNull(savedFunds.map((record) => record['Type'] as string))
    case 'Contact':
      return ['Tyler Aroner', 'Eliott Harfouche', 'Iman Ghavami']
    case 'Advanced Search':
      return ['Advanced Search']
    default:
      return []
    }
  }

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', zIndex: 100,
      alignItems:'start', gap: '2rem', fontFamily: "'Fira Code', monospace, 'Kalnia', serif" }}>
      <div style={{ marginLeft: '4rem', marginTop: '2rem' }}>
        <div 
          onClick={handleClick}
          style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <span>
        Filters:
          </span>
          {
            filterNames.map((name: FILTER_NAME) => (
              <button key={name} style={{ backgroundColor: 'transparent', border: '#fff4 0.1rem solid' }}>
                {
                  name
                  //  !== 'Clear Filters' && (filteredList[name] as string[]).length > 0
                  //   ? <span>{`${name}\u0020\u00B7\u0020${filteredList[name].length}`}</span>
                  //   : name
                }
              </button>))
          }
        </div>
        {
          filterName !== '' &&
          <div id="v-layout" style={{ position: 'absolute', left: filterWindowPosition.left, top: filterWindowPosition.top,
            backgroundColor: '#080E1C', border: '2px solid #fffa', borderRadius: '2px', padding: '0.5rem',
            zIndex: 20, width: '26rem', minHeight: '8rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <span id="v-span" style={{ fontSize: '1.2rem', alignSelf: 'start', marginLeft: '2rem' }}>{filterName}</span>
            <div id='v-div' style={{ position: 'relative', width: '90%' }}>
              
              <div style={{ display: 'flex' }}>
                <div id='v-container'
                  className={styles['v-container']}
                  style={{ display: 'flex', flex: 9, flexWrap: 'wrap', gap: '0.3rem', padding: '0.2rem' }} placeholder='Search'>
                  {
                    filteredList[filterName].map((filterItem ) => (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation()
                          setFilteredList({
                            ...filteredList,
                            [filterName]: filteredList[filterName].filter((item) => item !== filterItem),
                          })
                      
                        }}
                        data-label='v-filterItemContainer' key={filterItem} className={styles['filterItem-container']}>
                        <div data-label='v-filterItem' style={{  
                          color: '#fff', fontSize: '1.2rem' }}>
                          {filterItem}
                        </div>
                        <img 
                          data-label='v-cancelbutton' src={CancelButton} className={styles['cancel-button']} />
                      </div>
                    ))
                  }

                  <input id="v-input" ref={inputRef}
                    autoSave='false'
                    autoComplete='false'
                    placeholder='Search'
                    onKeyDown={(e) => {
                      e.stopPropagation()

                      if (e.key === 'Backspace') {
                        if (inputRef.current?.value !== '') return
                        setFilteredList({
                          ...filteredList,
                          [filterName]: filteredList[filterName].slice(0, filteredList[filterName].length - 1),
                        })
                      
                      }
                    }}
                    onClick={() => setShowFilteredList(true)}
                    className={styles['filter-input']} name='firm' type='text' />
                </div>
                <div id='v-cancelpanel' style={{ backgroundColor: '#2A2F3E', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    onClick={() => {
                      setFilteredList({
                        ...filteredList,
                        [filterName]: [],
                      })
                    }}
                    data-label='v-cancelbutton' src={CancelButton} className={styles['cancel-button']} />
                </div>
              </div>
              
              {
                showFilteredList &&
                <ul 
                  onClick={(e) => {
                    e.stopPropagation()
                    setFilteredList({
                      ...filteredList,
                      [filterName]: [...filteredList[filterName], (e.target as HTMLElement).textContent as string],

                    })
                  }}
                  id="v-ul" className={styles['filter-select']} style={{ position: 'absolute', textAlign: 'left' }}>
                  {
                    getFilteredList(filterName).filter(filterItem => !filteredList[filterName].includes(filterItem)).map((filterItem) => (
                      <li key={filterItem} className={styles['filter-option']}>{filterItem}</li>
                    ))
                  }
                </ul>
              }
            </div>
            
          </div>
        }
        <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem', margin: '1rem 0' }}></div>
        {
          isLoading 
            ? 
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
              {
                Array(30).fill(0).map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', lineHeight: 1 }}> 
                    <Skeleton width={'5.0rem'} height={'5rem'}  />
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start', gap: '0.75rem', lineHeight: 1 }}>
                      <Skeleton width={'56.0rem'} height={'1.4rem'} />
                      <Skeleton width={'27rem'} height={'1.2rem'} />
                    </div>
                  </div>
                ))
              }
            </div>
            :
            (
              filteredData.length > 0
                ?
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                  <span style={{ textAlign: 'left', fontSize: '1.5rem' }}>{filteredData.length} Funds</span>
                  <div style={{ fontSize: '1.15rem', display: 'grid', gridTemplateColumns: '3fr 1.5fr 1.5fr 2.5fr repeat(4, 1.5fr)', gap: '2rem', width: '100%', textAlign: 'left'  }}>
                    <span>Funds</span>
                    <span>Deals</span>
                    <span>Account Manager</span>
                    <span>Sector</span>
                    <span>Type</span>
                    <span>Connections</span>
                    
                    <span>Co-Investors</span>
                    <span>Suitability Score</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem' }}></div>
                  {
                    filteredData.map((record, index) => (
                      <>
                        <div key={record._id} style={{ display: 'grid', lineHeight: 1, width: '100%', gap: '2rem', gridTemplateColumns: '3fr 1.5fr 1.5fr 2.5fr repeat(4, 1.5fr)' }}> 
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem'  }}>
                              <button
                                onClick={() => { localStorage.setItem('fund-id', record._id as string); navigate(`/fund-card/${record._id}`)  }}
                                style={{  outline: '0.1rem #fff solid', padding: '0.1rem 0.9rem', border: 'none', width: '7rem',  borderRadius: '0.2rem' }}>VIEW</button>
                              <button 
                                onClick={() => { 
                                  if (savedFunds.find((fund) => fund._id === record._id)) {
                                    deleteSavedFund(record)
                                    setFilteredData(filteredData.filter((fund) => fund._id !== record._id))
                                  } 
                                }}
                                style={{ outline: '0.1rem #646cff solid', padding: '0.1rem 0.9rem', width: '7rem', borderRadius: '0.2rem' }}>{ 'DELETE'}</button>
                              <button 
                                onClick={() => {
                                  if (pendingList.includes(record.Funds as string)) {
                                    toast.error('You have already sent a request for this fund')
                                    return
                                  
                                  }
                                  setSelectedFundName(record.Funds as string)
                                  setOpenRequestPanel(true)
                                }}
                                style={{ outline: '0.1rem #646cff solid', padding: '0.1rem 0.9rem', width: '7rem', borderRadius: '0.2rem' }}>
                                {pendingList.includes(record.Funds) ? 'PENDING' : 'REQUEST'}
                              </button>
                            </div>
                            <div style={{ position: 'relative' }}>
                              <AsyncImage
                                onMouseEnter={(e) => { (e.target as HTMLElement).style.cursor = 'pointer'  }}
                                onClick={() => { localStorage.setItem('fund-id', record._id as string); navigate(`/fund-card/${record._id}`)  }}
                                src={record['Logo'] ? (record['Logo']) : venture_logo} style={{ borderRadius: '0.25rem', width: '5rem', height: '5rem', border: `0.25rem solid transparent`, objectFit: 'contain', background: 'rgba(255, 255, 255, 0.8)' }} />
                              <FundStatus color={randomColor()} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem', lineHeight: 1, alignItems: 'start' }}>
                              <span onClick={() => { localStorage.setItem('fund-id', record._id as string); navigate(`/fund-card/${record._id}`)  }} className={styles['fund-name']}>{record['Funds'] as string}</span>
                              <span style={{  }}>{record['HQ Country'] as string}</span>
                            </div>
                            
                          </div>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Deals'] as string[] | string) as string || 'n/a'}</span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left', maxHeight: '5rem' }}>{record['Account Manager'] ? record['Account Manager'] : 'n/a'}</span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left', maxHeight: '5rem' }}>{convertedOutput(record['Sector'] as string[] | string) as string || 'n/a'}</span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Type'] as string[] | string) as string || 'n/a'}</span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Contact'] as string[] | string) || 'n/a'}</span>
                          
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Co-Investors'] as string[] | string) as string || 'n/a'}</span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Suitability Score'] as string[] | string) as string || 'n/a'}</span>
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem'}}></div>
                      </>
                    ))
                  }
                  <span style={{ padding: '2rem', fontSize: '1.4rem', textDecoration: 'underline' }}>load more data<span>...</span></span>
                </div>
              
                :
                (
                  <p>No data</p>
                )
            )
        }
      </div>
      <div className={styles['popover-background']} style={{ visibility: openRequestPanel ? 'visible' : 'hidden' }}>
        <div className={styles['popover-form']}>
          <form 
            onSubmit={sendRequest}
            style={{ margin: '2.5rem 2.5rem 0 2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem'  }}>
            <div className={styles['popover-form-title']}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {/* <AsyncImage src={isLoading  ? '' : (recordRef.current!['Logo'] as ReadonlyArray<{ url: string }>)[0].url} alt='' 
                  style={{  width: ' 4.57144rem', height: '4.47456rem', objectFit: 'contain', borderRadius: '50%', border: '3px solid #5392d4' }}

                  draggable='false' onContextMenu={e => e.preventDefault()} /> */}
                <div>
                  {/* <span style={{ textAlign: 'start', display: 'block' }}>Regarding <span style={{ fontWeight: '700', fontSize: '1.3rem' }}>{recordRef.current ? recordRef.current['Investor Name'] as string : 'no name'}</span></span> */}
                  <span style={{ textAlign: 'start', display: 'block' }}>Create a new request</span>
                </div>
              </div>
              <CancelButtonIcon className={styles['cancelbutton']} onClick={() => setOpenRequestPanel(false)} />
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Type of Request</span>
              <select
                onChange={(e) => setRequestName(e.target.value)}
                style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem', marginTop: '1rem' }} name="Type of Request" id="">
                <option value="Letme">Bypass the approval</option>
                <option value="Assign">Assign the fund request to</option>
              </select>
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Assignees</span>
              <select
                onChange={(e) => setApprovers(e.target.value)}
                style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem 0.5rem', marginTop: '1rem' }} name="Assignees" id="">
                <option value="Tyler Aroner">Tyler Aroner</option>
                <option value="Eliott Harfouche">Eliott Harfouche</option>
                <option value="Iman Ghavami">Iman Ghavami</option>
              </select>
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Type of Deal</span>
              <select
                onChange={(e) => setDeal(e.target.value)}
                style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem 0.5rem', marginTop: '1rem' }} name="Type of Deal" id="">
                <option value="Deal I">Deal I</option>
                <option value="Deal II">Deal II</option>
                <option value="Deal III">Deal III</option>
              </select>
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Contact Person</span>
              <select
                onChange={(e) => setContactPerson(e.target.value)}
                style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem 0.5rem', marginTop: '1rem' }} name="Contact" id="">
                <option value="Person A">Person A</option>
                <option value="Person B">Person B</option>
                <option value="Person C">Person C</option>
                <option value="Not Referring Anyone">Not Referring Anyone</option>
              </select>
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Priority</span>
              <select
                onChange={(e) => setPriority(e.target.value)}
                style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem 0.5rem', marginTop: '1rem' }} name="Priority" id="">
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

  )
}