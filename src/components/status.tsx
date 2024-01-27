export default function FundStatus({color}: {color: string}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', backgroundColor: color, border: 'white 2px solid', borderRadius: '50%', bottom: '-0.25rem', position: 'absolute', right: '-0.25rem' }}>
      {
        // ['#009900', '#ffa500', '#990000']
        color === '#009900' &&
            <div>
              <div style={{ width: '5px', height: '2px', background: '#fff', transform: 'rotate(45deg)', transformOrigin: '-1px 2.5px' }}></div>
              <div style={{ width: '10px', height: '2px', background: '#fff', transform: 'rotate(-45deg)', transformOrigin: '5px -1.5px' }}></div>
            </div>

                                
      }
      {
        color === '#ffa500' &&
            <div>
              <div style={{ width: '5px', height: '2px', background: '#fff', transform: 'rotate(90deg)', transformOrigin: '3.5px 0px' }}></div>
              <div style={{ width: '7px', height: '2px', background: '#fff', transform: 'rotate(60deg)', transformOrigin: '2.75px 2px' }}></div>
            </div>
      }
    </div>
  )
}