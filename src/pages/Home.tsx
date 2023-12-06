import styles from '../styles/home.module.less'
import EpsilonMiniLogo from '../assets/svgs/epsilon-mini-logo.svg?react'
import HeadImgWrapper from '../components/headimg-wrapper'
import HeadImg from '../assets/images/headimg-example.png'
import Divider from '../components/divider'
import NavWidget from '../components/nav-widget'
import KPIDashIcon from '../assets/svgs/kpi-dashboard.svg?react'
import FundCardIcon from '../assets/svgs/fund-card.svg?react'
import IntelligenceIcon from '../assets/svgs/intelligence.svg?react'
import GroupButtonIcon from '../assets/svgs/group-button.svg?react'

export default function Home() {
  return (
    <section>
      <aside>
        <div>
          <EpsilonMiniLogo className={styles['epsilon-mini-logo']}/>
        </div>
        <HeadImgWrapper headImg={HeadImg} status='online' />
        <HeadImgWrapper headImg={HeadImg} status='busy' />
        <HeadImgWrapper headImg={HeadImg} status='offline' />
        <Divider height='0.1625rem' width='5.25rem' color='rgba(255, 255, 255, 0.6)'/>
        <nav>
          <NavWidget Svg={KPIDashIcon} width='3.125rem' height='2.44794rem' to='to' text= 'KPI Dash'/>
          <NavWidget Svg={FundCardIcon} width='3rem' height='3.22225rem' to='to' text='Fund Card' />
          <NavWidget Svg={IntelligenceIcon} width='' height='3.125rem' to='3.125rem' text='Intelligence' />
        </nav>
        <GroupButtonIcon id={styles['group-button']} />
      </aside>
    </section>
  )
}