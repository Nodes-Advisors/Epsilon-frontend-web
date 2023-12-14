import styles from '../styles/home.module.less'
import StatusIcon from '../assets/svgs/status-icon.svg?react'
import { useState } from 'react'
import { useUserStore } from '../store/store'
import { AsyncImage } from 'loadable-image'
import { Blur } from 'transitions-kit'

type THeadImgWrapperProps = {
    status: 'busy' | 'online' | 'offline' | 'not-login'
    headImg: string
}

export default function HeadImgWrapper({status, headImg}: THeadImgWrapperProps) {
  const [show, setShow] = useState(false)
  const user = useUserStore(state => state.user)

  return (
    <div className={styles['headimg-wrapper']}>
      <AsyncImage 
        src={headImg} alt="head image"
        loading='eager' 
        loader={<div style={{ background: '#888' }}/>}
        error={<div style={{ background: '#eee' }}/>}
        onClick={() => setShow(!show)}
        Transition={Blur}
        style={{
          width: '3.96419rem',
          height: '3.96419rem',
          borderRadius: '50%',
          outline: 'none',
          cursor: 'pointer',
        }}
      />
      {
        show && user &&
        <ul style={{ background: '#222', position: 'absolute', margin: 'auto', zIndex: 255 }}>
          {
            Object.keys(user as Record<string, string>).map((key, index) => {
              return <li key={index}>{key}: {(user as Record<string, string>)[key]}</li>
            })
          }
        </ul>
      }
      <StatusIcon className={`${styles['status-icon']} ${styles['status-' + status]}`} />
    </div>
  )
}