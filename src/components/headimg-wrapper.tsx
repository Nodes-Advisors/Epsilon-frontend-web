import styles from '../styles/home.module.less'
import StatusIcon from '../assets/svgs/status-icon.svg?react'
import { useState } from 'react'
import { useUserStore } from '../store/store'

type THeadImgWrapperProps = {
    status: 'busy' | 'online' | 'offline'
    headImg: string
}

export default function HeadImgWrapper({status, headImg}: THeadImgWrapperProps) {
  const [show, setShow] = useState(false)
  const user = useUserStore(state => state.user)
  return (
    <div className={styles['headimg-wrapper']}>
      <img src={headImg} alt="" className={styles['headimg']} loading='eager' onClick={() => setShow(!show)} />
      {
        show && user &&
        <ul style={{ background: '#222', position: 'absolute', margin: 'auto', zIndex: 255 }}>
          <li>
            {
              Object.keys(user as Record<string, string>).map((key, index) => {
                return <li key={index}>{key}: {(user as Record<string, string>)[key]}</li>
              })
            }
          </li>
        </ul>
      }
      <StatusIcon className={`${styles['status-icon']} ${styles['status-' + status]}`} />
    </div>
  )
}