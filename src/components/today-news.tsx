import { useEffect, useState } from 'react'
import styles from '../styles/home.module.less'
import Skeleton from 'react-loading-skeleton'

export default function TodayNews() {
  const [isLoading, setLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => setLoading(false), 3000)
  }, [])

  return (
    <div style={{ width: '100%'}}>
      {
        isLoading 
          ?



          <ul className={styles['new-ul-skeleton']}>
            <li><Skeleton duration={2.0} /></li>
            <li><Skeleton duration={2.0} /></li>
            <li><Skeleton duration={2.0} /></li>
          </ul>



          : 
          <ul className={styles['news-ul']}>
            <li><span>6</span> Funds are currently reviewing <span>Avivo</span> Deck this week - 2 whom you sourced this week.</li>
            <li><span>6</span> Funds are currently reviewing <span>Avivo</span> Deck this week - 2 whom you sourced this week.</li>
            <li><span>6</span> Funds are currently reviewing <span>Avivo</span> Deck this week - 2 whom you sourced this week.</li>
          </ul>
      }
    </div>
  )
}