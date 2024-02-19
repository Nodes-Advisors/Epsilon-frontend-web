import { AsyncImage } from 'loadable-image'
import venture_logo from '../assets/images/venture-logo-example.png'
import Skeleton from 'react-loading-skeleton'
import { useEffect, useRef, useState, useContext } from 'react'

import { FieldSet, Record } from 'airtable'
import { useNavigate } from 'react-router-dom'
import { useClientsStore, useFundsStore } from '../store/store'
import CancelButtonIcon from '../assets/svgs/cancel-button.svg?react'
import styles from '../styles/profile.module.less'
import { convertedOutput } from '../lib/utils'
import { FUND_STATUS_LIST, europeCountries, asiaCountries } from '../lib/constants'
import type { FILTER_NAME } from '../lib/constants'
import CancelButton from '../assets/images/cancel.png'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useUserStore } from '../store/store'
import FundStatus from '../components/status'
import { throttle } from 'lodash'
import ReactPaginate from 'react-paginate'
import WebSocketContext from '../websocket/WebsocketContext'
import { handleFullTextFilter } from '../lib/utils'

export default function FundCards() {
  
  const clients = useClientsStore(state => state.clients)
  const setClients = useClientsStore(state => state.setClients)
  const [fundStatus, setFundStatus] = useState<object[]>([])
  const filterNames: FILTER_NAME[] = ['Account Manager', 'Status', 'Deals', 'Investors', 'Location', 'Type', 'Contact', 'Suitability Score', 'Co-Investors', 'Responsiveness Rate', 'Clear Filters']
  const [isLoading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [requestName, setRequestName] = useState<string>('')
  const [approvers, setApprovers] = useState<string>('')
  const [deal, setDeal] = useState<string>('')
  const [contactPerson, setContactPerson] = useState<string>('')
  const [details, setDetails] = useState<string>('')
  const [priority, setPriority] = useState<string>('')
  // const [requestStatus, setRequestStatus] = useState<'Pending' | 'Request'>('Request')
  const inputRef = useRef<HTMLInputElement>(null)
  const [pendingList, setPendingList] = useState<string[]>([])
  const [filterName, setFilterName] = useState<FILTER_NAME>('')
  const user = useUserStore(state => state.user)
  const[filterWindowPosition, setFilterWindowPosition] = useState<{ left: number, top: number }>({ left: 0, top: 0 })
  const [showFilteredList, setShowFilteredList] = useState<boolean>(false)
  const [selectedFundName, setSelectedFundName] = useState<string>('')
  const [showSavedCollections, setShowSavedCollections] = useState<boolean>(false)
  const [savedCollections, setSavedCollections] = useState<string[]>([])
  const [changeToInput, setChangeToInput] = useState<boolean>(false)
  const newCollectionRef = useRef<HTMLInputElement>(null)
  const [hoveredCollection, setHoveredCollection] = useState<string>('')
  const [inputValue, setInputValue] = useState('')
  const [totalFundCount, setTotalFundCount] = useState<number>(0)
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
  }>(localStorage.getItem('filter') ? JSON.parse(localStorage.getItem('filter') as string) : {
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

  const { sendMessage, lastMessage, connectionStatus } = useContext(WebSocketContext)

  // according to filteredList, filter data

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

  useEffect(() => {
    setLoading(true)
    axios.get('http://localhost:5001/getAllFunds')
      .then((res) => {
        setTotalFundCount(res.data.length)   
        setData(res.data)
        setFunds(res.data)  
        setFilteredData(res.data) 
        if (localStorage.getItem('filter')) {
          const filteredList = JSON.parse(localStorage.getItem('filter') as string)
          if (Object.values(filteredList).every(filter => filter.length === 0)) {
            setFilteredData(res.data)
            return
          }
        
          // Apply filters cumulatively
          setFilteredData(res.data.filter((record) => {
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
              case 'Co-Investors':
                return filteredList[filterName].some(filter => 
                  filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
                )
              case 'Responsiveness Rate':
                return [ '>90', '>80', '60-80', '<60']
              default:
                return false
              }
            })
          }))
        }

      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    // If no filter is applied, show all data
    // console.log(filteredList, 'filteredList')
    setItemOffset(0)
    if (Object.values(filteredList).every(filter => filter.length === 0)) {
      setFilteredData(data)
      return
    }
  
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
        case 'Co-Investors':
          return filteredList[filterName].some(filter => 
            filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
          )
        case 'Responsiveness Rate':
          return [ '>90', '>80', '60-80', '<60']
        default:
          return false
        }
      })
    }))
  }, [filteredList])

  useEffect(() => {
    axios.get('http://localhost:5001/getAllClients')
      .then((res) => {
        setClients(res.data)
      })
      .catch((error) => {
        console.error(error)
      })
  }
  , [])

  useEffect(() => {
    axios.get('http://localhost:5001/fundStatus').then((res) => { 
      setFundStatus(res.data)
    }).catch((error) => {
      toast.error(error?.response?.data)
    })
  }, [])

  const [itemOffset, setItemOffset] = useState(0)
  const itemsPerPage = 20
  const endOffset = itemOffset + itemsPerPage
  const currentItems = filteredData.slice(itemOffset, endOffset)
  const pageCount = Math.ceil(filteredData.length / itemsPerPage)

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % filteredData.length
    setItemOffset(newOffset)
  }

  const [openRequestPanel, setOpenRequestPanel] = useState(false)
  const setFunds = useFundsStore(state => state.setFunds)
  const navigate = useNavigate()
  // const randomColor = () => STATUS_COLOR_LIST[Math.floor(Math.random() * STATUS_COLOR_LIST.length)]
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
    case 'Co-Investors':
      return removeDuplicatesAndNull(data.map((record) => record['Co-Investors'] as string))
    case 'Responsiveness Rate':
      return ['>90', '>80', '60-80', '<60']
    default:
      return []
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).nodeName === 'BUTTON') {
      const button = e.target as HTMLButtonElement
      const rect = button.getBoundingClientRect()
      // console.log(filterName)
      if (button.textContent === 'Clear Filters') {
        localStorage.removeItem('filter')
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
          'Responsiveness Rate': [],
          'Co-Investors': [],
          'Clear Filters': [],
        })
        return
      }
      // setFilterName(button.textContent as FILTER_NAME)
      setFilterWindowPosition({ left: rect.left, top: rect.top - button.clientHeight })
      // console.log(rect.left, button.clientWidth)
      // console.log(`${button.textContent} button - Left: ${rect.left - button.clientHeight}, Top: ${rect.top}`)
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      // console.log(target)
      // console.log(filterName)
      if (target.nodeName === 'BUTTON') {
        const button = target as HTMLButtonElement
      
        if (filterNames.includes(button.textContent as FILTER_NAME)) {
          if (button.textContent === 'Clear Filters') {
            localStorage.removeItem('filter')
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

  // const highlightName( status: string, contact: string) {
  //   const contactList = contact.split(',')
  //   for

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
      }
      sendMessage(JSON.stringify(messageObject))
    } catch (error) {
      toast.error(error?.response?.data)
    }
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const throttledHandleInputChange = throttle(handleInputChange, 500)

  const handleCreateNewCollection = async () => {
    try {
      const res  = await axios.post('http://localhost:5001/savedcollections', {
        email: user?.email,
        savedcollection: newCollectionRef.current?.value,
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

  const handleAddToCollection = async () => {
    try {
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


  const handleAddFilter = (e) => {
    
  }

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems:'start', gap: '2rem', fontFamily: "'Fira Code', monospace, 'Kalnia', serif" }}>
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
                  onClick={(e) => { setFilterName(name); handleClick(e) }}
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
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '60%', alignItems: 'center', width: '100%' }}>
              <span id="v-span" style={{ fontSize: '1.2rem', alignSelf: 'start' }}>{filterName}</span>
              <img
                onClick={() => setFilterName('')}
                data-label='v-cancelbutton' src={CancelButton} className={styles['cancel-button']} />
            </div>
            
            <div id='v-div' style={{ position: 'relative', width: '90%' }}>
              
              <div style={{ display: 'flex' }}>
                <div id='v-container'
                  className={styles['v-container']}
                  style={{ display: 'flex', flex: 9, flexWrap: 'wrap', gap: '0.3rem', padding: '0.2rem' }}>
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
                    autoSave='false'
                    autoComplete='off'
                    aria-autocomplete='none'
                    placeholder='Search'
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      setItemOffset(0)
                      if (e.key === 'Backspace' && inputRef.current?.value === '') {
                        
                        setFilteredList({
                          ...filteredList,
                          [filterName]: filteredList[filterName].slice(0, filteredList[filterName].length - 1),
                        })
                      }
                    }}
                    onChange={(e) => throttledHandleInputChange(e)}
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
                    getFilteredList(filterName).filter(filterItem => filterItem.toUpperCase().startsWith(inputValue.toUpperCase()) && !filteredList[filterName].includes(filterItem)).map((filterItem) => (
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

            <div key={'fund-cards'} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ textAlign: 'left', fontSize: '1.5rem' }}>{filteredData.length === totalFundCount ? `${totalFundCount} Funds` : `${filteredData.length} Funds (out of ${totalFundCount} Funds)`}</span>
              <div style={{ fontSize: '1.15rem', display: 'grid', gap: '2rem', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr 2fr repeat(2, 1fr) 1.5fr 1.5fr', width: '100%', textAlign: 'left'  }}>
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
                currentItems.length > 0
                  ?
                  currentItems.map((record, index) => (
                    <>
                      <div key={record._id} style={{ display: 'grid', lineHeight: 1, gap: '2rem', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr 2fr repeat(2, 1fr) 1.5fr 1.5fr' }}> 
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem'  }}>
                            <button
                              onClick={() => { 
                                localStorage.setItem('fund-id', record._id as string) 
                                localStorage.setItem('filter', JSON.stringify(filteredList)) 
                                localStorage.setItem('deals', JSON.stringify(getFilteredList('Deals')))
                                navigate(`/fund-card/${record._id}`)
                                
                              }}
                              style={{  outline: '0.1rem #fff solid', padding: '0.1rem 0.9rem', border: 'none', width: '7rem',  borderRadius: '0.2rem' }}>VIEW</button>
                            <button 
                              onClick={() => {
                                setShowSavedCollections(true)
                                setSelectedFundName(record.Funds as string)
                              }}
                              style={{ outline: '0.1rem #646cff solid', padding: '0.1rem 0.9rem', width: '7rem', borderRadius: '0.2rem' }}>{'SAVE'}</button>
                            <button 
                              onClick={() => {
                                if (pendingList.includes(record.Funds as string)) {
                                  toast.error('You have already sent a request for this fund')
                                  return
                                
                                }
                                setSelectedFundName(record.Funds as string)
                                setOpenRequestPanel(true)
                              }}
                              style={{ outline: '0.1rem #646cff solid', padding: '0.1rem 0.9rem', width: '7rem', borderRadius: '0.2rem', backgroundColor: pendingList.includes(record.Funds) ? 'rgb(100, 108, 255)' : 'transparent' }}>
                              {pendingList.includes(record.Funds) ? 'PENDING' : 'REQUEST'}
                            </button>
                          </div>
                          <div style={{ position: 'relative' }}>
                            <AsyncImage
                              onMouseEnter={(e) => { (e.target as HTMLElement).style.cursor = 'pointer'  }}
                              onClick={() => { localStorage.setItem('fund-id', record._id as string); localStorage.setItem('filter', JSON.stringify(filteredList)); localStorage.setItem('deals', JSON.stringify(getFilteredList('Deals'))); navigate(`/fund-card/${record._id}`)  }}
                              src={record['Logo'] ? (record['Logo']) : venture_logo} style={{ borderRadius: '0.25rem', border: `0.25rem solid transparent`, width: '5rem', height: '5rem', objectFit: 'contain', background: 'rgba(255, 255, 255, 0.5)' }} />
                            <FundStatus colorList={generateColorList(record['Contact'] ? (record['Contact'].split(',')).length : 0, record.Contact, record.Status)} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem', lineHeight: 1, alignItems: 'start' }}>
                            <span onClick={() => { localStorage.setItem('fund-id', record._id as string); localStorage.setItem('filter', JSON.stringify(filteredList)); localStorage.setItem('deals', JSON.stringify(getFilteredList('Deals'))); navigate(`/fund-card/${record._id}`)  }} className={styles['fund-name']}>{record['Funds'] as string}</span>
                            <span onClick={e => handleFullTextFilter(e, setFilteredList)} data-label='Location' className={styles['fund-list-multiple-item']}>{record['HQ Country'] as string}</span>
                          </div>
                            
                        </div>
                        <span>
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
                        <span>
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
                        
                        <span>
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
                          className={styles['fund-list-item']}>{convertedOutput(record['Suitability Score'] as string[] | string) as string || 'n/a'}</span>
                      </div>
                      <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem' }}></div>
                    </>
                  )) : <p>No data</p>
              }

            </div>
           
            
        }
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
                {/* for test, delete this afterwards */}
                <option key={'Shaoyan Li'} value={'Shaoyan Li'}>{'Shaoyan Li'}</option>
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