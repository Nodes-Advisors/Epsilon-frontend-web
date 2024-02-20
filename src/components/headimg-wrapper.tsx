import styles from '../styles/home.module.less'
import StatusIcon from '../assets/svgs/status-icon.svg?react'
import { useState } from 'react'
import { useUserStore } from '../store/store'
import { AsyncImage } from 'loadable-image'
import { Blur } from 'transitions-kit'
import { useNavigate } from 'react-router-dom'

type THeadImgWrapperProps = {
    status: 'busy' | 'online' | 'offline' | 'not-login'
    headImg: string
}

export default function HeadImgWrapper({status, headImg}: THeadImgWrapperProps) {
  const [show, setShow] = useState(false)
  const user = useUserStore(state => state.user)
  const navigate = useNavigate()

  return (
    <div className={styles['headimg-wrapper']}>
      <AsyncImage 
        src={headImg} alt="head image"
        loading='eager' 
        loader={<div style={{ background: '#888' }}/>}
        error={<div style={{ background: '#eee' }}/>}
        onClick={() => navigate('/user-profile/me') }
        Transition={Blur}
        style={{
          width: '3.96419rem',
          height: '3.96419rem',
          borderRadius: '50%',
          outline: 'none',
          cursor: 'pointer',
        }}
      />
      <StatusIcon className={`${styles['status-icon']} ${styles['status-' + status]}`} />
    </div>
  )
}