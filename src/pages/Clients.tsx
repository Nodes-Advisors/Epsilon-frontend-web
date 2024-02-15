import { AsyncImage } from 'loadable-image'
import venture_logo from '../assets/images/venture-logo-example.png'
import Skeleton from 'react-loading-skeleton'
import { useEffect, useRef, useState } from 'react'

import { FieldSet, Record } from 'airtable'
import { useNavigate } from 'react-router-dom'
import { useClientsStore } from '../store/store'
import CancelButtonIcon from '../assets/svgs/cancel-button.svg?react'
import styles from '../styles/profile.module.less'
import { convertedOutput } from '../lib/utils'
import type { FILTER_NAME } from '../lib/constants'
import CancelButton from '../assets/images/cancel.png'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useUserStore } from '../store/store'
import { throttle } from 'lodash'
import ReactPaginate from 'react-paginate'
import BookIcon from '../assets/images/book.png'

export default function Clients() {

  const [isLoading, setLoading] = useState(true)

  const [filteredData, setFilteredData] = useState<Record<FieldSet>[]>([])
 
  const user = useUserStore(state => state.user)
  const [totalClientCount, setTotalClientCount] = useState<number>(0)
  
  useEffect(() => {
    setLoading(true)
    axios.get('http://localhost:5001/getAllClients')
      .then((res) => {

        setClients(res.data)  
        setFilteredData(res.data)
       
        setTotalClientCount(res.data.length)
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        setLoading(false)
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

  const setClients = useClientsStore(state => state.setClients)
  const navigate = useNavigate()
  // const randomColor = () => STATUS_COLOR_LIST[Math.floor(Math.random() * STATUS_COLOR_LIST.length)]



  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems:'start', gap: '2rem', fontFamily: "'Fira Code', monospace, 'Kalnia', serif" }}>
      <div style={{ marginLeft: '4rem', marginTop: '2rem' }}>
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
              <span style={{ textAlign: 'left', fontSize: '1.5rem' }}>{totalClientCount + ' Clients'}</span>
              <div style={{ fontSize: '1.15rem', display: 'grid', gap: '2rem', gridTemplateColumns: '2fr repeat(7, 1.7fr) 1fr', width: '100%', textAlign: 'left'  }}>
                <span>Clients</span>
                <span>Acronym</span>
                <span>Industry</span>
                <span>Sector</span>
                <span>Deal Type</span>
                <span>Deal Size</span>
                <span>Current Stage</span>
                <span>Transaction Type</span>
                <span>Short Bio</span>
                
              </div>
              <div style={{ width: '100%', backgroundColor: '#fff1', height: '0.05rem' }}></div>
                              
              {
                currentItems.length > 0
                  ?
                  currentItems.map((record, index) => (
                    <>
                      <div className={styles['book-wrapper']} key={record._id} style={{ display: 'grid', lineHeight: 1, gap: '2rem', gridTemplateColumns: '2fr repeat(7, 1.7fr) 1fr' }}> 
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem'  }}>

                          </div>
                          <div style={{ position: 'relative' }}>
                            <AsyncImage
                              onMouseEnter={(e) => { (e.target as HTMLElement).style.cursor = 'pointer'  }}
                              onClick={() => { localStorage.setItem('client-id', record._id as string); navigate(`/client-card/${record._id}`)  }}
                              src={record['Logo'] ? (record['Logo']) : venture_logo} style={{ borderRadius: '0.25rem', border: `0.25rem solid transparent`, width: '5rem', height: '5rem', objectFit: 'contain', background: 'rgba(255, 255, 255, 0.5)' }} />
                            {/* <FundStatus colorList={generateColorList(record['Contact'] ? (record['Contact'].split(',')).length : 0, record.Contact, record.Status)} /> */}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem', lineHeight: 1, alignItems: 'start' }}>
                            <span onClick={() => { localStorage.setItem('client-id', record._id as string); navigate(`/client-card/${record._id}`)  }} className={styles['fund-name']}>{record.name ? record.name as string : 'No Name Record'}</span>
                            <span style={{  }}>{record['hq location'] ? record['hq location'] : 'No Location Record'}</span>
                          </div>
                            
                        </div>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['acronym'] as string[] | string) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['industry'] as string[] | string) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['sector'] as string | string[]) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['deal_type'] as string | string[]) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['deal_size'] as string[] | string) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['current_stage'] as string[] | string) as string || 'n/a'}</span>
                        
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>{convertedOutput(record['transaction_type'] as string[] | string) as string || 'n/a'}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left' }}>
                          {
                            record['short_info']
                              ? 
                              <span>
                                <img src={BookIcon} className={styles['book-new-icon']} alt="" />
                                <span className={styles['book-new-tooltip']}>{convertedOutput(record['short_info'])}</span>
                              </span>
                              :
                              'No'
                              
                          }
                          
                        </span>
                       

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