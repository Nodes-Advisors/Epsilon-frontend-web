import { KPIBlock, KPIText } from '../components/kpi-component'
import styles from '../styles/kpi-block.module.less'
import TICKIcon from '../assets/svgs/tick.svg?react'
import EpsilonLogo from '../assets/images/epsilon-logo.png'
import { useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { throttle } from 'lodash'
import LeftNavBar from '../components/left-nav-bar'

export default function KPIDash () {
  const [focused, setFocused] = useState<'all' | 'you'>('all')
  const [isLoading, setLoading] = useState(true)
  const [category, setCategory] = useState<'dashboard' | 'deal-funnel'>('dashboard')
  const [tasks, setTasks] = useState({
    I: ['Fund Card I', 'Fund Card II', 'Fund Card III'],
    II: ['Fund Card IV', 'Fund Card V', 'Fund Card VI'],
    III: ['Fund Card VII', 'Fund Card VIII', 'Fund Card IX'],
    IV: ['Fund Card X', 'Fund Card XI', 'Fund Card XII'],
  })
 

  

  
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('task', task)
  }

  const handleDrop = (stage) => {
    return (e) => {
      const task = e.dataTransfer.getData('task')
      const originalStage = Object.keys(tasks).find(key => tasks[key].includes(task))
  
      if (originalStage === stage) {
        return
      }
  
      setTasks(prev => ({
        ...prev,
        [stage]: [...prev[stage], task],
        [originalStage]: prev[originalStage].filter(t => t !== task),
      }))
    }
  }
  useEffect(() => {
    setTimeout(() => setLoading(false), 3000)
  }, [isLoading])

  return (
    <div className={styles['kpi-main']} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'calc(10vh + 5rem)', gap: '3rem' }} >
     
      <div>
        <div className={styles['kpi-head']} style={{  }}>
          <img src={EpsilonLogo} id={styles['epsilon-logo']} alt="" />
          <span className={styles['kpi-dashboard-text']} >KPI Dashboard</span>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          <div 
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <KPIBlock extraClass={styles['kpi-category']} width={'21.625rem'} height={'13.625rem'}>
              <div 
                className='kpi-category'
                onClick={() => setCategory('dashboard')}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <TICKIcon  className={styles['tick-icon']} style={{ fill: category === 'dashboard' ? '#2254ff' : '#fff' }} />
                <KPIText fontSize={'1.25rem'} fontColor={'#fff'} >Dashboard</KPIText>
              </div>
              <div 
                className='kpi-category'
                onClick={() => setCategory('deal-funnel')}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'start' }}>
                <TICKIcon className={styles['tick-icon']} style={{ fill: category === 'deal-funnel' ? '#2254ff' : '#fff' }} />
                <KPIText fontSize={'1.25rem'} fontColor={'#fff'} >Deal Funnel</KPIText>
              </div>
            </KPIBlock>
            <KPIBlock extraClass={styles['kpi-filter']} width='21.75rem' height='30.25rem' >
              <KPIText extraClass={styles['kpi-filter-text']} fontColor='#fff' fontSize='1.8125rem' >Filters</KPIText>
              <KPIText extraClass={styles['kpi-filter-text-restore']}>Restore default</KPIText>
              <KPIText extraClass={styles['kpi-filter-text-sub']} fontColor='#fff' fontSize='1.5rem' >Timescale</KPIText>
              <ul className={styles['kpi-ul']}>
                <li>today</li>
                <li>1 week</li>
                <li>1 month</li>
                <li>since this year</li>
              </ul>
            </KPIBlock>
          </div>
          {
            category === 'dashboard' ? (
              <div style={{  display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative', zIndex: 1 }} >
                <div style={{ display: 'flex', gap: '1rem',
                  position: 'absolute', left: '2rem', top: '-3rem', zIndex: 255 }}>
                  <button className={focused === 'all' ? styles['kpi-option-highlighted'] : styles['kpi-option']} onClick={() => {setFocused('all'); setLoading(true)}} >All</button>
                  <button className={focused === 'you' ? styles['kpi-option-highlighted'] : styles['kpi-option']} onClick={() => {setFocused('you'); setLoading(true)}} >You</button>

       
                </div>
                <div className={styles['kpi-horizontal-layout']}>
                  <KPIBlock extraClass={styles['kpi-mini-dashboard']} width='17.5625rem' height='8.25rem' >

                    <KPIText extraClass={styles['kpi-align-center-text']} fontColor='#fff' fontSize='0.9375rem' >Total Outreach</KPIText>

                    <div className={styles['kpi-miniboard-horizontal-layout']}>
                      {
                        isLoading 
                          ?
                          <>
                            <Skeleton className={styles['kpi-text']} duration={2.0} width={'4.5rem'} height={'1.7rem'}  />
                            <Skeleton className={styles['kpi-text']} duration={2.0} width={'4.5rem'} height={'1.7rem'} />
                          </>
                          :
                          <>
                            <KPIText fontColor='#fff' fontSize='1.875rem' >200</KPIText>
                            <KPIText fontColor='#817777' fontSize='1.875rem' >50</KPIText>
                          </>
                      }
                    </div>
        
                  </KPIBlock>
                  <KPIBlock extraClass={styles['kpi-mini-dashboard']} width='17.5625rem' height='8.25rem' >
                    <KPIText extraClass={styles['kpi-align-center-text']} fontColor='#fff' fontSize='0.9375rem' >Total Deck requests</KPIText>
                    <div className={styles['kpi-miniboard-horizontal-layout']}>
                      {
                        isLoading 
                          ?
                          <>
                            <Skeleton className={styles['kpi-text']} duration={2.0} width={'4.5rem'} height={'1.7rem'}  />
                            <Skeleton className={styles['kpi-text']} duration={2.0} width={'4.5rem'} height={'1.7rem'} />
                          </>
                          :
                          <>
                            <KPIText fontColor='#fff' fontSize='1.875rem' >200</KPIText>
                            <KPIText fontColor='#817777' fontSize='1.875rem' >50</KPIText>
                          </>
                      }
                    </div>
        
                  </KPIBlock>
                  <KPIBlock extraClass={styles['kpi-mini-dashboard']} width='17.5625rem' height='8.25rem' >
                    <KPIText extraClass={styles['kpi-align-center-text']} fontColor='#fff' fontSize='0.9375rem' >Total Conversion to qualified</KPIText>
                    <div className={styles['kpi-miniboard-horizontal-layout']}>
                      {
                        isLoading 
                          ?
                          <>
                            <Skeleton className={styles['kpi-text']} duration={2.0} width={'4.5rem'} height={'1.7rem'}  />
                            <Skeleton className={styles['kpi-text']} duration={2.0} width={'4.5rem'} height={'1.7rem'} />
                          </>
                          :
                          <>
                            <KPIText fontColor='#fff' fontSize='1.875rem' >200</KPIText>
                            <KPIText fontColor='#817777' fontSize='1.875rem' >50</KPIText>
                          </>
                      }
                    </div>
        
                  </KPIBlock>
                  <KPIBlock extraClass={styles['kpi-mini-dashboard']} width='17.5625rem' height='8.25rem' >
                    <KPIText extraClass={styles['kpi-align-center-text']} fontColor='#fff' fontSize='0.9375rem' >Total Outreach</KPIText>
                    <div className={styles['kpi-miniboard-horizontal-layout']}>
                      {
                        isLoading 
                          ?
                          <>
                            <Skeleton className={styles['kpi-text']} duration={2.0} width={'4.5rem'} height={'1.7rem'}  />
                            <Skeleton className={styles['kpi-text']} duration={2.0} width={'4.5rem'} height={'1.7rem'} />
                          </>
                          :
                          <>
                            <KPIText fontColor='#fff' fontSize='1.875rem' >200</KPIText>
                            <KPIText fontColor='#817777' fontSize='1.875rem' >50</KPIText>
                          </>
                      }
                    </div>
        
                  </KPIBlock>

                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <KPIText fontColor='#fff' fontSize='0.9375rem' style={{ textAlign: 'left' }} >Total Outreach</KPIText>
                  <div className={styles['kpi-horizontal-layout']} style={{ gap: '3rem' }} >
                    <KPIBlock extraClass={styles['kpi-medium-dashboard']} width='37.25rem' height='21.125rem' >
                      <Skeleton className={styles['kpi-text']} duration={2.0} width={'24.5rem'} height={'1.7rem'} count={10}  />
                    </KPIBlock>
                    <KPIBlock extraClass={styles['kpi-medium-dashboard']} width='37.25rem' height='21.125rem' >df</KPIBlock>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <KPIText fontColor='#fff' fontSize='0.9375rem' style={{ textAlign: 'left' }} >Total Outreach</KPIText>
                  <div className={styles['kpi-horizontal-layout']} style={{ gap: '3rem' }} >
                    <KPIBlock extraClass={styles['kpi-medium-dashboard']} width='37.25rem' height='21.125rem' >df</KPIBlock>
                    <KPIBlock extraClass={styles['kpi-medium-dashboard']} width='37.25rem' height='21.125rem' >df</KPIBlock>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles['funnel-layout']}>
                {Object.keys(tasks).map((stage, index) => (
                  <div className={styles['stage-task-layout']} key={index} onDrop={handleDrop(stage)} onDragOver={(e) => e.preventDefault()}>
                    <div className={index === 0 ? styles['stage-first-container'] : styles['stage-container']}>
                      {index === 0 ? 'Stage' : '\u00A0\u00A0\u00A0\u00A0\u00A0Stage'} {stage}
                    </div>
                    {tasks[stage].map((deal, index) => (
                      <div 
                        className={styles['task']} 
                        draggable 
                        onDragStart={(e) => handleDragStart(e, deal)} 
                        key={index}
                      >
                        {deal}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}