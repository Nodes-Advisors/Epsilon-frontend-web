import { AsyncImage } from 'loadable-image'
import venture_logo from '../assets/images/venture-logo-example.png'
import Skeleton from 'react-loading-skeleton'
import { useCallback, useEffect, useState } from 'react'
import { getFundCards } from '../lib/airtable'
import { FieldSet, Record } from 'airtable'
import { useNavigate } from 'react-router-dom'
import { useFundsStore } from '../store/store'
import { useSavedFundsStore } from '../store/store'

export default function FundCards() {
  const [isLoading, setLoading] = useState(true)
  const [data, setData] = useState<Record<FieldSet>[]>([])
  const getfcs = useCallback((apikey: string | undefined, baseId: string | undefined) => getFundCards(apikey, baseId)
    , [])
  // useEffect(() => {
  //   setTimeout(() => {
  //     setLoading(false)
  //   }, 3000)
  // }
  // , [])

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems :'start', marginLeft: '4rem', gap: '2rem', marginTop: '2rem', fontFamily: "'Fira Code', monospace, 'Kalnia', serif" }}>
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
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', width: '20rem', textAlign: 'left', maxHeight: '5rem' }}>{'Tyler Aroner, Eliott Harfouche, Iman Ghavami'}</span>
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
  )
}