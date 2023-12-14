import styles from '../styles/profile.module.less'
// import { cx } from '../lib/utils'
import venture_logo from '../assets/images/venture-logo-example.png'
import ActionButton from '../components/action-button'
import LocationIcon from '../assets/svgs/location.svg?react'
import NodesIcon from '../assets/svgs/nodes.svg?react'
import StatusIcon from '../assets/svgs/status.svg?react'
import EpsilonLogo from '../assets/svgs/epsilon_logo.svg?react'
import DotCircleIcon from '../assets/svgs/dot-circle.svg?react'
import YCLogo from '../assets/images/yc_logo.png'
import VectorLogo from '../assets/svgs/vector.svg?react'
import HeadImg from '../assets/images/headimg-example.png'
import { useState, useEffect } from 'react'
import { AsyncImage } from 'loadable-image'
import Skeleton from 'react-loading-skeleton'

// import { useAuth0 } from '@auth0/auth0-react'
export default function Profile(): JSX.Element {
  // const { user, isLoading } = useAuth0()
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 3000)
  }, [])

  return (
    <section>
            
      <div className={styles['epsilon-logo-layout']}>
        <EpsilonLogo className={styles['epsilon-logo']} />
        {/* <Skeleton className={styles['epsilon-logo']} /> */}
        <div className={styles['epsilon-logo-divider']}></div>
      </div>
      
      <div style={{ marginTop: '10rem', display: 'flex' }}>
        <div className={styles['left-panel']}>
          {
            isLoading 
              ? 
              <Skeleton className={styles['venture-logo']}  />
              : 
              <img loading='eager' src={venture_logo} alt="" className={styles['venture-logo']} />
          }
          <div className={styles['action-buttons']}>
            <ActionButton 
              onClick={() => alert('startup match')} 
              buttonClass={styles['action-button']} 
              textClass={styles['action-button-text']} 
              text='STARTUP MATCH' />
            <ActionButton
              onClick={() => alert('share')}
              buttonClass={styles['action-button']} 
              textClass={styles['action-button-text']} 
              text='SHARE' />
            <ActionButton
              onClick={() => alert('add to list')}
              buttonClass={styles['action-button']} 
              textClass={styles['action-button-text']} 
              text='ADD TO LIST' />
          </div>
          <div>
            <div className={styles['horizontal-flex-layout']} >
              <VectorLogo className={styles['vector-logo']} />
              <h2 className={styles['relationship-text']}>Relationships</h2>
              <VectorLogo className={styles['vector-logo']} />
            </div>
            <div className={styles['horizontal-flex-layout']}>
              {
                isLoading 
                  ?
                  <>
                    <Skeleton className={styles['headImg']} />
                    <div className={`${styles['vertical-flex-align-flex-start-layout']}` } >
                      <Skeleton className={styles['relationship-inner-text']} />
                      <Skeleton className={styles['relationship-inner-text-action']} />
                    </div>
                    <Skeleton className={styles['headImg']}/>
                  </>  
                  :
                  <>
                    <img src={HeadImg} alt="" className={styles['headImg']} />
                    <div className={`${styles['vertical-flex-align-flex-start-layout']}` } >
                      <span className={styles['relationship-inner-text']}>BEN HOrowitz</span>
                      <span className={styles['relationship-inner-text-action']}>Deck Reviewing</span>
                    </div>
                    <img src={HeadImg} alt="" className={styles['headImg']} />
                  </>
              }     
            </div>
            
          </div>
        </div>
        <div className={styles['middle-panel']}>
          <div className={styles['name-layout']}>
            <div className={styles.name}>
              <span className={styles['partial-name']}>Andreessen</span>
              <span className={styles['partial-name']}>Horowitz</span>
            </div>
            <StatusIcon className={styles['status-icon']} />
          </div>
          <div className={styles['description-layout']}>
            <span className={styles.description}>
              Venture Capital
            </span>
            <span >|</span>
            <span className={styles.description}>
              2009
            </span>
            <span >|</span>
            <a className={styles['official-website']} href='https://www.a16z.com' target='_blank' rel="noreferrer">
              www.a16z.com
            </a>
          </div>
          <div className={styles['location-layout']}>
            <LocationIcon className={styles['location-icon']} />
            <span className={styles['description']}>
              Menlo Park, CA, United States
            </span>
          </div>
          <div className={styles['detail-layout']}>
            <div className={styles['detail-divider-top']}></div>
            <p className={styles['detail-category']}>
              <span className={styles['detail-category-text']}>INDUSTRY CODE</span>
              {
                isLoading 
                  ?
                  <Skeleton className={styles['detail-category-text-2']} width={'30rem'} />
                  :
                  <span className={styles['detail-category-text-2']}>Biotech, Healthcare, Consumer, Crypto, Enterprise & Fintech</span>
              }
            </p>
            <div className={styles['detail-divider']}></div>
            <p className={styles['detail-category']}>
              <span className={styles['detail-category-text']}>CURRENT FUND SIZE</span>
              {
                isLoading 
                  ?
                  <Skeleton className={styles['detail-category-text-2']} width={'10rem'} />
                  :
                  <span className={styles['detail-category-text-2']}>$35 Billion</span>
              }
            </p>
            <div className={styles['detail-divider']}></div>
            <p className={styles['detail-category']}>
              <span className={styles['detail-category-text']}>DEAL TYPE</span>
              {
                isLoading
                  ?
                  <Skeleton className={styles['detail-category-text-2']} width={'20rem'} />
                  :
                  <span className={styles['detail-category-text-2']}>Seed, Early Stage Venture, Late Stage Venture</span>
              }
            </p>
            <div className={styles['detail-divider']}></div>
            <p className={styles['detail-category']}>
              <span className={styles['detail-category-text']}>ACCOUNT MANAGER</span>
              {
                isLoading
                  ?
                  <Skeleton className={styles['detail-category-text-2']} width={'15rem'} />
                  :
                  <span className={styles['detail-category-text-2']}>Eliott Harfouche, Tyler Aroner</span>
              }
            </p>
            <div className={styles['detail-divider']}></div>
            <p className={styles['detail-category']}>
              <span className={styles['detail-category-text']}>SWEET SPOT</span>
              {
                isLoading
                  ?
                  <Skeleton className={styles['detail-category-text-2']} width={'15rem'} />
                  :
                  <span className={styles['detail-category-text-2']}>$140M  |  (1592 Total Deals)</span>
              }
            </p>
          </div>
          <div className={styles['model-layout']}>
            <NodesIcon className={styles['nodes-icon']}/>
            <span className={styles['model-text']}>INTELLIGENCE</span>
          </div>
        </div>
        <div className={styles['right-panel']}>
        
          <div className={styles['investor-title-layout']}>
            <DotCircleIcon className={styles['dot-circle-investor-icon']} />
            <span className={styles['investor-title-text']}>TOP CO-INVESTORS</span>
          </div>
          <div className={styles['investor-layout']}>
            {
              isLoading
                ?
                <>
                  <Skeleton className={styles['investor-logo']} />
                  <div className={styles['investor-text']}>
                    <Skeleton className={styles['investor-name']} width={'7rem'} height={'1rem'} />

                    <Skeleton className={styles['stage-info']} width={'5rem'} height={'1rem'} />
                  </div>
                </>
                :
                <>
                  <img src={YCLogo} alt='' className={styles['investor-logo']} />
                  <div className={styles['investor-text']}>
                    <span className={styles['investor-name']}>Y-COMBINATOR</span>
                    <br />
                    <span className={styles['stage-info']}>SEED STAGE</span>
                  </div>
                </>
            }
          </div>
          <div className={styles['investor-layout']}>
            {
              isLoading
                ?
                <>
                  <Skeleton className={styles['investor-logo']} />
                  <div className={styles['investor-text']}>
                    <Skeleton className={styles['investor-name']} width={'7rem'} height={'1rem'} />

                    <Skeleton className={styles['stage-info']} width={'5rem'} height={'1rem'} />
                  </div>
                </>
                :
                <>
                  <img src={YCLogo} alt='' className={styles['investor-logo']} />
                  <div className={styles['investor-text']}>
                    <span className={styles['investor-name']}>Y-COMBINATOR</span>
                    <br />
                    <span className={styles['stage-info']}>SEED STAGE</span>
                  </div>
                </>
            }
          </div>
          <div className={styles['investor-layout']}>
            {
              isLoading
                ?
                <>
                  <Skeleton className={styles['investor-logo']} />
                  <div className={styles['investor-text']}>
                    <Skeleton className={styles['investor-name']} width={'7rem'} height={'1rem'} />

                    <Skeleton className={styles['stage-info']} width={'5rem'} height={'1rem'} />
                  </div>
                </>
                :
                <>
                  <img src={YCLogo} alt='' className={styles['investor-logo']} />
                  <div className={styles['investor-text']}>
                    <span className={styles['investor-name']}>Y-COMBINATOR</span>
                    <br />
                    <span className={styles['stage-info']}>SEED STAGE</span>
                  </div>
                </>
            }
          </div>

          <div className={styles['investor-title-layout']}>
            <DotCircleIcon className={styles['dot-circle-recent-investment-icon']} />
            <span className={styles['investor-title-text']}>Recent Investment</span>
          </div>
          <div className={styles['investor-layout']}>
            {
              isLoading
                ?
                <>
                  <Skeleton className={styles['investor-logo']} />
                  <div className={styles['investor-text']}>
                    <Skeleton className={styles['investor-name']} width={'7rem'} height={'1rem'} />

                    <Skeleton className={styles['stage-info']} width={'5rem'} height={'1rem'} />
                  </div>
                </>
                :
                <>
                  <img src={YCLogo} alt='' className={styles['investor-logo']} />
                  <div className={styles['investor-text']}>
                    <span className={styles['investor-name']}>Y-COMBINATOR</span>
                    <br />
                    <span className={styles['stage-info']}>SEED STAGE</span>
                  </div>
                </>
            }
          </div>
          <div className={styles['investor-layout']}>
            {
              isLoading
                ?
                <>
                  <Skeleton className={styles['investor-logo']} />
                  <div className={styles['investor-text']}>
                    <Skeleton className={styles['investor-name']} width={'7rem'} height={'1rem'} />

                    <Skeleton className={styles['stage-info']} width={'5rem'} height={'1rem'} />
                  </div>
                </>
                :
                <>
                  <img src={YCLogo} alt='' className={styles['investor-logo']} />
                  <div className={styles['investor-text']}>
                    <span className={styles['investor-name']}>Y-COMBINATOR</span>
                    <br />
                    <span className={styles['stage-info']}>SEED STAGE</span>
                  </div>
                </>
            }
          </div>
          <div className={styles['investor-layout']}>
            {
              isLoading
                ?
                <>
                  <Skeleton className={styles['investor-logo']} />
                  <div className={styles['investor-text']}>
                    <Skeleton className={styles['investor-name']} width={'7rem'} height={'1rem'} />

                    <Skeleton className={styles['stage-info']} width={'5rem'} height={'1rem'} />
                  </div>
                </>
                :
                <>
                  <img src={YCLogo} alt='' className={styles['investor-logo']} />
                  <div className={styles['investor-text']}>
                    <span className={styles['investor-name']}>Y-COMBINATOR</span>
                    <br />
                    <span className={styles['stage-info']}>SEED STAGE</span>
                  </div>
                </>
            }
          </div>

        </div>
      </div>

    </section>
  )
}