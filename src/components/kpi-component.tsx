import styles from '../styles/kpi-block.module.less'

type TKPIBlock = {
    width: string
    height: string
    children: React.ReactNode
    extraClass?: string
    style?: React.CSSProperties
}

type TKPIText = {
    fontSize: string
    fontColor: string
    children: React.ReactNode
    extraClass?: string
    style?: React.CSSProperties
}

export function KPIBlock({ width, height, children, extraClass, style }: TKPIBlock) {
  return (
    <div className={`${styles['kpi-block']} ${extraClass}`} style={{ width, height, ...style }} >
      {children}   
    </div>
  )
} 

export function KPIText({ children, fontSize, fontColor, extraClass, style }: TKPIText) {
  return (
    <span className={`${styles['kpi-text']}  ${extraClass}`} style={{ fontSize, color: fontColor, ...style }} >{children}</span>
  )
}