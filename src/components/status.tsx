export default function FundStatus({colorList}: {colorList: string[]}) {
  // console.log(colorList)
  const generateGradient = (colorList) => {
    // console.log(colorList)
    const sliceSize = 1 / colorList.length
    let gradient = ''
    colorList.forEach((color, index) => {
      const start = sliceSize * index
      const end = start + sliceSize
      gradient += `, ${color} ${start}turn, ${color} ${end}turn`
    })
    // console.log(colorList)
    // console.log(`conic-gradient(${gradient.slice(2)})`)
    return `conic-gradient(${gradient.slice(2)})`
  }
  
  return (
    
    colorList.length === 0 
      ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.3rem', height: '1.3rem', backgroundColor: 'grey', border: 'white 2px solid', borderRadius: '50%', bottom: '-0.25rem', position: 'absolute', right: '-0.25rem' }}>
        </div>
      ) 
      : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.3rem', height: '1.3rem', background: generateGradient(colorList), border: 'white 2px solid', borderRadius: '50%', bottom: '-0.25rem', position: 'absolute', right: '-0.25rem' }}>
        </div>
      )
    
  )
}