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
  LOCATION_LIST, 
  FIRM_NAMES, 
  TYPE_LIST, 
  SECTOR_LIST, 
  COINVESTORS_LIST,
  STATUS_LIST,
} from '../lib/constants'
import type { FILTER_NAME } from '../lib/constants'
import CancelButton from '../assets/images/cancel.png'

export default function FundCards() {
  const filterNames: FILTER_NAME[] = ['Firm', 'Location', 'Status', 'Stage', 'Lead', 'Advanced Search', 'Clear Filters']
  const [isLoading, setLoading] = useState(true)
  const [data, setData] = useState<Record<FieldSet>[]>([])
  const getfcs = useCallback((apikey: string | undefined, baseId: string | undefined) => getFundCards(apikey, baseId)
    , [])
  const [requestName, setRequestName] = useState<string>('')
  const [approvers, setApprovers] = useState<string>('')
  const [details, setDetails] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [filterName, setFilterName] = useState<FILTER_NAME>('')
  
  const[filterWindowPosition, setFilterWindowPosition] = useState<{ left: number, top: number }>({ left: 0, top: 0 })
  const [showFilteredList, setShowFilteredList] = useState<boolean>(false)
  const [filteredList, setFilteredList] = useState<{
    '': string[],
    'Firm': string[],
    'Location': string[],
    'Status': string[],
    'Stage': string[],
    'Lead': string[],
    'Advanced Search': string[],
    'Clear Filters': string[],
  }>({
    '': [],
    'Firm': [],
    'Location': [],
    'Status': [],
    'Stage': [],
    'Lead': [],
    'Advanced Search': [],
    'Clear Filters': [],
  })
  const savedFunds = useSavedFundsStore(state => state.savedFunds)
  const deleteSavedFund = useSavedFundsStore(state => state.deleteSavedFund)
  const addSavedFund = useSavedFundsStore(state => state.addSavedFund)
  const inSavedFunds = (record: any) => savedFunds.find((fund) => fund.id === record.id)
  
  const [openRequestPanel, setOpenRequestPanel] = useState(false)
  const setFunds = useFundsStore(state => state.setFunds)
  const navigate = useNavigate()
  const randomColor = () => STATUS_COLOR_LIST[Math.floor(Math.random() * STATUS_COLOR_LIST.length)]

  useEffect(() => {
    setLoading(true)
    getfcs(import.meta.env.VITE_AIRTABLE_API_KEY, import.meta.env.VITE_AIRTABLE_BASE_ID)
    
      .then((data) => {
        setData(data)
        setFunds(data)        
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

  const getFilteredList = (filterName: FILTER_NAME) => {
    switch (filterName) {
    case 'Firm':
      return FIRM_NAMES
    case 'Location':
      return LOCATION_LIST
    case 'Status':
      return STATUS_LIST
    case 'Stage':
      return TYPE_LIST
    case 'Lead':
      return ['Tyler Aroner', 'Eliott Harfouche', 'Iman Ghavami']
    case 'Advanced Search':
      return ['Advanced Search']
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
          'Firm': [],
          'Location': [],
          'Status': [],
          'Stage': [],
          'Lead': [],
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
                  name !== 'Clear Filters' && (filteredList[name] as string[]).length > 0
                    ? <span>{`${name}\u0020\u00B7\u0020${filteredList[name].length}`}</span>
                    : name
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
        <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem', margin: '1rem' }}></div>
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

            <div key={'fund-cards'} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <span style={{ textAlign: 'left', fontSize: '1.5rem' }}>{data.length} Funds</span>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '3.2fr 2fr 2.5fr repeat(5, minmax(100px, 1.5fr))', width: '100%', textAlign: 'left'  }}>
                <span style={{ fontSize: '1.15rem' }}>Funds</span>
                <span style={{ fontSize: '1.15rem' }}>Account Manager</span>
                <span style={{ fontSize: '1.15rem' }}>Sector</span>
                <span style={{ fontSize: '1.15rem' }}>Type</span>
                <span style={{ fontSize: '1.15rem' }}>People at the Fund</span>
                <span style={{ fontSize: '1.15rem' }}>Deals</span>
                <span style={{ fontSize: '1.15rem' }}>Co-investors</span>
                <span style={{ fontSize: '1.15rem' }}>Suitability Score</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem' }}></div>
                              
              
              {
                data.length > 0
                  ?
                  data.map((record, index) => (
                    <>
                      <div key={record.id} style={{ display: 'grid', lineHeight: 1, width: '100%', gap: '1rem', gridTemplateColumns: '3.2fr 2fr 2.5fr repeat(5, minmax(100px, 1.5fr))' }}> 
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem'  }}>
                            <button
                              onClick={() => { localStorage.setItem('fund-id', record.get('Investor ID') as string); navigate(`/fund-card/${record.get('Investor ID')}`)  }}
                              style={{  outline: '0.1rem #fff solid', padding: '0.1rem 0.9rem', border: 'none', width: '7rem',  borderRadius: '0.2rem' }}>VIEW</button>
                            <button 
                              onClick={() => { 
                                if (savedFunds.find((fund) => fund.id === record.id)) {
                                  deleteSavedFund(record)
                                } else {
                                  addSavedFund(record)
                                }
                              }}
                              style={{ outline: '0.1rem #646cff solid', padding: '0.1rem 0.9rem', width: '7rem', borderRadius: '0.2rem' }}>{inSavedFunds(record) ? 'SAVED' : 'SAVE'}</button>
                            <button 
                              onClick={() => setOpenRequestPanel(true)}
                              style={{ outline: '0.1rem #646cff solid', padding: '0.1rem 0.9rem', width: '7rem', borderRadius: '0.2rem' }}>
                              {'REQUEST'}
                            </button>
                          </div>
                          <div style={{ position: 'relative' }}>
                            <AsyncImage
                              onMouseEnter={(e) => { (e.target as HTMLElement).style.cursor = 'pointer'  }}
                              onClick={() => { localStorage.setItem('fund-id', record.get('Investor ID') as string); navigate(`/fund-card/${record.get('Investor ID')}`)  }}
                              src={record.get('Logo') ? (record.get('Logo') as ReadonlyArray<{ url: string }>)[0].url : venture_logo} style={{ borderRadius: '0.25rem', border: `0.25rem solid ${randomColor()}`, width: '5rem', height: '5rem', objectFit: 'contain', background: 'rgba(255, 255, 255, 0.8)' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem', lineHeight: 1, alignItems: 'start' }}>
                            <span style={{ color: 'rgb(128, 124, 197)', fontWeight: '600' }}>{record.get('Investor Name') as string}</span>
                            <span style={{  }}>{record.get('Investor HQ Country') as string}</span>
                          </div>
                            
                        </div>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left', maxHeight: '5rem' }}>{'Tyler Aroner, Eliott Harfouche, Iman Ghavami'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left', maxHeight: '5rem' }}>{convertedOutput(record.get('Company Industry Code') as string | string[]) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record.get('Deal Class') as string[] | string) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record.get('Lead Partner at Investment Firm') as string[] | string) as string || 'n/a'}</span>
                        <span></span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record.get('Co-investors') as string[] | string) as string || 'n/a'}</span>
                        
                      </div>
                      <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem' }}></div>
                    </>
                  )) : <p>No data</p>
              }
            </div>
           
            
        }
      </div>
      <div className={styles['popover-background']} style={{ visibility: openRequestPanel ? 'visible' : 'hidden' }}>
        <div className={styles['popover-form']}>
          <form style={{ margin: '2.5rem 2.5rem 0 2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem'  }}>
            <div className={styles['popover-form-title']}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {/* <AsyncImage src={isLoading  ? '' : (recordRef.current!.fields['Logo'] as ReadonlyArray<{ url: string }>)[0].url} alt='' 
                  style={{  width: ' 4.57144rem', height: '4.47456rem', objectFit: 'contain', borderRadius: '50%', border: '3px solid #5392d4' }}

                  draggable='false' onContextMenu={e => e.preventDefault()} /> */}
                <div>
                  {/* <span style={{ textAlign: 'start', display: 'block' }}>Regarding <span style={{ fontWeight: '700', fontSize: '1.3rem' }}>{recordRef.current ? recordRef.current.fields['Investor Name'] as string : 'no name'}</span></span> */}
                  <span style={{ textAlign: 'start', display: 'block' }}>Create a new request</span>
                </div>
              </div>
              <CancelButtonIcon className={styles['cancelbutton']} onClick={() => setOpenRequestPanel(false)} />
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Type of Request</span>
              <select
                style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem', marginTop: '1rem' }} name="Type of Request" id="">
                <option value="Letme">Bypass the approval</option>
                <option value="Assign">Assign the fund request to</option>
              </select>
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Approvers or Assignees</span>
              <select
                style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem 0.5rem', marginTop: '1rem' }} name="Approvers or Assignees" id="">
                <option value="Tyler Aroner">Tyler Aroner</option>
                <option value="Eliott Harfouche">Eliott Harfouche</option>
                <option value="Iman Ghavami">Iman Ghavami</option>
              </select>
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Type of Deal</span>
              <select
                style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem 0.5rem', marginTop: '1rem' }} name="Type of Deal" id="">
                <option value="Deal I">Deal I</option>
                <option value="Deal II">Deal II</option>
                <option value="Deal III">Deal III</option>
              </select>
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Contact Person</span>
              <select
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
            <button onClick={() => setOpenRequestPanel(false)}>send</button>
          </form>
        </div>
      </div>
    </div>
  )
}