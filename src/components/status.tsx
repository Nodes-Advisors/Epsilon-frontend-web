export default function FundStatus({color}: {color: string}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.3rem', height: '1.3rem', backgroundColor: color, border: 'white 2px solid', borderRadius: '50%', bottom: '-0.25rem', position: 'absolute', right: '-0.25rem' }}>
      {
        // ['#009900', '#ffa500', '#990000']
        color === '#009900' &&
            <div>
              <div style={{ width: '3px', height: '2px', background: '#fff', transform: 'rotate(45deg)', transformOrigin: '-1px 1px' }}></div>
              <div style={{ width: '7px', height: '2px', background: '#fff', transform: 'rotate(-45deg)', transformOrigin: '2px 0.5px' }}></div>
            </div>

                                
      }
      {
        color === '#ffa500' &&
            <div>
              <div style={{ width: '4px', height: '2px', background: '#fff', transform: 'rotate(90deg)', transformOrigin: '2.25px 0.125px' }}></div>
              <div style={{ width: '5px', height: '2px', background: '#fff', transform: 'rotate(60deg)', transformOrigin: '2px 1.5px' }}></div>
            </div>
      }
    </div>
  )
}