import styles from '../styles/home.module.less'
import StatusIcon from '../assets/svgs/status-icon.svg?react'

type THeadImgWrapperProps = {
    status: 'busy' | 'online' | 'offline';
    headImg: string;
}

export default function HeadImgWrapper({status, headImg}: THeadImgWrapperProps) {
  return (
    <div className={styles['headimg-wrapper']}>
      <img src={headImg} alt="" className={styles['headimg']}  />
      <StatusIcon className={`${styles['status-icon']} ${styles['status-' + status]}`} />
    </div>
  )
}