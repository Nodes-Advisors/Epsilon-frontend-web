import { FunctionComponent, SVGProps } from 'react'
import styles from '../styles/home.module.less'
import { useNavigate } from 'react-router-dom'


type INavWidgetProps = {
    Svg: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string | undefined; }>;
    to: string;
    width: string;
    height: string;
    text: string;
    src?: string | undefined;
}

export default function NavWidget({Svg, width, height, to, text, src=undefined}: INavWidgetProps) {
  const navigate = useNavigate()

  return (
    <div className={styles['nav-widget-item']}>
      {
        src 
          ? 
          <img src={src} alt='nav-widget-img' onClick={() => navigate(to)} className={styles['nav-widget-img']} style={{ width, height }} /> 
          : 
          <Svg onClick={() => navigate(to)} className={styles['nav-widget-img']} style={{ width, height }} />
      }
      
      <a href={to} className={styles['nav-widget-text']}>{text}</a>
    </div>
  )
}