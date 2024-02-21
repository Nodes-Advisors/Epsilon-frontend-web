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
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useTokenStore } from '../store/store'

export default function UserProfile() {

  const user = useUserStore(state => state.user)
  const [otherUser, setOtherUser] = useState<any>(undefined)
  const navigate = useNavigate()
  const [data, setData] = useState<any>(undefined)
  const [loading, setLoading] = useState<boolean>(false)
  const token = useTokenStore(state => state.token)

  useEffect(() => {

    const fetchData = async () => {
      if (loading) return
      setLoading(true)
      const result = await axios.get('http://localhost:5001/getUser', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        params: {
          email: window.location.href.split('/').pop() === 'me' ? user.email : 'undefined',
          name: window.location.href.split('/').pop() === 'me' ? 'undefined' : window.location.href.split('/').pop(),
        },
      })
      const data = result.data
      // console.log(data)
      setData(data)
      setLoading(false)
    }
    fetchData()
  }, [window.location.href])

  return (
    <section style={{ display: 'flex', justifyContent: 'center', marginTop: '10rem', gap: '20rem', marginLeft: '-35rem' }}>
      {
        loading ? <div>loading...</div> : 
          <>
            <div>
              <AsyncImage
                src={data?.profile_image ? data?.profile_image : UserAvatar}
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
              <span style={{ marginTop: '2rem' }}>{data?.name || data?.username|| data?.email}&apos;s connections</span>
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
              <span style={{ marginTop: '2rem' }}>{data?.name || data?.username || data?.email}&apos;s active investors</span>
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
              <span style={{ marginTop: '4rem' }}>FIND {data ? data?.name || data?.username : 'USER'} ON</span>
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
                  onClick={() => window.open(data?.linkedin, '_blank')}
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
              <h1 style={{ padding: '0', marginTop: '1rem', marginBottom: '1rem' }}>{data?.name || 'Unknown user'}</h1>
              
              <div>
                <span style={{ fontSize: '1.8rem' }}>Last Online Time: {data?.last_time_online as string || 'Dummy Time'}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {/* <span style={{ fontSize: '1.8rem' }}>{'No Lead'}</span> */}
              </div>
              <span style={{ fontSize: '1.6rem', opacity: '0.6' }}><span style={{ textTransform: 'capitalize' }}>{data?.department}</span> at {'Nodes Advisors AG' }</span>
              <div >
                <a style={{ textDecoration: 'none', color: 'white', opacity: '0.6', marginRight: '2rem', fontSize: '1.6rem' }} href='www.google.com'>{data?.email || 'www.personal_web.com'}</a>
                <span style={{ fontSize: '1.6rem', opacity: 0.6 }}>{data?.location ? data?.location.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Zurich, Switzerland'}</span>
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
              {/* <table>
                <thead>
                  <tr>
                    <th>column 1</th>
                    <th>column 2</th>
                    <th>column 3</th>
                    <th>column 4</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>td 1</td>
                    <td>td 1</td>
                    <td>td 1</td>
                    <td>td 1</td>
                  </tr>
                  <tr>
                    <td>td 2</td>
                    <td>td 2</td>
                    <td>td 2</td>
                    <td>td 2</td>
                  </tr>
                </tbody>
              </table> */}
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
                {/* {
                  (user?.historical_logs ? user.historical_logs : ['historical_logs', 'historical_logs', 'historical_logs'])
                    .map((log, i) => (
                      <li key={i}>{log}</li>
                    ))
                } */}
              </ul>
            </div>
          </>
      }
      
      
    </section>
  )

}