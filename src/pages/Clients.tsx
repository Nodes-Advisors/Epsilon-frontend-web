import { AsyncImage } from 'loadable-image'
import venture_logo from '../assets/images/venture-logo-example.png'
import Skeleton from 'react-loading-skeleton'
import { useEffect, useRef, useState } from 'react'

import { FieldSet, Record } from 'airtable'
import { useNavigate } from 'react-router-dom'
import { useClientsStore, useTokenStore } from '../store/store'
import CancelButtonIcon from '../assets/svgs/cancel-button.svg?react'
import styles from '../styles/profile.module.less'
import { convertedOutput } from '../lib/utils'
import type { CLIENT_FILTER_NAME } from '../lib/constants'
import CancelButton from '../assets/images/cancel.png'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useUserStore } from '../store/store'
import { throttle } from 'lodash'
import ReactPaginate from 'react-paginate'
import BookIcon from '../assets/images/book.png'
import { handleFullTextFilter } from '../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faNetworkWired, faRectangleList } from '@fortawesome/free-solid-svg-icons'


export default function Clients() {

  const[filterWindowPosition, setFilterWindowPosition] = useState<{ left: number, top: number }>({ left: 0, top: 0 })
  const [isLoading, setLoading] = useState(true)
  const filterNames: CLIENT_FILTER_NAME[] = ['Client', 'Location', 'Status', 'Transaction Type', 'Sector', 'Industry', 'Deal Type', 'Deal Size', 'Committed Investors', 'Active Funds', 'Success Rate', 'Predictor Score', 'Clear Filters']
  const [filterName, setFilterName] = useState<CLIENT_FILTER_NAME>('')
  const [filteredData, setFilteredData] = useState<Record<FieldSet>[]>([])
  const user = useUserStore(state => state.user)
  const [totalClientCount, setTotalClientCount] = useState<number>(0)
  const [showFilteredList, setShowFilteredList] = useState<boolean>(false)
  const [pipeline, setPipeline] = useState([])
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')
  const token = useTokenStore(state => state.token)
  const [filteredList, setFilteredList] = useState<{
    [key: string]: string[]
  }>(localStorage.getItem('client-filter') ? JSON.parse(localStorage.getItem('client-filter') as string) :{
    '': [],
    'Client': [],
    'Location': [],
    'Status': [],
    'Transaction Type': [],
    'Sector': [],
    'Industry': [],
    'Deal Type': [],
    'Deal Size': [],
    'Committed Investors': [],
    'Active Funds': [],
    'Success Rate': [],
    'Predictor Score': [],
    'Clear Filters': [],
  })

  useEffect(() => {
    
    if (token) {
      setLoading(true)
      axios.get('http://localhost:5001/getAllClients',
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
            'email': user?.email,
          },
        })
        .then((res) => {
          const updatedClients = res.data.map(client => {
            const filteredPipeline = filterPipelineByConditions(client);
            return { ...client, 'Active Funds': filteredPipeline };
          });
          setClients(updatedClients);
          setFilteredData(updatedClients)
       
          setTotalClientCount(updatedClients.length)
        
          if (localStorage.getItem('client-filter')) {
            const filteredList = JSON.parse(localStorage.getItem('client-filter') as string)
            if (Object.values(filteredList).every(filter => filter.length === 0)) {
              setFilteredData(clients)
              return
            }
            setFilteredData(clients.filter((record) => {
              return Object.keys(filteredList).every((filterName) => {
                // If no filter is set for this filterName, return false
                if (filteredList[filterName].length === 0) {
                  return true
                }
      
                switch (filterName) {
                case 'Client':
                  return filteredList[filterName].some((filter) => 
                    filter === record['name'] || (record['name'] && record['name'].includes(filter)),
                  )
                case 'Location':
                  // console.log(filteredList[filterName], 'filteredList[filterName]')
                  return filteredList[filterName].some((filter) => 
                    filter === record['hq location'] || (record['hq location'] && record['hq location'].includes(filter)),
                  )
                case 'Status':
                
                  return filteredList[filterName].some((filter) => 
                    filter === record['status'] || (record['status'] && record['status'].includes(filter)),
                  )
                case 'Transaction Type':
                  return filteredList[filterName].some((filter) => 
                    filter === record['transaction_type'] || (record['transaction_type'] && record['transaction_type'].includes(filter)),
                  )
                case 'Sector':
                  return filteredList[filterName].some((filter) => 
                    filter === record['sector'] || (record['sector'] && record['sector'].includes(filter)),
                  )
                case 'Industry':
                  return filteredList[filterName].some((filter) => 
                    filter === record['industry'] || (record['industry'] && record['industry'].includes(filter)),
                  )
                case 'Deal Type':
                  return filteredList[filterName].some((filter) => 
                    filter === record['deal_type'] || (record['deal_type'] && filter === record['deal_type'].toString()),
                  )
                case 'Deal Size':
                  return filteredList[filterName].some((filter) => 
                    filter === record['deal_size'] || (record['deal_size'] && filter === record['deal_size'].toString()),
                  )
                case 'Committed Investors':
                  return filteredList[filterName].some((filter) => 
                    filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
                  )
                case 'Active Funds':
                  //console.log(filterName)
                  return filteredList[filterName].some((filter) => 
                    filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
                  )
                case 'Success Rate':
                  return filteredList[filterName].some((filter) => 
                    filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
                  )
                case 'Predictor Score':
                  return filteredList[filterName].some((filter) => 
                    filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
                  )
                default:
                  return true
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
    }
  }, [token])

  useEffect(() => {
    // If no filter is applied, show all data
    // console.log(filteredList, 'filteredList')
    if (Object.values(filteredList).every(filter => filter.length === 0)) {
      setFilteredData(clients)
      return
    }
  
    // Apply filters cumulatively
    setFilteredData(clients.filter((record) => {
      return Object.keys(filteredList).every((filterName) => {
        // If no filter is set for this filterName, return false
        if (filteredList[filterName].length === 0) {
          return true
        }
  
        switch (filterName) {
        case 'Client':
          return filteredList[filterName].some((filter) => 
            filter === record['name'] || (record['name'] && record['name'].includes(filter)),
          )
        case 'Location':
          // console.log(filteredList[filterName], 'filteredList[filterName]')
          return filteredList[filterName].some((filter) => 
            filter === record['hq location'] || (record['hq location'] && record['hq location'].includes(filter)),
          )
        case 'Status':
            
          return filteredList[filterName].some((filter) => 
            filter === record['status'] || (record['status'] && record['status'].includes(filter)),
          )
        case 'Transaction Type':
          return filteredList[filterName].some((filter) => 
            filter === record['transaction_type'] || (record['transaction_type'] && record['transaction_type'].includes(filter)),
          )
        case 'Sector':
          return filteredList[filterName].some((filter) => 
            filter === record['sector'] || (record['sector'] && record['sector'].includes(filter)),
          )
        case 'Industry':
          return filteredList[filterName].some((filter) => 
            filter === record['industry'] || (record['industry'] && record['industry'].includes(filter)),
          )
        case 'Deal Type':
          return filteredList[filterName].some((filter) => 
            filter === record['deal_type'] || (record['deal_type'] && filter === record['deal_type'].toString()),
          )
        case 'Deal Size':
          return filteredList[filterName].some((filter) => 
            filter === record['deal_size'] || (record['deal_size'] && filter === record['deal_size'].toString()),
          )
        case 'Committed Investors':
          return filteredList[filterName].some((filter) => 
            filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
          )
        case 'Active Funds':
          return filteredList[filterName].some((filter) => 
            filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
          )
        case 'Success Rate':
          return filteredList[filterName].some((filter) => 
            filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
          )
        case 'Predictor Score':
          return filteredList[filterName].some((filter) => 
            filter === record[filterName] || (record[filterName] && record[filterName].includes(filter)),
          )
        default:
          return true
        }
      })
    }))
  }, [filteredList])

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
    fetchCompanyData()
  }, [])





  const [itemOffset, setItemOffset] = useState(0)
  const itemsPerPage = 10
  const endOffset = itemOffset + itemsPerPage
  const currentItems = filteredData.slice(itemOffset, endOffset)
  const pageCount = Math.ceil(filteredData.length / itemsPerPage)

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % filteredData.length
    setItemOffset(newOffset)
  }

  const filterPipelineByConditions = (record) => {
    const storedPipelineData = JSON.parse(localStorage.getItem('pipelineData')) || [];

    let LP_pitchedString = '';

    const filteredPipeline = storedPipelineData.filter(item => {
      const acronymMatch = record && record.acronym ? item.company_acronym?.toLowerCase() === record.acronym.toLowerCase() : false;
      const statusConditions = [
        item.pass_contacted === 0,
        item.pass_deck === 0,
        item.current_status !== "pass",
        item.pass_meeting === 0,
        item.pass_dd === 0,
        item.deck_request === 1 || item.meeting_request === 1 || item.dd === 1
      ];

      return acronymMatch && statusConditions.some(condition => condition);
    }).sort((a, b) => {
      return new Date(b.last_updated_status_date).getTime() - new Date(a.last_updated_status_date).getTime();
    });

    filteredPipeline.forEach((item, index) => {
      if (index > 0) {
        LP_pitchedString += ', '; // Add comma if not the first LP_pitched value
      }
      LP_pitchedString += item.LP_pitched;
    });

    //console.log('LP_pitchedString:', LP_pitchedString);

    return LP_pitchedString;
  };



  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }
  const throttledHandleInputChange = throttle(handleInputChange, 500)

  const clients = useClientsStore(state => state.clients)
  const setClients = useClientsStore(state => state.setClients)
  const navigate = useNavigate()
  // const randomColor = () => STATUS_COLOR_LIST[Math.floor(Math.random() * STATUS_COLOR_LIST.length)]

  function removeDuplicatesAndNull(arr) {
    // remove null or empty strings first
    // Split the strings into individual values
    let splitArr = arr.map(item => item ? item.toString() : '')
    splitArr = splitArr.flatMap(item => item ? item.split(',') : [])
    const trimmedArr = splitArr.map((item) => item.trim())
    // Remove duplicates and null or empty strings
    const uniqueArr = trimmedArr.filter((item, index, self) => 
      item && item.trim() !== '' && self.indexOf(item) === index,
    )
    return uniqueArr
  }
  const getFilteredList = (filterName: CLIENT_FILTER_NAME) => {
    switch (filterName) {
    case 'Client':
      return removeDuplicatesAndNull(clients.map((client) => client['name']))
    case 'Location':
      return removeDuplicatesAndNull(clients.map((client) => client['hq location']))
    case 'Status':
      return removeDuplicatesAndNull(clients.map((client) => client['status']))
    case 'Transaction Type':
      return removeDuplicatesAndNull(clients.map((client) => client['transaction_type']))
    case 'Sector':
      return removeDuplicatesAndNull(clients.map((client) => client['sector']))
    case 'Industry':
      return removeDuplicatesAndNull(clients.map((client) => client['industry']))
    case 'Deal Type':
      return removeDuplicatesAndNull(clients.map((client) => client['deal_type']))
    case 'Deal Size':
     
      return removeDuplicatesAndNull(clients.map((client) => client['deal_size']))
    case 'Committed Investors':
      return removeDuplicatesAndNull(clients.map((client) => client['Committed Investors']))
    case 'Active Funds':
      return removeDuplicatesAndNull(clients.map((client) => client['Active Funds']))
    case 'Success Rate':
      return removeDuplicatesAndNull(clients.map((client) => client['Success Rate']))
    case 'Predictor Score':
      return removeDuplicatesAndNull(clients.map((client) => client['Predictor Score']))
    default:
      return []
    }
  }

  const handleClickToFilter = (e: React.MouseEvent<HTMLSpanElement>) => {
    handleFullTextFilter(e, setFilteredList)
    //console.log('filter is' +filterName)
    setItemOffset(0)
  }


  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).nodeName === 'BUTTON') {
      const button = e.target as HTMLButtonElement
      const rect = button.getBoundingClientRect()
      // console.log(filterName)
      if (button.textContent === 'Clear Filters') {
        localStorage.removeItem('client-filter')
        setFilterName('')
        setShowFilteredList(false)
        setFilteredList({
          '': [],
          'Client': [],
          'Location': [],
          'Status': [],
          'Transaction Type': [],
          'Sector': [],
          'Industry': [],
          'Deal Type': [],
          'Deal Size': [],
          'Committed Investors': [],
          'Active Funds': [],
          'Success Rate': [],
          'Predictor Score': [],
          'Clear Filters': [],
        })
        return
      }
      setFilterWindowPosition({ left: rect.left, top: rect.top - button.clientHeight })
      
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      // console.log(target)
      // console.log(filterName)
      if (target.nodeName === 'BUTTON') {
        const button = target as HTMLButtonElement
      
        if (filterNames.includes(button.textContent as CLIENT_FILTER_NAME)) {
          if (button.textContent === 'Clear Filters') {
            localStorage.removeItem('filter')
            setFilterName('')
            setShowFilteredList(false)
            return
          }
          setFilterName(button.textContent as CLIENT_FILTER_NAME)
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

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems:'start', gap: '2rem', fontFamily: "'Calibri', sans-serif" }}>
      <div style={{ marginLeft: '4rem', marginTop: '2rem' }}>
        <div 
          style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <span>
        Filters:
          </span>
          {
            filterNames.map((name: CLIENT_FILTER_NAME) => (
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
              <span style={{ textAlign: 'left', fontSize: '1.5rem' }}>{filteredData.length === totalClientCount ? `${totalClientCount} Clients` : `${filteredData.length} Clients (out of ${totalClientCount} Clients)`}</span>
              <div style={{ fontSize: '1.15rem', display: 'grid', gap: '2rem', gridTemplateColumns: '2fr repeat(7, 1fr) 2fr 1fr 1fr', width: '100%', textAlign: 'left'  }}>
                <span>Clients</span>
                <span>Status</span>
                <span>Transaction Type</span>
                <span>Industry</span>
                <span>Sector</span>
                <span>Deal Type</span>
                <span>Deal Size</span>
                <span>Committed Investors</span>
                <span style={{ textAlign: 'center' }}>Active Funds</span>
                <span>Success Rate</span>
                <span>Predictor Score </span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem' }}></div>
                              
              {
                currentItems.length > 0
                  ?
                  currentItems.map((record, index) => (
                    <>
                      <div className={styles['cdivWithHover']} key={record._id} style={{ display: 'grid', lineHeight: 1, gap: '2rem', gridTemplateColumns: '2fr repeat(7, 1fr) 2fr 1fr 1fr' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem'  }}>

                          </div>
                          <div style={{ position: 'relative' }}>
                            <AsyncImage
                              onMouseEnter={(e) => { (e.target as HTMLElement).style.cursor = 'pointer'  }}
                              onClick={() => {
                                localStorage.setItem('client-filter', JSON.stringify(filteredList))
                                localStorage.setItem('client-id', record._id as string)
                                navigate(`/client-card/${record._id}`)
                              }}
                              src={record['logo'] ? (record['logo']) : venture_logo} style={{ borderRadius: '0.25rem', border: `0.25rem solid transparent`, width: '5rem', height: '5rem', objectFit: 'contain', background: 'rgba(255, 255, 255, 0.5)' }} />
                            {/* <FundStatus colorList={generateColorList(record['Contact'] ? (record['Contact'].split(',')).length : 0, record.Contact, record.Status)} /> */}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem', lineHeight: 1, alignItems: 'start' }}>
                            <span onClick={() => { 
                              localStorage.setItem('client-filter', JSON.stringify(filteredList))
                              localStorage.setItem('client-id', record._id as string) 
                              navigate(`/client-card/${record._id}`)  }} className={styles['fund-name']}>{record.name ? record.name as string : 'No Name Record'}</span>
                            <span>({record['acronym']})</span>
                            <span 
                              className={styles['fund-list-item']}
                              data-label='Location'
                              onClick={handleClickToFilter}
                              style={{  }}>{record['hq location'] ? record['hq location'] : 'No Location Record'}</span>
                          </div>
                            
                        </div>
                        <span className={styles['fund-list-item']}
                          data-label='Status'
                          onClick={handleClickToFilter}>
                          {convertedOutput(record['status'] as string[] | string) as string || 'n/a'}
                        </span>
                        <span
                          className={styles['fund-list-item']}
                          data-label='Transaction Type'
                          onClick={handleClickToFilter}
                        >
                          {convertedOutput(record['transaction_type']) as string || 'n/a'}
                        </span>
                        <span
                          className={styles['fund-list-item']}
                          data-label='Industry'
                          onClick={handleClickToFilter}
                        >
                          {convertedOutput(record['industry']) as string || 'n/a'}
                        </span>
                        <span
                          className={styles['fund-list-item']}
                          data-label='Sector'
                          onClick={handleClickToFilter}
                        >
                          {convertedOutput(record['sector']) as string || 'n/a'}
                        </span>
                        
                        <span
                          className={styles['fund-list-item']}
                          data-label='Deal Type'
                          onClick={handleClickToFilter}
                        >
                          {convertedOutput(record['deal_type']) as string || 'n/a'}
                        </span>

                        <span
                          className={styles['fund-list-item']}
                          data-label='Deal Size'
                          onClick={handleClickToFilter}
                        >
                          {convertedOutput(record['deal_size']) as string || 'n/a'}
                        </span>
                       
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Committed Investors'] as string[] | string) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'center' }}>
                          {record['Active Funds'] && typeof record['Active Funds'] === 'string' && record['Active Funds'].split(',').slice(0, 3).map((LP_pitched, index) => (
                            <span onClick={handleClickToFilter} data-label='Active Funds' className={styles['secbutton-style']}  key={index}>
                              {LP_pitched.trim()}
                            </span>
                          ))}
                            {record['Active Funds'] && typeof record['Active Funds'] === 'string' && record['Active Funds'].split(',').length > 3 && <div style={{ marginRight: '5px' }}>...</div>}
                        </span>




                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Success Rate'] as string[] | string) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Predictor Score'] as string[] | string) as string || 'n/a'}</span>
                       

                      </div>
                      <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem' }}></div>
                    </>
                  )) : <p>No data</p>
              }

            </div>
           
            
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
    </div>
  )
}