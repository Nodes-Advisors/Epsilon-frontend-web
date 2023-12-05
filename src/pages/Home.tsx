import styles from '../styles/home.module.less'
import EpsilonMiniLogo from '../assets/svgs/epsilon-mini-logo.svg?react'
import HeadImgWrapper from '../components/headimg-wrapper'
import HeadImg from '../assets/images/headimg-example.png'
import Divider from '../components/divider'

export default function Home() {
  return (
    <section className={styles['relative-layout']}>
      <aside className={styles['left-panel']}>
        <div className={styles['epsilon-blur-circle']}>
          <EpsilonMiniLogo className={styles['epsilon-mini-logo']}/>
        </div>
        <HeadImgWrapper headImg={HeadImg} status='online' />
        <HeadImgWrapper headImg={HeadImg} status='busy' />
        <HeadImgWrapper headImg={HeadImg} status='offline' />
        <Divider height='0.1625rem' width='5.25rem' color='rgba(255, 255, 255, 0.6)'/>
        <nav>
          
        </nav>
      </aside>
    </section>
  )
}