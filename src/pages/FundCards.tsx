import { AsyncImage } from 'loadable-image'
import venture_logo from '../assets/images/venture-logo-example.png'
import Skeleton from 'react-loading-skeleton'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getFundCards } from '../lib/airtable'
import { FieldSet, Record } from 'airtable'
import { useNavigate } from 'react-router-dom'
import { useFundsStore } from '../store/store'
import { useSavedFundsStore } from '../store/store'
import CancelButtonIcon from '../assets/svgs/cancel-button.svg?react'
import styles from '../styles/profile.module.less'
import { convertedOutput } from '../lib/utils'
import { STATUS_COLOR_LIST, 
  STATUS_LIST,
} from '../lib/constants'
import type { FILTER_NAME } from '../lib/constants'
import CancelButton from '../assets/images/cancel.png'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useUserStore } from '../store/store'
import FundStatus from '../components/status'
import { throttle } from 'lodash'

export default function FundCards() {

  const [fundStatus, setFundStatus] = useState<object[]>([])
  const filterNames: FILTER_NAME[] = ['Account Manager', 'Investors', 'Location', 'Status', 'Type', 'Contact', 'Suitability Score', 'Co-Investors', 'Clear Filters']
  const [isLoading, setLoading] = useState(true)
  const [data, setData] = useState<Record<FieldSet>[]>([])
  const [filteredData, setFilteredData] = useState<Record<FieldSet>[]>([])
  const [requestName, setRequestName] = useState<string>('bypass approval')
  const [approvers, setApprovers] = useState<string>('Tyler Aroner')
  const [deal, setDeal] = useState<string>('Deal I')
  const [contactPerson, setContactPerson] = useState<string>('Person A')
  const [details, setDetails] = useState<string>('nothing')
  const [priority, setPriority] = useState<string>('High')
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
  const [filteredList, setFilteredList] = useState<{
    '': string[],
    'Account Manager': string[],
    'Investors': string[],
    'Location': string[],
    'Status': string[],
    'Type': string[],
    'Contact': string[],
    'Suitability Score': string[],
    'Co-Investors': string[],
    'Clear Filters': string[],
  }>({
    '': [],
    'Account Manager': [],
    'Investors': [],
    'Location': [],
    'Status': [],
    'Type': [],
    'Contact': [],
    'Suitability Score': [],
    'Co-Investors': [],
    'Clear Filters': [],
  })
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
    // If no filter is applied, show all data
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
          return filteredList[filterName].includes(record['HQ Country'] as string)
              || (record['HQ Country'] && record['HQ Country'].includes(filteredList[filterName] as string))
        case 'Status':
          return STATUS_LIST
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
        default:
          return false
        }
      })
    }))
  }, [filteredList])

  useEffect(() => {
    axios.get('http://localhost:5001/fundStatus').then((res) => { 
      setFundStatus(res.data)
    }).catch((error) => {
      toast.error(error?.response?.data)
    })
  }, [])

  const savedFunds = useSavedFundsStore(state => state.savedFunds)
  const deleteSavedFund = useSavedFundsStore(state => state.deleteSavedFund)
  const addSavedFund = useSavedFundsStore(state => state.addSavedFund)
  const inSavedFunds = (record: any) => savedFunds.find((fund) => fund._id === record._id)
  
  const [openRequestPanel, setOpenRequestPanel] = useState(false)
  const setFunds = useFundsStore(state => state.setFunds)
  const navigate = useNavigate()
  const randomColor = () => STATUS_COLOR_LIST[Math.floor(Math.random() * STATUS_COLOR_LIST.length)]
  const generateColorList = (length) => {
    // console.log(length)
    const colorList = []
    for (let i = 0; i < length; i++) {
      const color = randomColor()
      colorList.push(color)
    }
    // console.log(colorList)
    return colorList
  }
  useEffect(() => {
    setLoading(true)
    axios.get('http://localhost:5001/getAllFunds')
      .then((res) => {
        setData(res.data)
        setFunds(res.data)  
        setFilteredData(res.data)      
        // console.log(
        //   [...new Set(data.map((fund) => fund.get('Co-investors')).flat())],
        // )
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

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
    case 'Investors':
      return removeDuplicatesAndNull(data.map((record) => record['Funds'] as string))
    case 'Location':
      return removeDuplicatesAndNull(data.map((record) => record['HQ Country'] as string))
    case 'Status':
      return removeDuplicatesAndNull(STATUS_LIST)
    case 'Type':
      // console.log(data.map((record) => (record['Type'])))
      return removeDuplicatesAndNull(data.map((record) => record['Type'] as string))
    case 'Contact':
      return removeDuplicatesAndNull(data.map((record) => record['Contact'] as string))
    case 'Suitability Score':
      return ['>90', '>80', '60-80', '<60']
    case 'Co-Investors':
      return removeDuplicatesAndNull(data.map((record) => record['Co-Investors'] as string))
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
        setFilterName('')
        setShowFilteredList(false)
        setFilteredList({
          '': [],
          'Account Manager': [],
          'Investors': [],
          'Location': [],
          'Status': [],
          'Type': [],
          'Contact': [],
          'Co-Investors': [],
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
    } catch (error) {
      toast.error(error?.response?.data)
    }
  }

  const handleSavedCollections = async (e) => {
    e.preventDefault()
    
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

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems:'start', gap: '2rem', fontFamily: "'Fira Code', monospace, 'Kalnia', serif" }}>
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
                  style={{ display: 'flex', flex: 9, flexWrap: 'wrap', gap: '0.3rem', padding: '0.2rem' }}>
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
                    autoComplete='off'
                    aria-autocomplete='none'
                    placeholder='Search'
                    onKeyDown={(e) => {
                      e.stopPropagation()

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
                    // if (inputValue) {
                    //   setInputValue('')
                    // }
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
              <span style={{ textAlign: 'left', fontSize: '1.5rem' }}>{filteredData.length} Funds</span>
              <div style={{ fontSize: '1.15rem', display: 'grid', gap: '2rem', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr 2.5fr repeat(4, 1.5fr)', width: '100%', textAlign: 'left'  }}>
                <span>Funds</span>
                <span>Status</span>
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
                filteredData.length > 0
                  ?
                  filteredData.map((record, index) => (
                    <>
                      <div key={record._id} style={{ display: 'grid', lineHeight: 1, gap: '2rem', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr 2.5fr repeat(4, 1.5fr)' }}> 
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem'  }}>
                            <button
                              onClick={() => { localStorage.setItem('fund-id', record._id as string); navigate(`/fund-card/${record._id}`)  }}
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
                              onClick={() => { localStorage.setItem('fund-id', record._id as string); navigate(`/fund-card/${record._id}`)  }}
                              src={record['Logo'] ? (record['Logo']) : venture_logo} style={{ borderRadius: '0.25rem', border: `0.25rem solid transparent`, width: '5rem', height: '5rem', objectFit: 'contain', background: 'rgba(255, 255, 255, 0.5)' }} />
                            <FundStatus colorList={record['Contact'] ? generateColorList((record['Contact'].split(',')).length) : []} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem', lineHeight: 1, alignItems: 'start' }}>
                            <span onClick={() => { localStorage.setItem('fund-id', record._id as string); navigate(`/fund-card/${record._id}`)  }} className={styles['fund-name']}>{record['Funds'] as string}</span>
                            <span style={{  }}>{record['HQ Country'] as string}</span>
                          </div>
                            
                        </div>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Status'] as string[] | string) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Deals'] as string[] | string) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Account Manager'] as string | string[]) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left', whiteSpace: 'preserve-breaks', maxHeight: '5rem' }}>{convertedOutput(record['Sector'] as string | string[]) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Type'] as string[] | string) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Contact'] as string[] | string) as string || 'n/a'}</span>
                        
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Co-Investors'] as string[] | string) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Suitability Score'] as string[] | string) as string || 'n/a'}</span>
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
                onChange={(e) => setRequestName(e.target.value)}
                style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem', marginTop: '1rem' }} name="Type of Request" id="">
                <option value="bypass approval">Bypass the approval</option>
                <option value="assign the fund request to">Assign the fund request to</option>
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