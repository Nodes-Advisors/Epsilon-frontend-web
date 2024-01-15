import styles from '../styles/components.module.less'


export default function Switch({width, height, style, option, setOption}: {width: string, height: string, style?: React.CSSProperties, option: boolean, setOption: React.Dispatch<React.SetStateAction<boolean>>}) {
    
  const switchButtonStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: `calc(${height} / 2)`,
    ...style,
  } as React.CSSProperties
  
  const switchButtonAfterStyle: React.CSSProperties = {
    width:height,
    height,
    borderRadius: `calc(${height} / 2)`,
    ...style,
    '--width': width,
    '--height': height,
  } as React.CSSProperties
  
  return (
    <div 
      onClick={() => setOption(!option)}
      className={styles[!option ? 'switch-button' : 'switch-button-active']} 
      style={switchButtonStyle}
    >
      <div 
        className={`${styles['switch-button-after']} ${option ? styles['move-right'] : styles['move-left']}`} 
        style={switchButtonAfterStyle}
      />
    </div>
  )
}