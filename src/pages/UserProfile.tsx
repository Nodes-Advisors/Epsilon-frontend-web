import { useUserStore } from '../store/store'
import { AsyncImage } from 'loadable-image'
import UserAvatar from '../assets/images/user-avatar.png'
import { Blur } from 'transitions-kit'
import styles from '../styles/user-profile.module.less'
import FacebookIcon from '../assets/svgs/facebook.svg?react'
import LinkedinIcon from '../assets/svgs/linkedin.svg?react'
import TwitterIcon from '../assets/svgs/twitter.svg?react'
import { useNavigate } from 'react-router-dom'
import { KPIBlock, KPIText } from '../components/kpi-component'

export default function UserProfile() {

  const user = useUserStore(state => state.user)
  const navigate = useNavigate()

  return (
    <section style={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}>
      <div>
        <AsyncImage
          src={user?.picture ? user.picture : UserAvatar}
          loading='eager' 
          loader={<div style={{ background: '#888' }}/>}
          error={<div style={{ background: '#eee' }}/>}
          Transition={Blur}
          style={{
            width: '20rem',
            height: '20rem',
            borderRadius: '0.2rem',
            outline: 'none',
            cursor: 'pointer',
          }}
        />
        <span style={{ marginTop: '2rem' }}>User&apos;s investing connections</span>
        <ul>
          {
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i}>
                <AsyncImage
                  src={user?.picture ? user.picture : UserAvatar}
                  loading='eager' 
                  loader={<div style={{ background: '#888' }}/>}
                  error={<div style={{ background: '#eee' }}/>}
                  Transition={Blur}
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.2rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
              
              </li>
            ))
          }
          <li>
            <h3>179 Investors</h3>
          </li>
        </ul>
        <span style={{ marginTop: '2rem' }}>User&apos;s interested investors</span>
        <ul>
          {
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i}>
                <AsyncImage
                  src={user?.picture ? user.picture : UserAvatar}
                  loading='eager' 
                  loader={<div style={{ background: '#888' }}/>}
                  error={<div style={{ background: '#eee' }}/>}
                  Transition={Blur}
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.2rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
              
              </li>
            ))
          }
          <li>
            <h3>34 Investors</h3>
          </li>
        </ul>
        <span style={{ marginTop: '4rem' }}>FIND USER ON</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <TwitterIcon
            style={{
              width: '2rem',
              height: '2rem',
              padding: '0rem',
              background: 'rgba(50, 50, 50, 70)',
              borderRadius: '50%',
              outline: 'none',
              cursor: 'pointer',
              border: '0.3rem rgba(50, 50, 50, 70) solid',
              
            }}
          />
          <LinkedinIcon
            style={{
              width: '2rem',
              height: '2rem',
              padding: '0rem',
              background: 'rgba(50, 50, 50, 70)',
              borderRadius: '50%',
              outline: 'none',
              cursor: 'pointer',
              border: '0.3rem rgba(50, 50, 50, 70) solid',
              
            }}
          />
          <FacebookIcon
            style={{
              width: '2rem',
              height: '2rem',
              padding: '0rem',
              background: 'rgba(50, 50, 50, 70)',
              borderRadius: '50%',
              outline: 'none',
              cursor: 'pointer',
              border: '0.3rem rgba(50, 50, 50, 70) solid',
              
            }}
          />
        </div>
      </div>
      <div className={styles['investor-info']}>
        <span style={{ fontSize: '1.5rem', opacity: '0.6' }}>Investing Profile</span>
        <h1 style={{ padding: '0', marginTop: '1rem', marginBottom: '1rem' }}>{user?.name || user?.nickname || 'Unknown user'}</h1>
        <div>
          <span style={{ fontSize: '1.8rem' }}>{user?.position || 'Intern'}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <span style={{ fontSize: '1.8rem' }}>{'No Lead'}</span>
        </div>
        <span style={{ fontSize: '1.6rem', opacity: '0.6' }}>Partner at {user?.company || 'Nodes Advsiors AG' }</span>
        <div >
          <a style={{ textDecoration: 'none', color: 'white', opacity: '0.6', marginRight: '2rem', fontSize: '1.6rem' }} href='www.google.com'>{user?.website || 'www.personal_web.com'}</a>
          <span style={{ fontSize: '1.6rem', opacity: 0.6 }}>{user?.location || 'Zurich, Switzerland'}</span>
        </div>
        <span style={{ marginTop: '2rem', fontSize: '2rem', fontWeight: 550 }}>User&apos;s KPI Dashboard</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginTop: '2rem' }}>
          <KPIBlock width='20rem' height='10rem'>
            <KPIText>Investment Amount</KPIText>
            <KPIText>CHF 1.2M</KPIText>
          </KPIBlock>
          <KPIBlock width='20rem' height='10rem'>
            <KPIText>Investment Rounds</KPIText>
            <KPIText>12</KPIText>
          </KPIBlock >
          <KPIBlock width='20rem' height='10rem'>
            <KPIText>Investment Stages</KPIText>
            <KPIText>Seed, Series A</KPIText>
          </KPIBlock>
          <KPIBlock width='20rem' height='10rem'>
            <KPIText>Investment Sectors</KPIText>
            <KPIText>FinTech, HealthTech</KPIText>
          </KPIBlock>
        </div>
        <span style={{ marginTop: '2rem', fontSize: '2rem', fontWeight: 550 }}>User&apos;s Historical Logs</span>
        <details>
          <summary>2022</summary>
          <ul>
            <li>a</li>
            <li>c</li>
            <li>b</li>
          </ul>
        </details>

        <details>
          <summary>2021</summary>
          <ul>
            <li>a</li>
            <li>c</li>
            <li>b</li>
          </ul>
        </details>

        <details open>
          <summary>2023</summary>
          <ul>
            <li>a</li>
            <li>c</li>
            <li>b</li>
          </ul>
        </details>
        <ul>
          <li>
            <span 
              onClick={() => { navigate('/user-profile', { replace: true }); window.location.reload() }}
              style={{ color: '#754DCA', fontWeight: 550 }}>
              Tyler
            </span> {' pitched '}
            <span 
              onClick={() => navigate('/fund-card/1')} 
              style={{ color: '#754DCA', fontWeight: 550 }}>Avivo</span>
            {' to '} 
            <span 
              onClick={() => { navigate('/user-profile', { replace: true }); window.location.reload() }}
              style={{ color: '#00BBF9', fontWeight: 550 }}>
                Vicky
            </span> 
            {' from '}
            <span 
              onClick={() => { navigate('/fund-card/1', { replace: true }) }}
              style={{ color: '#00BBF9', fontWeight: 550 }}>Google Venture</span></li>
          {
            (user?.historical_logs ? user.historical_logs : ['historical_logs', 'historical_logs', 'historical_logs'])
              .map((log, i) => (
                <li key={i}>{log}</li>
              ))
          }
        </ul>
      </div>
      
    </section>
  )

}