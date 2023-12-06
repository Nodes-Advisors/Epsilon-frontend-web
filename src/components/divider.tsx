
type TDividerProps = {
    color: string;
    height: string;
    width: string;
}

export default function Divider({color, height, width}: TDividerProps) {
  return (
    <div style={{ background: color, height, width }}>
    </div>
  )
}