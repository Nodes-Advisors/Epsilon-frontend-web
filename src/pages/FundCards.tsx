import { AsyncImage } from 'loadable-image'
import venture_logo from '../assets/images/venture-logo-example.png'
import Skeleton from 'react-loading-skeleton'
import { useCallback, useEffect, useState } from 'react'
import { getFundCards } from '../lib/airtable'
import { FieldSet, Record } from 'airtable'
import { useNavigate } from 'react-router-dom'
import { useFundsStore } from '../store/store'

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems :'center' }}>
      <h1>Fund Cards</h1>
      {
        isLoading 
          ? 
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4rem' }}>
            {
              Array(30).fill(0).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', lineHeight: 1 }}> 
                  <Skeleton width={'5.0rem'} height={'5rem'}  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem', lineHeight: 1 }}>
                    <Skeleton width={'16.0rem'} height={'1.4rem'} />
                    <Skeleton width={'7rem'} height={'1.2rem'} />
                  </div>
                </div>
              ))
            }
          </div>
          :
          (
            data.length > 0
              ?
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3rem' }}>
                {
                  data.map((record) => (
                    <div key={record.id} style={{ display: 'flex', gap: '1rem', lineHeight: 1 }}> 
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem'  }}>
                        <button
                          onClick={() => { localStorage.setItem('fund-id', record.get('Investor ID') as string); navigate(`/fund-card/${record.get('Investor ID')}`)  }}
                          style={{  outline: '0.1rem #fff solid', padding: '0.2rem 0.9rem', border: 'none' }}>view</button>
                        <button style={{  outline: '0.1rem #646cff solid', padding: '0.2rem 0.9rem'  }}>save</button>
                      </div>
                      <AsyncImage
                        onMouseEnter={(e) => { (e.target as HTMLElement).style.cursor = 'pointer'  }}
                        onClick={() => { localStorage.setItem('fund-id', record.get('Investor ID') as string); navigate(`/fund-card/${record.get('Investor ID')}`)  }}
                        src={record.get('Logo') ? (record.get('Logo') as ReadonlyArray<{ url: string }>)[0].url : venture_logo} style={{ borderRadius: '0.25rem', width: '5rem', height: '5rem', objectFit: 'contain', background: 'rgba(255, 255, 255, 0.8)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem', lineHeight: 1, alignItems: 'start' }}>
                        <span>{record.get('Investor Name') as string}</span>
                        <span>{record.get('Investor HQ Country') as string}</span>
                      </div>
                    </div>
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