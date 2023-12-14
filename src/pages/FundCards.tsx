import { AsyncImage } from 'loadable-image'
import venture_logo from '../assets/images/venture-logo-example.png'
import Skeleton from 'react-loading-skeleton'
import { useEffect, useState } from 'react'

export default function FundCards() {
  const [isLoading, setLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => setLoading(false), 3000)
  }, [])

  return (
    <div>
      <h1>Fund Cards</h1>
      {
        isLoading 
          ? 
          <div style={{ display: 'flex', gap: '1rem', lineHeight: 1 }}> 
            <Skeleton width={'5.0rem'} height={'5rem'}  />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem', lineHeight: 1 }}>
              <Skeleton width={'16.0rem'} height={'1.4rem'} />
              <Skeleton width={'7rem'} height={'1.2rem'} />
            </div>
          </div>
          
          :
          <div style={{ display: 'flex', gap: '1rem'  }}>
            <AsyncImage
              src={venture_logo}
              style={{ width: '5rem', height: '5rem' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center'  }}>
              <h2 style={{ padding: 0, margin: 0 }}>Andreessen Horowitz</h2>
              <a href="/fund-card/abc" style={{ textDecoration: 'none', fontSize: '1.2rem'  }}>go to ah</a>
            </div>
          </div> 
      }
      
    </div>
  )
}