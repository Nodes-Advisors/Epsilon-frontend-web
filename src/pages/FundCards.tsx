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

export default function FundCards() {
  const [isLoading, setLoading] = useState(true)
  const [data, setData] = useState<Record<FieldSet>[]>([])
  const getfcs = useCallback((apikey: string | undefined, baseId: string | undefined) => getFundCards(apikey, baseId)
    , [])
  const [requestName, setRequestName] = useState<string>('')
  const [approvers, setApprovers] = useState<string>('')
  const [details, setDetails] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  const savedFunds = useSavedFundsStore(state => state.savedFunds)
  const deleteSavedFund = useSavedFundsStore(state => state.deleteSavedFund)
  const addSavedFund = useSavedFundsStore(state => state.addSavedFund)
  
  const inSavedFunds = (record: any) => savedFunds.find((fund) => fund.id === record.id)
  const [openRequestPanel, setOpenRequestPanel] = useState(false)
  const setFunds = useFundsStore(state => state.setFunds)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    getfcs(import.meta.env.VITE_AIRTABLE_API_KEY, import.meta.env.VITE_AIRTABLE_BASE_ID)
    
      .then((data) => {
        setData(data)
        setFunds(data)
        // console.log(data)
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems:'start', gap: '2rem', fontFamily: "'Fira Code', monospace, 'Kalnia', serif" }}>
      <div style={{ marginLeft: '4rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <span>
        Filters:
          </span>
          <button style={{ backgroundColor: 'transparent', border: '#fff4 0.1rem solid' }}>Firm</button>
          <button style={{ backgroundColor: 'transparent', border: '#fff4 0.1rem solid' }}>Status</button>
          <button style={{ backgroundColor: 'transparent', border: '#fff4 0.1rem solid' }}>Stage</button>
          <button style={{ backgroundColor: 'transparent', border: '#fff4 0.1rem solid' }}>Lead</button>
          <button style={{ backgroundColor: 'transparent', border: '#fff4 0.1rem solid' }}>Advanced Search</button>
          <button style={{ backgroundColor: 'transparent', border: '#fff4 0.1rem solid' }}>CLEAR FILTERS</button>
        </div>
        <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem' }}></div>
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
              data.length > 0
                ?
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                  <span style={{ textAlign: 'left', fontSize: '1.5rem' }}>{data.length} Funds</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '3.5fr 2fr 2.5fr repeat(5, minmax(100px, 1.5fr))', width: '100%', textAlign: 'left'  }}>
                    <span style={{ fontSize: '1.15rem' }}>Funds</span>
                    <span style={{ fontSize: '1.15rem' }}>Account Manager</span>
                    <span style={{ fontSize: '1.15rem' }}>Sector</span>
                    <span style={{ fontSize: '1.15rem' }}>Type</span>
                    <span style={{ fontSize: '1.15rem' }}>Lead Partner</span>
                    <span style={{ fontSize: '1.15rem' }}>Deals</span>
                    <span style={{ fontSize: '1.15rem' }}>Co-investors</span>
                    <span style={{ fontSize: '1.15rem' }}>Score</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem' }}></div>
                  {
                    data.map((record, index) => (
                      <>
                        <div key={record.id} style={{ display: 'grid', lineHeight: 1, width: '100%', gridTemplateColumns: '3.5fr 2fr 2.5fr repeat(5, minmax(100px, 1.5fr))' }}> 
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
                            <AsyncImage
                              onMouseEnter={(e) => { (e.target as HTMLElement).style.cursor = 'pointer'  }}
                              onClick={() => { localStorage.setItem('fund-id', record.get('Investor ID') as string); navigate(`/fund-card/${record.get('Investor ID')}`)  }}
                              src={record.get('Logo') ? (record.get('Logo') as ReadonlyArray<{ url: string }>)[0].url : venture_logo} style={{ borderRadius: '0.25rem', width: '5rem', height: '5rem', objectFit: 'contain', background: 'rgba(255, 255, 255, 0.8)' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem', lineHeight: 1, alignItems: 'start' }}>
                              <span style={{ color: 'orange', fontWeight: '600' }}>{record.get('Investor Name') as string}</span>
                              <span style={{  }}>{record.get('Investor HQ Country') as string}</span>
                            </div>
                            <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: index % 3 === 0 ? (index%3 === 1 ? '#00ff00' : '#00ff00') : '#ff0000'}}></div>
                          </div>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', width: '15rem', textAlign: 'left', maxHeight: '5rem' }}>{'Tyler Aroner, Eliott Harfouche, Iman Ghavami'}</span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', width: '20rem', textAlign: 'left', maxHeight: '5rem' }}>{record.get('Company Industry Code') as string || 'n/a'}</span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', width: '10rem', textAlign: 'left' }}>{record.get('Deal Class') as string || 'n/a'}</span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', width: '10rem', textAlign: 'left' }}>{record.get('Lead Partner at Investment Firm') as string || 'n/a'}</span>
                          <span></span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', width: '10rem', textAlign: 'left' }}>{record.get('Co-investors') as string || 'n/a'}</span>
                        
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem' }}></div>
                      </>
                    ))
                  }
                </div>
                :
                (
                  <p>No data</p>
                )
            )
        }
      </div>
      <div  className={styles['popover-background']} style={{ visibility: openRequestPanel ? 'visible' : 'hidden', fontFamily: "'Fira Code', monospace, 'Kalnia', serif" }}>
        <div className={styles['popover-form']}>
          <div style={{ margin: '2.5rem 2.5rem 0 2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem'  }}>
            <div className={styles['popover-form-title']}>
             
              <span style={{ textAlign: 'start', display: 'block' }}>Create a new request</span>
              <CancelButtonIcon className={styles['cancelbutton']} onClick={() => setOpenRequestPanel(false)} />
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Name of request</span>
              <input style={{ marginTop: '1rem', fontSize: '1.75rem', border: 'none', outline: 'none', width: '100%', background: '#eee',
                borderBottom: requestName && requestName !== '' ? 'blue 1px solid' : 'red 1px solid' }} 
              ref={inputRef} 
              onChange={(e) => setRequestName(e.target.value)}
              placeholder='Use a name that&apos;s easy to understand' />
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Approvers</span>
              <input style={{ marginTop: '1rem', marginBottom: '0.2rem', padding: '0.5rem 0 0.5rem 0.5rem', fontSize: '1.25rem', background: '#eee', border: 'none', outline: 'none', width: '100%', 
                borderBottom: approvers && approvers !== '' ? 'red 1px solid' : 'none' }} 
              onChange={(e) => setApprovers(e.target.value)}
              placeholder='Enter names here' />
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Priority</span>
              <select
                style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem 0.5rem 0.2rem', marginTop: '1rem' }} name="Priority" id="">
                <option  value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Additional details</span>
              <textarea style={{ marginTop: '1rem', padding: '0.5rem 0 0.5rem 0.5rem', fontSize: '1.25rem', background: '#eee', border: 'none', outline: 'none', width: '100%', minWidth: '100%', minHeight: '5rem', maxHeight: '10rem',
                borderBottom: details && details !== '' ? 'blue 1px solid' : 'none' }}
              onChange={(e) => setDetails(e.target.value)}
              placeholder='If needed, add some extra info that will help recipients learn more about the request' />

            </div>
            <button onClick={() => setOpenRequestPanel(false)}>send</button>
          </div>
         
        </div>
      </div>
    </div>
  )
}