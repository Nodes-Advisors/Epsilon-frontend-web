import styles from '../styles/home.module.less'
import HeadImg from '../assets/images/headimg-example.png'
import StatusIcon from '../assets/svgs/status-icon.svg?react'
import EpsilonMiniLogo from '../assets/svgs/epsilon-mini-logo.svg?react'
export default function Home() {
  return (
    <section className={styles['relative-layout']}>
      <aside className={styles['left-panel']}>
        <div className={styles['epsilon-blur-circle']}>
          <EpsilonMiniLogo className={styles['epsilon-mini-logo']}/>
        </div>
        <div className={styles['headimg-wrapper']}>
          <img src={HeadImg} alt="" className={styles['headimg']}  />
          <StatusIcon className={`${styles['status-icon']} ${styles['status-leave']}`} />
        </div>
        <div className={styles['headimg-wrapper']}>
          <img src={HeadImg} alt="" className={styles['headimg']}  />
          <StatusIcon className={`${styles['status-icon']} ${styles['status-busy']}`} />
        </div>
        <div className={styles['headimg-wrapper']}>
          <img src={HeadImg} alt="" className={styles['headimg']}  />
          <StatusIcon className={`${styles['status-icon']} ${styles['status-free']}`} />
        </div>
        <div>

        </div>
      </aside>
    </section>
  )
}