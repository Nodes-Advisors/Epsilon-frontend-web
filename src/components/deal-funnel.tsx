import { memo, useState } from 'react'
import { STAGES } from '../lib/constants'
import styles from '../styles/kpi-block.module.less'

function DealFunnel({timeScale, selectedClients, tasks, setTasks}: {timeScale: string, selectedClients: string[], tasks: any, setTasks: any}) {
    
  const [itemsToShow, setItemsToShow] = useState(5) // Initial number of items to show

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
    <div className={styles['funnel-layout']}>
      {Object.keys(tasks).map((stage, index) => {
        const filteredTasks = tasks[stage].filter((deal) => {
          if (selectedClients.length === 0) {
            if (timeScale === '') return true
            else return isWithinTimeScale(deal.last_updated_status_date)
          } else {
            if (timeScale === '') return selectedClients
              .map((client) => client.toUpperCase())
              .includes(deal.company_acronym.toUpperCase())
            else return selectedClients
              .map((client) => client.toUpperCase())
              .includes(deal.company_acronym.toUpperCase()) && isWithinTimeScale(deal.last_updated_status_date)
          }
          
        })
        
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
                    : styles['stage-container']
              }
            >
              {STAGES[index]} <span style={{ color: 'palegreen' }}>{filteredTasks.length}</span>
            </div>
            {tasksToShow.map((deal, index) => (
              <div
                // onMouseOver={() => console.log(deal.company_acronym)}
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
                      color: 'violet',
                    }}
                  >
                    {deal.company_acronym}
                  </span>
                 
                </span>
                <br />
                <span
                  style={{
                    display: 'inline-block',
                    color: 'orange',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    width: '12rem',
                    whiteSpace: 'preserve-breaks',
                  }}
                >
                  {deal.LP_pitched}
                </span>
              </div>
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
  )
           
}

const MemoizedDealFunnel = memo(DealFunnel)
export default MemoizedDealFunnel
