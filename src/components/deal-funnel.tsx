import {memo, useEffect, useState} from 'react'
import { STAGES } from '../lib/constants'
import styles from '../styles/kpi-block.module.less'
import axios from 'axios'
import { useTokenStore } from '../store/store'
import {user} from "@nextui-org/react";

function DealFunnel({timeScale, selectedClients, tasks, setTasks,user}: {timeScale: string, selectedClients: string[], tasks: any, setTasks: any,user: any}) {
  const [isLoading, setLoading] = useState(true)
  const [itemsToShow, setItemsToShow] = useState(5) // Initial number of items to show
  const [showPopup, setShowPopup] = useState(false)
  const [popupPosition, setShowPopupPosition] = useState({x: 0, y: 0})
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)
  const [hoveredCompany, setHoveredCompany] = useState('')
  const [hoveredLP, setHoveredLP] = useState('')
  const [hoveredData, setHoveredData] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([]);
  const token = useTokenStore((state) => state.token)

  const acronymToLowercaseMap = {
    "Lanier Therapeutics": "lanier",
    "Antion Biosciences": "antion",
    "EMB": "emb",
    "Regencor": "reg",
    "CAV": "cav",
    "Clarametyx Biosciences": "clarametyx",
    "Navan Bio": "navan",
    "Coastar Therapeutics": "coa",
    "Stalicla": "sta",
    "CV": "cv",
    "Remedium Bio": "rem",
    "Unison Medicines": "um",
    "Bantam Pharmaceuticals": "bntm",
    "Fascinate": "fas",
    "PineTree Therapeutics": "pt",
    "BioEclipse Therapeutics": "be",
    "Avivo Biomedical": "avivo",
    "Scioto": "scioto",
    "shackelford pharma": "shck",
    "Nema Life": "nema life",
    "Renibus": "renibus",
    "NeoimmuneTech": "nit",
    "CH4 Global": "ch4"
  };


  useEffect(() => {
    // Retrieve logs from local storage
    const logsData = JSON.parse(localStorage.getItem('logs'));

    // Convert hoveredCompany to lowercase acronym
    const lowercaseHoveredCompany = acronymToLowercaseMap[hoveredCompany];

    // Filter logs based on hoveredLP and lowercaseHoveredCompany
    const filtered = logsData.filter(log => {
      const vcLowerCase = log.VC ? log.VC.toLowerCase() : ''; // Convert VC to lowercase if not null
      const clientLowerCase = log.Client ? log.Client.toLowerCase() : ''; // Convert Client to lowercase if not null
      const hoveredLpLowerCase = hoveredLP ? hoveredLP.toLowerCase(): ''; // Convert hoveredLP to lowercase
      const lowercaseHoveredCompany = hoveredCompany ? hoveredCompany.toLowerCase(): ''; // Convert lowercaseHoveredCompany to lowercase

      return vcLowerCase === hoveredLpLowerCase && clientLowerCase === lowercaseHoveredCompany;
    });

    // Sort the filtered logs by the date
    filtered.sort((a, b) => new Date(parseInt(b.Date)) - new Date(parseInt(a.Date)));

    // // Reform the object to [date, message] pairs
    // const reformattedLogs = filtered.map(item => [
    //   new Date(parseInt(item.Date)).toLocaleString(), // Convert milliseconds to Date object and then to a string
    //   `${item.Nodes} contacted ${item.Client}`
    // ]);

    // Set the reformatted logs to state
    setFilteredLogs(filtered);

  }, [hoveredLP, hoveredCompany]);




  useEffect(() => {
    const fetchLogData = async() => {
      const res = await axios.get(`http://localhost:5001/getallhislogs`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'email': user?.email,
        },
      })
      if (res.status === 200) {
        console.log('Logs fetched successfully:', res.data);
        const logsData = res.data;
        localStorage.setItem('logs', JSON.stringify(logsData));
      } else {
        console.error('Failed to fetch logs');
      }
    }
    fetchLogData()
  }, [])

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
        // setLoading(false)
        setHoveredData(res.data)
      }
    }
    fetchCompanyData()
  }, [])


  const handleMouseOver = (e: React.MouseEvent<HTMLSpanElement>, LP_pitched: string, company_acronym: string) => {
    setShowPopup(false)
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    // Calculate position and show popup after a delay
    const rect = e.currentTarget.getBoundingClientRect();
    const width = e.currentTarget.offsetWidth;
    const height = e.currentTarget.offsetHeight;
    const timeout = setTimeout(() => {
      setShowPopupPosition({ x: rect.left + width / 2 - 120, y: rect.top + height / 2 - 130 });
      setShowPopup(true);
    }, 500);
    // Store the timeout in state to clear it later if needed
    setHoverTimeout(timeout);

    // Log the LP_pitched and company_name
    setHoveredCompany(company_acronym);
    setHoveredLP(LP_pitched);
    console.log('LP Pitched:', LP_pitched);
    console.log('Company short:', company_acronym);
  };

  const handleMouseOut = () => {

    if (hoverTimeout) {
      // console.log('clear hover timeout')
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)

    }
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      setHideTimeout(null)
    }

    // setShowPopup(false)
  }


  const loadMore = () => {
    setItemsToShow(itemsToShow + 10) // Load 5 more items
  }

  const handleDragStart = (e, task, stage) => {
    // console.log('dragging', task, stage)

    e.dataTransfer.setData('task', JSON.stringify(task))
    e.dataTransfer.setData('stage', stage)
  }

  const handleDrop = (stage) => {
    return (e) => {
      const task = JSON.parse(e.dataTransfer.getData('task'))
      const originalStage = e.dataTransfer.getData('stage')
      //   console.log(task.id)
      if (originalStage === stage) {
        return
      }

      setTasks((prev) => ({
        ...prev,
        [stage]: [...prev[stage], task],
        [originalStage]: prev[originalStage].filter((t) => t.id !== task.id),
      }))
    }
  }

  const isWithinTimeScale = (dealDate) => {
    // return true
    const dealTime = new Date(dealDate).getTime()
    const now = Date.now()
    // console.log(dealTime, now)
    switch(timeScale) {
    case '':
      return true
    case 'today':
      return now - dealTime <= 24 * 60 * 60 * 1000
    case 'this week':
      return now - dealTime <= 7 * 24 * 60 * 60 * 1000
    case 'last week':
      return (now - dealTime <= 14 * 24 * 60 * 60 * 1000) && (now - dealTime > 7 * 24 * 60 * 60 * 1000)
    case 'month to date':
      return now - dealTime <= 30 * 24 * 60 * 60 * 1000
    case 'year to date':
      return now - dealTime <= 365 * 24 * 60 * 60 * 1000
    default:
      return true
    }
  }

  return (
    <>
    <div className={styles['funnel-layout']}>
      {Object.keys(tasks).map((stage, index) => {
        const filteredTasks = tasks[stage].filter((deal) => {
          if (selectedClients.length === 0) {
            if (timeScale === '') return true;
            else return isWithinTimeScale(deal.last_updated_status_date);
          } else {
            if (timeScale === '') {
              return selectedClients.some(client => client && client.toUpperCase() === deal.company_acronym?.toUpperCase());
            } else {
              return selectedClients.some(client => client && client.toUpperCase() === deal.company_acronym?.toUpperCase()) &&
                isWithinTimeScale(deal.last_updated_status_date);
            }
          }
        });

        const tasksToShow = filteredTasks.slice(0, itemsToShow);

        return (
          <div
            className={styles['stage-task-layout']}
            key={index}
            onDrop={handleDrop(stage)}
            onDragOver={(e) => e.preventDefault()}
          >
            <div
              className={
                index === 0
                  ? styles['stage-first-container']
                  : index === Object.keys(tasks).length - 1
                    ? styles['stage-last-container']
                    : styles['stage-container-'+index]
              }
            >
              {STAGES[index]} <span style={{ color: '#C2D9FF' }}>{filteredTasks.length}</span>
            </div>
            {tasksToShow.map((deal, index) => (
              <span
                onMouseOver={(e) => handleMouseOver(e, deal.LP_pitched, deal.company_acronym)}
                onMouseOut={handleMouseOut}
                className={styles['task']}
                draggable
                onDragStart={(e) => handleDragStart(e, deal, stage)}
                key={index}
              >
                <span
                  style={{
                    display: 'inline-block',
                    fontWeight: '400',
                    fontSize: '1rem',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    width: '12rem',
                    whiteSpace: 'preserve-breaks',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      color: deal.company_acronym ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.6)',
                    }}
                  >
                  {deal.company_name ? deal.company_name : 'Unknown'}
                  </span>

                </span>
                <br />
                <span
                  style={{
                    display: 'inline-block',
                    color: '#AED2FF',
                    fontSize: '1.1rem',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    width: '12rem',
                    whiteSpace: 'preserve-breaks',
                  }}
                >
                  {deal.LP_pitched}
                </span>
              </span>
            ))}
          </div>
        )
      })}
      {itemsToShow >= tasks.length ? (
        <p>All data loaded</p>
      ) : 
        <button
          style={{ position: 'absolute', bottom: '0rem', width: '10rem', height: '3rem', padding: '0.5rem', left: '50%' }}
          onClick={loadMore}>
            Load More
        </button>
      }
    </div>
  {showPopup &&
  <div
      onMouseEnter={() => {
        // Clear any existing hide timeout
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          setHideTimeout(null);
        }
      }}
      onMouseLeave={() => {
        // Set a timeout to hide the popup after a delay
        const timeout = setTimeout(() => {
          setShowPopup(false);
        }, 200);
        setHideTimeout(timeout);
      }}
      style={{
        backdropFilter: 'blur(25px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        transition: 'all 0.5s ease',
        zIndex: 10,
        position: 'absolute',
        gap: '1rem',
        top: popupPosition.y, left: popupPosition.x,
        width: '25rem', height: '25rem',
        background: '#fff1', borderRadius: '0.5rem' }}>
      <div style={{ color: '#fff', width: '90%', gap: '2rem', marginTop: '2rem', alignItems: 'center', justifyContent: 'center' }}>
      <span
          style={{
            display: 'inline-block',
            fontWeight: '400',
            fontSize: '1rem',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            width: '12rem',
            whiteSpace: 'preserve-breaks',
          }}>
        <span
         style={{
                        display: 'inline-block',
                        marginTop: '0.5rem',
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        color: 'rgba(255, 255, 255, 0.85)',
                      }}
        >
         {hoveredCompany}
        </span>
      </span>
          <span
              style={{
                display: 'inline-block',
                color: '#AED2FF',
                fontSize: '1.1rem',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                width: '12rem',
                whiteSpace: 'preserve-breaks',
              }}
          >
           {hoveredLP}
          </span>
      </div>
    {
      <>
        <div style={{width: '90%', height: '0.5px', backgroundColor: '#eee'}}></div>
        <ul className={styles['contact-list-scroll']} style={{
          textAlign: 'left', padding: '0 3% 3% 0', width: '80%',
          maxHeight: '40%', overflow: 'auto', color: '#111',
        }}>
          {
            filteredLogs.map((log, index) => {
              return (
                <li key={log._id} style={{padding: '0.5rem', color: '#eee', fontSize: '1rem'}}>

                  <span style={{color: 'violet'}}>{new Date(parseInt(log.Date)).toLocaleDateString()}</span>
                  {' - '}

                  {log.fundraising_pipeline_status === 'contacted'
                    && <>
                          <span
                              className={styles['account_holder']}>{log.Nodes}</span>
                          <span>{' contacted '}</span>
                          <span style={{color: '#fff'}}>{log.Contact ? log.Contact : 'Someone'}</span>
                          <span>{' at '}</span>
                          <span style={{color: '#fff'}}>{log.VC}</span>
                          <span>{' for '}</span>
                          <span className={styles['company-manager']}>{log.Client}</span>
                      </>
                  }
                  {log.fundraising_pipeline_status === 'pass_contacted'
                    && <>
                          <span style={{color: '#fff'}}>{log.Contact ? log.Contact : 'Someone'}</span>
                          <span>{' from '}</span>
                          <span style={{color: '#fff'}}>{log.VC}</span>
                          <span>{' passed on '}</span>
                      {/* this should be deal name  */}
                          <span className={styles['company-manager']}>{log.Client}</span>
                          <span>{' after initial pitch'}</span>

                      </>
                  }
                  {log.fundraising_pipeline_status === 'deck_request'
                    &&
                      <>
                        {/* [person at a fund] from [Fund Name] requested the [company] deck  */}
                          <span style={{color: '#fff'}}>{log.Contact ? log.Contact : 'Someone'}</span>
                          <span>{' from '}</span>
                          <span style={{color: '#fff'}}>{log.VC}</span>
                          <span>{' requested the '}</span>

                          <span className={styles['company-manager']}>{log.Client}</span>
                          <span>{' deck'}</span>

                      </>
                  }
                  {log.fundraising_pipeline_status === 'pass_deck'
                    &&
                      <>
                        {/* [person at a fund] from [Fund Name] passed on [Company Name] after reviewing the deck */}
                          <span style={{color: '#fff'}}>{log.Contact ? log.Contact : 'Someone'}</span>
                          <span>{' from '}</span>
                          <span style={{color: '#fff'}}>{log.VC}</span>
                          <span>{' passed on '}</span>

                          <span className={styles['company-manager']}>{log.Client}</span>
                          <span>{' after reviewing the deck'}</span>
                      </>
                  }
                  {log.fundraising_pipeline_status === 'meeting_request'
                    &&
                      <>
                        {/* [person at a fund] from [Fund Name] requested a [company name] meeting  - (user) */}
                          <span style={{color: '#fff'}}>{log.Contact ? log.Contact : 'Someone'}</span>
                          <span>{' from '}</span>
                          <span style={{color: '#fff'}}>{log.VC}</span>
                          <span>{' requested a '}</span>

                          <span className={styles['company-manager']}>{log.Client}</span>
                          <span>{' meeting - '}</span>
                          <span
                            // onMouseEnter={handleMouseOver}
                            // onMouseLeave={handleMouseOut}
                              className={styles['account_holder']}>{log.Nodes}</span>
                      </>
                  }
                  {log.fundraising_pipeline_status === 'pass_meeting'
                    &&
                      <>
                        {/* [person at a fund] from [Fund Name] passed on [Company Name] after a meeting  */}
                          <span style={{color: '#fff'}}>{log.Contact ? log.Contact : 'Someone'}</span>
                          <span>{' from '}</span>
                          <span style={{color: '#fff'}}>{log.VC}</span>
                          <span>{' passed on '}</span>

                          <span className={styles['company-manager']}>{log.Client}</span>
                          <span>{' after a meeting'}</span>
                      </>
                  }
                  {log.fundraising_pipeline_status === 'dd'
                    &&
                      <>
                        {/* [Fund Name] entered in dd phase on [Company Name] */}
                          <span style={{color: '#fff'}}>{log.VC}</span>
                          <span>{' entered in dd phase on '}</span>
                          <span className={styles['company-manager']}>{log.Client}</span>

                      </>
                  }
                  {log.fundraising_pipeline_status === 'pass_dd'
                    &&
                      <>
                        {/* [Fund Name] entered in dd phase on [Company Name] */}
                          <span style={{color: '#fff'}}>{log.VC}</span>
                          <span>{' passed in dd phase on '}</span>
                          <span className={styles['company-manager']}>{log.Client}</span>

                      </>
                  }
                </li>
              )
            })
          }
        </ul>
      </>
    }
      {/*<div style={{ justifyItems: 'start', alignItems: 'center', width: '90%', marginLeft: '5%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem'}}>*/}
      {/*    <span style={{   fontSize: '1.1rem', fontWeight: 500, whiteSpace: 'wrap' }}>Contacted</span>*/}
      {/*    <span style={{ color: '#754DCA', fontSize: '1.5rem', fontWeight: 500, whiteSpace: 'wrap' }}>{log.filter(item => item?.company_name === hoveredName)*/}
      {/*      .reduce((sum, item) => sum + item?.contacted, 0)}</span>*/}
      {/*    <span style={{  fontSize: '1.1rem', fontWeight: 500, whiteSpace: 'wrap' }}>Deck Requests</span>*/}
      {/*    <span style={{ color: '#754DCA', fontSize: '1.5rem', fontWeight: 500, whiteSpace: 'wrap' }}>{hoveredData.filter(item => item?.company_name === hoveredName)*/}
      {/*      .reduce((sum, item) => sum + item?.deck_request, 0)}</span>*/}
      {/*    <span style={{  fontSize: '1.1rem', fontWeight: 500, whiteSpace: 'wrap' }}>Meeting Requests</span>*/}
      {/*    <span style={{ color: '#754DCA', fontSize: '1.5rem', fontWeight: 500, whiteSpace: 'wrap' }}>{hoveredData.filter(item => item?.company_name === hoveredName)*/}
      {/*      .reduce((sum, item) => sum + item?.meeting_request, 0)}</span>*/}
      {/*    <span style={{  fontSize: '1.1rem', fontWeight: 500, whiteSpace: 'wrap' }}>DD</span>*/}
      {/*    <span style={{ color: '#754DCA', fontSize: '1.5rem', fontWeight: 500, whiteSpace: 'wrap' }}>{hoveredData.filter(item => item?.company_name === hoveredName)*/}
      {/*      .reduce((sum, item) => sum + item?.dd, 0)}</span>*/}
      {/*</div>*/}
  </div>

  }
    </>
  )
           
}

const MemoizedDealFunnel = memo(DealFunnel)
export default MemoizedDealFunnel
