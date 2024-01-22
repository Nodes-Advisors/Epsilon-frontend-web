import { AsyncImage } from 'loadable-image'
import Skeleton from 'react-loading-skeleton'
import { useSavedFundsStore } from '../store/store'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import venture_logo from '../assets/images/venture-logo-example.png'
import styles from '../styles/profile.module.less'
import CancelButtonIcon from '../assets/svgs/cancel-button.svg?react'
import { convertedOutput } from '../lib/utils'
import { STATUS_COLOR_LIST } from '../lib/constants'

export default function SavedList() {
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


  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 3000)
  }
  , [])

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', zIndex: 100,
      alignItems:'start', gap: '2rem', fontFamily: "'Fira Code', monospace, 'Kalnia', serif" }}>
      <div style={{ marginLeft: '4rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <span>
        Filters:
          </span>
          <button style={{ backgroundColor: 'transparent', border: '#fff4 0.1rem solid' }}>Firm</button>
          <button style={{ backgroundColor: 'transparent', border: '#fff4 0.1rem solid' }}>Status</button>
          <button style={{ backgroundColor: 'transparent', border: '#fff4 0.1rem solid' }}>Type</button>
          <button style={{ backgroundColor: 'transparent', border: '#fff4 0.1rem solid' }}>Lead</button>
          <button style={{ backgroundColor: 'transparent', border: '#fff4 0.1rem solid' }}>Advanced Search</button>
          <button style={{ backgroundColor: 'transparent', border: '#fff4 0.1rem solid' }}>CLEAR FILTERS</button>
        </div>
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
              savedFunds.length > 0
                ?
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                  <span style={{ textAlign: 'left', fontSize: '1.5rem' }}>{savedFunds.length} Funds</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '3.2fr 2fr 2.5fr repeat(5, minmax(100px, 1.5fr))', gap: '1rem', width: '100%', textAlign: 'left'  }}>
                    <span style={{ fontSize: '1.15rem' }}>Funds</span>
                    <span style={{ fontSize: '1.15rem' }}>Account Manager</span>
                    <span style={{ fontSize: '1.15rem' }}>Sector</span>
                    <span style={{ fontSize: '1.15rem' }}>Type</span>
                    <span style={{ fontSize: '1.15rem' }}>People at the Fund</span>
                    <span style={{ fontSize: '1.15rem' }}>Deals</span>
                    <span style={{ fontSize: '1.15rem' }}>Co-Investors</span>
                    <span style={{ fontSize: '1.15rem' }}>Suitability Score</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem' }}></div>
                  {
                    savedFunds.map((record, index) => (
                      <>
                        <div key={record._id} style={{ display: 'grid', lineHeight: 1, width: '100%', gap: '1rem', gridTemplateColumns: '3.2fr 2fr 2.5fr repeat(5, minmax(100px, 1.5fr))' }}> 
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem'  }}>
                              <button
                                onClick={() => { localStorage.setItem('fund-id', record._id as string); navigate(`/fund-card/${record._id}`)  }}
                                style={{  outline: '0.1rem #fff solid', padding: '0.1rem 0.9rem', border: 'none', width: '7rem',  borderRadius: '0.2rem' }}>VIEW</button>
                              <button 
                                onClick={() => { 
                                  if (savedFunds.find((fund) => fund._id === record._id)) {
                                    deleteSavedFund(record)
                                  } 
                                }}
                                style={{ outline: '0.1rem #646cff solid', padding: '0.1rem 0.9rem', width: '7rem', borderRadius: '0.2rem' }}>{ 'DELETE'}</button>
                              <button 
                                onClick={() => setOpenRequestPanel(true)}
                                style={{ outline: '0.1rem #646cff solid', padding: '0.1rem 0.9rem', width: '7rem', borderRadius: '0.2rem' }}>
                                {'REQUEST'}
                              </button>
                            </div>
                            <div style={{ position: 'relative' }}>
                              <AsyncImage
                                onMouseEnter={(e) => { (e.target as HTMLElement).style.cursor = 'pointer'  }}
                                onClick={() => { localStorage.setItem('fund-id', record._id as string); navigate(`/fund-card/${record._id}`)  }}
                                src={record['Logo'] ? (record['Logo'] as ReadonlyArray<{ url: string }>)[0].url : venture_logo} style={{ borderRadius: '0.25rem', width: '5rem', height: '5rem', border: `0.25rem solid ${randomColor()}`, objectFit: 'contain', background: 'rgba(255, 255, 255, 0.8)' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem', lineHeight: 1, alignItems: 'start' }}>
                              <span style={{ color: '#807cc5', fontWeight: '600' }}>{record['Investor Name'] as string}</span>
                              <span style={{  }}>{record['Investor HQ Country'] as string}</span>
                            </div>
                            
                          </div>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left', maxHeight: '5rem' }}>{'Tyler Aroner, Eliott Harfouche, Iman Ghavami'}</span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left', maxHeight: '5rem' }}>{convertedOutput(record['Company Industry Code'] as string[] | string) as string || 'n/a'}</span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Deal Class'] as string[] | string) as string || 'n/a'}</span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Lead Partner at Investment Firm'] as string[] | string) || 'n/a'}</span>
                          <span></span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['Co-Investors'] as string[] | string) || 'n/a'}</span>
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
          <form style={{ margin: '2.5rem 2.5rem 0 2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem'  }}>
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
            <button onClick={() => setPopoverOpen(false)}>send</button>
          </form>
        </div>
      </div>
    </div>

  )
}