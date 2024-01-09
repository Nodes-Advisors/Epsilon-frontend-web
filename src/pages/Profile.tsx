import styles from '../styles/profile.module.less'
// import { cx } from '../lib/utils'
import venture_logo from '../assets/images/venture-logo-example.png'
import ActionButton from '../components/action-button'
import LocationIcon from '../assets/svgs/location.svg?react'
import NodesIcon from '../assets/svgs/nodes.svg?react'
import StatusIcon from '../assets/svgs/status.svg?react'
import EpsilonLogo from '../assets/svgs/epsilon_logo.svg?react'
import DotCircleIcon from '../assets/svgs/dot-circle.svg?react'
import YCLogo from '../assets/images/yc_logo.png'
import VectorLogo from '../assets/svgs/vector.svg?react'
import HeadImg from '../assets/images/headimg-example.png'
import { useState, useEffect, useRef } from 'react'
import { AsyncImage } from 'loadable-image'
import Skeleton from 'react-loading-skeleton'
import { useLocation } from 'react-router-dom'
import { useFundsStore, useSavedFundsStore } from '../store/store'
import { Popover } from '@headlessui/react'
import { FieldSet, Record } from 'airtable'
import CancelButtonIcon from '../assets/svgs/cancel-button.svg?react'

// import { useAuth0 } from '@auth0/auth0-react'
export default function Profile(): JSX.Element {
  // const { user, isLoading } = useAuth0()
  const [isLoading, setLoading] = useState(true)
  const recordRef = useRef<Record<FieldSet> | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [isPopoverOpen, setPopoverOpen] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [requestName, setRequestName] = useState<string | null>(null)
  const [approvers, setApprovers] = useState<string | null>(null)
  const [details, setDetails] = useState<string | null>(null)

  const savedFunds = useSavedFundsStore(state => state.savedFunds)
  const deleteSavedFund = useSavedFundsStore(state => state.deleteSavedFund)
  const addSavedFund = useSavedFundsStore(state => state.addSavedFund)

  useEffect(() => {
    // console.log(funds)
    const record = funds.filter((record) => record.fields['Investor ID'] === id)[0]
    console.log(record.id)
    console.log(savedFunds)
    setLocation(['Investor HQ City', 'Investor HQ State/Province', 'Investor HQ Country' ].reduce((acc, cur, curIndex, array) =>
      acc += record.fields[cur] ? curIndex !== array.length - 1 ? record.fields[cur] + ', ' : record.fields[cur] : '', ''))
    recordRef.current = record
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const funds = useFundsStore(state => state.funds)
  const id = localStorage.getItem('fund-id')
  if (!id) {
    throw new Error('fund id not found')
  }
  
  const addRequest = () => {
    setPopoverOpen(true)
  }


  return (
    <div 
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'start', minHeight: '80vh' }}>
      <div style={{ display: 'flex', marginTop: '10vh' }}>
        <div className={styles['left-panel']}>
          {
            isLoading 
              ? 
              <Skeleton className={styles['venture-logo']}  />
              : 
              <AsyncImage src={(recordRef.current!.fields['Logo'] as ReadonlyArray<{ url: string }>)[0].url} alt='' 
                style={{  width: ' 20.57144rem', height: '20.47456rem', objectFit: 'contain', backgroundColor: '#999' }}

                draggable='false' onContextMenu={e => e.preventDefault()} />
          }
          <div className={styles['action-buttons']}>
            <ActionButton 
              onClick={() => alert('startup match')} 
              buttonClass={styles['action-button']} 
              textClass={styles['action-button-text']} 
              text='STARTUP MATCH' />
            <ActionButton
              onClick={addRequest}
              buttonClass={styles['action-button']} 
              textClass={styles['action-button-text']} 
              text='ADD A REQUEST' />
            <ActionButton
              onClick={() => recordRef && recordRef.current && savedFunds.find((fund) => fund.id === recordRef.current?.id) ? deleteSavedFund(recordRef.current) : addSavedFund(recordRef.current)}
              buttonClass={styles['action-button']} 
              textClass={styles['action-button-text']} 
              text= {savedFunds.find((fund) => fund.id === recordRef.current?.id) ? 'REMOVE FROM LIST' : 'ADD TO LIST'} />
          </div>
          <div>
            <div className={styles['horizontal-flex-layout']} >
              <VectorLogo className={styles['vector-logo']} />
              <h2 className={styles['relationship-text']}>Relationships</h2>
              <VectorLogo className={styles['vector-logo']} />
            </div>
            <div className={styles['horizontal-flex-layout']}>
              {
                isLoading 
                  ?
                  <>
                    <Skeleton className={styles['headImg']} />
                    <div className={`${styles['vertical-flex-align-flex-start-layout']}` } >
                      <Skeleton className={styles['relationship-inner-text']} />
                      <Skeleton className={styles['relationship-inner-text-action']} />
                    </div>
                    <Skeleton className={styles['headImg']}/>
                  </>  
                  :
                  <>
                    <img src={HeadImg} alt="" className={styles['headImg']} />
                    <div className={`${styles['vertical-flex-align-flex-start-layout']}` } >
                      <span className={styles['relationship-inner-text']}>BEN HOrowitz</span>
                      <span className={styles['relationship-inner-text-action']}>Deck Reviewing</span>
                    </div>
                    <img src={HeadImg} alt="" className={styles['headImg']} />
                  </>
              }     
            </div>
            
          </div>
        </div>
        <div className={styles['middle-panel']}>
          <div className={styles['name-layout']}>
            <div className={styles.name}>
              <span className={styles['partial-name']}>
                {isLoading ? <Skeleton width={'20rem'} height={'3.5rem'} /> : recordRef.current ? recordRef.current.fields['Investor Name'] as string : 'no name'}
              </span>
            </div>
            {
              isLoading 
                ?
                <Skeleton className={styles['status-icon']} />
                : 
                <StatusIcon className={styles['status-icon']} />
            }
          </div>
          <div className={styles['description-layout']}>
            {
              isLoading ?
                <span className={styles.description}>
              loading...
                </span>
                : 
                recordRef.current ? 
                  (recordRef.current.fields['Deal Class'] as string[]).length === 0
                    ?
                    'no description'
                    :
                    (recordRef.current.fields['Deal Class'] as string[]).length > 1 
                      ?
                      <span className={styles.description}>
                        {(recordRef.current.fields['Deal Class'] as string[]).map((dealClass: string, index: number) => 
                          index !== (recordRef.current!.fields['Deal Class'] as string[]).length - 1 ? dealClass + ', ' : dealClass )}
                      </span>
                      :
                      <span className={styles.description}>
                        {recordRef.current.fields['Deal Class'] as string}
                      </span>
                  : 'no description'
            }
            
            <span >|</span>
            <a className={styles['official-website']} href={recordRef.current ? recordRef.current.fields['Website Link'] as string : 'www.google.com'} target='_blank' rel="noreferrer">
              {isLoading ? 'loading...' : recordRef.current ? recordRef.current.fields['Website Link'] as string : 'no official website, please google it'}
            </a>
          </div>
          <div className={styles['location-layout']}>
            <LocationIcon className={styles['location-icon']} />
            <span className={styles['description']}>
              {
                isLoading
                  ? 
                  <Skeleton className={styles['description']} width={'10rem'} />
                  : 
                  recordRef.current 
                    ? 
                    location as string
                    : 'no location'
              }
            </span>
          </div>
          <div className={styles['detail-layout']}>
            <div className={styles['detail-divider-top']}></div>
            <p className={styles['detail-category']}>
              <span className={styles['detail-category-text']}>INDUSTRY CODE</span>
              {
                isLoading 
                  ?
                  <Skeleton className={styles['detail-category-text-2']} width={'30rem'} />
                  :
                  <span className={styles['detail-category-text-2']}>
                    {
                      recordRef.current ? (recordRef.current.fields['Company Industry Code'] as string[]).map((industryCode: string, index: number) => 
                        index !== (recordRef.current!.fields['Company Industry Code'] as string[]).length - 1 ? industryCode + ', ' : industryCode )
                        : 'no industry code'
                    }
                  </span>
              }
            </p>
            <div className={styles['detail-divider']}></div>
            <p className={styles['detail-category']}>
              <span className={styles['detail-category-text']}>CURRENT FUND SIZE</span>
              {
                isLoading 
                  ?
                  <Skeleton className={styles['detail-category-text-2']} width={'10rem'} />
                  :
                  <span className={styles['detail-category-text-2']} style={{ color: '#fff4' }}>currently unavailable</span>
              }
            </p>
            <div className={styles['detail-divider']}></div>
            <p className={styles['detail-category']}>
              <span className={styles['detail-category-text']}>DEAL TYPE</span>
              {
                isLoading
                  ?
                  <Skeleton className={styles['detail-category-text-2']} width={'20rem'} />
                  : recordRef.current ? (recordRef.current.fields['Deal Type 1'] as string[]).length > 1
                    ?
                    <span className={styles['detail-category-text-2']}>
                      {(recordRef.current.fields['Deal Type 1'] as string[]).map((dealType: string, index: number) => 
                        index !== (recordRef.current!.fields['Deal Type 1'] as string[]).length - 1 ? dealType + ', ' : dealType )}
                    </span>
                    :
                    <span className={styles['detail-category-text-2']}>
                      {recordRef.current.fields['Deal Type 1'] as string}
                    </span>
                    : 'no deal type'
              }
            </p>
            <div className={styles['detail-divider']}></div>
            <p className={styles['detail-category']}>
              <span className={styles['detail-category-text']}>Lead Partner</span>
              {
                isLoading
                  ?
                  <Skeleton className={styles['detail-category-text-2']} width={'15rem'} />
                  :
                  recordRef.current ? (recordRef.current.fields['Lead Partner at Investment Firm'] as string[]).length > 1
                    ?
                    <span className={styles['detail-category-text-2']}>
                      {(recordRef.current.fields['Lead Partner at Investment Firm'] as string[]).map((accountManager: string, index: number) => 
                        index !== (recordRef.current!.fields['Lead Partner at Investment Firm'] as string[]).length - 1 ? accountManager + ', ' : accountManager )}
                    </span>
                    :
                    <span className={styles['detail-category-text-2']}>
                      {recordRef.current.fields['Lead Partner at Investment Firm'] as string}
                    </span>
                    : 'no account manager recorded'
              }
            </p>
            <div className={styles['detail-divider']}></div>
            <p className={styles['detail-category']}>
              <span className={styles['detail-category-text']}>SWEET SPOT</span>
              {
                isLoading
                  ?
                  <Skeleton className={styles['detail-category-text-2']} width={'15rem'} />
                  :
                  <span className={styles['detail-category-text-2']}  style={{ color: '#fff4' }}>currently unavailable</span>
              }
            </p>
          </div>
          <div className={styles['model-layout']}>
            <h2>Historical Log</h2>
            
          </div>
        </div>
        <div className={styles['right-panel']}>
        
          <div className={styles['investor-title-layout']}>
            <DotCircleIcon className={styles['dot-circle-investor-icon']} />
            <span className={styles['investor-title-text']}>TOP CO-INVESTORS</span>
          </div>
          {
            isLoading 
              ? 
              (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className={styles['investor-layout']}>
      
              
                    <Skeleton className={styles['investor-logo']} />
                    <div className={styles['investor-text']}>
                      <Skeleton className={styles['investor-name']} width={'7rem'} height={'1rem'} />

                      <Skeleton className={styles['stage-info']} width={'5rem'} height={'1rem'} />
                    </div>
                  </div>
                ))
              )

            
              :
              
              !recordRef.current!.fields['Co-investors'] || (recordRef.current!.fields['Co-investors'] as string[]).length === 0
                ? 'no co-investors'
                : (
                recordRef.current!.fields['Co-investors'] as string[]).map((investor: string) => (
                  <div key={investor} className={styles['investor-layout']}>

                    <img src={YCLogo} alt='' className={styles['investor-logo']} />
                    <div className={styles['investor-text']}>
                      <span className={styles['investor-name']}>{investor}</span>
                      <br />
                      <span className={styles['stage-info']}>May not know</span>
                    </div>

                  </div>
                ),
                )
          }
          

        </div>


      </div>
      <div className={styles['popover-background']} style={{ visibility: isPopoverOpen ? 'visible' : 'hidden' }}>
        <div className={styles['popover-form']}>
          <form style={{ margin: '2.5rem 2.5rem 0 2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem'  }}>
            <div className={styles['popover-form-title']}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <AsyncImage src={isLoading  ? '' : (recordRef.current!.fields['Logo'] as ReadonlyArray<{ url: string }>)[0].url} alt='' 
                  style={{  width: ' 4.57144rem', height: '4.47456rem', objectFit: 'contain', borderRadius: '50%', border: '3px solid #5392d4' }}

                  draggable='false' onContextMenu={e => e.preventDefault()} />
                <div>
                  <span style={{ textAlign: 'start', display: 'block' }}>Regarding <span style={{ fontWeight: '700', fontSize: '1.3rem' }}>{recordRef.current ? recordRef.current.fields['Investor Name'] as string : 'no name'}</span></span>
                  <span style={{ textAlign: 'start', display: 'block' }}>Create a new request</span>
                </div>
              </div>
              <CancelButtonIcon className={styles['cancelbutton']} onClick={() => setPopoverOpen(false)} />
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Type of Request</span>
              <select
                style={{ fontSize: '1.25rem', display: 'block', width: '101%', background: '#eee', color: '#000', border: 'none', outline: 'none', padding: '0.5rem', marginTop: '1rem' }} name="Type of Request" id="">
                <option value="Letme">Let me review the fund</option>
                <option value="Assign">Assign the fund request to</option>
              </select>
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Approvers or Assignees</span>
              <input style={{ marginTop: '1rem', marginBottom: '0.2rem', padding: '0.5rem 0 0.5rem 0.5rem', fontSize: '1.25rem', background: '#eee', border: 'none', outline: 'none', width: '100%', 
                borderBottom: approvers && approvers !== '' ? 'red 1px solid' : 'transparent 1px solid', color: '#000' }} 
              onChange={(e) => setApprovers(e.target.value)}
              placeholder='Enter names here' />
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