
type TDividerProps = {
    color: string;
    height: string;
    width: string;
    style?: React.CSSProperties;
}

export default function Divider({color, height, width, style}: TDividerProps) {
  return (
    <div style={{ background: color, height, width, ...style }}>
    </div>
  )
}