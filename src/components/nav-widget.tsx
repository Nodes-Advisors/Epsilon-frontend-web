import { FunctionComponent, SVGProps } from 'react'
import styles from '../styles/home.module.less'
import { useNavigate } from 'react-router-dom'


type INavWidgetProps = {
    Svg: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string | undefined; }>;
    to: string;
    width: string;
    height: string;
    text: string;
}

export default function NavWidget({Svg, width, height, to, text}: INavWidgetProps) {
  const navigate = useNavigate()

  return (
    <div className={styles['nav-widget-item']}>
      <Svg onClick={() => navigate(`/profile`)} className={styles['nav-widget-img']} style={{ width, height }} />
      <a href='/profile' className={styles['nav-widget-text']}>{text}</a>
    </div>
  )
}