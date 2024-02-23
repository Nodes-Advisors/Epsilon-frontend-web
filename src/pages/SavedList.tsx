import { AsyncImage } from 'loadable-image'
import Skeleton from 'react-loading-skeleton'
import { useClientsStore, useSavedFundsStore, useTokenStore, useUserStore } from '../store/store'
import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import venture_logo from '../assets/images/venture-logo-example.png'
import styles from '../styles/profile.module.less'
import CancelButtonIcon from '../assets/svgs/cancel-button.svg?react'
import { convertedOutput } from '../lib/utils'
import CancelButton from '../assets/images/cancel.png'
import { STATUS_COLOR_LIST, 
  STATUS_LIST,
  europeCountries,
  asiaCountries,
  FUND_STATUS_LIST,
  type FILTER_NAME,
} from '../lib/constants'
import toast from 'react-hot-toast'
import axios from 'axios'
import FundStatus from '../components/status'
import ReactPaginate from 'react-paginate'
import { handleFullTextFilter } from '../lib/utils'
import WebSocketContext from '../websocket/WebsocketContext'
import { SERVER_ADDRESS } from '../lib/utils'

export default function SavedList() {
  const [filterName, setFilterName] = useState<FILTER_NAME>('')
  const filterNames: FILTER_NAME[] = ['Account Manager', 'Status', 'Deals', 'Investors', 'Location', 'Type', 'Contact', 'Suitability Score', 'Co-Investors', 'Responsiveness Rate', 'Clear Filters']
  const [isLoading, setLoading] = useState(true)
  const [openRequestPanel, setOpenRequestPanel] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [requestName, setRequestName] = useState<string>('')
  const [approvers, setApprovers] = useState<string>('')
  const [details, setDetails] = useState<string>('')
  const [filteredData, setFilteredData] = useState<any[]>()
  const[filterWindowPosition, setFilterWindowPosition] = useState<{ left: number, top: number }>({ left: 0, top: 0 })
  const [showFilteredList, setShowFilteredList] = useState<boolean>(false)
  const [contactPerson, setContactPerson] = useState<string>('')
  const [priority, setPriority] = useState<string>('')
  // const [requestStatus, setRequestStatus] = useState<string>('Pending')
  const user = useUserStore(state => state.user)
  const [deal, setDeal] = useState<string>('')
  const [pendingList, setPendingList] = useState<string[]>([])
  const [selectedFundName, setSelectedFundName] = useState<string>('')
  const [data, setData] = useState<any[]>([])
  const clients = useClientsStore(state => state.clients)
  const token = useTokenStore(state => state.token)
  const { sendMessage, lastMessage, connectionStatus } = useContext(WebSocketContext)
  
  const [filteredList, setFilteredList] = useState<{
    '': string[],
    'Account Manager': string[],
    'Deals': string[],
    'Investors': string[],
    'Location': string[],
    'Status': string[],
    'Type': string[],
    'Contact': string[],
    'Suitability Score': string[],
    'Co-Investors': string[],
    'Clear Filters': string[],
    'Responsiveness Rate': string[],
  }>(localStorage.getItem('saved-filter') ? JSON.parse(localStorage.getItem('saved-filter') as string) : {
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
    'Clear Filters': [],
    'Responsiveness Rate': [],
  })

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).nodeName === 'BUTTON') {
      const button = e.target as HTMLButtonElement
      const rect = button.getBoundingClientRect()
      // console.log(filterName)
      if (button.textContent === 'Clear Filters') {
        localStorage.removeItem('saved-filter')
        setFilterName('')
        setShowFilteredList(false)
        setFilteredList({
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
          'Clear Filters': [],
          'Responsiveness Rate': [],
          
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

    // Check if all required fields have been filled
    if (!requestName || !approvers || !deal || !contactPerson || !priority || !selectedFundName) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // console.log('executed')
      const randomId = Math.random().toString(36).substring(7)
      const currentTime = new Date()
      await axios.post(`http://${SERVER_ADDRESS}:5001/sendRequest`, {
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
      setOpenRequestPanel(false)
      setPendingList([...pendingList, selectedFundName])
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
      if (localStorage.getItem('approvalRequests')) {
        const approvalRequests = JSON.parse(localStorage.getItem('approvalRequests') as string)
        localStorage.setItem('approvalRequests', JSON.stringify([...approvalRequests, messageObject]))
      } else {
        localStorage.setItem('approvalRequests', JSON.stringify([messageObject]))
      }
    } catch (error) {
      toast.error(error?.response?.data)
    }
  }

  useEffect(() => {
    async function fetchSavedFunds() {
      
      await axios.get(`http://${SERVER_ADDRESS}:5001/savedcollections/${window.location.href.split('/')[window.location.href.split('/').length - 1]}`, {
        params: {
          email: user?.email,
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'email': user?.email,
        },
      }).then((res) => {
        // console.log(res.data)
        setData(res.data)
        setFilteredData(res.data)
        if (localStorage.getItem('saved-filter')) {
          const filteredList = JSON.parse(localStorage.getItem('saved-filter') as string)
          if (Object.values(filteredList).every(filter => filter.length === 0)) {
            setFilteredData(filteredData)
            return
          }
        
          // Apply filters cumulatively
          setFilteredData(filteredData.filter((record) => {
            return Object.keys(filteredList).every((filterName) => {
              // If no filter is set for this filterName, return false
              if (filteredList[filterName].length === 0) {
                return true
              }
        
              // Apply the filter based on the filterName
              switch (filterName) {
              case 'Account Manager':
                return filteredList[filterName].some(filter => 
                  filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
                )
              case 'Investors':
                return filteredList[filterName].includes(record['Funds'] as string)
                    || (record['Funds'] && record['Funds'].includes(filteredList[filterName] as string))
              case 'Location':
                return filteredList[filterName].some(filter => {
                  if (filter === 'Europe') {
                    return europeCountries.includes(record['HQ Country'] as string)
                  }
                  if (filter === 'Asia') {
                    return asiaCountries.includes(record['HQ Country'] as string)
                  }
                  return filter === record['HQ Country'] || (record['HQ Country'] && record['HQ Country'].includes(filter))
                })
              case 'Status':
                // console.log(record['Status'])
                return filteredList[filterName].includes(record['Status'] as string)
                          || (record['Status'] && filteredList[filterName].includes(record['Status'] as string))
                          || (record['Status'].startsWith('Review') && filteredList[filterName].includes('Busy'))
                // console.log(filteredList['Past Deals'])
              case 'Deals':
                return filteredList['Deals'].some(filter => 
                  filter === record['Past Deals'] || (record['Past Deals'] && record['Past Deals'].includes(filter)),
                )
              case 'Type':
                return filteredList[filterName].some(filter => 
                  filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
                )
              case 'Contact':
                return filteredList[filterName].some(filter => 
                  filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
                )
              case 'Suitability Score':
                return [ '>90', '>80', '60-80', '<60']
              case 'Responsiveness Rate':
                return [ '>90', '>80', '60-80', '<60']
              case 'Co-Investors':
                return filteredList[filterName].some(filter => 
                  filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
                )
              default:
                return false
              }
            })
          }))
        }
      }).catch((error) => {
        toast.error(error?.response?.data)
      })
    }
    fetchSavedFunds()
  }, [window.location.href])

  useEffect(() => {
    async function fetchPendingList() {
      await axios.get(`http://${SERVER_ADDRESS}:5001/getPendingRequests`, {
        // params: {
        //   email: user?.email,
        // },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'email': user?.email,
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
            localStorage.removeItem('saved-filter')
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
    // If no filter is applied, show all data
    // if (!filteredData || filteredData?.length === 0) {
    //   return
    // }
    if (Object.values(filteredList).every(filter => filter.length === 0)) {
      setFilteredData(data)
      return
    }
    console.log(filteredData)
    console.log(filteredList)
    // Apply filters cumulatively
    setFilteredData(data.filter((record) => {
      return Object.keys(filteredList).every((filterName) => {
        // If no filter is set for this filterName, return false
        if (filteredList[filterName].length === 0) {
          return true
        }
  
        // Apply the filter based on the filterName
        switch (filterName) {
        case 'Account Manager':
          return filteredList[filterName].some(filter => 
            filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
          )
        case 'Investors':
          return filteredList[filterName].includes(record['Funds'] as string)
              || (record['Funds'] && record['Funds'].includes(filteredList[filterName] as string))
        case 'Location':
          return filteredList[filterName].some(filter => {
            if (filter === 'Europe') {
              return europeCountries.includes(record['HQ Country'] as string)
            }
            if (filter === 'Asia') {
              return asiaCountries.includes(record['HQ Country'] as string)
            }
            return filter === record['HQ Country'] || (record['HQ Country'] && record['HQ Country'].includes(filter))
          })
        case 'Status':
          console.log(record['Status'])
          return filteredList[filterName].includes(record['Status'] as string)
                          || (record['Status'] && filteredList[filterName].includes(record['Status'] as string))
                          || (record['Status'].startsWith('Review') && filteredList[filterName].includes('Busy'))
        case 'Deals':
          // console.log(filteredList['Past Deals'])
          return filteredList['Deals'].some(filter => 
            filter === record['Past Deals'] || (record['Past Deals'] && record['Past Deals'].includes(filter)),
          )
        case 'Type':
          return filteredList[filterName].some(filter => 
            filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
          )
        case 'Contact':
          return filteredList[filterName].some(filter => 
            filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
          )
        case 'Suitability Score':
          return [ '>90', '>80', '60-80', '<60']
        case 'Responsiveness Rate':
          return [ '>90', '>80', '60-80', '<60']
        case 'Co-Investors':
          return filteredList[filterName].some(filter => 
            filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
          )
        default:
          return false
        }
      })
    }))
  }, [filteredList])

  const [itemOffset, setItemOffset] = useState(0)
  const itemsPerPage = 20
  const endOffset = itemOffset + itemsPerPage
  const currentItems = filteredData ? filteredData.slice(itemOffset, endOffset) : []
  const pageCount = filteredData ? Math.ceil(filteredData.length / itemsPerPage) : 0

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % filteredData.length
    setItemOffset(newOffset)
  }

  const handleDeleteFundsClick = async (record: any) => {
    try {
      const res = await axios.post(`http://${SERVER_ADDRESS}:5001/savedcollections/deletefund`, {
        collection: decodeURIComponent(window.location.href.split('/')[window.location.href.split('/').length - 1]),
        fundName: record.Funds,
        email: user?.email,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'email': user?.email,
        },
      })
      if (res.status === 200) {

        setFilteredData(filteredData.filter((fund) => fund._id !== record._id))
        toast.success('Fund is deleted successfully')
      }
    } catch (error) {
      toast.error(error?.response?.data)
    }
  }

  function removeDuplicatesAndNull(arr) {
    // Split the strings into individual values
    const splitArr = arr.flatMap(item => item ? item.split(',') : [])
    const trimmedArr = splitArr.map((item) => item.trim())
    // Remove duplicates and null or empty strings
    const uniqueArr = trimmedArr.filter((item, index, self) => 
      item && item.trim() !== '' && self.indexOf(item) === index,
    )
    return uniqueArr
  }
  const getFilteredList = (filterName: FILTER_NAME) => {
    switch (filterName) {
    case 'Account Manager':
      return removeDuplicatesAndNull(data.map((record) => record['Account Manager'] as string))
    case 'Deals':
      return removeDuplicatesAndNull(data.map((record) => record['Past Deals'] as string))
    case 'Investors':
      return removeDuplicatesAndNull(data.map((record) => record['Funds'] as string))
    case 'Location':
      return ['Europe', 'Asia', ...removeDuplicatesAndNull(data.map((record) => record['HQ Country'] as string))]
    case 'Status':
      return removeDuplicatesAndNull(FUND_STATUS_LIST)
    case 'Type':
      // console.log(data.map((record) => (record['Type'])))
      return removeDuplicatesAndNull(data.map((record) => record['Type'] as string))
    case 'Contact':
      return removeDuplicatesAndNull(data.map((record) => record['Contact'] as string))
    case 'Suitability Score':
      return ['>90', '>80', '60-80', '<60']
    case 'Responsiveness Rate':
      return ['>90', '>80', '60-80', '<60']
    case 'Co-Investors':
      // console.log(savedFunds.map((record) => record as string))
      return removeDuplicatesAndNull(data.map((record) => record['Co-Investors'] as string))
    default:
      return []
    }
  }

  const handleAddFilter = (e) => {
  
  }

  const isInClientList = (statusString: string) => {

    for (const client of clients) {
      const nameIndex = statusString.toUpperCase().indexOf(client.name.toUpperCase())
      const acronymIndex = statusString.toUpperCase().indexOf(client.acronym.toUpperCase())

      if (nameIndex !== -1 && client.name) {
        return {
          match: client.name,
          prev: statusString.substring(0, nameIndex),
          next: statusString.substring(nameIndex + client.name.length),
          id: client._id,
        }
      } else if (acronymIndex !== -1 && client.acronym) {
        return {
          match: client.acronym,
          prev: statusString.substring(0, acronymIndex),
          next: statusString.substring(acronymIndex + client.acronym.length),
          id: client._id,
        }
      }
    }
    return null
  }

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

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', zIndex: 100,
      alignItems:'start', gap: '2rem', fontFamily: "'Fira Code', monospace, 'Kalnia', serif" }}>
      <div style={{ marginLeft: '4rem', marginTop: '2rem' }}>
        <div 
          
          style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <span>
        Filters:
          </span>
          {
            filterNames.map((name: FILTER_NAME) => (
              <>
                <button 
                  onClick={(e) => { setFilterName(name); handleClick(e)}}
                  key={name} style={{ backgroundColor: 'transparent', border: filteredList[name] && filteredList[name].length > 0 ? '#fff 0.1rem solid' :'#fff4 0.1rem solid' }}>
                  {
                    filteredList[name] && filteredList[name].length > 0
                      ?
                      filteredList[name].join(', ')
                      :
                      name
                  }
                </button>
              </>
            ))
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
                          setItemOffset(0)
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
                    autoSave='off'
                    autoComplete='off'
                    placeholder='Search'
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      setItemOffset(0)
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
                      setItemOffset(0)
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
                    setItemOffset(0)
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
              currentItems.length > 0
                ?
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                  <span style={{ textAlign: 'left', fontSize: '1.5rem' }}>{filteredData.length} Funds<span>{`(${decodeURIComponent(window.location.href.split('/')[window.location.href.split('/').length - 1])} list)`}</span></span>
                  <div style={{ fontSize: '1.15rem', display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr 1.5fr 1.5fr 2fr 2fr 1.5fr 1.5fr', gap: '2rem', width: '100%', textAlign: 'left'  }}>
                    <span>Funds</span>
                    <span>Status</span>
                    <span>Past Deals</span>
                    <span>Account Manager</span>
                    <span>Sector</span>
                    <span>Type</span>
                    <span>Connections</span>
                    
                    <span>Co-Investors</span>
                    <span>Suitability Score</span>
                    <span>Responsiveness Rate</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem' }}></div>
                  {
                    currentItems.map((record, index) => (
                      <>
                        <div key={record._id} style={{ display: 'grid', lineHeight: 1, width: '100%', gap: '2rem', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr 1.5fr 1.5fr 2fr 2fr 1.5fr 1.5fr' }}> 
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem'  }}>
                              <button
                                onClick={() => { localStorage.setItem('fund-id', record._id as string); localStorage.setItem('saved-filter', JSON.stringify(filteredList)); navigate(`/fund-card/${record._id}`)  }}
                                style={{  outline: '0.1rem #fff solid', padding: '0.1rem 0.9rem', border: 'none', width: '7rem',  borderRadius: '0.2rem' }}>VIEW</button>
                              <button  
                                onClick={async() => await handleDeleteFundsClick(record)}
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
                                style={{ outline: '0.1rem #646cff solid', padding: '0.1rem 0.9rem', width: '7rem', borderRadius: '0.2rem', background: pendingList.includes(record.Funds) ? 'rgb(100, 108, 255)' : 'transparent' }}>
                                {pendingList.includes(record.Funds) ? 'PENDING' : 'REQUEST'}
                              </button>
                            </div>
                            <div style={{ position: 'relative' }}>
                              <AsyncImage
                                onMouseEnter={(e) => { (e.target as HTMLElement).style.cursor = 'pointer'  }}
                                onClick={() => { localStorage.setItem('fund-id', record._id as string); localStorage.setItem('saved-filter', JSON.stringify(filteredList)); navigate(`/fund-card/${record._id}`)  }}
                                src={record['Logo'] ? (record['Logo']) : venture_logo} style={{ borderRadius: '0.25rem', width: '5rem', height: '5rem', border: `0.25rem solid transparent`, objectFit: 'contain', background: 'rgba(255, 255, 255, 0.8)' }} />
                              <FundStatus colorList={generateColorList(record['Contact'] ? (record['Contact'].split(',')).length : 0, record.Contact, record.Status)} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem', lineHeight: 1, alignItems: 'start' }}>
                              <span onClick={() => { localStorage.setItem('fund-id', record._id as string); localStorage.setItem('filter', JSON.stringify(filteredList)); localStorage.setItem('deals', JSON.stringify(getFilteredList('Deals'))); navigate(`/fund-card/${record._id}`)  }} className={styles['fund-name']}>{record['Funds'] as string}</span>
                              <span onClick={e => handleFullTextFilter(e, setFilteredList)} data-label='Location' className={styles['fund-list-multiple-item']}>{record['HQ Country'] as string}</span>
                            </div>
                            
                          </div>
                          <span style={{ textAlign: 'left' }}>
                            {
                              isInClientList(record['Status'])
                                ?
                                <>
                                  <span >{isInClientList(record['Status']).prev}</span>
                                  <span 
                                    onClick={() => navigate(`/client-card/${isInClientList(record['Status']).id}`)}
                                    style={{ color: '#23D5F9', fontWeight: '700', cursor: 'pointer' }}>{isInClientList(record['Status']).match}</span>
                                  <span>{isInClientList(record['Status']).next}</span>
                                </>
                                :
                              convertedOutput(record['Status']) as string || 'n/a'
                            }
                          </span>
                          <span style={{ textAlign: 'left' }}>
                            {
                              (record['Past Deals'] || 'n/a').split(',').map((deal, index) => (
                                <span onClick={e => handleFullTextFilter(e, setFilteredList)} data-label='Deals' className={styles['fund-list-multiple-item']} key={index}>{deal}</span>
                              ))
                            }
                          </span>
                          <span

                            data-label= 'Account Manager'
                            onClick={e => handleFullTextFilter(e, setFilteredList)}
                            className={styles['fund-list-item']}>{convertedOutput(record['Account Manager'] as string | string[]) as string || 'n/a'}</span>
                          <span 
                            data-label= 'Sector'

                            className={styles['fund-list-item']}>{convertedOutput(record['Sector'] as string | string[]) as string || 'n/a'}</span>
                          <span 
                            data-label= 'Type'
                            onClick={e => handleFullTextFilter(e, setFilteredList)}
                            className={styles['fund-list-item']}>{convertedOutput(record['Type'] as string[] | string) as string || 'n/a'}</span>
                          <span
                            style={{ textAlign: 'left' }}
                            data-label= 'Contact'
                          >
                            {
                              (record['Contact'] || 'n/a').split(',').map((contact, index) => (
                                <>
                                  <span onClick={e => handleFullTextFilter(e, setFilteredList)} data-label='Contact' className={styles['fund-list-multiple-item']} key={index}>{contact}</span>
                                  {
                                    index < ((record['Contact'] as string) || 'n/a').split(',').length - 1 && <span>, </span>
                                  }
                                </>
                              ))
                            }
                          </span>

                          <span
                            style={{ textAlign: 'left' }}
                          >
                            {
                              (record['Co-Investors'] || 'n/a').split(',').map((coInvestor, index) => (
                                <>
                                  <span onClick={e => handleFullTextFilter(e, setFilteredList)} data-label='Co-Investors' className={styles['fund-list-multiple-item']} key={index}>{coInvestor}</span>
                                  {
                                    index < ((record['Co-Investors'] as string) || 'n/a').split(',').length - 1 && <span>, </span>
                                  }
                                </>
                              ))
                            }
                          </span>
                          <span 
                            data-label= 'Suitability Score'
                            onClick={handleAddFilter}
                            className={styles['fund-list-item']}>{convertedOutput(record['Suitability Score'] as string[] | string) as string || 'n/a'}
                          </span>
                          <span 
                            data-label= 'Responsiveness Rate'
                            onClick={handleAddFilter}
                            className={styles['fund-list-item']}>{convertedOutput(record['Responsiveness Rate'] as string[] | string) as string || 'n/a'}
                          </span>
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem'}}></div>
                      </>
                    ))
                  }
                  {/* <span style={{ padding: '2rem', fontSize: '1.4rem', textDecoration: 'underline' }}>load more data<span>...</span></span> */}
                </div>
              
                :
                (
                  <p>No data</p>
                )
            )
        }
      </div>
      {
        currentItems.length > 0
        &&
        <ReactPaginate
          className={styles['fund-card-pagination']}
          // breakClassName={styles['fund-card-pagination-li']}
          pageLinkClassName={styles['fund-card-pagination-link']}
          pageClassName={styles['fund-card-pagination-li']}
          activeClassName={styles['fund-card-pagination-li-active']}
          activeLinkClassName={styles['fund-card-pagination-link-active']}
          nextClassName={styles['fund-card-pagination-next']}
          previousClassName={styles['fund-card-pagination-pre']}
          breakLabel="..."
          nextLabel="next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          previousLabel="< pre"
          renderOnZeroPageCount={null}
        />  
      } 
      <div className={styles['popover-background']} style={{ visibility: openRequestPanel ? 'visible' : 'hidden' }}>
        <div className={styles['popover-form']}>
          <form 
            onSubmit={sendRequest}
            style={{ margin: '2.5rem 2.5rem 0 2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem'  }}>
            <div className={styles['popover-form-title']}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              
                <div>
                  
                  <span style={{ textAlign: 'start', display: 'block' }}>Create a new request</span>
                </div>
              </div>
              <CancelButtonIcon className={styles['cancelbutton']} onClick={() => setOpenRequestPanel(false)} />
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
                {
                  getFilteredList('Account Manager').map((assignee) => (
                    <option key={assignee} value={assignee}>{assignee}</option>
                  ))
                }
                
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
                  getFilteredList('Deals').map((deal) => (
                    <option key={deal} value={deal}>{deal}</option>
                  ))
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
                  (data.filter(fund => fund.Funds === selectedFundName)[0]?.Contact || '').split(',').map((contact) => (
                    <option key={contact} value={contact}>{contact}</option>
                  ))
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

  )
}