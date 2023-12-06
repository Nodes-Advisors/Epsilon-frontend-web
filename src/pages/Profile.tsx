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

export default function Profile(): JSX.Element {

  return (
    <section>
      <div className={styles['epsilon-logo-layout']}>
        <EpsilonLogo className={styles['epsilon-logo']} />
        
        <div className={styles['epsilon-logo-divider']}></div>
      </div>
      
      <div style={{ marginTop: '10rem', display: 'flex' }}>
        <div className={styles['left-panel']}>
          <img loading='eager' src={venture_logo} alt="" className={styles['venture-logo']} />
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
              <img src={HeadImg} alt="" className={styles['headimg']} />
              <div className={`${styles['vertical-flex-align-flex-start-layout']}` } >
                <span className={styles['relationship-inner-text']}>BEN HOrowitz</span>
                <span className={styles['relationship-inner-text-action']}>Deck Reviewing</span>
              </div>
              <img src={HeadImg} alt="" className={styles['headimg']} />
            </div>
            
          </div>
        </div>
        <div className={styles['middle-panel']}>
          <div className={styles['name-layout']}>
            <div className={styles.name}>
              <span className={styles['partial-name']}>Andreessen</span>
              <span className={styles['partial-name']}>Horowitz</span>
            </div>
            <StatusIcon />
          </div>
          <div className={styles['description-layout']}>
            <span className={styles.description}>
            Venture Capital
            </span>
            <span className={styles['description-layout']}>|</span>
            <span className={styles.description}>
          2009
            </span>
            <span className={styles['description-layout']}>|</span>
            <span className={styles['official-website']}>
          www.a16z.com
            </span>
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
              <span className={styles['detail-category-text-2']}>Biotech, Healthcare, Consumer, Crypto, Enterprise & Fintech</span>
            </p>
            <div className={styles['detail-divider']}></div>
            <p className={styles['detail-category']}>
              <span className={styles['detail-category-text']}>CURRENT FUND SIZE</span>
              <span className={styles['detail-category-text-2']}>$35 Billion</span>
            </p>
            <div className={styles['detail-divider']}></div>
            <p className={styles['detail-category']}>
              <span className={styles['detail-category-text']}>DEAL TYPE</span>
              <span className={styles['detail-category-text-2']}>Early Stage, Later Stage</span>
            </p>
            <div className={styles['detail-divider']}></div>
            <p className={styles['detail-category']}>
              <span className={styles['detail-category-text']}>ACCOUNT MANAGER</span>
              <span className={styles['detail-category-text-2']}>Eliott Harfouche, Tyler Aroner</span>
            </p>
            <div className={styles['detail-divider']}></div>
            <p className={styles['detail-category']}>
              <span className={styles['detail-category-text']}>SWEET SPOT</span>
              <span className={styles['detail-category-text-2']}>$140M  |  (1592 Total Deals)</span>
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
            <img src={YCLogo} alt='' className={styles['investor-logo']} />
            <div className={styles['investor-text']}>
              <span className={styles['investor-name']}>Y-COMBINATOR</span>
              <br />
              <span className={styles['stage-info']}>SEED STAGE</span>
            </div>
          </div>
          <div className={styles['investor-layout']}>
            <img src={YCLogo} alt='' className={styles['investor-logo']} />
            <div className={styles['investor-text']}>
              <span className={styles['investor-name']}>Y-COMBINATOR</span>
              <br />
              <span className={styles['stage-info']}>SEED STAGE</span>
            </div>
          </div>
          <div className={styles['investor-layout']}>
            <img src={YCLogo} alt='' className={styles['investor-logo']} />
            <div className={styles['investor-text']}>
              <span className={styles['investor-name']}>Y-COMBINATOR</span>
              <br />
              <span className={styles['stage-info']}>SEED STAGE</span>
            </div>
          </div>

          <div className={styles['investor-title-layout']}>
            <DotCircleIcon className={styles['dot-circle-recent-investment-icon']} />
            <span className={styles['investor-title-text']}>Recent Investment</span>
          </div>
          <div className={styles['investor-layout']}>
            <img src={YCLogo} alt='' className={styles['investor-logo']} />
            <div className={styles['investor-text']}>
              <span className={styles['investor-name']}>Y-COMBINATOR</span>
              <br />
              <span className={styles['stage-info-2']}>SEED STAGE</span>
            </div>
          </div>
          <div className={styles['investor-layout']}>
            <img src={YCLogo} alt='' className={styles['investor-logo']} />
            <div className={styles['investor-text']}>
              <span className={styles['investor-name']}>Y-COMBINATOR</span>
              <br />
              <span className={styles['stage-info-2']}>SEED STAGE</span>
            </div>
          </div>
          <div className={styles['investor-layout']}>
            <img src={YCLogo} alt='' className={styles['investor-logo']} />
            <div className={styles['investor-text']}>
              <span className={styles['investor-name']}>Y-COMBINATOR</span>
              <br />
              <span className={styles['stage-info-2']}>SEED STAGE</span>
              <span className={styles['stage-info-2']}>$ 60M</span>
            </div>
          </div>

        </div>
      </div>

    </section>
  )
}