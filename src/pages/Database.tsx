import axios from 'axios'
import { MouseEvent, useEffect, useRef, useState } from 'react'
export default function Database() {
  const [query, setQuery] = useState<string>('')
  const [data, setData] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [buttonNames, setButtonNames] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({})
  const loader = useRef(null)
  const [filterOptions, setFilterOptions] = useState({})
  const [fields, setFields] = useState<string[]>([])
  // const [isFilterActive, setIsFilterActive] = useState(false)

  // const [filters, setFilters] = useState({})
  
  useEffect(() => {
    if (query === '') return
    const fetchFields = async (query) => {
      const res = await axios.get(`http://localhost:5001/getFields/${query}`, {
      })
      setFields(res.data)
      // console.log(res.data)
      const newFilterOptions = {}
      // console.log(res.data)
      for (const field of res.data) {
        const res2 = await axios.get(`http://localhost:5001/getUniqueValues/${query}/${field}`)
        // console.log(res2.data)
        newFilterOptions[field] = res2.data
      }

      setFilterOptions(newFilterOptions)
    }

    fetchFields(query)
   
  }, [query])

  useEffect(() => {
    if (query === '') return
    const fetchData = async (query, page) => {
      const res = await axios.get(`http://localhost:5001/getCollections/${query}`, {
        params: {
          page: page,
          pageSize: 500,
          filters: JSON.stringify(filters),
        },
      })
      setData(prevData => [...prevData, ...res.data])
    }
    console.log(page)
    fetchData(query, page)
  }, [query, page, filters])

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0,
    }

    const observer = new IntersectionObserver(handleObserver, options)
    if (loader.current) {
      observer.observe(loader.current)
    }

  }, [])

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    })
    setData([])
    setPage(1)
  }

  const handleFilterSubmit = (event) => {
    event.preventDefault()
    // setIsFilterActive(true)
    // setData([])
    // setPage(1)
  }

  const handleObserver = (entities) => {
    const target = entities[0]
    if (target.isIntersecting) {   
      setPage((prev) => prev + 1)
    }
  }

  useEffect(() => {
    const fetchCollections = async() => {
      const res = await axios.get('http://localhost:5001/getCollections', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (res.status === 200) {
        setButtonNames(res.data)
      }
    }
    fetchCollections()
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '3rem' }}>
      <h1>Database</h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '70%' }} onClick={(e: MouseEvent) => { setPage(1); setQuery(e.target.innerText); setData([]) }}>
        {
          buttonNames.map((name, index) => <button key={index} style={{ padding: '1rem', fontSize: '1.5rem', borderRadius: '0.5rem', border: 'none' }}>{name}</button>)
        }
        
      </div>
      <form onSubmit={handleFilterSubmit}>
        {
          fields.length > 0 && fields.map((key, index) => (
            <div key={index}>
              <label>{key}</label>
              <select
                name={key}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {
                  filterOptions[key] && filterOptions[key].map((option, i) => (
                    <option key={i} value={option}>{option}</option>
                  ))
                }
              </select>
            </div>
          ))
        }
        <button type="submit">Apply filters</button>
      </form>
      <button onClick={() => {
        setFilters({})
        // setIsFilterActive(false)
      }
      }>Clear filter</button>
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
      <div className="loading" ref={loader}>
        <h2>Load More</h2>
      </div>
    </div>
  )
}