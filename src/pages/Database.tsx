import axios from 'axios'
import { MouseEvent, useEffect, useState } from 'react'
export default function Database() {
  const [query, setQuery] = useState<string>('')
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    if (query === '') return
    const fetchData = async (query) => {
      const res = await axios.get(`http://localhost:5001/${query}`)
      setData(res.data)
    }
    fetchData(query)
  }, [query])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '3rem' }}>
      <h1>Database</h1>
      <div style={{ display: 'flex', gap: '1rem' }} onClick={(e: MouseEvent) => setQuery(e.target.innerText)}>
        <button>Employees</button>
        <button>FundCard</button>
        <button>InboundEmails</button>
        <button>KPIsINFO</button>
        <button>OutboundEmails</button>
      </div>
      <table style={{ gap: '1rem' }}>
        <thead>
          <tr>
            {
              (() => {
                const allKeys = new Set()
                data.forEach(item => {
                  Object.keys(item).forEach(key => allKeys.add(key))
                })
                return Array.from(allKeys).map((key, index) => <th key={index} style={{padding: '0 10px', maxWidth: '200px', wordWrap: 'break-word'}}>{key}</th>)
              })()
            }
          </tr>
        </thead>
        <tbody>
          {
            data.map((item: object, index: number) => (
              <tr key={index}>
                {Object.values(item).map((value, i) => <td key={i} style={{padding: '0 10px', maxWidth: '200px', wordWrap: 'break-word'}}>{value === false ? 'False' : value}</td>)}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}