import { memo, useState } from 'react'
import { STAGES } from '../lib/constants'
import styles from '../styles/kpi-block.module.less'

function DealFunnel({selectedClients, tasks, setTasks}: {selectedClients: string[], tasks: any, setTasks: any}) {

  //   const [tasks, setTasks] = useState({
  //     I: [],
  //     II: [],
  //     III: [],
  //     IV: [],
  //     V: [],
  //     VI: [],
  //   })
    
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

  return (
    <div className={styles['funnel-layout']}>
      {Object.keys(tasks).map((stage, index) => {
        const filteredTasks = tasks[stage].filter((deal) => {
          if (selectedClients.length === 0) {
            return true
          }
          return selectedClients
            .map((client) => client.toUpperCase())
            .includes(deal.company_acronym.toUpperCase())
          // return selectedClients.includes(deal.company_acronym)
        })
        // console.log(STAGES[index])
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
            {filteredTasks.map((deal, index) => (
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
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      color: 'violet',
                    }}
                  >
                    {deal.company_acronym}
                  </span>
                  ({deal.company_name})
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
    </div>
  )
           
}

const MemoizedDealFunnel = memo(DealFunnel)
export default MemoizedDealFunnel
